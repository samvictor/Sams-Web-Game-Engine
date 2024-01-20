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
} from './interfaces'

const maxProjectilesOnScreen = 100
const maxObjectsOnScreen = 100
const screenBoundsMax = [40, 20, 10]
const screenBoundsMin = [-40, -20, -40]

const defaultCollider: Collider = {
  shape: ColliderShape.Box,
  boxSize: [1, 1, 1],
  offset: [0, 0, 0],
}

const defaultGameObjectData: GameObjectData = {
  position: [0, 0, 0],
  size: [1, 1, 1],
  id: 'default',
  objectType: GameObjectType.Default,
  rotation: [0, 0, 0],
  speed: 1,
  collider: defaultCollider,
}

const defaultGameSettings: GameSettings = {
  background: 'transparent',
  overlayTextColor: 'black',
  gravity: 'none',
  travelDirection: 'up',
  levelFlowType: 'linear',
  levelFlow: ['defaultLevel'],
  currentLevel: null,
  gameState: GameState.StartScreen,
}

const defaultLevelSettings: LevelSettings = {
  id: 'defaultLevel',
  failCriteria: [FailCriteria.NumLives0, FailCriteria.TimeLeft0],
  winCriteria: [WinCriteria.NumEnemies0],
  numberOfLives: 1,
  numLivingEnemies: 1,
  timeLimitSec: 120,
  pauseOffsetMs: 0,
  targetIds: [],
  levelState: LevelState.StartScreen,
  title: '',
  startScreenBody: 'Defeat all enemies to win!',
}


export { maxProjectilesOnScreen, 
  maxObjectsOnScreen, 
  screenBoundsMax, 
  screenBoundsMin, 
  defaultGameObjectData,
  defaultGameSettings, 
  defaultLevelSettings,
}
