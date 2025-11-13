#!/usr/bin/env python3
"""
Rebuild all static data files from all-awarded-frontend-compressed.parquet

This script generates all necessary static data files for the PhilGEPS dashboard
from the new compressed all-awarded data source.

Source file schema:
- id, contract_no, award_title, notice_title, awardee_name, procuring_entity,
  area_of_delivery, business_category, contract_amount, published_date, 
  closing_date, award_date

Output files:
- agg_area.parquet
- agg_business_category.parquet
- agg_contractor.parquet
- agg_organization.parquet
- facts_awards_all_time.parquet
- facts_awards_title_optimized.parquet
"""

import duckdb
import pandas as pd
import os
from datetime import datetime
import shutil

# File paths
SOURCE_FILE = "data/all-awarded-frontend-compressed.parquet"
OUTPUT_DIR = "backend/django/static_data"
BACKUP_DIR = f"backend/django/static_data_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

def create_backup():
    """Create backup of existing static data"""
    if os.path.exists(OUTPUT_DIR) and any(f.endswith('.parquet') for f in os.listdir(OUTPUT_DIR)):
        print(f"📦 Creating backup: {BACKUP_DIR}")
        os.makedirs(BACKUP_DIR, exist_ok=True)
        for file in os.listdir(OUTPUT_DIR):
            if file.endswith('.parquet'):
                src = os.path.join(OUTPUT_DIR, file)
                dst = os.path.join(BACKUP_DIR, file)
                shutil.copy2(src, dst)
        print(f"✅ Backup created successfully")
    else:
        print("ℹ️  No existing files to backup")

def analyze_source_data(conn):
    """Analyze source data to understand content and quality"""
    print("\n=== Analyzing Source Data ===")
    
    # Basic stats
    stats = conn.execute(f"""
        SELECT 
            COUNT(*) as total_records,
            COUNT(DISTINCT awardee_name) as unique_contractors,
            COUNT(DISTINCT procuring_entity) as unique_organizations,
            COUNT(DISTINCT area_of_delivery) as unique_areas,
            COUNT(DISTINCT business_category) as unique_categories,
            MIN(award_date) as earliest_date,
            MAX(award_date) as latest_date,
            SUM(contract_amount) as total_value,
            AVG(contract_amount) as avg_value
        FROM read_parquet('{SOURCE_FILE}')
    """).fetchdf()
    
    print(f"\nTotal records: {stats['total_records'][0]:,}")
    print(f"Unique contractors: {stats['unique_contractors'][0]:,}")
    print(f"Unique organizations: {stats['unique_organizations'][0]:,}")
    print(f"Unique areas: {stats['unique_areas'][0]:,}")
    print(f"Unique business categories: {stats['unique_categories'][0]:,}")
    print(f"Date range: {stats['earliest_date'][0]} to {stats['latest_date'][0]}")
    print(f"Total contract value: ₱{stats['total_value'][0]:,.2f}")
    print(f"Average contract value: ₱{stats['avg_value'][0]:,.2f}")
    
    # Check for data quality issues
    print("\n=== Data Quality Checks ===")
    quality = conn.execute(f"""
        SELECT 
            COUNT(CASE WHEN awardee_name IS NULL THEN 1 END) as null_contractors,
            COUNT(CASE WHEN procuring_entity IS NULL THEN 1 END) as null_organizations,
            COUNT(CASE WHEN area_of_delivery IS NULL THEN 1 END) as null_areas,
            COUNT(CASE WHEN business_category IS NULL THEN 1 END) as null_categories,
            COUNT(CASE WHEN contract_amount IS NULL OR contract_amount <= 0 THEN 1 END) as invalid_amounts,
            COUNT(CASE WHEN award_date IS NULL THEN 1 END) as null_dates
        FROM read_parquet('{SOURCE_FILE}')
    """).fetchdf()
    
    print(f"Null contractors: {quality['null_contractors'][0]:,}")
    print(f"Null organizations: {quality['null_organizations'][0]:,}")
    print(f"Null areas: {quality['null_areas'][0]:,}")
    print(f"Null categories: {quality['null_categories'][0]:,}")
    print(f"Invalid amounts: {quality['invalid_amounts'][0]:,}")
    print(f"Null dates: {quality['null_dates'][0]:,}")

def generate_area_aggregations(conn):
    """Generate area aggregations"""
    print("\n=== Generating Area Aggregations ===")
    
    query = f"""
    SELECT 
        area_of_delivery as entity,
        COUNT(*) as contract_count,
        COUNT(DISTINCT business_category) as category_count,
        COUNT(DISTINCT awardee_name) as contractor_count,
        COUNT(DISTINCT procuring_entity) as organization_count,
        SUM(contract_amount) as total_contract_value,
        AVG(contract_amount) as average_contract_value,
        MIN(award_date) as first_contract_date,
        MAX(award_date) as last_contract_date
    FROM read_parquet('{SOURCE_FILE}')
    WHERE area_of_delivery IS NOT NULL
        AND contract_amount IS NOT NULL 
        AND contract_amount > 0
        AND awardee_name IS NOT NULL
        AND awardee_name != ''
    GROUP BY area_of_delivery
    ORDER BY total_contract_value DESC
    """
    
    output_file = os.path.join(OUTPUT_DIR, "agg_area.parquet")
    conn.execute(f"COPY ({query}) TO '{output_file}' (FORMAT PARQUET)")
    
    count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{output_file}')").fetchone()[0]
    print(f"✅ Generated {count:,} area aggregations")
    return count

def generate_business_category_aggregations(conn):
    """Generate business category aggregations"""
    print("\n=== Generating Business Category Aggregations ===")
    
    query = f"""
    SELECT 
        business_category as entity,
        COUNT(*) as contract_count,
        COUNT(DISTINCT area_of_delivery) as category_count,
        COUNT(DISTINCT awardee_name) as contractor_count,
        COUNT(DISTINCT procuring_entity) as organization_count,
        SUM(contract_amount) as total_contract_value,
        AVG(contract_amount) as average_contract_value,
        MIN(award_date) as first_contract_date,
        MAX(award_date) as last_contract_date
    FROM read_parquet('{SOURCE_FILE}')
    WHERE business_category IS NOT NULL
        AND contract_amount IS NOT NULL 
        AND contract_amount > 0
        AND awardee_name IS NOT NULL
        AND awardee_name != ''
    GROUP BY business_category
    ORDER BY total_contract_value DESC
    """
    
    output_file = os.path.join(OUTPUT_DIR, "agg_business_category.parquet")
    conn.execute(f"COPY ({query}) TO '{output_file}' (FORMAT PARQUET)")
    
    count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{output_file}')").fetchone()[0]
    print(f"✅ Generated {count:,} business category aggregations")
    return count

def generate_contractor_aggregations(conn):
    """Generate contractor aggregations"""
    print("\n=== Generating Contractor Aggregations ===")
    
    query = f"""
    SELECT 
        awardee_name as entity,
        COUNT(*) as contract_count,
        COUNT(DISTINCT business_category) as category_count,
        COUNT(DISTINCT area_of_delivery) as contractor_count,
        COUNT(DISTINCT procuring_entity) as organization_count,
        SUM(contract_amount) as total_contract_value,
        AVG(contract_amount) as average_contract_value,
        MIN(award_date) as first_contract_date,
        MAX(award_date) as last_contract_date
    FROM read_parquet('{SOURCE_FILE}')
    WHERE awardee_name IS NOT NULL
        AND awardee_name != ''
        AND contract_amount IS NOT NULL 
        AND contract_amount > 0
    GROUP BY awardee_name
    ORDER BY total_contract_value DESC
    """
    
    output_file = os.path.join(OUTPUT_DIR, "agg_contractor.parquet")
    conn.execute(f"COPY ({query}) TO '{output_file}' (FORMAT PARQUET)")
    
    count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{output_file}')").fetchone()[0]
    print(f"✅ Generated {count:,} contractor aggregations")
    return count

def generate_organization_aggregations(conn):
    """Generate organization aggregations"""
    print("\n=== Generating Organization Aggregations ===")
    
    query = f"""
    SELECT 
        procuring_entity as entity,
        COUNT(*) as contract_count,
        COUNT(DISTINCT business_category) as category_count,
        COUNT(DISTINCT awardee_name) as contractor_count,
        COUNT(DISTINCT area_of_delivery) as organization_count,
        SUM(contract_amount) as total_contract_value,
        AVG(contract_amount) as average_contract_value,
        MIN(award_date) as first_contract_date,
        MAX(award_date) as last_contract_date
    FROM read_parquet('{SOURCE_FILE}')
    WHERE procuring_entity IS NOT NULL
        AND contract_amount IS NOT NULL 
        AND contract_amount > 0
        AND awardee_name IS NOT NULL
        AND awardee_name != ''
    GROUP BY procuring_entity
    ORDER BY total_contract_value DESC
    """
    
    output_file = os.path.join(OUTPUT_DIR, "agg_organization.parquet")
    conn.execute(f"COPY ({query}) TO '{output_file}' (FORMAT PARQUET)")
    
    count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{output_file}')").fetchone()[0]
    print(f"✅ Generated {count:,} organization aggregations")
    return count

def generate_facts_all_time(conn):
    """Generate facts_awards_all_time.parquet with full schema"""
    print("\n=== Generating All-Time Facts ===")
    
    query = f"""
    SELECT 
        id,
        contract_no as contract_number,
        award_date,
        published_date,
        closing_date,
        contract_amount,
        award_title,
        notice_title,
        -- Search text for efficient filtering
        LOWER(COALESCE(award_title, '') || ' ' || COALESCE(notice_title, '')) as search_text,
        awardee_name,
        procuring_entity as organization_name,
        area_of_delivery,
        business_category,
        -- Additional computed fields for compatibility
        CAST(NULL AS VARCHAR) as award_status,
        CAST(NULL AS VARCHAR) as data_source,
        CAST(NULL AS VARCHAR) as procurement_mode,
        CAST(NULL AS VARCHAR) as funding_source,
        CAST(NULL AS INTEGER) as line_item_number,
        CAST(NULL AS VARCHAR) as project_location,
        CAST(NULL AS VARCHAR) as contractor_address,
        CAST(NULL AS VARCHAR) as source_system
    FROM read_parquet('{SOURCE_FILE}')
    WHERE contract_amount IS NOT NULL 
        AND contract_amount > 0
        AND awardee_name IS NOT NULL
        AND awardee_name != ''
    ORDER BY award_date DESC, contract_amount DESC
    """
    
    output_file = os.path.join(OUTPUT_DIR, "facts_awards_all_time.parquet")
    conn.execute(f"COPY ({query}) TO '{output_file}' (FORMAT PARQUET)")
    
    count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{output_file}')").fetchone()[0]
    file_size = os.path.getsize(output_file) / (1024 * 1024)
    print(f"✅ Generated {count:,} all-time facts ({file_size:.1f} MB)")
    return count

def generate_facts_title_optimized(conn):
    """Generate search-optimized facts with title processing"""
    print("\n=== Generating Title-Optimized Facts ===")
    
    query = f"""
    SELECT 
        contract_no as contract_number,
        award_date,
        contract_amount,
        award_title,
        notice_title,
        -- Combined search text
        COALESCE(award_title, '') || ' ' || COALESCE(notice_title, '') as search_text,
        -- Lowercase variants for case-insensitive search
        LOWER(COALESCE(award_title, '')) as award_title_lower,
        LOWER(COALESCE(notice_title, '')) as notice_title_lower,
        LOWER(COALESCE(award_title, '') || ' ' || COALESCE(notice_title, '')) as title_combined_lower,
        -- Tokenize into words (simplified - split on spaces)
        STRING_SPLIT(LOWER(COALESCE(award_title, '') || ' ' || COALESCE(notice_title, '')), ' ') as title_words,
        -- Entity information
        awardee_name,
        procuring_entity as organization_name,
        business_category,
        area_of_delivery
    FROM read_parquet('{SOURCE_FILE}')
    WHERE contract_amount IS NOT NULL 
        AND contract_amount > 0
        AND (award_title IS NOT NULL OR notice_title IS NOT NULL)
        AND awardee_name IS NOT NULL
        AND awardee_name != ''
    ORDER BY award_date DESC
    """
    
    output_file = os.path.join(OUTPUT_DIR, "facts_awards_title_optimized.parquet")
    conn.execute(f"COPY ({query}) TO '{output_file}' (FORMAT PARQUET)")
    
    count = conn.execute(f"SELECT COUNT(*) FROM read_parquet('{output_file}')").fetchone()[0]
    file_size = os.path.getsize(output_file) / (1024 * 1024)
    print(f"✅ Generated {count:,} title-optimized facts ({file_size:.1f} MB)")
    return count

def verify_generated_files():
    """Verify all generated files"""
    print("\n=== Verifying Generated Files ===")
    
    expected_files = [
        "agg_area.parquet",
        "agg_business_category.parquet",
        "agg_contractor.parquet",
        "agg_organization.parquet",
        "facts_awards_all_time.parquet",
        "facts_awards_title_optimized.parquet"
    ]
    
    all_exist = True
    for filename in expected_files:
        filepath = os.path.join(OUTPUT_DIR, filename)
        if os.path.exists(filepath):
            size_mb = os.path.getsize(filepath) / (1024 * 1024)
            print(f"✅ {filename:40s} - {size_mb:>8.1f} MB")
        else:
            print(f"❌ {filename:40s} - MISSING")
            all_exist = False
    
    return all_exist

def main():
    """Main function to rebuild all static data"""
    print("=" * 70)
    print("REBUILD STATIC DATA FROM COMPRESSED SOURCE")
    print("=" * 70)
    
    # Check source file exists
    if not os.path.exists(SOURCE_FILE):
        print(f"❌ Source file not found: {SOURCE_FILE}")
        return False
    
    # Show source file info
    source_size = os.path.getsize(SOURCE_FILE) / (1024 * 1024)
    print(f"\n📁 Source file: {SOURCE_FILE}")
    print(f"📊 File size: {source_size:.1f} MB")
    
    # Create output directory if needed
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Create backup
    create_backup()
    
    # Connect to DuckDB
    conn = duckdb.connect()
    
    try:
        # Analyze source data
        analyze_source_data(conn)
        
        # Generate all static data files
        print("\n" + "=" * 70)
        print("GENERATING STATIC DATA FILES")
        print("=" * 70)
        
        area_count = generate_area_aggregations(conn)
        category_count = generate_business_category_aggregations(conn)
        contractor_count = generate_contractor_aggregations(conn)
        org_count = generate_organization_aggregations(conn)
        facts_count = generate_facts_all_time(conn)
        title_count = generate_facts_title_optimized(conn)
        
        # Verify all files
        print("\n" + "=" * 70)
        if verify_generated_files():
            print("\n✅ All static data files generated successfully!")
            print(f"\n📊 Summary:")
            print(f"  - Areas: {area_count:,}")
            print(f"  - Business Categories: {category_count:,}")
            print(f"  - Contractors: {contractor_count:,}")
            print(f"  - Organizations: {org_count:,}")
            print(f"  - All-time Facts: {facts_count:,}")
            print(f"  - Title-optimized Facts: {title_count:,}")
            print(f"\n📁 Output directory: {OUTPUT_DIR}")
            if os.path.exists(BACKUP_DIR):
                print(f"📦 Backup directory: {BACKUP_DIR}")
            return True
        else:
            print("\n❌ Some files are missing - generation incomplete")
            return False
            
    except Exception as e:
        print(f"\n❌ Error during generation: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
