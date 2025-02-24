// Name:    geomats.js
// Purpose: Geometries, materials, and related functions for game objects
// Date:    2024.11.15
// Author:  Michael Root

// Make cool enemy car. Load and wait big kerfuffle
// Initialize the GLTFLoader
const loader = new THREE.GLTFLoader();
let player = null;

function loadModel() {
  return new Promise((resolve, reject) => {
    loader.load(
      'Images/whip.glb',
      (gltf) => {
        let model = gltf.scene;

        model.scale.set(0.5, 0.5, 0.5);

        // Set each mesh to cast shadows
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
          }
        });

        // Get geometric center of the model
        let box = new THREE.Box3().setFromObject(model);
        let center = new THREE.Vector3();
        // box.getCenter(center);

        // Create a pivot point at the model's center
        let pivot = new THREE.Group();
        scene.add(pivot);
        pivot.add(model);

        // Shift the model relative to its pivot
        model.position.sub(center);

        player = pivot; // Store globally
        resolve(player); // Resolve the Promise
      },
      undefined,
      reject
    );
  });
}
async function init() {
  await loadModel(); // Wait for model to load before using it
  console.log('Model loaded:', player); // Safe to reference player here
  player.position.x = 8;
  player.position.z = 8;
  playerSpeed = 0.02;
  player2.position.x = 8;
  player2.position.z = 8;
}
//// TODO: TEMPORARY REMOVAL OF PLAYER CAR
// init();
// End load player 3d model

// Ground plane geometry & material
let groundWidth = 100;
const groundGeometry = new THREE.PlaneGeometry(groundWidth, groundWidth);
groundGeometry.receiveShadow = true;

// Load texture for ground
const textureLoaderGround = new THREE.TextureLoader();
// const groundTexture = textureLoaderGround.load('Images/concrete.png');
const groundTexture = textureLoaderGround.load('Images/intersection.jpg');
groundTexture.wrapS = THREE.MirroredRepeatWrapping;
groundTexture.wrapT = THREE.MirroredRepeatWrapping;
groundTexture.repeat.set(32, 32);

let groundMaterial = new THREE.MeshStandardMaterial({
  map: groundTexture,
  side: THREE.DoubleSide,
});

const groundGeo = new THREE.PlaneGeometry(500, 500);
const ground = new THREE.Mesh(groundGeo, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.set(32, 0, 32);

ground.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
ground.position.y = -0.1; // Slightly below the sphere

ground.receiveShadow = true; // Enable shadow receiving

// scene.add(ground);

const textureLoader = new THREE.TextureLoader();
// List of texture file paths
const textureFiles = [
  // 'Images/wall_bright.jpg', // 0
  // 'Images/wall_medium.jpg', // 1
  // 'Images/wall_dark.jpg', // 2
  'Images/bronxNorth.png',
  'Images/bronxEast.png',
  'Images/bronxSouth.png',
  'Images/bronxWest.png',
];

// Function to create a building cube with dynamic texture scaling
// Load textures into an array and configure wrapping
const textures = textureFiles.map((file) => {
  const tex = textureLoader.load(file);
  // tex.wrapS = THREE.MirroredRepeatWrapping; // Mirror-tile horizontally
  // tex.wrapT = THREE.MirroredRepeatWrapping; // Mirror-tile vertically
  // tex.repeat.set(6, 12);
  return tex;
});
function createBuildingCubes(Cubes, rows, cols) {
  for (let j = 0; j < rows; ++j) {
    for (let i = 0; i < cols; ++i) {
      // Generate individual building dimensions
      let width = 1;
      let height = 1; //Math.random() * 2 + 1;
      let depth = 1.3; // Keep depth same as width for square base

      const geometry = new THREE.BoxGeometry(width, height, depth);

      // Define materials using the textures and set per-face texture scaling
      let materials = [
        new THREE.MeshBasicMaterial({ map: textures[2] }), // X+ (Bright)
        new THREE.MeshBasicMaterial({ map: textures[0] }), // X- (Dark)
        new THREE.MeshBasicMaterial({ color: 0x000000 }), // Y+ (Black)
        new THREE.MeshBasicMaterial({ color: 0x000000 }), // Y- (Black)
        new THREE.MeshBasicMaterial({ map: textures[3] }), // Z+ (Normal)
        new THREE.MeshBasicMaterial({ map: textures[1] }), // Z- (Normal)
      ];

      // Create mesh and position it correctly
      const cube = new THREE.Mesh(geometry, materials);
      cube.position.set(
        j * 6 + Math.random() * 0.1 + 5.5,
        0.4,
        i * 1.5 + Math.random() * 0.1 - 4 + parseInt(i / 7) * 5
      );
      // cube.rotateZ(Math.PI);
      // Add to scene and tracking array
      scene.add(cube);
      Cubes.push(cube);
    }
  }
}

// // Create building cubes
// let Cubes = [];
// createBuildingCubes(Cubes, 12, 12);
