// Name:    utils.js
// Purpose: Creates scene, skybox, audio player, keyboard input handling
// Date:    2025.02.16
// Author:  Michael Root

//////////////////////////////////////////////////////////////////////
/////////                 SCENE SETUP                         ////////
//////////////////////////////////////////////////////////////////////
// Audio player
// Preload audio files
const audioFiles = {
  screech: new Audio('Audio/skid.wav'),
  crash: new Audio('Audio/crash.mp3'),
};

// Function to play a sample based on its name
function playSample(sampleName) {
  const sample = audioFiles[sampleName];
  if (sample.paused) {
    // sample.volume = Math.min(Math.abs(speed) * 15, 1);
    sample.play();
  }
}
function stopSample(sampleName) {
  const sample = audioFiles[sampleName];
  if (!sample.paused) {
    sample.pause(); // Stop if playing, then play it
    sample.currentTime = 0; // Reset to the start
  }
}
// Create light, heavens and earth
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.01,
  80
);
scene.add(camera);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const ambientLight = new THREE.AmbientLight(0xffeeee, 0.67);
scene.add(ambientLight);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(5, 10, 7);
// scene.add(directionalLight);
// Setup directional light to cast shadows
const light = new THREE.DirectionalLight(0xeeeeff, 0.5);
light.position.set(0, 10, 0); // Adjust light position as needed
light.castShadow = true;
light.shadow.bias = -0.05; // Try values between -0.005 and -0.05
light.shadow.mapSize.width = 1024; // Resolution of the shadow map
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.1; // Shadow camera near plane
light.shadow.camera.far = 500; // Shadow camera far plane
light.shadow.camera.left = -50;
light.shadow.camera.right = 50;
light.shadow.camera.top = 50;
light.shadow.camera.bottom = -50;
scene.add(light);
scene.fog = new THREE.Fog(0x555566, 0, 32);
// scene.fog = new THREE.Fog(0x777777, 0, 64);
// const ground = new THREE.Mesh(groundGeometry, groundMaterial);
// ground.receiveShadow = true;
scene.add(ground);

// ground.rotation.x = -Math.PI / 2;
// ground.position.set(32, 0, 32);

// Make the renderer responsive
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

const keyboard = {};
window.addEventListener('keydown', function (e) {
  keyboard[e.key] = true;
});

// Clean up keyboard entries, remove keys when not pressed
window.addEventListener('keyup', function (e) {
  keyboard[e.key] = false;
  delete keyboard[e.key];
});

function makeSkyBox() {
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    // x+, x, y...
    'Images/sunset.png',
    'Images/sunset.png',
    'Images/sky.png',
    'Images/ground.png',
    'Images/sunset.png',
    'Images/sunset.png',
  ]);
  scene.background = texture;
}

let maxSpeedForward = 0.11;
let maxSpeedReverse = -0.01;
let turnLeft = false;

let speedInc = 0.003;
let thetaInc = 0.002; // Steering sensitivity
let cameraWhirl = 0;
let distanceCamera = 1;
drifting = false;
let oldTheta = 0;
function checkKeyboard() {
  // Theta steering control
  if (keyboard['ArrowLeft'] || keyboard['a']) {
    thetaDelta -= thetaInc;
    speed *= 0.99;
    if (drifting) playSample('screech');
  }
  if (keyboard['ArrowRight'] || keyboard['d']) {
    thetaDelta += thetaInc;
    speed *= 0.99;
    if (drifting) playSample('screech');
  }
  if (keyboard['w']) {
    speedPlayer += 0.001;
  }
  if (keyboard['s']) {
    speedPlayer -= 0.001;
  }

  // Speed control
  if (keyboard['ArrowUp'] || keyboard['w']) {
    if (speed > 0.01) speed *= 1 + (maxSpeedForward - speed) * 0.25;
    else speed += 0.001;
    if (drifting) playSample('screech');
  }

  if (keyboard['ArrowDown'] || keyboard['s']) {
    if (speed >= 0.002) speed *= speed > maxSpeedReverse ? 0.97 : 0;
    else speed -= speed > maxSpeedReverse ? 0.001 : 0;
  }

  // console.log('theta:', thetaDelta.toFixed(4), 'speed:', speed.toFixed(4));
  // speed 0 -> 0.1
  // abs(thetadelta) 0 -> 0.025
  if (speed * Math.abs(thetaDelta) > 0.0015) {
    console.log('[!] Burning rubber baby!', Math.random().toFixed(2));
    drifting = true;
    // driftTheta += Math.abs(driftTheta) > 0.01 ? 0.005 : 0.002;
    driftTheta += Math.abs(driftTheta < 0.5)
      ? 0.01 * (oldTheta < theta ? 1 : -1)
      : 0;
  } else drifting = false;
  oldTheta = theta;
}

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (event) => {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
});

document.addEventListener('touchmove', (event) => {
  touchEndX = event.touches[0].clientX;
  touchEndY = event.touches[0].clientY;
  let dx = parseInt(touchEndX) - parseInt(touchStartX);
  if (Math.abs(dx) > 5) {
    console.log(touchStartX, touchEndX);
    if (dx > 0) {
      console.log('turning left...');
      thetaDelta += thetaInc;
      // speed *= 0.99;
    } else {
      console.log('turning right...');
      thetaDelta -= thetaInc;
      // speed *= 0.99;
    }
  }
  // else
  {
    let dy = touchEndY - touchStartY;
    if (Math.abs(dy) > 10) {
      if (dy > 0) {
        speed -= 0.0025;
        playSample('screech');
      } else {
        // speed += 0.0025;
        if (speed > 0.01) speed *= 1 + (maxSpeedForward - speed) * 0.25;
        else speed += 0.001;
        if (drifting) playSample('screech');
      }
    }
  }
});

// document.addEventListener('touchend', () => {
//   let deltaX = touchEndX - touchStartX;
//   let deltaY = touchEndY - touchStartY;

//   // Horizontal swipe (left/right) → Adjust theta
//   if (Math.abs(deltaX) > Math.abs(deltaY)) {
//     if (deltaX > 50) {
//       // Swipe Right → Turn Right
//       thetaDelta += 0.05 * (speed >= 0 ? 1 : -1);
//       speed *= 0.99;
//       playSample('screech');
//     } else if (deltaX < -50) {
//       // Swipe Left → Turn Left
//       thetaDelta -= 0.05 * (speed >= 0 ? 1 : -1);
//       speed *= 0.99;
//       playSample('screech');
//     }
//   }

//   // Vertical swipe (up/down) → Adjust speed
//   else {
//     if (deltaY < -50) {
//       // Swipe Up → Accelerate
//       speed += speed < maxSpeedForward ? 0.001 : 0;
//     } else if (deltaY > 50) {
//       // Swipe Down → Decelerate/Reverse
//       speed -= speed > maxSpeedReverse ? 0.0033 : 0;
//     }
//   }

//   // Reset touch positions
//   touchStartX = 0;
//   touchStartY = 0;
//   touchEndX = 0;
//   touchEndY = 0;
// });
