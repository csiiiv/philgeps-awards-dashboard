#!/usr/bin/env python3
"""
Clean up old parquet files now that we have optimized versions.
"""

import os
import shutil
from datetime import datetime

def cleanup_old_parquet_files():
    """Clean up old parquet files, keeping only the optimized ones"""
    
    parquet_dir = 'data/parquet'
    
    # Files to keep (optimized versions)
    files_to_keep = [
        'facts_awards_title_optimized.parquet',  # Main optimized file (659M)
        'facts_awards_flood_control.parquet',   # Flood control data (1.4M)
        'title_search_cache.json',              # Search cache (1KB)
        # Keep aggregation files as they might be used elsewhere
        'agg_contractor.parquet',
        'agg_organization.parquet', 
        'agg_area.parquet',
        'agg_business_category.parquet'
    ]
    
    # Files to remove (old/unused versions)
    files_to_remove = [
        'facts_awards_all_time.parquet',        # Original file (382M) - replaced by title_optimized
        'facts_awards_search_optimized.parquet', # Intermediate optimization (338M)
        'facts_awards_super_optimized.parquet'  # Another optimization (338M)
    ]
    
    print("=== Parquet File Cleanup ===")
    print(f"Cleaning up old parquet files in: {parquet_dir}")
    print()
    
    # Create backup directory
    backup_dir = f"{parquet_dir}/archive_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    os.makedirs(backup_dir, exist_ok=True)
    print(f"Created backup directory: {backup_dir}")
    
    # Check current disk usage
    total_size_before = 0
    for file in os.listdir(parquet_dir):
        if file.endswith('.parquet'):
            file_path = os.path.join(parquet_dir, file)
            total_size_before += os.path.getsize(file_path)
    
    print(f"Total parquet files size before cleanup: {total_size_before / (1024*1024*1024):.2f} GB")
    print()
    
    # Process files to remove
    removed_files = []
    total_space_saved = 0
    
    for file_to_remove in files_to_remove:
        file_path = os.path.join(parquet_dir, file_to_remove)
        
        if os.path.exists(file_path):
            # Get file size
            file_size = os.path.getsize(file_path)
            file_size_mb = file_size / (1024*1024)
            
            # Move to backup directory instead of deleting
            backup_path = os.path.join(backup_dir, file_to_remove)
            shutil.move(file_path, backup_path)
            
            removed_files.append(file_to_remove)
            total_space_saved += file_size
            
            print(f"✅ Moved {file_to_remove} ({file_size_mb:.1f} MB) to backup")
        else:
            print(f"⚠️  File not found: {file_to_remove}")
    
    # Check remaining files
    remaining_files = []
    for file in os.listdir(parquet_dir):
        if file.endswith('.parquet'):
            file_path = os.path.join(parquet_dir, file)
            file_size = os.path.getsize(file_path)
            file_size_mb = file_size / (1024*1024)
            remaining_files.append((file, file_size_mb))
    
    print()
    print("=== Cleanup Summary ===")
    print(f"Files moved to backup: {len(removed_files)}")
    print(f"Space saved: {total_space_saved / (1024*1024*1024):.2f} GB")
    print()
    print("Remaining parquet files:")
    for file, size_mb in sorted(remaining_files, key=lambda x: x[1], reverse=True):
        print(f"  {file}: {size_mb:.1f} MB")
    
    print()
    print("=== Verification ===")
    
    # Verify that the main optimized file exists
    main_file = os.path.join(parquet_dir, 'facts_awards_title_optimized.parquet')
    if os.path.exists(main_file):
        print("✅ Main optimized file exists: facts_awards_title_optimized.parquet")
    else:
        print("❌ ERROR: Main optimized file missing!")
        return False
    
    # Verify flood control file exists
    flood_file = os.path.join(parquet_dir, 'facts_awards_flood_control.parquet')
    if os.path.exists(flood_file):
        print("✅ Flood control file exists: facts_awards_flood_control.parquet")
    else:
        print("❌ ERROR: Flood control file missing!")
        return False
    
    print()
    print("=== Next Steps ===")
    print("1. Test the application to ensure everything still works")
    print("2. If everything works correctly, you can delete the backup directory:")
    print(f"   rm -rf {backup_dir}")
    print("3. If there are issues, restore files from backup:")
    print(f"   mv {backup_dir}/* {parquet_dir}/")
    
    return True

if __name__ == "__main__":
    cleanup_old_parquet_files()
