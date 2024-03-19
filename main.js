import * as THREE from 'three';
import {Capsule, GLTFLoader} from "three/addons";
import Stats from "three/addons/libs/stats.module";
import * as Octree from "three/addons/math/Octree.js";
import * as OctreeHelper from "three/addons/helpers/OctreeHelper.js";
function initStats() {

    let stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.getElementById("Stats-output").appendChild(stats.domElement);

    return stats;
}


class Character {
    constructor(height, width, depth, mass, speed, color, visibleToPlayer, sleepiness) {
        this.mass = mass;
        this.speed = speed;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.onFloor = false;
        this.sleepiness = sleepiness;
        this.mesh;
        if (visibleToPlayer){
            this.material = new THREE.MeshBasicMaterial({color: color});
            this.collider = new Capsule( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0.3, 0.05, 0.3 ), 0.1 );
        } else
        {
            this.collider = new Capsule( new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0, 1, 0 ), 0.35 );
        }
    }
}

function checkInput(deltaTime) {
    const speedDelta = deltaTime * player.speed * (player.onFloor ? 10 : 4);
    if (keyStates['KeyW']) {
        player.velocity.add(getForwardVector().multiplyScalar(speedDelta));
    }
    if (keyStates['KeyS']) {
        player.velocity.add(getForwardVector().multiplyScalar(-speedDelta));
    }
    if (keyStates['KeyA']) {
        player.velocity.add(getSideVector().multiplyScalar(-speedDelta));
    }
    if (keyStates['KeyD']) {
        player.velocity.add(getSideVector().multiplyScalar(speedDelta));
    }
    if (keyStates['ShiftKey']) {
        player.running = true;
    }
    if (player.onFloor) {
        if (keyStates['Space']) {
            player.velocity.y = 8;
        }
    }
}
function getForwardVector(){
    camera.getWorldDirection(player.direction);
    player.direction.y = 0;
    player.direction.normalize();
    return player.direction;
}

function getSideVector(){
    camera.getWorldDirection(player.direction);
    player.direction.y = 0;
    player.direction.normalize();
    player.direction.cross(camera.up);
    return player.direction;
}

function updatePlayer( deltaTime){
    let damping = Math.exp(-4*deltaTime)-1;
    if (!player.onFloor){
        player.velocity.y -= GRAVITY*player.mass*deltaTime;

        //small air resistance
        damping *= 0.1;
    }

    player.velocity.addScaledVector(player.velocity, damping);
    const deltaPosition = player.velocity.clone().multiplyScalar(deltaTime);
    player.collider.translate(deltaPosition);

    playerCollisions();
    camera.position.copy(player.collider.end);
}

function updateCharacters( deltaTime){
    let damping = Math.exp(-4*deltaTime)-1;
    for (let i = 0; i<puppies.length; i++){
        let character = puppies[i];
        let nextMove = Math.floor(Math.random()*10*character.sleepiness);
        switch (nextMove){
            //Y = opp
            //Z = forward
            case 1:
                character.mesh.rotateY(-0.06);
                break;
            case 2:
                character.velocity.x +=0.2*character.speed;
                break;
            case 3:
                character.velocity.x -=0.2*character.speed;
                break;
            case 4:
                character.velocity.z +=0.2*character.speed;
                break;
            case 5:
                character.velocity.z -=0.2*character.speed;
                break;
            case 6:
                character.velocity.y += 1*character.speed;
                break;
            case 7:
                character.mesh.rotateY(0.02);
                break;
            case 8:
                character.mesh.rotateY(-0.02);
                break;
            case 9:
                character.mesh.rotateY(0.04);
                break;
            case 10:
                character.mesh.rotateY(-0.04);
                break;
            case 0:
                character.mesh.rotateY(0.06);
                break;
            default:
                character.velocity.x = 0;
                character.velocity.y = 0;
                character.velocity.z = 0;
                break;
        }
        if (!character.onFloor){
            character.velocity.y -= GRAVITY*character.mass*deltaTime;
            //small air resistance
            damping *= 0.1;
        }

        character.velocity.addScaledVector(character.velocity, damping);
        const deltaPosition = character.velocity.clone().multiplyScalar(deltaTime);
        character.collider.translate(deltaPosition);

        characterCollisions(character);
        character.mesh.position.copy(character.collider.end);
    }
}

function playerCollisions(){
    const result = worldOctree.capsuleIntersect(player.collider);
    player.onFloor = false;
    if(result){
        player.onFloor = result.normal.y > 0;
        if (!player.onFloor){
            player.velocity.addScaledVector(result.normal, -result.normal.dot(player.velocity));
        }
        player.collider.translate(result.normal.multiplyScalar(result.depth));
    }
}
function characterCollisions(character){
    const result = worldOctree.capsuleIntersect(character.collider);
    character.onFloor = false;
    if(result){
        character.onFloor = result.normal.y > 0;
        if (!character.onFloor){
            character.velocity.addScaledVector(result.normal, -result.normal.dot(player.velocity));
        }
        character.collider.translate(result.normal.multiplyScalar(result.depth));
    }
}



function render(){
    const deltaTime = Math.min( 0.05, clock.getDelta() ) / STEPS_PER_FRAME;
    const position = new THREE.Vector3();
    camera.getWorldDirection(position);

    //Logic for petting animation
    /*
    raycaster.setFromCamera(pointer,camera);
    let intersected = raycaster.intersectObjects(puppyMeshes)
    if (intersected.length != 0){
        pettingAllowed = true;
            document.getElementById("actionDiv").style.display = "block";
            document.getElementById("actionText").innerHTML="PET DOG";
            noneInteractableCount = 0;

    } else {
        noneInteractableCount +=1;
    }

    if (pettingAllowed && noneInteractableCount > puppies.length*3){
        pettingAllowed = false;
        document.getElementById("actionDiv").style.display = "none";
        document.getElementById("actionText").innerHTML="";
        noneInteractableCount = 0;
    }


    */
    for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {

        checkInput( deltaTime );

        updatePlayer( deltaTime );

        updateCharacters( deltaTime );

    }


    renderer.render( scene, camera );

    stats.update();

    requestAnimationFrame( render );

}

//Handle mouseclick event (for e.g. petting)
/*
function mouseClick(){
    const puppy = puppies[puppyId];
    camera.getWorldDirection(player.direction);
    puppy.collider.center.copy(player.collider.end).addScaledVector(player.direction, player.collider.radius*1.5);
    const impulse = 15+30*(1-Math.exp((mouseTime-performance.now())*0.001));
    puppy.velocity.copy(player.direction).multiplyScalar(impulse);
    puppy.velocity.addScaledVector(player.velocity,2);
    puppyId +=1;
}
 */

// Set up key and mouse input
const keyStates = {};
let mouseTime = 0;
document.addEventListener('keydown', (event)=> {
    keyStates[event.code] = true;
});
document.addEventListener('keyup', (event)=> {
    keyStates[event.code] = false;
});
document.addEventListener( 'mousedown', () => {
    document.body.requestPointerLock();
    mouseTime = performance.now();

} );
/*
document.addEventListener( 'mouseup', () => {

    if ( document.pointerLockElement !== null ) mouseClick();

} );
*/
document.addEventListener( 'mousemove', ( event ) => {

    if ( document.pointerLockElement === document.body ) {
        camera.rotation.y -= event.movementX / 500;
        camera.rotation.x -= event.movementY / 500;
        camera.rotation.z = 0;
    }

} );

//Variables required for puppy interaction (e.g. petting)
/*
let pettingAllowed = false;
let noneInteractableCount = 0;
const raycaster = new Raycaster();
let puppyMeshes = [];
const pointer = new THREE.Vector2(0,0);

loader.load('hand.glb', (gltf) =>{
    const handMesh = gltf.scene;
    camera.add(handMesh);
    handMesh.scale.set(0.5,0.5,0.5);
    handMesh.position.set(0, 1, 1);
})*/

//Setup for physics renderer, camera, etc
const STEPS_PER_FRAME = 5;
const GRAVITY = 10;
let clock = new THREE.Clock();
const stats = initStats();
const scene = new THREE.Scene();
//Camera = Perspective camera. This is your viewport
//Arguments: FOV, aspect ratio (based on window size here), near and far clipping planes.
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.rotation.order = 'YXZ';

/*
const boxg = new THREE.BoxGeometry(2,2,2);
const boxm = new THREE.MeshBasicMaterial({color: 0xffffff});
const box = new THREE.Mesh(boxg,boxm);
scene.add(box);
interactableObjects.push(box);
*/

//Setup for player and characters
const player = new Character(3, 1, 1, 3, 3, 0x00ff00, false, 0);
const loader = new GLTFLoader().setPath('./textures/');
const puppies = [];
const NUM_PUPPIES = 12;
for (let i = 0; i< NUM_PUPPIES; i++){
    const newPuppy = new Character(0.2,0.5,0.5,10, 1, 0x00fff0, true);
    loader.load('puppy.glb', (gltf) =>{
        const puppyMesh = gltf.scene;
        puppyMesh.castShadow = true;
        puppyMesh.receiveShadow = true;

        //Adjust puppy model size
        puppyMesh.scale.set(0.25, 0.25, 0.25)
        //puppyMesh.position.set((Math.random()*2)-1, 1, (Math.random()*2)-1)

        newPuppy.mesh = puppyMesh;
        // const wireframeGeometry = new WireframeGeometry(newPuppy.collider.clone());
        // const wireframe = new THREE.LineSegments(  wireframeGeometry, wireframeMat );
        // newPuppy.mesh.add(wireframe);
        //newPuppy.sleepiness = Math.floor(Math.random()*2)+1
        newPuppy.sleepiness = 1; //Chance of puppy doing nothing. Higher whole integer = higher chance of doing nothing
        newPuppy.speed = Math.random()*2 //Movenment speed multiplier
        newPuppy.pettable = true;

        scene.add(newPuppy.mesh);
        puppies.push(newPuppy);
        //puppyMeshes.push(newPuppy.mesh); //Append puppymesh to list of interactable meshes


    })
}

//Setup for world
const worldOctree = new Octree.Octree();
//create renderer with same size as viewport.
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(new THREE.Color(0x000, 1.0));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true;


const spotlight = new THREE.SpotLight(0xffffff, 100);
spotlight.position.set(0,4,0)
scene.add(spotlight);

//Add output of renderer to the body element
document.body.appendChild(renderer.domElement);

//3D model loader for GLTF files
loader.load('apartment-v1.glb', (gltf) => {
    scene.add(gltf.scene);
    worldOctree.fromGraphNode(gltf.scene);
    gltf.scene.traverse(child => {
        if (child.isMesh){
            child.castShadow = true;
            child.receiveShadow = true;
            if(child.material.map){
                child.material.map.anisotropy = 4;
            }
        }
    });
    const helper = new OctreeHelper.OctreeHelper(worldOctree);
    helper.visible = false;
    scene.add(helper);
    render();

})

