<script setup lang="ts">
// map.init.js

import { onBeforeUnmount, onMounted, ref, nextTick } from 'vue'
import * as Cesium from 'cesium'
import { tiandituAnnotationProvider, localMaps, localImageryProvider } from './config'
import { lineList } from './line'
// import { gcj02towgs84 } from "./resortGps";
// import { lineList } from "./line";
// import { addForestTrees, clearForestTrees } from "./forestTrees";
// const cesium_token =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNDM2YWUzZC01ZjFlLTQ4ZGQtYWFlOS1jN2I0ZmQwM2FkMTAiLCJpZCI6NDEyMDcwLCJpYXQiOjE3NzUwMTIxODh9.0_jBWc4NslHGr3FAoUP5McounYkbONWXQ-zLQlWQ1Vw";
// import { addPointTrees, clearPointTrees } from "./treePointList";
// import { addTerrainrees } from "./terrainTree";

// 清除
const map = ref<any>(null)

const mapInit = async () => {
  // Cesium.Ion.defaultAccessToken = cesium_token
  // installCesiumLineWidthGuard();
  map.value = new Cesium.Viewer('cesiumContainer', {
    ...localMaps(),
    baseLayer: false,
    baseLayerPicker: false,
    creditContainer: Object.assign(document.createElement('div'), {
      style: 'display:none'
    }),
    sceneMode: Cesium.SceneMode.SCENE3D,
    scene3DOnly: true,
    requestRenderMode: true, // ✅ 只在变化时渲染
    maximumRenderTimeChange: Infinity
    // skyBox:  Cesium.SkyBox  ,
    // skyAtmosphere: false,
    // shadows: false,
    // terrainShadows: Cesium.ShadowMode.DISABLED,
  })

  // map.value.imageryLayers.addImageryProvider(localImageryProvider);
  //延迟一帧加载
  requestAnimationFrame(() => {
    map.value.imageryLayers.addImageryProvider(localImageryProvider)
  })
  // 仅显示四川范围内影像，隐藏边界外多余瓦片
  // map.value.scene.globe.cartographicLimitRectangle = SICHUAN_BOUNDS;
  // const viewer = map.value as Cesium.Viewer;
  // // maxAliasedLineWidth = Number((viewer.scene as any).maximumAliasedLineWidth ?? 1);

  // // 近似按高德层级换算的相机高度（米），用于限制缩放范围
  // const GAODE_LEVEL6_CAMERA_HEIGHT = 5;
  // const MAX_ZOOM_OUT_CAMERA_HEIGHT = 200000;
  // viewer.scene.screenSpaceCameraController.minimumZoomDistance =
  //   GAODE_LEVEL6_CAMERA_HEIGHT;
  // viewer.scene.screenSpaceCameraController.maximumZoomDistance =
  //   MAX_ZOOM_OUT_CAMERA_HEIGHT;

  // // 启用深度检测
  // map.value.scene.globe.depthTestAgainstTerrain = false;

  // 初始高度设置为高德 6 级附近，避免一进入就超出缩放约束

  // setTimeout(()=>{
  //     map.value.camera.flyTo({
  //   destination: Cesium.Cartesian3.fromDegrees(103.627832, 30.18754, 7000),
  //   orientation: {
  //     heading: Cesium.Math.toRadians(0.0),
  //     pitch: Cesium.Math.toRadians(-45.0),
  //     roll: 0.0,
  //   },
  //   duration: 5,
  // });
  // },10000)

  map.value.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(103.592165, 30.275705, 2000),
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-45.0),
      roll: 0
    }
  })

  nextTick(() => {
    // addRailRoute();
    showNewBuilding()

    // addMark();
  })

  // bindCameraLimitToSichuan(viewer);
  // showNewBuilding();

  // // addMapBuilds();

  // addMaskLayer();
  // addSichuanTerrainBorder();
  // showBuild2()
  //  await addForestTrees(viewer);

  // await addPointTrees(viewer);   // 渲染 3 棵树.
  // await addTerrainrees(viewer);
  // clearPointTrees(viewer);
}

onMounted(() => {
  mapInit()
})

const showNewBuilding = async () => {
  // const tileset = new Cesium.Cesium3DTileset({
  //   url: 'tileset.json'
  // })


  // tileset.debugShowBoundingVolume = true

  const tileset = map.value.scene.primitives.add(new Cesium.Cesium3DTileset({
     url : 'tileset.json',
     skipLevelOfDetail : true,
     baseScreenSpaceError : 1024,
     skipScreenSpaceErrorFactor : 16,
     skipLevels : 1,
     immediatelyLoadDesiredLevelOfDetail : false,
     loadSiblings : false,
     readyPromise : true
}));

  console.log(tileset,'引入的地址',new Cesium.Cesium3DTileset)


    // await tileset.ready // ✅ 新方式

    // map.value.scene.primitives.add(tileset)
    // map.value.zoomTo(tileset)

  return
  //引入模型

  const newBuildingTilesetUrl = '/V7.glb'
  // map.value.entities.removeAll();

  let position = Cesium.Cartesian3.fromDegrees(103.592165, 30.275705, 470) //fromGaodeDegrees(103.494277, 30.194664, 597.21);
  console.log('模型位置', position)

  var heading = Cesium.Math.toRadians(40)

  var pitch = 0

  var roll = 0

  var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)

  var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr)

  var entity = map.value.entities.add({
    name: 'V7',

    position: position,

    orientation: orientation,

    model: {
      uri: newBuildingTilesetUrl,

      minimumPixelSize: 128,

      maximumScale: 20000
    }
  })
}

const addRailRoute = async () => {
  if (!map.value) return
  const viewer = map.value as Cesium.Viewer

  const routeDegrees = getRouteDegreesFromBuildList()
  const routePositions = Cesium.Cartesian3.fromDegreesArray(routeDegrees)

  const baseWidth = 16
  const stripeWidth = 12
  const minSegmentLength = 30

  // 清理旧路线实体
  const removeIds: string[] = []
  for (const entity of viewer.entities.values) {
    if (typeof entity.id === 'string' && entity.id.startsWith('rail-route-')) {
      removeIds.push(entity.id)
    }
  }
  for (const id of removeIds) {
    viewer.entities.removeById(id)
  }

  for (let i = 1; i < routePositions.length; i++) {
    const segmentPositions = [routePositions[i - 1], routePositions[i]]
    const segmentLength = Cesium.Cartesian3.distance(segmentPositions[0], segmentPositions[1])
    if (segmentLength < minSegmentLength) continue

    const segmentId = `rail-route-segment-${i}`
    // repeat 过高会在远景被平均成灰，这里降低频率让斑马纹可见
    const repeat = Cesium.Math.clamp(segmentLength / 320, 2, 18)

    // 中心虚线增强远景可读性，避免整体看成单色带
    viewer.entities.add({
      id: `${segmentId}-centerline`,
      name: `高铁主路线中心虚线-${i}`,
      polyline: {
        positions: segmentPositions,
        width: 4, //getSafeLineWidth(4)
        clampToGround: true,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString('#CDD0D4').withAlpha(0.98),
          gapColor: Cesium.Color.fromCssColorString('#646668').withAlpha(0.98),
          dashLength: 18
        })
      }
    })
  }

  // // addRailTrainDemo(viewer, routePositions);
}
const getRouteDegreesFromBuildList = () => {
  const degreesFromLineList = lineList.flatMap((point) => {
    if (typeof point?.lng !== 'number' || typeof point?.lat !== 'number') {
      return [] as number[]
    }
    return [point.lng, point.lat]
  })

  return degreesFromLineList
}

onBeforeUnmount(() => {})
</script>

<template>
  <div>
    <div id="cesiumContainer"></div>
  </div>
</template>
<style>
#cesiumContainer {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  /* border: 1px solid aqua; */
}
</style>
