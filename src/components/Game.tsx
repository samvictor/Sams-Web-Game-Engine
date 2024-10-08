// The Game is the entry point for your game
// It holds all of the data and does most of the processing
// Start with a Game and add Levels to it

'use client';

import React, { useEffect } from 'react';
import { ZustandState, useZustandStore } from './library/zustandStore';
import { GameState, GameSettings, LevelFlowType } from './library/interfaces';
import { defaultGameSettings, cssClassBase } from './library/constants';
import { timer } from './library/helpfulFunctions';

const defaultSettings: GameSettings = defaultGameSettings;

function Game(props: any) {
  const settings: GameSettings = { ...defaultSettings, ...props.settings };
  const setGameSettings = useZustandStore((state: any) => state.setGameSettings);
  const settingsFromStore = useZustandStore((state: any) => state.gameSettings);
  const gameState = settingsFromStore.gameState;
  const updateGameSettings = useZustandStore((state: any) => state.updateGameSettings);

  useEffect(() => {
    if (settings.levelFlowType === LevelFlowType.Linear) {
      settings.goToLevel = settings.levelFlow[0];
    }
    setGameSettings(settings);
  }, []);

  useEffect(() => {
    // handle key presses
    const handleKeyUp = (e: any) => {
      switch (e.code) {
        case 'Escape':
        case 'KeyP':
          pausePressed();
          break;
      }
    };
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // first try to get gameState from props. If not there, get it from store
  if (props.gameState && props.gameState !== settingsFromStore.gameState) {
    updateGameSettings({
      gameState: props.gameState,
    });
  }

  const goToNormalPlay = () => {
    updateGameSettings({
      gameState: GameState.NormalPlay,
    });
  };

  const startPause = () => {
    // if already paused, do nothing
    if (gameState === GameState.Paused) {
      return;
    }

    timer.start();
    updateGameSettings({
      gameState: GameState.Paused,
    });
  };

  const currentLevelData = useZustandStore((state: ZustandState) => state.currentLevelData);
  const updateCurrentLevelData = useZustandStore((state: ZustandState) => state.updateCurrentLevelData);
  const endPause = async () => {
    // if not paused, do nothing
    if (gameState !== GameState.Paused) {
      return;
    }

    const pauseTimeMs = timer.stop();
    timer.reset();
    updateCurrentLevelData({
      pauseOffsetMs: (currentLevelData.pauseOffsetMs || 0) + pauseTimeMs,
    });
    goToNormalPlay();
  };

  const pausePressed = () => {
    if (gameState === GameState.Paused) {
      endPause();
    } else {
      startPause();
    }
  };

  const startScreen = (
    <div className={`${cssClassBase}game-screen ${cssClassBase}game-start-screen`}>
      <h1>Start Screen</h1>
      <button onClick={goToNormalPlay}>Start</button>
    </div>
  );

  const pauseScreen = (
    <div className={`${cssClassBase}-game-screen ${cssClassBase}-game-pause-screen`}>
      <h1>Pause Screen</h1>
      <button onClick={endPause}>Resume</button>
    </div>
  );

  // const resetLevel = useZustandStore((state: ZustandState) => state.resetLevel)
  // const restartGame = () => {
  //   updateGameSettings({
  //     goToLevel: settingsFromStore.levelFlow[0],
  //   })
  //   resetLevel(settingsFromStore.levelFlow[0])
  // }

  // calculate score for end screen

  const allLevelResults = useZustandStore((state: ZustandState) => state.allLevelResults);
  const allLevelSettings = useZustandStore((state: ZustandState) => state.allLevelSettings);
  // console.log('all level results', allLevelResults);
  const stats: Map<string, any> = new Map();
  allLevelResults.forEach((thisLevelResult, levelId) => {
    stats.set(levelId, {
      ...thisLevelResult,
      ...(allLevelSettings.get(levelId)), // prettier-ignore
    });
  });

  const scoresXml: any = [];

  stats.forEach((thisStat, levelId) => {
    scoresXml.push(
      <div key={levelId + '_stat'}>
        {thisStat['title']} : {thisStat['score'] || 0}
      </div>,
    );
  });

  const endScreen = (
    <div className={`${cssClassBase}-game-screen ${cssClassBase}-end-screen`}>
      <h1> End Screen </h1>
      score is <br />
      {scoresXml}
    </div>
  );

  let returnBody = null; //props.children;
  let childrenDisplay = 'unset';

  switch (gameState) {
    case GameState.StartScreen:
      returnBody = startScreen;
      childrenDisplay = 'none';
      break;

    case GameState.Paused:
      returnBody = pauseScreen;
      childrenDisplay = 'none';
      break;

    case GameState.EndScreen:
      returnBody = endScreen;
      childrenDisplay = 'none';
      break;

    case GameState.NormalPlay:
    default:
    // returnBody = props.children;
  }

  return (
    <div
      id={`${cssClassBase}-parent`}
      style={{
        position: 'relative',
        width: '100dvw',
        height: '100dvh',
        background: settings.background,
        color: settings.overlayTextColor,
      }}
    >
      {returnBody}
      <div style={{ display: childrenDisplay, height: '100%' }}>{props.children}</div>
    </div>
  );
}

export default Game;
