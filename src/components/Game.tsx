// The Canvas is the entry point for your game
// It holds all of the data and does most of the processing
// Start with a Canvas and add other components to it

'use client'

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

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


  useEffect(() => {
    const handleKeyUp = (e: any) => {
      switch (e.code) {
        case 'Escape':
        case 'KeyP':
          reduxStore.dispatch({type: 'updateGameSettings', value: {
            gameState: GameState.Paused
          }});
        break;
      }
    }
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const settingsFromStore = useSelector((state:any) => state.gameSettings);

  // first try to get gameState from props. If not there, get it from store
  if (props.gameState && props.gameState !== settingsFromStore.gameState) {
    reduxStore.dispatch({type: 'updateGameSettings', value: {
      gameState: props.gameState
    }})
  }
  const gameState = settingsFromStore.gameState;

  const goToNormalPlay = () => {
    reduxStore.dispatch({type: 'updateGameSettings', value: {
      gameState: GameState.NormalPlay
    }})
  }

  const startScreen = <div>
    Start Screen 
    <button onClick={goToNormalPlay}>Start</button>
  </div>

  const pauseScreen = <div>
    Pause Screen 
    <button onClick={goToNormalPlay}>Resume</button>
  </div>

  let returnBody = props.children;

  switch (gameState) {
    case GameState.StartScreen:
      returnBody = startScreen
    break;
    
    case GameState.Paused:
      returnBody = pauseScreen
    break;

    case GameState.EndScreen:
      returnBody = <div>End Screen</div>
    break

    case GameState.NormalPlay:
    default:
      returnBody = props.children;
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
    </div>
  )
}

const Game = (props: any) => (
  <Provider store={reduxStore}>
    <GameNoProv {...props} />
  </Provider>
)

export default Game
