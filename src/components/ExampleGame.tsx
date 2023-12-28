import * as THREE from 'three';

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
//
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useDispatch, useSelector } from 'react-redux';
// import reduxStore from './library/reduxStore';
import {Box, Ship, PlayerShip, Bullet} from './library/objects';
import {useMovePlayer, usePlayerShoot, useUpdateBullets} from './library/hooks';

import { Provider } from 'react-redux';
import store from './library/reduxStore';


function ExampleGameNoProv() {
  const playerShipData = useSelector(state => state.playerShip);
  const playerShipUpdater = useSelector(state => state.playerShipUpdater);

  const movePlayer = useMovePlayer();
  const playerShoot = usePlayerShoot();
  const updateBullets = useUpdateBullets();

  const keys = {
    KeyW: 'forward',
    KeyS: 'backward',
    KeyA: 'left',
    KeyD: 'right',
    ArrowUp: 'forward',
    ArrowDown: 'backward',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    Space: 'shoot',
  }

  const moveFieldByKey = (key) => keys[key]

  const [movement, setMovement] = useState({
      forward: false,
      backward: false,
      left: false,
      right: false,
      shoot: false,
    })

  useEffect(() => {
    const handleKeyDown = (e) => {
      setMovement((m) => ({ ...m, [moveFieldByKey(e.code)]: true }))
      console.log('key is', e.code);
      switch(e.code) {
        case 'ArrowLeft':
        break;
        case 'ArrowRight':
          console.log('right')
        break;
        case 'Space':
          console.log('space')
        break;
      }
    }
    const handleKeyUp = (e) => {
      setMovement((m) => ({ ...m, [moveFieldByKey(e.code)]: false }))
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])



  function Updater() {
    useFrame((state, delta) => {
      if (movement.left) {
        console.log('moving left');
        movePlayer('left', delta);
      }
      else if (movement.right) {
        movePlayer('right', delta);
      }
      if (movement.shoot) {
        playerShoot();
      }

      updateBullets(delta);
    });
  }

  const bullets = useSelector(state => state.bullets);

  function RenderBullets() {
    const bulletsXml = [];

    bullets.forEach((thisBullet, i) => {
      bulletsXml.push(<Bullet
        position={thisBullet.position}
        key={'bullet_'+thisBullet.id} />);
    });


    return bulletsXml;
  }







  return (
    <div id='parent'
          style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas camera={{position: [0, 0, 10]}}>
        <Updater/>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
        <Ship/>
        <RenderBullets/>
        <PlayerShip />
      </Canvas>
    </div>
  );
}


const ExampleGame = () => (
  <Provider store = { store }>
    <ExampleGameNoProv />
  </Provider>
)

export default ExampleGame;
