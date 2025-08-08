import * as THREE from "https://esm.sh/three@0.169.0";
import { OrbitControls } from "https://esm.sh/three@0.169.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://esm.sh/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "https://esm.sh/three@0.169.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://esm.sh/three@0.169.0/examples/jsm/postprocessing/RenderPass.js";
import poloCoaModel from './assets/polo_coat.glb';
import fabric1 from './assets/fabrics/uv.png';
import fabric2uv from './assets/fabrics/color.jpeg';
import * as dat from "https://esm.sh/dat.gui@0.7.9";

// ----- Global Variables -----
let scene, camera, renderer, controls, suitGroup, composer, renderPass;
let aLight = [], dirLight, dirLight2, dirLight3;
let gui, lightSettings = {};
const loadedMeshes = {};

let currentButtoning, currentLapelStyle, currentShoulder, currentMartingaleBelt, currentInvertedBoxPleat, currentFront, currentChestPocket, currentSidePocket, currentSleeveDesign, currentLinings, currentVent, currentButtonholeLapelPosition;

// ----- Configuration Data -----
const CONFIG = {
  defaults: {
    buttoning: 'single_breasted_2',
    lapelStyle: 'notch',
    shoulder: 'Structured',
    martingaleBelt: true,
    invertedBoxPleat: true,
    chestPocket: "boat",
    sidePocket: "slanted-welt",
    sleeveDesign: "cuffed",
    linings: true,
    vent: "Structured",
    buttonholeLapelPosition: "left"
  },
  // Define which lapel styles are available for each buttoning type
  lapelConstraints: {
    single_breasted_2: ['notch', 'peak'],
    double_breasted_6: ['notchpeak']
  },

  assets: {
    buttoning: {
      single_breasted_2: '2_Buttons',
      double_breasted_6: '6_buttons',
    },
    lapelStyle: {
      notch: 'notch',
      peak: 'peak',
      notchpeak: 'notchpeak'
    },
    shoulder: {
      Structured: 'Structured',
      Unstructured: 'Unstructured',
      Lightly_Padded: 'Lightly_Padded'
    },

  }
};

// ----- Three.js Initialization -----
function initThree() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  camera = new THREE.OrthographicCamera(
    window.innerWidth / -630,
    window.innerWidth / 630,
    window.innerHeight / 630,
    window.innerHeight / -630,
    1,
    1000
  );

  camera.position.set(0, 0, 10);
  camera.updateProjectionMatrix();
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
    stencil: false,
    depth: true,
    precision: "highp"
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  // Use softer variance shadow mapping to reduce harsh dark areas
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.shadowMap.autoUpdate = true;


  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.outputColorSpace = 'srgb';
  // renderer.setSize(window.innerWidth - 350, window.innerHeight);

  renderer.setSize(window.innerWidth - 350, window.innerHeight);
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  document.getElementById("viewer").appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true;
  // controls.minPolarAngle = Math.PI / 2;
  // controls.maxPolarAngle = Math.PI / 2;

  suitGroup = new THREE.Group();
  scene.add(suitGroup);

  // Suit group holder
  // addDirectionalLight(5.410, -2.778, -13.836, 1);
  addDirectionalLight(-49, 6, 50, 3);

  animate();
}

const addDirectionalLight = (x, y, z, intensity) => {
  // More ambient fill (brighter ground color, higher intensity)
  const ambientLight = new THREE.HemisphereLight(0xffffff, 0x222222, 0.2);
  scene.add(ambientLight);

  // Fill light a bit lower
  dirLight2 = new THREE.DirectionalLight(0xffffff, 1.1);
  aLight.push(dirLight2);
  dirLight2.target = suitGroup;
  dirLight2.position.set(37, 14, 74);
  // scene.add(dirLight2);

  // Key light casting shadows – reduce intensity
  dirLight3 = new THREE.DirectionalLight(0xffffff, 3);
  aLight.push(dirLight3);
  dirLight3.castShadow = true;
  dirLight3.target = suitGroup;
  dirLight3.position.set(x, y, z);
  dirLight3.shadow.color = new THREE.Color(0x000000);
  scene.add(dirLight3);

  const bulbGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
  const bulbLight = new THREE.PointLight(0xffffff, 1.0, 100, 0.00001);

  const bulbMat = new THREE.MeshStandardMaterial({
    emissive: 0x000000,
    emissiveIntensity: 0,
    color: 0x000000,
    transparent: true,
    opacity: 0
  });
  bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
  bulbLight.position.set(0, -1.2, 0);
  bulbLight.castShadow = true;
  // scene.add(bulbLight);

  const bulbGeometry1 = new THREE.CapsuleGeometry(0.5, 2, 4, 8);
  const bulbLight1 = new THREE.PointLight(0xffffff, 1.0, 100, 0.00001);

  const bulbMat1 = new THREE.MeshStandardMaterial({
    emissive: 0x000000,
    emissiveIntensity: 0,
    color: 0x000000,
    transparent: true,
    opacity: 0
  });
  bulbLight1.add(new THREE.Mesh(bulbGeometry1, bulbMat1));
  bulbLight1.position.set(0, 0.5, 0);
  bulbLight1.castShadow = true;
  // scene.add(bulbLight1);

  const bulbGeometry2 = new THREE.CapsuleGeometry(0.5, 0.5, 4, 8);
  const bulbLight2 = new THREE.PointLight(0xffffff, 0.5, 100, 0.00001);

  const bulbMat2 = new THREE.MeshStandardMaterial({
    emissive: 0x000000,
    emissiveIntensity: 0,
    color: 0x000000,
    transparent: true,
    opacity: 0
  });
  bulbLight2.add(new THREE.Mesh(bulbGeometry2, bulbMat2));
  bulbLight2.position.set(0, 1, 0);
  bulbLight2.castShadow = true;
  // scene.add(bulbLight2);
  // bulbLight.visible = false;

  // Update shadow settings for dirLight3
  dirLight3.shadow.mapSize.width = 2048;  // Increased resolution for sharper shadows
  dirLight3.shadow.mapSize.height = 2048; // Increased resolution for sharper shadows
  dirLight3.shadow.camera.near = 0.5;
  dirLight3.shadow.camera.far = 500;
  dirLight3.shadow.bias = -0.00001; // Adjust bias to reduce shadow acne
  dirLight3.shadow.normalBias = 0.001;
  dirLight3.shadow.radius = 20;          // Reduced blur for sharper shadows
  dirLight3.shadow.camera.updateProjectionMatrix();

  // Tighter shadow camera frustum for better resolution
  dirLight3.shadow.camera.left = -1.5;     // Tighter bounds for better shadow detail
  dirLight3.shadow.camera.right = 1.5;
  dirLight3.shadow.camera.top = 1.5;
  dirLight3.shadow.camera.bottom = -1.5;

  // Shadow settings for bulbLight
  bulbLight.shadow.mapSize.width = 2048;       // Increased resolution for sharper shadows
  bulbLight.shadow.mapSize.height = 2048;      // Increased resolution for sharper shadows
  bulbLight.shadow.camera.near = 0.1;
  bulbLight.shadow.camera.far = 100;
  bulbLight.shadow.bias = -0.00005;            // Reduced bias for sharper edges
  bulbLight.shadow.normalBias = 0.001;         // Reduced normal bias for sharper edges
  bulbLight.shadow.radius = 0.5;               // Reduced blur for sharper shadows

  // Shadow settings for bulbLight1
  bulbLight1.shadow.mapSize.width = 2048;      // Increased resolution for sharper shadows
  bulbLight1.shadow.mapSize.height = 2048;     // Increased resolution for sharper shadows
  bulbLight1.shadow.camera.near = 0.1;
  bulbLight1.shadow.camera.far = 100;
  bulbLight1.shadow.bias = -0.00005;           // Reduced bias for sharper edges
  bulbLight1.shadow.normalBias = 0.001;        // Reduced normal bias for sharper edges
  bulbLight1.shadow.radius = 0.5;              // Reduced blur for sharper shadows

  bulbLight2.shadow.mapSize.width = 2048;      // Increased resolution for sharper shadows
  bulbLight2.shadow.mapSize.height = 2048;     // Increased resolution for sharper shadows
  bulbLight2.shadow.camera.near = 0.1;
  bulbLight2.shadow.camera.far = 100;
  bulbLight2.shadow.bias = -0.00005;           // Reduced bias for sharper edges
  bulbLight2.shadow.normalBias = 0.001;        // Reduced normal bias for sharper edges
  bulbLight2.shadow.radius = 0.5;              // Reduced blur for sharper shadows

  setGUI();
};

function setGUI() {
  gui = new dat.GUI()
  lightSettings = lightSettings || {};

  const lightFolder = gui.addFolder('Directional Lights')

  // Light 2 controls
  const light2 = lightFolder.addFolder('Light 2 Position')
  lightSettings.light2 = {
    x: dirLight2.position.x,
    y: dirLight2.position.y,
    z: dirLight2.position.z
  }
  light2.add(lightSettings.light2, 'x', -100, 100, 1)
    .onChange(value => dirLight2.position.x = value)
  light2.add(lightSettings.light2, 'y', -100, 100, 1)
    .onChange(value => dirLight2.position.y = value)
  light2.add(lightSettings.light2, 'z', -100, 100, 1)
    .onChange(value => dirLight2.position.z = value)

  // Light 3 controls
  // Light 3 controls
  const light3 = lightFolder.addFolder('Light 3 Position')
  lightSettings.light3 = {
    x: dirLight3.position.x,
    y: dirLight3.position.y,
    z: dirLight3.position.z
  }
  light3.add(lightSettings.light3, 'x', -100, 100, 1)
    .onChange(value => dirLight3.position.x = value)
  light3.add(lightSettings.light3, 'y', -100, 100, 1)
    .onChange(value => dirLight3.position.y = value)
  light3.add(lightSettings.light3, 'z', -100, 100, 1)
    .onChange(value => dirLight3.position.z = value)

  // Light 3 Offset (used in animate)
  const light3Offset = lightFolder.addFolder('Light 3 Offset (camera space)')
  lightSettings.light3Offset = lightSettings.light3Offset || { x: -49, y: 14, z: 50 }
  light3Offset.add(lightSettings.light3Offset, 'x', -200, 200, 1).name('offsetX')
  light3Offset.add(lightSettings.light3Offset, 'y', -200, 200, 1).name('offsetY')
  light3Offset.add(lightSettings.light3Offset, 'z', -200, 200, 1).name('offsetZ')

  // Add shadow controls for Light 3
  const shadow3 = lightFolder.addFolder('Light 3 Shadow')
  lightSettings.shadow3 = {
    bias: -0.0001,
    normalBias: 0.05,
    radius: 0,
    mapSize: 512,
    cameraLeft: -30,
    cameraRight: 30,
    cameraTop: 30,
    cameraBottom: -30,
    cameraNear: 0.1,
    cameraFar: 500
  }

  shadow3.add(lightSettings.shadow3, 'bias', -0.0001, 0.0001, 0.00001)
    .onChange(value => dirLight3.shadow.bias = value)
  shadow3.add(lightSettings.shadow3, 'normalBias', 0, 0.05, 0.001)
    .onChange(value => dirLight3.shadow.normalBias = value)
  shadow3.add(lightSettings.shadow3, 'radius', 0, 10, 0.1)
    .onChange(value => dirLight3.shadow.radius = value)
  shadow3.add(lightSettings.shadow3, 'mapSize', 512, 4096, 512)
    .onChange(value => {
      dirLight3.shadow.mapSize.width = value
      dirLight3.shadow.mapSize.height = value
    })
  shadow3.add(lightSettings.shadow3, 'cameraLeft', -100, 0, 1)
    .onChange(value => dirLight3.shadow.camera.left = value)
  shadow3.add(lightSettings.shadow3, 'cameraRight', 0, 100, 1)
    .onChange(value => dirLight3.shadow.camera.right = value)
  shadow3.add(lightSettings.shadow3, 'cameraTop', 0, 100, 1)
    .onChange(value => dirLight3.shadow.camera.top = value)
  shadow3.add(lightSettings.shadow3, 'cameraBottom', -100, 0, 1)
    .onChange(value => dirLight3.shadow.camera.bottom = value)
  shadow3.add(lightSettings.shadow3, 'cameraNear', 0.1, 10, 0.1)
    .onChange(value => dirLight3.shadow.camera.near = value)
  shadow3.add(lightSettings.shadow3, 'cameraFar', 100, 1000, 10)
    .onChange(value => dirLight3.shadow.camera.far = value)


}

function animate() {
  // Remove the camera-following light behavior that was causing issues
  // The lights now have fixed positions for consistent lighting

  // Get camera's direction vector
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);

  if (dirLight2) {
    const offsetX = 37 * 10;
    const offsetY = 14 * 10;
    const offsetZ = 74 * 10;

    const quaternion = camera.quaternion;
    const offsetVector = new THREE.Vector3(offsetX, offsetY, offsetZ);
    offsetVector.applyQuaternion(quaternion);

    dirLight2.position.copy(camera.position).add(offsetVector);
  }

  if (dirLight3) {
    const offsetX = (lightSettings?.light3Offset?.x ?? 56);
    const offsetY = (lightSettings?.light3Offset?.y ?? -200);
    const offsetZ = (lightSettings?.light3Offset?.z ?? -200);

    const quaternion = camera.quaternion;
    const offsetVector = new THREE.Vector3(offsetX, offsetY, offsetZ);
    offsetVector.applyQuaternion(quaternion);
    dirLight3.position.copy(camera.position).add(offsetVector);
    dirLight3.target.position.copy(new THREE.Vector3(0, 0, 0));
    dirLight3.shadow.camera.updateProjectionMatrix();
    dirLight3.target.updateMatrixWorld();
  }

  if (controls) controls.update();

  requestAnimationFrame(animate);
  composer.render();
}

function loadJacketModel(url) {
  const loader = new GLTFLoader();
  loader.load(url, async gltf => {
    const model = gltf.scene;
    suitGroup.clear();
    suitGroup.add(model);
    centerModel(model);

    await storeTopLevelGroups(model);  // Add await here
    applyDefaultConfig();              // Now this runs after meshes are stored
  }, undefined, function (error) {
    console.error('An error occurred loading the model:', error);
  });
}

function centerModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  model.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2 / maxDim;
  model.scale.setScalar(scale);
  box.setFromObject(model);
  const newCenter = box.getCenter(new THREE.Vector3());
  model.position.sub(newCenter);
}

function setAllMeshesInvisible(object) {
  object.traverse((child) => {
    child.visible = false;
  });
}

async function storeTopLevelGroups(root) {
  return new Promise((resolve) => {
    root.children.forEach(child => {
      if (child.name) {
        loadedMeshes[child.name] = child; // group of options
        setAllMeshesInvisible(child);
      }
    });

    // Updated to pass both color and normal textures
    loadAndApplyFabric(fabric1, fabric2uv, {
      repeat: [50, 50],
    });

    console.log("Top-level groups:", loadedMeshes);

    resolve();
  });
}

function updateVariant(groupName, visibleChildName, toggle = true, visibility = true) {
  const group = loadedMeshes[groupName]; // e.g., lapel, Buttons, shoulders


  if (!group) {
    console.warn(`Group '${groupName}' not found`);
    return;
  }

  // Check if the group is visible, if not make it visible
  if (!group.visible) {
    group.visible = true;
  }

  if (group.isMesh) {
    group.visible = visibility;
    return;
  }

  if (visibleChildName === "none") {
    group.children.forEach(child => {
      child.visible = false;
    });
  } else {
    group.children.forEach(child => {
      if (child.name === visibleChildName) {
        child.visible = visibility; // Use the visibility parameter here
        child.traverse(subChild => {
          subChild.visible = visibility; // Also apply visibility to sub-children
        });
      } else {
        if (toggle) {
          child.visible = false;
        } else {
          child.visible = true;
        }
      }
    });
  }
}

function applyDefaultConfig() {
  updateLapelStyle(CONFIG.defaults.lapelStyle);
  updateButtoning(CONFIG.defaults.buttoning);
  updateShoulders(CONFIG.defaults.shoulder);
  updateFront();
  martingaleBelt(CONFIG.defaults.martingaleBelt);
  invertedBoxPleat(CONFIG.defaults.invertedBoxPleat);
  updateChestPocket(CONFIG.defaults.chestPocket);
  updateSidePocket(CONFIG.defaults.sidePocket);
  updateSleeveDesign(CONFIG.defaults.sleeveDesign);
  updateLinings(); // Remove parameter, let it determine dynamically
  updateVent();
  updateButtonholeLapelPosition(CONFIG.defaults.buttonholeLapelPosition);
}



///Start of update functions
function updateLapelStyle(styleKey) {
  const lapelMap = {
    notch: 'noatch',
    peak: 'Peak',
    notchpeak: 'notchpeak'
  };
  currentLapelStyle = styleKey;
  updateVariant('lapel', lapelMap[styleKey]);
}

function updateButtoning(styleKey) {
  const buttoningMap = {
    single_breasted_2: '2_Buttons',
    double_breasted_6: '6_buttons',
    belt_buttons: 'belt_buttons',
    one_strap: 'one_strap_button',
    pleat_buttons: 'pleat_buttons',
    sec_strap: 'sec_strap'
  };

  currentButtoning = styleKey;

  if (styleKey === 'double_breasted_6') {
    updateVariant('Buttons', buttoningMap[styleKey]);
    // updateVariant('back', "back");
  } else {
    updateVariant('Buttons', buttoningMap[styleKey]);
  }
}

function updateFront() {
  const currentButtoning = CONFIG.defaults.buttoning;
  const currentShoulder = CONFIG.defaults.shoulder;
  const currentLapel = CONFIG.defaults.lapelStyle;
  let frontStyleKey;

  if (currentButtoning === 'single_breasted_2') {
    frontStyleKey = `2_Buttons_Front_${currentShoulder}`;
  } else if (currentButtoning === 'double_breasted_6') {
    frontStyleKey = `6_Buttons_Front_${currentShoulder}`;
  } else {
    console.warn(`Unsupported buttoning type for front: ${currentButtoning}`);
    return;
  }

  const frontMap = {
    '2_Buttons_Front_Structured': '2Button_Structured',
    '2_Buttons_Front_Unconstructed': '2Button_Unconstructed',
    '2_Buttons_Front_Lightly_Padded': '2Button_Lightly_Padded',
    '6_Buttons_Front_Structured': '6Button_Structured',
    '6_Buttons_Front_Unconstructed': '6Button_Unconstructed',
    '6_Buttons_Front_Lightly_Padded': '6Button_Lightly_Padded',
  };

  currentFront = frontStyleKey;
  updateVariant('Front', frontMap[frontStyleKey]);
}

function updateShoulders(styleKey) {
  const shoulderMap = {
    Structured: 'Structured',
    Unconstructed: '_Unconstructed',
    Lightly_Padded: '_Lightly_Padded',
  };

  currentShoulder = styleKey;

  const shoulderGroup = loadedMeshes['shoulders'];
  if (!shoulderGroup) {
    console.warn('Shoulder group not found');
    return;
  }

  // Make the shoulder group visible
  shoulderGroup.visible = true;

  // Find the Natural_Shoulder child
  const naturalShoulder = shoulderGroup.children.find(child => child.name === 'Natural_Shoulder');
  if (!naturalShoulder) {
    console.warn('Natural_Shoulder not found');
    return;
  }

  // Make Natural_Shoulder visible
  naturalShoulder.visible = true;

  // Get the target variant name
  const variantName = shoulderMap[styleKey] || 'Structured';

  // Hide all variants first, then show only the target one
  naturalShoulder.children.forEach(variant => {
    if (variant.name === variantName) {
      variant.visible = true;
      // Make all nested children of this variant visible
      variant.traverse((subChild) => {
        subChild.visible = true;
      });
    } else {
      variant.visible = false;
      // Make all nested children of other variants invisible
      variant.traverse((subChild) => {
        subChild.visible = false;
      });
    }
  });
}

function martingaleBelt(styleKey, visibility = true) {
  currentMartingaleBelt = styleKey;
  const ButtonsGroup = loadedMeshes['Buttons'];
  if (ButtonsGroup) {
    ButtonsGroup.traverse((child) => {
      if (child.name === "belt_buttons") {
        child.visible = visibility;
      }
    });
  }

  updateVariant('Martingale_Belt', "none", true, visibility);
}

function invertedBoxPleat(styleKey, visibility = true) {
  console.log("invertedBoxPleat", styleKey, visibility);
  currentInvertedBoxPleat = styleKey;

  const buttoningConfig = currentButtoning || CONFIG.defaults.buttoning;

  if (!styleKey) {
    const invertedBoxPleatGroup = loadedMeshes['Inverted_Box_pleat'];
    if (invertedBoxPleatGroup) {
      invertedBoxPleatGroup.visible = false;
    }
    return;
  }

  const shoulderConfig = currentShoulder || CONFIG.defaults.shoulder;

  // Map buttoning and shoulder configuration to the appropriate pleat variant
  const pleatVariantMap = {
    '6_Buttons_Structured': 'Structured_Inverted_box_pleat',
    '6_Buttons_Unstructured': 'Unconstructed_Inverted_box_pleat',
    '6_Buttons_Lightly_Padded': 'Lightly_Padded_Inverted_box_pleat',
    '2_Buttons_Structured': 'Structured_Inverted_box_pleat_2Button',
    '2_Buttons_Unstructured': '_Unconstructed_Inverted_box_pleat_2Button',
    '2_Buttons_Lightly_Padded': 'Lightly_Padded_Inverted_box_pleat_2Button'
  };

  // Create the key based on buttoning and shoulder
  let pleatKey;
  if (buttoningConfig === 'single_breasted_2') {
    pleatKey = `2_Buttons_${shoulderConfig}`;
  } else if (buttoningConfig === 'double_breasted_6') {
    pleatKey = `6_Buttons_${shoulderConfig}`;
  } else {
    console.warn(`Unsupported buttoning type for inverted box pleat: ${buttoningConfig}`);
    return;
  }
  console.log("pleatKey", pleatKey);
  const targetPleatVariant = pleatVariantMap[pleatKey];
  console.log("targetPleatVariant", targetPleatVariant);
  if (targetPleatVariant) {
    updateVariant('Inverted_Box_Pleat', targetPleatVariant, true, visibility);
  } else {
    console.warn(`No pleat variant found for buttoning: ${buttoningConfig}, shoulder: ${shoulderConfig}`);
  }
}

function updateChestPocket(styleKey) {
  currentChestPocket = styleKey;
  const chestPocketMap = {
    'boat': 'boat',
    'none': 'none',
  };
  updateVariant('ChestPocket', chestPocketMap[styleKey]);
}

function updateSidePocket(styleKey) {
  const sidePocketMap = {
    'jetted': 'jetted_pocket',
    'path-with-flaps': 'Patch',
    'postbox': 'postbox_pocket',
    'slanted-welt': 'slanted_pocket',
  };
  currentSidePocket = styleKey;
  updateVariant('Sidepocket', sidePocketMap[styleKey]);
}

function updateSleeveDesign(styleKey) {
  const sleeveDesignMap = {
    'un-cuffed': 'un_cuffed',
    'cuffed': 'cuffed',
    'sleeve-strap': 'Sleeve_Strap',
    'sleeve-strap-with-buttons': 'Full_Sleeve_Strap_with_buttons'
  };

  if (styleKey === 'sleeve-strap-with-buttons') {
    updateButtoning('sec_strap', false);
  }
  if (styleKey === 'sleeve-strap') {
    updateButtoning('one_strap', false);
  }

  currentSleeveDesign = styleKey;
  updateVariant('Sleeve_design', sleeveDesignMap[styleKey]);
}

function updateLinings(visibility = true) {
  // Get the buttoning configuration to determine lining type
  const buttoningConfig = currentButtoning || CONFIG.defaults.buttoning;

  // Determine lining type based on buttoning (this logic remains the same)
  let liningType;
  if (buttoningConfig === 'single_breasted_2') {
    liningType = 'half';
  } else if (buttoningConfig === 'double_breasted_6') {
    liningType = 'full';
  } else {
    console.warn(`Unsupported buttoning type for lining: ${buttoningConfig}`);
    return;
  }

  currentLinings = liningType;

  const liningMap = {
    full: 'full',
    half: 'half',
  };

  function updateSleeveLinings() {
    const sleeveLiningsGroup = loadedMeshes['lining'];
    if (sleeveLiningsGroup) {
      const targetVariant = sleeveLiningsGroup.children.find(variant => variant.name === "LiningSleeve");
      if (targetVariant) {
        targetVariant.visible = visibility;
      }
    }
  }

  // Update the main lining with the determined type and visibility
  updateVariant('lining', liningMap[liningType], true, visibility);
  updateSleeveLinings();
}

function updateVent() {
  const buttoningConfig = currentButtoning || CONFIG.defaults.buttoning;

  // Only show vent for single breasted (2 buttons)
  if (buttoningConfig !== 'single_breasted_2') {
    const ventGroup = loadedMeshes['vent'];
    if (ventGroup) {
      ventGroup.visible = false;
    }
    return;
  }

  const ventMap = {
    'Structured': '2_button_structured',
    'Unconstructed': '2_button_Unconstructed',
    'Lightly_Padded': '2_button_lightly_Padded'
  };
  const shoulderConfig = currentShoulder || CONFIG.defaults.shoulder;
  const targetVentVariant = ventMap[shoulderConfig];
  currentVent = shoulderConfig;

  if (targetVentVariant) {
    updateVariant('vent', targetVentVariant);
  } else {
    console.warn(`No vent variant found for shoulder config: ${shoulderConfig}`);
  }
}

function updateButtonholeLapelPosition(styleKey) {
  currentButtonholeLapelPosition = styleKey;

  // Get the current lapel style to determine which buttons to show/hide
  const currentLapel = currentLapelStyle || CONFIG.defaults.lapelStyle;

  // Map lapel styles to their corresponding group names in the hierarchy
  const lapelGroupMap = {
    notch: 'noatch',
    peak: 'Peak',
    notchpeak: 'notchpeak'
  };

  const currentLapelGroup = lapelGroupMap[currentLapel];

  if (!currentLapelGroup) {
    console.warn(`No lapel group found for style: ${currentLapel}`);
    return;
  }

  // Get the lapel group from loaded meshes
  const lapelGroup = loadedMeshes['lapel'];
  if (!lapelGroup) {
    console.warn('Lapel group not found');
    return;
  }

  // Find the current lapel style group (noatch, Peak, or notchpeak)
  const currentLapelStyleGroup = lapelGroup.children.find(child => child.name === currentLapelGroup);
  if (!currentLapelStyleGroup) {
    console.warn(`Lapel style group '${currentLapelGroup}' not found`);
    return;
  }

  // Define button names based on the hierarchy structure
  const buttonNames = {
    left: 'lapel_left_button',
    right: 'lapel_right_button'
  };

  // Handle different position selections
  switch (styleKey) {
    case 'left':
      // Show only left button, hide right button
      currentLapelStyleGroup.children.forEach(child => {
        if (child.name === buttonNames.left) {
          child.visible = true;
          child.traverse(subChild => subChild.visible = true);
        } else if (child.name === buttonNames.right) {
          child.visible = false;
          child.traverse(subChild => subChild.visible = false);
        }
      });
      break;

    case 'right':
      // Show only right button, hide left button
      currentLapelStyleGroup.children.forEach(child => {
        if (child.name === buttonNames.right) {
          child.visible = true;
          child.traverse(subChild => subChild.visible = true);
        } else if (child.name === buttonNames.left) {
          child.visible = false;
          child.traverse(subChild => subChild.visible = false);
        }
      });
      break;

    case 'both':
      // Show both buttons
      currentLapelStyleGroup.children.forEach(child => {
        if (child.name === buttonNames.left || child.name === buttonNames.right) {
          child.visible = true;
          child.traverse(subChild => subChild.visible = true);
        }
      });
      break;

    case 'none':
      // Hide both buttons
      currentLapelStyleGroup.children.forEach(child => {
        if (child.name === buttonNames.left || child.name === buttonNames.right) {
          child.visible = false;
          child.traverse(subChild => subChild.visible = false);
        }
      });
      break;

    default:
      console.warn(`Unknown buttonhole position: ${styleKey}`);
      break;
  }
}

///End of update functions

/**
 * Get the current active configuration from the UI
 * @returns {Object} Current configuration object
 */
function getCurrentConfig() {
  const config = {};

  // Map of select IDs to their corresponding config keys
  const selectMapping = {
    'buttoning-select': 'buttoning',
    'lapel-style-select': 'lapelStyle',
    'shoulder-select': 'shoulder',
    'martingale-belt-select': 'martingaleBelt',
    'inverted-box-pleat-select': 'invertedBoxPleat',
    'vent-select': 'vent',
    'chest-pocket-select': 'chestPocket',
    'side-pocket-select': 'sidePocket',
    'sleeve-design-select': 'sleeveDesign',
    'lining-select': 'linings',
    'buttonhole-lapel-position-select': 'buttonholeLapelPosition'
  };

  // Get values from all select elements
  Object.entries(selectMapping).forEach(([selectId, configKey]) => {
    const selectElement = document.getElementById(selectId);
    if (selectElement) {
      let value = selectElement.value;

      // Convert string boolean values to actual booleans
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }

      config[configKey] = value;
    }
  });

  // Also include the current global variables for completeness
  config.currentButtoning = currentButtoning;
  config.currentLapelStyle = currentLapelStyle;
  config.currentShoulder = currentShoulder;
  config.currentMartingaleBelt = currentMartingaleBelt;
  config.currentInvertedBoxPleat = currentInvertedBoxPleat;
  config.currentFront = currentFront;
  config.currentChestPocket = currentChestPocket;
  config.currentSidePocket = currentSidePocket;
  config.currentSleeveDesign = currentSleeveDesign;
  config.currentLinings = currentLinings;
  config.currentVent = currentVent;
  config.currentButtonholeLapelPosition = currentButtonholeLapelPosition;

  return config;
}

/**
 * Get a specific configuration value
 * @param {string} configKey - The configuration key to retrieve
 * @returns {*} The configuration value
 */
function getConfigValue(configKey) {
  const config = getCurrentConfig();
  return config[configKey];
}

/**
 * Load and apply fabric textures to the model
 * @param {string} colorTextureUrl - URL or path to the fabric color texture
 * @param {string} normalTextureUrl - URL or path to the fabric normal texture
 * @param {Object} materialOptions - Additional material properties
 */
function loadAndApplyFabric(colorTextureUrl, normalTextureUrl, materialOptions = {}) {
  const textureLoader = new THREE.TextureLoader();
  let colorTextureLoaded = false;
  let normalTextureLoaded = false;
  let colorTexture, normalTexture;

  // Load color texture
  textureLoader.load(
    colorTextureUrl,
    (texture) => {
      // Configure texture settings
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(materialOptions.repeat?.[0] || 5, materialOptions.repeat?.[1] || 5);

      colorTexture = texture;
      colorTextureLoaded = true;

      // Apply fabric if both textures are loaded
      if (colorTextureLoaded && normalTextureLoaded) {
        applyFabricToModel(colorTexture, normalTexture, materialOptions);
      }
    },
    undefined,
    (error) => {
      console.error('Error loading color texture:', error);
    }
  );

  // Load normal texture
  textureLoader.load(
    normalTextureUrl,
    (texture) => {
      // Configure texture settings
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(materialOptions.repeat?.[0] || 10, materialOptions.repeat?.[1] || 10);

      normalTexture = texture;
      normalTextureLoaded = true;

      // Apply fabric if both textures are loaded
      if (colorTextureLoaded && normalTextureLoaded) {
        applyFabricToModel(colorTexture, normalTexture, materialOptions);
      }
    },
    undefined,
    (error) => {
      console.error('Error loading normal texture:', error);
    }
  );
}

/**
 * Apply fabric material to all meshes except buttons
 * @param {THREE.Texture} colorTexture - The fabric color texture to apply
 * @param {THREE.Texture} normalTexture - The fabric normal texture to apply
 * @param {Object} materialOptions - Additional material properties
 */
function applyFabricToModel(colorTexture, normalTexture, materialOptions = {}) {
  // Define button-related keywords to exclude
  const buttonKeywords = [
    'button', 'Button', 'BUTTON',
    'lapel_left_button', 'lapel_right_button',
    'belt_buttons', 'one_strap_button', 'pleat_buttons',
    'sec_strap', 'one_strap'
  ];

  // Function to check if a mesh name contains button keywords
  function isButtonMesh(meshName) {
    return buttonKeywords.some(keyword =>
      meshName.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Function to apply textures to a mesh's existing material if it's not a button
  function applyTexturesToMesh(mesh) {
    if (mesh.isMesh && mesh.material) {
      if (!isButtonMesh(mesh.name)) {
        mesh.material.map = colorTexture;
        mesh.material.normalMap = normalTexture;

        // Improved material properties for better lighting response
        mesh.material.roughness = materialOptions.roughness !== undefined ? materialOptions.roughness : 0.8;
        mesh.material.metalness = materialOptions.metalness !== undefined ? materialOptions.metalness : 0.1;

        // Enable shadow casting and receiving
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        mesh.material.needsUpdate = true;
      }
    }
  }

  // Traverse through the entire suit group
  if (suitGroup) {
    suitGroup.traverse((child) => {
      applyTexturesToMesh(child);
    });
  }

  console.log('Fabric textures applied to existing materials (excluding buttons)');
}

// ----- Update On Config Change -----
function handleConfigChange(event) {
  const configType = event.target.id.replace('-select', '');
  const value = event.target.value;
  CONFIG.defaults[configType] = value;

  console.log("configType", configType)
  console.log("value", value)

  if (configType === 'buttoning') {
    updateButtoning(value);
    updateLapelOptions(value);
    updateFront();
    if (value === 'single_breasted_2') {
      updateVent();
      invertedBoxPleat(false);
    } else if (value === 'double_breasted_6') {
      invertedBoxPleat(CONFIG.defaults.invertedBoxPleat);
      const ventGroup = loadedMeshes['vent'];
      if (ventGroup) {
        ventGroup.visible = false;
      }
    }
    updateLinings();
    const currentMartingaleBelt = getConfigValue('martingaleBelt');
    martingaleBelt(currentMartingaleBelt, currentMartingaleBelt);
  }

  if (configType === 'lapel-style') {
    updateLapelStyle(value);
    updateFront();
    // Update buttonhole position when lapel style changes
    const currentButtonholePosition = getConfigValue('buttonholeLapelPosition');
    updateButtonholeLapelPosition(currentButtonholePosition);
  }

  if (configType === 'shoulder') {
    updateShoulders(value);
    updateFront();
    updateVent();
    invertedBoxPleat(true);
  }

  if (configType === 'martingale-belt') {
    const isVisible = value === 'true';
    currentMartingaleBelt = value;
    martingaleBelt(value, isVisible);
  }

  if (configType === 'chest-pocket') {
    updateChestPocket(value);
  }

  if (configType === 'side-pocket') {
    updateSidePocket(value);
  }

  if (configType === 'sleeve-design') {
    updateSleeveDesign(value);
  }

  if (configType === 'lining') {
    if (value === 'full-lining') {
      updateLinings(true);
    } else {
      updateLinings(false);
    }
  }

  if (configType === 'buttonhole-lapel-position') {
    updateButtonholeLapelPosition(value);
  }
}

// ----- Update Lapel Options Based on Buttoning -----
function updateLapelOptions(buttoningType) {
  const lapelSelect = document.getElementById('lapel-style-select');
  const currentLapelValue = lapelSelect.value;
  const allowedLapelStyles = CONFIG.lapelConstraints[buttoningType] || ['notch', 'peak', 'notchpeak'];

  lapelSelect.innerHTML = '';

  const lapelOptions = {
    notch: 'NOTCH',
    peak: 'PEAK',
    notchpeak: 'NOTCHPEAK'
  };

  allowedLapelStyles.forEach(style => {
    const option = document.createElement('option');
    option.value = style;
    option.textContent = lapelOptions[style];
    lapelSelect.appendChild(option);
  });

  // Set a valid default if current selection is not allowed
  if (!allowedLapelStyles.includes(currentLapelValue)) {
    const newDefault = allowedLapelStyles[0];
    lapelSelect.value = newDefault;
    CONFIG.defaults.lapelStyle = newDefault;
    currentLapelStyle = newDefault;
  } else {
    // Keep the current selection if it's valid
    currentLapelStyle = currentLapelValue;
  }
  updateLapelStyle(currentLapelStyle);
}

// ----- Initialize DOM Selectors & Events -----
function initConfigUI() {
  const selects = [
    'buttoning', 'lapel-style', 'shoulder', 'martingale-belt',
    'inverted-box-pleat', 'vent', 'side-pocket', 'chest-pocket', 'sleeve-design', 'lining', 'buttonhole-lapel-position'
  ];

  selects.forEach(id => {
    const domId = `${id}-select`;
    document.getElementById(domId).addEventListener('change', handleConfigChange);
  });

  // Initialize lapel options based on default buttoning
  updateLapelOptions(CONFIG.defaults.buttoning);
}

// Utility: camelCase to kebab-case (for matching DOM IDs)
function camelToKebab(str) {
  return str.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
}

// ----- Init Everything on Load -----
document.addEventListener('DOMContentLoaded', () => {
  initThree();
  initConfigUI();
  loadJacketModel(poloCoaModel); // ✅ replace with your model path
});

// ----- Handle Resize -----
window.addEventListener('resize', () => {
  camera.aspect = (window.innerWidth - 350) / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth - 350, window.innerHeight);
});