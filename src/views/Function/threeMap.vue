<template>
  <div class="p-5">
    <div class="threeCont" ref="threeModel"></div>
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  onMounted,
  reactive,
  ref,
  watch,
  nextTick,
  getCurrentInstance,
  onBeforeMount,
  onBeforeUnmount,
} from "vue";
import * as THREE from 'three';
// 引入轨道控制器扩展库OrbitControls.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//引入性能监视器stats.js
import Stats from 'three/addons/libs/stats.module.js';
// 引入dat.gui.js的一个类GUI
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
// import aStar from './astar1.js'
import * as GeoTIFF from "geotiff";
let threeModel = ref()

type TileTextureConfig = {
  templateUrl: string;
  z: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  tileSize?: number;
};

onMounted(() => {
  nextTick(() => {
    let dom = document.getElementsByClassName('threeCont')[0]
    console.log(threeModel.value, '容器')
    // 创建3d场景对象scene
    const scene = new THREE.Scene()
    // 创建材质(长方体BoxGeometry,圆柱体CylinderGeometry,球体SphereGeometry,圆柱体CylinderGeometry,平面Geometry,点Geometry,线Geometry,面Geometry)
    // 先创建形状，这里是圆柱体

    // 想要观看到我们创建的3d物品，现在开始创建相机------------------------
    // 视角，宽高比，近平面，远平面
    // 75：相机视场角度，window.innerWidth / window.innerHeight：相机长宽比，0.1：相机距离原点的最近距离，1000：相机距离原点的最远距离
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
    // 相机位置
    camera.position.set(10, 10, 10)
    // 相机观察目标的位置，3d坐标
    camera.lookAt(0, 0, 0)
    scene.add(camera)
    // AxesHelper：辅助观察的坐标系,辅助线长度
    const axesHelper = new THREE.AxesHelper(150);
    scene.add(axesHelper);

    const pointLight = new THREE.PointLight(0xffffff, 1.0);
    // pointLight.position.set(20, 0, 0);//点光源放在x轴上
    pointLight.position.set(5, 5, 5);
    pointLight.intensity = 200.0;//光照强度
    // pointLight.target =cubeGeometry
    // 光源辅助观察
    // const pointLightHelper = new THREE.DirectionalLightHelper(pointLight, 5,0xff0000);

    scene.add(pointLight)//.add(pointLightHelper);






    // 定义渲染器(画布)，这里理解就是相机现在正在对着你的物品，它要给物品拍照(渲染器)，然后把这个照片给你看，你要定义照出来的照片大小
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    })
    // 不同硬件设备的屏幕的设备像素比window.devicePixelRatio值可能不同

    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setClearColor(0x444444, 1); //设置背景颜色

    // const width = 800; //宽度
    // const height = 500; //高度
    // 这里以窗口宽高为画布宽高
    renderer.setSize(threeModel.value.clientWidth, threeModel.value.clientHeight)
    // 生成画布(照片),添加场景和相机
    renderer.render(scene, camera)
    dom.appendChild(renderer.domElement);
    // 设置相机控件轨道控制器OrbitControls





    // 添加一个辅助网格地面
    const gridHelper = new THREE.GridHelper(300, 25, 0x004444, 0x004444);
    scene.add(gridHelper)



    const stats = new Stats();
    //stats.domElement:web页面上输出计算结果,一个div元素，
    // dom.appendChild(stats.domElement);
    // 渲染函数
    function renderStates() {
      //requestAnimationFrame循环调用的函数中调用方法update(),来刷新时间
      stats.update();
      renderer.render(scene, camera); //执行渲染操作
      requestAnimationFrame(renderStates); //请求再次执行渲染函数render，渲染下一帧
    }
    renderStates();



    const controls = new OrbitControls(camera, renderer.domElement);
    // 如果OrbitControls改变了相机参数，重新调用渲染器渲染三维场景
    controls.addEventListener('change', function () {
      renderer.render(scene, camera); //执行渲染操作
    });//监听鼠标、键盘事件

    // const gui = new GUI();
    // //创建一个对象，对象属性的值可以被GUI库创建的交互界面改变
    // const obj = {
    //   scale: 0,
    // };
    // gui界面上增加交互界面，改变obj对应属性

    loadTifTerrain(scene)

  })
})

function createTileUrl(templateUrl: string, z: number, x: number, y: number) {
  return templateUrl
    .replace('{z}', String(z))
    .replace('{x}', String(x))
    .replace('{y}', String(y));
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`tile load failed: ${url}`));
    img.src = url;
  });
}

async function createTileTexture(config: TileTextureConfig) {
  const tileSize = config.tileSize ?? 256;
  const cols = config.maxX - config.minX + 1;
  const rows = config.maxY - config.minY + 1;
  const canvas = document.createElement('canvas');
  canvas.width = cols * tileSize;
  canvas.height = rows * tileSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('failed to create canvas context for tile texture');

  const tasks: Promise<void>[] = [];
  for (let y = config.minY; y <= config.maxY; y++) {
    for (let x = config.minX; x <= config.maxX; x++) {
      const dx = (x - config.minX) * tileSize;
      const dy = (y - config.minY) * tileSize;
      const tileUrl = createTileUrl(config.templateUrl, config.z, x, y);
      tasks.push(
        loadImage(tileUrl)
          .then((img) => {
            ctx.drawImage(img, dx, dy, tileSize, tileSize);
          })
          .catch((err) => {
            console.warn(err);
            // ctx.fillStyle = '#1d1f20';
            ctx.fillRect(dx, dy, tileSize, tileSize);
            // ctx.strokeStyle = '#5a5a5a';
            ctx.strokeRect(dx, dy, tileSize, tileSize);
          })
      );
    }
  }

  await Promise.all(tasks);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}




// ====== 加载 TIF DEM 地形（优化版） ======
async function loadTifTerrain(scene: THREE.Scene) {
  const res = await fetch('/44444.tif');
  const buf = await res.arrayBuffer();
  const tiff = await GeoTIFF.fromArrayBuffer(buf);
  const img = await tiff.getImage();

  const width = img.getWidth();
  const height = img.getHeight();
  const raster = await img.readRasters();
  const elevation = raster[0];

  // ===== 控制精度（关键）=====
  const maxVertex = 512; // 推荐 256~1024
  const step = Math.max(1, Math.floor(Math.max(width, height) / maxVertex));
  const w = Math.floor(width / step);
  const h = Math.floor(height / step);

  const geometry = new THREE.PlaneGeometry(500, 500, w - 1, h - 1);
  geometry.rotateX(-Math.PI / 2);

  const vertices = geometry.attributes.position.array;

  let ptr = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      let z = elevation[y * width + x];
      if (!isFinite(z) || z < -1000 || z > 10000) z = 0;
      vertices[ptr + 1] = z * 0.1;
      ptr += 3;
    }
  }

  geometry.computeVertexNormals();

  // ===== Texture（核心）=====
  // 与地图瓦片一致的 XYZ 模板拼接贴图
  const texture = await createTileTexture({
    templateUrl: 'http://localhost:8080/tiles/{z}/{x}/{y}.png',
    z: 12,
    minX: 3380,
    maxX: 3383,
    minY: 1552,
    maxY: 1555,
  });

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  texture.minFilter = THREE.LinearMipMapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  texture.anisotropy = 16; // 🔥 提高清晰度（关键）

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.9,
    metalness: 0,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // ===== 光照（增强真实感）=====
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(100, 200, 100);
  scene.add(light);
}

</script>
<style  scoped>
.threeCont {

  height: 600px;
  border: 1px salmon solid;
  position: relative;
}
</style>
