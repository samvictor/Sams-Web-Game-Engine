import { create } from 'zustand'
import { maxProjectilesOnScreen, defaultGameObjectData } from './constants'
import { GameObjectData, ProjectileData, PlayerObjectData, GameObjectType, GameState } from './interfaces'
// import { Projectile } from './objects'

const updateProjectileByIndex = (oldProjectiles: ProjectileData[], index: number, newProjectile: ProjectileData) => {
  if (!oldProjectiles) {
    // old projectiles not found
    throw new Error('old projectiles not found')
  }

  oldProjectiles[index] = newProjectile

  return oldProjectiles
}
const removeProjectileByIndex = (oldProjectiles: ProjectileData[], index: number, id?: string) => {
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

const addObject = (newObject: GameObjectData, state: any) => {
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
}

const useZustandStore = create((set) => ({
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
  playerUpdater: 0,
  projectiles: [],
  gameObjectsDict: {},
  // live game objects with colliders
  colliderObjects: [],
  gameSettings: {
    gameState: GameState.StartScreen,
  },

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
  setPlayerLastShootTimeMs: (newShootTime: number[]) =>
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
      }
    }),
  updateProjectileByIndex: (projectileIndex: number, newProjectile: ProjectileData) =>
    set((state: any) => {
      let tempProjectiles = state.projectiles || []
      tempProjectiles = updateProjectileByIndex(tempProjectiles, projectileIndex, newProjectile)
      return {
        projectiles: tempProjectiles,
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
      }
    }),
  removeProjectileByIndex: (projectileIndex: number, projectileId: string) =>
    set((state: any) => {
      let tempProjectiles = state.projectiles || []
      tempProjectiles = removeProjectileByIndex(tempProjectiles, projectileIndex, projectileId)
      return {
        projectiles: tempProjectiles,
      }
    }),

  // objects
  addObject: (newObject: GameObjectData) =>
    set((state: any) => {
      return addObject(newObject, state)
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
      return addObject(newObject, state)
    }),

  // damage
  damageObjectById: (targetId: string, damage?: number, sourceId?: string) =>
    set((state: any) => {
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

        if (target.scoreValue) {
          playerStatsClone.score = oldPlayerScore + target.scoreValue
          console.log('setting new score to', playerStatsClone.score)
        }
        return {
          gameObjectsDict: oldObjects,
          playerStats: playerStatsClone,
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

export { useZustandStore }
