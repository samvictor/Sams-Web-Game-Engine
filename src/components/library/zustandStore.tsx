import { create } from 'zustand'
import { maxProjectilesOnScreen, 
  defaultGameObjectData, 
  defaultGameSettings, 
  defaultLevelData} from './constants'
import { 
  GameObjectData, 
  GameObjectsDictionary,
  ProjectileData, 
  PlayerObjectData, 
  GameObjectType, 
  GameSettings,
  PlayerStats,
  LevelSettings,
  LevelFlowType,
  LevelResults,
  LevelData,
  AllLevelResults,
  AllLevelSettings,
  GameState,
} from './interfaces'

// import { Projectile } from './objects'

interface ZustandState {
  // data
  player: PlayerObjectData
  playerStats: PlayerStats
  playerUpdater: number
  projectiles: ProjectileData[]
  projectilesUpdater: number
  gameObjectsDict: GameObjectsDictionary
  colliderObjects: GameObjectData[]
  gameSettings: GameSettings
  // current level
  currentLevelData: LevelData
  allLevelSettings: AllLevelSettings
  // what happened in each level? did player win? what was the score?
  allLevelResults: AllLevelResults

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
  setGameSettings: (gameSettings: GameSettings) => void
  updateGameSettings: (gameSettings: any) => void
  goToNextLevel: () => void

  // Level settings
  setCurrentLevelData: (levelData: LevelData) => void 
  updateCurrentLevelData: (levelData: any) => void
  updateAllLevelSettings: (levelSettingsWithId: AllLevelSettings) => void
  updateAllLevelResults: (levelResultsWithId: AllLevelResults) => void

  // timer 
  updateTimeLeft: (timeLeftMs?:number) => void
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

const getTimeLeftFromLevelData = (levelData:LevelData) => {
  const timeElapsedMs = (Date.now() - (levelData.startTimeMs || 0))
                                        - (levelData.pauseOffsetMs || 0)
  let timeLeftSec =  (levelData.timeLimitSec||0) -  
                                    Math.floor(timeElapsedMs/1000)

  if (timeLeftSec < 0) {
    timeLeftSec = 0
  }

  return timeLeftSec;
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
  currentLevelData: defaultLevelData,
  allLevelSettings: {},
  allLevelResults: {},
  

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
    set((state: ZustandState) => {
      let tempProjectiles = state.projectiles || []
      tempProjectiles = updateProjectileByIndex(tempProjectiles, projectileIndex, newProjectile)
      // console.log("setting projectiles to", JSON.stringify(tempProjectiles));
      return {
        projectiles: tempProjectiles,
        projectilesUpdater: Date.now(),
      }
    }),
  removeProjectileById: (id: string) =>
    set((state: ZustandState) => {
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
    set((state: ZustandState) => {
      let tempProjectiles = state.projectiles || []
      tempProjectiles = removeProjectileByIndex(tempProjectiles, projectileIndex, projectileId)


      
      return {
        projectiles: tempProjectiles,
        projectilesUpdater: Date.now(),
      }
    }),

  // objects
  addObject: (newObject: GameObjectData) =>
    set((state: ZustandState) => {
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
    set((state: ZustandState) => {
      const tempObjects = state.gameObjectsDict || {}
      delete tempObjects[objectId]

      return {
        gameObjectsDict: tempObjects,
      }
    }),
  updateObjectById: (newObject: GameObjectData) =>
    set((state: ZustandState) => {
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

      console.log('target health', target.health)

      if (target.health && target.health > damageAmount) {
        target.health -= damageAmount
      } else {
        // destroy target
        target.destroyed = true
        const playerStatsClone = { ...state.playerStats }
        const oldPlayerScore = playerStatsClone.score || 0

        let tempColliderObj = state.colliderObjects
        tempColliderObj = removeFromListById(tempColliderObj, target.id)

        // count how many enemies are still alive
        let numLivingEnemies = 0;
        const allObjects:GameObjectData[] = Object.values(state.gameObjectsDict);
        allObjects.forEach((thisObject:GameObjectData) => {
          if (!thisObject.destroyed && thisObject.isEnemy) {
            numLivingEnemies++
          }
        })
        console.log("enemies remaining:", numLivingEnemies, 'objects', allObjects)

        if (target.scoreValue) {
          playerStatsClone.score = oldPlayerScore + target.scoreValue
          console.log('setting new score to', playerStatsClone.score)
        }

        return {
          gameObjectsDict: oldObjects,
          playerStats: playerStatsClone,
          colliderObjects: tempColliderObj,
          currentLevelData: {
            ...state.currentLevelData,
            numLivingEnemies: numLivingEnemies,
          }
        }
      }

      return {}
    }),

  // Game settings
  setGameSettings: (gameSettings: GameSettings) =>
    set(() => {
      if (!gameSettings) {
        throw new Error('gameSettings is empty')
      }

      return {
        gameSettings: gameSettings,
      }
    }),
  updateGameSettings: (gameSettings: any) =>
    set((state: ZustandState) => {
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
  goToNextLevel: () =>
    set((state: ZustandState) => {
      const tempGameSettings = state.gameSettings

      const currentLevel = tempGameSettings.currentLevel;
      const levelFlow = tempGameSettings.levelFlow;
      const levelFlowType = tempGameSettings.levelFlowType;

      if (levelFlowType === LevelFlowType.Linear) {
        if (!currentLevel) {
          throw new Error('no current level found')
        }
        let currentLevelIndex = levelFlow.indexOf(currentLevel);
        if (currentLevelIndex === -1) {
          throw new Error('current level not in level flow')
        }

        currentLevelIndex++;
        if (currentLevelIndex === levelFlow.length) {
          // we're out of levels. end game
          return {
            gameSettings: {
              ...tempGameSettings,
              gameState: GameState.EndScreen
            }
          }
        }

        // move to next level 
        const newLevel = levelFlow[currentLevelIndex];
        return {
          gameSettings: {
            ...tempGameSettings,
            goToLevel: newLevel,
          }
        }
      }

      console.warn('cannot go to next level,',
                        'flow type is not linear (goToNextLevel)')
      return {}
    }),
    
    // Level settings
  setCurrentLevelData: (levelData: LevelData) =>
    set(() => {
      if (!levelData) {
        throw new Error('levelSettings is empty (setLevelSettings)')
      }

      return {
        currentLevelData: levelData,
      }
    }),
  updateCurrentLevelData: (levelData: any) =>
    set((state: ZustandState) => {
      if (!levelData) {
        throw new Error('levelSettings is empty (updateCurrentLevelSettings)')
      }

      const oldLevelData = state.currentLevelData
      const newLevelData = {
        ...oldLevelData,
        ...levelData
      }
      

      const timeLeftSec = getTimeLeftFromLevelData(newLevelData);

      return {
        currentLevelData: {
          ...newLevelData,
          timeLeftSec: timeLeftSec,
        },
      }
    }),
  updateAllLevelSettings: (levelSettingsWithId: AllLevelSettings) => 
    set((state: ZustandState) => {
      if (!levelSettingsWithId) {
        throw new Error('levelSettingsWithId is empty (updateAllLevelSettings)')
      }

      const tempAllLevelSettings:AllLevelSettings = state.allLevelSettings || {};

      return {
        allLevelSettings: {
          ...tempAllLevelSettings,
          ...levelSettingsWithId,
        },
      }
    }),
  updateAllLevelResults: (levelResultsWithId: AllLevelResults) => 
    set((state:ZustandState) => {
      if (!levelResultsWithId) {
        throw new Error('levelResultsWithId is empty (updateAllLevelResults)')
      }

      const tempAllLevelResults:AllLevelResults = state.allLevelResults || {}

      return {
        allLevelResults: {
          ...tempAllLevelResults,
          ...levelResultsWithId,
        }
      }

    }),
  
  
  // timer
  updateTimeLeft: (inTimeLeftSec?:number) => set((state:ZustandState) => {
    // if timeLeftMs is provided, use that. 
    // if not, calculate time left from level settings 
    if (typeof inTimeLeftSec !== 'undefined') {
      return {
        currentLevelData: {
          ...state.currentLevelData,
          timeLeftSec: inTimeLeftSec
        }
      }
    }

    const timeLeftSec = getTimeLeftFromLevelData(
                                          state.currentLevelData);    

    return {
      currentLevelData: {
        ...state.currentLevelData,
        timeLeftSec: timeLeftSec,
      }
    }
  })
}))

export { useZustandStore, ZustandState }
