#!/usr/bin/env python3
"""
Generate clean awarded contracts file from the updated consolidated data
This creates a clean master file for generating aggregations
"""

import duckdb
import pandas as pd
import os
from datetime import datetime

def generate_clean_awarded_contracts():
    """Generate clean awarded contracts from consolidated data"""
    
    print("=== Generating Clean Awarded Contracts ===")
    
    # File paths
    consolidated_file = "data/processed/all_contracts_consolidated.parquet"
    output_file = "data/processed/clean_awarded_contracts_complete.parquet"
    backup_file = f"data/processed/clean_awarded_contracts_complete_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.parquet"
    
    # Check if consolidated file exists
    if not os.path.exists(consolidated_file):
        print(f"❌ Consolidated file not found: {consolidated_file}")
        return False
    
    # Create backup of existing file if it exists
    if os.path.exists(output_file):
        print(f"📦 Creating backup: {backup_file}")
        os.rename(output_file, backup_file)
    
    print(f"📊 Processing consolidated data from: {consolidated_file}")
    
    # Connect to DuckDB
    conn = duckdb.connect()
    
    try:
        # First, let's see what we have in the consolidated file
        print("\n=== Analyzing Consolidated Data ===")
        
        # Check total records
        total_count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{consolidated_file}')").fetchone()[0]
        print(f"Total records in consolidated file: {total_count:,}")
        
        # Check records by data source
        data_sources = conn.execute(f"""
            SELECT data_source, COUNT(*) as count 
            FROM read_parquet('{consolidated_file}') 
            GROUP BY data_source 
            ORDER BY count DESC
        """).fetchall()
        
        print("\nRecords by data source:")
        for source, count in data_sources:
            print(f"  - {source}: {count:,}")
        
        # Check award status distribution
        award_status = conn.execute(f"""
            SELECT award_status, COUNT(*) as count 
            FROM read_parquet('{consolidated_file}') 
            WHERE award_status IS NOT NULL
            GROUP BY award_status 
            ORDER BY count DESC
        """).fetchall()
        
        print("\nAward status distribution:")
        for status, count in award_status:
            print(f"  - {status}: {count:,}")
        
        # Generate clean awarded contracts
        print(f"\n=== Generating Clean Awarded Contracts ===")
        
        # Filter for awarded contracts only (contracts with amounts > 0)
        clean_query = f"""
        SELECT *
        FROM read_parquet('{consolidated_file}')
        WHERE contract_amount IS NOT NULL
        AND TRY_CAST(contract_amount AS DOUBLE) IS NOT NULL
        AND TRY_CAST(contract_amount AS DOUBLE) > 0
        """
        
        # Execute query and save
        print("Filtering for awarded contracts only...")
        conn.execute(f"COPY ({clean_query}) TO '{output_file}' (FORMAT PARQUET)")
        
        # Verify the output
        clean_count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{output_file}')").fetchone()[0]
        print(f"✅ Clean awarded contracts generated: {clean_count:,} records")
        
        # Check file size
        file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
        print(f"📁 File size: {file_size:.1f} MB")
        
        # Show sample of the data
        print(f"\n=== Sample Data ===")
        sample = conn.execute(f"""
            SELECT organization_name, award_title, contract_amount, award_date, data_source
            FROM read_parquet('{output_file}')
            ORDER BY contract_amount DESC
            LIMIT 5
        """).fetchall()
        
        for row in sample:
            org, title, amount, date, source = row
            title_short = str(title)[:50] if title else "N/A"
            try:
                amount_str = f"{float(amount):,.0f}" if amount else "N/A"
            except:
                amount_str = str(amount) if amount else "N/A"
            print(f"  - {org}: {title_short}... (${amount_str}) - {date} [{source}]")
        
        print(f"\n✅ Clean awarded contracts file generated successfully!")
        print(f"📁 Output file: {output_file}")
        print(f"📦 Backup file: {backup_file}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error generating clean awarded contracts: {e}")
        return False
        
    finally:
        conn.close()

def verify_clean_file():
    """Verify the generated clean file"""
    
    print("\n=== Verifying Clean File ===")
    
    clean_file = "data/processed/clean_awarded_contracts_complete.parquet"
    
    if not os.path.exists(clean_file):
        print(f"❌ Clean file not found: {clean_file}")
        return False
    
    conn = duckdb.connect()
    
    try:
        # Check record count
        count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{clean_file}')").fetchone()[0]
        print(f"✅ Record count: {count:,}")
        
        # Check columns
        columns = conn.execute(f"DESCRIBE read_parquet('{clean_file}')").fetchall()
        print(f"✅ Column count: {len(columns)}")
        
        # Check data quality
        null_counts = conn.execute(f"""
            SELECT 
                COUNT(*) as total,
                COUNT(organization_name) as org_name_count,
                COUNT(award_title) as award_title_count,
                COUNT(contract_amount) as contract_amount_count,
                COUNT(award_date) as award_date_count
            FROM read_parquet('{clean_file}')
        """).fetchone()
        
        total, org, title, amount, date = null_counts
        print(f"✅ Data quality:")
        print(f"   - Organization Name: {org:,}/{total:,} ({org/total*100:.1f}%)")
        print(f"   - Award Title: {title:,}/{total:,} ({title/total*100:.1f}%)")
        print(f"   - Contract Amount: {amount:,}/{total:,} ({amount/total*100:.1f}%)")
        print(f"   - Award Date: {date:,}/{total:,} ({date/total*100:.1f}%)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verifying clean file: {e}")
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    print("=== Clean Awarded Contracts Generator ===")
    print("This script generates a clean awarded contracts file from the consolidated data")
    print("This file is needed before generating aggregations")
    print()
    
    # Generate clean file
    if generate_clean_awarded_contracts():
        # Verify the file
        verify_clean_file()
        print("\n🎉 Clean awarded contracts file ready for aggregation generation!")
    else:
        print("\n❌ Failed to generate clean awarded contracts file")
