import {
  GameObjectData,
  Collider,
  ColliderShape,
  GameObjectType,
  GameSettings,
  GameState,
  LevelSettings,
  FailCriteria,
  WinCriteria,
  LevelState,
  LevelFlowType,
  LevelData,
  BackgroundAdditionOptions,
} from './interfaces';

const maxProjectilesOnScreen = 100;
const maxObjectsOnScreen = 100;
const screenBoundsMax = [40, 20, 10];
const screenBoundsMin = [-40, -20, -40];
const versionText = 'version 1.0';

const defaultCollider: Collider = {
  shape: ColliderShape.Box,
  boxSize: [1, 1, 1],
  offset: [0, 0, 0],
};

const defaultGameObjectData: GameObjectData = {
  position: [0, 0, 0],
  size: [1, 1, 1],
  id: 'default',
  objectType: GameObjectType.Default,
  rotation: [0, 0, 0],
  speed: 1,
  collider: defaultCollider,
};

const defaultGameSettings: GameSettings = {
  background: 'transparent',
  backgroundAddition: BackgroundAdditionOptions.None,
  overlayTextColor: 'black',
  gravity: 'none',
  travelDirection: 'up',
  levelFlowType: LevelFlowType.Linear,
  levelFlow: ['defaultLevel'],
  currentLevel: null,
  gameState: GameState.StartScreen,
};

const defaultLevelSettings: LevelSettings = {
  id: 'defaultLevel',
  failCriteria: [FailCriteria.NumLives0, FailCriteria.TimeLeft0],
  winCriteria: [WinCriteria.NumEnemies0],
  numberOfLives: 1,
  numLivingEnemies: 1,
  timeLimitSec: 5,
  targetIds: [],
  levelState: LevelState.StartScreen,
  title: '',
  startScreenBody: 'Defeat all enemies to win!',
};

const defaultLevelData: LevelData = {
  ...defaultLevelSettings,
  timeLeftSec: defaultLevelSettings.timeLimitSec || Infinity,
  score: 0,
};

export {
  maxProjectilesOnScreen,
  maxObjectsOnScreen,
  screenBoundsMax,
  screenBoundsMin,
  defaultGameObjectData,
  defaultGameSettings,
  defaultLevelSettings,
  defaultLevelData,
  versionText,
};
