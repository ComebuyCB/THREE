import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import ThreeMeshUI from 'https://cdn.skypack.dev/three-mesh-ui';

let scene, camera, renderer, controls;

window.addEventListener( 'load', () => {

	const WIDTH = 50;
  const HEIGHT = 50;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, WIDTH / HEIGHT, 0.1, 1000 );
  camera.position.z = 1;


  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setClearColor( 0x000000, 0 );
  renderer.setSize( 50, 50 );
  document.body.appendChild( renderer.domElement );

  controls = new OrbitControls( camera, renderer.domElement );

  //

  makeTextPanel();
  
	animate();

})

//

function makeTextPanel() {

	const container = new ThreeMeshUI.Block({
		width: 1.2,
		height: 0.5,
		padding: 0.05,
		justifyContent: 'center',
		alignContent: 'left',
		fontFamily: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json',
		fontTexture: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png'
	});

	container.position.set( 0, 0, 0 );
	container.rotation.x = -0.3;
	scene.add( container );

	//

	container.add(

		new ThreeMeshUI.Text({
			content: "456456546",
			fontSize: 0.055
		}),

		new ThreeMeshUI.Text({
			content: "789789878797.",
			fontSize: 0.08
		})

	);

};




//

const animate = function () {
  requestAnimationFrame( animate );
  
  ThreeMeshUI.update();
  
  controls.update();

  renderer.render( scene, camera );
};