//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//const controls = new OrbitControls( camera, renderer.domElement );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const START_POINT = new THREE.Vector3( 6, 6, 6 );

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
const earthBump = new THREE.TextureLoader().load('/src/textures/earthbump.jpeg');
const earthEmission = new THREE.TextureLoader().load('/src/textures/earthlights.jpg');
const moonTexture = new THREE.TextureLoader().load('src/textures/moon.jpg')
const wormTexture = new THREE.TextureLoader().load('src/textures/worm.jpeg')
const sunTexture =new THREE.TextureLoader().load('src/textures/sun.jpeg');
const venusTexture =new THREE.TextureLoader().load('src/textures/2k_venus_surface.jpeg');



// TODO: Add Lighting

// TODO: Spaceship
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
  const headLightTrack = new THREE.Object3D();
  const headLightTranslate = new THREE.Matrix4();
  headLightTranslate.makeTranslation(0, 2, 0);
  headLightTrack.applyMatrix4(headLightTranslate);
  hull.add(headLightTrack);

  const headlight = new THREE.SpotLight(0xff0000);
  headlight.distance = 30;
  headlight.castShadow = true;
  hull.add(headlight);
  headlight.target = headLightTrack;
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
scene.add(hull)

// You should add both earth and the moon here
{
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
}

// ugly testing planet
const earthGeometry = new THREE.SphereGeometry(15, 80, 780);
const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,
    bumpMap: earthBump,
    bumpScale:   0.05,
    emissiveMap: earthEmission,
    emissive: 0xCFC6C9
  })
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
const earthTranslate = new THREE.Matrix4();
earthTranslate.makeTranslation(100, 5, 100);
const earthTranslateInverse = earthTranslate.clone().invert();
earth.applyMatrix4(earthTranslate);
scene.add(earth);

const moonGeometry = new THREE.SphereGeometry(10, 40, 400);
const moonMaterial = new THREE.MeshPhongMaterial({map: moonTexture});
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
const moonTranslate = new THREE.Matrix4();
moonTranslate.makeTranslation(0, 0, 0);
moon.applyMatrix4(moonTranslate);
const moonTranslateInverse = moonTranslate.clone().invert();
scene.add(moon);

const sunGeometry = new THREE.SphereGeometry(20, 80, 780);
const sunMaterial = new THREE.MeshPhongMaterial({emissiveMap: sunTexture, sizeAttenuation: false});
sunMaterial.emissive = new THREE.Color(0xffffff);
//sunMaterial.emissiveIntensity = .5;
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
const sunTranslate = new THREE.Matrix4();
sunTranslate.makeTranslation(100, 5, 1000);
const sunTranslateInverse = sunTranslate.clone().invert();
sun.applyMatrix4(sunTranslate);
scene.add(sun);
{
    //sunlight?
}

{
  earth.updateMatrixWorld();
  const sunTarget = new THREE.Object3D();
  const sunTranslate = new THREE.Matrix4();
  sunTranslate.makeTranslation(20, 0, -10);
  sunTarget.applyMatrix4(sunTranslate);

  scene.add(sunTarget);

  //scene.add( new THREE.AmbientLight( 0xffffff))
  const sun = new THREE.DirectionalLight(0xffffff, 0.7);
  sun.target = sunTarget;
  scene.add(sun);

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
  scene.add(curveObject);
}


// TODO: Camera Settings
// Set the camera following the spaceship here

renderer.render( scene, camera );

const NUMBER_OF_STARS = 10;
const NUMBER_OF_BAD_STARS = 5;
const stars = []

const STAR_MODELS = [];

//glowy sphere
{
  const starGeometry = new THREE.SphereGeometry(1, 40, 400);
  const starMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
  starMaterial.emissive = new THREE.Color(0xffffff);
  STAR_MODELS.push(new THREE.Mesh(starGeometry, starMaterial));
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
  transform.makeScale(0.5, 0.5, 0.5);
  const heart = new THREE.Mesh(heartGeometry, heartMaterial);
  heart.applyMatrix4(transform);
  //STAR_MODELS.push(heart);
}
{
  //const donut = objLoader.load("obj/donut.obj");
  //STAR_MODELS.push(donut);
}

for (let i = 0; i < NUMBER_OF_STARS; ++i) {
  const curve = Math.floor(Math.random() * curves.length);
  const t = Math.random();

  const star = STAR_MODELS[Math.floor(Math.random() * STAR_MODELS.length)].clone();
  const starTranslate = new THREE.Matrix4();
  const position = curves[curve].getPoint(t);
  starTranslate.makeTranslation(position.x, position.y, position.z);
  star.applyMatrix4(starTranslate);
  scene.add(star);

  stars.push({
    curve: curve,
    t: t,
    object: star,
    collected: false,
    score: 1
  });
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
  scene.add(badStar);

  stars.push({
    curve: curve,
    t: t,
    object: badStar,
    collected: false,
    score: -1
  });
}

const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0,20,0);
camera.applyMatrix4(cameraTranslate)

camera.position.x = hull.position.x +100 ;
camera.position.y = hull.position.y + 100;
camera.position.z = hull.position.z + -100;
camera.lookAt(hull.position);

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
    console.log(currentCurve);
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

    // moon orbit
    {
      moon.applyMatrix4(moonTranslateInverse);
      const moonRotation = new THREE.Matrix4();
      moonRotation.makeRotationY(degrees_to_radians((delta / 16.6) * 0.1));
      moon.applyMatrix4(moonRotation);
      moon.applyMatrix4(moonTranslate);
    }

    if (hull.visible) {
      {
          /*const followCurveMatrix = new THREE.Matrix4();
          const translation = (curves[currentCurve].getPoint(t)).sub(hull.position);
          followCurveMatrix.makeTranslation(translation.x, translation.y, translation.z);
          hull.applyMatrix4(followCurveMatrix);*/
          camera.position.x = hull.position.x - 100;
          camera.position.y = hull.position.y + 100;
          camera.position.z = hull.position.z - 100;
          camera.lookAt(hull.position);
      }

      {
          const newPosition = curves[currentCurve].getPoint(t);
          const tangent = curves[currentCurve].getTangent(t);
          hull.position.copy(newPosition);
          const up = new THREE.Vector3( 0, 1, 0 );
          const axis = new THREE.Vector3( );
          axis.crossVectors( up, tangent ).normalize();

          const radians = Math.acos( up.dot( tangent ) );

          hull.quaternion.setFromAxisAngle( axis, radians );
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
            star.collected = true;
            star.object.visible = false;
        }
        let pos = new THREE.Vector3();
        star.object.getWorldPosition(pos);
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
        }
      }

      flame.material.opacity = ((Math.sin(Date.now() / 70) + 1)/2) * 0.4 + 0.3;
      flame2.material.opacity = ((Math.sin(Date.now() / 200) + 1)/2) * 0.3 + 0.1;

      t += (delta / 16.6) * (1.0 / increments);

      /*
      {
        const cameraTranslate = new THREE.Matrix4();
        const translation = hull.position.sub(camera.position);
        cameraTranslate.makeTranslation(translation.x - 20, translation.y - 20, translation.z - 20);
        camera.applyMatrix4(cameraTranslate);
        camera.lookAt(hull.position);
        camera.updateProjectionMatrix();
      }*/

      if (t >= 1) {
        hull.visible = false;
        alert("YOURE A HUNGRY BOY YOU ATE " + score + " STARS");
      }
    }

    renderer.render(scene, camera);
}

animate()
