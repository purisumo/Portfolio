import './main.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
// Setup
import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

THREE.Cache.enabled = true;

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

const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

let angle = 0;
const radius = 5;
// Helpers

// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)

// const controls = new OrbitControls(camera, renderer.domElement);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.2, 12, 12);
  const material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 1, 
  roughness: 0, 
});
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);

  const glowColor = new THREE.Color(Math.random(), Math.random(), Math.random());
  const glowMaterial = new THREE.MeshLambertMaterial({ color: glowColor, transparent: true, opacity: 0.1 });
  const glowStar = new THREE.Mesh(geometry, glowMaterial.clone());
  glowStar.position.copy(star.position);
  glowStar.scale.multiplyScalar(1.2);
  scene.add(glowStar);
}


Array(200).fill().forEach(addStar);

const fresnelMat = getFresnelMat();
// Create Unreal Bloom pass
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0, 1, 0.5);

const outputPass = new OutputPass();

const finalComposer = new EffectComposer( renderer );
	finalComposer.addPass( renderScene );
	finalComposer.addPass( outputPass );

//Glass image
const imageTexture = new THREE.TextureLoader().load('./textures/avatar.png');

// Create the glass material with envMap set to the image mesh
const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00bfff, // Set the color of the glass
    opacity: 0.2, // Set the opacity to make it transparent
    transparent: true, // Enable transparency
    roughness: 0.7, // Adjust the roughness
    metalness: 1, // Adjust the metalness
    transmission: 0, // Set the transmission to control refraction
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
// const spaceTexture = new THREE.TextureLoader().load('bg.jpg');
// scene.background = spaceTexture;

//video bg
// const bggeometry = new THREE.PlaneGeometry( -100, 100, 100);
// // invert the geometry on the x-axis so that all of the faces point inward
// bggeometry.scale( - 1, 1, 1 );

// const video = document.getElementById( 'video' );
// video.play();

// const texture = new THREE.VideoTexture( video );
// texture.colorSpace = THREE.SRGBColorSpace;
// scene.background = texture
// const material = new THREE.MeshBasicMaterial( { map: texture } );

// const mesh = new THREE.Mesh( bggeometry, material );
// scene.add( mesh );

// Moon

const moonTexture = new THREE.TextureLoader().load('./textures/moon_texture.5400x2700.jpg');
const normalTexture = new THREE.TextureLoader().load('./textures/Moon.Normal_8192x4096.jpg');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
  })
);

scene.add(moon);

// Rings

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);
const detail = 12;
const loader = new THREE.TextureLoader();
const earthgeometry = new THREE.IcosahedronGeometry(1, detail);
const earthmaterial = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/2k_earth_daymap.jpg"),
  specularMap: loader.load("./textures/02_earthspec1k.jpg"),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 100,
});
const earthMesh = new THREE.Mesh(earthgeometry, earthmaterial);
earthGroup.add(earthMesh);

const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/2k_earth_nightmap.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(earthgeometry, lightsMat);
earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/2k_earth_clouds.jpg"),
  transparent: true,
  opacity: 1,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures//05_earthcloudmaptrans.jpg'),
  // alphaTest: 0.3,
});
const cloudsMesh = new THREE.Mesh(earthgeometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);


const glowMesh = new THREE.Mesh(earthgeometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

const stars = getStarfield({numStars: 2000});
scene.add(stars);


// Create Saturn's rings
// const ringGeometry = new THREE.RingGeometry(1.5, 2.5, 32);
// const ringTexture = new THREE.TextureLoader().load('rings.png');
// const ringMaterial = new THREE.MeshBasicMaterial({
//   map: ringTexture,
//   side: THREE.DoubleSide,
//   transparent: true,
//   opacity: 1,
// });
// const ring = new THREE.Mesh(ringGeometry, ringMaterial);
// ring.rotation.y = Math.PI / 2; // Rotate the ring to be horizontal
// ring.position.set(0, 0, 0); // Set the position of the ring
// scene.add(ring);

//particles
let group;
const particlesData = [];
let positions, colors;
let particles;
let pointCloud;
let particlePositions;
let linesMesh;
const maxParticleCount = 1000;
let particleCount = 150;
const r = 800;
const rHalf = r / 2;
const segments = maxParticleCount * maxParticleCount;

const effectController = {
  showDots: true,
  showLines: true,
  minDistance: 75,
  limitConnections: true,
  maxConnections: 10,
  particleCount: 150
};

group = new THREE.Group();
scene.add( group );

positions = new Float32Array( segments * 3 );
colors = new Float32Array( segments * 3 );

const pMaterial = new THREE.PointsMaterial( {
  color: 0xFFFFFF,
  size: 3,
  blending: THREE.AdditiveBlending,
  transparent: true,
  sizeAttenuation: false
} );

particles = new THREE.BufferGeometry();
particlePositions = new Float32Array( maxParticleCount * 3 );

for ( let i = 0; i < maxParticleCount; i ++ ) {

  const x = Math.random() * r - r / 2;
  const y = Math.random() * r - r / 2;
  const z = Math.random() * r - r / 2;

  particlePositions[ i * 3 ] = x;
  particlePositions[ i * 3 + 1 ] = y;
  particlePositions[ i * 3 + 2 ] = z;

  // add it to the geometry
  particlesData.push( {
    velocity: new THREE.Vector3( - 1 + Math.random() * 2, - 1 + Math.random() * 2, - 1 + Math.random() * 2 ),
    numConnections: 0
  } );

}

particles.setDrawRange( 0, particleCount );
particles.setAttribute( 'position', new THREE.BufferAttribute( particlePositions, 3 ).setUsage( THREE.DynamicDrawUsage ) );

// create the particle system
pointCloud = new THREE.Points( particles, pMaterial );
group.add( pointCloud );

const geometry = new THREE.BufferGeometry();

geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ).setUsage( THREE.DynamicDrawUsage ) );
geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setUsage( THREE.DynamicDrawUsage ) );

geometry.computeBoundingSphere();

geometry.setDrawRange( 0, 0, );

const material = new THREE.LineBasicMaterial( {
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  transparent: true
} );

linesMesh = new THREE.LineSegments( geometry, material );
group.add( linesMesh );

//end particles 


// positions 
moon.position.z = 30;
moon.position.setX(-10);

earthGroup.position.x = -1;
earthGroup.position.z = 2;
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

  angle += 0.01; // Adjust the speed of the rotation

  const x = radius * Math.cos(angle);
  const z = radius * Math.sin(angle);
  
  moon.rotation.x += 0.005;

  // Rotate the glass mesh
  glassMesh.rotation.y += 0.005;
  glassMesh.position.y = Math.sin(Date.now() * 0.001) * 1;

  earthMesh.rotation.y += 0.002;
  lightsMesh.rotation.y += 0.002;
  cloudsMesh.rotation.y += 0.0023;
  glowMesh.rotation.y += 0.002;
  stars.rotation.y -= 0.0002;

  let vertexpos = 0;
  let colorpos = 0;
  let numConnected = 0;

  for ( let i = 0; i < particleCount; i ++ )
    particlesData[ i ].numConnections = 0;

  for ( let i = 0; i < particleCount; i ++ ) {

    // get the particle
    const particleData = particlesData[ i ];

    particlePositions[ i * 3 ] += particleData.velocity.x;
    particlePositions[ i * 3 + 1 ] += particleData.velocity.y;
    particlePositions[ i * 3 + 2 ] += particleData.velocity.z;

    if ( particlePositions[ i * 3 + 1 ] < - rHalf || particlePositions[ i * 3 + 1 ] > rHalf )
      particleData.velocity.y = - particleData.velocity.y;

    if ( particlePositions[ i * 3 ] < - rHalf || particlePositions[ i * 3 ] > rHalf )
      particleData.velocity.x = - particleData.velocity.x;

    if ( particlePositions[ i * 3 + 2 ] < - rHalf || particlePositions[ i * 3 + 2 ] > rHalf )
      particleData.velocity.z = - particleData.velocity.z;

    if ( effectController.limitConnections && particleData.numConnections >= effectController.maxConnections )
      continue;

    // Check collision
    for ( let j = i + 1; j < particleCount; j ++ ) {

      const particleDataB = particlesData[ j ];
      if ( effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections )
        continue;

      const dx = particlePositions[ i * 3 ] - particlePositions[ j * 3 ];
      const dy = particlePositions[ i * 3 + 1 ] - particlePositions[ j * 3 + 1 ];
      const dz = particlePositions[ i * 3 + 2 ] - particlePositions[ j * 3 + 2 ];
      const dist = Math.sqrt( dx * dx + dy * dy + dz * dz );

      if ( dist < effectController.minDistance ) {

        particleData.numConnections ++;
        particleDataB.numConnections ++;

        const alpha = 1.0 - dist / effectController.minDistance;

        positions[ vertexpos ++ ] = particlePositions[ i * 3 ];
        positions[ vertexpos ++ ] = particlePositions[ i * 3 + 1 ];
        positions[ vertexpos ++ ] = particlePositions[ i * 3 + 2 ];

        positions[ vertexpos ++ ] = particlePositions[ j * 3 ];
        positions[ vertexpos ++ ] = particlePositions[ j * 3 + 1 ];
        positions[ vertexpos ++ ] = particlePositions[ j * 3 + 2 ];

        colors[ colorpos ++ ] = alpha;
        colors[ colorpos ++ ] = alpha;
        colors[ colorpos ++ ] = alpha;

        colors[ colorpos ++ ] = alpha;
        colors[ colorpos ++ ] = alpha;
        colors[ colorpos ++ ] = alpha;

        numConnected ++;

      }

    }

  }


  linesMesh.geometry.setDrawRange( 0, numConnected * 2 );
  linesMesh.geometry.attributes.position.needsUpdate = true;
  linesMesh.geometry.attributes.color.needsUpdate = true;

  pointCloud.geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
  finalComposer.render();
}

animate();
