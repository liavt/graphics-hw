import {OrbitControls} from './OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Add here the rendering of your spaceship

// This is a sample box.
const hullGeometry = new THREE.CylinderGeometry( 1, 1, 3, 30 );
const hullMaterial = new THREE.MeshPhongMaterial( {color: 0xaaaaaa} );
const hull = new THREE.Mesh( hullGeometry, hullMaterial );
const hullTranslate = new THREE.Matrix4();
hullTranslate.makeTranslation(-35,0,0);
hull.applyMatrix4(hullTranslate);

const headGeometry = new THREE.ConeGeometry(1, 1, 30);
const headMaterial = new THREE.MeshPhongMaterial( {color: 0xaa0000} );
const head = new THREE.Mesh( headGeometry, headMaterial );
const headTranslate = new THREE.Matrix4();
headTranslate.makeTranslation(0,2,0);
head.applyMatrix4(headTranslate);
hull.add( head )

const exhaust = new THREE.Mesh( new THREE.ConeGeometry(0.7, 0.7, 20), new THREE.MeshPhongMaterial( {color: 0x333333 } ) );
const exhaustTranslate = new THREE.Matrix4();
exhaustTranslate.makeTranslation(0,-1.5,0);
exhaust.applyMatrix4(exhaustTranslate);
hull.add( exhaust );

const flame = new THREE.Mesh( new THREE.ConeGeometry(0.7, 1.2, 20), new THREE.MeshPhongMaterial( {color: 0xee2222, transparent: true, opacity: 0.7 } ) );
{
  const flameRotate = new THREE.Matrix4();
  flameRotate.makeRotationZ(degrees_to_radians(180));
  flame.applyMatrix4(flameRotate);
}
{
  const flameTranslate = new THREE.Matrix4();
  flameTranslate.makeTranslation(0,-2.45,0);
  flame.applyMatrix4(flameTranslate);
}
hull.add( flame );

const flame2 = new THREE.Mesh( new THREE.ConeGeometry(0.3, 0.4, 20), new THREE.MeshPhongMaterial( {color: 0xfc6b03, transparent: true, opacity: 0.7 } ) );
{
  const flame2Rotate = new THREE.Matrix4();
  flame2Rotate.makeRotationZ(degrees_to_radians(180));
  flame2.applyMatrix4(flame2Rotate);
}
{
  const flame2Translate = new THREE.Matrix4();
  flame2Translate.makeTranslation(0,-2,0);
  flame2.applyMatrix4(flame2Translate);
}
hull.add( flame2 );

// make it 2.99 instead of 3 to prevent z fighting at the bottom
const wingsGeometry = new THREE.ConeGeometry(1.5, 2.99, 3)
const wingsMaterial =  new THREE.MeshPhongMaterial( {color: 0xaa0000} );
const wings = new THREE.Mesh( wingsGeometry, wingsMaterial );
hull.add( wings );

const windowsGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 2, 30 );
const windowsMaterial = new THREE.MeshPhongMaterial( {color: 0x000099} );
const windows = new THREE.Mesh( windowsGeometry, windowsMaterial );
const windowRotation = new THREE.Matrix4();
windowRotation.makeRotationZ(degrees_to_radians(90));
windows.applyMatrix4(windowRotation);
hull.add( windows );

const planetGeometry = new THREE.SphereGeometry(15, 80, 780);
const planetMaterial = new THREE.MeshPhongMaterial({color: 0x33cc33})
//planetMaterial.map = THREE.ImageUtils.loadTexture('https://eoimages.gsfc.nasa.gov/images/imagerecords/4000/4702/aster_volcanoes_artII_lrg.jpg');
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
const planetTranslate = new THREE.Matrix4();
planetTranslate.makeTranslation(30,-15,10);
planet.applyMatrix4(planetTranslate);
scene.add(planet);

planet.add(hull);

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({color: 0xffffff, size:0.1, sizeAttenuation: false})
const starVertices = []
for (let i =0; i < 10000; i++){
  const x = (Math.random() -.5) *2000
  const y = (Math.random() -.5) *2000
  const z = (Math.random() -.5) *2000
  starVertices.push(x,y,z)
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

const eyeGeometry = new THREE.SphereGeometry();
const eyeMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff});
const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
const eyeTranslate = new THREE.Matrix4();
eyeTranslate.makeTranslation();
eye.applyMatrix4(eyeTranslate);
scene.add(eye)

const irisGeometry = new THREE.SphereGeometry();


scene.add( new THREE.AmbientLight( 0xffffff))


// This defines the initial distance of the camera
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0,20,0);
camera.applyMatrix4(cameraTranslate)

renderer.render( scene, camera );

const controls = new OrbitControls( camera, renderer.domElement );

let isOrbitEnabled = true;
let wireframeMode = false;
let animation1 = false;
let animation2 = false;
let animation3 = false;

const toggleOrbit = (e) => {
	if (e.key === "o"){
		isOrbitEnabled = !isOrbitEnabled;
	}
  if (e.key === "w") {
    wireframeMode = !wireframeMode;
  }
  if (e.key === "1") {
    animation1 = !animation1;
  }
  if (e.key === "2") {
    animation2 = !animation2;
  }
  if (e.key === "3") {
    animation3 = !animation3;
  }
}

document.addEventListener('keydown',toggleOrbit)

//controls.update() must be called after any manual changes to the camera's transform
controls.update();

function animate() {

	requestAnimationFrame( animate );

  scene.traverse((obj)=>{
    if (obj["material"]) {
      obj.material.wireframe = wireframeMode
    }
  });

	controls.enabled = isOrbitEnabled;
	controls.update();

  const originalMatrix = planet.matrixWorld.clone();
  planet.applyMatrix4(planet.matrixWorld.invert());
  if (animation1) {
    const animationRotation = new THREE.Matrix4();
    animationRotation.makeRotationZ(-0.001);
    planet.applyMatrix4(animationRotation);
  }
  if (animation2) {
    const animationRotation = new THREE.Matrix4();
    animationRotation.makeRotationY(-0.001);
    planet.applyMatrix4(animationRotation);
  }
  if (animation3) {
    const animationTranslation = new THREE.Matrix4();
    animationTranslation.makeTranslation(-0.01,0,0);
    hull.applyMatrix4(animationTranslation);
  }
  planet.applyMatrix4(originalMatrix);

  flame.material.opacity = (animation1 || animation2 || animation3) ? ((Math.sin(Date.now() / 70) + 1)/2) * 0.4 + 0.3 : 0.0
  flame2.material.opacity = (animation1 || animation2 || animation3) ? ((Math.sin(Date.now() / 200) + 1)/2) * 0.3 + 0.1 : 0.0

	renderer.render( scene, camera );

}
animate()
