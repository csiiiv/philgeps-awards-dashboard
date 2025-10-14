#!/usr/bin/env python3
"""
Fix date formatting issues in the consolidated data
Convert Excel serial dates to proper date format
"""

import duckdb
import os
from datetime import datetime, timedelta

def fix_date_formats():
    """Fix date formatting issues in the consolidated data"""
    
    print("=== Fixing Date Format Issues ===")
    
    input_file = "data/processed/all_contracts_consolidated.parquet"
    output_file = "data/processed/all_contracts_consolidated_fixed.parquet"
    backup_file = f"data/processed/all_contracts_consolidated_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.parquet"
    
    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        return False
    
    # Create backup
    print(f"📦 Creating backup: {backup_file}")
    os.rename(input_file, backup_file)
    
    conn = duckdb.connect()
    
    try:
        print("Processing date conversions...")
        
        # Create fixed dataset with proper date conversions
        conn.execute(f"""
            CREATE OR REPLACE TABLE temp_fixed AS
            SELECT 
                reference_id,
                organization_name,
                solicitation_number,
                notice_title,
                notice_type,
                classification,
                procurement_mode,
                business_category,
                funding_source,
                funding_instrument,
                trade_agreement,
                approved_budget,
                -- Fix publish_date
                CASE 
                    WHEN publish_date IS NULL OR publish_date = '' THEN NULL
                    WHEN TRY_CAST(publish_date AS DATE) IS NOT NULL THEN publish_date
                    WHEN TRY_CAST(publish_date AS DOUBLE) IS NOT NULL AND TRY_CAST(publish_date AS DOUBLE) > 1000 THEN
                        CAST(DATE '1899-12-30' + INTERVAL (TRY_CAST(publish_date AS DOUBLE)) DAY AS VARCHAR)
                    ELSE NULL
                END as publish_date,
                -- Fix closing_date
                CASE 
                    WHEN closing_date IS NULL OR closing_date = '' THEN NULL
                    WHEN TRY_CAST(closing_date AS DATE) IS NOT NULL THEN closing_date
                    WHEN TRY_CAST(closing_date AS DOUBLE) IS NOT NULL AND TRY_CAST(closing_date AS DOUBLE) > 1000 THEN
                        CAST(DATE '1899-12-30' + INTERVAL (TRY_CAST(closing_date AS DOUBLE)) DAY AS VARCHAR)
                    ELSE NULL
                END as closing_date,
                -- Fix prebid_date
                CASE 
                    WHEN prebid_date IS NULL OR prebid_date = '' THEN NULL
                    WHEN TRY_CAST(prebid_date AS DATE) IS NOT NULL THEN prebid_date
                    WHEN TRY_CAST(prebid_date AS DOUBLE) IS NOT NULL AND TRY_CAST(prebid_date AS DOUBLE) > 1000 THEN
                        CAST(DATE '1899-12-30' + INTERVAL (TRY_CAST(prebid_date AS DOUBLE)) DAY AS VARCHAR)
                    ELSE NULL
                END as prebid_date,
                area_of_delivery,
                contract_duration,
                calendar_type,
                line_item_number,
                item_name,
                item_description,
                quantity,
                unit_of_measurement,
                item_budget,
                notice_status,
                award_number,
                award_title,
                award_type,
                unspsc_code,
                unspsc_description,
                -- Fix award_publish_date
                CASE 
                    WHEN award_publish_date IS NULL OR award_publish_date = '' THEN NULL
                    WHEN TRY_CAST(award_publish_date AS DATE) IS NOT NULL THEN award_publish_date
                    WHEN TRY_CAST(award_publish_date AS DOUBLE) IS NOT NULL AND TRY_CAST(award_publish_date AS DOUBLE) > 1000 THEN
                        CAST(DATE '1899-12-30' + INTERVAL (TRY_CAST(award_publish_date AS DOUBLE)) DAY AS VARCHAR)
                    ELSE NULL
                END as award_publish_date,
                -- Fix award_date
                CASE 
                    WHEN award_date IS NULL OR award_date = '' THEN NULL
                    WHEN TRY_CAST(award_date AS DATE) IS NOT NULL THEN award_date
                    WHEN TRY_CAST(award_date AS DOUBLE) IS NOT NULL AND TRY_CAST(award_date AS DOUBLE) > 1000 THEN
                        CAST(DATE '1899-12-30' + INTERVAL (TRY_CAST(award_date AS DOUBLE)) DAY AS VARCHAR)
                    ELSE NULL
                END as award_date,
                -- Fix notice_to_proceed_date
                CASE 
                    WHEN notice_to_proceed_date IS NULL OR notice_to_proceed_date = '' THEN NULL
                    WHEN TRY_CAST(notice_to_proceed_date AS DATE) IS NOT NULL THEN notice_to_proceed_date
                    WHEN TRY_CAST(notice_to_proceed_date AS DOUBLE) IS NOT NULL AND TRY_CAST(notice_to_proceed_date AS DOUBLE) > 1000 THEN
                        CAST(DATE '1899-12-30' + INTERVAL (TRY_CAST(notice_to_proceed_date AS DOUBLE)) DAY AS VARCHAR)
                    ELSE NULL
                END as notice_to_proceed_date,
                contract_number,
                contract_amount,
                -- Fix contract_effectivity_date
                CASE 
                    WHEN contract_effectivity_date IS NULL OR contract_effectivity_date = '' THEN NULL
                    WHEN TRY_CAST(contract_effectivity_date AS DATE) IS NOT NULL THEN contract_effectivity_date
                    WHEN TRY_CAST(contract_effectivity_date AS DOUBLE) IS NOT NULL AND TRY_CAST(contract_effectivity_date AS DOUBLE) > 1000 THEN
                        CAST(DATE '1899-12-30' + INTERVAL (TRY_CAST(contract_effectivity_date AS DOUBLE)) DAY AS VARCHAR)
                    ELSE NULL
                END as contract_effectivity_date,
                -- Fix contract_end_date
                CASE 
                    WHEN contract_end_date IS NULL OR contract_end_date = '' THEN NULL
                    WHEN TRY_CAST(contract_end_date AS DATE) IS NOT NULL THEN contract_end_date
                    WHEN TRY_CAST(contract_end_date AS DOUBLE) IS NOT NULL AND TRY_CAST(contract_end_date AS DOUBLE) > 1000 THEN
                        CAST(DATE '1899-12-30' + INTERVAL (TRY_CAST(contract_end_date AS DOUBLE)) DAY AS VARCHAR)
                    ELSE NULL
                END as contract_end_date,
                award_status,
                reason_for_award,
                awardee_name,
                unique_reference_id,
                row_id,
                period,
                source_file,
                data_source,
                processed_date,
                search_text,
                created_by,
                awardee_contact_person,
                list_of_bidders
            FROM read_parquet('{backup_file}')
        """)
        
        # Export to parquet
        print("Exporting fixed data...")
        conn.execute(f"COPY temp_fixed TO '{output_file}' (FORMAT PARQUET)")
        
        # Verify the output
        count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{output_file}')").fetchone()[0]
        file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
        
        print(f"✅ Fixed data created:")
        print(f"   Records: {count:,}")
        print(f"   File size: {file_size:.1f} MB")
        
        # Check date conversion results
        print("\n=== Date Conversion Results ===")
        
        # Check award_date conversion
        date_results = conn.execute(f"""
            SELECT 
                CASE 
                    WHEN award_date IS NULL THEN 'NULL'
                    WHEN award_date = '' THEN 'Empty String'
                    WHEN TRY_CAST(award_date AS DATE) IS NOT NULL THEN 'Valid Date'
                    ELSE 'Still Invalid'
                END as date_status,
                COUNT(*) as count
            FROM read_parquet('{output_file}')
            GROUP BY 1
            ORDER BY count DESC
        """).fetchall()
        
        print("Award Date Status:")
        for status, count in date_results:
            print(f"   {status}: {count:,}")
        
        # Show some converted dates
        print("\nSample Converted Dates:")
        sample_dates = conn.execute(f"""
            SELECT award_date, organization_name, award_title
            FROM read_parquet('{output_file}')
            WHERE award_date IS NOT NULL 
            AND TRY_CAST(award_date AS DATE) IS NOT NULL
            ORDER BY award_date DESC
            LIMIT 5
        """).fetchall()
        
        for date_val, org, title in sample_dates:
            title_short = str(title)[:30] if title else 'N/A'
            print(f"   {date_val} - {org}: {title_short}...")
        
        # Replace original file
        print(f"\n📁 Replacing original file...")
        os.rename(output_file, input_file)
        
        print(f"✅ Date formatting fixed successfully!")
        print(f"📦 Backup saved as: {backup_file}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error fixing dates: {e}")
        # Restore backup if there was an error
        if os.path.exists(backup_file):
            os.rename(backup_file, input_file)
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    fix_date_formats()
