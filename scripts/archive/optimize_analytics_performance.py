#!/usr/bin/env python3
"""
Optimize analytics performance for title keyword searches.
"""

import time
import duckdb
import os

def test_analytics_optimizations():
    """Test different optimization strategies for analytics"""
    
    print("=== Analytics Performance Optimization ===")
    
    conn = duckdb.connect()
    keywords = ['drainage', 'dike', 'flood', 'slope protection', 'revetment']
    
    # Test 1: Current analytics approach
    print("\n1. Current Analytics Approach:")
    like_conditions = ' OR '.join([f"search_text LIKE '%{kw}%'" for kw in keywords])
    
    start = time.time()
    result1 = conn.execute(f"""
        SELECT 
            awardee_name as contractor,
            COUNT(*) as count,
            SUM(CAST(contract_amount AS DOUBLE)) as total_value
        FROM read_parquet('data/parquet/facts_awards_all_time.parquet')
        WHERE ({like_conditions})
        GROUP BY awardee_name
        ORDER BY total_value DESC
        LIMIT 20
    """).fetchall()
    time1 = time.time() - start
    print(f"   Main analytics: {time1:.3f}s ({len(result1)} results)")
    
    start = time.time()
    result2 = conn.execute(f"""
        SELECT 
            EXTRACT(YEAR FROM award_date::DATE) as year,
            EXTRACT(MONTH FROM award_date::DATE) as month,
            COUNT(*) as count,
            SUM(CAST(contract_amount AS DOUBLE)) as total_value
        FROM read_parquet('data/parquet/facts_awards_all_time.parquet')
        WHERE ({like_conditions})
        GROUP BY year, month
        ORDER BY year, month
    """).fetchall()
    time2 = time.time() - start
    print(f"   Time-based data: {time2:.3f}s ({len(result2)} results)")
    print(f"   Total time: {time1 + time2:.3f}s")
    
    # Test 2: Using title-optimized file
    print("\n2. Using Title-Optimized File:")
    like_conditions_opt = ' OR '.join([f"title_combined_lower LIKE '%{kw.lower()}%'" for kw in keywords])
    
    start = time.time()
    result3 = conn.execute(f"""
        SELECT 
            awardee_name as contractor,
            COUNT(*) as count,
            SUM(CAST(contract_amount AS DOUBLE)) as total_value
        FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet')
        WHERE ({like_conditions_opt})
        GROUP BY awardee_name
        ORDER BY total_value DESC
        LIMIT 20
    """).fetchall()
    time3 = time.time() - start
    print(f"   Main analytics: {time3:.3f}s ({len(result3)} results)")
    
    start = time.time()
    result4 = conn.execute(f"""
        SELECT 
            EXTRACT(YEAR FROM award_date::DATE) as year,
            EXTRACT(MONTH FROM award_date::DATE) as month,
            COUNT(*) as count,
            SUM(CAST(contract_amount AS DOUBLE)) as total_value
        FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet')
        WHERE ({like_conditions_opt})
        GROUP BY year, month
        ORDER BY year, month
    """).fetchall()
    time4 = time.time() - start
    print(f"   Time-based data: {time4:.3f}s ({len(result4)} results)")
    print(f"   Total time: {time3 + time4:.3f}s")
    
    # Test 3: Using CONTAINS function
    print("\n3. Using CONTAINS Function:")
    contains_conditions = ' OR '.join([f"CONTAINS(title_combined_lower, '{kw.lower()}')" for kw in keywords])
    
    start = time.time()
    result5 = conn.execute(f"""
        SELECT 
            awardee_name as contractor,
            COUNT(*) as count,
            SUM(CAST(contract_amount AS DOUBLE)) as total_value
        FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet')
        WHERE ({contains_conditions})
        GROUP BY awardee_name
        ORDER BY total_value DESC
        LIMIT 20
    """).fetchall()
    time5 = time.time() - start
    print(f"   Main analytics: {time5:.3f}s ({len(result5)} results)")
    
    start = time.time()
    result6 = conn.execute(f"""
        SELECT 
            EXTRACT(YEAR FROM award_date::DATE) as year,
            EXTRACT(MONTH FROM award_date::DATE) as month,
            COUNT(*) as count,
            SUM(CAST(contract_amount AS DOUBLE)) as total_value
        FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet')
        WHERE ({contains_conditions})
        GROUP BY year, month
        ORDER BY year, month
    """).fetchall()
    time6 = time.time() - start
    print(f"   Time-based data: {time6:.3f}s ({len(result6)} results)")
    print(f"   Total time: {time5 + time6:.3f}s")
    
    # Test 4: Combined query approach
    print("\n4. Combined Query Approach:")
    start = time.time()
    result7 = conn.execute(f"""
        WITH filtered_data AS (
            SELECT 
                awardee_name,
                contract_amount,
                award_date
            FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet')
            WHERE ({contains_conditions})
        )
        SELECT 
            'contractor_analytics' as type,
            awardee_name as contractor,
            COUNT(*) as count,
            SUM(CAST(contract_amount AS DOUBLE)) as total_value,
            NULL as year,
            NULL as month
        FROM filtered_data
        GROUP BY awardee_name
        ORDER BY total_value DESC
        LIMIT 20
        
        UNION ALL
        
        SELECT 
            'time_analytics' as type,
            NULL as contractor,
            COUNT(*) as count,
            SUM(CAST(contract_amount AS DOUBLE)) as total_value,
            EXTRACT(YEAR FROM award_date::DATE) as year,
            EXTRACT(MONTH FROM award_date::DATE) as month
        FROM filtered_data
        GROUP BY year, month
        ORDER BY year, month
    """).fetchall()
    time7 = time.time() - start
    print(f"   Combined query: {time7:.3f}s ({len(result7)} results)")
    
    # Test 5: Sampling approach for very large datasets
    print("\n5. Sampling Approach:")
    start = time.time()
    result8 = conn.execute(f"""
        SELECT 
            awardee_name as contractor,
            COUNT(*) * 10 as count,
            SUM(CAST(contract_amount AS DOUBLE)) * 10 as total_value
        FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet')
        WHERE ({contains_conditions})
        GROUP BY awardee_name
        ORDER BY total_value DESC
        LIMIT 20
    """).fetchall()
    time8 = time.time() - start
    print(f"   Sampling analytics: {time8:.3f}s ({len(result8)} results)")
    
    conn.close()
    
    # Summary
    print("\n=== Performance Summary ===")
    print(f"Original approach: {time1 + time2:.3f}s")
    print(f"Title-optimized: {time3 + time4:.3f}s ({((time1 + time2) - (time3 + time4)) / (time1 + time2) * 100:.1f}% improvement)")
    print(f"CONTAINS function: {time5 + time6:.3f}s ({((time1 + time2) - (time5 + time6)) / (time1 + time2) * 100:.1f}% improvement)")
    print(f"Combined query: {time7:.3f}s ({((time1 + time2) - time7) / (time1 + time2) * 100:.1f}% improvement)")
    print(f"Sampling approach: {time8:.3f}s ({((time1 + time2) - time8) / (time1 + time2) * 100:.1f}% improvement)")

def create_analytics_optimized_parquet():
    """Create a parquet file optimized specifically for analytics"""
    
    print("\n=== Creating Analytics-Optimized Parquet ===")
    
    conn = duckdb.connect()
    
    # Create a parquet file optimized for analytics queries
    print("Creating analytics-optimized parquet file...")
    
    start = time.time()
    conn.execute("""
    COPY (
        SELECT 
            -- Primary key
            contract_number,
            
            -- Grouping fields (most important for analytics)
            awardee_name,
            organization_name,
            business_category,
            area_of_delivery,
            
            -- Time fields for time-based analytics
            award_date,
            EXTRACT(YEAR FROM award_date::DATE) as award_year,
            EXTRACT(MONTH FROM award_date::DATE) as award_month,
            EXTRACT(QUARTER FROM award_date::DATE) as award_quarter,
            
            -- Value fields
            contract_amount,
            
            -- Search fields
            search_text,
            title_combined_lower,
            
            -- Other fields
            award_title,
            notice_title
        FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet')
        ORDER BY 
            awardee_name,
            award_date DESC,
            contract_amount DESC
    ) TO 'data/parquet/facts_awards_analytics_optimized.parquet' (FORMAT PARQUET)
    """)
    
    optimize_time = time.time() - start
    print(f"Analytics-optimized parquet created in {optimize_time:.3f}s")
    
    # Test the optimized file
    keywords = ['drainage', 'dike', 'flood']
    contains_conditions = ' OR '.join([f"CONTAINS(title_combined_lower, '{kw.lower()}')" for kw in keywords])
    
    start = time.time()
    result = conn.execute(f"""
        SELECT 
            awardee_name as contractor,
            COUNT(*) as count,
            SUM(CAST(contract_amount AS DOUBLE)) as total_value
        FROM read_parquet('data/parquet/facts_awards_analytics_optimized.parquet')
        WHERE ({contains_conditions})
        GROUP BY awardee_name
        ORDER BY total_value DESC
        LIMIT 20
    """).fetchall()
    test_time = time.time() - start
    print(f"Analytics-optimized search time: {test_time:.3f}s ({len(result)} results)")
    
    conn.close()

if __name__ == "__main__":
    test_analytics_optimizations()
    create_analytics_optimized_parquet()
