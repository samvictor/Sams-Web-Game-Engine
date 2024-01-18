'use client'

// import * as THREE from 'three';

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
//
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );
import React, { useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useSelector } from 'react-redux'
// import reduxStore from './library/reduxStore';
import { Box, Ship, Player, Projectile } from './library/objects'
import { useMovePlayer, usePlayerShoot, useUpdateProjectiles } from './library/hooks'

// import { Provider } from 'react-redux'
// import store from './library/reduxStore'
// import { useZustandStore } from './library/zustandStore'

const defaultSettings: any = {
  background: 'transparent',
  gravity: 'none',
  travelDirection: 'up',
}

function ExampleGameNoProv(props: any) {
  const settings = { ...defaultSettings, ...props.settings }

  const movePlayer = useMovePlayer()
  const playerShoot = usePlayerShoot()
  const updateBullets = useUpdateProjectiles()

  const keys: any = {
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

  const moveFieldByKey = (key: any) => keys[key]

  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    shoot: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      setMovement((m) => ({ ...m, [moveFieldByKey(e.code)]: true }))
      console.log('key is', e.code)
      switch (e.code) {
        case 'ArrowLeft':
          break
        case 'ArrowRight':
          console.log('right')
          break
        case 'Space':
          console.log('space')
          break
      }
    }
    const handleKeyUp = (e: any) => {
      setMovement((m: any) => ({ ...m, [moveFieldByKey(e.code)]: false }))
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  function Updater() {
    useFrame((_, delta: any) => {
      if (movement.left) {
        console.log('moving left')
        movePlayer('left', delta)
      } else if (movement.right) {
        movePlayer('right', delta)
      }
      if (movement.shoot) {
        playerShoot()
      }

      updateBullets(delta)
    })

    return <mesh />
  }

  const bullets = useSelector((state: any) => state.bullets)

  function RenderBullets() {
    const bulletsXml: any[] = []

    bullets.forEach((thisBullet: any) => {
      bulletsXml.push(<Projectile position={thisBullet.position} key={'projectile_' + thisBullet.id} />)
    })

    return bulletsXml
  }

  return (
    <div
      id='parent'
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: settings.background,
      }}
    >
      <Canvas camera={{ position: [0, 0, 10] }}>
        <Updater />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
        <Ship />
        <RenderBullets />
        <Player />
      </Canvas>
    </div>
  )
}

const ExampleGame = (props: any) => (
  // <Provider store={store}>
  <ExampleGameNoProv {...props} />
  // </Provider>
)

export default ExampleGame
