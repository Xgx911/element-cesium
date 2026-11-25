import rasterio

# GeoTIFF 文件路径
tif_path = "F:\GIS\QGISPackage\pujiangImage.tif"

with rasterio.open(tif_path) as src:

    # ----------------------------
    # 基本信息
    # ----------------------------
    print("========== 基本信息 ==========")
    print("宽度：", src.width)
    print("高度：", src.height)
    print("波段数：", src.count)

    # ----------------------------
    # 坐标系
    # ----------------------------
    print("\n========== 坐标系 ==========")
    print(src.crs)

    # ----------------------------
    # 经纬度范围
    # ----------------------------
    print("\n========== Bounds ==========")
    bounds = src.bounds
    print(bounds)

    print("\n西(West)：", bounds.left)
    print("东(East)：", bounds.right)
    print("南(South)：", bounds.bottom)
    print("北(North)：", bounds.top)

    # ----------------------------
    # 中心点
    # ----------------------------
    center_lon = (bounds.left + bounds.right) / 2
    center_lat = (bounds.top + bounds.bottom) / 2

    print("\n========== 中心点 ==========")
    print("Longitude:", center_lon)
    print("Latitude :", center_lat)

    # ----------------------------
    # 左上角、右下角
    # ----------------------------
    print("\n========== 四角坐标 ==========")
    print("左上：", (bounds.left, bounds.top))
    print("右上：", (bounds.right, bounds.top))
    print("左下：", (bounds.left, bounds.bottom))
    print("右下：", (bounds.right, bounds.bottom))

    # ----------------------------
    # 像元大小（分辨率）
    # ----------------------------
    print("\n========== 分辨率 ==========")
    print("X方向：", src.res[0])
    print("Y方向：", src.res[1])

    # ----------------------------
    # 仿射矩阵
    # ----------------------------
    print("\n========== Transform ==========")
    print(src.transform)