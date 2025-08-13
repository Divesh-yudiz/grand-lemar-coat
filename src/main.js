import * as THREE from "https://esm.sh/three@0.169.0";
import { OrbitControls } from "https://esm.sh/three@0.169.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://esm.sh/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "https://esm.sh/three@0.169.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://esm.sh/three@0.169.0/examples/jsm/postprocessing/RenderPass.js";
import poloCoaModel from './assets/polo_coat.glb';
import fabric1 from './assets/fabrics/color2.png';
import uv1 from './assets/fabrics/uv2.png';
import fabric2 from './assets/fabrics/color.jpeg';
import uv2 from './assets/fabrics/uv.png';

// ----- Global Variables -----
let scene, camera, renderer, controls, suitGroup, composer, renderPass;
let aLight = [], dirLight2, dirLight3, backLight;
let cameraFollowLight; // Add this new variable
const loadedMeshes = {};

// Remove GUI variables and keep only the light offset
let lightOffset = {
  x: -20,
  y: 16.8,
  z: 10
};

let currentButtoning, currentLapelStyle, currentShoulder, currentMartingaleBelt, currentInvertedBoxPleat, currentFront, currentChestPocket, currentSidePocket, currentSleeveDesign, currentLinings, currentVent = 'none', currentButtonholeLapelPosition;

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
    buttonholeLapelPosition: "left",
    fabric: "fabric1",
    buttonFabric: "button-fabric1", // Add button fabric default
    liningFabric: "lining-fabric1"  // Add lining fabric default
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

  },
  // Add fabric assets mapping
  fabrics: {
    fabric1: {
      color: fabric1,
      normal: uv1,
      name: 'Charcoal Grey'
    },
    fabric2: {
      color: fabric2,
      normal: uv2,
      name: 'Light Beige'
    }
  },

  // Add button fabric assets mapping
  buttonFabrics: {
    'button-fabric1': {
      color: fabric1,
      normal: uv1,
      name: 'Charcoal Grey'
    },
    'button-fabric2': {
      color: fabric2,
      normal: uv2,
      name: 'Light Beige'
    }
  },

  // Add lining fabric assets mapping
  liningFabrics: {
    'lining-fabric1': {
      color: fabric1,
      normal: uv1,
      name: 'Charcoal Grey'
    },
    'lining-fabric2': {
      color: fabric2,
      normal: uv2,
      name: 'Light Beige'
    }
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
  });
  // renderer.toneMapping = THREE.CineonToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.setSize(window.innerWidth - 350, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  composer = new EffectComposer(renderer);
  renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  document.getElementById("viewer").appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  backLight = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(backLight);
  backLight.position.set(10, 0, 10);

  // Create directional light that will follow camera with offset
  cameraFollowLight = new THREE.DirectionalLight(0xffffff, 3.9);
  cameraFollowLight.castShadow = true;
  cameraFollowLight.shadow.mapSize.width = 2048;
  cameraFollowLight.shadow.mapSize.height = 2048;
  cameraFollowLight.shadow.camera.near = 0.5;
  cameraFollowLight.shadow.camera.far = 50;
  cameraFollowLight.shadow.camera.left = -10;
  cameraFollowLight.shadow.camera.right = 10;
  cameraFollowLight.shadow.camera.top = 10;
  cameraFollowLight.shadow.camera.bottom = -10;
  scene.add(cameraFollowLight);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true;
  // controls.enablePan = false;
  // controls.minPolarAngle = Math.PI / 2;
  // controls.maxPolarAngle = Math.PI / 2;
  // controls.minZoom = 0.75;
  // controls.maxZoom = 1.5;
  // controls.enableZoom = false;
  // Suit group holder
  suitGroup = new THREE.Group();
  scene.add(suitGroup);

  // Remove GUI initialization
  // initGUI();

  animate();
}

// Remove the entire initGUI function

function animate() {
  if (cameraFollowLight) {
    const offset = new THREE.Vector3(lightOffset.x, lightOffset.y, lightOffset.z);
    offset.applyQuaternion(camera.quaternion);
    cameraFollowLight.position.copy(camera.position).add(offset);
    if (suitGroup) {
      cameraFollowLight.target.position.copy(suitGroup.position);
      cameraFollowLight.target.updateMatrixWorld();
    }
  }

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

    // model.rotation.y = Math.PI;

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

    console.log("Loaded meshes:", loadedMeshes);

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
  updateFabric(CONFIG.defaults.fabric); // Add fabric update
  // updateButtonFabric(CONFIG.defaults.buttonFabric); // Add button fabric update
  // updateLiningFabric(CONFIG.defaults.liningFabric); // Add lining fabric update
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
  updateButtonholeLapelPosition(currentButtonholeLapelPosition || CONFIG.defaults.buttonholeLapelPosition);
}

function updateButtoning(styleKey, toggle = true, visibility = true) {
  const buttoningMap = {
    single_breasted_2: '2_Buttons',
    double_breasted_6: '6_buttons',
    belt_buttons: 'belt_button',
    one_strap: 'one_strap_button',
    pleat_buttons: 'pleat_buttons',
    sec_strap: 'sec_strap'
  };

  currentButtoning = styleKey;

  updateVariant('Buttons', buttoningMap[styleKey], toggle, visibility);
}

function updateFront() {
  const currentLapel = CONFIG.defaults.lapelStyle;
  let frontStyleKey;

  if (currentButtoning === 'single_breasted_2') {
    frontStyleKey = `2_Buttons_Front_${CONFIG.defaults.shoulder || currentShoulder}`;
  } else if (currentButtoning === 'double_breasted_6') {
    frontStyleKey = `6_Buttons_Front_${CONFIG.defaults.shoulder || currentShoulder}`;
  } else {
    console.warn(`Unsupported buttoning type for front: ${currentButtoning}`);
    return;
  }

  const frontMap = {
    '2_Buttons_Front_Structured': '2Button_Structured',
    '2_Buttons_Front_Unconstructed': '2Button_Unconstructed',
    '2_Buttons_Front_Lightly_Padded': '2Button_Lightly_padded',
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
      if (child.name === "belt_button" || child.name === "belt_buttons") {
        child.visible = visibility;
        child.traverse((subChild) => {
          subChild.visible = visibility;
        });
      }
    });
  }

  updateVariant('Martingale_Belt', "none", true, visibility);
}

function invertedBoxPleat(styleKey, visibility = true) {

  function updatePleatButtons(visibility) {
    const pleatButtonsGroup = loadedMeshes['Buttons'];
    pleatButtonsGroup.traverse((child) => {
      if (child.name === "pleat_buttons") {
        child.visible = visibility;
        child.traverse((subChild) => {
          subChild.visible = visibility;
        });
      }
    });
  }

  if (styleKey == "false" || styleKey == false || styleKey == "true" || styleKey == true) {
    currentInvertedBoxPleat = styleKey;
  }

  if (currentInvertedBoxPleat === "false" || currentInvertedBoxPleat === false) {
    updateVariant('Inverted_Box_Pleat', "none", true, false);
    updatePleatButtons(false);
    updateVent();
    return;
  }

  const buttoningConfig = currentButtoning || CONFIG.defaults.buttoning;
  const shoulderConfig = currentShoulder || CONFIG.defaults.shoulder;

  // Map buttoning and shoulder configuration to the appropriate pleat variant
  const pleatVariantMap = {
    '6_Buttons_Structured': '6button_Structured_Inverted_box_pleat',
    '6_Buttons_Unconstructed': '6button_Unconstructed_Inverted_box_pleat',
    '6_Buttons_Lightly_Padded': '6buttonLightly_Padded_Inverted_box_pleat',
    '2_Buttons_Structured': 'Structured_Inverted_box_pleat_2Button',
    '2_Buttons_Unconstructed': '_Unconstructed_Inverted_box_pleat_2Button',
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
  const targetPleatVariant = pleatVariantMap[pleatKey];
  if (targetPleatVariant) {
    updatePleatButtons(true);
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
    'slanted-welt': 'slanted',
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

  // Handle sleeve-specific buttons separately without affecting main buttoning
  if (styleKey === 'sleeve-strap-with-buttons') {
    updateVariant('sleave_buttons', 'sec_strap', true);
  } else if (styleKey === 'sleeve-strap') {
    updateVariant('sleave_buttons', 'one_strap_button', true);
  } else if (styleKey === 'un-cuffed') {
    updateVariant('sleave_buttons', 'none', true);
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

function updateVent(ventType) {
  if (currentInvertedBoxPleat === "true" || currentInvertedBoxPleat === true) {
    updateVariant('vent', "none", true, false);
    updateVariant('no_vent', "none", true, false);
    return;
  }
  const buttoningConfig = currentButtoning || CONFIG.defaults.buttoning;
  const shoulderConfig = currentShoulder || CONFIG.defaults.shoulder;
  const martingaleBeltValue = currentMartingaleBelt || CONFIG.defaults.martingaleBelt;
  const invertedBoxPleatValue = currentInvertedBoxPleat || CONFIG.defaults.invertedBoxPleat;

  // First, hide both vent groups initially
  updateVariant('vent', "none", true, false);
  updateVariant('no_vent', "none", true, false);

  console.log("martingaleBeltValue", martingaleBeltValue);
  console.log("invertedBoxPleatValue", invertedBoxPleatValue);
  console.log("currentVent", currentVent);
  // If there's a martingale belt or inverted box pleat, show no vent
  if (currentVent === "none" && (invertedBoxPleatValue === "false" || invertedBoxPleatValue === false)) {
    console.log("checkpoint 1")
    // Create the key for no vent based on buttoning and shoulder
    const noVentKey = buttoningConfig === 'single_breasted_2' ?
      `2Button_${shoulderConfig}` :
      `6Button_${shoulderConfig}`;

    const noVentMap = {
      '6Button_Structured': '6Button_Vent_Structured_novent',
      '6Button_Unconstructed': '6Button_vent_Unconstructed_novent',
      '6Button_Lightly_Padded': '6Button_lightly_Padded_novent',
      '2Button_Structured': '2button_vent_Structured_novent',
      '2Button_Unconstructed': '2button_vent_unconstructured_novent',
      '2Button_Lightly_Padded': '2button_vent_lightly_padded_no_vent'
    };

    const targetNoVentVariant = noVentMap[noVentKey];
    if (targetNoVentVariant) {
      updateVariant('no_vent', targetNoVentVariant, true, true);
    } else {
      console.warn(`No no-vent variant found for: ${noVentKey}`);
      updateVariant('no_vent', "none", true, true);
    }
    currentVent = "none";
    return;
  }

  // Only show vent options when there's no martingale belt and no inverted box pleat
  if (invertedBoxPleatValue === "false" || invertedBoxPleatValue === false) {
    console.log("checkpoint 2")
    // Get the vent type from UI config (ventType parameter or current selection)
    console.log("currentVent", currentVent);
    const selectedVentType = ventType || getConfigValue('vent') || CONFIG.defaults.vent;
    console.log("selectedVentType", selectedVentType);
    if (selectedVentType === 'single') {
      console.log("checkpoint 3")
      // Show single vent with appropriate variant based on buttoning and shoulder
      const ventKey = buttoningConfig === 'single_breasted_2' ?
        `2Button_${shoulderConfig}` :
        `6Button_${shoulderConfig}`;

      const ventMap = {
        '6Button_Structured': '6Button_Vent_Structured',
        '6Button_Unconstructed': '6Button_vent_Unconstructed',
        '6Button_Lightly_Padded': '6Button_lightly_Padded',
        '2Button_Structured': '2button_vent_Structured',
        '2Button_Unconstructed': '2button_vent_unconstructured',
        '2Button_Lightly_Padded': '2button_vent_lightly_padded'
      };

      const targetVentVariant = ventMap[ventKey];

      if (targetVentVariant) {
        updateVariant('vent', targetVentVariant, true, true);
        currentVent = "single";
      } else {
        console.warn(`No vent variant found for: ${ventKey}`);
        updateVariant('no_vent', "none", true, true);
        currentVent = "none";
      }
    } else if (selectedVentType === 'none') {
      console.log("checkpoint 4")
      // Show appropriate no vent variant based on buttoning and shoulder
      const noVentKey = buttoningConfig === 'single_breasted_2' ?
        `2Button_${shoulderConfig}` :
        `6Button_${shoulderConfig}`;

      const noVentMap = {
        '6Button_Structured': '6Button_Vent_Structured_novent',
        '6Button_Unconstructed': '6Button_vent_Unconstructed_novent',
        '6Button_Lightly_Padded': '6Button_lightly_Padded_novent',
        '2Button_Structured': '2button_vent_Structured_novent',
        '2Button_Unconstructed': '2button_vent_unconstructured_novent',
        '2Button_Lightly_Padded': '2button_vent_lightly_padded_no_vent'
      };

      const targetNoVentVariant = noVentMap[noVentKey];
      if (targetNoVentVariant) {
        updateVariant('no_vent', targetNoVentVariant, true, true);
      } else {
        console.warn(`No no-vent variant found for: ${noVentKey}`);
        updateVariant('no_vent', "none", true, true);
      }
      currentVent = "none";
    }
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

  // Define button names based on the specific hierarchy structure for each lapel type
  const buttonNames = {
    notch: {
      left: 'notch_lapel_left_button',
      right: 'notch_lapel_right_button'
    },
    peak: {
      left: 'peak_left_button',
      right: 'peak_right_button'
    },
    notchpeak: {
      left: 'notchpeak_lapel_left_button',
      right: 'notchpeak_lapel_right_button'
    }
  };

  // Get the button names for the current lapel style
  const currentButtonNames = buttonNames[currentLapel];
  if (!currentButtonNames) {
    console.warn(`No button names defined for lapel style: ${currentLapel}`);
    return;
  }

  // Handle different position selections
  switch (styleKey) {
    case 'left':
      // Show only left button, hide right button
      currentLapelStyleGroup.children.forEach(child => {
        if (child.name === currentButtonNames.left) {
          child.visible = true;
          child.traverse(subChild => subChild.visible = true);
        } else if (child.name === currentButtonNames.right) {
          child.visible = false;
          child.traverse(subChild => subChild.visible = false);
        }
      });
      break;

    case 'right':
      // Show only right button, hide left button
      currentLapelStyleGroup.children.forEach(child => {
        if (child.name === currentButtonNames.right) {
          child.visible = true;
          child.traverse(subChild => subChild.visible = true);
        } else if (child.name === currentButtonNames.left) {
          child.visible = false;
          child.traverse(subChild => subChild.visible = false);
        }
      });
      break;

    case 'both':
      // Show both buttons
      currentLapelStyleGroup.children.forEach(child => {
        if (child.name === currentButtonNames.left || child.name === currentButtonNames.right) {
          child.visible = true;
          child.traverse(subChild => subChild.visible = true);
        }
      });
      break;

    case 'none':
      // Hide both buttons
      currentLapelStyleGroup.children.forEach(child => {
        if (child.name === currentButtonNames.left || child.name === currentButtonNames.right) {
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

  // Add fabric configurations
  config.fabric = CONFIG.defaults.fabric;
  config.buttonFabric = CONFIG.defaults.buttonFabric;
  config.liningFabric = CONFIG.defaults.liningFabric;

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
 * Unified function to apply textures to specific mesh groups
 * @param {THREE.Texture} colorTexture - The fabric color texture to apply
 * @param {THREE.Texture} normalTexture - The fabric normal texture to apply
 * @param {Array} targetGroups - Array of group names to apply textures to
 * @param {Object} materialOptions - Additional material properties
 * @param {Array} excludeGroups - Array of group names to exclude
 */
function applyTexturesToGroups(colorTexture, normalTexture, targetGroups, materialOptions = {}, excludeGroups = []) {
  if (!suitGroup || !targetGroups || targetGroups.length === 0) return;

  // Configure texture settings
  const configureTexture = (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.encoding = THREE.sRGBEncoding;

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.anisotropy = maxAnisotropy;

    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const repeatX = materialOptions.repeat?.[0] || 10;
    const repeatY = materialOptions.repeat?.[1] || 10;
    texture.repeat.set(repeatX, repeatY);
  };

  // Configure both textures
  configureTexture(colorTexture);
  configureTexture(normalTexture);

  // Function to check if a mesh belongs to target groups
  function isTargetGroup(mesh) {
    if (!mesh.name) return false;

    // Check if mesh is in exclude groups
    if (excludeGroups.some(exclude => mesh.name.toLowerCase().includes(exclude.toLowerCase()))) {
      return false;
    }

    // Check if mesh is in target groups
    return targetGroups.some(target => mesh.name.toLowerCase().includes(target.toLowerCase()));
  }

  // Function to check if a mesh belongs to target groups (including parent hierarchy)
  function isInTargetGroup(mesh) {
    if (isTargetGroup(mesh)) return true;

    let parent = mesh.parent;
    while (parent) {
      if (isTargetGroup(parent)) return true;
      parent = parent.parent;
    }
    return false;
  }

  // Function to apply textures to a mesh
  function applyTexturesToMesh(mesh) {
    if (mesh.isMesh && mesh.material && isInTargetGroup(mesh)) {
      mesh.material.map = colorTexture;
      mesh.material.normalMap = normalTexture;
      mesh.material.normalMap.needsUpdate = true;

      mesh.material.polygonOffset = true;
      mesh.material.polygonOffsetFactor = 1;
      mesh.material.polygonOffsetUnits = 1;

      mesh.material.depthWrite = true;
      mesh.material.depthTest = true;
      mesh.material.roughness = 1;
      mesh.material.metalness = 0.5;

      mesh.material.needsUpdate = true;
    }
  }

  // Traverse and apply textures
  suitGroup.traverse((child) => {
    applyTexturesToMesh(child);
  });
}

/**
 * Load and apply fabric textures to the model
 * @param {string} colorTextureUrl - URL or path to the fabric color texture
 * @param {string} normalTextureUrl - URL or path to the fabric normal texture
 * @param {Object} materialOptions - Additional material properties
 */
function loadAndApplyFabric(colorTextureUrl, normalTextureUrl, materialOptions = {}, targetGroups = ['Front', 'shoulders', 'vent', 'ChestPocket', 'lapel', 'Sidepocket', 'Sleeve_design', 'Inverted_Box_Pleat', 'Martingale_Belt'], excludeGroups = ['Buttons', 'lining', 'full', 'half']) {
  const textureLoader = new THREE.TextureLoader();
  let colorTextureLoaded = false;
  let normalTextureLoaded = false;
  let colorTexture, normalTexture;

  // Load color texture
  textureLoader.load(
    colorTextureUrl,
    (texture) => {
      colorTexture = texture;
      colorTextureLoaded = true;

      if (colorTextureLoaded && normalTextureLoaded) {
        applyTexturesToGroups(colorTexture, normalTexture, targetGroups, materialOptions, excludeGroups);
      }
    },
    undefined,
    (error) => {
      console.error('❌ Error loading color texture:', error);
    }
  );

  // Load normal texture
  textureLoader.load(
    normalTextureUrl,
    (texture) => {
      normalTexture = texture;
      normalTextureLoaded = true;

      if (colorTextureLoaded && normalTextureLoaded) {
        applyTexturesToGroups(colorTexture, normalTexture, targetGroups, materialOptions, excludeGroups);
      }
    },
    undefined,
    (error) => {
      console.error('❌ Error loading normal texture:', error);
    }
  );
}

// Add fabric update function
function updateFabric(fabricKey) {
  const fabricConfig = CONFIG.fabrics[fabricKey];
  if (!fabricConfig) {
    console.warn(`❌ Fabric configuration not found for: ${fabricKey}`);
    return;
  }

  // Load and apply the new fabric
  loadAndApplyFabric(fabricConfig.color, fabricConfig.normal, {
    repeat: [20, 20],
  });

  // Update UI to show selected fabric
  updateFabricSelectionUI(fabricKey);
}

// Add function to update fabric selection UI
function updateFabricSelectionUI(selectedFabric) {
  const fabricOptions = document.querySelectorAll('.fabric-option');
  fabricOptions.forEach(option => {
    option.classList.remove('selected');
    if (option.dataset.fabric === selectedFabric) {
      option.classList.add('selected');
    }
  });
}

// Add button fabric update function
function updateButtonFabric(fabricKey) {
  const fabricConfig = CONFIG.buttonFabrics[fabricKey];
  if (!fabricConfig) {
    console.warn(`❌ Button fabric configuration not found for: ${fabricKey}`);
    return;
  }

  // Load and apply the new button fabric
  loadAndApplyButtonFabric(fabricConfig.color, fabricConfig.normal, {
    repeat: [20, 20],
  });

  // Update UI to show selected button fabric
  updateButtonFabricSelectionUI(fabricKey);
}

// Add lining fabric update function
function updateLiningFabric(fabricKey) {
  const fabricConfig = CONFIG.liningFabrics[fabricKey];
  if (!fabricConfig) {
    console.warn(`❌ Lining fabric configuration not found for: ${fabricKey}`);
    return;
  }

  // Load and apply the new lining fabric
  loadAndApplyLiningFabric(fabricConfig.color, fabricConfig.normal, {
    repeat: [20, 20],
  });

  // Update UI to show selected lining fabric
  updateLiningFabricSelectionUI(fabricKey);
}

// Add function to update button fabric selection UI
function updateButtonFabricSelectionUI(selectedFabric) {
  const fabricOptions = document.querySelectorAll('[data-fabric^="button-fabric"]');
  fabricOptions.forEach(option => {
    option.classList.remove('selected');
    if (option.dataset.fabric === selectedFabric) {
      option.classList.add('selected');
    }
  });
}

// Add function to update lining fabric selection UI
function updateLiningFabricSelectionUI(selectedFabric) {
  const fabricOptions = document.querySelectorAll('[data-fabric^="lining-fabric"]');
  fabricOptions.forEach(option => {
    option.classList.remove('selected');
    if (option.dataset.fabric === selectedFabric) {
      option.classList.add('selected');
    }
  });
}

// ----- Update Vent Options Based on Martingale Belt and Inverted Box Pleat -----
function updateVentOptions() {
  const ventSelect = document.getElementById('vent-select');
  const martingaleBeltValue = getConfigValue('martingaleBelt');
  const invertedBoxPleatValue = getConfigValue('invertedBoxPleat');

  // Clear current options
  ventSelect.innerHTML = '';

  // If both martingale belt and inverted box pleat are true, only show "none"
  if (martingaleBeltValue === true && invertedBoxPleatValue === true) {
    const option = document.createElement('option');
    option.value = 'none';
    option.textContent = 'NONE';
    ventSelect.appendChild(option);

    // Set the value to none and update the model
    ventSelect.value = 'none';
    CONFIG.defaults.vent = 'none';
    updateVent();
  } else {
    // Show both "none" and "single" options
    const noneOption = document.createElement('option');
    noneOption.value = 'none';
    noneOption.textContent = 'NONE';
    ventSelect.appendChild(noneOption);

    const singleOption = document.createElement('option');
    singleOption.value = 'single';
    singleOption.textContent = 'SINGLE';
    ventSelect.appendChild(singleOption);

    // Keep current selection if it's valid, otherwise default to 'none'
    if (ventSelect.value !== 'none' && ventSelect.value !== 'single') {
      ventSelect.value = 'none';
      CONFIG.defaults.vent = 'none';
    }

    updateVent();
  }
}

// ----- Update On Config Change -----
function handleConfigChange(event) {
  const configType = event.target.id.replace('-select', '');
  const value = event.target.value;
  CONFIG.defaults[configType] = value;

  if (configType === 'buttoning') {
    updateButtoning(value);
    updateLapelOptions(value);
    updateFront();
    updateVent();
    invertedBoxPleat();
    updateLinings();
    const currentMartingaleBelt = getConfigValue('martingaleBelt');
    martingaleBelt(currentMartingaleBelt, currentMartingaleBelt);
    updateVentOptions(); // Add this line
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

  if (configType === 'inverted-box-pleat') {
    currentInvertedBoxPleat = value;
    console.log("currentInvertedBoxPleat", currentInvertedBoxPleat);
    invertedBoxPleat(value);
    updateVent();
    updateVentOptions(); // Add this line
  }

  if (configType === 'vent') {
    currentVent = value;
    console.log("currentVent", currentVent);
    if (value === 'single') {
      updateVent('single');
    } else if (value === 'none') {
      updateVent('none');
    }
  }

  if (configType === 'martingale-belt') {
    const isVisible = value === 'true';
    currentMartingaleBelt = value;
    martingaleBelt(value, isVisible);

    updateVent();
    updateVentOptions(); // Add this line
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
    currentButtonholeLapelPosition = value;
    updateButtonholeLapelPosition(value);
  }
}

// Add fabric change handler
function handleFabricChange(fabricKey) {
  console.log("handleFabricChange", fabricKey);
  CONFIG.defaults.fabric = fabricKey;
  updateFabric(fabricKey);
}

// Add button fabric change handler
function handleButtonFabricChange(fabricKey) {
  CONFIG.defaults.buttonFabric = fabricKey;
  updateButtonFabric(fabricKey);
}

// Add lining fabric change handler
function handleLiningFabricChange(fabricKey) {
  CONFIG.defaults.liningFabric = fabricKey;
  updateLiningFabric(fabricKey);
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

/**
 * Load and apply button fabric textures
 * @param {string} colorTextureUrl - URL or path to the button fabric color texture
 * @param {string} normalTextureUrl - URL or path to the button fabric normal texture
 * @param {Object} materialOptions - Additional material properties
 */
function loadAndApplyButtonFabric(colorTextureUrl, normalTextureUrl, materialOptions = {}) {
  const textureLoader = new THREE.TextureLoader();
  let colorTextureLoaded = false;
  let normalTextureLoaded = false;
  let colorTexture, normalTexture;

  // Load color texture
  textureLoader.load(
    colorTextureUrl,
    (texture) => {
      colorTexture = texture;
      colorTextureLoaded = true;

      if (colorTextureLoaded && normalTextureLoaded) {
        applyTexturesToGroups(colorTexture, normalTexture, ['Buttons', '2_Buttons', '6_buttons', 'belt_buttons', 'pleat_buttons', 'sleave_buttons', 'sec_strap', 'one_strap_button', 'notch_lapel_left_button', 'notch_lapel_right_button', 'peak_left_button', 'peak_right_button', 'notchpeak_lapel_left_button', 'notchpeak_lapel_right_button'], materialOptions, ['Full_Sleeve_Strap_with_buttons', 'Sleeve_Eqaulettes003', 'one_strap002']);
      }
    },
    undefined,
    (error) => {
      console.error('❌ Error loading button color texture:', error);
    }
  );

  // Load normal texture
  textureLoader.load(
    normalTextureUrl,
    (texture) => {
      normalTexture = texture;
      normalTextureLoaded = true;

      if (colorTextureLoaded && normalTextureLoaded) {
        applyTexturesToGroups(colorTexture, normalTexture, ['Buttons', '2_Buttons', '6_buttons', 'belt_buttons', 'pleat_buttons', 'sleave_buttons', 'sec_strap', 'one_strap_button', 'notch_lapel_left_button', 'notch_lapel_right_button', 'peak_left_button', 'peak_right_button', 'notchpeak_lapel_left_button', 'notchpeak_lapel_right_button'], materialOptions, ['Full_Sleeve_Strap_with_buttons', 'Sleeve_Eqaulettes003', 'one_strap002']);
      }
    },
    undefined,
    (error) => {
      console.error('❌ Error loading button normal texture:', error);
    }
  );
}

/**
 * Load and apply lining fabric textures
 * @param {string} colorTextureUrl - URL or path to the lining fabric color texture
 * @param {string} normalTextureUrl - URL or path to the lining fabric normal texture
 * @param {Object} materialOptions - Additional material properties
 */
function loadAndApplyLiningFabric(colorTextureUrl, normalTextureUrl, materialOptions = {}) {
  const textureLoader = new THREE.TextureLoader();
  let colorTextureLoaded = false;
  let normalTextureLoaded = false;
  let colorTexture, normalTexture;

  // Load color texture
  textureLoader.load(
    colorTextureUrl,
    (texture) => {
      colorTexture = texture;
      colorTextureLoaded = true;

      if (colorTextureLoaded && normalTextureLoaded) {
        applyTexturesToGroups(colorTexture, normalTexture, ['LiningSleeve', 'full', 'half'], materialOptions, ['Front', 'shoulders', 'vent', 'ChestPocket', 'Sidepocket', 'Sleeve_design', 'Inverted_Box_Pleat', 'Martingale_Belt', 'Buttons', 'lapel']);
      }
    },
    undefined,
    (error) => {
      console.error('❌ Error loading lining color texture:', error);
    }
  );

  // Load normal texture
  textureLoader.load(
    normalTextureUrl,
    (texture) => {
      normalTexture = texture;
      normalTextureLoaded = true;

      if (colorTextureLoaded && normalTextureLoaded) {
        applyTexturesToGroups(colorTexture, normalTexture, ['LiningSleeve', 'full', 'half'], materialOptions, ['Front', 'shoulders', 'vent', 'ChestPocket', 'Sidepocket', 'Sleeve_design', 'Inverted_Box_Pleat', 'Martingale_Belt', 'Buttons', 'lapel']);
      }
    },
    undefined,
    (error) => {
      console.error('❌ Error loading lining normal texture:', error);
    }
  );
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

  // Add main fabric selection event listeners
  const fabricOptions = document.querySelectorAll('[data-fabric^="fabric"]');
  fabricOptions.forEach(option => {
    option.addEventListener('click', () => {
      const fabricKey = option.dataset.fabric;
      handleFabricChange(fabricKey);
    });
  });

  // Add button fabric selection event listeners
  const buttonFabricOptions = document.querySelectorAll('[data-fabric^="button-fabric"]');
  buttonFabricOptions.forEach(option => {
    option.addEventListener('click', () => {
      const fabricKey = option.dataset.fabric;
      handleButtonFabricChange(fabricKey);
    });
  });

  // Add lining fabric selection event listeners
  const liningFabricOptions = document.querySelectorAll('[data-fabric^="lining-fabric"]');
  liningFabricOptions.forEach(option => {
    option.addEventListener('click', () => {
      const fabricKey = option.dataset.fabric;
      handleLiningFabricChange(fabricKey);
    });
  });

  // Initialize lapel options based on default buttoning
  updateLapelOptions(CONFIG.defaults.buttoning);

  // Initialize vent options based on current martingale belt and inverted box pleat settings
  updateVentOptions();

  // Initialize fabric selection UIs
  updateFabricSelectionUI(CONFIG.defaults.fabric);
  updateButtonFabricSelectionUI(CONFIG.defaults.buttonFabric);
  updateLiningFabricSelectionUI(CONFIG.defaults.liningFabric);
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