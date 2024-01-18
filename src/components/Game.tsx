// The Canvas is the entry point for your game
// It holds all of the data and does most of the processing
// Start with a Canvas and add other components to it

'use client'

import React, { useEffect } from 'react'
// import { useSelector } from 'react-redux'

// import { Provider } from 'react-redux'
// import reduxStore from './library/reduxStore'
import { useZustandStore } from './library/zustandStore'
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
  const setGameSettings = useZustandStore((state: any) => state.setGameSettings)
  const updateGameSettings = useZustandStore((state: any) => state.updateGameSettings)

  useEffect(() => {
    if (settings.levelFlowType === 'linear') {
      settings.currentLevel = settings.levelFlow[0]
    }
    setGameSettings(settings)
  }, [])

  useEffect(() => {
    const handleKeyUp = (e: any) => {
      switch (e.code) {
        case 'Escape':
        case 'KeyP':
          updateGameSettings({
            gameState: GameState.Paused,
          })
          break
      }
    }
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const settingsFromStore = useZustandStore((state: any) => state.gameSettings)

  // first try to get gameState from props. If not there, get it from store
  if (props.gameState && props.gameState !== settingsFromStore.gameState) {
    updateGameSettings({
      gameState: props.gameState,
    })
  }
  const gameState = settingsFromStore.gameState

  const goToNormalPlay = () => {
    updateGameSettings({
      gameState: GameState.NormalPlay,
    })
  }

  const startScreen = (
    <div>
      Start Screen
      <button onClick={goToNormalPlay}>Start</button>
    </div>
  )

  const pauseScreen = (
    <div>
      Pause Screen
      <button onClick={goToNormalPlay}>Resume</button>
    </div>
  )

  let returnBody = null //props.children;
  let childrenDisplay = 'unset'

  switch (gameState) {
    case GameState.StartScreen:
      returnBody = startScreen
      childrenDisplay = 'none'
      break

    case GameState.Paused:
      returnBody = pauseScreen
      childrenDisplay = 'none'
      break

    case GameState.EndScreen:
      childrenDisplay = 'none'
      returnBody = <div>End Screen</div>
      break

    case GameState.NormalPlay:
    default:
    // returnBody = props.children;
  }

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
      {returnBody}
      <div style={{ display: childrenDisplay, height: '100%' }}>{props.children}</div>
    </div>
  )
}

const Game = (props: any) => (
  // <Provider store={reduxStore}>
  <GameNoProv {...props} />
  // </Provider>
)

export default Game
