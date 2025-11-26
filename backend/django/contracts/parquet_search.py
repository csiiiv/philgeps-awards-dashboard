"""
Parquet-based search service for searching ALL contracts without importing to database
"""

import os
import pandas as pd
import glob
from typing import List, Dict, Any, Optional
from datetime import datetime, date
import duckdb

class ParquetSearchService:
    # Singleton DuckDB connection for reuse across requests
    _connection = None
    _connection_lock = None
    
    def __init__(self):
        # Read PARQUET_DIR from environment variable, fallback to project root path
        parquet_dir_env = os.environ.get('PARQUET_DIR')
        if parquet_dir_env and os.path.exists(parquet_dir_env):
            self.data_dir = parquet_dir_env
        else:
            # Get the project root directory (four levels up from this file)
            # File is at: backend/django/contracts/parquet_search.py
            # Need to go up 4 levels to reach project root
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            self.data_dir = os.path.join(project_root, 'data', 'parquet')
        self.parquet_files = self._get_parquet_files()
    
    @classmethod
    def get_connection(cls):
        """Get or create a persistent DuckDB connection with performance optimizations"""
        if cls._connection is None:
            cls._connection = duckdb.connect()
            # Enable parallel execution with 4 threads
            cls._connection.execute("SET threads TO 4")
            # Enable object cache for parquet metadata caching
            cls._connection.execute("SET enable_object_cache TO true")
            # Set memory limit (adjust based on available memory)
            cls._connection.execute("SET memory_limit = '4GB'")
        return cls._connection
        
    def _get_parquet_files(self, include_flood_control: bool = False) -> List[str]:
        """Get parquet files with optimization for analytics"""
        # Use all_time file for complete data (5M contracts)
        all_time_file = os.path.join(self.data_dir, 'facts_awards_all_time.parquet')
        
        if os.path.exists(all_time_file):
            # Use all_time file for complete dataset
            files = [all_time_file]
        else:
            # Fallback to original logic
            pattern = os.path.join(self.data_dir, 'facts_awards_*.parquet')
            files = glob.glob(pattern)
            
            # Include all facts files, prioritizing all_time file
            year_files = []
            all_time_file = None
            
            for file_path in files:
                filename = os.path.basename(file_path)
                if 'all_time' in filename:
                    all_time_file = file_path
                elif 'optimized' in filename or 'super' in filename:
                    # Skip optimized files in fallback mode
                    continue
                else:
                    try:
                        year_str = filename.split('_')[-1].split('.')[0]
                        int(year_str)  # This will raise ValueError if not a number
                        year_files.append(file_path)
                    except (ValueError, IndexError):
                        # Skip files that don't have a year in the name
                        continue
            
            # Sort by year
            year_files.sort(key=lambda x: int(os.path.basename(x).split('_')[-1].split('.')[0]))
            
            # Add all_time file at the beginning
            if all_time_file:
                year_files.insert(0, all_time_file)
            
            files = year_files
        
        # Add flood control file if requested
        if include_flood_control:
            flood_control_file = os.path.join(self.data_dir, 'facts_awards_flood_control.parquet')
            if os.path.exists(flood_control_file):
                files.append(flood_control_file)
            
        return files
    
    def search_contracts(self, 
                        keywords: str = "",
                        contractor: str = "",
                        area: str = "",
                        organization: str = "",
                        business_category: str = "",
                        year_start: Optional[int] = None,
                        year_end: Optional[int] = None,
                        start_date: Optional[str] = None,
                        end_date: Optional[str] = None,
                        page: int = 1,
                        page_size: int = 20,
                        sort_by: str = "award_date",
                        sort_direction: str = "desc",
                        include_flood_control: bool = False) -> Dict[str, Any]:
        """
        Search contracts across ALL parquet files
        """
        
        # Build SQL query for DuckDB
        query_parts = []
        where_conditions = []
        
        # Keywords search using pre-computed search_text column
        if keywords:
            keywords_clean = keywords.strip()
            if keywords_clean:
                where_conditions.append(f"LOWER(search_text) LIKE LOWER('%{keywords_clean}%')")
        
        # Filter conditions
        if contractor and contractor != "All Contractors":
            where_conditions.append(f"LOWER(awardee_name) LIKE LOWER('%{contractor}%')")
        
        if area and area != "All Areas":
            where_conditions.append(f"LOWER(area_of_delivery) LIKE LOWER('%{area}%')")
            
        if organization and organization != "All Organizations":
            where_conditions.append(f"LOWER(organization_name) LIKE LOWER('%{organization}%')")
            
        if business_category and business_category != "All Business Categories":
            where_conditions.append(f"LOWER(business_category) LIKE LOWER('%{business_category}%')")
        
        # Year range filter
        if year_start:
            where_conditions.append(f"date_part('year', award_date::DATE) >= {year_start}")
        if year_end:
            where_conditions.append(f"date_part('year', award_date::DATE) <= {year_end}")
        
        # Custom date range filter
        if start_date:
            where_conditions.append(f"award_date >= '{start_date}'")
        if end_date:
            where_conditions.append(f"award_date <= '{end_date}'")
        
        # Build the main query
        select_fields = """
            contract_number as reference_id,
            contract_number as contract_no,
            award_title,
            notice_title,
            award_date,
            awardee_name,
            area_of_delivery,
            organization_name,
            business_category,
            contract_amount,
            contract_amount as award_amount,
            'active' as award_status,
            '2023-01-01' as created_at,
            1 as id
        """
        
        # Create UNION query across all parquet files
        union_queries = []
        parquet_files = self._get_parquet_files(include_flood_control)
        for file_path in parquet_files:
            filename = os.path.basename(file_path)
            if 'all_time' in filename:
                # Include all_time file directly
                file_query = f"SELECT {select_fields} FROM read_parquet('{file_path}')"
                union_queries.append(file_query)
            elif 'flood_control' in filename:
                # Include flood control file directly
                file_query = f"SELECT {select_fields} FROM read_parquet('{file_path}')"
                union_queries.append(file_query)
            else:
                try:
                    # Check if this is an optimized file (no year parsing needed)
                    if 'optimized' in filename or 'super' in filename:
                        file_query = f"SELECT {select_fields} FROM read_parquet('{file_path}')"
                        union_queries.append(file_query)
                    else:
                        # Extract year from filename safely
                        year_str = filename.split('_')[-1].split('.')[0]
                        file_year = int(year_str)
                        
                        # Skip files outside year range if specified
                        if year_start and file_year < year_start:
                            continue
                        if year_end and file_year > year_end:
                            continue
                        
                        file_query = f"SELECT {select_fields} FROM read_parquet('{file_path}')"
                        union_queries.append(file_query)
                except (ValueError, IndexError) as e:
                    print(f"Skipping file {file_path} due to parsing error: {e}")
                    continue
        
        if not union_queries:
            return {
                'success': True,
                'data': [],
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_count': 0,
                    'total_pages': 0
                }
            }
        
        # Combine all queries
        base_query = " UNION ALL ".join(union_queries)
        
        # Add WHERE conditions
        if where_conditions:
            # Map parquet column names to SELECT field names for WHERE clause
            mapped_conditions = []
            for condition in where_conditions:
                # Replace parquet column names with SELECT field names
                mapped_condition = condition
                # organization_name is already correct since it's aliased in SELECT
                mapped_conditions.append(mapped_condition)
            where_clause = " AND ".join(mapped_conditions)
            base_query = f"SELECT * FROM ({base_query}) WHERE {where_clause}"
        else:
            base_query = f"SELECT * FROM ({base_query})"
        
        # Use CTE to avoid scanning base query twice (once for count, once for data)
        sort_direction_sql = "DESC" if sort_direction.lower() == "desc" else "ASC"
        
        # Determine sort field and type
        sort_is_numeric = sort_by in ['contract_value', 'total_contract_amount', 'award_amount', 'contract_amount']
        if sort_by == 'contract_value':
            sort_field = 'contract_amount'
        else:
            sort_field = sort_by
        
        offset = (page - 1) * page_size
        
        # Build optimized query with CTE to scan base data only once
        if sort_is_numeric:
            final_query = f"""
            WITH base_data AS ({base_query}),
            total_count AS (SELECT COUNT(*) as total FROM base_data)
            SELECT b.*, t.total 
            FROM base_data b
            CROSS JOIN total_count t
            ORDER BY CAST(b.{sort_field} AS DOUBLE) {sort_direction_sql}
            LIMIT {page_size} OFFSET {offset}
            """
        else:
            final_query = f"""
            WITH base_data AS ({base_query}),
            total_count AS (SELECT COUNT(*) as total FROM base_data)
            SELECT b.*, t.total 
            FROM base_data b
            CROSS JOIN total_count t
            ORDER BY b.{sort_field} {sort_direction_sql}
            LIMIT {page_size} OFFSET {offset}
            """
        
        try:
            # Execute queries using DuckDB with reusable connection
            conn = self.get_connection()
            
            # Execute single query that returns both data and count
            results = conn.execute(final_query).fetchall()
            columns = [desc[0] for desc in conn.description]
            
            # Extract total count from first row
            total_count = results[0][-1] if results else 0
            
            # Convert to list of dictionaries
            contracts = []
            for row in results:
                # Build dict excluding the 'total' column (last column)
                contract_dict = dict(zip(columns[:-1], row[:-1]))
                # Convert dates to strings for JSON serialization
                if contract_dict.get('award_date'):
                    if hasattr(contract_dict['award_date'], 'date'):
                        contract_dict['award_date'] = contract_dict['award_date'].date().isoformat()
                    else:
                        contract_dict['award_date'] = str(contract_dict['award_date'])
                contracts.append(contract_dict)
            
            # Don't close connection - keep it alive for reuse
            
            total_pages = (total_count + page_size - 1) // page_size
            
            return {
                'success': True,
                'data': contracts,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_count': total_count,
                    'total_pages': total_pages
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'data': [],
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_count': 0,
                    'total_pages': 0
                }
            }
    
    def get_filter_options(self) -> Dict[str, List[str]]:
        """Get filter options from parquet files including flood control data"""
        try:
            conn = self.get_connection()
            
            # Get unique values for each filter
            queries = {
                'contractors': "SELECT DISTINCT awardee_name as contractor_name FROM ({}) WHERE awardee_name IS NOT NULL ORDER BY awardee_name",
                'areas': "SELECT DISTINCT area_of_delivery FROM ({}) WHERE area_of_delivery IS NOT NULL ORDER BY area_of_delivery",
                'organizations': "SELECT DISTINCT organization_name FROM ({}) WHERE organization_name IS NOT NULL ORDER BY organization_name",
                'business_categories': "SELECT DISTINCT business_category FROM ({}) WHERE business_category IS NOT NULL ORDER BY business_category"
            }
            
            # Get parquet files including flood control data
            parquet_files = self._get_parquet_files(include_flood_control=True)
            
            # Build union query for all parquet files
            # All files now have the same column structure after rebuilding flood control
            union_queries = []
            for file_path in parquet_files:
                filename = os.path.basename(file_path)
                # All files now have the same column structure, so we can use SELECT * for all
                union_queries.append(f"SELECT * FROM read_parquet('{file_path}')")
            
            if not union_queries:
                return {
                    'contractors': [],
                    'areas': [],
                    'organizations': [],
                    'business_categories': []
                }
            
            base_query = " UNION ALL ".join(union_queries)
            
            filter_options = {}
            for key, query_template in queries.items():
                query = query_template.format(base_query)
                result = conn.execute(query).fetchall()
                filter_options[key] = [row[0] for row in result if row[0]]

            # years list
            years_query = f"SELECT DISTINCT CAST(date_part('year', award_date::DATE) AS INT) as y FROM ({base_query}) WHERE award_date IS NOT NULL ORDER BY 1"
            years_rows = conn.execute(years_query).fetchall()
            filter_options['years'] = [row[0] for row in years_rows if row[0] is not None]
            
            # Don't close connection - keep it alive for reuse
            return filter_options
            
        except Exception as e:
            print(f"Error getting filter options: {e}")
            return {
                'contractors': [],
                'areas': [],
                'organizations': [],
                'business_categories': []
            }
    
    def _escape_sql_like(self, value: str) -> str:
        """Escape special characters for SQL LIKE queries"""
        if not value:
            return ""
        # Escape single quotes by doubling them
        escaped = value.replace("'", "''")
        # Escape backslashes
        escaped = escaped.replace("\\", "\\\\")
        return escaped

    def _parse_and_keywords(self, keyword_string: str) -> List[str]:
        """Parse a keyword string to extract individual keywords for AND logic.
        
        Supports formats like:
        - "keyword1 && keyword2" -> ["keyword1", "keyword2"]
        - "keyword1" -> ["keyword1"]
        - "keyword1 && keyword2 && keyword3" -> ["keyword1", "keyword2", "keyword3"]
        """
        if not keyword_string or not keyword_string.strip():
            return []
        
        # Split by && and clean up whitespace
        keywords = [kw.strip() for kw in keyword_string.split('&&') if kw.strip()]
        return keywords

    def search_contracts_with_chips_streaming(self,
                                              contractors: List[str] = [],
                                              areas: List[str] = [],
                                              organizations: List[str] = [],
                                              business_categories: List[str] = [],
                                              keywords: List[str] = [],
                                              time_ranges: List[Dict] = [],
                                              include_flood_control: bool = False,
                                              value_range: Optional[Dict] = None):
        """
        Stream contracts with chip-based filters for CSV export.
        Returns a DuckDB result relation for efficient streaming (no pagination, no sorting).
        """
        # Build WHERE conditions using same logic as search_contracts_with_chips
        where_conditions = self._build_chip_where_conditions(
            contractors, areas, organizations, business_categories,
            keywords, time_ranges, value_range
        )
        
        # Build base query
        select_fields = """
            contract_number as reference_id,
            contract_number as contract_no,
            award_title,
            notice_title,
            awardee_name,
            organization_name,
            area_of_delivery,
            business_category,
            contract_amount,
            award_date,
            'active' as award_status
        """
        
        parquet_files = self._get_parquet_files(include_flood_control)
        union_queries = []
        for file_path in parquet_files:
            file_query = f"SELECT {select_fields} FROM read_parquet('{file_path}')"
            union_queries.append(file_query)
        
        if not union_queries:
            return None
        
        if where_conditions:
            where_clause = " AND ".join(where_conditions)
            union_queries_with_where = [f"{q} WHERE {where_clause}" for q in union_queries]
            base_query = " UNION ALL ".join(union_queries_with_where)
        else:
            base_query = " UNION ALL ".join(union_queries)
        
        # NO ORDER BY for exports - sorting is expensive and unnecessary
        # Users can sort in Excel/Sheets if needed
        streaming_query = f"SELECT * FROM ({base_query})"
        
        conn = self.get_connection()
        return conn.execute(streaming_query)
    
    def _build_chip_where_conditions(self,
                                    contractors: List[str] = [],
                                    areas: List[str] = [],
                                    organizations: List[str] = [],
                                    business_categories: List[str] = [],
                                    keywords: List[str] = [],
                                    time_ranges: List[Dict] = [],
                                    value_range: Optional[Dict] = None) -> List[str]:
        """Build WHERE conditions for chip-based filtering (extracted for reuse)"""
        import logging
        logger = logging.getLogger(__name__)
        
        where_conditions = []
        
        # Log input filters for debugging
        logger.info(f"Building WHERE conditions with filters: contractors={contractors}, areas={areas}, organizations={organizations}, keywords={keywords}")
        
        # Apply filters in order of selectivity (most selective first)
        # 1. Business category first (most selective, smallest result set)
        if business_categories:
            category_conditions = []
            for category in business_categories:
                if category.strip():
                    and_keywords = self._parse_and_keywords(category.strip())
                    if and_keywords:
                        category_and_conditions = []
                        for keyword in and_keywords:
                            escaped_keyword = self._escape_sql_like(keyword)
                            category_and_conditions.append(f"LOWER(business_category) LIKE LOWER('%{escaped_keyword}%')")
                        category_conditions.append(f"({' AND '.join(category_and_conditions)})")
            if category_conditions:
                where_conditions.append(f"({' OR '.join(category_conditions)})")
        
        # 2. Contractor filter (usually selective)
        if contractors:
            contractor_conditions = []
            for contractor in contractors:
                if contractor.strip():
                    and_keywords = self._parse_and_keywords(contractor.strip())
                    if and_keywords:
                        contractor_and_conditions = []
                        for keyword in and_keywords:
                            escaped_keyword = self._escape_sql_like(keyword)
                            contractor_and_conditions.append(f"LOWER(awardee_name) LIKE LOWER('%{escaped_keyword}%')")
                        contractor_conditions.append(f"({' AND '.join(contractor_and_conditions)})")
            if contractor_conditions:
                where_conditions.append(f"({' OR '.join(contractor_conditions)})")
        
        # 3. Organization filter
        if organizations:
            org_conditions = []
            for org in organizations:
                if org.strip():
                    and_keywords = self._parse_and_keywords(org.strip())
                    if and_keywords:
                        org_and_conditions = []
                        for keyword in and_keywords:
                            escaped_keyword = self._escape_sql_like(keyword)
                            # Add NULL safety - organization_name can be NULL or empty
                            org_and_conditions.append(f"(organization_name IS NOT NULL AND LOWER(organization_name) LIKE LOWER('%{escaped_keyword}%'))")
                        org_conditions.append(f"({' AND '.join(org_and_conditions)})")
            if org_conditions:
                where_conditions.append(f"({' OR '.join(org_conditions)})")
        
        # 4. Area filter
        if areas:
            area_conditions = []
            for area in areas:
                if area.strip():
                    and_keywords = self._parse_and_keywords(area.strip())
                    if and_keywords:
                        area_and_conditions = []
                        for keyword in and_keywords:
                            escaped_keyword = self._escape_sql_like(keyword)
                            # Add NULL safety - area_of_delivery can be NULL or empty
                            area_and_conditions.append(f"(area_of_delivery IS NOT NULL AND LOWER(area_of_delivery) LIKE LOWER('%{escaped_keyword}%'))")
                        area_conditions.append(f"({' AND '.join(area_and_conditions)})")
            if area_conditions:
                where_conditions.append(f"({' OR '.join(area_conditions)})")
        
        # 5. Keywords search LAST (most expensive, applied to already-filtered rows)
        if keywords:
            keyword_conditions = []
            for keyword in keywords:
                if keyword.strip():
                    and_keywords = self._parse_and_keywords(keyword.strip())
                    if and_keywords:
                        keyword_and_conditions = []
                        for and_keyword in and_keywords:
                            escaped_keyword = self._escape_sql_like(and_keyword)
                            # Simple LIKE is actually faster than regexp for short patterns in DuckDB
                            keyword_and_conditions.append(f"LOWER(search_text) LIKE LOWER('%{escaped_keyword}%')")
                        keyword_conditions.append(f"({' AND '.join(keyword_and_conditions)})")
            if keyword_conditions:
                where_conditions.append(f"({' OR '.join(keyword_conditions)})")
        
        # Time range filter
        if time_ranges:
            time_conditions = []
            for time_range in time_ranges:
                if time_range.get('type') == 'yearly' and time_range.get('year'):
                    try:
                        year = int(time_range['year'])
                        time_conditions.append(f"date_part('year', award_date::DATE) = {year}")
                    except (ValueError, TypeError):
                        continue
                elif time_range.get('type') == 'quarterly' and time_range.get('year') and time_range.get('quarter'):
                    try:
                        quarter = int(time_range['quarter'])
                        year = int(time_range['year'])
                        if quarter == 1:
                            time_conditions.append(f"date_part('year', award_date::DATE) = {year} AND date_part('month', award_date::DATE) BETWEEN 1 AND 3")
                        elif quarter == 2:
                            time_conditions.append(f"date_part('year', award_date::DATE) = {year} AND date_part('month', award_date::DATE) BETWEEN 4 AND 6")
                        elif quarter == 3:
                            time_conditions.append(f"date_part('year', award_date::DATE) = {year} AND date_part('month', award_date::DATE) BETWEEN 7 AND 9")
                        elif quarter == 4:
                            time_conditions.append(f"date_part('year', award_date::DATE) = {year} AND date_part('month', award_date::DATE) BETWEEN 10 AND 12")
                    except (ValueError, TypeError):
                        continue
                elif time_range.get('type') == 'custom' and time_range.get('startDate') and time_range.get('endDate'):
                    start_date = time_range['startDate']
                    end_date = time_range['endDate']
                    
                    if hasattr(start_date, 'strftime'):
                        start_date = start_date.strftime('%Y-%m-%d')
                    if hasattr(end_date, 'strftime'):
                        end_date = end_date.strftime('%Y-%m-%d')
                    
                    if len(start_date) == 10 and len(end_date) == 10:
                        try:
                            from datetime import datetime
                            datetime.strptime(start_date, '%Y-%m-%d')
                            datetime.strptime(end_date, '%Y-%m-%d')
                            time_conditions.append(f"TRY_CAST(award_date AS DATE) >= '{start_date}' AND TRY_CAST(award_date AS DATE) <= '{end_date}'")
                        except ValueError:
                            continue
            
            if time_conditions:
                where_conditions.append(f"({' OR '.join(time_conditions)})")
        
        # Value range filter
        if value_range:
            amount_conditions = []
            min_amount = value_range.get('min')
            max_amount = value_range.get('max')
            
            if min_amount is not None and max_amount is not None:
                amount_conditions.append(f"CAST(contract_amount AS DOUBLE) >= {min_amount} AND CAST(contract_amount AS DOUBLE) <= {max_amount}")
            elif min_amount is not None:
                amount_conditions.append(f"CAST(contract_amount AS DOUBLE) >= {min_amount}")
            elif max_amount is not None:
                amount_conditions.append(f"CAST(contract_amount AS DOUBLE) <= {max_amount}")
            
            if amount_conditions:
                where_conditions.append(f"({' AND '.join(amount_conditions)})")
        
        # Log final WHERE conditions for debugging
        logger.info(f"Final WHERE conditions: {where_conditions}")
        if where_conditions:
            logger.info(f"Combined WHERE clause: {' AND '.join(where_conditions)}")
        
        return where_conditions
    
    def search_contracts_with_chips(self, 
                                   contractors: List[str] = [],
                                   areas: List[str] = [],
                                   organizations: List[str] = [],
                                   business_categories: List[str] = [],
                                   keywords: List[str] = [],
                                   time_ranges: List[Dict] = [],
                                   page: int = 1,
                                   page_size: int = 20,
                                   sort_by: str = "award_date",
                                   sort_direction: str = "desc",
                                   include_flood_control: bool = False,
                                   value_range: Optional[Dict] = None,
                                   include_count: bool = True) -> Dict[str, Any]:
        """
        Search contracts with chip-based filters (OR logic within each type)
        """
        # Reuse extracted WHERE condition builder
        where_conditions = self._build_chip_where_conditions(
            contractors, areas, organizations, business_categories,
            keywords, time_ranges, value_range
        )
        
        # Build the main query
        select_fields = """
            contract_number as reference_id,
            contract_number as contract_no,
            award_title,
            notice_title,
            award_date,
            awardee_name,
            area_of_delivery,
            organization_name,
            business_category,
            contract_amount,
            contract_amount as award_amount,
            'active' as award_status,
            '2023-01-01' as created_at,
            1 as id
        """
        
        # Create UNION query across all parquet files
        union_queries = []
        parquet_files = self._get_parquet_files(include_flood_control)
        for file_path in parquet_files:
            filename = os.path.basename(file_path)
            if 'all_time' in filename:
                # Include all_time file directly
                file_query = f"SELECT {select_fields} FROM read_parquet('{file_path}')"
                union_queries.append(file_query)
            elif 'flood_control' in filename:
                # Include flood control file directly
                file_query = f"SELECT {select_fields} FROM read_parquet('{file_path}')"
                union_queries.append(file_query)
            else:
                try:
                    # Check if this is an optimized file (no year parsing needed)
                    if 'optimized' in filename or 'super' in filename:
                        file_query = f"SELECT {select_fields} FROM read_parquet('{file_path}')"
                        union_queries.append(file_query)
                    else:
                        # Extract year from filename safely
                        year_str = filename.split('_')[-1].split('.')[0]
                        int(year_str)  # Validate it's a number
                        
                        file_query = f"SELECT {select_fields} FROM read_parquet('{file_path}')"
                        union_queries.append(file_query)
                except (ValueError, IndexError) as e:
                    print(f"Skipping file {file_path} due to parsing error: {e}")
                    continue
        
        if not union_queries:
            return {
                'success': True,
                'data': [],
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_count': 0,
                    'total_pages': 0
                }
            }
        
        # Apply WHERE conditions to each individual query
        if where_conditions:
            where_clause = " AND ".join(where_conditions)
            # Apply WHERE clause to each individual query
            union_queries_with_where = []
            for query in union_queries:
                union_queries_with_where.append(f"{query} WHERE {where_clause}")
            base_query = " UNION ALL ".join(union_queries_with_where)
        else:
            base_query = " UNION ALL ".join(union_queries)
        
        # Use CTE to avoid scanning base query twice (once for count, once for data)
        sort_direction_sql = "DESC" if sort_direction.lower() == "desc" else "ASC"
        
        # Determine sort field and type
        sort_is_numeric = sort_by in ['contract_value', 'total_contract_amount', 'award_amount', 'contract_amount']
        if sort_by == 'contract_value':
            sort_field = 'contract_amount'
        else:
            sort_field = sort_by
        
        offset = (page - 1) * page_size
        
        # Build optimized query with CTE to scan base data only once
        if include_count:
            # When count is needed, use CTE to calculate count and fetch data in single execution
            if sort_is_numeric:
                final_query = f"""
                WITH base_data AS ({base_query}),
                total_count AS (SELECT COUNT(*) as total FROM base_data)
                SELECT b.*, t.total 
                FROM base_data b
                CROSS JOIN total_count t
                ORDER BY CAST(b.{sort_field} AS DOUBLE) {sort_direction_sql}
                LIMIT {page_size} OFFSET {offset}
                """
            else:
                final_query = f"""
                WITH base_data AS ({base_query}),
                total_count AS (SELECT COUNT(*) as total FROM base_data)
                SELECT b.*, t.total 
                FROM base_data b
                CROSS JOIN total_count t
                ORDER BY b.{sort_field} {sort_direction_sql}
                LIMIT {page_size} OFFSET {offset}
                """
        else:
            # When count not needed, skip CTE overhead
            if sort_is_numeric:
                final_query = f"SELECT * FROM ({base_query}) ORDER BY CAST({sort_field} AS DOUBLE) {sort_direction_sql} LIMIT {page_size} OFFSET {offset}"
            else:
                final_query = f"SELECT * FROM ({base_query}) ORDER BY {sort_field} {sort_direction_sql} LIMIT {page_size} OFFSET {offset}"

        try:
            # Use reusable connection for better performance
            conn = self.get_connection()

            # Execute single query that returns both data and count
            results = conn.execute(final_query).fetchall()
            columns = [desc[0] for desc in conn.description]
            
            # Extract total count from first row if include_count is True
            total_count = 0
            if include_count and results:
                # Total is in the last column when using CTE
                total_count = results[0][-1]

            contracts = []
            for row in results:
                # Build dict excluding the 'total' column if present
                if include_count:
                    # Exclude last column (total) from contract data
                    contract_dict = dict(zip(columns[:-1], row[:-1]))
                else:
                    contract_dict = dict(zip(columns, row))
                    
                # Convert dates to strings for JSON serialization
                if contract_dict.get('award_date'):
                    if hasattr(contract_dict['award_date'], 'date'):
                        contract_dict['award_date'] = contract_dict['award_date'].date().isoformat()
                    else:
                        contract_dict['award_date'] = str(contract_dict['award_date'])
                contracts.append(contract_dict)

            # Don't close connection - keep it alive for reuse

            total_pages = (total_count + page_size - 1) // page_size if include_count and total_count else 0

            return {
                'success': True,
                'data': contracts,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_count': total_count,
                    'total_pages': total_pages
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'data': [],
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_count': 0,
                    'total_pages': 0
                }
            }

    def chip_aggregates(self,
                        contractors: List[str] = [],
                        areas: List[str] = [],
                        organizations: List[str] = [],
                        business_categories: List[str] = [],
                        keywords: List[str] = [],
                        time_ranges: List[Dict] = [],
                        topN: int = 20,
                        include_flood_control: bool = False,
                        value_range: Optional[Dict] = None) -> Dict[str, Any]:
        """Return grouped aggregates based on the same chip filters for charts."""
        # Reuse the filtering logic above to construct filtered UNION query without ORDER/LIMIT
        where_conditions = []

        # Keywords - Using optimized search with CONTAINS function for maximum performance (OR logic between keyword groups, AND logic within each keyword group)
        if keywords:
            keyword_conditions = []
            for keyword in keywords:
                if keyword.strip():
                    # Parse AND keywords within the keyword string
                    and_keywords = self._parse_and_keywords(keyword.strip())
                    if and_keywords:
                        # Create AND conditions for all keywords within this keyword group
                        keyword_and_conditions = []
                        for and_keyword in and_keywords:
                            escaped_keyword = self._escape_sql_like(and_keyword)
                            # Use CONTAINS function for better performance when available
                            # Fallback to LIKE for compatibility
                            try:
                                keyword_and_conditions.append(f"CONTAINS(LOWER(search_text), LOWER('{escaped_keyword}'))")
                            except:
                                keyword_and_conditions.append(f"LOWER(search_text) LIKE LOWER('%{escaped_keyword}%')")
                        keyword_conditions.append(f"({' AND '.join(keyword_and_conditions)})")
            if keyword_conditions:
                where_conditions.append(f"({' OR '.join(keyword_conditions)})")

        def _or_block(values: List[str], column: str) -> Optional[str]:
            items = []
            for v in values or []:
                if v and v.strip():
                    # Support AND keywords within a single chip value (e.g., "public works && dist")
                    and_keywords = self._parse_and_keywords(v.strip())
                    if and_keywords:
                        and_parts = []
                        for kw in and_keywords:
                            and_parts.append(f"LOWER({column}) LIKE LOWER('%{self._escape_sql_like(kw)}%')")
                        items.append(f"({' AND '.join(and_parts)})")
            return f"({' OR '.join(items)})" if items else None

        for block in [
            _or_block(contractors, 'awardee_name'),
            _or_block(areas, 'area_of_delivery'),
            _or_block(organizations, 'organization_name'),
            _or_block(business_categories, 'business_category')
        ]:
            if block:
                where_conditions.append(block)

        # Time ranges
        if time_ranges:
            time_conditions = []
            for time_range in time_ranges:
                if time_range.get('type') == 'yearly' and time_range.get('year'):
                    try:
                        year = int(time_range['year'])
                        time_conditions.append(f"date_part('year', TRY_CAST(award_date AS DATE)) = {year}")
                    except (ValueError, TypeError):
                        continue
                elif time_range.get('type') == 'quarterly' and time_range.get('year') and time_range.get('quarter'):
                    try:
                        quarter = int(time_range['quarter'])
                        year = int(time_range['year'])
                        if quarter == 1:
                            time_conditions.append(f"date_part('year', TRY_CAST(award_date AS DATE)) = {year} AND date_part('month', TRY_CAST(award_date AS DATE)) BETWEEN 1 AND 3")
                        elif quarter == 2:
                            time_conditions.append(f"date_part('year', TRY_CAST(award_date AS DATE)) = {year} AND date_part('month', TRY_CAST(award_date AS DATE)) BETWEEN 4 AND 6")
                        elif quarter == 3:
                            time_conditions.append(f"date_part('year', TRY_CAST(award_date AS DATE)) = {year} AND date_part('month', TRY_CAST(award_date AS DATE)) BETWEEN 7 AND 9")
                        elif quarter == 4:
                            time_conditions.append(f"date_part('year', TRY_CAST(award_date AS DATE)) = {year} AND date_part('month', TRY_CAST(award_date AS DATE)) BETWEEN 10 AND 12")
                    except (ValueError, TypeError):
                        continue
                elif time_range.get('type') == 'custom' and time_range.get('startDate') and time_range.get('endDate'):
                    start_date = time_range['startDate']
                    end_date = time_range['endDate']
                    
                    # Handle both string and date object inputs
                    if hasattr(start_date, 'strftime'):
                        # It's a date object, convert to string
                        start_date = start_date.strftime('%Y-%m-%d')
                    if hasattr(end_date, 'strftime'):
                        # It's a date object, convert to string
                        end_date = end_date.strftime('%Y-%m-%d')
                    
                    if len(start_date) == 10 and len(end_date) == 10:
                        try:
                            # Validate date format by attempting to parse
                            from datetime import datetime
                            datetime.strptime(start_date, '%Y-%m-%d')
                            datetime.strptime(end_date, '%Y-%m-%d')
                            time_conditions.append(f"TRY_CAST(award_date AS DATE) >= '{start_date}' AND TRY_CAST(award_date AS DATE) <= '{end_date}'")
                        except ValueError:
                            # Skip invalid date formats
                            continue
            if time_conditions:
                where_conditions.append(f"({' OR '.join(time_conditions)})")

        # Contract amount range filtering
        if value_range:
            amount_conditions = []
            min_amount = value_range.get('min')
            max_amount = value_range.get('max')
            
            if min_amount is not None and max_amount is not None:
                # Both min and max specified
                amount_conditions.append(f"CAST(contract_amount AS DOUBLE) >= {min_amount} AND CAST(contract_amount AS DOUBLE) <= {max_amount}")
            elif min_amount is not None:
                # Only min specified
                amount_conditions.append(f"CAST(contract_amount AS DOUBLE) >= {min_amount}")
            elif max_amount is not None:
                # Only max specified
                amount_conditions.append(f"CAST(contract_amount AS DOUBLE) <= {max_amount}")
            
            if amount_conditions:
                where_conditions.append(f"({' AND '.join(amount_conditions)})")

        select_fields = """
            contract_number as reference_id,
            contract_number as contract_no,
            award_title,
            notice_title,
            award_date,
            awardee_name,
            area_of_delivery,
            organization_name,
            business_category,
            contract_amount
        """

        union_queries = []
        parquet_files = self._get_parquet_files(include_flood_control)
        for file_path in parquet_files:
            file_query = f"SELECT {select_fields} FROM read_parquet('{file_path}')"
            if where_conditions:
                # Apply WHERE conditions to each file query using actual column names
                file_where_conditions = []
                for condition in where_conditions:
                    file_where_conditions.append(condition)
                file_query = f"SELECT {select_fields} FROM read_parquet('{file_path}') WHERE {' AND '.join(file_where_conditions)}"
            union_queries.append(file_query)

        base_query = " UNION ALL ".join(union_queries)
        
        # Use CTE to execute base query once and reuse for all aggregates (massive performance improvement)
        cte_query = f"WITH filtered_data AS ({base_query})"

        # Aggregates - now all query from the CTE instead of re-executing base_query
        queries = {
            'summary': f"{cte_query} SELECT COUNT(*) as count, SUM(CAST(contract_amount AS DOUBLE)) as total_value, AVG(CAST(contract_amount AS DOUBLE)) as avg_value FROM filtered_data",
            'by_year': f"{cte_query} SELECT CAST(date_part('year', TRY_CAST(award_date AS DATE)) AS INT) as year, SUM(CAST(contract_amount AS DOUBLE)) as total_value, COUNT(*) as count FROM filtered_data WHERE TRY_CAST(award_date AS DATE) IS NOT NULL GROUP BY 1 ORDER BY 1",
            'by_month': f"{cte_query} SELECT STRFTIME(TRY_CAST(award_date AS DATE), '%Y-%m') as month, SUM(CAST(contract_amount AS DOUBLE)) as total_value, COUNT(*) as count FROM filtered_data WHERE TRY_CAST(award_date AS DATE) IS NOT NULL GROUP BY 1 ORDER BY 1",
            'by_contractor': f"{cte_query} SELECT awardee_name as label, SUM(CAST(contract_amount AS DOUBLE)) as total_value, COUNT(*) as count FROM filtered_data WHERE awardee_name IS NOT NULL GROUP BY 1 ORDER BY total_value DESC LIMIT {topN}",
            'by_organization': f"{cte_query} SELECT organization_name as label, SUM(CAST(contract_amount AS DOUBLE)) as total_value, COUNT(*) as count FROM filtered_data WHERE organization_name IS NOT NULL GROUP BY 1 ORDER BY total_value DESC LIMIT {topN}",
            'by_area': f"{cte_query} SELECT area_of_delivery as label, SUM(CAST(contract_amount AS DOUBLE)) as total_value, COUNT(*) as count FROM filtered_data WHERE area_of_delivery IS NOT NULL GROUP BY 1 ORDER BY total_value DESC LIMIT {topN}",
            'by_category': f"{cte_query} SELECT business_category as label, SUM(CAST(contract_amount AS DOUBLE)) as total_value, COUNT(*) as count FROM filtered_data WHERE business_category IS NOT NULL GROUP BY 1 ORDER BY total_value DESC LIMIT {topN}"
        }

        try:
            # Use reusable connection (already configured with threads=4, memory limit, etc.)
            conn = self.get_connection()
            result: Dict[str, Any] = {}
            for key, q in queries.items():
                try:
                    rows = conn.execute(q).fetchall()
                    cols = [d[0] for d in conn.description]
                    result[key] = [dict(zip(cols, r)) for r in rows]
                except Exception as inner_e:
                    # If a specific aggregate fails, return empty set for that key instead of failing all
                    result[key] = []
            # Don't close connection - keep it alive for reuse
            return {'success': True, 'data': result}
        except Exception as e:
            return {'success': False, 'error': str(e), 'data': {}}

    def chip_aggregates_paginated(self,
                                 contractors: List[str] = [],
                                 areas: List[str] = [],
                                 organizations: List[str] = [],
                                 business_categories: List[str] = [],
                                 keywords: List[str] = [],
                                 time_ranges: List[Dict] = [],
                                 page: int = 1,
                                 page_size: int = 20,
                                 dimension: str = 'by_contractor',
                                 sort_by: str = 'total_value',
                                 sort_direction: str = 'desc',
                                 include_flood_control: bool = False,
                                 value_range: Optional[Dict] = None) -> Dict[str, Any]:
        """Return paginated aggregates for analytics table using chip filters."""
        # Reuse the filtering logic from chip_aggregates
        where_conditions = []

        # Keywords - Using optimized search with CONTAINS function for maximum performance (OR logic between keyword groups, AND logic within each keyword group)
        if keywords:
            keyword_conditions = []
            for keyword in keywords:
                if keyword.strip():
                    # Parse AND keywords within the keyword string
                    and_keywords = self._parse_and_keywords(keyword.strip())
                    if and_keywords:
                        # Create AND conditions for all keywords within this keyword group
                        keyword_and_conditions = []
                        for and_keyword in and_keywords:
                            escaped_keyword = self._escape_sql_like(and_keyword)
                            # Use CONTAINS function for better performance when available
                            # Fallback to LIKE for compatibility
                            try:
                                keyword_and_conditions.append(f"CONTAINS(LOWER(search_text), LOWER('{escaped_keyword}'))")
                            except:
                                keyword_and_conditions.append(f"LOWER(search_text) LIKE LOWER('%{escaped_keyword}%')")
                        keyword_conditions.append(f"({' AND '.join(keyword_and_conditions)})")
            if keyword_conditions:
                where_conditions.append(f"({' OR '.join(keyword_conditions)})")

        # Contractor filter (OR logic between contractors, AND logic within each contractor)
        if contractors:
            contractor_conditions = []
            for contractor in contractors:
                if contractor.strip():
                    # Parse AND keywords within the contractor string
                    and_keywords = self._parse_and_keywords(contractor.strip())
                    if and_keywords:
                        # Create AND conditions for all keywords within this contractor
                        contractor_and_conditions = []
                        for keyword in and_keywords:
                            escaped_keyword = self._escape_sql_like(keyword)
                            contractor_and_conditions.append(f"LOWER(awardee_name) LIKE LOWER('%{escaped_keyword}%')")
                        contractor_conditions.append(f"({' AND '.join(contractor_and_conditions)})")
            if contractor_conditions:
                where_conditions.append(f"({' OR '.join(contractor_conditions)})")

        # Area filter (OR logic between areas, AND logic within each area)
        if areas:
            area_conditions = []
            for area in areas:
                if area.strip():
                    # Parse AND keywords within the area string
                    and_keywords = self._parse_and_keywords(area.strip())
                    if and_keywords:
                        # Create AND conditions for all keywords within this area
                        area_and_conditions = []
                        for keyword in and_keywords:
                            escaped_keyword = self._escape_sql_like(keyword)
                            area_and_conditions.append(f"LOWER(area_of_delivery) LIKE LOWER('%{escaped_keyword}%')")
                        area_conditions.append(f"({' AND '.join(area_and_conditions)})")
            if area_conditions:
                where_conditions.append(f"({' OR '.join(area_conditions)})")

        # Organization filter (OR logic between organizations, AND logic within each organization)
        if organizations:
            org_conditions = []
            for org in organizations:
                if org.strip():
                    # Parse AND keywords within the organization string
                    and_keywords = self._parse_and_keywords(org.strip())
                    if and_keywords:
                        # Create AND conditions for all keywords within this organization
                        org_and_conditions = []
                        for keyword in and_keywords:
                            escaped_keyword = self._escape_sql_like(keyword)
                            org_and_conditions.append(f"LOWER(organization_name) LIKE LOWER('%{escaped_keyword}%')")
                        org_conditions.append(f"({' AND '.join(org_and_conditions)})")
            if org_conditions:
                where_conditions.append(f"({' OR '.join(org_conditions)})")

        # Business category filter (OR logic between categories, AND logic within each category)
        if business_categories:
            category_conditions = []
            for category in business_categories:
                if category.strip():
                    # Parse AND keywords within the category string
                    and_keywords = self._parse_and_keywords(category.strip())
                    if and_keywords:
                        # Create AND conditions for all keywords within this category
                        category_and_conditions = []
                        for keyword in and_keywords:
                            escaped_keyword = self._escape_sql_like(keyword)
                            category_and_conditions.append(f"LOWER(business_category) LIKE LOWER('%{escaped_keyword}%')")
                        category_conditions.append(f"({' AND '.join(category_and_conditions)})")
            if category_conditions:
                where_conditions.append(f"({' OR '.join(category_conditions)})")

        # Time ranges
        if time_ranges:
            time_conditions = []
            for tr in time_ranges:
                if tr.get('type') == 'yearly' and tr.get('year'):
                    year = tr['year']
                    time_conditions.append(f"EXTRACT(YEAR FROM TRY_CAST(award_date AS DATE)) = {year}")
                elif tr.get('type') == 'quarterly' and tr.get('year') and tr.get('quarter'):
                    year = tr['year']
                    quarter = tr['quarter']
                    time_conditions.append(f"EXTRACT(YEAR FROM TRY_CAST(award_date AS DATE)) = {year} AND EXTRACT(QUARTER FROM TRY_CAST(award_date AS DATE)) = {quarter}")
                elif tr.get('type') == 'custom' and tr.get('startDate') and tr.get('endDate'):
                    start_date = tr['startDate']
                    end_date = tr['endDate']
                    time_conditions.append(f"TRY_CAST(award_date AS DATE) >= '{start_date}' AND TRY_CAST(award_date AS DATE) <= '{end_date}'")
            if time_conditions:
                where_conditions.append(f"({' OR '.join(time_conditions)})")

        # Contract amount range filtering
        if value_range:
            amount_conditions = []
            min_amount = value_range.get('min')
            max_amount = value_range.get('max')
            
            if min_amount is not None and max_amount is not None:
                # Both min and max specified
                amount_conditions.append(f"CAST(contract_amount AS DOUBLE) >= {min_amount} AND CAST(contract_amount AS DOUBLE) <= {max_amount}")
            elif min_amount is not None:
                # Only min specified
                amount_conditions.append(f"CAST(contract_amount AS DOUBLE) >= {min_amount}")
            elif max_amount is not None:
                # Only max specified
                amount_conditions.append(f"CAST(contract_amount AS DOUBLE) <= {max_amount}")
            
            if amount_conditions:
                where_conditions.append(f"({' AND '.join(amount_conditions)})")

        # Flood control filter
        if not include_flood_control:
            where_conditions.append("LOWER(organization_name) NOT LIKE '%flood%'")

        # Build WHERE clause
        where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"

        # Determine the column to group by based on dimension
        dimension_columns = {
            'by_contractor': 'awardee_name',
            'by_organization': 'organization_name', 
            'by_area': 'area_of_delivery',
            'by_category': 'business_category'
        }
        
        group_column = dimension_columns.get(dimension, 'awardee_name')
        
        # Determine sort column
        sort_columns = {
            'total_value': 'total_value',
            'count': 'count',
            'avg_value': 'avg_value'
        }
        sort_column = sort_columns.get(sort_by, 'total_value')
        
        # Build UNION query for multiple parquet files
        select_fields = f"""
            {group_column} as label,
            CAST(contract_amount AS DECIMAL(15,2)) as contract_amount
        """
        
        union_queries = []
        parquet_files = self._get_parquet_files(include_flood_control)
        for file_path in parquet_files:
            file_query = f"SELECT {select_fields} FROM read_parquet('{file_path}')"
            if where_conditions:
                file_where_conditions = []
                for condition in where_conditions:
                    file_where_conditions.append(condition)
                file_query = f"SELECT {select_fields} FROM read_parquet('{file_path}') WHERE {' AND '.join(file_where_conditions)}"
            union_queries.append(file_query)

        if not union_queries:
            return {
                'success': True, 
                'data': [],
                'pagination': {
                    'current_page': page,
                    'page_size': page_size,
                    'total_count': 0,
                    'total_pages': 0,
                    'has_next': False,
                    'has_previous': False
                }
            }

        base_query = " UNION ALL ".join(union_queries)
        
        # Debug logging
        print(f"DEBUG: Base query: {base_query}")
        print(f"DEBUG: Where conditions: {where_conditions}")
        print(f"DEBUG: Group column: {group_column}")
        print(f"DEBUG: Sort column: {sort_column}")
        print(f"DEBUG: Sort direction: {sort_direction}")
        
        # Build the main query with pagination
        query = f"""
        WITH filtered_data AS (
            SELECT 
                label,
                SUM(contract_amount) as total_value,
                COUNT(*) as count,
                AVG(contract_amount) as avg_value
            FROM ({base_query})
            GROUP BY label
        ),
        total_count AS (
            SELECT COUNT(*) as total FROM filtered_data
        )
        SELECT 
            f.*,
            t.total
        FROM filtered_data f
        CROSS JOIN total_count t
        ORDER BY {sort_column} {sort_direction.upper()}
        LIMIT {page_size} OFFSET {(page - 1) * page_size}
        """

        try:
            conn = self.get_connection()
            rows = conn.execute(query).fetchall()
            cols = [d[0] for d in conn.description]
            data = [dict(zip(cols, r)) for r in rows]
            
            # Get total count
            total_count = data[0]['total'] if data else 0
            
            # Remove total from each row
            for row in data:
                del row['total']
            
            # Calculate pagination info
            total_pages = (total_count + page_size - 1) // page_size
            
            pagination = {
                'current_page': page,
                'page_size': page_size,
                'total_count': total_count,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_previous': page > 1
            }
            
            # Don't close connection - keep it alive for reuse
            return {
                'success': True, 
                'data': data,
                'pagination': pagination
            }
        except Exception as e:
            return {'success': False, 'error': str(e), 'data': [], 'pagination': {}}
    
    def get_value_distribution(
        self,
        contractors: List[str] = None,
        areas: List[str] = None,
        organizations: List[str] = None,
        business_categories: List[str] = None,
        keywords: List[str] = None,
        time_ranges: List[Dict] = None,
        value_range: Dict[str, float] = None,
        include_flood_control: bool = False,
        num_bins: int = 1000
    ) -> Dict[str, Any]:
        """
        Calculate value distribution histogram with configurable bins.
        
        Returns bins showing how many contracts fall within each value range,
        revealing clustering patterns (e.g., many contracts around 1M, 5M, etc.)
        
        Args:
            num_bins: Number of bins to divide the value range into (default: 1000)
            Other args: Same as chip_search for filtering
            
        Returns:
            {
                'success': True,
                'min_value': float,
                'max_value': float,
                'bin_width': float,
                'bins': [
                    {'bin_start': float, 'bin_end': float, 'count': int, 'total_value': float},
                    ...
                ]
            }
        """
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # Get parquet files
            parquet_files = self._get_parquet_files(include_flood_control=include_flood_control)
            if not parquet_files:
                return {
                    'success': False,
                    'error': 'No parquet files found',
                    'bins': []
                }
            
            # Build WHERE conditions (returns a list, need to join)
            where_conditions_list = self._build_chip_where_conditions(
                contractors=contractors,
                areas=areas,
                organizations=organizations,
                business_categories=business_categories,
                keywords=keywords,
                time_ranges=time_ranges,
                value_range=value_range
            )
            
            # Build base query with proper WHERE clause handling
            file_list = "', '".join(parquet_files)
            
            # Always include contract_amount conditions
            amount_conditions = "contract_amount IS NOT NULL AND contract_amount > 0"
            
            if where_conditions_list:
                # Join the list of conditions with AND
                where_conditions_str = ' AND '.join(where_conditions_list)
                where_clause = f"WHERE {where_conditions_str} AND {amount_conditions}"
            else:
                where_clause = f"WHERE {amount_conditions}"
            
            base_query = f"""
            SELECT contract_amount
            FROM read_parquet(['{file_list}'])
            {where_clause}
            """
            
            logger.info(f"Value distribution query: {base_query}")
            
            conn = self.get_connection()
            
            # First, get min and max values
            stats_query = f"""
            SELECT 
                MIN(contract_amount) as min_value,
                MAX(contract_amount) as max_value,
                COUNT(*) as total_contracts
            FROM ({base_query})
            """
            
            stats = conn.execute(stats_query).fetchone()
            min_value, max_value, total_contracts = stats
            
            if not min_value or not max_value or total_contracts == 0:
                return {
                    'success': True,
                    'min_value': 0,
                    'max_value': 0,
                    'bin_width': 0,
                    'total_contracts': 0,
                    'bins': []
                }
            
            # Calculate bin width
            bin_width = (max_value - min_value) / num_bins
            
            # Manual binning (WIDTH_BUCKET not available in this DuckDB version)
            histogram_query = f"""
            WITH binned_data AS (
                SELECT 
                    CAST(
                        LEAST(
                            FLOOR((contract_amount - {min_value}) / {bin_width}) + 1,
                            {num_bins}
                        ) AS INTEGER
                    ) as bin_number,
                    contract_amount
                FROM ({base_query})
            )
            SELECT 
                bin_number,
                {min_value} + (bin_number - 1) * {bin_width} as bin_start,
                {min_value} + bin_number * {bin_width} as bin_end,
                COUNT(*) as count,
                SUM(contract_amount) as total_value
            FROM binned_data
            WHERE bin_number >= 1 AND bin_number <= {num_bins}
            GROUP BY bin_number
            ORDER BY bin_number
            """
            
            logger.info(f"Histogram query: {histogram_query}")
            
            rows = conn.execute(histogram_query).fetchall()
            
            bins = []
            for row in rows:
                bin_number, bin_start, bin_end, count, total_value = row
                bins.append({
                    'bin_number': int(bin_number),
                    'bin_start': float(bin_start),
                    'bin_end': float(bin_end),
                    'count': int(count),
                    'total_value': float(total_value) if total_value else 0,
                    'avg_value': float(total_value / count) if count > 0 else 0
                })
            
            return {
                'success': True,
                'min_value': float(min_value),
                'max_value': float(max_value),
                'bin_width': float(bin_width),
                'num_bins': num_bins,
                'total_contracts': int(total_contracts),
                'bins': bins
            }
            
        except Exception as e:
            logger.error(f"Error calculating value distribution: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'bins': []
            }
