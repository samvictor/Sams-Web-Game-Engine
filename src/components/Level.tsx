// Levels help organize your game into levels
// add a Canvas in your level to start designing the level

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { defaultLevelSettings, cssClassBase } from './library/constants';
import { FailCriteria, LevelResults, LevelSettings, LevelState, WinCriteria, LevelData } from './library/interfaces';
import { ZustandState, useZustandStore } from './library/zustandStore';
import { LevelDataContext } from './library/contexts';

const defaultSettings: LevelSettings = defaultLevelSettings;

function Level(props: any) {
  const settings: LevelSettings = {
    ...defaultSettings,
    ...props.settings,
  };
  const levelDataForStore: LevelData = {
    ...settings,
    timeLeftSec: settings.timeLimitSec || Infinity,
    score: 0,
  };

  const levelId = settings.id;
  const gameSettings = useZustandStore((state: ZustandState) => state.gameSettings);
  const setCurrentLevelData = useZustandStore((state: ZustandState) => state.setCurrentLevelData);
  const updateAllLevelSettings = useZustandStore((state: ZustandState) => state.updateAllLevelSettings);
  const updateCurrentLevelData = useZustandStore((state: ZustandState) => state.updateCurrentLevelData);

  const updateAllLevelResults = useZustandStore((state: ZustandState) => state.updateAllLevelResults);
  const updateGameSettings = useZustandStore((state: ZustandState) => state.updateGameSettings);

  const resetLevel = useZustandStore((state: ZustandState) => state.resetLevel);
  const timeUpdaterIntervalId = useRef<any>();

  // declare self in database
  useEffect(() => {
    updateAllLevelSettings(new Map([[levelId, settings]]));
  }, []);

  // start self
  const goToLevel = gameSettings.goToLevel;
  useEffect(() => {
    console.log('gotolevel is', goToLevel);
    if (goToLevel === levelId) {
      console.log('setting level settings');
      setCurrentLevelData(levelDataForStore);
      updateGameSettings({
        startLevel: null,
        currentLevel: levelId,
        goToLevel: null,
      });
    }
  }, [goToLevel]);

  const levelDataFromStore = useZustandStore((state: ZustandState) => state.currentLevelData);

  // if levelState changes in props, update store
  if (props.levelState && props.levelState !== levelDataFromStore.levelState) {
    updateCurrentLevelData({
      gameState: props.gameState,
    });
  }

  const numLivingEnemies = levelDataFromStore.numLivingEnemies || 0;
  const levelState = levelDataFromStore.levelState;

  useEffect(() => {
    // go to win screen when player wins
    if (gameSettings.currentLevel !== levelId) {
      return;
    }

    if (
      numLivingEnemies <= 0 &&
      levelDataFromStore.winCriteria.includes(WinCriteria.NumEnemies0) &&
      levelState === LevelState.NormalPlay
    ) {
      updateCurrentLevelData({
        levelState: LevelState.WinScreen,
      });
      const levelResults: LevelResults = {
        id: levelId,
        score: levelDataFromStore.score,
        won: true,
        timeRemainingSec: levelDataFromStore.timeLeftSec,
        winningCriteria: WinCriteria.NumEnemies0,
      };

      updateAllLevelResults(new Map([[levelId, levelResults]]));
    }

    // go to fail screen when time runs out
    if (
      levelDataFromStore.timeLeftSec <= 0 &&
      levelDataFromStore.failCriteria.includes(FailCriteria.TimeLeft0) &&
      levelState === LevelState.NormalPlay
    ) {
      console.log('going to fail screen');
      updateCurrentLevelData({
        levelState: LevelState.FailScreen,
      });
      const levelResults: LevelResults = {
        id: levelId,
        score: levelDataFromStore.score,
        won: false,
        timeRemainingSec: levelDataFromStore.timeLeftSec,
        failingCriteria: FailCriteria.TimeLeft0,
      };

      updateAllLevelResults(new Map([[levelId, levelResults]]));
    }
  }, [numLivingEnemies, levelDataFromStore, levelState, updateCurrentLevelData]);

  const updateTimeLeft = useZustandStore((state: ZustandState) => state.updateTimeLeft);
  const goToNextLevel = useZustandStore((state: ZustandState) => state.goToNextLevel);
  const [childrenKey] = useState('level_children_' + Date.now());

  // if we're not on this level, don't show anything
  if (gameSettings.currentLevel !== levelId) {
    return null;
  }

  const startTimeUpdater = () => {
    // 2x per second update time left
    timeUpdaterIntervalId.current = setInterval(() => {
      // console.log('updating time')

      updateTimeLeft();
    }, 500);
  };
  const clearTimeUpdater = () => {
    clearInterval(timeUpdaterIntervalId.current);
  };

  const goToNormalPlay = () => {
    console.log('going to normal play');
    updateCurrentLevelData({
      levelState: LevelState.NormalPlay,
    });
  };
  // console.log('play state', levelDataFromStore.levelState);

  const startLevel = () => {
    updateCurrentLevelData({
      startTimeMs: Date.now(),
    });
    goToNormalPlay();

    clearTimeUpdater();
    startTimeUpdater();
  };

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
    goToNextLevel();
  };
  const failRetryClicked = () => {
    resetLevel(levelId);
  };

  const startScreen = (
    <div className={`${cssClassBase}-game-screen ${cssClassBase}-level-start-screen`}>
      <h1>{settings.title}</h1>
      {settings.startScreenBody}
      <br />
      <button onClick={startLevel}>Start</button>
    </div>
  );

  const outOfTimeScreen = <div>Out Of Time</div>;

  const failScreen = (
    <div className={`${cssClassBase}-game-screen ${cssClassBase}-level-fail-screen`}>
      <h1>You Lost </h1>
      Score: {levelDataFromStore.score}
      <br />
      <button onClick={failRetryClicked}>Try Again?</button>
    </div>
  );

  const winScreen = (
    <div className={`${cssClassBase}-game-screen ${cssClassBase}-level-win-screen`}>
      <h1>You Won! </h1>
      Score: {levelDataFromStore.score}
      <br />
      <button onClick={winContinueClicked}>Continue</button>
    </div>
  );

  let returnBody = null;
  let childrenDisplay = 'unset';

  switch (levelState) {
    case LevelState.StartScreen:
      returnBody = startScreen;
      childrenDisplay = 'none';
      break;

    case LevelState.OutOfTime:
      returnBody = outOfTimeScreen;
      childrenDisplay = 'none';
      break;

    case LevelState.FailScreen:
      returnBody = failScreen;
      childrenDisplay = 'none';
      break;

    case LevelState.WinScreen:
      returnBody = winScreen;
      childrenDisplay = 'none';
      break;

    case LevelState.NormalPlay:
    default:
      returnBody = null;
  }

  return (
    <LevelDataContext.Provider value={settings}>
      <div id={`${cssClassBase}-level`} style={{ height: '100%' }}>
        {returnBody}
        <div key={childrenKey} style={{ display: childrenDisplay, height: '100%' }}>
          {props.children}
        </div>
      </div>
    </LevelDataContext.Provider>
  );
}

export { Level as default, LevelDataContext };
