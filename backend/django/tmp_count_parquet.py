import duckdb
import sys

def count(path):
    try:
        c=duckdb.connect()
        print(f"Counting {path}...", end=' ')
        n=c.execute(f"SELECT COUNT(*) FROM read_parquet('{path}')").fetchone()[0]
        print(n)
        c.close()
    except Exception as e:
        print(f"ERROR reading {path}: {e}", file=sys.stderr)

if __name__=='__main__':
    paths=['/data/parquet/facts_awards_all_time.parquet','/data/parquet/facts_awards_title_optimized.parquet']
    for p in paths:
        count(p)
