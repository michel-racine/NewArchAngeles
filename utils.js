// Name:    New Arch Angeles: Concrete Jungle
// Purpose: Just drivin' around the city
// Author:  Michael Root
// Date:    2025.02.18

////////////////////////////////////////////////////////////////////////////////////////////
/////////                          VARIABLES ET AL                                  ////////
////////////////////////////////////////////////////////////////////////////////////////////
let counter = 0;
let xPos = 0; // Imaginary world positions
let yPos = 1; //
let zPos = 0; //
let speed = 0.005; // Also considered radius
let theta = Math.PI;
let thetaDelta = 0.0;
let elevation = 0.05;
let elevationView = 0.1;
let driftTheta = 0;

let Cubes = []; // Buildings
createBuildingCubes(Cubes, 16, 16);

////// INITIALIZE CAMERA POSITINO //////
// First positive intersection
// camera.position.set(8, elevation, 8.5);
camera.position.set(16, elevation, 8);

let viewVerticalOffset = 0.1;
function updateCamera() {
  camera.lookAt(
    camera.position.x +
      2 * speed * (speed < 0 ? -1 : 1) * Math.cos(theta - thetaDelta),
    elevation,
    camera.position.z +
      2 * speed * (speed < 0 ? -1 : 1) * Math.sin(theta - thetaDelta)
  );
  driftTheta *= 0.95;

  camera.position.x += speed * Math.cos(theta - thetaDelta);
  camera.position.y = elevation;
  camera.position.z += speed * Math.sin(theta - thetaDelta);

  theta += thetaDelta * (speed < 0 ? -1 : 1);

  thetaDelta *= 0.94;

  while (theta < 0) theta += Math.PI * 2;
  theta %= Math.PI * 2;
} // End updateCamera()

let thetaPlayer = 0;
let thetaPlayerTarget = 0;
let thetaPlayerInc = 0.025;
let speedPlayer = 0.03;
let chooseNewPath = true;
let drift = 0.001;

function updatePlayer() {
  if (!player) return;
  player.position.x += speedPlayer * Math.cos(thetaPlayer);
  player.position.y = -0.035;
  player.position.z += speedPlayer * Math.sin(thetaPlayer);
  player.rotation.y = -thetaPlayer + Math.PI / 2;

  // // Artificial jiggle so that vehicle model isn't as stark looking
  // thetaPlayer += (Math.random() * 2 - 1) * 0.1 * speedPlayer;
  while (thetaPlayer < 0) thetaPlayer += Math.PI * 2;
  thetaPlayer %= Math.PI * 2;
  var d = thetaPlayer % (Math.PI / 2);
  // thetaPlayer += drift * (d < Math.PI / 2 ? -1 : 1);

  if (
    Math.abs(player.position.x % 8) < speedPlayer ||
    Math.abs(player.position.z % 8) < speedPlayer
  ) {
    if (chooseNewPath == true) {
      console.log('choosing path!');
      chooseNewPath = false;
      thetaPlayerTarget += (Math.PI / 2) * (Math.floor(Math.random * 3) - 1);
      while (thetaPlayerTarget > Math.PI * 2) thetaPlayerTarget -= Math.PI * 2;
    } else {
      chooseNewPath = true;
    }
  }

  // thetaPlayer = thetaPlayerTarget;
  thetaPlayer +=
    thetaPlayerTarget < thetaPlayer ? -thetaPlayerInc : thetaPlayerInc;
}

function calculateDistance(x0, y0, z0, x1, y1, z1) {
  var d = Math.sqrt(
    Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2) + Math.pow(z1 - z0, 2)
  );
  return d;
}

let c = 0.15; // Collision buffer
function checkBuildingCollisions() {
  let x = camera.position.x;
  let z = camera.position.z;
  for (var i = 0; i < Cubes.length; i++) {
    let sx = Cubes[i].scale.x / 2 + c;
    let sz = Cubes[i].scale.z / 2 + c;
    let px = Cubes[i].position.x;
    let pz = Cubes[i].position.z;

    if (x > px - sx && x < px + sx && z > pz - sz && z < pz + sz) {
      // Reduce speed dramatically if is in state of collision
      // TODO: more advanced behaviours should go here...
      speed *= 0.25;
      playSample('crash');
      camera.position.x = 4;
      camera.position.z = -9;
      return;
    }
  }
} // End checkBuildingCollisions()

////////////////////////////////////////////////////////////////////////////////////////////
/////////                          ANIMATION SECTION                                ////////
////////////////////////////////////////////////////////////////////////////////////////////
makeSkyBox();

// Geometry and material for enemy objects
// const geo1 = new THREE.SphereGeometry(0.1, 16, 16);
// const mat1 = new THREE.MeshStandardMaterial({
//   color: 0xff0000, // light silver color
//   metalness: 0.9, // fully metallic for a chrome-like effect
//   roughness: 0, // smooth surface for high reflectivity
// });
// const originEnemy = new THREE.Mesh(geo1, mat1);
// originEnemy.castShadow = true;
// scene.add(originEnemy);

function animate() {
  // if (player) originEnemy.position.copy(player.position);
  requestAnimationFrame(animate);
  // updatePlayer();
  updateCamera();
  checkKeyboard();
  checkBuildingCollisions();
  sample.volume = speed / maxSpeedForward;

  // **Render the main scene**
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}

animate();
