//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//const controls = new OrbitControls( camera, renderer.domElement );
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const START_POINT = new THREE.Vector3( 1,1,1 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

{
  const text = document.createElement('div');
  text.style.position = "absolute";
  text.style.top = "10px";
  text.style.left = "10px";
  text.style.fontSize = "large";
  text.style.color = "white";
  text.style.width = "100%";
  text.style.fontFamily = "\"Comic Sans MS\", \"Comic Sans\", cursive";
  text.style.background = "-webkit-linear-gradient(45deg, rgba(131,58,180,1) 91%, rgba(253,29,29,1) 96%, rgba(252,176,69,1) 100%)";
  text.style.webkitBackgroundClip = "text";
  text.style.webkitTextFillColor = "transparent";
  text.style.textAlign = "left";
  text.innerText = "Spheres: 1\nIcosahederon: 2\nDonut: 3\nSpace Junk: -1"
  document.body.appendChild(text);
}

const text = document.createElement('div');
text.innerText = "SCORE: 0";
text.style.position = "absolute";
text.style.top = "10px";
text.style.right = "10px";
text.style.fontSize = "xx-large";
text.style.color = "white";
text.style.width = "100%";
text.style.fontFamily = "\"Comic Sans MS\", \"Comic Sans\", cursive";
text.style.fontWeight = "bold";
text.style.background = "-webkit-linear-gradient(45deg, rgba(131,58,180,1) 91%, rgba(253,29,29,1) 96%, rgba(252,176,69,1) 100%)";
text.style.webkitBackgroundClip = "text";
text.style.webkitTextFillColor = "transparent";
text.style.textAlign = "right";
document.body.appendChild(text);



function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

// Here we load the cubemap and skymap, you may change it

const textureLoader = new THREE.TextureLoader();
const skyboxTextures = [
    'src/skybox/right.png',
    'src/skybox/left.png',
    'src/skybox/top.png',
    'src/skybox/bottom.png',
    'src/skybox/front.png',
    'src/skybox/back.png',
];
//console.log(texture.image);
//scene.background = texture;

const skybox = new THREE.Mesh(new THREE.BoxGeometry(1001, 1001, 1001), skyboxTextures.map((img)=>{
  return new THREE.MeshBasicMaterial({
    //color: 0xff0000,
    map: textureLoader.load(img),
    side: THREE.BackSide });
}));


// TODO: Texture Loading
// We usually do the texture loading before we start everything else, as it might take processing time
const earthTexture = textureLoader.load( 'src/textures/earth.jpg' );
const earthBump = textureLoader.load('/src/textures/earthbump.jpeg');
const earthEmission = textureLoader.load('/src/textures/earthlights.jpg');
const moonTexture = textureLoader.load('src/textures/moon.jpg')
const moonHeightTexture = textureLoader.load('src/textures/moon_height.jpg')
const wormTexture = textureLoader.load('src/textures/worm.jpeg')
const sunTexture = textureLoader.load('src/textures/sun.jpeg');
const venusTexture = textureLoader.load('src/textures/venus.jpeg');
const sunRaysTexture = textureLoader.load('src/textures/sunrays.png');
const mercuryTexture = textureLoader.load('src/textures/mercury.jpeg');
const satelliteTexture= textureLoader.load('src/textures/.png');
const marsTexture = textureLoader.load('src/textures/mars.jpeg');

// ugly testing planet
const earthGeometry = new THREE.SphereGeometry(15, 80, 780);
const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,
    bumpMap: earthBump,
    bumpScale:   0.5,
    emissiveMap: earthEmission,
    emissive: 0xCFC6C9
  })
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
const earthTranslate = new THREE.Matrix4();
earthTranslate.makeTranslation(100, 5, 100);
const earthTranslateInverse = earthTranslate.clone().invert();
earth.applyMatrix4(earthTranslate);
scene.add(earth);

const satelliteSprite = new THREE.SpriteMaterial({map: sunRaysTexture, sizeAttenuation: false});
const satellite = new THREE.Sprite(satelliteSprite);
sun.frustumCulled = false;
const sunTranslate = new THREE.Matrix4();
sunTranslate.makeTranslation(100, 5, 300);
const sunTranslateInverse = sunTranslate.clone().invert();
sun.applyMatrix4(sunTranslate);
scene.add(sun);

const moonGeometry = new THREE.SphereGeometry(3, 40, 400);
const moonMaterial = new THREE.MeshStandardMaterial({
  map: moonTexture,
  bumpMap: moonHeightTexture,
  bumpScale: 0.12
});
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
const moonTranslate = new THREE.Matrix4();
moonTranslate.makeTranslation(0, 0, 0);
moon.applyMatrix4(moonTranslate);
const moonTranslateInverse = moonTranslate.clone().invert();

const hullGeometry = new THREE.CylinderGeometry(1, 1, 3, 30);
const hullMaterial = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
const hull = new THREE.Mesh(hullGeometry, hullMaterial);

const headGeometry = new THREE.ConeGeometry(1, 1, 30);
const headMaterial = new THREE.MeshPhongMaterial({color: 0xaa0000});
const head = new THREE.Mesh(headGeometry, headMaterial);
const headTranslate = new THREE.Matrix4();
headTranslate.makeTranslation(0, 2, 0);
head.applyMatrix4(headTranslate);
hull.add(head);

{
  const exhaustLightTrack = new THREE.Object3D();
  const exhaustLightTranslate = new THREE.Matrix4();
  exhaustLightTranslate.makeTranslation(10, 0, 0);
  exhaustLightTrack.applyMatrix4(exhaustLightTranslate);
  hull.add(exhaustLightTrack);

  const exhaustlight = new THREE.SpotLight(0xff0000);
  exhaustlight.distance = 30;
  exhaustlight.castShadow = true;
  hull.add(exhaustlight);
  exhaustlight.target = hull;
}

const exhaust = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.7, 20), new THREE.MeshPhongMaterial({color: 0x333333}));
const exhaustTranslate = new THREE.Matrix4();
exhaustTranslate.makeTranslation(0, -1.5, 0);
exhaust.applyMatrix4(exhaustTranslate);
hull.add(exhaust);

const flame = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.2, 20), new THREE.MeshPhongMaterial({
    color: 0xee2222,
    transparent: true,
    opacity: 0.7,
    emissive: 0xee2222
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
    opacity: 0.7,
    emissive: 0xfc6b03
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


// You should add both earth and the moon here
{
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({color: 0xffffff, size: 0.1, sizeAttenuation: false})
  const starVertices = []
  for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - .5) * 1000
      const y = (Math.random() - .5) * 1000
      const z = (Math.random() - .5) * 1000
      starVertices.push(x, y, z)
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
  const stars = new THREE.Points(starGeometry, starMaterial);
  moon.add(stars);
}

const venusGeometry = new THREE.SphereGeometry(14, 80, 780);
const venusMaterial = new THREE.MeshStandardMaterial({
    map: venusTexture,
})
const venus = new THREE.Mesh(venusGeometry, venusMaterial);
const venusTranslate = new THREE.Matrix4();
venusTranslate.makeTranslation(120, 15, 250);
const venusTranslateInverse = venusTranslate.clone().invert();
venus.applyMatrix4(venusTranslate);

const mercuryGeometry = new THREE.SphereGeometry(5, 80, 780);
const mercuryMaterial = new THREE.MeshStandardMaterial({
    map: mercuryTexture,
})
const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
const mercuryTranslate = new THREE.Matrix4();
mercuryTranslate.makeTranslation(80, -10, 200);
const mercuryTranslateInverse = mercuryTranslate.clone().invert();
mercury.applyMatrix4(mercuryTranslate);

const marsGeometry = new THREE.SphereGeometry(8, 80, 780);
const marsMaterial = new THREE.MeshStandardMaterial({
    map: marsTexture,
})
const mars = new THREE.Mesh(marsGeometry, marsMaterial);
const marsTranslate = new THREE.Matrix4();
marsTranslate.makeTranslation(120, 15, 0);
const marsTranslateInverse = marsTranslate.clone().invert();
mars.applyMatrix4(marsTranslate);

earth.add(mercury);
earth.add(venus);
earth.add(mars);
scene.add(moon);
moon.add(hull);
moon.add(skybox);

const cameraTarget = new THREE.Object3D();
moon.add(cameraTarget);
cameraTarget.add(camera);


{
  const cameraTransform = new THREE.Matrix4();
  cameraTransform.makeRotationX(degrees_to_radians(60));
  camera.applyMatrix4(cameraTransform);
}

{
  const cameraTransform = new THREE.Matrix4();
  cameraTransform.makeRotationY(degrees_to_radians(180));
  camera.applyMatrix4(cameraTransform);
}

{
  const cameraTransform = new THREE.Matrix4();
  cameraTransform.makeTranslation(0, -30, -10);
  camera.applyMatrix4(cameraTransform);
}

const spotLight = new THREE.SpotLight(0xffffff);
spotLight.distance = 30;
spotLight.castShadow = true;
hull.add(spotLight);
spotLight.target = hull;

{
  const cameraTransform = new THREE.Matrix4();
  cameraTransform.makeTranslation(10, 10, 0);
  spotLight.applyMatrix4(cameraTransform);
}

const sunRay = new THREE.SpriteMaterial({map: sunRaysTexture, sizeAttenuation: false});
const sun = new THREE.Sprite(sunRay);
sun.frustumCulled = false;
const sunTranslate = new THREE.Matrix4();
sunTranslate.makeTranslation(100, 5, 300);
const sunTranslateInverse = sunTranslate.clone().invert();
sun.applyMatrix4(sunTranslate);
scene.add(sun);

{
  earth.updateMatrixWorld();
  const sunTarget = new THREE.Object3D();
  const sunTranslate = new THREE.Matrix4();
  sunTranslate.makeTranslation(20, 0, -10);
  sunTarget.applyMatrix4(sunTranslate);

  scene.add(sunTarget);

  //scene.add( new THREE.AmbientLight( 0xffffff))
  const sunLight = new THREE.DirectionalLight(0xffffff, 0.7);
  sunLight.target = earth;
  sunLight.castShadow = true;
  sun.add(sunLight);

  //scene.add(new THREE.AmbientLight(0x333333))
}


// TODO: Bezier Curves

const curves = [
  new THREE.QuadraticBezierCurve3(
    START_POINT,
  	new THREE.Vector3( 0, 5, 40 ),
    new THREE.Vector3( 100 - 8, 5, 100 - 8),
  ),
  new THREE.QuadraticBezierCurve3(
    START_POINT,
  	new THREE.Vector3( 50, 5, 50 ),
    new THREE.Vector3( 100 - 8, 5, 100 - 8 ),
  ),
  new THREE.QuadraticBezierCurve3(
    START_POINT,
  	new THREE.Vector3( 40, -10, 5 ),
    new THREE.Vector3( 100 - 8, 5, 100 - 8 ),
  )
]

for (const curve of curves) {
  const points = curve.getPoints( 50 );
  const geometry = new THREE.BufferGeometry().setFromPoints( points );

  const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );

  // Create the final object to add to the scene
  const curveObject = new THREE.Line( geometry, material );
  //moon.add(curveObject);
}


// TODO: Camera Settings
// Set the camera following the spaceship here

renderer.render( scene, camera );

const NUMBER_OF_STARS = 10;
const NUMBER_OF_BAD_STARS = 5;
const stars = []

const STAR_MODELS = [];
const STAR_MODELS_TWO = [];
const STAR_MODELS_THREE = [];

//glowy sphere
{
  const starGeometry = new THREE.SphereGeometry(1, 40, 400);
  const starMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
  starMaterial.emissive = new THREE.Color(0xffffff);
  STAR_MODELS.push(new THREE.Mesh(starGeometry, starMaterial));
}

{
    const dierdreGeometry = new THREE.IcosahedronBufferGeometry(1.4,0);
    const dierdeMaterial = new THREE.MeshPhysicalMaterial({
        color:0x8fd16b,
        emissive: 0xffffff,
        metalness: .5,
        emissiveIntensity: 0.1,

    })
    STAR_MODELS_TWO.push(new THREE.Mesh(dierdreGeometry,dierdeMaterial));
}

{var torusGeo = new THREE.TorusGeometry(1, .33, 16, 100)

    var meshBasicMaterial = new THREE.MeshBasicMaterial({
        color: 0xcc6e3b,
        wireframe: true,
        wireframeLinewidth: .1
    });
    STAR_MODELS_THREE.push(new THREE.Mesh(torusGeo,meshBasicMaterial));
}

{
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
  const heartMaterial = new THREE.MeshPhongMaterial({color: 0xc9557a});

  const transform = new THREE.Matrix4();
  transform.makeScale(10, 10, 10);
  const heart = new THREE.Mesh(heartGeometry, heartMaterial);
  heart.applyMatrix4(transform);
  //STAR_MODELS.push(heart);
}
{
  //const donut = objLoader.load("obj/donut.obj");
  //STAR_MODELS.push(donut);
}
function addStar(models, score) {
  console.log(models);
  const curve = Math.floor(Math.random() * curves.length);
  const t = Math.random();

  const star = models[Math.floor(Math.random() * models.length)].clone();
  const starTranslate = new THREE.Matrix4();
  {
    const badStarRotate = new THREE.Matrix4();
    badStarRotate.makeRotationFromEuler(new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6));
    star.applyMatrix4(badStarRotate);
  }
  const position = curves[curve].getPoint(t);
  starTranslate.makeTranslation(position.x, position.y, position.z);
  star.applyMatrix4(starTranslate);
  moon.add(star);

  stars.push({
    curve: curve,
    t: t,
    object: star,
    collected: false,
    score: score
  });
}

for (let i = 0; i < NUMBER_OF_STARS; ++i) {
  addStar(STAR_MODELS, 1);
}

for (let i = 0; i < NUMBER_OF_STARS / 2; ++i) {
  addStar(STAR_MODELS_TWO, 1);
}

for (let i = 0; i < NUMBER_OF_STARS / 4; ++i) {
  addStar(STAR_MODELS_THREE, 3);
}


let spaceJunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x9bb0b1,
    polygenOffset: true,
    polygenOffsetFactor: 1,
    polygenOffsetUnits: 1,
    //why no shiny
    specular: 0xffffff,
    shininess: 100,
    emissive: 0x9bb0b1,
    metalness: 1,
    emissiveIntensity: 0.5,
    //map: wormTexture,
});

for (let i = 0; i < NUMBER_OF_BAD_STARS; ++i) {
  const curve = Math.floor(Math.random() * curves.length);
  const t = Math.random();

  let spaceJunkGeometry = new THREE.TorusKnotGeometry(0.6 + (Math.random() * 0.2), 0.1 + (Math.random() * 0.3), 40, 10, Math.ceil(Math.random() * 10), Math.ceil(Math.random() * 10));
  const badStar = new THREE.Mesh(spaceJunkGeometry, spaceJunkMaterial);
  {
    const badStarRotate = new THREE.Matrix4();
    badStarRotate.makeRotationFromEuler(new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6));
    badStar.applyMatrix4(badStarRotate);
  }
  const position = curves[curve].getPoint(t);
  const badStarTranslate = new THREE.Matrix4();
  badStarTranslate.makeTranslation(position.x, position.y, position.z);
  badStar.applyMatrix4(badStarTranslate);
  moon.add(badStar);

  stars.push({
    curve: curve,
    t: t,
    object: badStar,
    collected: false,
    score: -1
  });
}

let increments = 1_000;
let t = 0;
let currentCurve = 0;
let score = 0;

const handle_keydown = (e) => {
    if (e.code == 'ArrowLeft') {
        currentCurve = (currentCurve + 1) % curves.length;
    } else if (e.code == 'ArrowRight') {
        currentCurve = (currentCurve - 1 + curves.length) % curves.length;
    } else if (e.code == 'ArrowDown') {
        increments = Math.min(increments + 100, 8_000);
    } else if (e.code == 'ArrowUp') {
        increments = Math.max(increments - 100, 100);
    }
}
document.addEventListener('keydown', handle_keydown);

//controls.update();

let lastTime = Date.now()

function animate() {
    setTimeout( function() {
        requestAnimationFrame( animate );
    }, 1000 / 60 );

    const delta = Date.now() - lastTime;
    lastTime = Date.now();


    // earth orbit
    {
      earth.applyMatrix4(earthTranslateInverse);
      const earthRotation = new THREE.Matrix4();
      earthRotation.makeRotationY(degrees_to_radians((delta / 16.6) * 0.2));
      earth.applyMatrix4(earthRotation);
      earth.applyMatrix4(earthTranslate);
    }

    {
      moon.applyMatrix4(earthTranslateInverse);
      const newMoonOrbit = new THREE.Matrix4();
      newMoonOrbit.makeRotationY(degrees_to_radians((delta / 16.6) * 0.3));
      moon.applyMatrix4(newMoonOrbit);
      moon.applyMatrix4(earthTranslate);
    }

    if (hull.visible) {
      {
          /*const followCurveMatrix = new THREE.Matrix4();
          const translation = (curves[currentCurve].getPoint(t)).sub(hull.position);
          followCurveMatrix.makeTranslation(translation.x, translation.y, translation.z);
          hull.applyMatrix4(followCurveMatrix);*/
          /*
          const position = new THREE.Vector3();
          camera.position.x = hull.position.x + 10;
          camera.position.y = hull.position.y + 10;
          camera.position.z = hull.position.z - 10;*/
          //camera.lookAt(hull.position);
      }

      {
          const newPosition = curves[currentCurve].getPoint(t);
          const tangent = curves[currentCurve].getTangent(t);

          const up = new THREE.Vector3( 0, 1, 0 );
          const axis = new THREE.Vector3( );
          axis.crossVectors( up, tangent ).normalize();

          const radians = Math.acos( up.dot( tangent ) );

          const quat = new THREE.Quaternion();
          quat.setFromAxisAngle(axis, radians);

          {
            hull.applyMatrix4(hull.matrix.clone().invert());
            const transform = new THREE.Matrix4();
            transform.makeRotationFromQuaternion(quat);
            hull.applyMatrix4(transform);
            transform.makeTranslation(newPosition.x, newPosition.y, newPosition.z);
            hull.applyMatrix4(transform);
          }
      }

      {
          const newPosition = curves[1].getPoint(t);
          const tangent = curves[1].getTangent(t);

          const up = new THREE.Vector3( 0, 1, 0 );
          const axis = new THREE.Vector3( );
          axis.crossVectors( up, tangent ).normalize();

          const radians = Math.acos( up.dot( tangent ) );

          const quat = new THREE.Quaternion();
          quat.setFromAxisAngle(axis, radians);

          {
            cameraTarget.applyMatrix4(cameraTarget.matrix.clone().invert());
            const transform = new THREE.Matrix4();
            transform.makeRotationFromQuaternion(quat);
            cameraTarget.applyMatrix4(transform);
            transform.makeTranslation(newPosition.x, newPosition.y, newPosition.z);
            cameraTarget.applyMatrix4(transform);
          }
      }

      {
          //const followCurveMatrix = new THREE.Matrix4();
          //followCurveMatrix.lookAt(hull.position, curves[currentCurve].getPoint(t + 0.001), THREE.Object3D.DefaultUp);
          //hull.applyMatrix4(followCurveMatrix);
      }

      for (let star of stars) {
        if (!star.collected
          && currentCurve === star.curve
          && Math.abs(t - star.t) <= 2 * (delta / 16.6) * (1.0 / increments)) {
            score += star.score;
            text.innerText = "SCORE: " + score;
            star.collected = true;
            star.object.visible = false;
        }
        /*
        star.object.updateMatrixWorld();
        let pos = new THREE.Matrix4();
        star.object.matrix.copyPosition(pos);
        console.log(star.object);
        {
          let transform = new THREE.Matrix4();
          transform.makeTranslation(-pos.x, -pos.y, -pos.z);
          star.object.applyMatrix4(transform);
          transform = new THREE.Matrix4();
          transform.makeRotationFromEuler(new THREE.Euler((delta / 16.6) * 0.03, (delta / 16.6) * -0.04, (delta / 16.6) * 0.02));
          star.object.applyMatrix4(transform);
          transform = new THREE.Matrix4();
          transform.makeTranslation(pos.x, pos.y, pos.z);
          star.object.applyMatrix4(transform);
        }*/
      }

      flame.material.opacity = ((Math.sin(Date.now() / 70) + 1)/2) * 0.4 + 0.3;
      flame2.material.opacity = ((Math.sin(Date.now() / 200) + 1)/2) * 0.3 + 0.1;

      t += (delta / 16.6) * (1.0 / increments);

      if (t >= 1) {
        hull.visible = false;
        alert("YOURE A HUNGRY BOY YOU ATE " + score + " STARS");
      }
    }

    renderer.render(scene, camera);
}

animate()
