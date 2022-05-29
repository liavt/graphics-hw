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
const planetMaterial = new THREE.MeshPhongMaterial({color: 0x243652})
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
const planetTranslate = new THREE.Matrix4();
planetTranslate.makeTranslation(30,-15,10);
planet.applyMatrix4(planetTranslate);
scene.add(planet);
// ORBIT
// this works added to scene also *but* it is very far so here please observe him from a close distance
planet.add(hull);

const islandGeometry = new THREE.SphereGeometry(5,5,10);
const islandMaterial = new THREE.MeshPhongMaterial({color: 0xc9aa7f});
const island = new THREE.Mesh(islandGeometry, islandMaterial);
const islandTranslate = new THREE.Matrix4();
islandTranslate.makeTranslation(0,12,-2);
island.applyMatrix4(islandTranslate);
planet.add(island);

//PalmTree
const palmTree = new THREE.Group();
palmTree.position.set(0,5,-1);

// Trunk
const palmTrunkShape = new THREE.CylinderGeometry(.3,1,10,6);
const palmTrunkMaterial = new THREE.MeshPhongMaterial({color: 0x3d2e1a});
const palmTrunk = new THREE.Mesh(palmTrunkShape, palmTrunkMaterial);
palmTree.add(palmTrunk)

// Leaves
const leafGroup1 = new THREE.Group();
leafGroup1.position.set(0,5.1,-1);

const leafShape = new THREE.BoxGeometry(1,.3,4);
const leafMaterial = new THREE.MeshPhongMaterial({color:0x1f400e});
const leaf1 = new THREE.Mesh(leafShape, leafMaterial);
const leaf1Translate = new THREE.Matrix4();
leaf1Translate.makeTranslation(0,-1,-1);
leaf1.applyMatrix4(leaf1Translate);
leaf1.rotation.x = -Math.PI/8;

const leaf2 = new THREE.Mesh(leafShape, leafMaterial);
const leaf2Translate = new THREE.Matrix4();
leaf2Translate.makeTranslation(-1.3,-.3,1.3);
leaf2.applyMatrix4(leaf2Translate);
leaf2.rotation.x = -Math.PI/32;
leaf2.rotation.y = -Math.PI/2;
leaf2.rotation.z = -Math.PI/64;

const leaf3 = new THREE.Mesh(leafShape, leafMaterial);
const leaf3Translate = new THREE.Matrix4();
leaf3Translate.makeTranslation(-.3,-1,3);
leaf3.applyMatrix4(leaf3Translate);
leaf3.rotation.x = Math.PI/8;
leaf3.rotation.y = -Math.PI/8;
leaf3.rotation.z = -Math.PI/32;

const leaf4 = new THREE.Mesh(leafShape, leafMaterial);
const leaf4Translate = new THREE.Matrix4();
leaf4Translate.makeTranslation(2,0,1);
leaf4.applyMatrix4(leaf4Translate);
leaf4.rotation.x = Math.PI/16;
leaf4.rotation.y = -Math.PI/2;
leaf4.rotation.z = Math.PI/16;

leafGroup1.add(leaf1);
leafGroup1.add(leaf2);
leafGroup1.add(leaf3);
leafGroup1.add(leaf4);

const leafGroup2 = new THREE.Group();
leafGroup2.position.set(0,4.6,-1);
const leaf2Material = new THREE.MeshPhongMaterial({color:0x1f400e});
const leaf5 = new THREE.Mesh(leafShape, leafMaterial);
const leaf5Translate = new THREE.Matrix4();
leaf5Translate.makeTranslation(0,-1,-1);
leaf5.applyMatrix4(leaf5Translate);
leaf5.rotation.x = -Math.PI/8;

const leaf6 = new THREE.Mesh(leafShape, leafMaterial);
const leaf6Translate = new THREE.Matrix4();
leaf6Translate.makeTranslation(-1.3,-.3,1.3);
leaf6.applyMatrix4(leaf6Translate);
leaf6.rotation.x = -Math.PI/32;
leaf6.rotation.y = -Math.PI/2;
leaf6.rotation.z = -Math.PI/64;

const leaf7 = new THREE.Mesh(leafShape, leafMaterial);
const leaf7Translate = new THREE.Matrix4();
leaf7Translate.makeTranslation(-.3,-1,3);
leaf7.applyMatrix4(leaf7Translate);
leaf7.rotation.x = Math.PI/8;
leaf7.rotation.y = -Math.PI/8;
leaf7.rotation.z = -Math.PI/32;

const leaf8 = new THREE.Mesh(leafShape, leafMaterial);
const leaf8Translate = new THREE.Matrix4();
leaf8Translate.makeTranslation(2,-1.3,2);
leaf8.applyMatrix4(leaf8Translate);
leaf8.rotation.x = -Math.PI/32;
leaf8.rotation.y = -Math.PI/2;
leaf8.rotation.z = Math.PI/16;

leafGroup2.add(leaf5);
leafGroup2.add(leaf6);
leafGroup2.add(leaf7);
leafGroup2.add(leaf8);

palmTree.add(leafGroup1)
//palmTree.add(leafGroup2)
palmTree.rotation.z = Math.PI/32;
island.add(palmTree)

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

const eyeGeometry = new THREE.SphereGeometry(2, 10, 10);
const eyeMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff});
const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
const eyeTranslate = new THREE.Matrix4();
eyeTranslate.makeTranslation(30,15,20);
eye.applyMatrix4(eyeTranslate);
scene.add(eye)

const irisGeometry = new THREE.SphereGeometry(1.5,7.5, 7.5);
const irisMaterial = new THREE.MeshPhongMaterial( {color: 0x1f5222});
const iris = new THREE.Mesh(irisGeometry, irisMaterial);
const irisTranslate = new THREE.Matrix4();
irisTranslate.makeTranslation(0,-.8,-.8);
iris.applyMatrix4(irisTranslate);
eye.add(iris);

const pupilGeometry = new THREE.SphereGeometry(1,5, 5);
const pupilMaterial = new THREE.MeshPhongMaterial( {color: 0x000000});
const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
const pupilTranslate = new THREE.Matrix4();
pupilTranslate.makeTranslation(0,-1.4,-1.4);
pupil.applyMatrix4(pupilTranslate);
eye.add(pupil);

const angryGeometry = new THREE.CylinderGeometry(1,4,20,6);
const angryMaterial = new THREE.MeshPhongMaterial({color:0xd43939, transparent: true, opacity:.4});
const angry = new THREE.Mesh(angryGeometry, angryMaterial);
const angryTranslate = new THREE.Matrix4();
angryTranslate.makeTranslation(0,-7,-7);
angry.applyMatrix4(angryTranslate);
angry.rotation.x = Math.PI/4;
eye.add(angry);


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
        hull.applyMatrix4(animationRotation);
    }
    if (animation2) {
        const animationRotation = new THREE.Matrix4();
        animationRotation.makeRotationY(-0.001);
        hull.applyMatrix4(animationRotation);
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