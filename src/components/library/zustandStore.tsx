import { create } from 'zustand'
import { 
  maxProjectilesOnScreen, 
  maxObjectsOnScreen, 
  defaultGameObjectData 
} from './constants'
import {
  GameObjectData, 
  GameObjectsDictionary,
  ProjectileData, 
  PlayerObjectData,
  GameObjectType,
  GameState,
} from './interfaces';


const removeProjectileByIndex = (oldProjectiles:ProjectileData[], index: number, id?: string) => {
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

  return oldProjectiles;
}

const addObject = (newObject:GameObjectData, state:any) => {
  if (!newObject) {
    throw new Error('new object not found (addObject)');
  }
  if (!newObject.id) {
    throw new Error('new object missing id (addObject)');
  }

  return {
    gameObjectsDict: {
      ...state.gameObjectsDict,
      [newObject.id]: newObject,
    }
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
  setPlayer: (newPlayer:PlayerObjectData) => set(() => ({
    player: newPlayer,
    playerUpdater: Date.now(),
  })),
  setPlayerPosition: (newPlayerPosition:number[]) => set((state:any) => ({
    player: {
      ...state.player,
      position: newPlayerPosition,
    },
    playerUpdater: Date.now(),
  })),
  setPlayerLastShootTimeMs: (newShootTime:number[]) => set((state:any) => ({
    player: {
      ...state.player,
      lastShootTimeMs: newShootTime,
    },
    playerUpdater: Date.now(),
  })),

  // projectiles
  addProjectile: (newProjectile:ProjectileData) => set((state:any) => {
    if (!newProjectile) {
      throw new Error('new projectile not found');
    }

    let tempProjectiles = state.projectiles || [];
    if (tempProjectiles.length >= maxProjectilesOnScreen) {
      tempProjectiles = removeProjectileByIndex(tempProjectiles, 0);
    }
    tempProjectiles.push(newProjectile);

    return {
      projectiles: tempProjectiles,
    }
  }),
  removeProjectileById: (id:string) => set((state:any) => {
    let tempProjectiles = state.projectiles || [];
    
    const projectileIndex = tempProjectiles.findIndex((projectile:any) => projectile.id === id)
    if (projectileIndex > -1) {
      tempProjectiles = removeProjectileByIndex(tempProjectiles, projectileIndex, id);
    } else {
      throw new Error('projectile not deleted (removeProjectileById)')
    }

    return {
      projectiles: tempProjectiles
    }
  }),

  // objects
  addObject: (newObject:GameObjectData) => set((state:any) => {
    return addObject(newObject, state)
  }),
  removeObjectById: (objectId:string) => set((state:any) => {
    const tempObjects = state.gameObjectsDict || {};
    delete tempObjects[objectId];

    return {
      gameObjectsDict: tempObjects
    }
  }),
  updateObjectById: (newObject:GameObjectData) => set((state:any) => {
    return addObject(newObject, state)
  }),

  
}))


export default useZustandStore