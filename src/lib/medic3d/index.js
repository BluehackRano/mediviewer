import JSZIP from 'jszip';
// import * as THREE from 'three';
// import Medic3D from '../../../../Medic3D/dist/medic3d'
// for release
import Medic3D from '../../../static/lib/Medic3D/medic3d'
import Request from 'request';
import * as THREE from '../../../static/lib/three.min';
import dat from '../../../static/lib/dat.gui.min';
var PNG = require('pngjs').PNG;


// standard global variables
let ready = false;
let aDicomRawData = null
let shouldShowSegmentation = false;
let reports = [];
let localSegmentFileName = null

const shaders = {
  vertex : `
precision highp float;
varying  vec2 vUv;
varying  vec4 worldCoord;

void main()
{
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;


  worldCoord = modelMatrix * vec4( position, 1.0 );
}
`,

  fragment : `
  precision highp float;

  // a max number we allow, can be upt to 16
  const int maxNbOfTextures = 1;

  // Number of texture used with this dataset
  // cannot be higher than maxNbOfTextures
  uniform float nbOfTextureUsed;

  // size of the mosaic
  uniform float nbSlicePerRow;
  uniform float nbSlicePerCol;
  // not necessary equal to nbSlicePerRow*nbSlicePerCol because last line
  // is not necessary full
  uniform float nbSliceTotal;

  uniform float indexSliceToDisplay;

  // space length
  uniform float xspaceLength;
  uniform float yspaceLength;
  uniform float zspaceLength;

  // a texture will contain a certain number of slices
  uniform sampler2D textures[maxNbOfTextures];


  // Shared with the vertex shader
  varying  vec4 worldCoord;
  varying  vec2 vUv;

  float myMod(float x, float y){
    return x - (y * float(int(x/y)));
  }

  /**
  * Returns accurate MOD when arguments are approximate integers.
  */
  float modI(float a,float b) {
      float m = a - floor( ( a + 0.5 ) / b) * b;
      return floor( m + 0.5 );
  }


  void main( void ) {

    // step to jump from a slice to another on a unit-sized texture
    float sliceWidth = 1.0 / nbSlicePerRow;
    float sliceHeight = 1.0 / nbSlicePerCol;

    // row/col index of the slice within the grid of slices
    // (0.5 rounding is mandatory to deal with float as integers)
    float rowTexture = nbSlicePerCol - 1.0 - floor( (indexSliceToDisplay + 0.5) / nbSlicePerRow);
    float colTexture = modI( indexSliceToDisplay, nbSlicePerRow );

    vec2 posInTexture = vec2(
      sliceWidth * colTexture + vUv.x * sliceWidth ,
      sliceHeight * rowTexture + vUv.y * sliceHeight
    );

    gl_FragColor = texture2D(textures[0], posInTexture);
  }
`
}

// 3d renderer
const r0 = {
  domId: 'layout-1-1',
  domElement: null,
  renderer: null,
  color: 0x212121,
  targetID: 0,
  camera: null,
  controls: null,
  scene: null,
  light: null,
  offset: null
};

// 2d axial renderer
const r1 = {
  domId: 'layout-1-2',
  domElement: null,
  renderer: null,
  color: 0x121212,
  sliceOrientation: 'axial',
  sliceColor: 0xFF1744,
  targetID: 1,
  camera: null,
  controls: null,
  scene: null,
  light: null,
  stackHelper: null,
  localizerHelper: null,
  localizerScene: null,
  name: 'r1',
  offset: null
};

// 2d sagittal renderer
const r2 = {
  domId: 'layout-2-1',
  domElement: null,
  renderer: null,
  color: 0x121212,
  sliceOrientation: 'sagittal',
  sliceColor: 0xFFEA00,
  targetID: 2,
  camera: null,
  controls: null,
  scene: null,
  light: null,
  stackHelper: null,
  localizerHelper: null,
  localizerScene: null,
  name: 'r2',
  offset: null
};

// 2d coronal renderer
const r3 = {
  domId: 'layout-2-2',
  domElement: null,
  renderer: null,
  color: 0x121212,
  sliceOrientation: 'coronal',
  sliceColor: 0x76FF03,
  targetID: 3,
  camera: null,
  controls: null,
  scene: null,
  light: null,
  stackHelper: null,
  localizerHelper: null,
  localizerScene: null,
  name: 'r3',
  offset: null
};

const segDummy = {
  domId: null,
  domElement: null,
  targetID: null,
  gui: null,
  guiParam : {},
  spaceLength : {
    x: 256,
    y: 256,
    z: 64
  },
  renderer : null,
  scene : null,
  camera : null,
  container : null,
  shaderMat : null,
  boxHelper : null,
  screenContainer : null,
  style: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  offset: null
}

const segR1 = {

}

const segR11 = {
  domId: r1.domId,
  domElement: null,
  targetID: 11,
  gui: null,
  guiParam : {},
  spaceLength : {
    x: 256,
    y: 256,
    z: 64
  },
  renderer : null,
  scene : null,
  camera : null,
  container : null,
  shaderMat : null,
  boxHelper : null,
  screenContainer : null,
  style: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  texture: null,
  offset: null
}
const segR12 = {
  domId: r1.domId,
  domElement: null,
  targetID: 12,
  gui: null,
  guiParam : {},
  spaceLength : {
    x: 256,
    y: 256,
    z: 64
  },
  renderer : null,
  scene : null,
  camera : null,
  container : null,
  shaderMat : null,
  boxHelper : null,
  screenContainer : null,
  style: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  texture: null,
  offset: null
}

const segR13 = {
  domId: r1.domId,
  domElement: null,
  targetID: 13,
  gui: null,
  guiParam : {},
  spaceLength : {
    x: 256,
    y: 256,
    z: 64
  },
  renderer : null,
  scene : null,
  camera : null,
  container : null,
  shaderMat : null,
  boxHelper : null,
  screenContainer : null,
  style: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  texture: null,
  offset: null
}

const segR14 = {
  domId: r1.domId,
  domElement: null,
  targetID: 14,
  gui: null,
  guiParam : {},
  spaceLength : {
    x: 256,
    y: 256,
    z: 64
  },
  renderer : null,
  scene : null,
  camera : null,
  container : null,
  shaderMat : null,
  boxHelper : null,
  screenContainer : null,
  style: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  texture: null,
  offset: null
}
const segR21 = {
  domId: r2.domId,
  domElement: null,
  targetID: 21,
  gui: null,
  guiParam : {},
  spaceLength : {
    x: 256,
    y: 256,
    z: 64
  },
  renderer : null,
  scene : null,
  camera : null,
  container : null,
  shaderMat : null,
  boxHelper : null,
  screenContainer : null,
  style: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  texture: null,
  offset: null
}
const segR22 = {
  domId: r2.domId,
  domElement: null,
  targetID: 22,
  gui: null,
  guiParam : {},
  spaceLength : {
    x: 256,
    y: 256,
    z: 64
  },
  renderer : null,
  scene : null,
  camera : null,
  container : null,
  shaderMat : null,
  boxHelper : null,
  screenContainer : null,
  style: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  texture: null,
  offset: null
}

const segR23 = {
  domId: r2.domId,
  domElement: null,
  targetID: 23,
  gui: null,
  guiParam : {},
  spaceLength : {
    x: 256,
    y: 256,
    z: 64
  },
  renderer : null,
  scene : null,
  camera : null,
  container : null,
  shaderMat : null,
  boxHelper : null,
  screenContainer : null,
  style: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  texture: null,
  offset: null
}

const segR24 = {
  domId: r2.domId,
  domElement: null,
  targetID: 24,
  gui: null,
  guiParam : {},
  spaceLength : {
    x: 256,
    y: 256,
    z: 64
  },
  renderer : null,
  scene : null,
  camera : null,
  container : null,
  shaderMat : null,
  boxHelper : null,
  screenContainer : null,
  style: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  texture: null,
  offset: null
}
const segR31 = {
  domId: r3.domId,
  domElement: null,
  targetID: 31,
  gui: null,
  guiParam : {},
  spaceLength : {
    x: 256,
    y: 256,
    z: 64
  },
  renderer : null,
  scene : null,
  camera : null,
  container : null,
  shaderMat : null,
  boxHelper : null,
  screenContainer : null,
  style: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  texture: null,
  offset: null
}
const segR32 = {
  domId: r3.domId,
  domElement: null,
  targetID: 32,
  gui: null,
  guiParam : {},
  spaceLength : {
    x: 256,
    y: 256,
    z: 64
  },
  renderer : null,
  scene : null,
  camera : null,
  container : null,
  shaderMat : null,
  boxHelper : null,
  screenContainer : null,
  style: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  texture: null,
  offset: null
}

const segR33 = {
  domId: r3.domId,
  domElement: null,
  targetID: 33,
  gui: null,
  guiParam : {},
  spaceLength : {
    x: 256,
    y: 256,
    z: 64
  },
  renderer : null,
  scene : null,
  camera : null,
  container : null,
  shaderMat : null,
  boxHelper : null,
  screenContainer : null,
  style: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  texture: null,
  offset: null
}

const segR34 = {
  domId: r3.domId,
  domElement: null,
  targetID: 34,
  gui: null,
  guiParam : {},
  spaceLength : {
    x: 256,
    y: 256,
    z: 64
  },
  renderer : null,
  scene : null,
  camera : null,
  container : null,
  shaderMat : null,
  boxHelper : null,
  screenContainer : null,
  style: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  texture: null,
  offset: null
}

let gDicomStack = null;
function getDicomStack () {
  return gDicomStack;
};

// extra variables to show mesh plane intersections in 2D renderers
let sceneClip = new THREE.Scene();
let eventListener = null;
let isPause = false

/**
 * Initialize Render and run animation loop
 */
export function init () {
  /**
   * Called on each animation frame
   */
  // let sl = 0;

  function animate () {

    if (isPause) {
      return
    }
    // we are ready when both meshes have been loaded
    if (ready) {
      // update each cameras
      r0.controls.update();
      r1.controls.update();
      r2.controls.update();
      r3.controls.update();

      if (shouldShowSegmentation) {
        segR11.controls.update();
        segR12.controls.update();
        segR13.controls.update();
        segR14.controls.update();

        segR21.controls.update();
        segR22.controls.update();
        segR23.controls.update();
        segR24.controls.update();

        segR31.controls.update();
        segR32.controls.update();
        segR33.controls.update();
        segR34.controls.update();
      }

      r0.light.position.copy(r0.camera.position);
      r0.renderer.render(r0.scene, r0.camera);

      // render for each orthogonal views
      renderDo(r1);
      renderDo(r2);
      renderDo(r3);
      if (shouldShowSegmentation) {
        renderSeg(segR11);
        renderSeg(segR12);
        renderSeg(segR13);
        renderSeg(segR14);

        renderSeg(segR21);
        renderSeg(segR22);
        renderSeg(segR23);
        renderSeg(segR24);

        renderSeg(segR31);
        renderSeg(segR32);
        renderSeg(segR33);
        renderSeg(segR34);
      }

    }
    // request new frame
    requestAnimationFrame(function () {
      animate();
    });
  }

  function renderSeg(render) {
    render.renderer.clear();
    render.renderer.render( render.scene, render.camera );

    // mesh
    render.renderer.clearDepth();
    render.renderer.render(render.scene, render.camera);
  };

  function renderDo (render) {
    render.renderer.clear();
    render.renderer.render(render.scene, render.camera);
    // mesh
    render.renderer.clearDepth();
    render.renderer.render(sceneClip, render.camera);
    // localizer
    render.renderer.clearDepth();
    render.renderer.render(render.localizerScene, render.camera);
  }

  if (ready) {
    // console.log('Already setup');
    clearThree(r0.scene);
    clearThree(r1.scene);
    clearThree(r2.scene);
    clearThree(r3.scene);

    // if (shouldShowSegmentation) {
      clearThree(segR11.scene);
      clearThree(segR12.scene);
      clearThree(segR13.scene);
      clearThree(segR14.scene);

      clearThree(segR21.scene);
      clearThree(segR22.scene);
      clearThree(segR23.scene);
      clearThree(segR24.scene);

      clearThree(segR31.scene);
      clearThree(segR32.scene);
      clearThree(segR33.scene);
      clearThree(segR34.scene);
    // }
  } else {
    // console.log('First time');
  }
  initRenderer3D(r0);
  initRenderer2D(r3);
  initRenderer2D(r2);
  initRenderer2D(r1);

  // if (shouldShowSegmentation) {
    initSegment(segR11);
    initSegment(segR12);
    initSegment(segR13);
    initSegment(segR14);

    initSegment(segR21);
    initSegment(segR22);
    initSegment(segR23);
    initSegment(segR24);

    initSegment(segR31);
    initSegment(segR32);
    initSegment(segR33);
    initSegment(segR34);
  // }

  // initGui();    // TODO : initGui(rendererObj)
  // start rendering loop
  animate();
}

/**
 * Clean all sceen
 * @param scene To clean scene
 */
function clearThree (scene) {
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
}

/**
 * Initialize perspective camera, light, view control in 3D
 * @param renderObj
 */
function initRenderer3D (renderObj) {
  // renderer
  if (renderObj.domElement === null) {
    renderObj.domElement = document.getElementById(renderObj.domId);
  } else {
    return;
  }

  if (renderObj.renderer === null) {
    renderObj.renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true
    });
    renderObj.renderer.setSize(renderObj.domElement.clientWidth, renderObj.domElement.clientHeight);
    renderObj.renderer.setClearColor(renderObj.color, 1);
    renderObj.renderer.domElement.id = renderObj.targetID;
  }

  renderObj.domElement.appendChild(renderObj.renderer.domElement);

  if (renderObj.domElement == null) {
    return;
  }
  // camera
  if (renderObj.camera === null) {
    renderObj.camera = new THREE.PerspectiveCamera(
      45, renderObj.domElement.clientWidth / renderObj.domElement.clientHeight, 0.1, 100000);
    renderObj.camera.position.x = 250;
    renderObj.camera.position.y = 250;
    renderObj.camera.position.z = 250;
  }

  // controls
  if (renderObj.controls === null) {
    renderObj.controls = new Medic3D.Controls.Trackball(renderObj.camera, renderObj.domElement);
    renderObj.controls.rotateSpeed = 5.5;
    renderObj.controls.zoomSpeed = 1.2;
    renderObj.controls.panSpeed = 0.8;
    renderObj.controls.staticMoving = true;
    renderObj.controls.dynamicDampingFactor = 0.3;
  }

  // scene
  if (renderObj.scene === null) {
    renderObj.scene = new THREE.Scene();
  }

  // light
  if (renderObj.light === null) {
    renderObj.light = new THREE.DirectionalLight(0xffffff, 1);
    renderObj.light.position.copy(renderObj.camera.position);
    renderObj.scene.add(renderObj.light);
  }

  computeOffset(renderObj);
}

/**
 * Initialize orthogonal camera, light, view control in 2D
 * Disable rotate
 * @param renderObj
 */
function initRenderer2D (rendererObj) {
  // renderer
  if (rendererObj.domElement === null) {
    rendererObj.domElement = document.getElementById(rendererObj.domId);
  } else {
    return;
  }

  rendererObj.renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true
  });
  rendererObj.renderer.autoClear = false;
  rendererObj.renderer.localClippingEnabled = true;
  rendererObj.renderer.setSize(rendererObj.domElement.clientWidth, rendererObj.domElement.clientHeight);
  rendererObj.renderer.setClearColor(0x121212, 1);
  rendererObj.renderer.domElement.id = rendererObj.targetID;
  rendererObj.domElement.appendChild(rendererObj.renderer.domElement);

  // camera
  rendererObj.camera = new Medic3D.Cameras.Orthographic(
    rendererObj.domElement.clientWidth / -2,
    rendererObj.domElement.clientWidth / 2,
    rendererObj.domElement.clientHeight / 2,
    rendererObj.domElement.clientHeight / -2,
    1, 1000);

  // controls
  rendererObj.controls = new Medic3D.Controls.TrackballOrtho(rendererObj.camera, rendererObj.domElement);
  rendererObj.controls.staticMoving = true;
  rendererObj.controls.noRotate = false;
  rendererObj.camera.controls = rendererObj.controls;

  // scene
  rendererObj.scene = new THREE.Scene();

  computeOffset(rendererObj);
}

function resetSegmentation() {
  reports = [];
  shouldShowSegmentation = false;
}

export function loadZip (uploadedFile, cb) {
  eventListener = cb;
  return new Promise((resolve, reject) => {
    JSZIP.loadAsync(uploadedFile)
      .then(function (zip) {
        clearWidgets();
        return extractZip(zip, 'uint8array');
      })
      .then(function (buffer) {
        // console.log('Extracted zip files is read');
        let LoadersVolume = Medic3D.Loaders.Volume    // export default { Volume }
        let loader = new LoadersVolume()
        loader.loadZip(buffer)  //
          .then(function () {

            resetSegmentation();
            // {Array.<ModelsSeries>} Array of series properly merged.
            let series = loader.data[0].mergeSeries(loader.data)[0] // loader.data = series
            loader.free()
            loader = null

            // get first stack from series
            let stack = series.stack[0]
            stack.prepare()

            // To decide what type of split window(1*1, 2*2)
            // Split is set as 1*1 if slice is one
            // domIDs are already defined as layout-1-1, layout-1-2, layout-2-1, layout-2-2
            // center 3d camera/control on the stack
            let centerLPS = stack.worldCenter();
            r0.camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
            r0.camera.updateProjectionMatrix();
            r0.controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);

            // bouding box
            r0.scene.add(new Medic3D.Helpers.BoundingBox(stack));

            combineMpr(r0, r1, stack);
            combineMpr(r0, r2, stack);
            combineMpr(r0, r3, stack);


            initHelpersLocalizerAll(stack);

            // add click event
            r0.domElement.addEventListener('click', onClick);
            r1.domElement.addEventListener('click', onClick);
            r2.domElement.addEventListener('click', onClick);
            r3.domElement.addEventListener('click', onClick);
            // segR11.domElement.addEventListener('click', onClick);
            // segR12.domElement.addEventListener('click', onClick);
            // segR13.domElement.addEventListener('click', onClick);
            // segR14.domElement.addEventListener('click', onClick);
            // add scroll event
            r1.controls.addEventListener('OnScroll', onScroll);
            r2.controls.addEventListener('OnScroll', onScroll);
            r3.controls.addEventListener('OnScroll', onScroll);
            // segR11.controls.addEventListener('OnScroll', onScroll);
            // segR12.controls.addEventListener('OnScroll', onScroll);
            // segR13.controls.addEventListener('OnScroll', onScroll);
            // segR14.controls.addEventListener('OnScroll', onScroll);
            // add others event
            r1.controls.addEventListener('mousedown', onDown);
            r1.controls.addEventListener('mousemove', onMove);
            r1.controls.addEventListener('mouseup', onUp);
            // segR11.controls.addEventListener('mousedown', onDown);
            // segR11.controls.addEventListener('mousemove', onMove);
            // segR11.controls.addEventListener('mouseup', onUp);
            // segR12.controls.addEventListener('mousedown', onDown);
            // segR12.controls.addEventListener('mousemove', onMove);
            // segR12.controls.addEventListener('mouseup', onUp);
            // segR13.controls.addEventListener('mousedown', onDown);
            // segR13.controls.addEventListener('mousemove', onMove);
            // segR13.controls.addEventListener('mouseup', onUp);
            // segR14.controls.addEventListener('mousedown', onDown);
            // segR14.controls.addEventListener('mousemove', onMove);
            // segR14.controls.addEventListener('mouseup', onUp);
            //
            // segR21.controls.addEventListener('mousedown', onDown);
            // segR21.controls.addEventListener('mousemove', onMove);
            // segR21.controls.addEventListener('mouseup', onUp);
            // segR22.controls.addEventListener('mousedown', onDown);
            // segR22.controls.addEventListener('mousemove', onMove);
            // segR22.controls.addEventListener('mouseup', onUp);
            // segR23.controls.addEventListener('mousedown', onDown);
            // segR23.controls.addEventListener('mousemove', onMove);
            // segR23.controls.addEventListener('mouseup', onUp);
            // segR24.controls.addEventListener('mousedown', onDown);
            // segR24.controls.addEventListener('mousemove', onMove);
            // segR24.controls.addEventListener('mouseup', onUp);
            //
            // segR31.controls.addEventListener('mousedown', onDown);
            // segR31.controls.addEventListener('mousemove', onMove);
            // segR31.controls.addEventListener('mouseup', onUp);
            // segR32.controls.addEventListener('mousedown', onDown);
            // segR32.controls.addEventListener('mousemove', onMove);
            // segR32.controls.addEventListener('mouseup', onUp);
            // segR33.controls.addEventListener('mousedown', onDown);
            // segR33.controls.addEventListener('mousemove', onMove);
            // segR33.controls.addEventListener('mouseup', onUp);
            // segR34.controls.addEventListener('mousedown', onDown);
            // segR34.controls.addEventListener('mousemove', onMove);
            // segR34.controls.addEventListener('mouseup', onUp);

            window.addEventListener('resize', onWindowResize, false);
            ready = true;
            gDicomStack = stack;
            // r1.camera.rotate();
            // r1.camera.rotate();
            r1.camera.invertColumns();
            r2.camera.rotate();
            r2.camera.rotate();
            r3.camera.rotate();
            r3.camera.rotate();
            resolve(true);
          })
      })
  });
}

/**
 *
 * @param target 3D Viewer
 * @param plane one of orthogonal view
 * @param stack series dicom
 */
function combineMpr (target, plane, stack) {
  initHelpersStack(plane, stack);
  target.scene.add(plane.scene);
}

function combineMprSeg (target, plane, stack) {
  initHelpersStackSeg(plane, stack);
  // target.scene.add(plane.scene);
}

function initHelpersLocalizerAll (stack) {
// create new mesh with Localizer shaders
  let plane1 = r1.stackHelper.slice.cartesianEquation();
  let plane2 = r2.stackHelper.slice.cartesianEquation();
  let plane3 = r3.stackHelper.slice.cartesianEquation();

// localizer red slice
  initHelpersLocalizer(r1, stack, plane1,
    [
      {
        plane: plane2,
        color: new THREE.Color(r2.stackHelper.borderColor)
      },
      {
        plane: plane3,
        color: new THREE.Color(r3.stackHelper.borderColor)
      }
    ]);

// localizer yellow slice
  initHelpersLocalizer(r2, stack, plane2,
    [
      {
        plane: plane1,
        color: new THREE.Color(r1.stackHelper.borderColor)
      },
      {
        plane: plane3,
        color: new THREE.Color(r3.stackHelper.borderColor)
      }
    ]);

// localizer green slice
  initHelpersLocalizer(r3, stack, plane3,
    [
      {
        plane: plane1,
        color: new THREE.Color(r1.stackHelper.borderColor)
      },
      {
        plane: plane2,
        color: new THREE.Color(r2.stackHelper.borderColor)
      }
    ]);
}

function extractZip (zip, type, sort) {
  var files = Object.keys(zip.files)
  var loadData;
  if (sort) {
    loadData = [256];
  } else {
    loadData = [];
  }

  files.forEach(function (filename) {
    // for sorting
    if (sort) {
      var temp = filename.split('.');
      loadData[parseInt(temp[0])] = zip.files[filename].async(type);
    } else {
      loadData.push(zip.files[filename].async(type))  // file data
    }
  })

  return Promise.all(loadData)
    .then(function (rawdata) {
      // for Dicom Tag parsing
      aDicomRawData = rawdata[0]

      return rawdata
    })
}

function extractReportZip (zip, type, sort) {
  var files = Object.keys(zip.files)
  var loadData = [256];
  var reportData = [];

  files.forEach(function (filename) {
    if (filename.includes("out")) {
      var fName = filename.substring(filename.lastIndexOf("/") + 1, filename.length);
      var name = fName.split('.');
      var index = name[0].split('_')[1];
      loadData[parseInt(index)] = zip.files[filename].async(type);
    } else if (filename.includes("report_images") && filename.endsWith("png")) {
      reportData.push(zip.files[filename].async(type));
    }
  })

  return Promise.all(reportData.concat(loadData))
    .then(function (rawdata) {
      for (var i=0; i<9; i++) {
        reports.push(rawdata[i])
      }
      return rawdata
    })
}

export function loadSegmentation (uploadedFile) {
  JSZIP.loadAsync(uploadedFile)
    .then(function (zip) {
      return extractZip(zip, 'arraybuffer', true);
    })
    .then(function (buffer) {
      return loadZipPngs(buffer)
    })
    .then(function (data) {
      // console.log('Loaded seg. ' + data.length);

      var stack = getDicomStack();
      if (stack !== null) {
        // console.log('rawdata size ' + stack.rawData.length);
        // console.log('stack._frame.length ' + stack._frame.length);
        // console.log('stack.rawData.length ' + stack.rawData.length);

        var newVal;
        for (var fr = 0; fr < stack._frame.length; fr++) {
          for (var y = 0; y < 256; y++) {
            for (var x = 0; x < 256; x++) {
              var po = (y * 255 + x) * 4;
              if (data[fr].data[po] !== 0 ||
                data[fr].data[po + 1] !== 0 ||
                data[fr].data[po + 2] !== 0) {
                newVal = (data[fr].data[po] + data[fr].data[po + 1] + data[fr].data[po + 2]) / 3
                stack._frame[fr]._pixelData[y * 255 + x] = newVal;
              }
            }
          }
        }

        removeSceneByName(r1);
        removeSceneByName(r2);
        removeSceneByName(r3);

        combineMpr(r0, r1, getDicomStack());
        combineMpr(r0, r2, getDicomStack());
        combineMpr(r0, r3, getDicomStack());
      }
    });
}

// Todo : to create slice mesh for display segmentation.
// Slice has to be transference
export function loadSegmentation_org (uploadedFile) {
  JSZIP.loadAsync(uploadedFile)
    .then(function (zip) {
      return extractZip(zip, 'arraybuffer', true);
    })
    .then(function (buffer) {
      return loadZipPngs(buffer)
    })
    .then(function (data) {
      // console.log('Loaded seg. ' + data.length);

      var stack = getDicomStack();
      if (stack !== null) {
        // console.log('rawdata size ' + stack.rawData.length);
        // console.log('stack._frame.length ' + stack._frame.length);
        // console.log('stack.rawData.length ' + stack.rawData.length);

        var newVal;
        for (var fr = 0; fr < stack._frame.length; fr++) {
          for (var y = 0; y < 256; y++) {
            for (var x = 0; x < 256; x++) {
              var po = (y * 255 + x) * 4;
              if (data[fr].data[po] !== 0 ||
              data[fr].data[po + 1] !== 0 ||
              data[fr].data[po + 2] !== 0) {
                newVal = (data[fr].data[po] + data[fr].data[po + 1] + data[fr].data[po + 2]) / 3
                stack._frame[fr]._pixelData[y * 255 + x] = newVal;
              }
            }
          }
        }

        removeSceneByName(r1);
        removeSceneByName(r2);
        removeSceneByName(r3);

        combineMpr(r0, r1, getDicomStack());
        combineMpr(r0, r2, getDicomStack());
        combineMpr(r0, r3, getDicomStack());
      }
    });
}

export function loadSegmentationLocal (segUrl, fileName) {
  return new Promise((resolve, reject) => {
    Request({
      method: 'GET',
      // url: 'http://' + location.host + '/static/seg/4-vuno-seg.zip',
      url: segUrl,
      encoding: null // <- this one is important !
    }, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        // handle error
        // console.log('#loadSegmentationLocal : ' + error);
        return;
      }
      JSZIP.loadAsync(body)
        .then(function (zip) {
          return extractReportZip(zip, 'arraybuffer', true);
        })
        .then(function (buffer) {
          return loadZipPngs(buffer)
        })
        .then(function (data) {
          // console.log('Loaded seg. ' + data.length);
          // reports = data.slice(0, 9);

          // localSegmentFileName = fileName
          console.log(localSegmentFileName)

          segR11.texture = data[9];
          segR12.texture = data[10];
          segR13.texture = data[11];
          segR14.texture = data[12];
          segR21.texture = data[13];
          segR22.texture = data[14];
          segR23.texture = data[15];
          segR24.texture = data[16];
          segR31.texture = data[17];
          segR32.texture = data[18];
          segR33.texture = data[19];
          segR34.texture = data[20];


          var stack = getDicomStack();
          if (stack !== null) {
            shouldShowSegmentation = true;

            initScreen(segR11, fileName);
            initScreen(segR12, fileName);
            initScreen(segR13, fileName);
            initScreen(segR14, fileName);

            initScreen(segR21, fileName);
            initScreen(segR22, fileName);
            initScreen(segR23, fileName);
            initScreen(segR24, fileName);

            initScreen(segR31, fileName);
            initScreen(segR32, fileName);
            initScreen(segR33, fileName);
            initScreen(segR34, fileName);

            combineMprSeg(r0, segR11, stack);
            combineMprSeg(r0, segR12, stack);
            combineMprSeg(r0, segR13, stack);
            combineMprSeg(r0, segR14, stack);

            combineMprSeg(r0, segR21, stack);
            combineMprSeg(r0, segR22, stack);
            combineMprSeg(r0, segR23, stack);
            combineMprSeg(r0, segR24, stack);

            combineMprSeg(r0, segR31, stack);
            combineMprSeg(r0, segR32, stack);
            combineMprSeg(r0, segR33, stack);
            combineMprSeg(r0, segR34, stack);

            initSegRender(r1.domId);
            initSegRender(r2.domId);
            initSegRender(r3.domId);

            adjustR1Orientation()

            resolve(true);
          }
        });
    });
  });
}

function removeSceneByName (render) {
  var selectedObj = r0.scene.getObjectByName(render.name);
  if (selectedObj === null) {
    // console.log('Not found Object3D ' + render.name);
    return;
  } else {
    // console.log('Found Object3D ' + render.name);
  }
  r0.scene.remove(r0.scene.getObjectByName(render.name));
  render.scene.remove(render.scene.getObjectByName(render.name));
}

function loadZipPngs_old (zip) {
  const loadSequencesSeg = [];

  zip.forEach((rawdata) => {
    loadSequencesSeg.push(
      loadSegmentationRawdata(rawdata)
    );
  });

  return Promise.all(loadSequencesSeg);
}


function loadZipPngs (zip) {
  const loadSequencesSeg = [];

  zip.forEach((rawdata) => {
    if (rawdata instanceof ArrayBuffer) {
      loadSequencesSeg.push(
        loadSegmentationRawdata(rawdata)
      );
    }
  });

  return Promise.all(loadSequencesSeg);
}

function loadSegmentationRawdata (rawdata) {
  return new Promise((resolve, reject) => {
    new PNG({filterType: 4}).parse(rawdata, function (error, data) {
      if (error) {
        // console.log('Error : ' + error);
      }
      // console.log('loaded png' + data);
      resolve(data);
    });
  });
}

function loadSegmentationRawdata_old (rawdata) {
  return new Promise((resolve, reject) => {
    new PNG({filterType: 4}).parse(rawdata, function (error, data) {
      if (error) {
        // console.log('Error : ' + error);
      }
      // console.log('loaded png' + data);
      resolve(data);
    });
  });
}

function initHelpersStack (rendererObj, stack) {
  rendererObj.stackHelper = new Medic3D.Helpers.Stack(stack); // create texture, bbox, slice
  rendererObj.stackHelper.bbox.visible = false;
  rendererObj.stackHelper.borderColor = rendererObj.sliceColor;
  rendererObj.stackHelper.slice.canvasWidth = rendererObj.domElement.clientWidth;
  rendererObj.stackHelper.slice.canvasHeight = rendererObj.domElement.clientHeight;

  // for removing THREE.Object3D by name
  rendererObj.stackHelper.name = rendererObj.name;

  // set camera
  let worldbb = stack.worldBoundingBox();
  let lpsDims = new THREE.Vector3(
    (worldbb[1] - worldbb[0]) / 2,
    (worldbb[3] - worldbb[2]) / 2,
    (worldbb[5] - worldbb[4]) / 2
  );

  let box = {
    center: stack.worldCenter().clone(),
    halfDimensions:
      new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10)
  };

  // init and zoom
  let canvas = {
    width: rendererObj.domElement.clientWidth,
    height: rendererObj.domElement.clientHeight
  };

  rendererObj.camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
  rendererObj.camera.box = box;
  rendererObj.camera.canvas = canvas;
  rendererObj.camera.orientation = rendererObj.sliceOrientation;
  rendererObj.camera.update();
  rendererObj.camera.fitBox(2, 1);  // direction, factor
  rendererObj.stackHelper.orientation = rendererObj.camera.stackOrientation;
  rendererObj.stackHelper.index = Math.floor(rendererObj.stackHelper.orientationMaxIndex / 2);  // move to mid of slice
  rendererObj.scene.add(rendererObj.stackHelper); // stackHelper extends THREE.Object3D
}

function initHelpersStackSeg (rendererObj, stack) {

  rendererObj.stackHelper = new Medic3D.Helpers.Stack(stack); // create texture, bbox, slice
  // set camera
  let worldbb = stack.worldBoundingBox();
  let lpsDims = new THREE.Vector3(
    (worldbb[1] - worldbb[0]) / 2,
    (worldbb[3] - worldbb[2]) / 2,
    (worldbb[5] - worldbb[4]) / 2
  );

  let center = stack.worldCenter().clone();
  center.x = 0;
  center.y = 0;

  let box = {
    center: center,
    halfDimensions:
      new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10)
  };

  // init and zoom
  let canvas = {
    width: rendererObj.domElement.clientWidth,
    height: rendererObj.domElement.clientHeight
  };

  // rendererObj.camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
  rendererObj.camera.box = box;
  rendererObj.camera.canvas = canvas;
  // rendererObj.camera.orientation = rendererObj.sliceOrientation;
  rendererObj.camera.update();
  rendererObj.camera.fitBox(2, 1);  // direction, factor
  // rendererObj.scene.add(rendererObj.stackHelper); // stackHelper extends THREE.Object3D
}

function initHelpersLocalizer (rendererObj, stack, referencePlane, localizers) {
  rendererObj.localizerHelper = new Medic3D.Helpers.Localizer(
    stack, rendererObj.stackHelper.slice.geometry, referencePlane);

  for (let i = 0; i < localizers.length; i++) {
    rendererObj.localizerHelper['plane' + (i + 1)] = localizers[i].plane;
    rendererObj.localizerHelper['color' + (i + 1)] = localizers[i].color;
  }

  rendererObj.localizerHelper.canvasWidth = rendererObj.domElement.clientWidth;
  rendererObj.localizerHelper.canvasHeight = rendererObj.domElement.clientHeight;
  rendererObj.localizerScene = new THREE.Scene();
  rendererObj.localizerScene.add(rendererObj.localizerHelper);
}

function initSegRender(id) {
  let stackHelper = null;

  let msg = {
    type: 'slice'
  };

  switch (id) {
    case r1.domId:
      stackHelper = r1.stackHelper;
      msg.view = 'r1';

      break;
    case r2.domId:
      stackHelper = r2.stackHelper;
      msg.view = 'r2';
      break;
    case r3.domId:
      stackHelper = r3.stackHelper;
      msg.view = 'r3';
      break;
    default:
      return;

  }

  stackHelper.index = 128;

  if (shouldShowSegmentation) {
    var uniforms = null;
    switch (id) {
      case r1.domId:
        if (stackHelper.index < 64) {
          uniforms = segR11.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index;

          segR12.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR13.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR14.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 <= stackHelper.index && stackHelper.index < 64 * 2) {
          uniforms = segR12.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64;

          segR11.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR13.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR14.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 * 2 <= stackHelper.index && stackHelper.index < 64 * 3) {
          uniforms = segR13.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64 * 2;

          segR11.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR12.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR14.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 * 3 <= stackHelper.index && stackHelper.index < 64 * 4) {
          uniforms = segR14.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64 * 3;

          segR11.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR12.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR13.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        }

        break;
      case r2.domId:
        if (stackHelper.index < 64) {
          uniforms = segR21.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index;

          segR22.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR23.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR24.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 <= stackHelper.index && stackHelper.index < 64 * 2) {
          uniforms = segR22.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64;

          segR21.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR23.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR24.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 * 2 <= stackHelper.index && stackHelper.index < 64 * 3) {
          uniforms = segR23.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64 * 2;

          segR21.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR22.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR24.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 * 3 <= stackHelper.index && stackHelper.index < 64 * 4) {
          uniforms = segR24.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64 * 3;

          segR21.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR22.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR23.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        }
        break;
      case r3.domId:
        if (stackHelper.index < 64) {
          uniforms = segR31.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index;

          segR32.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR33.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR34.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 <= stackHelper.index && stackHelper.index < 64 * 2) {
          uniforms = segR32.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64;

          segR31.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR33.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR34.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 * 2 <= stackHelper.index && stackHelper.index < 64 * 3) {
          uniforms = segR33.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64 * 2;

          segR31.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR32.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR34.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 * 3 <= stackHelper.index && stackHelper.index < 64 * 4) {
          uniforms = segR34.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64 * 3;

          segR31.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR32.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR33.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        }
        break;
      default:
        return;
    }
  }

  msg.slice = stackHelper.index;

  eventListener(msg);
}

function onScroll (event) {
  // console.log('# onScroll');
  const id = event.target.domElement.id;
  let stackHelper = null;

  let msg = {
    type: 'slice'
  };

  switch (id) {
    case r1.domId:
      stackHelper = r1.stackHelper;
      msg.view = 'r1';

      break;
    case r2.domId:
      stackHelper = r2.stackHelper;
      msg.view = 'r2';
      break;
    case r3.domId:
      stackHelper = r3.stackHelper;
      msg.view = 'r3';
      break;
    // case segR1.domId:
    //   var uniforms = segR1.shaderMat.uniforms;
    //   bok = bok++;
    //   uniforms.indexSliceToDisplay.value = bok;
    //   break;
    default:
      // var uniforms = segR1.shaderMat.uniforms;
      // bok = bok + 1;
      // uniforms.indexSliceToDisplay.value = bok;
      // console.log('No matched ID');
      return;

  }

  if (event.delta > 0) {
    if (stackHelper.index >= stackHelper.orientationMaxIndex - 1) {
      return false;
    }
    stackHelper.index += 1;
  } else {
    if (stackHelper.index <= 0) {
      return false;
    }
    stackHelper.index -= 1;
  }
  // onScroll for seg
  // var uniforms = null;
  // if (stackHelper.index < 64) {
  //   uniforms = segR11.shaderMat.uniforms;
  //   uniforms.indexSliceToDisplay.value = stackHelper.index;
  //
  //   segR12.shaderMat.uniforms.indexSliceToDisplay.value = -1;
  //   segR13.shaderMat.uniforms.indexSliceToDisplay.value = -1;
  //   segR14.shaderMat.uniforms.indexSliceToDisplay.value = -1;
  // } else if (64 <= stackHelper.index && stackHelper.index < 64*2) {
  //   uniforms = segR12.shaderMat.uniforms;
  //   uniforms.indexSliceToDisplay.value = stackHelper.index - 64;
  //
  //   segR11.shaderMat.uniforms.indexSliceToDisplay.value = -1;
  //   segR13.shaderMat.uniforms.indexSliceToDisplay.value = -1;
  //   segR14.shaderMat.uniforms.indexSliceToDisplay.value = -1;
  // } else if (64*2 <= stackHelper.index && stackHelper.index < 64*3) {
  //   uniforms = segR13.shaderMat.uniforms;
  //   uniforms.indexSliceToDisplay.value = stackHelper.index - 64*2;
  //
  //   segR11.shaderMat.uniforms.indexSliceToDisplay.value = -1;
  //   segR12.shaderMat.uniforms.indexSliceToDisplay.value = -1;
  //   segR14.shaderMat.uniforms.indexSliceToDisplay.value = -1;
  // } else if (64*3 <= stackHelper.index && stackHelper.index < 64*4) {
  //   uniforms = segR14.shaderMat.uniforms;
  //   uniforms.indexSliceToDisplay.value = stackHelper.index- 64*3;
  //
  //   segR11.shaderMat.uniforms.indexSliceToDisplay.value = -1;
  //   segR12.shaderMat.uniforms.indexSliceToDisplay.value = -1;
  //   segR13.shaderMat.uniforms.indexSliceToDisplay.value = -1;
  // }


  if (shouldShowSegmentation) {
    var uniforms = null;
    switch (id) {
      case r1.domId:
        if (stackHelper.index < 64) {
          uniforms = segR11.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index;

          segR12.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR13.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR14.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 <= stackHelper.index && stackHelper.index < 64 * 2) {
          uniforms = segR12.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64;

          segR11.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR13.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR14.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 * 2 <= stackHelper.index && stackHelper.index < 64 * 3) {
          uniforms = segR13.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64 * 2;

          segR11.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR12.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR14.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 * 3 <= stackHelper.index && stackHelper.index < 64 * 4) {
          uniforms = segR14.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64 * 3;

          segR11.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR12.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR13.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        }

        break;
      case r2.domId:
        if (stackHelper.index < 64) {
          uniforms = segR21.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index;

          segR22.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR23.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR24.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 <= stackHelper.index && stackHelper.index < 64 * 2) {
          uniforms = segR22.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64;

          segR21.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR23.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR24.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 * 2 <= stackHelper.index && stackHelper.index < 64 * 3) {
          uniforms = segR23.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64 * 2;

          segR21.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR22.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR24.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 * 3 <= stackHelper.index && stackHelper.index < 64 * 4) {
          uniforms = segR24.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64 * 3;

          segR21.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR22.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR23.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        }
        break;
      case r3.domId:
        if (stackHelper.index < 64) {
          uniforms = segR31.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index;

          segR32.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR33.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR34.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 <= stackHelper.index && stackHelper.index < 64 * 2) {
          uniforms = segR32.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64;

          segR31.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR33.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR34.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 * 2 <= stackHelper.index && stackHelper.index < 64 * 3) {
          uniforms = segR33.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64 * 2;

          segR31.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR32.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR34.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        } else if (64 * 3 <= stackHelper.index && stackHelper.index < 64 * 4) {
          uniforms = segR34.shaderMat.uniforms;
          uniforms.indexSliceToDisplay.value = stackHelper.index - 64 * 3;

          segR31.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR32.shaderMat.uniforms.indexSliceToDisplay.value = -1;
          segR33.shaderMat.uniforms.indexSliceToDisplay.value = -1;
        }
        break;
      default:
        return;
    }
  }

  // console.log('stackHelper ' + stackHelper.index);
  // onGreenChanged();
  // onRedChanged();
  // onYellowChanged();
  msg.slice = stackHelper.index;

  eventListener(msg);
}

function onDown (event) {
  // console.log('#down');
}

function onMove (event) {
  // console.log('#move');
}

function onUp (event) {
  // console.log('#up');
}

function windowResize2D (rendererObj) {
  rendererObj.camera.canvas = {
    width: rendererObj.domElement.clientWidth,
    height: rendererObj.domElement.clientHeight
  };
  rendererObj.camera.fitBox(2, 1);
  rendererObj.renderer.setSize(rendererObj.domElement.clientWidth, rendererObj.domElement.clientHeight);

  // update info to draw borders properly
  rendererObj.stackHelper.slice.canvasWidth = rendererObj.domElement.clientWidth;
  rendererObj.stackHelper.slice.canvasHeight = rendererObj.domElement.clientHeight;
  rendererObj.localizerHelper.canvasWidth = rendererObj.domElement.clientWidth;
  rendererObj.localizerHelper.canvasHeight = rendererObj.domElement.clientHeight;
  computeOffset(rendererObj);
}

function windowResize2DSeg (rendererObj) {
  rendererObj.camera.canvas = {
    width: rendererObj.domElement.clientWidth,
    height: rendererObj.domElement.clientHeight
  };
  rendererObj.camera.fitBox(2, 1);
  rendererObj.renderer.setSize(rendererObj.domElement.clientWidth, rendererObj.domElement.clientHeight);

  computeOffset(rendererObj);
}

function onWindowResize () {
  // update 3D
  r0.camera.aspect = r0.domElement.clientWidth / r0.domElement.clientHeight;
  r0.camera.updateProjectionMatrix();
  r0.renderer.setSize(r0.domElement.clientWidth, r0.domElement.clientHeight);

  // update 2d
  windowResize2D(r1);
  windowResize2D(r2);
  windowResize2D(r3);

  if (shouldShowSegmentation) {
    windowResize2DSeg(segR11);
    windowResize2DSeg(segR12);
    windowResize2DSeg(segR13);
    windowResize2DSeg(segR14);

    windowResize2DSeg(segR21);
    windowResize2DSeg(segR22);
    windowResize2DSeg(segR23);
    windowResize2DSeg(segR24);

    windowResize2DSeg(segR31);
    windowResize2DSeg(segR32);
    windowResize2DSeg(segR33);
    windowResize2DSeg(segR34);
  }

  computeOffset(r0);
}

function computeOffset (renderObj) {
  let box = renderObj.domElement.getBoundingClientRect();
  const body = document.body;
  const docEl = document.documentElement;

  const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
  const scrollLeft =
    window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

  const clientTop = docEl.clientTop || body.clientTop || 0;
  const clientLeft = docEl.clientLeft || body.clientLeft || 0;

  const top = box.top + scrollTop - clientTop;
  const left = box.left + scrollLeft - clientLeft;

  renderObj.offset = {
    top: Math.round(top),
    left: Math.round(left)
  };

  // repaint all widgets
  for (let widget of widgets) {
    widget.update();
  }
}

function onClick (event) {
  // console.log('#onClick' + event);
}

export function Zoom (id, action) {
  if (id === r0.domId) {
    let delta = 3;
    if (action) {
      delta = -3;
    }
    CameraCtrl3D(delta);
  } else {
    CameraCtrl2D(id, action);
  }
}

/**
 * Zoom control
 * @param id selected div's id
 * @param action : true - zoomin, false - zoomout
 * @constructor
 */
function CameraCtrl2D (id, action) {
  let selected = getView(id);
  let seg = null;
  if (selected === null) {
    return;
  }

  let val;
  if (action) {
    val = -0.1;
  } else {
    val = 0.1;
  }

  if (shouldShowSegmentation) {
    switch (id) {
      case r1.domId:
        segCameraCtrl2D(segR11, val)
        segCameraCtrl2D(segR12, val)
        segCameraCtrl2D(segR13, val)
        segCameraCtrl2D(segR14, val)
        break;
      case r2.domId:
        segCameraCtrl2D(segR21, val)
        segCameraCtrl2D(segR22, val)
        segCameraCtrl2D(segR23, val)
        segCameraCtrl2D(segR24, val)
        break;
      case r3.domId:
        segCameraCtrl2D(segR31, val)
        segCameraCtrl2D(segR32, val)
        segCameraCtrl2D(segR33, val)
        segCameraCtrl2D(segR34, val)
        break;
      default:
      // console.log('unselected or r1 is selected');
    }
  }
  selected.camera.zoom += val;
  selected.camera.updateProjectionMatrix();

  computeOffset(r1)
  computeOffset(r2)
  computeOffset(r3)
}

function segCameraCtrl2D(render, val) {
  render.camera.zoom += val;
  render.camera.updateProjectionMatrix();
}

function CameraCtrl3D (delta) {
  r0.controls.zoomCtrl(delta);
}

export function Fit (id) {
  let selected = getView(id);
  let seg = null;
  if (selected === null) {
    return;
  }

  if (shouldShowSegmentation) {
    switch (id) {
      case r1.domId:
        segFitBox(segR11)
        segFitBox(segR12)
        segFitBox(segR13)
        segFitBox(segR14)
        break;
      case r2.domId:
        segFitBox(segR21)
        segFitBox(segR22)
        segFitBox(segR23)
        segFitBox(segR24)
        break;
      case r3.domId:
        segFitBox(segR31)
        segFitBox(segR32)
        segFitBox(segR33)
        segFitBox(segR34)
        break;
      default:
      // console.log('unselected or r1 is selected');
    }
  }

  selected.camera.fitBox(2, 0.9);
}

function segFitBox(render) {
  render.camera.fitBox(2, 0.9);
}

/**
 * To fit view
 * @param id selected div's id
 * @return {*}
 */
function getView (id) {
  let selected = null;
  switch (id) {
    case r1.domId:
      selected = r1;
      break;
    case r2.domId:
      selected = r2;
      break;
    case r3.domId:
      selected = r3;
      break;
    default:
      // console.log('unselected or r1 is selected');
  }

  return selected;
}

export function Invert () {
  if (r1.stackHelper !== null && r1.stackHelper.slice !== null) {
    let newVal;
    if (r1.stackHelper.slice.invert) {
      newVal = false;
    } else {
      newVal = true;
    }
    r1.stackHelper.slice.invert = newVal;
    r2.stackHelper.slice.invert = newVal;
    r3.stackHelper.slice.invert = newVal;
  }
}

export function Horizontal (id) {
  switch (id) {
    case r1.domId:
      r1.camera.invertColumns();
      segR11.camera.invertColumns();
      segR12.camera.invertColumns();
      segR13.camera.invertColumns();
      segR14.camera.invertColumns();
      break;
    case r2.domId:
      r2.camera.invertColumns();
      segR21.camera.invertColumns();
      segR22.camera.invertColumns();
      segR23.camera.invertColumns();
      segR24.camera.invertColumns();
      break;
    case r3.domId:
      r3.camera.invertColumns();
      segR31.camera.invertColumns();
      segR32.camera.invertColumns();
      segR33.camera.invertColumns();
      segR34.camera.invertColumns();
      break;
    default:
  }
}

export function Vertical (id) {
  switch (id) {
    case r1.domId:
      r1.camera.invertRows();
      segR11.camera.invertRows();
      segR12.camera.invertRows();
      segR13.camera.invertRows();
      segR14.camera.invertRows();
      break;
    case r2.domId:
      r2.camera.invertRows();
      segR22.camera.invertRows();
      segR23.camera.invertRows();
      segR24.camera.invertRows();
      break;
    case r3.domId:
      r3.camera.invertRows();
      segR32.camera.invertRows();
      segR33.camera.invertRows();
      segR34.camera.invertRows();
      break;
    default:
  }
}

function  adjustR1Orientation () {
  // r1.camera.invertRows();
  segR11.camera.invertRows();
  segR12.camera.invertRows();
  segR13.camera.invertRows();
  segR14.camera.invertRows();
}

export function CameraCtrl (enable) {
  // console.log('#cam ctrl ' + enable)
  r1.controls.viewcontrol = enable;
  r2.controls.viewcontrol = enable;
  r3.controls.viewcontrol = enable;

  if (shouldShowSegmentation) {
    segR11.controls.viewcontrol = enable;
    segR12.controls.viewcontrol = enable;
    segR13.controls.viewcontrol = enable;
    segR14.controls.viewcontrol = enable;
    segCameraCtrl(segR11, enable);
    segCameraCtrl(segR12, enable);
    segCameraCtrl(segR13, enable);
    segCameraCtrl(segR14, enable);

    segCameraCtrl(segR21, enable);
    segCameraCtrl(segR22, enable);
    segCameraCtrl(segR23, enable);
    segCameraCtrl(segR24, enable);

    segCameraCtrl(segR31, enable);
    segCameraCtrl(segR32, enable);
    segCameraCtrl(segR33, enable);
    segCameraCtrl(segR34, enable);
  }
}

function segCameraCtrl(render, enable) {
  render.controls.viewcontrol = enable;
}

export function adjustBrightness (delta) {
  if (r1.stackHelper !== null) {
    let val = delta / 5;
    r1.stackHelper.slice.windowCenter += val;
    // bug fixed : Apply same windowCenter for every stack
    r2.stackHelper.slice.windowCenter = r1.stackHelper.slice.windowCenter;
    r3.stackHelper.slice.windowCenter = r1.stackHelper.slice.windowCenter;
  }
}

/**
 * To do something for annotation
 * @param action : mouse type
 * @param event : mouse event
 */
export function doAnnotation (id, action, event) {
  let selected = getView(id);
  if (selected === null) {
    return;
  }

  switch (event.type) {
    case 'mousedown':
      downAnnotation(action, event, selected);
      break;
    case 'mousemove':
      moveAnnotation(action, event, selected);
      break;
    case 'mouseup':
      upAnnotation(action, event, selected);
      break;
  }
}

let widgets = [];
let widgetIndex = 0;
function downAnnotation (action, evt, element) {
  // if something hovered, exit
  // console.log('## widget  ##');
  for (let widget of widgets) {
    if (widget.hovered) {
      widget.onStart(evt);
      // console.log('## widget : hovered');
      if (action === 'PolyRuler') {
      //   polyEvent = evt;
        // console.log('## create ruler');
        let w = createWidget(action, evt, element);
        w.hovered = true;
      }
      return;
    }
  }
  createWidget(action, evt, element);
}

function createWidget (action, evt, element) {
  var threeD = element.domElement;
  if (threeD === null) {
    return;
  }

  var camera = element.camera;
  var stackHelper = element.stackHelper;

  threeD.style.cursor = 'default';

  // mouse position
  let mouse = {
    x: (evt.clientX - element.offset.left) / threeD.offsetWidth * 2 - 1,
    y: -((evt.clientY - element.offset.top) / threeD.offsetHeight) * 2 + 1
  };

  if (camera && camera.isOrthographicCamera) {
    // console.log('###Orthogonal view');
  } else if (camera && camera.isPerspectiveCamera) {
    // console.log('###Perspective view');
  }

  let raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  // update the raycaster
  let intersects = raycaster.intersectObject(stackHelper.slice.mesh);
  if (intersects.length <= 0) {
    // console.log('## no raycasting');
    // return;
  } else {
    // console.log('## raycasting count is ' + intersects.length);
  }

  var controls = element.controls;
  let widget = null;
  switch (action) {
    case 'Ruler':
    case 'PolyRuler':
      // console.log('## create ruler widget');
      widget = new Medic3D.Widgets.Ruler(stackHelper.slice.mesh, controls, camera, threeD);
      widget.worldPosition = intersects[0].point;
      widget.name = 'Ruler-' + widgetIndex;
      break;
    case 'Annotation':
      widget = new Medic3D.Widgets.Annotation(stackHelper.slice.mesh, controls, camera, threeD);
      widget.worldPosition = intersects[0].point;
      widget.name = 'Annotation-' + widgetIndex;
      break;
    case 'Biruler':
    case 'Protractor':
      widget = new Medic3D.Widgets.BiRuler(stackHelper.slice.mesh, controls, camera, threeD);
      widget.worldPosition = intersects[0].point;
      widget.name = 'Biruler-' + widgetIndex;
      break;
    default:
      widget = new Medic3D.Widgets.Handle(stackHelper.slice.mesh, controls, camera, threeD);
      widget.worldPosition = intersects[0].point;
      widget.name = 'Unknown-' + widgetIndex;
      break;
  }
  widgetIndex++;

  widgets.push(widget);

  return widget;
}

function moveAnnotation (action, evt, element) {
  var threeD = element.domElement;
  if (threeD === null) {
    return;
  }

  // if something hovered, exit
  let cursor = 'default';
  for (let widget of widgets) {
    widget.onMove(evt);
    if (widget.hovered) {
      cursor = 'pointer';
    }
  }

  threeD.style.cursor = cursor;
}

function upAnnotation (action, evt, element) {
  // if something hovered, exit
  for (let widget of widgets) {
    if (widget.active) {
      widget.onEnd(evt);
      return;
    }
  }
}

function clearWidgets () {
  for (let widget of widgets) {
    widget.hide();
  }
}

/**
 * rano
 */
function initSegment(rendererObj){
  if (rendererObj.domElement === null) {
  rendererObj.domElement = document.getElementById(rendererObj.domId);
  } else {
    return;
  }

  // segR1.domElement = document.getElementsByClassName('layout-area')[0]
  // segR1.domElement = document.getElementById("seg");
  // init renderer
  rendererObj.renderer = new THREE.WebGLRenderer( { antialias: false, alpha: true, preserveDrawingBuffer: true } );
  // segR1.renderer.setPixelRatio( window.devicePixelRatio );
  rendererObj.renderer.localClippingEnabled = true;
  rendererObj.renderer.setSize(rendererObj.domElement.clientWidth, rendererObj.domElement.clientHeight);
  rendererObj.renderer.setClearColor(0x000000, 0);
  rendererObj.renderer.domElement.id = rendererObj.targetID;
  rendererObj.domElement.appendChild( rendererObj.renderer.domElement );

  // style
  for(var prop in rendererObj.style) {
    rendererObj.renderer.domElement.style[prop] = rendererObj.style[prop];
  }
  // TODO: remove this
  // rendererObj.renderer.domElement.style.opacity = '0.2'

  // THREE environment
  rendererObj.scene = new THREE.Scene();
  // segR1.camera = new THREE.PerspectiveCamera( 175, window.innerWidth / window.innerHeight, 0.1, 1000 );
  rendererObj.camera = new Medic3D.Cameras.Orthographic(
    rendererObj.domElement.clientWidth / -2,
    rendererObj.domElement.clientWidth / 2,
    rendererObj.domElement.clientHeight / 2,
    rendererObj.domElement.clientHeight / -2,
    1, 1000);

  // controls
  rendererObj.controls = new Medic3D.Controls.TrackballOrtho(rendererObj.camera, rendererObj.domElement);
  rendererObj.controls.staticMoving = true;
  rendererObj.controls.noRotate = false;
  rendererObj.camera.controls = rendererObj.controls;

  rendererObj.container = new THREE.Object3D();
  rendererObj.scene.add( rendererObj.container );

  // initScreen(rendererObj); // TODO : initScreen(rendererObj)
  // initBox();    // TODO : initBox(rendererObj)

  computeOffset(rendererObj)
}

/*
function initSegment(){
  segR1.domElement = document.getElementsByClassName('layout-area')[0]
  // segR1.domElement = document.getElementById("seg");
  // init renderer
  segR1.renderer = new THREE.WebGLRenderer( { antialias: false } );
  // segR1.renderer.setPixelRatio( window.devicePixelRatio );
  segR1.renderer.localClippingEnabled = true;
  segR1.renderer.setSize(segR1.domElement.clientWidth, segR1.domElement.clientHeight);
  segR1.renderer.setClearColor(0x121212, 1);
  segR1.renderer.domElement.id = segR1.targetID;
  segR1.domElement.appendChild( segR1.renderer.domElement );
  // document.body.appendChild( segR1.renderer.domElement );

  // THREE environment
  segR1.scene = new THREE.Scene();
   // segR1.camera = new THREE.PerspectiveCamera( 175, window.innerWidth / window.innerHeight, 0.1, 1000 );
  segR1.camera = new Medic3D.Cameras.Orthographic(
    segR1.domElement.clientWidth / -2,
    segR1.domElement.clientWidth / 2,
    segR1.domElement.clientHeight / 2,
    segR1.domElement.clientHeight / -2,
    1, 1000);

  // controls
  segR1.controls = new Medic3D.Controls.TrackballOrtho(segR1.camera, segR1.domElement);
  segR1.controls.staticMoving = true;
  segR1.controls.noRotate = true;
  segR1.camera.controls = segR1.controls;

  segR1.container = new THREE.Object3D();
  segR1.scene.add( segR1.container );

  initGui();
  initScreen();
  initBox();

  computeOffset(segR1)
}
*/

function initGui(){
  segR11.gui = new dat.GUI();
  segR11.guiParam.sliceIndex = 5;
  segR11.gui.add(segR11.guiParam, 'sliceIndex', 0, 3)
    .step(1)
    .name("Slice")
    .onChange(function(indexSliceToDisplay){
      var uniforms = segR11.shaderMat.uniforms;
      uniforms.indexSliceToDisplay.value = indexSliceToDisplay;

    })

}

/**
 * Initialize the ouside box
 */
function initBox(xspaceLength, yspaceLength, zspaceLength){
  var boxMaterial = new THREE.MeshBasicMaterial();
  var boxGeom = new THREE.CubeGeometry(
    segR11.spaceLength.x,
    segR11.spaceLength.y,
    segR11.spaceLength.z
  );
  var boxMesh = new THREE.Mesh( boxGeom, boxMaterial )
//    boxHelper = new THREE.EdgesHelper( boxMesh, 0xff9999 );
//    container.add( boxHelper );
  // adjust the camera to the box
  segR11.camera.position.z = segR11.spaceLength.z;
}

function initScreen(render, fileName){
  render.screenContainer = new THREE.Object3D();

  var mosaicTexture = null
  if (fileName !== null) {
    mosaicTexture = THREE.ImageUtils.loadTexture( "../../../static/data/" + fileName + "/out_" + render.targetID + ".png" )
  } else {
    // mosaicTexture = new THREE.DataTexture(render.texture.data, 256, 256*64, THREE.RGBAFormat );
  }
  // mosaicTexture.needsUpdate = true;
  mosaicTexture.magFilter = THREE.LinearFilter;
  mosaicTexture.minFilter = THREE.LinearFilter;
  //mosaicTexture.flipY = false;

  var vertex = shaders.vertex;
  var fragment = shaders.fragment;

  render.shaderMat = new THREE.ShaderMaterial( {
    uniforms: {
      // the textures
      nbOfTextureUsed: {
        type: "i",
        value: 1
      },
      // the number of slice per row
      nbSlicePerRow: {
        type: "f",
        value: 1.0
      },
      // the number of slice per column
      nbSlicePerCol: {
        type: "f",
        value: 64.0
      },
      // the number of slice in total
      nbSliceTotal: {
        type: "f",
        value: render.spaceLength.z  // because along zspace
      },
      // the index of the slice to display
      indexSliceToDisplay: {
        type: "f",
        value: render.guiParam.sliceIndex
      },
      // xspace length
      xspaceLength: {
        type: "f",
        value: render.spaceLength.x
      },
      // yspace length
      yspaceLength: {
        type: "f",
        value: render.spaceLength.y
      },
      // zspace length
      zspaceLength: {
        type: "f",
        value: render.spaceLength.z
      },
      textures: {
        type: "t",
        value:  [mosaicTexture]
      }
    }
    ,
    vertexShader: shaders.vertex,
    fragmentShader: shaders.fragment,
    side: THREE.DoubleSide,
    transparent: true
  });

  var x = render.spaceLength.x;
  var y= render.spaceLength.y;

  y = -y;
  if (render.domId == r1.domId) {
    x = -x;
  } else if (render.domId == r2.domId) {
    x = -x;
  } else if (render.domId == r3.domId) {
    x = -x;
  }

  var geometry = new THREE.PlaneBufferGeometry( x, y, 1 );
  var plane = new THREE.Mesh( geometry, render.shaderMat );
  render.screenContainer.add( plane );

  render.container.add( render.screenContainer );
  // var mosaicTexture = THREE.TextureLoader().load(render.texture.data);
}


// function render() {
//   requestAnimationFrame( render );
//   segR1.renderer.render( segR1.scene, segR1.camera );
// };


// window.addEventListener( 'resize', function () {
//   segR1.camera.aspect = window.innerWidth / window.innerHeight;
//   segR1.camera.updateProjectionMatrix();
//   segR1.renderer.setSize( window.innerWidth, window.innerHeight );
// }, false );

export function parseDicomTags () {
  return new Promise((resolve, reject) => {
    if (aDicomRawData) {
      let ParsersDicom = Medic3D.Parsers.Dicom
      resolve(new ParsersDicom(aDicomRawData, 'dicom_parse_id_01'))
    } else {
      reject(new Error('Dicom file not found.'))
    }
  })
}

export function getReports() {
  return reports;
}

export function pause () {
  isPause = true
}

export function resume () {
  isPause = false
}
