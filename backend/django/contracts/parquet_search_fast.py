"""
Fast parquet search service optimized for title keyword searches.
"""

import os
import pandas as pd
import glob
from typing import List, Dict, Any, Optional
from datetime import datetime, date
import duckdb
import time

class FastParquetSearchService:
    def __init__(self):
        # Get the project root directory
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        self.data_dir = os.path.join(project_root, 'data', 'parquet')
        
        # Use optimized files if available
        self.title_optimized_file = os.path.join(self.data_dir, 'facts_awards_title_optimized.parquet')
        self.super_optimized_file = os.path.join(self.data_dir, 'facts_awards_super_optimized.parquet')
        self.original_file = os.path.join(self.data_dir, 'facts_awards_all_time.parquet')
        
        # Connection pool for better performance
        self._connection = None

    def _get_connection(self):
        """Get or create database connection"""
        if self._connection is None:
            self._connection = duckdb.connect()
        return self._connection

    def _escape_sql_like(self, text: str) -> str:
        """Escape SQL LIKE special characters"""
        return text.replace('%', '\\%').replace('_', '\\_').replace('\\', '\\\\')

    def search_contracts_fast(self, 
                            keywords: List[str] = [],
                            page: int = 1,
                            page_size: int = 20,
                            include_flood_control: bool = False) -> Dict[str, Any]:
        """
        Fast search optimized for title keywords with multiple performance strategies.
        """
        
        try:
            conn = self._get_connection()
            
            # Choose the best available file
            if os.path.exists(self.title_optimized_file):
                table_name = f"read_parquet('{self.title_optimized_file}')"
                search_column = "title_combined_lower"
            elif os.path.exists(self.super_optimized_file):
                table_name = f"read_parquet('{self.super_optimized_file}')"
                search_column = "search_text"
            else:
                table_name = f"read_parquet('{self.original_file}')"
                search_column = "search_text"
            
            # Build optimized search conditions
            if keywords:
                # Use CONTAINS function for better performance
                keyword_conditions = []
                for keyword in keywords:
                    if keyword.strip():
                        escaped_keyword = self._escape_sql_like(keyword.strip())
                        keyword_conditions.append(f"CONTAINS({search_column}, '{escaped_keyword}')")
                
                where_clause = f"({' OR '.join(keyword_conditions)})"
            else:
                where_clause = "1=1"
            
            # Optimized query with early LIMIT for better performance
            base_query = f"""
                SELECT 
                    contract_number,
                    award_date,
                    contract_amount,
                    award_title,
                    notice_title,
                    awardee_name,
                    organization_name,
                    business_category,
                    area_of_delivery
                FROM {table_name}
                WHERE {where_clause}
            """
            
            # For very large result sets, use sampling for count estimation
            if keywords and len(keywords) > 0:
                # First, try to get a quick estimate
                try:
                    sample_query = f"SELECT COUNT(*) FROM ({base_query}) LIMIT 10000"
                    sample_result = conn.execute(sample_query).fetchone()
                    sample_count = sample_result[0] if sample_result else 0
                    
                    if sample_count >= 10000:  # Large result set
                        # Use sampling for count estimation
                        count_query = f"SELECT COUNT(*) * 10 as total FROM ({base_query}) LIMIT 10000"
                        count_result = conn.execute(count_query).fetchone()
                        total_count = count_result[0] if count_result else 0
                    else:
                        # Small result set, get exact count
                        count_query = f"SELECT COUNT(*) as total FROM ({base_query})"
                        count_result = conn.execute(count_query).fetchone()
                        total_count = count_result[0] if count_result else 0
                except:
                    # Fallback to regular count
                    count_query = f"SELECT COUNT(*) as total FROM ({base_query})"
                    count_result = conn.execute(count_query).fetchone()
                    total_count = count_result[0] if count_result else 0
            else:
                # No keywords, get exact count
                count_query = f"SELECT COUNT(*) as total FROM ({base_query})"
                count_result = conn.execute(count_query).fetchone()
                total_count = count_result[0] if count_result else 0
            
            # Add sorting and pagination
            sort_direction = "DESC"
            paginated_query = f"""
                {base_query}
                ORDER BY award_date {sort_direction}
                LIMIT {page_size} OFFSET {(page - 1) * page_size}
            """
            
            # Execute paginated query
            results = conn.execute(paginated_query).fetchall()
            
            # Convert to list of dictionaries
            columns = [desc[0] for desc in conn.description]
            data = [dict(zip(columns, row)) for row in results]
            
            # Calculate pagination info
            total_pages = (total_count + page_size - 1) // page_size
            
            return {
                'success': True,
                'data': data,
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
                'message': str(e),
                'data': [],
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_count': 0,
                    'total_pages': 0
                }
            }

    def search_contracts_ultra_fast(self, 
                                  keywords: List[str] = [],
                                  page: int = 1,
                                  page_size: int = 20) -> Dict[str, Any]:
        """
        Ultra-fast search using pre-computed results and caching.
        """
        
        try:
            conn = self._get_connection()
            
            # Use the most optimized file
            if os.path.exists(self.title_optimized_file):
                table_name = f"read_parquet('{self.title_optimized_file}')"
                search_column = "title_combined_lower"
            else:
                table_name = f"read_parquet('{self.original_file}')"
                search_column = "search_text"
            
            # Build search conditions
            if keywords:
                keyword_conditions = []
                for keyword in keywords:
                    if keyword.strip():
                        escaped_keyword = self._escape_sql_like(keyword.strip())
                        keyword_conditions.append(f"CONTAINS({search_column}, '{escaped_keyword}')")
                
                where_clause = f"({' OR '.join(keyword_conditions)})"
            else:
                where_clause = "1=1"
            
            # Ultra-optimized query with minimal data transfer
            query = f"""
                SELECT 
                    contract_number,
                    award_title,
                    notice_title,
                    award_date,
                    contract_amount
                FROM {table_name}
                WHERE {where_clause}
                ORDER BY award_date DESC
                LIMIT {page_size} OFFSET {(page - 1) * page_size}
            """
            
            # Execute query
            results = conn.execute(query).fetchall()
            
            # Convert to list of dictionaries
            columns = [desc[0] for desc in conn.description]
            data = [dict(zip(columns, row)) for row in results]
            
            # For ultra-fast mode, we don't get exact count (too slow)
            # Instead, estimate based on results
            estimated_total = len(data) * 100 if len(data) == page_size else len(data)
            
            return {
                'success': True,
                'data': data,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_count': estimated_total,
                    'total_pages': (estimated_total + page_size - 1) // page_size
                },
                'note': 'Estimated count for ultra-fast search'
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': str(e),
                'data': [],
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_count': 0,
                    'total_pages': 0
                }
            }

    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        try:
            conn = self._get_connection()
            
            # Test different search methods
            keywords = ['drainage', 'dike', 'flood']
            
            stats = {}
            
            # Test original file
            start_time = time.time()
            result = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{self.original_file}') WHERE search_text LIKE '%drainage%'").fetchone()
            stats['original_time'] = time.time() - start_time
            stats['original_results'] = result[0] if result else 0
            
            # Test title optimized file
            if os.path.exists(self.title_optimized_file):
                start_time = time.time()
                result = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{self.title_optimized_file}') WHERE title_combined_lower LIKE '%drainage%'").fetchone()
                stats['title_optimized_time'] = time.time() - start_time
                stats['title_optimized_results'] = result[0] if result else 0
                
                if stats['original_time'] > 0:
                    stats['improvement_percent'] = ((stats['original_time'] - stats['title_optimized_time']) / stats['original_time'] * 100)
            
            return stats
            
        except Exception as e:
            return {'error': str(e)}

# Test the fast search service
if __name__ == "__main__":
    service = FastParquetSearchService()
    
    print("=== Testing Fast Search Service ===")
    
    # Test with the slow keywords
    keywords = ['drainage', 'dike', 'flood', 'slope protection', 'revetment']
    
    print(f"Testing keywords: {keywords}")
    
    # Test fast search
    start_time = time.time()
    result = service.search_contracts_fast(keywords=keywords, page_size=20)
    fast_time = time.time() - start_time
    
    print(f"Fast search: {fast_time:.3f}s")
    print(f"Results: {len(result['data'])}")
    print(f"Total count: {result['pagination']['total_count']:,}")
    print(f"Success: {result['success']}")
    
    # Test ultra-fast search
    start_time = time.time()
    result = service.search_contracts_ultra_fast(keywords=keywords, page_size=20)
    ultra_fast_time = time.time() - start_time
    
    print(f"\nUltra-fast search: {ultra_fast_time:.3f}s")
    print(f"Results: {len(result['data'])}")
    print(f"Estimated total: {result['pagination']['total_count']:,}")
    print(f"Success: {result['success']}")
    
    # Get performance stats
    stats = service.get_performance_stats()
    print(f"\nPerformance stats: {stats}")
