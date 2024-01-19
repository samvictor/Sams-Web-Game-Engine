// The Canvas is the entry point for your game
// It holds all of the data and does most of the processing
// Start with a Canvas and add other components to it

'use client'

import React, { useEffect } from 'react'
import { defaultLevelSettings } from './library/constants'
import { LevelSettings, LevelState, WinCriteria } from './library/interfaces'
import { ZustandState, useZustandStore } from './library/zustandStore'

const defaultSettings: LevelSettings = defaultLevelSettings

function Level(props: any) {
  const settings:LevelSettings = { ...defaultSettings, ...props.settings }
  const levelId = settings.id
  const gameSettings = useZustandStore((state: ZustandState) => state.gameSettings)
  const setLevelSettings = useZustandStore((state: ZustandState) => 
                                                  state.setLevelSettings)
  const updateLevelSettings = useZustandStore((state:ZustandState) => 
                                                  state.updateLevelSettings)  
  
  const playerStats = useZustandStore((state:ZustandState) => 
                                                    state.playerStats)
  useEffect(() => {
    setLevelSettings(settings)
  }, [])

  
  
  const settingsFromStore = useZustandStore((state: ZustandState) => 
  state.levelSettings)
  
  // if we're not on this level, don't show anything
  if (gameSettings.currentLevel !== levelId) {
    return null
  }

  // first try to get gameState from props. If not there, get it from store
  if (props.levelState && props.levelState !== settingsFromStore.levelState) {
    updateLevelSettings({
      gameState: props.gameState,
    })
  }

  const numLivingEnemies = settingsFromStore.numLivingEnemies || 0;
  const levelState = settingsFromStore.levelState

  if (numLivingEnemies <= 0 
        && settingsFromStore.winCriteria.includes(WinCriteria.NumEnemies0) 
        && levelState === LevelState.NormalPlay) {
    updateLevelSettings({
      levelState: LevelState.WinScreen
    })
  }

  
  

  const goToNormalPlay = () => {
    updateLevelSettings({
      levelState: LevelState.NormalPlay,
    })
  }


  const startScreen = (
    <div>
      {settings.title}
      {settings.startScreenBody}
      <button onClick={goToNormalPlay}>Start</button>
    </div>
  )

  const outOfTimeScreen = (
    <div>
      Out Of Time
    </div>
  )

  const loseScreen = (
    <div>
      You Lost
      Score: {playerStats.score}
    </div>
  )

  const winScreen = (
    <div>
      You Won!
      Score: {playerStats.score}
    </div>
  )

  

  let returnBody = null 
  let childrenDisplay = 'unset'

  switch (levelState) {
    case LevelState.StartScreen:
      returnBody = startScreen
      childrenDisplay = 'none'
      break
    
    case LevelState.OutOfTime: 
      returnBody = outOfTimeScreen 
      childrenDisplay = 'none'
      break
    
    case LevelState.LoseScreen:
      returnBody = loseScreen 
      childrenDisplay = 'none'
      break
    
    case LevelState.WinScreen:
      returnBody = winScreen
      childrenDisplay = 'none'
      break

    case LevelState.NormalPlay:
    default:
      returnBody = null;
  }

  return (
    <div id='webGameEngineLevel' style={{height: '100%'}}>
      {returnBody}
      <div style={{ display: childrenDisplay, height: '100%' }}>
        {props.children}
      </div>
    </div>
  )


}

export default Level
