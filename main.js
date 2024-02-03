import './main.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );
camera.position.setZ(30);
camera.position.setX(-3);

window.addEventListener('resize', () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  bloomPass.setSize(newWidth, newHeight);
  composer.setSize(newWidth, newHeight);
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
});

const renderScene = new RenderPass( scene, camera );
// Torus

// const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
// const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
// const torus = new THREE.Mesh(geometry, material);

// scene.add(torus);

// Lights

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Helpers

// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)

// const controls = new OrbitControls(camera, renderer.domElement);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.2, 24, 24);
  const starColor = new THREE.Color(Math.random(), Math.random(), Math.random());
  const material = new THREE.MeshStandardMaterial({ color: starColor, transparent: true, opacity: 0.1 });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);

  const glowColor = new THREE.Color(Math.random(), Math.random(), Math.random());
  const glowMaterial = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.1 });
  const glowStar = new THREE.Mesh(geometry, glowMaterial.clone());
  glowStar.position.copy(star.position);
  glowStar.scale.multiplyScalar(1.2);
  scene.add(glowStar);
}


Array(300).fill().forEach(addStar);

// Create Unreal Bloom pass
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0, 1, 0.5);

const outputPass = new OutputPass();

const finalComposer = new EffectComposer( renderer );
	finalComposer.addPass( renderScene );
	finalComposer.addPass( outputPass );

//Glass image
const imageTexture = new THREE.TextureLoader().load('avatar.png');

// Create the glass material with envMap set to the image mesh
const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x66ccff, // Set the color of the glass
    opacity: 0.4, // Set the opacity to make it transparent
    transparent: true, // Enable transparency
    roughness: 0.1, // Adjust the roughness
    metalness: 0.9, // Adjust the metalness
    transmission: 0.1, // Set the transmission to control refraction
    envMapIntensity: 5, // Adjust the environment map intensity
    reflectivity: 1, // Set reflectivity (0 to 1)
    clearcoat: 1, // Set clearcoat (0 to 1
});

// Create a material for the image with its own opacity
const imageMaterial = new THREE.MeshBasicMaterial({
    map: imageTexture, // Set the image texture directly
    opacity: 1, // Set the opacity for the image
    transparent: false, // Enable transparency
});

// Create a geometry (e.g., a cube) for the glass
const glassGeometry = new THREE.BoxGeometry(0.2, 4, 2);

// Create a mesh for the glass with the glass material
const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);

// Add the glass mesh to the scene
scene.add(glassMesh);

// Create a geometry (e.g., a cube) for the image
const imageGeometry = new THREE.BoxGeometry( 0.01, 3.8, 1.8); // Adjust size as needed

// Create a mesh for the image with the image material
const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);

// Position the image mesh inside the glass
imageMesh.position.set(0, 0, 0);

// Add the image mesh to the glass mesh
glassMesh.add(imageMesh);


//background
// const spaceTexture = new THREE.TextureLoader().load('pxfuel.jpg');
// scene.background = spaceTexture;

const bgfog = new THREE.Scene(); bgfog.fog = new THREE.Fog( 0xcccccc, 10, 15 );
// Avatar

// const jeffTexture = new THREE.TextureLoader().load('jeff.png');

// const jeff = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshBasicMaterial({ map: jeffTexture }));

// scene.add(jeff);

// Moon

const moonTexture = new THREE.TextureLoader().load('moon_texture.5400x2700.jpg');
const normalTexture = new THREE.TextureLoader().load('Moon.Normal_8192x4096.jpeg');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
  })
);

scene.add(moon);

// Rings 
const saturnGeometry = new THREE.SphereGeometry(1, 32, 32);
const saturnTexture = new THREE.TextureLoader().load('Earth.jpg');
const saturnMaterial = new THREE.MeshStandardMaterial({ map: saturnTexture });
const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
scene.add(saturn);

// Create Saturn's rings
const ringGeometry = new THREE.RingGeometry(1.5, 2.5, 32);
const ringTexture = new THREE.TextureLoader().load('rings.png');
const ringMaterial = new THREE.MeshBasicMaterial({
  map: ringTexture,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.8,
});
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = Math.PI / 2; // Rotate the ring to be horizontal
ring.position.set(0, 0, 0); // Set the position of the ring
scene.add(ring);

// positions 
moon.position.z = 30;
moon.position.setX(-10);

// jeff.position.z = -5;
// jeff.position.x = 2;

glassMesh.position.z = -5;
glassMesh.position.x = 4;
// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  // moon.rotation.x += 0.05;
  // moon.rotation.y += 0.075;
  // moon.rotation.z += 0.05;

  glassMesh.rotation.y += 0.01;
  // glassMesh.rotation.z += 0.01;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  moon.rotation.x += 0.005;

  // Rotate the glass mesh
  glassMesh.rotation.y += 0.005;
  glassMesh.position.y = Math.sin(Date.now() * 0.001) * 1;

  // Rotate Saturn and the rings
  saturn.rotation.y += 0.005;
  ring.rotation.y += 0.005;

  renderer.render(scene, camera);
  finalComposer.render();
}

animate();