// The Canvas is the entry point for your game
// It holds all of the data and does most of the processing
// Start with a Canvas and add other components to it

'use client'

import React, { useState, useEffect } from 'react'
import { Canvas as ThreeCanvas, useFrame } from '@react-three/fiber'
import { useSelector } from 'react-redux'
// import reduxStore from './library/reduxStore';
import { Box, Ship, PlayerShip, Bullet } from './library/objects'
import { useMovePlayer, usePlayerShoot, useUpdateBullets } from './library/hooks'

import { Provider } from 'react-redux'
import store from './library/reduxStore'

const defaultSettings: any = {
  background: 'transparent',
  overlayTextColor: 'black',
  gravity: 'none',
  travelDirection: 'up',
}

function CanvasNoProv(props: any) {
  const settings = { ...defaultSettings, ...props.settings }

  const movePlayer = useMovePlayer()
  const playerShoot = usePlayerShoot()
  const updateBullets = useUpdateBullets()

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
      bulletsXml.push(<Bullet position={thisBullet.position}
                          key={'bullet_' + thisBullet.id} />)
    })

    return bulletsXml;
  }

  // make overlay
  const playerStats:any = useSelector((state:any) => state.playerStats);
  const overlayXml:any = <div id='webGameEngineOverlay'
                            style={{
                              color: settings.overlayTextColor,
                              position: 'fixed',
                              top: 0,
                              padding: '20px',
                            }}>
    Score: {playerStats.score}
  </div>;

  return (
    <div
      id='webGameEngineParent'
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: settings.background,
      }}
    >
      <ThreeCanvas camera={{ position: [0, 0, 10] }}>
        <Updater />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <RenderBullets />
        {props.children}

      </ThreeCanvas>

      {overlayXml}
    </div>
  )
}

const Canvas = (props: any) => (
  <Provider store={store}>
    <CanvasNoProv {...props} />
  </Provider>
)

export default Canvas
