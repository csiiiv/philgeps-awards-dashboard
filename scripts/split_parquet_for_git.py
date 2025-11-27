#!/usr/bin/env python3
"""
Split large parquet file into chunks <100MB to avoid Git LFS.
This script splits facts_awards_all_time.parquet into smaller chunks.
"""

import os
import pyarrow.parquet as pq
import pyarrow as pa
from pathlib import Path

def split_parquet_file(
    input_file: str,
    output_dir: str,
    target_size_mb: int = 45,  # Target 45MB to avoid GitHub 50MB warnings
    prefix: str = "facts_awards_chunk"
):
    """
    Split a large parquet file into smaller chunks.
    
    Args:
        input_file: Path to the large parquet file
        output_dir: Directory to save the chunks
        target_size_mb: Target size for each chunk in MB
        prefix: Prefix for chunk filenames
    """
    print(f"Reading {input_file}...")
    table = pq.read_table(input_file)
    total_rows = table.num_rows
    
    # Get file size in MB
    file_size_mb = os.path.getsize(input_file) / (1024 * 1024)
    print(f"Total rows: {total_rows:,}")
    print(f"File size: {file_size_mb:.2f} MB")
    
    # Calculate rows per chunk
    rows_per_chunk = int(total_rows * (target_size_mb / file_size_mb))
    num_chunks = (total_rows + rows_per_chunk - 1) // rows_per_chunk
    
    print(f"Target size per chunk: {target_size_mb} MB")
    print(f"Rows per chunk: {rows_per_chunk:,}")
    print(f"Number of chunks: {num_chunks}")
    
    # Create output directory
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Split into chunks
    for i in range(num_chunks):
        start_idx = i * rows_per_chunk
        end_idx = min((i + 1) * rows_per_chunk, total_rows)
        
        chunk = table.slice(start_idx, end_idx - start_idx)
        output_file = os.path.join(output_dir, f"{prefix}_{i+1:02d}.parquet")
        
        print(f"\nWriting chunk {i+1}/{num_chunks}: rows {start_idx:,} to {end_idx:,}")
        pq.write_table(chunk, output_file, compression='snappy')
        
        chunk_size_mb = os.path.getsize(output_file) / (1024 * 1024)
        print(f"  -> {output_file} ({chunk_size_mb:.2f} MB)")
    
    print(f"\n✅ Successfully split into {num_chunks} chunks")
    print(f"Total size: {sum(os.path.getsize(os.path.join(output_dir, f)) for f in os.listdir(output_dir) if f.startswith(prefix)) / (1024 * 1024):.2f} MB")

if __name__ == "__main__":
    # Get the project root directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    input_file = project_root / "backend/django/static_data/facts_awards_all_time.parquet"
    output_dir = project_root / "backend/django/static_data/chunks"
    
    if not input_file.exists():
        print(f"❌ Error: {input_file} not found!")
        exit(1)
    
    print("=" * 80)
    print("SPLITTING PARQUET FILE FOR GIT")
    print("=" * 80)
    
    split_parquet_file(
        str(input_file),
        str(output_dir),
        target_size_mb=45,
        prefix="facts_awards_chunk"
    )
    
    print("\n" + "=" * 80)
    print("SPLIT COMPLETE")
    print("=" * 80)
    print("\n📝 Next steps:")
    print("1. Delete the original facts_awards_all_time.parquet")
    print("2. Add chunks/ directory to git")
    print("3. The combine script will run automatically on Docker build")

