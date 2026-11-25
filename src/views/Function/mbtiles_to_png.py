import sqlite3
import os

mbtiles_path = r"E:\code\yingxiang\11_20260821_142503.mbtiles"
output_dir = r"E:\code\chengdu\cdImage\image"

conn = sqlite3.connect(mbtiles_path)
cursor = conn.cursor()

cursor.execute("SELECT zoom_level, tile_column, tile_row, tile_data FROM tiles")
tiles = cursor.fetchall()

for zoom, x, y, data in tiles:
    # TMS to XYZ
    y_xyz = (2 ** zoom - 1) - y
    folder = os.path.join(output_dir, str(zoom), str(x))
    os.makedirs(folder, exist_ok=True)
    filepath = os.path.join(folder, f"{y_xyz}.png")
    with open(filepath, "wb") as f:
        f.write(data)

conn.close()
print("瓦片导出完成！")