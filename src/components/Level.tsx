// The Canvas is the entry point for your game
// It holds all of the data and does most of the processing
// Start with a Canvas and add other components to it

'use client'

import React from 'react'
// import { Canvas as ThreeCanvas, useFrame } from '@react-three/fiber'
import { useSelector } from 'react-redux'
// import reduxStore from './library/reduxStore';
// import { useMovePlayer, usePlayerShoot, useUpdateBullets } from './library/hooks'
// import { useZustandStore } from './library/zustandStore'

const defaultSettings: any = {
  id: 'defaultLevel',
}

function Level(props: any) {
  const settings = { ...defaultSettings, ...props.settings }

  const levelId = settings.id

  const gameSettings = useSelector((state: any) => state.gameSettings)

  // if we're not on this level, don't show anything
  if (gameSettings.currentLevel === levelId) {
    return (
      <div id='webGameEngineLevel' style={{}}>
        {props.children}
      </div>
    )
  }

  return null
}

export default Level
