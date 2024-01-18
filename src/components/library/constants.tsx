import { GameObjectData, Collider, ColliderShape, GameObjectType } from './interfaces'

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

export { maxProjectilesOnScreen, maxObjectsOnScreen, screenBoundsMax, screenBoundsMin, defaultGameObjectData }
