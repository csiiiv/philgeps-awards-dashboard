"""
Parquet Data Service for server-side data processing
Replaces client-side DuckDB-WASM with server-side processing
"""
import os
import pandas as pd
import duckdb
from typing import Dict, List, Any, Optional, Tuple
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class ParquetDataService:
    """Service for querying Parquet files server-side"""
    
    def __init__(self):
        # Allow override via environment variable for flexibility in Docker/runtime
        env_dir = os.environ.get('PARQUET_DIR')
        if env_dir:
            self.parquet_dir = env_dir
        else:
            try:
                # Default: resolve to repo-root/data/parquet => in Docker becomes /data/parquet
                self.parquet_dir = os.path.join(settings.BASE_DIR, '..', '..', 'data', 'parquet')
            except Exception:
                # Fallback when Django settings not configured
                self.parquet_dir = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'data', 'parquet')
        self.conn = None
    
    def get_connection(self):
        """Get or create DuckDB connection"""
        # Create a new connection for each query to avoid concurrency issues
        return duckdb.connect()
    
    def get_parquet_path(self, entity_type: str, time_range: str = 'all_time', 
                        year: Optional[int] = None, quarter: Optional[int] = None) -> str:
        """Get the path to the appropriate Parquet file"""
        if time_range == 'all_time':
            return os.path.join(self.parquet_dir, f'agg_{entity_type}.parquet')
        elif time_range == 'yearly' and year:
            return os.path.join(self.parquet_dir, 'yearly', f'year_{year}', f'agg_{entity_type}.parquet')
        elif time_range == 'quarterly' and year and quarter:
            return os.path.join(self.parquet_dir, 'quarterly', f'year_{year}_q{quarter}', f'agg_{entity_type}.parquet')
        else:
            return os.path.join(self.parquet_dir, f'agg_{entity_type}.parquet')
    
    def get_facts_path(self, time_range: str = 'all_time', 
                      year: Optional[int] = None, quarter: Optional[int] = None) -> str:
        """Get the path to the appropriate facts Parquet file"""
        if time_range == 'all_time':
            return os.path.join(self.parquet_dir, 'facts_awards_all_time.parquet')
        elif time_range == 'yearly' and year:
            return os.path.join(self.parquet_dir, 'yearly', f'year_{year}', f'facts_awards_year_{year}.parquet')
        elif time_range == 'quarterly' and year and quarter:
            return os.path.join(self.parquet_dir, 'quarterly', f'year_{year}_q{quarter}', f'facts_awards_year_{year}_q{quarter}.parquet')
        else:
            return os.path.join(self.parquet_dir, 'facts_awards_all_time.parquet')
    
    def query_entities_paged(self, entity_type: str, page_index: int = 0, 
                           page_size: int = 10, time_range: str = 'all_time',
                           year: Optional[int] = None, quarter: Optional[int] = None,
                           start_date: Optional[str] = None, end_date: Optional[str] = None,
                           search_query: Optional[str] = None, 
                           sort_by: str = 'total_contract_value', 
                           sort_dir: str = 'DESC',
                           include_flood_control: bool = False) -> Dict[str, Any]:
        """Query entities with pagination and filtering"""
        try:
            conn = self.get_connection()
            
            # Map entity types to file names (not column names)
            entity_mapping = {
                'contractors': 'contractor',
                'contractor': 'contractor',  # Add singular form
                'areas': 'area',
                'area': 'area',  # Add singular form
                'organizations': 'organization',
                'organization': 'organization',  # Add singular form
                'categories': 'business_category',
                'business_category': 'business_category'  # Add singular form
            }
            
            # For custom time range, we need to query the facts table directly
            if time_range == 'custom' and start_date and end_date:
                # Map entity types to column names for custom queries
                column_mapping = {
                    'contractors': 'awardee_name',
                    'contractor': 'awardee_name',  # Add singular form
                    'areas': 'area_of_delivery',
                    'area': 'area_of_delivery',  # Add singular form
                    'organizations': 'organization_name',
                    'organization': 'organization_name',  # Add singular form
                    'categories': 'business_category',
                    'business_category': 'business_category'  # Add singular form
                }
                return self._query_custom_time_range(
                    entity_type, column_mapping[entity_type], page_index, page_size,
                    start_date, end_date, search_query, sort_by, sort_dir, include_flood_control
                )
            
            parquet_file = self.get_parquet_path(entity_mapping[entity_type], time_range, year, quarter)
            
            if not os.path.exists(parquet_file):
                return {'rows': [], 'totalCount': 0, 'error': 'Data file not found'}
            
            # Build WHERE clause
            where_conditions = ['contract_count > 0']
            if search_query:
                escaped_query = search_query.lower().replace("'", "''")
                where_conditions.append(f"lower(entity) LIKE '%{escaped_query}%'")
            
            where_clause = ' AND '.join(where_conditions)
            
            # Build ORDER BY clause
            order_clause = f"{sort_by} {sort_dir}"
            
            # Calculate offset
            offset = page_index * page_size
            
            # Query for data
            data_query = f"""
            SELECT entity, contract_count, total_contract_value, 
                   average_contract_value, first_contract_date, last_contract_date
            FROM read_parquet('{parquet_file}')
            WHERE {where_clause}
            ORDER BY {order_clause}
            LIMIT {page_size} OFFSET {offset}
            """
            
            # Count query
            count_query = f"""
            SELECT COUNT(*) as total_count
            FROM read_parquet('{parquet_file}')
            WHERE {where_clause}
            """
            
            # Execute queries
            data_result = conn.execute(data_query).fetchall()
            count_result = conn.execute(count_query).fetchone()
            
            # Convert to list of dictionaries
            columns = ['entity', 'contract_count', 'total_contract_value', 
                      'average_contract_value', 'first_contract_date', 'last_contract_date']
            rows = [dict(zip(columns, row)) for row in data_result]
            
            total_count = count_result[0] if count_result else 0
            
            return {
                'rows': rows,
                'totalCount': total_count,
                'pageIndex': page_index,
                'pageSize': page_size,
                'totalPages': (total_count + page_size - 1) // page_size
            }
            
        except Exception as e:
            logger.error(f"Error querying entities: {str(e)}")
            return {'rows': [], 'totalCount': 0, 'error': str(e)}
    
    def _query_custom_time_range(self, entity_type: str, entity_col: str, page_index: int, 
                               page_size: int, start_date: str, end_date: str,
                               search_query: Optional[str], sort_by: str, sort_dir: str,
                               include_flood_control: bool = False) -> Dict[str, Any]:
        """Query entities for custom time range by aggregating from facts table"""
        try:
            conn = self.get_connection()
            
            # Use the all_time facts table for custom queries
            facts_file = self.get_facts_path('all_time')
            
            if not os.path.exists(facts_file):
                return {'rows': [], 'totalCount': 0, 'error': 'Data file not found'}
            
            # Build WHERE clause for custom date range
            where_conditions = [
                f"award_date >= '{start_date}'",
                f"award_date <= '{end_date}'",
                f"{entity_col} IS NOT NULL AND {entity_col} != 'NULL'"
            ]
            
            if search_query:
                escaped_query = search_query.lower().replace("'", "''")
                where_conditions.append(f"lower({entity_col}) LIKE '%{escaped_query}%'")
            
            where_clause = ' AND '.join(where_conditions)
            
            # Build ORDER BY clause
            order_clause = f"{sort_by} {sort_dir}"
            
            # Calculate offset
            offset = page_index * page_size
            
            # Build UNION query if flood control is included
            if include_flood_control:
                flood_control_file = os.path.join(self.parquet_dir, 'facts_awards_flood_control.parquet')
                if os.path.exists(flood_control_file):
                    # Use UNION ALL to combine both datasets
                    union_query = f"""
                    SELECT 
                        {entity_col} as entity,
                        COUNT(*) as contract_count,
                        SUM(CAST(contract_amount AS DOUBLE)) as total_contract_value,
                        AVG(CAST(contract_amount AS DOUBLE)) as average_contract_value,
                        MIN(award_date) as first_contract_date,
                        MAX(award_date) as last_contract_date
                    FROM read_parquet('{facts_file}')
                    WHERE {where_clause}
                        AND contract_amount IS NOT NULL
                        AND contract_amount != 'NULL'
                    GROUP BY {entity_col}
                    
                    UNION ALL
                    
                    SELECT 
                        {entity_col} as entity,
                        COUNT(*) as contract_count,
                        SUM(CAST(contract_amount AS DOUBLE)) as total_contract_value,
                        AVG(CAST(contract_amount AS DOUBLE)) as average_contract_value,
                        MIN(award_date) as first_contract_date,
                        MAX(award_date) as last_contract_date
                    FROM read_parquet('{flood_control_file}')
                    WHERE {where_clause}
                        AND contract_amount IS NOT NULL
                        AND contract_amount != 'NULL'
                    GROUP BY {entity_col}
                    """
                    
                    # Aggregate the UNION results
                    data_query = f"""
                    SELECT 
                        entity,
                        SUM(contract_count) as contract_count,
                        SUM(total_contract_value) as total_contract_value,
                        AVG(average_contract_value) as average_contract_value,
                        MIN(first_contract_date) as first_contract_date,
                        MAX(last_contract_date) as last_contract_date
                    FROM ({union_query}) as combined_data
                    GROUP BY entity
                    ORDER BY {order_clause}
                    LIMIT {page_size} OFFSET {offset}
                    """
                    
                    count_query = f"""
                    SELECT COUNT(DISTINCT entity) as total_count
                    FROM ({union_query}) as combined_data
                    """
                else:
                    # Fallback to regular query if flood control file doesn't exist
                    data_query = f"""
                    SELECT 
                        {entity_col} as entity,
                        COUNT(*) as contract_count,
                        SUM(CAST(contract_amount AS DOUBLE)) as total_contract_value,
                        AVG(CAST(contract_amount AS DOUBLE)) as average_contract_value,
                        MIN(award_date) as first_contract_date,
                        MAX(award_date) as last_contract_date
                    FROM read_parquet('{facts_file}')
                    WHERE {where_clause}
                        AND contract_amount IS NOT NULL
                        AND contract_amount != 'NULL'
                    GROUP BY {entity_col}
                    ORDER BY {order_clause}
                    LIMIT {page_size} OFFSET {offset}
                    """
                    
                    count_query = f"""
                    SELECT COUNT(DISTINCT {entity_col}) as total_count
                    FROM read_parquet('{facts_file}')
                    WHERE {where_clause}
                    """
            else:
                # Regular query without flood control
                data_query = f"""
                SELECT 
                    {entity_col} as entity,
                    COUNT(*) as contract_count,
                    SUM(CAST(contract_amount AS DOUBLE)) as total_contract_value,
                    AVG(CAST(contract_amount AS DOUBLE)) as average_contract_value,
                    MIN(award_date) as first_contract_date,
                    MAX(award_date) as last_contract_date
                FROM read_parquet('{facts_file}')
                WHERE {where_clause}
                    AND contract_amount IS NOT NULL
                    AND contract_amount != 'NULL'
                GROUP BY {entity_col}
                ORDER BY {order_clause}
                LIMIT {page_size} OFFSET {offset}
                """
                
                count_query = f"""
                SELECT COUNT(DISTINCT {entity_col}) as total_count
                FROM read_parquet('{facts_file}')
                WHERE {where_clause}
                """
            
            # Execute queries
            data_result = conn.execute(data_query).fetchall()
            count_result = conn.execute(count_query).fetchone()
            
            # Convert to list of dictionaries
            columns = ['entity', 'contract_count', 'total_contract_value', 
                      'average_contract_value', 'first_contract_date', 'last_contract_date']
            rows = [dict(zip(columns, row)) for row in data_result]
            
            total_count = count_result[0] if count_result else 0
            
            return {
                'rows': rows,
                'totalCount': total_count,
                'pageIndex': page_index,
                'pageSize': page_size,
                'totalPages': (total_count + page_size - 1) // page_size
            }
            
        except Exception as e:
            logger.error(f"Error querying custom time range: {str(e)}")
            return {'rows': [], 'totalCount': 0, 'error': str(e)}
    
    def query_related_entities(self, source_dim: str, source_value: str, 
                             target_dim: str, limit: int = 10,
                             time_range: str = 'all_time',
                             year: Optional[int] = None, 
                             quarter: Optional[int] = None) -> List[Dict[str, Any]]:
        """Query related entities for drill-down functionality"""
        try:
            conn = self.get_connection()
            
            # Map dimensions to column names
            dim_mapping = {
                'contractor': 'awardee_name',
                'area': 'area_of_delivery', 
                'organization': 'organization_name',
                'category': 'business_category'
            }
            
            facts_file = self.get_facts_path(time_range, year, quarter)
            
            if not os.path.exists(facts_file):
                return []
            
            src_col = dim_mapping[source_dim]
            tgt_col = dim_mapping[target_dim]
            
            # Escape single quotes in source value
            escaped_value = source_value.replace("'", "''")
            
            query = f"""
            SELECT
                {tgt_col} AS entity,
                COUNT(*) AS contract_count,
                SUM(CAST(contract_amount AS DOUBLE)) AS total_contract_value,
                AVG(CAST(contract_amount AS DOUBLE)) AS average_contract_value,
                MIN(award_date) AS first_contract_date,
                MAX(award_date) AS last_contract_date
            FROM read_parquet('{facts_file}')
            WHERE {src_col} = '{escaped_value}'
                AND {tgt_col} IS NOT NULL
                AND contract_amount IS NOT NULL
                AND contract_amount != 'NULL'
            GROUP BY 1
            ORDER BY total_contract_value DESC
            LIMIT {limit}
            """
            
            result = conn.execute(query).fetchall()
            columns = ['entity', 'contract_count', 'total_contract_value', 
                      'average_contract_value', 'first_contract_date', 'last_contract_date']
            
            return [dict(zip(columns, row)) for row in result]
            
        except Exception as e:
            logger.error(f"Error querying related entities: {str(e)}")
            return []
    
    def query_contracts_by_entity(self, filters: List[Dict[str, str]], 
                                page_index: int = 0, page_size: int = 20,
                                order_by: str = 'award_date DESC',
                                time_range: str = 'all_time',
                                year: Optional[int] = None, 
                                quarter: Optional[int] = None) -> Dict[str, Any]:
        """Query contracts filtered by entity dimensions"""
        try:
            conn = self.get_connection()
            
            facts_file = self.get_facts_path(time_range, year, quarter)
            
            if not os.path.exists(facts_file):
                return {'rows': [], 'totalCount': 0, 'error': 'Data file not found'}
            
            # Map dimension names to column names
            dim_mapping = {
                'contractor_name': 'awardee_name',
                'area_of_delivery': 'area_of_delivery',
                'organization_name': 'organization_name', 
                'business_category': 'business_category',
                'contractor': 'awardee_name',
                'area': 'area_of_delivery',
                'organization': 'organization_name',
                'category': 'business_category'
            }
            
            # Build WHERE clause from filters
            where_conditions = []
            for filter_item in filters:
                dim = dim_mapping.get(filter_item['dim'], filter_item['dim'])
                value = filter_item['value'].replace("'", "''")
                where_conditions.append(f"{dim} = '{value}'")
            
            where_clause = ' AND '.join(where_conditions) if where_conditions else '1=1'
            
            # Calculate offset
            offset = page_index
            
            # Handle numeric sorting for contract value fields
            if 'contract_value' in order_by or 'total_contract_amount' in order_by:
                # Replace contract_value with CAST(contract_amount AS DOUBLE) for proper numeric sorting
                numeric_order_by = order_by.replace('contract_value', 'CAST(contract_amount AS DOUBLE)')
                numeric_order_by = numeric_order_by.replace('total_contract_amount', 'CAST(contract_amount AS DOUBLE)')
            else:
                numeric_order_by = order_by
            
            # Query for contracts
            contracts_query = f"""
            SELECT 
                award_date,
                awardee_name as contractor_name,
                business_category,
                organization_name,
                area_of_delivery,
                contract_amount AS contract_value,
                award_title,
                notice_title,
                contract_number as contract_no
            FROM read_parquet('{facts_file}')
            WHERE {where_clause}
            ORDER BY {numeric_order_by}
            LIMIT {page_size} OFFSET {offset}
            """
            
            # Count query
            count_query = f"""
            SELECT COUNT(*) as total_count
            FROM read_parquet('{facts_file}')
            WHERE {where_clause}
            """
            
            # Execute queries
            contracts_result = conn.execute(contracts_query).fetchall()
            count_result = conn.execute(count_query).fetchone()
            
            # Convert to list of dictionaries
            columns = ['award_date', 'contractor_name', 'business_category', 
                      'organization_name', 'area_of_delivery', 'contract_value',
                      'award_title', 'notice_title', 'contract_no']
            rows = [dict(zip(columns, row)) for row in contracts_result]
            
            total_count = count_result[0] if count_result else 0
            
            return {
                'rows': rows,
                'totalCount': total_count,
                'pageIndex': page_index,
                'pageSize': page_size,
                'totalPages': (total_count + page_size - 1) // page_size
            }
            
        except Exception as e:
            logger.error(f"Error querying contracts by entity: {str(e)}")
            return {'rows': [], 'totalCount': 0, 'error': str(e)}
    
    def get_available_time_ranges(self) -> Dict[str, Any]:
        """Get available time ranges and years/quarters"""
        try:
            # Check what time range files are available
            all_time_files = [f for f in os.listdir(self.parquet_dir) if f.startswith('agg_') and f.endswith('.parquet')]
            
            yearly_dir = os.path.join(self.parquet_dir, 'yearly')
            quarterly_dir = os.path.join(self.parquet_dir, 'quarterly')
            
            years = []
            quarters = []
            
            if os.path.exists(yearly_dir):
                year_dirs = [d for d in os.listdir(yearly_dir) if d.startswith('year_')]
                years = sorted([int(d.split('_')[1]) for d in year_dirs])
            
            if os.path.exists(quarterly_dir):
                quarter_dirs = [d for d in os.listdir(quarterly_dir) if d.startswith('year_') and '_q' in d]
                quarters = sorted([d for d in quarter_dirs])
            
            return {
                'all_time': len(all_time_files) > 0,
                'yearly': len(years) > 0,
                'quarterly': len(quarters) > 0,
                'years': years,
                'quarters': quarters
            }
            
        except Exception as e:
            logger.error(f"Error getting available time ranges: {str(e)}")
            return {'all_time': False, 'yearly': False, 'quarterly': False, 'years': [], 'quarters': []}
    
    def close_connection(self):
        """Close the database connection"""
        if self.conn:
            self.conn.close()
            self.conn = None

# Global instance
parquet_service = ParquetDataService()
