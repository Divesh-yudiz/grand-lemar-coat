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
    buttoning: 'single_breasted_2',
    lapelStyle: 'peak',
    front: 'Front_Structured',
    lapelWidth: 'narrow',
    construction: 'half_canvas',
    shoulder: 'Structured',
    amf: '2mm_standard',
    chestPocket: "ChestPocket",
    martingaleBelt: true,
    invertedBoxPleat: true,
    sidePocket: "slanted_pocket",
    sleeveDesign: "cuffed",
    linings: "half",
    vent: "Structured"
  },
  // Define which lapel styles are available for each buttoning type
  lapelConstraints: {
    single_breasted_2_5: ['notch', 'peak'], // Assuming this option exists
    double_breasted_6: ['notchpeak']
  }
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
  camera.position.set(0, 0, 4);

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

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight1.position.set(-5, -5, -5);
  dirLight1.castShadow = true;
  scene.add(dirLight1);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true;
  // controls.dampingFactor = 0.25;
  // controls.enableZoom = true;
  // controls.enablePan = false;
  // controls.minDistance = 3;
  // controls.maxDistance = 5;

  // Suit group holder
  suitGroup = new THREE.Group();
  scene.add(suitGroup);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function loadJacketModel(url) {
  const loader = new GLTFLoader();
  loader.load(url, gltf => {
    const model = gltf.scene;
    suitGroup.clear();
    suitGroup.add(model);

    // Center the model
    centerModel(model);

    storeTopLevelGroups(model); // registers "lapel", "Buttons", etc.
    applyDefaultConfig();
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

function storeTopLevelGroups(root) {
  root.children.forEach(child => {
    if (child.name) {
      loadedMeshes[child.name] = child; // group of options
      setAllMeshesInvisible(child);
    }
  });

  console.log("Top-level groups:", loadedMeshes);
}

function updateVariant(groupName, visibleChildName, toggle = true) {
  const group = loadedMeshes[groupName]; // e.g., lapel, Buttons, shoulders

  if (!group) {
    console.warn(`Group '${groupName}' not found`);
    return;
  }

  // Check if the group is visible, if not make it visible
  if (!group.visible) {
    group.visible = true;
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
      if (toggle) {
        child.visible = false;
      } else {
        child.visible = true;
      }
    }
  });
}

function applyDefaultConfig() {
  updateLapelStyle(CONFIG.defaults.lapelStyle);
  updateButtoning(CONFIG.defaults.buttoning);
  updateFront(CONFIG.defaults.front);
  updateShoulders(CONFIG.defaults.shoulder);
  martingaleBelt(CONFIG.defaults.martingaleBelt);
  // invertedBoxPleat(CONFIG.defaults.invertedBoxPleat);
  updateChestPocket(CONFIG.defaults.chestPocket);
  updateSidePocket(CONFIG.defaults.sidePocket);
  updateSleeveDesign(CONFIG.defaults.sleeveDesign);
  updateLinings(CONFIG.defaults.linings);
  // updateVent(CONFIG.defaults.vent);
  // ... other updateXYZ functions
}

function updateLapelStyle(styleKey) {
  const lapelMap = {
    notch: 'noatch',
    peak: 'Peak',
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

  if (styleKey === 'double_breasted_6') {
    updateVariant('Buttons', buttoningMap[styleKey]);
    updateVariant('back', "back");
  } else {
    updateVariant('Buttons', buttoningMap[styleKey]);
  }
}

function updateFront(styleKey) {
  const frontMap = {
    Front_Structured: 'front_Structured',
    Front_Unstructured: 'front_Unconstructed',
    Front_Lightly_Padded: 'front_Lightly_Padded',
  };
  updateVariant('Front', frontMap[styleKey]);
}

function updateShoulders(styleKey) {

  const shoulderGroup = loadedMeshes['shoulders'];

  console.log("shoulderGroup", shoulderGroup)

  if (!shoulderGroup) {
    console.warn('Shoulder group not found');
    return;
  }

  // Make the shoulder group visible
  shoulderGroup.visible = true;

  // Fixed shoulder type to 'Natural_Shoulder'
  const fixedShoulderType = 'Natural_Shoulder';
  const shoulderType = shoulderGroup.children.find(child => child.name === fixedShoulderType);

  if (!shoulderType) {
    console.warn(`Shoulder type '${fixedShoulderType}' not found`);
    return;
  }

  shoulderType.visible = true;
  const variantName = styleKey || 'Structured';
  const targetVariant = shoulderType.children.find(variant => variant.name === variantName);
  if (targetVariant) {
    targetVariant.visible = true;

    // Make all nested children of this variant visible
    targetVariant.traverse((subChild) => {
      subChild.visible = true;
    });

    console.log(`✅ Updated shoulders to: ${styleKey}.${variantName}`);
  } else {
    console.warn(`Shoulder variant '${variantName}' not found in ${styleKey}`);
  }
}

function martingaleBelt(styleKey) {
  updateVariant('Buttons', "belt_buttons", false);
  updateVariant('Martingale_Belt', styleKey, false);
}

function invertedBoxPleat(styleKey) {
  if (!styleKey) {
    const invertedBoxPleatGroup = loadedMeshes['Inverted_Box_pleat'];
    if (invertedBoxPleatGroup) {
      invertedBoxPleatGroup.visible = false;
    }
    return;
  }

  const shoulderConfig = CONFIG.defaults.shoulder;
  console.log("styleKey", styleKey)

  // Map shoulder configuration to the appropriate pleat variant
  const pleatVariantMap = {
    'Structured': 'Structured_Inverted_box_pleat',
    '_Unconstructed': '_Unconstructed_Inverted_box_pleat',
    '_Lightly_Padded': 'Lightly_Padded_Inverted_box_pleat'
  };

  const targetPleatVariant = pleatVariantMap[shoulderConfig];

  if (targetPleatVariant) {
    updateVariant('Inverted_Box_pleat', targetPleatVariant);
    // updateVariant('Inverted_Box_pleat', "pleat");
  } else {
    console.warn(`No pleat variant found for shoulder config: ${shoulderConfig}`);
  }
}

function updateChestPocket(styleKey) {
  updateVariant('ChestPocket_Boat', styleKey);
}

function updateSidePocket(styleKey) {
  updateVariant('Sidepocket', styleKey);
}

function updateSleeveDesign(styleKey) {
  updateVariant('Sleeve_design', styleKey);
}

function updateLinings(styleKey) {
  console.log("updateLinings", styleKey)
  const liningtMap = {
    full: 'Lining_6_Buttons',
    half: 'Lining_2-4_Buttons',
  };

  function updateSleeveLinings() {
    const sleeveLiningsGroup = loadedMeshes['lining'];
    const targetVariant = sleeveLiningsGroup.children.find(variant => variant.name === "LiningSleeve");
    if (targetVariant) {
      targetVariant.visible = true;
    }
  }
  updateVariant('lining', liningtMap[styleKey]);
  updateSleeveLinings();
}

function updateVent(styleKey) {
  const ventMap = {
    'Structured': 'vent_Structured',
    '_Unconstructed': 'vent_unconstructured',
    '_Lightly_Padded': 'vent_lightly_padded'
  };
  const shoulderConfig = CONFIG.defaults.shoulder;
  const targetVentVariant = ventMap[shoulderConfig];
  console.log("targetVentVariant", targetVentVariant)

  if (targetVentVariant) {
    updateVariant('vent', targetVentVariant);
  } else {
    console.warn(`No vent variant found for shoulder config: ${shoulderConfig}`);
  }
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

  // Handle special case for buttoning changes
  if (configType === 'buttoning') {
    updateLapelOptions(value);
  }

  applyVisibilityForType(configType, value);
}

// ----- Update Lapel Options Based on Buttoning -----
function updateLapelOptions(buttoningType) {
  const lapelSelect = document.getElementById('lapel-style-select');
  const currentLapelValue = lapelSelect.value;

  // Get allowed lapel styles for this buttoning type
  const allowedLapelStyles = CONFIG.lapelConstraints[buttoningType] || ['notch', 'peak', 'notchpeak'];

  // Clear current options
  lapelSelect.innerHTML = '';

  // Add allowed options
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

    // Update the 3D model to reflect the new lapel style
    updateLapelStyle(newDefault);
  }
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