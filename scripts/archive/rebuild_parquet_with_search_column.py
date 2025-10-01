#!/usr/bin/env python3
"""
Script to rebuild parquet files with a pre-computed search column for better keyword search performance.

This script:
1. Reads existing parquet files
2. Adds a 'search_text' column that concatenates all searchable fields
3. Rebuilds the parquet files with the new column
4. Creates backups of original files
"""

import os
import pandas as pd
import duckdb
import shutil
from datetime import datetime
import glob

def backup_original_files(data_dir):
    """Create backup of original parquet files"""
    backup_dir = os.path.join(data_dir, 'backup', datetime.now().strftime('%Y%m%d_%H%M%S'))
    os.makedirs(backup_dir, exist_ok=True)
    
    parquet_files = glob.glob(os.path.join(data_dir, 'facts_awards_*.parquet'))
    for file_path in parquet_files:
        filename = os.path.basename(file_path)
        backup_path = os.path.join(backup_dir, filename)
        print(f"Backing up {filename} to {backup_path}")
        shutil.copy2(file_path, backup_path)
    
    return backup_dir

def add_search_column(df):
    """Add search_text column to dataframe"""
    # Create search_text column by concatenating all searchable fields
    # Use COALESCE to handle NULL values and add spaces for word boundaries
    search_fields = [
        'award_title',
        'notice_title', 
        'awardee_name',
        'organization_name',
        'business_category',
        'area_of_delivery'
    ]
    
    # Concatenate all searchable fields with spaces
    df['search_text'] = df[search_fields].fillna('').apply(
        lambda row: ' '.join(str(val) for val in row if val), axis=1
    )
    
    # Convert to lowercase for case-insensitive searching
    df['search_text'] = df['search_text'].str.lower()
    
    return df

def rebuild_parquet_file(input_path, output_path, conn):
    """Rebuild a single parquet file with search column"""
    print(f"Processing {os.path.basename(input_path)}...")
    
    # Read the parquet file
    df = conn.execute(f"SELECT * FROM read_parquet('{input_path}')").df()
    print(f"  Loaded {len(df):,} rows")
    
    # Add search column
    df = add_search_column(df)
    print(f"  Added search_text column")
    
    # Write back to parquet
    df.to_parquet(output_path, index=False)
    print(f"  Saved to {output_path}")
    
    # Verify the new file
    new_df = conn.execute(f"SELECT COUNT(*) as count FROM read_parquet('{output_path}')").fetchone()
    print(f"  Verified: {new_df[0]:,} rows in new file")
    
    return len(df)

def main():
    # Set up paths
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(project_root, 'data', 'parquet')
    
    print("=== Parquet Rebuild with Search Column ===")
    print(f"Data directory: {data_dir}")
    
    # Create backup
    print("\n1. Creating backup of original files...")
    backup_dir = backup_original_files(data_dir)
    print(f"Backup created at: {backup_dir}")
    
    # Connect to DuckDB
    conn = duckdb.connect()
    
    # Process all facts_awards parquet files
    parquet_files = glob.glob(os.path.join(data_dir, 'facts_awards_*.parquet'))
    total_rows = 0
    
    print(f"\n2. Processing {len(parquet_files)} parquet files...")
    
    for file_path in parquet_files:
        filename = os.path.basename(file_path)
        temp_path = file_path + '.tmp'
        
        try:
            rows = rebuild_parquet_file(file_path, temp_path, conn)
            total_rows += rows
            
            # Replace original with new file
            shutil.move(temp_path, file_path)
            print(f"  ✓ Successfully rebuilt {filename}")
            
        except Exception as e:
            print(f"  ✗ Error processing {filename}: {e}")
            # Clean up temp file if it exists
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    print(f"\n3. Summary:")
    print(f"  Total rows processed: {total_rows:,}")
    print(f"  Files processed: {len(parquet_files)}")
    print(f"  Backup location: {backup_dir}")
    
    # Test the new search performance
    print(f"\n4. Testing new search column...")
    test_query = """
    SELECT COUNT(*) as count 
    FROM read_parquet('data/parquet/facts_awards_all_time.parquet') 
    WHERE search_text LIKE '%construction%'
    """
    result = conn.execute(test_query).fetchone()
    print(f"  Test search for 'construction': {result[0]:,} results")
    
    conn.close()
    print("\n✅ Rebuild complete!")

if __name__ == "__main__":
    main()
