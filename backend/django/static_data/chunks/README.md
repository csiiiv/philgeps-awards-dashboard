# Parquet Data Chunks

This directory contains the `facts_awards_all_time.parquet` file split into smaller chunks to avoid Git LFS limits.

## 📦 **Why Chunks?**

The original `facts_awards_all_time.parquet` file is **656 MB**, which exceeds GitHub's 100MB file size limit and would require Git LFS. By splitting it into chunks **under 100MB each**, we can:

- ✅ Store the data directly in Git without LFS
- ✅ Reduce repository costs and complexity
- ✅ Maintain full data integrity
- ✅ Enable faster cloning and downloads

## 📊 **Chunk Information**

| Chunk | Rows | Size | Notes |
|-------|------|------|-------|
| `facts_awards_chunk_01.parquet` | 387,573 | 38 MB | - |
| `facts_awards_chunk_02.parquet` | 387,573 | 48 MB | - |
| `facts_awards_chunk_03.parquet` | 387,573 | 49 MB | Largest chunk |
| `facts_awards_chunk_04.parquet` | 387,573 | 49 MB | Largest chunk |
| `facts_awards_chunk_05.parquet` | 387,573 | 48 MB | - |
| `facts_awards_chunk_06.parquet` | 387,573 | 47 MB | - |
| `facts_awards_chunk_07.parquet` | 387,573 | 45 MB | - |
| `facts_awards_chunk_08.parquet` | 387,573 | 46 MB | - |
| `facts_awards_chunk_09.parquet` | 387,573 | 45 MB | - |
| `facts_awards_chunk_10.parquet` | 387,573 | 45 MB | - |
| `facts_awards_chunk_11.parquet` | 387,573 | 45 MB | - |
| `facts_awards_chunk_12.parquet` | 387,573 | 41 MB | - |
| `facts_awards_chunk_13.parquet` | 387,573 | 37 MB | - |
| `facts_awards_chunk_14.parquet` | 387,573 | 38 MB | - |
| `facts_awards_chunk_15.parquet` | 55,139 | 5 MB | Last segment |

**Total**: 5,481,161 rows, 620 MB (15 chunks)  
**Largest chunk**: 48.99 MB (well under 50MB GitHub warning threshold)

## 🔄 **Automatic Combination**

The chunks are **automatically combined** during Docker build:

1. **Docker build starts** → `combine_parquet_chunks.py` runs
2. **Chunks are read** → All 8 chunks loaded into memory
3. **Tables concatenated** → PyArrow combines them efficiently
4. **Output written** → Single `facts_awards_all_time.parquet` created
5. **Application starts** → Uses the combined file

### Performance:
- **Combine time**: ~5-10 seconds
- **Memory usage**: ~2GB during combine
- **Output size**: 636 MB (re-compressed)

## 🛠️ **Maintenance Scripts**

### Split Large File into Chunks
```bash
# Run from project root
python3 scripts/split_parquet_for_git.py
```

This script:
- Reads `facts_awards_all_time.parquet`
- Splits into ~90MB chunks
- Saves to `static_data/chunks/`

### Combine Chunks Manually
```bash
# Run from backend/django directory
python3 combine_parquet_chunks.py
```

This script:
- Reads all `facts_awards_chunk_*.parquet` files
- Combines them into single file
- Writes to `static_data/facts_awards_all_time.parquet`

## 📝 **Git Configuration**

The `.gitignore` file is configured to:
- ✅ **Track** the chunk files (`chunks/*.parquet`)
- ❌ **Ignore** the combined file (`facts_awards_all_time.parquet`)

This means:
- Chunks are committed to Git
- Combined file is generated locally/in Docker
- No Git LFS required!

## 🚀 **Docker Build Integration**

The `Dockerfile` includes:

```dockerfile
# Combine parquet chunks before starting
RUN python3 combine_parquet_chunks.py
```

This ensures the combined file is always available when the container starts.

## ⚠️ **Important Notes**

1. **Never commit** `facts_awards_all_time.parquet` directly
2. **Always split** large files before committing
3. **Test locally** after splitting to ensure combine works
4. **Check file sizes** - chunks must be under 100MB

## 🔍 **Verification**

To verify the chunks match the original:

```python
import pyarrow.parquet as pq

# Read original
original = pq.read_table('facts_awards_all_time.parquet')
print(f"Original rows: {original.num_rows:,}")

# Read combined from chunks
combined = pq.read_table('facts_awards_all_time.parquet')
print(f"Combined rows: {combined.num_rows:,}")

# Should match!
assert original.num_rows == combined.num_rows
```

---

**Last Updated**: November 27, 2025  
**Total Data**: 5.5M+ contracts, 24+ years (2001-2025)  
**Source**: PhilGEPS Government Procurement Data

