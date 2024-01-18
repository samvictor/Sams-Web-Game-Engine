import { 
  GameObjectData, 
  Collider, 
  ColliderShape, 
  GameObjectType, 
  GameSettings,
  GameState,
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
  type: GameObjectType.Default,
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
  gameState: GameState.NormalPlay,
}


export { maxProjectilesOnScreen, 
  maxObjectsOnScreen, 
  screenBoundsMax, 
  screenBoundsMin, 
  defaultGameObjectData,
  defaultGameSettings, 
}
