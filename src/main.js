import * as THREE from "https://esm.sh/three@0.169.0";
import { OrbitControls } from "https://esm.sh/three@0.169.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://esm.sh/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";
import poloCoaModel from './assets/polo_coat.glb';

// ----- Global Variables -----
let scene, camera, renderer, controls, suitGroup;
const loadedMeshes = {};

// ----- Configuration Data -----
const CONFIG = {
  defaults: {
    buttoning: 'double_breasted_6',
    lapelStyle: 'notchpeak',
    front: 'Front_Structured',
    lapelWidth: 'narrow',
    vent: 'double',
    construction: 'half_canvas',
    shoulder: {
      Natural_Shoulder: {
        Natural_Structured: 'Natural_Structured',
      }
    },
    amf: '2mm_standard',
    chestPocket: 'ChestPocket_Boat'
  },
  // assets: {
  //   buttoning: {
  //     single_breasted_2: '2_Buttons',
  //     double_breasted_6: '6_buttons',
  //     belt_buttons: 'belt_buttons',
  //     one_strap: 'one_strap_button',
  //     pleat_buttons: 'pleat_buttons',
  //     sec_strap: 'sec_strap'
  //   },
  //   lapelStyles: {
  //     notch: 'noatch',
  //     peak: 'Peak',
  //     notchPeak: 'notchpeak'
  //   },
  //   lapelWidths: {
  //     narrow: 'Lapel_Narrow',
  //     medium: 'Lapel_Medium',
  //     wide: 'Lapel_Wide'
  //   },
  //   vents: {
  //     none: 'Vent_None',
  //     single: 'Vent_Single',
  //     double: 'Vent_Double'
  //   },
  //   construction: {
  //     half_canvas: 'Construction_HalfCanvas',
  //     full_canvas: 'Construction_FullCanvas'
  //   },
  //   shoulders: {
  //     natural_unconstructed: 'Shoulder_Natural_Unconstructed',
  //     natural_lightly_padded: 'Shoulder_Natural_Light',
  //     natural_structured: 'Shoulder_Natural_Structured',
  //     rope_shoulder_structured_5mm: 'Shoulder_Rope_5mm'
  //   },
  //   amf: {
  //     '2mm_standard': 'AMF_2mm',
  //     '3mm_enhanced': 'AMF_3mm'
  //   },
  //   chestPockets: {
  //     boat: 'ChestPocket_Boat',
  //     patch: 'Pocket_Patch',
  //     welt: 'Pocket_Welt'
  //   }
  // }
};

// ----- Three.js Initialization -----
function initThree() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 15);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth - 350, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById("viewer").appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 5, 5);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;
  controls.enablePan = false;
  controls.minDistance = 2;
  controls.maxDistance = 15;

  // Suit group holder
  suitGroup = new THREE.Group();
  scene.add(suitGroup);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// ----- Load GLTF Model -----
function loadJacketModel(url) {
  const loader = new GLTFLoader();
  loader.load(url, gltf => {
    const model = gltf.scene;
    suitGroup.clear();
    suitGroup.add(model);

    storeTopLevelGroups(model); // registers "lapel", "Buttons", etc.
    applyDefaultConfig();
  });
}

// Recursively set all meshes (including nested ones) to visible false
function setAllMeshesInvisible(object) {
  object.traverse((child) => {
    child.visible = false;
  });
}

function storeTopLevelGroups(root) {
  root.children.forEach(child => {
    if (child.name) {
      loadedMeshes[child.name] = child; // group of options
      setAllMeshesInvisible(child);
    }
  });

  console.log("Top-level groups:", loadedMeshes);
}

function updateVariant(groupName, visibleChildName) {
  const group = loadedMeshes[groupName]; // e.g., lapel, Buttons, shoulders

  if (!group) {
    console.warn(`Group '${groupName}' not found`);
    return;
  }

  // Check if the group is visible, if not make it visible
  if (!group.visible) {
    group.visible = true;
    console.log(`✅ Made group '${groupName}' visible`);
  }

  group.children.forEach(child => {
    if (child.name === visibleChildName) {
      child.visible = true;
      if (child.children.length > 0) {
        child.children.forEach(subChild => {
          subChild.visible = true;
          if (subChild.children.length > 0) {
            subChild.children.forEach(child => {
              child.visible = true;
            });
          }
        });
      }
    } else {
      child.visible = false;
    }
  });

  console.log(`✅ [${groupName}] showing: ${visibleChildName}`);
  console.log("group", group)
}

function applyDefaultConfig() {
  updateLapelStyle(CONFIG.defaults.lapelStyle);
  updateButtoning(CONFIG.defaults.buttoning);
  updateFront(CONFIG.defaults.front);
  updateShoulders(CONFIG.defaults.shoulder);
  // ... other updateXYZ functions
}

function updateLapelStyle(styleKey) {
  const lapelMap = {
    notch: 'Lapel_Notch',
    peak: 'Lapel_Peak',
    notchpeak: 'notchpeak'
  };

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
  updateVariant('Buttons', buttoningMap[styleKey]);
}
function updateFront(styleKey) {
  const frontMap = {
    Front_Structured: 'Front_Structured',
    Front_Unstructured: 'Front_Unstructured',
  };
  updateVariant('Front', frontMap[styleKey]);
}

function updateShoulders(styleKey) {
  console.log('styleKey', styleKey)
  const shouldersMap = {
    Natural_Shoulder: {
      Natural_Unconstructed: '_Unconstructed',
      Natural_Light: '_Lightly_Padded',
      Natural_Structured: 'Structured',
    },
    Rope_Shoulder: {
      Rope_Shoulder_Structured_5mm: 'Shoulder_Rope_5mm',
      Rope_Shoulder_Structured_10mm: 'Shoulder_Rope_10mm',
      Rope_Shoulder_Structured_15mm: 'Shoulder_Rope_15mm',
    }
  };
  updateVariant('shoulders', shouldersMap[styleKey]);
}

// ----- Show/Hide Meshes Based on Config Type -----
function applyVisibilityForType(type, selectedKey) {
  console.log('type', type)
  console.log('selectedKey', selectedKey)

  const options = CONFIG.assets[type];
  const selectedName = options[selectedKey];

  // Hide all options of this type
  Object.values(options).forEach(name => {
    const obj = loadedMeshes[name];
    if (obj) {
      if (Array.isArray(obj)) {
        obj.forEach(item => {
          item.visible = false;
          console.log(`Hidden: ${name} (${item.type})`);
        });
      } else {
        obj.visible = false;
        console.log(`Hidden: ${name} (${obj.type})`);
      }
    } else {
      console.warn(`❌ Object '${name}' not found in loadedMeshes`);
    }
  });

  // Show the selected one
  const selectedObj = loadedMeshes[selectedName];
  if (selectedObj) {
    if (Array.isArray(selectedObj)) {
      selectedObj.forEach(item => {
        item.visible = true;
        console.log(`✅ Shown: ${selectedName} (${item.type})`);
      });
    } else {
      selectedObj.visible = true;
      console.log(`✅ Shown: ${selectedName} (${selectedObj.type})`);
    }
  } else {
    console.error(`❌ Selected object '${selectedName}' not found in GLB`);
    console.log(`Available objects:`, Object.keys(loadedMeshes));
  }
}

// ----- Update On Config Change -----
function handleConfigChange(event) {
  const configType = event.target.id.replace('-select', '');
  const value = event.target.value;

  CONFIG.defaults[configType] = value;
  applyVisibilityForType(configType, value);
}

// ----- Initialize DOM Selectors & Events -----
function initConfigUI() {
  const selects = [
    'buttoning', 'lapel-style', 'lapel-width', 'vent',
    'construction', 'shoulder', 'amf', 'chest-pocket'
  ];

  selects.forEach(id => {
    const domId = `${id}-select`;
    document.getElementById(domId).value = CONFIG.defaults[camelToKebab(id)];
    document.getElementById(domId).addEventListener('change', handleConfigChange);
  });
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