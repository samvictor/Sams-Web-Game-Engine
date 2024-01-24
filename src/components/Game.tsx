// The Canvas is the entry point for your game
// It holds all of the data and does most of the processing
// Start with a Canvas and add other components to it

'use client'

import React, { useEffect } from 'react'
// import { useSelector } from 'react-redux'

// import { Provider } from 'react-redux'
// import reduxStore from './library/reduxStore'
import { ZustandState, useZustandStore } from './library/zustandStore'
import { GameState, GameSettings } from './library/interfaces'
import { defaultGameSettings } from './library/constants'
import { timer } from './library/helpfulFunctions'

const defaultSettings: GameSettings = defaultGameSettings

function GameNoProv(props: any) {
  const settings:GameSettings = { ...defaultSettings, ...props.settings }
  const setGameSettings = useZustandStore((state: any) => state.setGameSettings)
  const settingsFromStore = useZustandStore((state: any) => state.gameSettings)
  const gameState = settingsFromStore.gameState
  const updateGameSettings = useZustandStore((state: any) => 
                                                        state.updateGameSettings)

 

  useEffect(() => {
    if (settings.levelFlowType === 'linear') {
      settings.currentLevel = settings.levelFlow[0]
    }
    setGameSettings(settings)
  }, [])



  useEffect(() => {
    // handle key presses  
    const handleKeyUp = (e: any) => {
      switch (e.code) {
        case 'Escape':
        case 'KeyP':
          pausePressed()
          break
      }
    }
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState])
  
  
  

  // first try to get gameState from props. If not there, get it from store
  if (props.gameState && props.gameState !== settingsFromStore.gameState) {
    updateGameSettings({
      gameState: props.gameState,
    })
  }
  const updateTimeLeft = useZustandStore((state:ZustandState) => state.updateTimeLeft)
  const goToNormalPlay = () => {
    updateGameSettings({
      gameState: GameState.NormalPlay,
    })
  }

  const startPause = () => {
    // if already paused, do nothing
    if (gameState === GameState.Paused) {
      return
    }

    timer.start()
    updateGameSettings({
      gameState: GameState.Paused,
    })
  }

  const levelSettings = useZustandStore((state:ZustandState) => state.levelSettings)
  const updateLevelSettings = useZustandStore((state:ZustandState) => 
                                                          state.updateLevelSettings)
  const endPause = async() => {
    // if not paused, do nothing
    if (gameState !== GameState.Paused) {
      return
    }

    const pauseTimeMs = timer.stop();
    timer.reset()
    updateLevelSettings({
      pauseOffsetMs: (levelSettings.pauseOffsetMs||0) + pauseTimeMs
    })
    goToNormalPlay()
  }

  const pausePressed = () => {
    if (gameState === GameState.Paused) {
      endPause();
    }
    else {
      startPause();
    }

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
      <button onClick={endPause}>Resume</button>
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
