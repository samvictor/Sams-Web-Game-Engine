// The Canvas is the entry point for your game
// It holds all of the data and does most of the processing
// Start with a Canvas and add other components to it

'use client'

import React, { useEffect, useRef } from 'react'
import { defaultLevelSettings } from './library/constants'
import { LevelSettings, LevelState, WinCriteria } from './library/interfaces'
import { ZustandState, useZustandStore } from './library/zustandStore'

const defaultSettings: LevelSettings = defaultLevelSettings

function Level(props: any) {
  const settings:LevelSettings = {
    ...defaultSettings, 
    ...props.settings,
  }
  settings.timeLeftSec = settings.timeLimitSec

  const levelId = settings.id
  const gameSettings = useZustandStore((state: ZustandState) => state.gameSettings)
  const setCurrentLevelSettings = useZustandStore((state: ZustandState) => 
                                                  state.setCurrentLevelSettings)
  const updateAllLevelSettings = useZustandStore((state:ZustandState) => 
                                                  state.updateAllLevelSettings)
  const updateCurrentLevelSettings = useZustandStore((state:ZustandState) => 
                                                  state.updateCurrentLevelSettings)  
  
  const playerStats = useZustandStore((state:ZustandState) => 
                                                    state.playerStats)
  const updateGameSettings = useZustandStore((state:ZustandState) => 
                                                      state.updateGameSettings)  
  
  const timeUpdaterIntervalId = useRef<any>()
  
  // declare self in database
  useEffect(() => {
    updateAllLevelSettings({
      levelId: settings
    })
  }, [])

  // start self
  const goToLevel = gameSettings.goToLevel;
  useEffect(() => {
    if (goToLevel === levelId) {
      console.log('setting level settings')
      setCurrentLevelSettings(settings)
      updateGameSettings({
        startLevel: null,
        currentLevel: levelId,
      })
    }
  }, [goToLevel])
  
  
  const settingsFromStore = useZustandStore((state: ZustandState) => 
  state.currentLevelSettings)
  
  
  // if levelState changes in props, update store
  if (props.levelState && props.levelState !== settingsFromStore.levelState) {
    updateCurrentLevelSettings({
      gameState: props.gameState,
    })
  }
  
  const numLivingEnemies = settingsFromStore.numLivingEnemies || 0;
  const levelState = settingsFromStore.levelState
  
  useEffect(() => {
    // go to win screen when player wins
    if (numLivingEnemies <= 0 
              && settingsFromStore.winCriteria.includes(WinCriteria.NumEnemies0) 
              && levelState === LevelState.NormalPlay) {
      updateCurrentLevelSettings({
        levelState: LevelState.WinScreen
      })
    }


    
  }, [numLivingEnemies, settingsFromStore, levelState, updateCurrentLevelSettings])
    
  const updateTimeLeft = useZustandStore((state:ZustandState) => 
                                                          state.updateTimeLeft)
  const goToNextLevel = useZustandStore((state:ZustandState) => state.goToNextLevel)

  // if we're not on this level, don't show anything
  if (gameSettings.currentLevel !== levelId) {
    return null
  }


  const startTimeUpdater = () => {
    // 2x per second update time left
    timeUpdaterIntervalId.current = setInterval(() => {
      console.log('updating time')
      
      updateTimeLeft()
    }, 500)
  }
  const clearTimeUpdater = () => {
    clearInterval(timeUpdaterIntervalId.current)
  }
  

  const goToNormalPlay = () => {
    updateCurrentLevelSettings({
      levelState: LevelState.NormalPlay,
    })
  }

  const startLevel = () => {
    updateCurrentLevelSettings({
      startTimeMs: Date.now()
    })
    goToNormalPlay()

    clearTimeUpdater()
    startTimeUpdater()
  }



  const winContinueClicked = () => {
    goToNextLevel()
  }


  const startScreen = (
    <div>
      {settings.title}
      {settings.startScreenBody}
      <button onClick={startLevel}>Start</button>
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
      <button onClick={winContinueClicked}>Continue</button>
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
