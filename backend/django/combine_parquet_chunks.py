#!/usr/bin/env python3
"""
Combine parquet chunks into single file during Docker build.
This script runs automatically when the backend container starts.
"""

import os
import glob
import pyarrow.parquet as pq
import pyarrow as pa
from pathlib import Path

def combine_parquet_chunks(
    chunks_dir: str,
    output_file: str,
    pattern: str = "facts_awards_chunk_*.parquet"
):
    """
    Combine multiple parquet chunk files into a single file.
    
    Args:
        chunks_dir: Directory containing the chunk files
        output_file: Path for the combined output file
        pattern: Glob pattern to match chunk files
    """
    # Check if output file already exists and is up to date
    if os.path.exists(output_file):
        output_mtime = os.path.getmtime(output_file)
        chunks_pattern = os.path.join(chunks_dir, pattern)
        chunk_files = sorted(glob.glob(chunks_pattern))
        
        if chunk_files:
            latest_chunk_mtime = max(os.path.getmtime(f) for f in chunk_files)
            if output_mtime >= latest_chunk_mtime:
                print(f"✅ {output_file} is up to date, skipping combine")
                return
    
    print(f"🔄 Combining parquet chunks from {chunks_dir}...")
    
    # Find all chunk files
    chunks_pattern = os.path.join(chunks_dir, pattern)
    chunk_files = sorted(glob.glob(chunks_pattern))
    
    if not chunk_files:
        print(f"⚠️  No chunk files found matching {chunks_pattern}")
        print(f"   Skipping combine step")
        return
    
    print(f"Found {len(chunk_files)} chunk files:")
    for chunk in chunk_files:
        size_mb = os.path.getsize(chunk) / (1024 * 1024)
        print(f"  - {os.path.basename(chunk)} ({size_mb:.2f} MB)")
    
    # Read and combine all chunks
    tables = []
    total_rows = 0
    
    for chunk_file in chunk_files:
        table = pq.read_table(chunk_file)
        tables.append(table)
        total_rows += table.num_rows
        print(f"  ✓ Read {os.path.basename(chunk_file)}: {table.num_rows:,} rows")
    
    # Concatenate all tables
    print(f"\n📊 Concatenating {len(tables)} tables...")
    combined_table = pa.concat_tables(tables)
    
    print(f"📝 Writing combined file: {output_file}")
    pq.write_table(combined_table, output_file, compression='snappy')
    
    output_size_mb = os.path.getsize(output_file) / (1024 * 1024)
    print(f"\n✅ Combined {total_rows:,} rows into {output_file}")
    print(f"   File size: {output_size_mb:.2f} MB")

if __name__ == "__main__":
    # Get paths
    script_dir = Path(__file__).parent
    chunks_dir = script_dir / "static_data/chunks"
    output_file = script_dir / "static_data/facts_awards_all_time.parquet"
    
    print("=" * 80)
    print("COMBINING PARQUET CHUNKS")
    print("=" * 80)
    
    if not chunks_dir.exists():
        print(f"⚠️  Chunks directory not found: {chunks_dir}")
        print("   This is expected if running with a complete parquet file")
        print("   Skipping combine step")
    else:
        try:
            combine_parquet_chunks(
                str(chunks_dir),
                str(output_file),
                pattern="facts_awards_chunk_*.parquet"
            )
        except Exception as e:
            print(f"❌ Error combining chunks: {e}")
            print("   Continuing with existing data...")
    
    print("=" * 80)

