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

const segR1 = {
  domId: r1.domId,
  domElement: null,
  targetID: 11,
  gui: null,
  guiParam : {},
  spaceLength : {
    x: 256,
    y: 256,
    z: 24
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

let gDicomStack = null;
function getDicomStack () {
  return gDicomStack;
};

// extra variables to show mesh plane intersections in 2D renderers
let sceneClip = new THREE.Scene();
let eventListener = null;

/**
 * Initialize Render and run animation loop
 */
export function init () {
  /**
   * Called on each animation frame
   */
  // let sl = 0;
  function animate () {
    // we are ready when both meshes have been loaded
    if (ready) {
      // update each cameras
      r0.controls.update();
      r1.controls.update();
      r2.controls.update();
      r3.controls.update();
      segR1.controls.update();

      r0.light.position.copy(r0.camera.position);
      r0.renderer.render(r0.scene, r0.camera);

      // render for each orthogonal views
      renderDo(r1);
      renderDo(r2);
      renderDo(r3);
      renderSeg(segR1);

    }
    // request new frame
    requestAnimationFrame(function () {
      animate();
    });
  }

  function renderSeg(render) {
    render.renderer.clear();
    render.renderer.render( segR1.scene, segR1.camera );

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

    clearThree(segR1.scene);
  } else {
    // console.log('First time');
  }
  initRenderer3D(r0);
  initRenderer2D(r3);
  initRenderer2D(r2);
  initRenderer2D(r1);

  initSegment(segR1);
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
      antialias: true
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
    antialias: true
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
  rendererObj.controls.noRotate = true;
  rendererObj.camera.controls = rendererObj.controls;

  // scene
  rendererObj.scene = new THREE.Scene();

  computeOffset(rendererObj);
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
            combineMprSeg(r0, segR1, stack);


            initHelpersLocalizerAll(stack);

            // add click event
            r0.domElement.addEventListener('click', onClick);
            r1.domElement.addEventListener('click', onClick);
            r2.domElement.addEventListener('click', onClick);
            r3.domElement.addEventListener('click', onClick);
            segR1.domElement.addEventListener('click', onClick);
            // add scroll event
            r1.controls.addEventListener('OnScroll', onScroll);
            r2.controls.addEventListener('OnScroll', onScroll);
            r3.controls.addEventListener('OnScroll', onScroll);
            segR1.controls.addEventListener('OnScroll', onScroll);
            // add others event
            r1.controls.addEventListener('mousedown', onDown);
            r1.controls.addEventListener('mousemove', onMove);
            r1.controls.addEventListener('mouseup', onUp);
            segR1.controls.addEventListener('mousedown', onDown);
            segR1.controls.addEventListener('mousemove', onMove);
            segR1.controls.addEventListener('mouseup', onUp);

            window.addEventListener('resize', onWindowResize, false);
            ready = true;
            gDicomStack = stack;
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

export function loadSegmentationLocal (segUrl) {
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

function loadZipPngs (zip) {
  const loadSequencesSeg = [];

  zip.forEach((rawdata) => {
    loadSequencesSeg.push(
      loadSegmentationRawdata(rawdata)
    );
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
  var uniforms = segR1.shaderMat.uniforms;
  uniforms.indexSliceToDisplay.value = stackHelper.index - 130;

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
  windowResize2DSeg(segR1);

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

  switch (id) {
    case r1.domId:
      seg = segR1;
      break;
    case r2.domId:
      seg = segR1;
      break;
    case r3.domId:
      seg = segR1;
      break;
    default:
    // console.log('unselected or r1 is selected');
  }
  selected.camera.zoom += val;
  selected.camera.updateProjectionMatrix();

  seg.camera.zoom += val;
  seg.camera.updateProjectionMatrix();
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
  switch (id) {
    case r1.domId:
      seg = segR1;
      break;
    case r2.domId:
      seg = segR1;
      break;
    case r3.domId:
      seg = segR1;
      break;
    default:
    // console.log('unselected or r1 is selected');
  }

  selected.camera.fitBox(2, 0.9);
  seg.camera.fitBox(2, 0.9);
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

export function CameraCtrl (enable) {
  // console.log('#cam ctrl ' + enable)
  r1.controls.viewcontrol = enable;
  r2.controls.viewcontrol = enable;
  r3.controls.viewcontrol = enable;
  segR1.controls.viewcontrol = enable;
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
  rendererObj.renderer = new THREE.WebGLRenderer( { antialias: false, alpha: true } );
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
  rendererObj.renderer.domElement.style.opacity = '0.5'

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
  rendererObj.controls.noRotate = true;
  rendererObj.camera.controls = rendererObj.controls;

  rendererObj.container = new THREE.Object3D();
  rendererObj.scene.add( rendererObj.container );

  initGui();    // TODO : initGui(rendererObj)
  initScreen(); // TODO : initScreen(rendererObj)
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
  segR1.gui = new dat.GUI();
  segR1.guiParam.sliceIndex = 5;
  segR1.gui.add(segR1.guiParam, 'sliceIndex', 0, 24)
    .step(1)
    .name("Slice")
    .onChange(function(indexSliceToDisplay){
      var uniforms = segR1.shaderMat.uniforms;
      uniforms.indexSliceToDisplay.value = indexSliceToDisplay;

    })

}

/**
 * Initialize the ouside box
 */
function initBox(xspaceLength, yspaceLength, zspaceLength){
  var boxMaterial = new THREE.MeshBasicMaterial();
  var boxGeom = new THREE.CubeGeometry(
    segR1.spaceLength.x,
    segR1.spaceLength.y,
    segR1.spaceLength.z
  );
  var boxMesh = new THREE.Mesh( boxGeom, boxMaterial )
//    boxHelper = new THREE.EdgesHelper( boxMesh, 0xff9999 );
//    container.add( boxHelper );
  // adjust the camera to the box
  segR1.camera.position.z = segR1.spaceLength.z;
}


function initScreen(){
  segR1.screenContainer = new THREE.Object3D();

  var mosaicTexture = THREE.ImageUtils.loadTexture( "../../../static/data/merge_from_ofoct.png" )
  mosaicTexture.magFilter = THREE.NearestFilter;
  mosaicTexture.minFilter = THREE.NearestFilter;
  //mosaicTexture.flipY = false;

  var vertex = shaders.vertex;
  var fragment = shaders.fragment;

  segR1.shaderMat = new THREE.ShaderMaterial( {
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
        value: 24.0
      },
      // the number of slice in total
      nbSliceTotal: {
        type: "f",
        value: segR1.spaceLength.z  // because along zspace
      },
      // the index of the slice to display
      indexSliceToDisplay: {
        type: "f",
        value: segR1.guiParam.sliceIndex
      },
      // xspace length
      xspaceLength: {
        type: "f",
        value: segR1.spaceLength.x
      },
      // yspace length
      yspaceLength: {
        type: "f",
        value: segR1.spaceLength.y
      },
      // zspace length
      zspaceLength: {
        type: "f",
        value: segR1.spaceLength.z
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


  var geometry = new THREE.PlaneBufferGeometry( segR1.spaceLength.x, segR1.spaceLength.y, 1 );
  var plane = new THREE.Mesh( geometry, segR1.shaderMat );
  segR1.screenContainer.add( plane );

  segR1.container.add( segR1.screenContainer );
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

