//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//const controls = new OrbitControls( camera, renderer.domElement );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

// Here we load the cubemap and skymap, you may change it

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
    'src/skybox/right.png',
    'src/skybox/left.png',
    'src/skybox/top.png',
    'src/skybox/bottom.png',
    'src/skybox/front.png',
    'src/skybox/back.png',
]);
scene.background = texture;


// TODO: Texture Loading
// We usually do the texture loading before we start everything else, as it might take processing time
const earthTexture = new THREE.TextureLoader().load( 'src/textures/earth.jpg' );
//const earthBump = new THREE.TextureLoader().load('/src/textures/earthbump.jpeg');
const moonTexture = new THREE.TextureLoader().load('src/textures/moon.jpg')


// TODO: Add Lighting
scene.add( new THREE.AmbientLight( 0xffffff))
scene.add(new THREE.DirectionalLight(0xffffff, 0.7 ))

// TODO: Spaceship
const hullGeometry = new THREE.CylinderGeometry(1, 1, 3, 30);
const hullMaterial = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
const hull = new THREE.Mesh(hullGeometry, hullMaterial);
const hullTranslate = new THREE.Matrix4();
hullTranslate.makeTranslation(10, 10, 10);
hull.applyMatrix4(hullTranslate);

const headGeometry = new THREE.ConeGeometry(1, 1, 30);
const headMaterial = new THREE.MeshPhongMaterial({color: 0xaa0000});
const head = new THREE.Mesh(headGeometry, headMaterial);
const headTranslate = new THREE.Matrix4();
headTranslate.makeTranslation(0, 2, 0);
head.applyMatrix4(headTranslate);
hull.add(head)

const exhaust = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.7, 20), new THREE.MeshPhongMaterial({color: 0x333333}));
const exhaustTranslate = new THREE.Matrix4();
exhaustTranslate.makeTranslation(0, -1.5, 0);
exhaust.applyMatrix4(exhaustTranslate);
hull.add(exhaust);

const flame = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.2, 20), new THREE.MeshPhongMaterial({
    color: 0xee2222,
    transparent: true,
    opacity: 0.7
}));
{
    const flameRotate = new THREE.Matrix4();
    flameRotate.makeRotationZ(degrees_to_radians(180));
    flame.applyMatrix4(flameRotate);
}
{
    const flameTranslate = new THREE.Matrix4();
    flameTranslate.makeTranslation(0, -2.45, 0);
    flame.applyMatrix4(flameTranslate);
}
hull.add(flame);

const flame2 = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.4, 20), new THREE.MeshPhongMaterial({
    color: 0xfc6b03,
    transparent: true,
    opacity: 0.7
}));
{
    const flame2Rotate = new THREE.Matrix4();
    flame2Rotate.makeRotationZ(degrees_to_radians(180));
    flame2.applyMatrix4(flame2Rotate);
}
{
    const flame2Translate = new THREE.Matrix4();
    flame2Translate.makeTranslation(0, -2, 0);
    flame2.applyMatrix4(flame2Translate);
}
hull.add(flame2);

// make it 2.99 instead of 3 to prevent z fighting at the bottom
const wingsGeometry = new THREE.ConeGeometry(1.5, 2.99, 3)
const wingsMaterial = new THREE.MeshPhongMaterial({color: 0xaa0000});
const wings = new THREE.Mesh(wingsGeometry, wingsMaterial);
hull.add(wings);

const windowsGeometry = new THREE.CylinderGeometry(0.4, 0.4, 2, 30);
const windowsMaterial = new THREE.MeshPhongMaterial({color: 0x000099});
const windows = new THREE.Mesh(windowsGeometry, windowsMaterial);
const windowRotation = new THREE.Matrix4();
windowRotation.makeRotationZ(degrees_to_radians(90));
windows.applyMatrix4(windowRotation);
hull.add(windows);
scene.add(hull)

// TODO: Planets
// You should add both earth and the moon here
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({color: 0xffffff, size: 0.1, sizeAttenuation: false})
const starVertices = []
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - .5) * 2000
    const y = (Math.random() - .5) * 2000
    const z = (Math.random() - .5) * 2000
    starVertices.push(x, y, z)
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// ugly testing planet
const earthGeometry = new THREE.SphereGeometry(15, 80, 780);
const earthMaterial = new THREE.MeshPhongMaterial({map: earthTexture})
    //bumpMap: earthBump),
    //bumpScale:   0.005})
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
const earthTranslate = new THREE.Matrix4();
earthTranslate.makeTranslation(100, 5, 100);
earth.applyMatrix4(earthTranslate);
scene.add(earth)

const moonGeometry = new THREE.SphereGeometry(10, 40, 400);
const moonMaterial = new THREE.MeshPhongMaterial({map: moonTexture})
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
const moonTranslate = new THREE.Matrix4();
moonTranslate.makeTranslation(0, 0, 0);
moon.applyMatrix4(moonTranslate);
scene.add(moon)


// TODO: Bezier Curves


// TODO: Camera Settings
// Set the camera following the spaceship here

const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0,20,0);
camera.applyMatrix4(cameraTranslate)

camera.position.x = hull.position.x +100 ;
camera.position.y = hull.position.y + 100;
camera.position.z = hull.position.z + -100;
camera.lookAt(hull.position);

renderer.render( scene, camera );

// TODO: Add collectible stars

const textLoader = new THREE.FontLoader();

// promisify font loading
function loadFont(url) {
    return new Promise((resolve, reject) => {
        textLoader.load(url, resolve, undefined, reject);
    });
}

const x = 0, y = 0;
const heartShape = new THREE.Shape();

heartShape.moveTo(x + 5, y + 5);
heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

const heartGeometry = new THREE.ShapeGeometry(heartShape);
const heartMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
const heart = new THREE.Mesh(heartGeometry, heartMaterial);
//scene.add(heart);

// TODO: Add keyboard event
// We wrote some of the function for you

//const controls = new OrbitControls( camera, renderer.domElement );

const handle_keydown = (e) => {
    if (e.code == 'ArrowLeft') {
        // TODO
    } else if (e.code == 'ArrowRight') {
        // TODO
    }
}
document.addEventListener('keydown', handle_keydown);

//controls.update();

function animate() {

    requestAnimationFrame(animate);

    // TODO: Animation for the spaceship position


    // TODO: Test for star-spaceship collision

    //flame.material.opacity = (animation1 || animation2 || animation3) ? ((Math.sin(Date.now() / 70) + 1)/2) * 0.4 + 0.3 : 0.0
    //flame2.material.opacity = (animation1 || animation2 || animation3) ? ((Math.sin(Date.now() / 200) + 1)/2) * 0.3 + 0.1 : 0.0

    renderer.render(scene, camera);

}

animate()