#!/usr/bin/env python3
"""
Regenerate optimized parquet files from the updated consolidated data
This ensures the dashboard shows the full 6.5M records instead of just 2.2M
"""

import duckdb
import os
import time
from datetime import datetime

def regenerate_facts_awards_all_time():
    """Regenerate facts_awards_all_time.parquet from consolidated data"""
    
    print("=== Regenerating facts_awards_all_time.parquet ===")
    
    consolidated_file = "data/processed/all_contracts_consolidated.parquet"
    output_file = "data/parquet/facts_awards_all_time.parquet"
    backup_file = f"data/parquet/facts_awards_all_time_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.parquet"
    
    if not os.path.exists(consolidated_file):
        print(f"❌ Consolidated file not found: {consolidated_file}")
        return False
    
    # Create backup of existing file
    if os.path.exists(output_file):
        print(f"📦 Creating backup: {backup_file}")
        os.rename(output_file, backup_file)
    
    conn = duckdb.connect()
    
    try:
        print("Generating facts_awards_all_time.parquet from consolidated data...")
        
        start = time.time()
        conn.execute(f"""
            COPY (
                SELECT 
                    award_date,
                    awardee_name,
                    business_category,
                    organization_name,
                    area_of_delivery,
                    contract_amount,
                    award_title,
                    notice_title,
                    contract_number,
                    search_text
                FROM read_parquet('{consolidated_file}')
                WHERE contract_amount IS NOT NULL
                AND TRY_CAST(contract_amount AS DOUBLE) IS NOT NULL
                AND TRY_CAST(contract_amount AS DOUBLE) > 0
            ) TO '{output_file}' (FORMAT PARQUET)
        """)
        
        generation_time = time.time() - start
        
        # Verify the output
        count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{output_file}')").fetchone()[0]
        file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
        
        print(f"✅ facts_awards_all_time.parquet regenerated:")
        print(f"   Records: {count:,}")
        print(f"   File size: {file_size:.1f} MB")
        print(f"   Generation time: {generation_time:.1f}s")
        
        return True
        
    except Exception as e:
        print(f"❌ Error regenerating facts_awards_all_time.parquet: {e}")
        return False
        
    finally:
        conn.close()

def regenerate_facts_awards_title_optimized():
    """Regenerate facts_awards_title_optimized.parquet from facts_awards_all_time.parquet"""
    
    print("\n=== Regenerating facts_awards_title_optimized.parquet ===")
    
    input_file = "data/parquet/facts_awards_all_time.parquet"
    output_file = "data/parquet/facts_awards_title_optimized.parquet"
    backup_file = f"data/parquet/facts_awards_title_optimized_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.parquet"
    
    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        return False
    
    # Create backup of existing file
    if os.path.exists(output_file):
        print(f"📦 Creating backup: {backup_file}")
        os.rename(output_file, backup_file)
    
    conn = duckdb.connect()
    
    try:
        print("Generating facts_awards_title_optimized.parquet...")
        
        start = time.time()
        conn.execute(f"""
            COPY (
                SELECT 
                    -- Primary fields
                    contract_number,
                    award_date,
                    contract_amount,
                    
                    -- Title fields optimized for search
                    award_title,
                    notice_title,
                    search_text,
                    
                    -- Pre-computed title search fields
                    LOWER(award_title) as award_title_lower,
                    LOWER(notice_title) as notice_title_lower,
                    LOWER(CONCAT(award_title, ' ', notice_title)) as title_combined_lower,
                    
                    -- Pre-computed word tokens for faster searching
                    string_split(LOWER(CONCAT(award_title, ' ', notice_title)), ' ') as title_words,
                    
                    -- Other fields
                    awardee_name,
                    organization_name,
                    business_category,
                    area_of_delivery
                FROM read_parquet('{input_file}')
                ORDER BY award_date DESC
            ) TO '{output_file}' (FORMAT PARQUET)
        """)
        
        generation_time = time.time() - start
        
        # Verify the output
        count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{output_file}')").fetchone()[0]
        file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
        
        print(f"✅ facts_awards_title_optimized.parquet regenerated:")
        print(f"   Records: {count:,}")
        print(f"   File size: {file_size:.1f} MB")
        print(f"   Generation time: {generation_time:.1f}s")
        
        return True
        
    except Exception as e:
        print(f"❌ Error regenerating facts_awards_title_optimized.parquet: {e}")
        return False
        
    finally:
        conn.close()

def test_dashboard_data():
    """Test that the dashboard will now see the full dataset"""
    
    print("\n=== Testing Dashboard Data ===")
    
    conn = duckdb.connect()
    
    try:
        # Test the optimized file
        count = conn.execute("SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet')").fetchone()[0]
        print(f"Dashboard will now see: {count:,} records")
        
        # Test year range
        year_range = conn.execute("""
            SELECT 
                MIN(EXTRACT(YEAR FROM award_date::DATE)) as min_year,
                MAX(EXTRACT(YEAR FROM award_date::DATE)) as max_year
            FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet')
            WHERE award_date IS NOT NULL
        """).fetchone()
        
        min_year, max_year = year_range
        print(f"Year range: {int(min_year)} - {int(max_year)}")
        
        # Test 2022-2025 data
        recent_count = conn.execute("""
            SELECT COUNT(*) 
            FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet')
            WHERE EXTRACT(YEAR FROM award_date::DATE) BETWEEN 2022 AND 2025
        """).fetchone()[0]
        
        print(f"2022-2025 records: {recent_count:,}")
        
        # Test search functionality
        search_count = conn.execute("""
            SELECT COUNT(*) 
            FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet')
            WHERE title_combined_lower LIKE '%construction%'
        """).fetchone()[0]
        
        print(f"Search test ('construction'): {search_count:,} results")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing dashboard data: {e}")
        return False
        
    finally:
        conn.close()

def main():
    """Main function to regenerate all optimized files"""
    
    print("=== Regenerating Optimized Files for Dashboard ===")
    print("This will update the dashboard to show the full 6.5M records")
    print()
    
    # Step 1: Regenerate facts_awards_all_time.parquet
    if not regenerate_facts_awards_all_time():
        print("❌ Failed to regenerate facts_awards_all_time.parquet")
        return False
    
    # Step 2: Regenerate facts_awards_title_optimized.parquet
    if not regenerate_facts_awards_title_optimized():
        print("❌ Failed to regenerate facts_awards_title_optimized.parquet")
        return False
    
    # Step 3: Test the results
    if not test_dashboard_data():
        print("❌ Dashboard data test failed")
        return False
    
    print("\n🎉 All optimized files regenerated successfully!")
    print("The dashboard should now show the full 6.5M records.")
    
    return True

if __name__ == "__main__":
    main()
