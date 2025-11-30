import pyarrow.parquet as pq
import os

folder = '/mnt/6E9A84429A8408B3/_VSC/LINUX/PHILGEPS/philgeps-awards-dashboard/backend/django/static_data'
files = [f for f in os.listdir(folder) if f.endswith('.parquet')]
headers = {}
all_headers = set()
for f in files:
    table = pq.read_table(os.path.join(folder, f))
    cols = table.schema.names
    headers[f] = cols
    print(f'---\n{f}:\n{cols}')
    all_headers.update(cols)
print('---\nUnified Header Set:', sorted(list(all_headers)))
