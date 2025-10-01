#!/usr/bin/env python3
"""
Cleanup script for quarterly raw data files in data/processed/
These files are no longer needed as the data has been consolidated into all_contracts_consolidated.parquet
"""

import os
import glob
import shutil
from datetime import datetime

def cleanup_quarterly_raw_files():
    """Clean up quarterly raw data files that are no longer needed"""
    
    print("=== Quarterly Raw Data Files Cleanup ===")
    
    # Define the processed directory
    processed_dir = 'data/processed'
    
    if not os.path.exists(processed_dir):
        print(f"❌ Processed directory not found: {processed_dir}")
        return
    
    # Pattern for quarterly files: YYYY_QN_contracts.parquet
    quarterly_pattern = os.path.join(processed_dir, '*_Q*_contracts.parquet')
    quarterly_files = glob.glob(quarterly_pattern)
    
    if not quarterly_files:
        print("✅ No quarterly raw data files found to clean up")
        return
    
    print(f"Found {len(quarterly_files)} quarterly raw data files:")
    for file in sorted(quarterly_files):
        file_size = os.path.getsize(file) / (1024 * 1024)  # MB
        print(f"  - {os.path.basename(file)} ({file_size:.1f} MB)")
    
    # Calculate total size
    total_size = sum(os.path.getsize(f) for f in quarterly_files) / (1024 * 1024)  # MB
    print(f"\nTotal size to be freed: {total_size:.1f} MB")
    
    # Create backup directory
    backup_dir = os.path.join(processed_dir, 'backup_quarterly_raw')
    backup_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{backup_dir}_{backup_timestamp}"
    
    print(f"\nCreating backup in: {backup_path}")
    os.makedirs(backup_path, exist_ok=True)
    
    # Move files to backup instead of deleting
    moved_count = 0
    for file_path in quarterly_files:
        filename = os.path.basename(file_path)
        backup_file_path = os.path.join(backup_path, filename)
        
        try:
            shutil.move(file_path, backup_file_path)
            moved_count += 1
            print(f"  ✅ Moved: {filename}")
        except Exception as e:
            print(f"  ❌ Error moving {filename}: {e}")
    
    print(f"\n=== Cleanup Summary ===")
    print(f"✅ Files moved to backup: {moved_count}/{len(quarterly_files)}")
    print(f"✅ Space freed: {total_size:.1f} MB")
    print(f"✅ Backup location: {backup_path}")
    
    # Verify main consolidated file still exists
    main_file = os.path.join(processed_dir, 'all_contracts_consolidated.parquet')
    if os.path.exists(main_file):
        main_size = os.path.getsize(main_file) / (1024 * 1024)  # MB
        print(f"✅ Main consolidated file verified: {main_size:.1f} MB")
    else:
        print("❌ WARNING: Main consolidated file not found!")
    
    print(f"\n=== Next Steps ===")
    print("1. Verify the application still works correctly")
    print("2. Test data processing and API endpoints")
    print("3. If everything works, you can delete the backup directory")
    print(f"4. Backup directory: {backup_path}")

def list_quarterly_files():
    """List all quarterly files that would be cleaned up"""
    
    print("=== Quarterly Raw Data Files Analysis ===")
    
    processed_dir = 'data/processed'
    quarterly_pattern = os.path.join(processed_dir, '*_Q*_contracts.parquet')
    quarterly_files = glob.glob(quarterly_pattern)
    
    if not quarterly_files:
        print("✅ No quarterly raw data files found")
        return
    
    print(f"Found {len(quarterly_files)} quarterly raw data files:")
    
    total_size = 0
    for file in sorted(quarterly_files):
        file_size = os.path.getsize(file) / (1024 * 1024)  # MB
        total_size += file_size
        print(f"  - {os.path.basename(file)} ({file_size:.1f} MB)")
    
    print(f"\nTotal size: {total_size:.1f} MB")
    
    # Check if main consolidated file exists
    main_file = os.path.join(processed_dir, 'all_contracts_consolidated.parquet')
    if os.path.exists(main_file):
        main_size = os.path.getsize(main_file) / (1024 * 1024)  # MB
        print(f"Main consolidated file: {main_size:.1f} MB")
        print(f"Space savings: {total_size:.1f} MB ({total_size/main_size*100:.1f}% of main file size)")
    else:
        print("❌ Main consolidated file not found!")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--list":
        list_quarterly_files()
    else:
        print("This script will clean up quarterly raw data files.")
        print("These files are no longer needed as data has been consolidated.")
        print("\nTo see what would be cleaned up, run: python cleanup_quarterly_raw_files.py --list")
        print("\nTo proceed with cleanup, run: python cleanup_quarterly_raw_files.py --confirm")
        
        if len(sys.argv) > 1 and sys.argv[1] == "--confirm":
            cleanup_quarterly_raw_files()
        else:
            print("\nUse --confirm to proceed with cleanup")


