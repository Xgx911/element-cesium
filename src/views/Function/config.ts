// map.init.js


import * as Cesium from 'cesium';

const tiandituKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNDM2YWUzZC01ZjFlLTQ4ZGQtYWFlOS1jN2I0ZmQwM2FkMTAiLCJpZCI6NDEyMDcwLCJpYXQiOjE3NzUwMTIxODh9.0_jBWc4NslHGr3FAoUP5McounYkbONWXQ-zLQlWQ1Vw'
const cesium_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNDM2YWUzZC01ZjFlLTQ4ZGQtYWFlOS1jN2I0ZmQwM2FkMTAiLCJpZCI6NDEyMDcwLCJpYXQiOjE3NzUwMTIxODh9.0_jBWc4NslHGr3FAoUP5McounYkbONWXQ-zLQlWQ1Vw'

const tianditu = 'c976cabd204e0cc64d68f8b1fc48c1e9'
// 加载天地图影像注记  https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS
export const tiandituAnnotationProvider = new Cesium.WebMapTileServiceImageryProvider({
  url: `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS`,
  layer: 'cia',
  style: 'default',
  format: 'tiles',
  tileMatrixSetID: 'w', 
  subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
  maximumLevel: 18
});

export const localImageryProvider = new Cesium.UrlTemplateImageryProvider({
  url: "http://192.168.30.142:8090/shenyang/{z}/{x}/{y}.jpg",
  maximumLevel: 19,
  minimumLevel: 0
});

// 地图配置项
export const mapOptions = () => {
  return {
    infoBox: false, // 右侧信息框
    selectionIndicator: false, //选中状态
    imageryProvider: localImageryProvider, // 设置影像地图
    // terrainProvider: Cesium.createWorldTerrain({
    //   requestVertexNormals: true,  //可以增加法线，用于提高光照效果
    //   requestWaterMask: true // 水面特效
    // }), // 地形图层
    scene3DOnly: true,
    timeline: false, //时间轴控件
    animation: false, //动画控件
    geocoder: false, //搜索控件
    homeButton: false, //主页控件
    sceneModePicker: false, //投影控件
    baseLayerPicker: false, //图层控件
    navigationHelpButton: false, //帮助控件
    fullscreenButton: false, //全屏控件
  }
}


export const localMaps = () => {
  return {
    terrain: new Cesium.Terrain(
      Cesium.CesiumTerrainProvider.fromUrl("http://192.168.30.142:3308/dem/")
    ),
        scene3DOnly: true,
    selectionIndicator: false, //自带的选中框
    baseLayerPicker: false, //是否显示图层选择控件
    geocoder: false, //是否显示地名查找控件
    timeline: false, //是否显示时间线控件
    homeButton: false, //是否显示Home按钮
    sceneModePicker: false, //是否显示投影方式控件
    navigationHelpButton: false, //是否显示帮助信息控件
    infoBox: false, //是否显示点击要素后显示的信息
    animation: false, //隐藏左下角的仪表盘播放动画按钮
    fullscreenButton: false
  }

}