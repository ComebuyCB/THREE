"use strict";
import * as THREE from './plugins/threeJs/build/three.module.js'
import Stats from './plugins/threeJs/extra/jsm/libs/stats.module.js';
import { OrbitControls } from './plugins/threeJs/extra/jsm/controls/OrbitControls.js';
import { FirstPersonControls } from './plugins/threeJs/extra/jsm/controls/FirstPersonControls.js';
import { PointerLockControls } from './plugins/threeJs/extra/jsm/controls/PointerLockControls.js';
import { FlyControls } from './plugins/threeJs/extra/jsm/controls/FlyControls.js';

import { OBJLoader } from './plugins/threeJs/extra/jsm/loaders/OBJLoader.js';
import { MTLLoader } from './plugins/threeJs/extra/jsm/loaders/MTLLoader.js';
import { GLTFLoader } from './plugins/threeJs/extra/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from './plugins/threeJs/extra/jsm/loaders/FBXLoader.js';


let scene, renderer, camera, control, clock
let time = 0
let texture0, IMG
let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')
let spotLight, pointLight, ambientLight
let moveForward = false
let moveBackward = false
let moveLeft = false
let moveRight = false
let canJump = false
let raycaster
let obj = {
  chair: null,
  bottle: null,
  subway: null,
  subway2: null,
  subway3: null,
  signboard: null,
  cube: null,
  cube0: null,
  cubes: [],
}
let gui = new dat.GUI()

function create_Default(){
  // 建立渲染器
  renderer = new THREE.WebGLRenderer()
  renderer.setSize( window.innerWidth, window.innerHeight ) // 場景大小
  renderer.setClearColor(0x333333, 1.0) // 預設背景顏色
  renderer.shadowMap.enable = true // 陰影效果

  // 將渲染器的 DOM 綁到網頁上
  document.body.appendChild(renderer.domElement)

  // 更新偵率
  clock = new THREE.Clock()

  // 建立場景
  scene = new THREE.Scene()

  // 建立相機
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 600 )
  camera.position.set(-45, 4, 33)
  camera.lookAt(scene.position)
}

function create_Lights(){
  // 建立光源
  pointLight = new THREE.PointLight(0xffffff)
  pointLight.castShadow = true
  pointLight.position.set(2, 2, -2)
  scene.add(pointLight)

  const ambientLight = new THREE.AmbientLight( 0xaaaaaa )
  scene.add( ambientLight );

  // 簡單的 spotlight 照亮物體
  // spotLight = new THREE.SpotLight(0xffffff)
  // spotLight.position.set(-3, 3, -3)
  // scene.add(spotLight)
}

function create_Helper(){
  const pointLightHelper = new THREE.PointLightHelper( pointLight, 0.5 );
  scene.add( pointLightHelper );

  // 三軸座標輔助
  let axes = new THREE.AxesHelper(20)
  scene.add(axes)

  // let spotHelper = new THREE.SpotLightHelper(spotLight)
  // scene.add(spotHelper)

  // let gridSize = 20
  // const gridHelper = new THREE.GridHelper( gridSize, gridSize );
  // scene.add( gridHelper );
}

function create_Cube(){
  // 建立物體SOP: geometry(幾何) + material(材質) => mesh(物件)
  const geometry = new THREE.BoxGeometry(1, 1, 1) // 幾何體
  const material = new THREE.MeshPhongMaterial({ color: 0xff9900 }) // 材質
  
  obj['cube'] = new THREE.Mesh(geometry, material) // 建立網格物件
  obj['cube'].position.set(0, 0, 0)
  // scene.add(cube)
}

function create_Cubes(){
  texture0 = new THREE.CanvasTexture( ctx.canvas )
  const loader = new THREE.ImageLoader();
  loader.load(
    '../assets/img/big.png',
    function ( image ) {
      IMG = image
      // drawCanvas0( IMG )
      
      const geometry0 = new THREE.BoxGeometry(1,1,1)
      const material0 = new THREE.MeshBasicMaterial({ map: texture0, transparent: true, opacity: 0.6 })
      // cube0 = new THREE.Mesh(geometry0, [material0,material0,material0,material0,material0,material0])
      // scene.add(cube0)

      let cnt = 0
      for( let x=-3; x<=3; x++ ){
        for( let y=-3; y<=3; y++ ){
            obj['cubes'][cnt] = new THREE.Mesh(geometry0, [material0,material0,material0,material0,material0,material0])
            obj['cubes'][cnt].position.x = x*1.5
            obj['cubes'][cnt].position.y = y*1.5
            obj['cubes'][cnt].position.z = Math.random() * 1 - 0.5
            scene.add(obj['cubes'][cnt])
            cnt ++
        }
      }
      // console.log( cnt + ' 個物件' )
    },
    undefined,
    function () {
      // console.error( 'An error happened.' );
    }
  )
}

function create_Objects() {
  const manager = new THREE.LoadingManager();
  manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    $('#loading').text( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' )
  };
  manager.onLoad = function ( ) {
    $('#loading').text( 'Loading complete!');
    THREE_render()
    $('#loading').fadeOut( 1000, function(){
      $(this.remove())
    })
  };
  manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    $('#loading').text( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' )
  };
  manager.onError = function ( url ) {
    console.log( 'There was an error loading ' + url );
  };

  let mtlLoader = new MTLLoader(manager)
  mtlLoader.load('./obj/mP/mP.mtl', (mtl)=>{      
    let objLoader = new OBJLoader()
    objLoader.setMaterials( mtl )
    objLoader.load('./obj/mP/mP.obj', (mesh)=>{
      obj['chair'] = mesh
      obj['chair'].scale.set(0.1, 0.1, 0.1)
      obj['chair'].rotation.y = 45
      obj['chair'].position.set(-20, -7, 20)
      obj['chair'].castShadow = true
      scene.add( obj['chair'] )
    })
  })

  let gltfLoader = new GLTFLoader(manager)
  gltfLoader.load('./obj/soda_bottle_origin/source/Bottle Only.gltf',(gltf)=>{
    obj['bottle'] = gltf.scene
    obj['bottle'].scale.set(5,5,5)
    obj['bottle'].position.set(2,-7,2)
    obj['bottle'].castShadow = true
    obj['bottle'].receiveShadow = true
    obj['bottle'].rotation.x = Math.PI / 2
    obj['bottle'].add( new THREE.AxesHelper(2) )
    scene.add( obj['bottle'] )

    let g_bottle = gui.addFolder('bottle')
      let bottle_p = g_bottle.addFolder('position')
        bottle_p.add( obj['bottle'].position , 'x', -10, 10 ).listen().onChange( (value)=>{ obj['bottle'].position.x = value } )
        bottle_p.add( obj['bottle'].position , 'y', -10, 10 ).listen().onChange( (value)=>{ obj['bottle'].position.y = value } )
        bottle_p.add( obj['bottle'].position , 'z', -10, 10 ).listen().onChange( (value)=>{ obj['bottle'].position.z = value } )
        bottle_p.open()

      let bottle_r = g_bottle.addFolder('rotation')
        bottle_r.add( obj['bottle'].rotation , 'x', 0, Math.PI*2 ).listen().onChange( (value)=>{ obj['bottle'].rotation.x = value } )
        bottle_r.add( obj['bottle'].rotation , 'y', 0, Math.PI*2 ).listen().onChange( (value)=>{ obj['bottle'].rotation.y = value } )
        bottle_r.add( obj['bottle'].rotation , 'z', 0, Math.PI*2 ).listen().onChange( (value)=>{ obj['bottle'].rotation.z = value } )
        bottle_r.open()

        console.log( obj['bottle'] )        
  })

  let gltfLoader3 = new GLTFLoader(manager)
  gltfLoader3.load( './obj/metrosubway_station_interior/scene.gltf', function ( gltf ) {
    obj['subway'] = gltf.scene
    obj['subway'].position.set(-2,-8,-4)

    obj['subway'].scale.set(5,5,5)
    obj['subway'].castShadow = true
    obj['subway'].receiveShadow = true
    scene.add( obj['subway'] )

    obj['subway2'] = obj['subway'].clone()
    obj['subway2'].position.add( new THREE.Vector3(35,0,0) )
    obj['subway2'].rotation.y = Math.PI
    scene.add( obj['subway2'] )

    obj['subway3'] = obj['subway2'].clone()
    obj['subway3'].position.set(167.4,-8,-71.2)
    obj['subway3'].rotation.y = Math.PI
    scene.add( obj['subway3'] )
  })
}

function create_Control(){
  // control = new PointerLockControls(camera)
  // control.getObject().position.set(0, 0, 0)
  // scene.add(control.getObject())

  // control = new FlyControls(camera,renderer.domElement)
  // control.movementSpeed = 10
  // control.rollSpeed = Math.PI / 2
  // control.dragToLook = true
  // control.constrainVertical = true

  control = new FirstPersonControls(camera,renderer.domElement)
  control.movementSpeed = 10
  control.lookSpeed = 0.08
  // control.activeLook = false
  control.constrainVertical = true
  control.verticalMax = Math.PI*5/8
  control.verticalMin = Math.PI*3/8
  // control.lookAt(0,0,0)

  // control = new OrbitControls(camera, renderer.domElement)
  // control.autoRotate = true


  gui.add( control, 'enabled')
  gui.add( control, 'activeLook')
  gui.add( control, 'autoForward')
  gui.add( control, 'constrainVertical')
  gui.add( control, 'verticalMax', 0, Math.PI)
  gui.add( control, 'verticalMin', 0, Math.PI)
  gui.add( control, 'lookVertical')
}


// 初始化場景、渲染器、相機、物體
function THREE_init() {
  create_Default()
  create_Lights()
  create_Helper()
  create_Cubes()
  create_Objects()
  create_Control()
}

// ====== //
// update //
// ====== //

function update_Cubes(){
  if ( !IMG ){
    return false
  }

  let cw = ctx.canvas.width = 1024;
  let ch = ctx.canvas.height = 1024;

  let iw = IMG.width || 0
  let ih = IMG.height || 0

  let nw, nh, sc

  if ( iw / ih >= cw / ch ){ // 圖寬較大，高 = 高
    nh = ch
    sc = ch / ih          // 畫布為主，畫布是圖片的X倍大小
    nw = sc * iw
  } else {
    nw = cw
    sc = cw / iw          // 畫布為主，畫布是圖片的X倍大小
    nh = sc * ih          
  }
  // console.log( nw, nh, iw ,ih )

  ctx.fillStyle = '#f90'
  ctx.fillRect(0, 0, cw, ch)
  ctx.fillStyle = '#fff'
  ctx.fillRect(10, 10, cw - 20, ch - 20)

  ctx.drawImage( IMG, 0, 0, 1024, 1024 )

  ctx.font = "24pt Arial"
  ctx.fillStyle = '#000'
  ctx.textAlign = 'center'
  ctx.fillText( new Date().getTime(), cw/2, ch/2 )
  ctx.fillText( clock.getDelta(), cw/2, ch/4 )

  let cnt = 0
  if ( obj['cubes'][0] ){
    for( let x=-3; x<=3; x++ ){
      for( let y=-3; y<=3; y++ ){
        obj['cubes'][cnt].rotation.x = Math.cos( 0.02 * time ) * 0.5
        // obj['cubes'][cnt].rotation.y = Math.cos( 0.05 * time ) * 0.5
        // obj['cubes'][cnt].rotation.z = Math.cos( 0.05 * time ) * 0.5
        cnt ++
      }
    }
  }
}

function update_Objects(){
  obj['chair'].rotation.y += 0.01

  pointLight.position.x = Math.cos(time*0.05) * 6

  obj['bottle'].position.x = -2 + Math.cos(time*0.05) *5
  obj['bottle'].position.z = -2 + Math.sin(time*0.05) *5
  obj['bottle'].rotation.z = Math.PI/2 + time*0.05

  control.lookAt( obj['bottle'].position )
  // camera.rotation.y += Math.cos(time*0.05) * 0.01
  // camera.rotation.z += Math.sin(time*0.05) * 0.01

  if ( time%100 === 0 ){
    console.log( obj['chair'].rotation.y )
    // console.log( camera.position )
  }
}

// 建立動畫
function THREE_update() {
  time ++
  control.update(clock.getDelta())
  texture0.needsUpdate = true
  update_Objects()
  update_Cubes()
}


// 渲染場景
function THREE_render() {
  requestAnimationFrame(THREE_render)
  THREE_update()
  renderer.render(scene, camera)
}

// 監聽螢幕寬高來做簡單 RWD 設定
window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight )
})

const onKeyDown = function(event) {
  switch (event.keyCode) {
    case 38: // up
    case 87: // w
      moveForward = true
      break
    case 37: // left
    case 65: // a
      moveLeft = true
      break
    case 40: // down
    case 83: // s
      moveBackward = true
      break
    case 39: // right
    case 68: // d
      moveRight = true
      break
  }
}

const onKeyUp = function(event) {
  switch (event.keyCode) {
    case 38: // up
    case 87: // w
      moveForward = false
      break
    case 37: // left
    case 65: // a
      moveLeft = false
      break
    case 40: // down
    case 83: // s
      moveBackward = false
      break
    case 39: // right
    case 68: // d
      moveRight = false
      break
  }
}

document.addEventListener('keydown', onKeyDown, false)
document.addEventListener('keyup', onKeyUp, false)

THREE_init()
