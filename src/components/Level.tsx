// The Canvas is the entry point for your game
// It holds all of the data and does most of the processing
// Start with a Canvas and add other components to it

'use client'

import React, { useEffect, useRef, useState, createContext } from 'react'
import { defaultLevelSettings } from './library/constants'
import { 
  FailCriteria, 
  LevelResults, 
  LevelSettings, 
  LevelState, 
  WinCriteria,
  LevelData, 
} from './library/interfaces'
import { ZustandState, useZustandStore } from './library/zustandStore'
import { create } from 'zustand'
import { LevelDataContext } from './library/contexts'

const defaultSettings: LevelSettings = defaultLevelSettings

function Level(props: any) {
  const settings:LevelSettings = {
    ...defaultSettings, 
    ...props.settings,
  }
  const levelDataForStore:LevelData = {
    ...settings,
    timeLeftSec: settings.timeLimitSec || Infinity,
  }

  const levelId = settings.id
  const gameSettings = useZustandStore((state: ZustandState) => state.gameSettings)
  const setCurrentLevelData = useZustandStore((state: ZustandState) => 
                                                  state.setCurrentLevelData)
  const updateAllLevelSettings = useZustandStore((state:ZustandState) => 
                                                  state.updateAllLevelSettings)
  const updateCurrentLevelData = useZustandStore((state:ZustandState) => 
                                                state.updateCurrentLevelData)  
  
  const updateAllLevelResults = useZustandStore((state:ZustandState) => 
                                                state.updateAllLevelResults)
  const playerStats = useZustandStore((state:ZustandState) => 
                                                    state.playerStats)
  const updateGameSettings = useZustandStore((state:ZustandState) => 
                                                      state.updateGameSettings)  
  
  const resetLevel = useZustandStore((state:ZustandState) => state.resetLevel)
  const timeUpdaterIntervalId = useRef<any>()
  
  // declare self in database
  useEffect(() => {
    updateAllLevelSettings({
      [levelId]: settings
    })
  }, [])

  // start self
  const goToLevel = gameSettings.goToLevel;
  useEffect(() => {
    console.log('gotolevel is', goToLevel)
    if (goToLevel === levelId) {
      console.log('setting level settings')
      setCurrentLevelData(levelDataForStore)
      updateGameSettings({
        startLevel: null,
        currentLevel: levelId,
        goToLevel: null,
      })
    }
  }, [goToLevel])
  
  
  const levelDataFromStore = useZustandStore((state: ZustandState) => 
  state.currentLevelData)
  
  
  // if levelState changes in props, update store
  if (props.levelState && props.levelState !== levelDataFromStore.levelState) {
    updateCurrentLevelData({
      gameState: props.gameState,
    })
  }
  
  const numLivingEnemies = levelDataFromStore.numLivingEnemies || 0;
  const levelState = levelDataFromStore.levelState
  
  useEffect(() => {
    // go to win screen when player wins
    if (numLivingEnemies <= 0 
              && levelDataFromStore.winCriteria.includes(WinCriteria.NumEnemies0) 
              && levelState === LevelState.NormalPlay) {
      updateCurrentLevelData({
        levelState: LevelState.WinScreen
      })
      const levelResults:LevelResults = {
        id: levelId,
        score: playerStats.score,
        won: true,
        timeRemainingSec: levelDataFromStore.timeLeftSec,
        winningCriteria: WinCriteria.NumEnemies0,
      }

      updateAllLevelResults({
        [levelId]: levelResults
      })
    }

    // go to fail screen when time runs out
    if (levelDataFromStore.timeLeftSec <= 0
            && levelDataFromStore.failCriteria.includes(FailCriteria.TimeLeft0)
            && levelState === LevelState.NormalPlay)  {
              console.log('going to fail screen')
      updateCurrentLevelData({
        levelState: LevelState.FailScreen
      })
      const levelResults:LevelResults = {
        id: levelId,
        score: playerStats.score,
        won: false,
        timeRemainingSec: levelDataFromStore.timeLeftSec,
        failingCriteria: FailCriteria.TimeLeft0,
      }

      updateAllLevelResults({
        [levelId]: levelResults
      })
    }

    
    
  }, [numLivingEnemies, levelDataFromStore, levelState, updateCurrentLevelData])
  
  const updateTimeLeft = useZustandStore((state:ZustandState) => 
                                                            state.updateTimeLeft)
  const goToNextLevel = useZustandStore((state:ZustandState) => state.goToNextLevel)
  const [childrenKey, setChildrenKey] = useState('level_children_' + Date.now())
  
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
    console.log('going to normal play');
    updateCurrentLevelData({
      levelState: LevelState.NormalPlay,
    })
  }
  console.log('play state', levelDataFromStore.levelState);

  const startLevel = () => {
    updateCurrentLevelData({
      startTimeMs: Date.now()
    })
    goToNormalPlay()

    clearTimeUpdater()
    startTimeUpdater()
  }

  // let childrenKey = levelId + '_children';
  // const resetLevel = () => {
  //   console.log('trying to reset level')
  //   updateGameSettings({
  //     goToLevel: levelId,
  //   })

  //   // change key of children div to reset children
  //   setChildrenKey('level_children_' + Date.now())
  //   // return null
  // }



  const winContinueClicked = () => {
    goToNextLevel()
  }
  const failRetryClicked = () => {
    resetLevel(levelId)
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

  const failScreen = (
    <div>
      You Lost
      Score: {playerStats.score}
      <button onClick={failRetryClicked}>Try Again?</button>
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
    
    case LevelState.FailScreen:
      returnBody = failScreen 
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
    <LevelDataContext.Provider value={settings}>
      <div id='webGameEngineLevel' style={{height: '100%'}}>
        {returnBody}
        <div key={childrenKey} style={{ display: childrenDisplay, height: '100%' }}>
          {props.children}
        </div>
      </div>
    </LevelDataContext.Provider>
  )


}

export {Level as default, LevelDataContext}
