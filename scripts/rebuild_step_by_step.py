#!/usr/bin/env python3
"""
Step-by-step rebuild of complete consolidated data
"""

import duckdb
import os
import glob
from datetime import datetime

def step1_create_2013_2020_data():
    """Step 1: Create 2013-2020 data from backup quarterly files"""
    
    print("=== STEP 1: Creating 2013-2020 Data ===")
    
    backup_dir = "data/processed/backup_quarterly_raw_20251001_231830"
    output_file = "data/processed/step1_2013_2020.parquet"
    
    if not os.path.exists(backup_dir):
        print(f"❌ Backup directory not found: {backup_dir}")
        return False
    
    # Get all quarterly files
    quarterly_files = glob.glob(os.path.join(backup_dir, "*_Q*_contracts.parquet"))
    quarterly_files.sort()
    
    print(f"Found {len(quarterly_files)} quarterly files")
    
    conn = duckdb.connect()
    
    try:
        # Process files in smaller batches to avoid memory issues
        print("Processing quarterly files in batches...")
        
        # Create union query for all quarterly files
        union_queries = []
        for file_path in quarterly_files:
            union_queries.append(f"SELECT * FROM read_parquet('{file_path}')")
        
        union_query = " UNION ALL ".join(union_queries)
        
        # Add system fields
        print("Adding system fields...")
        conn.execute(f"""
            CREATE OR REPLACE TABLE temp_2013_2020 AS
            SELECT 
                *,
                'PHILGEPS_XLSX' as data_source,
                CURRENT_TIMESTAMP as processed_date,
                CONCAT(COALESCE(award_title, ''), ' ', COALESCE(notice_title, '')) as search_text
            FROM ({union_query})
        """)
        
        # Export to parquet
        print("Exporting to parquet...")
        conn.execute(f"COPY temp_2013_2020 TO '{output_file}' (FORMAT PARQUET)")
        
        # Verify the output
        count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{output_file}')").fetchone()[0]
        file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
        
        print(f"✅ Step 1 completed:")
        print(f"   Records: {count:,}")
        print(f"   File size: {file_size:.1f} MB")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in step 1: {e}")
        return False
        
    finally:
        conn.close()

def step2_create_2021_2025_data():
    """Step 2: Create 2021-2025 data from CSV files"""
    
    print("\n=== STEP 2: Creating 2021-2025 Data ===")
    
    csv_dir = "data/raw/PHILGEPS -- 2021-2025 (CSV)"
    output_file = "data/processed/step2_2021_2025.parquet"
    
    if not os.path.exists(csv_dir):
        print(f"❌ CSV directory not found: {csv_dir}")
        return False
    
    # Get all CSV files
    csv_files = glob.glob(os.path.join(csv_dir, "*.csv"))
    csv_files.sort()
    
    print(f"Found {len(csv_files)} CSV files")
    
    conn = duckdb.connect()
    
    try:
        # Process each CSV file individually to avoid memory issues
        print("Processing CSV files...")
        
        # Create union query for all CSV files
        union_queries = []
        for file_path in csv_files:
            # Extract year from filename
            filename = os.path.basename(file_path)
            year = filename.split('.')[0]
            union_queries.append(f"""
                SELECT 
                    \"Bid Reference No.\" as reference_id,
                    \"Procuring Entity\" as organization_name,
                    \"Solicitation No.\" as solicitation_number,
                    \"Notice Title\" as notice_title,
                    \"Notice Type\" as notice_type,
                    \"Classification\" as classification,
                    \"Procurement Mode\" as procurement_mode,
                    \"Business Category\" as business_category,
                    \"Funding Source\" as funding_source,
                    \"Funding Instrument\" as funding_instrument,
                    \"Trade Agreement\" as trade_agreement,
                    \"Approved Budget of the Contract\" as approved_budget,
                    \"Published Date\" as publish_date,
                    \"Closing Date\" as closing_date,
                    \"PreBid Date\" as prebid_date,
                    \"Area of Delivery\" as area_of_delivery,
                    \"Contract Duration\" as contract_duration,
                    \"Calendar Type\" as calendar_type,
                    \"Line Item No\" as line_item_number,
                    \"Item Name\" as item_name,
                    \"Item Description\" as item_description,
                    \"Quantity\" as quantity,
                    \"UOM\" as unit_of_measurement,
                    \"Item Budget\" as item_budget,
                    \"Notice Status\" as notice_status,
                    \"Award No.\" as award_number,
                    \"Award Title\" as award_title,
                    \"Award Type\" as award_type,
                    \"UNSPSC Code\" as unspsc_code,
                    \"UNSPSC Description\" as unspsc_description,
                    \"Published Date(Award)\" as award_publish_date,
                    \"Award Date\" as award_date,
                    \"Notice to Proceed Date\" as notice_to_proceed_date,
                    \"Contract No\" as contract_number,
                    \"Contract Amount\" as contract_amount,
                    \"Contract Efectivity Date\" as contract_effectivity_date,
                    \"Contract End Date\" as contract_end_date,
                    \"Award Status\" as award_status,
                    \"Reason for Award\" as reason_for_award,
                    \"Awardee Organization Name\" as awardee_name,
                    \"Created By\" as created_by,
                    \"Awardee Contact Person\" as awardee_contact_person,
                    \"List of Bidder's\" as list_of_bidders,
                    CONCAT(COALESCE(\"Bid Reference No.\", ''), '_', COALESCE(\"Contract No\", '')) as unique_reference_id,
                    {year} as data_year,
                    'PHILGEPS_CSV' as data_source,
                    CURRENT_TIMESTAMP as processed_date,
                    CONCAT(COALESCE(\"Award Title\", ''), ' ', COALESCE(\"Notice Title\", '')) as search_text
                FROM read_csv('{file_path}', header=true, nullstr='NULL', ignore_errors=true)
            """)
        
        union_query = " UNION ALL ".join(union_queries)
        
        print("Creating 2021-2025 data...")
        conn.execute(f"""
            CREATE OR REPLACE TABLE temp_2021_2025 AS
            {union_query}
        """)
        
        # Export to parquet
        print("Exporting to parquet...")
        conn.execute(f"COPY temp_2021_2025 TO '{output_file}' (FORMAT PARQUET)")
        
        # Verify the output
        count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{output_file}')").fetchone()[0]
        file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
        
        print(f"✅ Step 2 completed:")
        print(f"   Records: {count:,}")
        print(f"   File size: {file_size:.1f} MB")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in step 2: {e}")
        return False
        
    finally:
        conn.close()

def step3_combine_data():
    """Step 3: Combine both datasets"""
    
    print("\n=== STEP 3: Combining Data ===")
    
    file_2013_2020 = "data/processed/step1_2013_2020.parquet"
    file_2021_2025 = "data/processed/step2_2021_2025.parquet"
    output_file = "data/processed/all_contracts_consolidated.parquet"
    backup_file = f"data/processed/all_contracts_consolidated_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.parquet"
    
    if not os.path.exists(file_2013_2020) or not os.path.exists(file_2021_2025):
        print("❌ Missing step files")
        return False
    
    # Create backup of existing file
    if os.path.exists(output_file):
        print(f"📦 Creating backup: {backup_file}")
        os.rename(output_file, backup_file)
    
    conn = duckdb.connect()
    
    try:
        print("Combining datasets...")
        
        # Create combined dataset with proper column alignment
        conn.execute(f"""
            CREATE OR REPLACE TABLE temp_combined AS
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
                publish_date,
                closing_date,
                prebid_date,
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
                award_publish_date,
                award_date,
                notice_to_proceed_date,
                contract_number,
                contract_amount,
                contract_effectivity_date,
                contract_end_date,
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
                NULL as created_by,
                NULL as awardee_contact_person,
                NULL as list_of_bidders
            FROM read_parquet('{file_2013_2020}')
            UNION ALL
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
                publish_date,
                closing_date,
                prebid_date,
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
                award_publish_date,
                award_date,
                notice_to_proceed_date,
                contract_number,
                contract_amount,
                contract_effectivity_date,
                contract_end_date,
                award_status,
                reason_for_award,
                awardee_name,
                unique_reference_id,
                NULL as row_id,
                NULL as period,
                NULL as source_file,
                data_source,
                processed_date,
                search_text,
                created_by,
                awardee_contact_person,
                list_of_bidders
            FROM read_parquet('{file_2021_2025}')
        """)
        
        # Export to parquet
        print("Exporting combined data...")
        conn.execute(f"COPY temp_combined TO '{output_file}' (FORMAT PARQUET)")
        
        # Verify the output
        count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{output_file}')").fetchone()[0]
        file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
        
        print(f"✅ Step 3 completed:")
        print(f"   Records: {count:,}")
        print(f"   File size: {file_size:.1f} MB")
        
        # Check records by data source
        print("\nRecords by data source:")
        yearly_data = conn.execute(f"""
            SELECT 
                data_source,
                COUNT(*) as count
            FROM read_parquet('{output_file}')
            GROUP BY data_source
            ORDER BY data_source
        """).fetchall()
        
        for source, count in yearly_data:
            print(f"  {source}: {count:,}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in step 3: {e}")
        return False
        
    finally:
        conn.close()

def step4_cleanup():
    """Step 4: Clean up temporary files"""
    
    print("\n=== STEP 4: Cleanup ===")
    
    temp_files = [
        "data/processed/step1_2013_2020.parquet",
        "data/processed/step2_2021_2025.parquet"
    ]
    
    for file_path in temp_files:
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path) / (1024 * 1024)
            os.remove(file_path)
            print(f"✅ Removed {file_path} ({file_size:.1f} MB)")
    
    print("Cleanup completed")

def main():
    """Main function to rebuild complete consolidated data step by step"""
    
    print("=== STEP-BY-STEP DATA REBUILD ===")
    print("This will create a complete dataset from 2013-2025")
    print()
    
    # Step 1: Create 2013-2020 data
    if not step1_create_2013_2020_data():
        print("❌ Failed at step 1")
        return False
    
    # Step 2: Create 2021-2025 data
    if not step2_create_2021_2025_data():
        print("❌ Failed at step 2")
        return False
    
    # Step 3: Combine data
    if not step3_combine_data():
        print("❌ Failed at step 3")
        return False
    
    # Step 4: Cleanup
    step4_cleanup()
    
    print("\n🎉 Complete consolidated data created successfully!")
    print("The dashboard should now show data from 2013-2025")
    
    return True

if __name__ == "__main__":
    main()

