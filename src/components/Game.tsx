// The Canvas is the entry point for your game
// It holds all of the data and does most of the processing
// Start with a Canvas and add other components to it

'use client'

import React, { useState, useEffect } from 'react'
import { Canvas as ThreeCanvas, useFrame } from '@react-three/fiber'
import { useSelector } from 'react-redux'
// import reduxStore from './library/reduxStore';
import { Bullet } from './library/objects'
import { useMovePlayer, usePlayerShoot, useUpdateBullets } from './library/hooks'

import { Provider } from 'react-redux'
import reduxStore from './library/reduxStore'
import { GameState } from './library/interfaces'

const defaultSettings: any = {
  background: 'transparent',
  overlayTextColor: 'black',
  gravity: 'none',
  travelDirection: 'up',
  levelFlowType: 'linear',
  levelFlow: ['defaultLevel'],
  currentLevel: null,
  gameState: GameState.StartScreen,
}

function GameNoProv(props: any) {
  const settings = { ...defaultSettings, ...props.settings }

  useEffect(() => {    
    if (settings.levelFlowType === 'linear') {
      settings.currentLevel = settings.levelFlow[0];
    }
    reduxStore.dispatch({type: 'setGameSettings', value: settings});
  }, [])
  
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
      {props.children}
    </div>
  )
}

const Game = (props: any) => (
  <Provider store={reduxStore}>
    <GameNoProv {...props} />
  </Provider>
)

export default Game
