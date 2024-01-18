import { create } from 'zustand'
import { maxProjectilesOnScreen, 
  defaultGameObjectData, 
  defaultGameSettings } from './constants'
import { 
  GameObjectData, 
  GameObjectsDictionary,
  ProjectileData, 
  PlayerObjectData, 
  GameObjectType, 
  GameSettings,
  PlayerStats,
} from './interfaces'

// import { Projectile } from './objects'

interface ZustandState {
  // data
  player: PlayerObjectData
  playerStats: PlayerStats
  playerUpdater: number
  projectiles: GameObjectData[]
  projectilesUpdater: number
  gameObjectsDict: GameObjectsDictionary
  colliderObjects: GameObjectData[]
  gameSettings: GameSettings

  // functions
  // players
  setPlayer: (newPlayer: PlayerObjectData) => void
  setPlayerPosition: (newPlayerPosition: number[]) => void
  setPlayerLastShootTimeMs: (newShootTime: number) => void

  // projectiles
  addProjectile: (newProjectile: ProjectileData) => void
  updateProjectileByIndex: (projectileIndex: number, 
                              newProjectile: ProjectileData) => void
  removeProjectileById: (id: string) => void
  removeProjectileByIndex: (projectileIndex: number, projectileId: string) => void 

  // objects
  addObject: (newObject: GameObjectData) => void

  // damage
  damageObjectById: (targetId: string, damage?: number, sourceId?: string) =>  void

  // Game settings
  setGameSettings: (gameSettings: any) => void
  updateGameSettings: (gameSettings: any) => void
}

const updateProjectileByIndex = (oldProjectiles: ProjectileData[], 
                                    index: number, 
                                    newProjectile: ProjectileData) => {
  if (!oldProjectiles) {
    // old projectiles not found
    throw new Error('old projectiles not found')
  }

  oldProjectiles[index] = newProjectile

  return oldProjectiles
}
const removeProjectileByIndex = (oldProjectiles: ProjectileData[], 
                                    index: number, 
                                    id?: string) => {
  if (!oldProjectiles) {
    // old projectiles not found
    throw new Error('old projectiles not found')
  }

  const thisProjectile = oldProjectiles[index]
  if (thisProjectile && (!id || thisProjectile.id === id)) {
    // make sure projectile exist and matches id if available
    oldProjectiles.splice(index, 1)
  } else {
    throw new Error('projectile not deleted')
  }

  return oldProjectiles
}

const removeFromListById = (list:any[],  id:string) => {
  if (!list) {
    throw new Error('list not found')
  }

  if (!id) {
    throw new Error('id not found')
  }

  const indexToRemove = list.findIndex((item: any) => item.id === id)
  if (indexToRemove === -1) {
    console.warn('id not found in list (removeFromListById)');
    console.warn('list', list, 'id', id)
    return list
  }

  list.splice(indexToRemove, 1)

  return list;
}

const useZustandStore = create<ZustandState>()((set) => ({
  // default state
  player: {
    ...defaultGameObjectData,
    id: 'player',
    type: GameObjectType.Player,
    position: [0, -5, 0],
    lastShootTimeMs: 0,
    shootDelayMs: 100,
  },
  playerStats: {
    score: 0,
  },
  // change updater number whenever we change dict 
  // this lets zustand know that there has been a change
  // and we should rerender
  playerUpdater: 0,
  projectiles: [],
  projectilesUpdater: 0,
  gameObjectsDict: {},
  // live game objects with colliders
  colliderObjects: [],
  gameSettings: defaultGameSettings,
  

  // functions
  // players
  setPlayer: (newPlayer: PlayerObjectData) =>
    set(() => ({
      player: newPlayer,
      playerUpdater: Date.now(),
    })),
  setPlayerPosition: (newPlayerPosition: number[]) =>
    set((state: any) => ({
      player: {
        ...state.player,
        position: newPlayerPosition,
      },
      playerUpdater: Date.now(),
    })),
  setPlayerLastShootTimeMs: (newShootTime: number) =>
    set((state: any) => ({
      player: {
        ...state.player,
        lastShootTimeMs: newShootTime,
      },
      playerUpdater: Date.now(),
    })),

  // projectiles
  addProjectile: (newProjectile: ProjectileData) =>
    set((state: any) => {
      if (!newProjectile) {
        throw new Error('new projectile not found')
      }

      let tempProjectiles = state.projectiles || []
      if (tempProjectiles.length >= maxProjectilesOnScreen) {
        tempProjectiles = removeProjectileByIndex(tempProjectiles, 0)
      }
      tempProjectiles.push(newProjectile)

      return {
        projectiles: tempProjectiles,
        projectilesUpdater: Date.now(),
      }
    }),
  updateProjectileByIndex: (projectileIndex: number, newProjectile: ProjectileData) =>
    set((state: any) => {
      let tempProjectiles = state.projectiles || []
      tempProjectiles = updateProjectileByIndex(tempProjectiles, projectileIndex, newProjectile)
      // console.log("setting projectiles to", JSON.stringify(tempProjectiles));
      return {
        projectiles: tempProjectiles,
        projectilesUpdater: Date.now(),
      }
    }),
  removeProjectileById: (id: string) =>
    set((state: any) => {
      let tempProjectiles = state.projectiles || []

      const projectileIndex = tempProjectiles.findIndex((projectile: any) => projectile.id === id)
      if (projectileIndex > -1) {
        tempProjectiles = removeProjectileByIndex(tempProjectiles, projectileIndex, id)
      } else {
        throw new Error('projectile not deleted (removeProjectileById)')
      }

      return {
        projectiles: tempProjectiles,
        projectilesUpdater: Date.now(),
      }
    }),
  removeProjectileByIndex: (projectileIndex: number, projectileId: string) =>
    set((state: any) => {
      let tempProjectiles = state.projectiles || []
      tempProjectiles = removeProjectileByIndex(tempProjectiles, projectileIndex, projectileId)
      return {
        projectiles: tempProjectiles,
        projectilesUpdater: Date.now(),
      }
    }),

  // objects
  addObject: (newObject: GameObjectData) =>
    set((state: any) => {
      if (!newObject) {
        throw new Error('new object not found (addObject)')
      }
      if (!newObject.id) {
        throw new Error('new object missing id (addObject)')
      }

      const tempColliderObj = state.colliderObjects || [];
      if (newObject.collider) {
        tempColliderObj.push(newObject);
      }

      return {
        gameObjectsDict: {
          ...state.gameObjectsDict,
          [newObject.id]: newObject,
        },
        colliderObjects: tempColliderObj,
      }
    }),
  removeObjectById: (objectId: string) =>
    set((state: any) => {
      const tempObjects = state.gameObjectsDict || {}
      delete tempObjects[objectId]

      return {
        gameObjectsDict: tempObjects,
      }
    }),
  updateObjectById: (newObject: GameObjectData) =>
    set((state: any) => {
      if (!newObject) {
        throw new Error('new object not found (addObject)')
      }
      if (!newObject.id) {
        throw new Error('new object missing id (addObject)')
      }

      return {
        gameObjectsDict: {
          ...state.gameObjectsDict,
          [newObject.id]: newObject,
        },
      }
    }),

  // damage
  damageObjectById: (targetId: string, damage?: number, sourceId?: string) =>
    set((state: ZustandState) => {
      if (!sourceId) {
        console.warn('source id not found in damageObjectById')
      }
      let damageAmount = 1
      if (typeof damage === 'number') {
        damageAmount = damage
      } else {
        console.warn('damage amount not found, using default (1) in damageObjectById')
      }

      if (!targetId) {
        throw new Error('invalid targetId in damageObjectById')
      }

      const oldObjects = { ...state.gameObjectsDict }
      if (!oldObjects) {
        // old objects not found
        throw new Error('old objects not found')
      }

      const target = oldObjects[targetId]

      if (!target) {
        // target not found in list
        throw new Error('target not found in object dict. (damageObjectById)')
      }

      if (target.destroyed) {
        console.warn('target already destroyed (damageObjectById)')
        return {}
      }

      if (target.health && target.health > damageAmount) {
        target.health -= damageAmount
      } else {
        // destroy target
        target.destroyed = true
        const playerStatsClone = { ...state.playerStats }
        const oldPlayerScore = playerStatsClone.score || 0

        let tempColliderObj = state.colliderObjects
        tempColliderObj = removeFromListById(tempColliderObj, target.id)

        if (target.scoreValue) {
          playerStatsClone.score = oldPlayerScore + target.scoreValue
          console.log('setting new score to', playerStatsClone.score)
        }
        return {
          gameObjectsDict: oldObjects,
          playerStats: playerStatsClone,
          colliderObjects: tempColliderObj,
        }
      }

      return {}
    }),

  // Game settings
  setGameSettings: (gameSettings: any) =>
    set(() => {
      if (!gameSettings) {
        throw new Error('gameSettings is empty')
      }

      return {
        gameSettings: gameSettings,
      }
    }),
  updateGameSettings: (gameSettings: any) =>
    set((state: any) => {
      if (!gameSettings) {
        throw new Error('gameSettings is empty')
      }

      const oldGameSettings = state.gameSettings

      return {
        gameSettings: {
          ...oldGameSettings,
          ...gameSettings,
        },
      }
    }),
}))

export { useZustandStore, ZustandState }
