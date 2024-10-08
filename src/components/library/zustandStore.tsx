import { create } from 'zustand';
import { maxProjectilesOnScreen, defaultGameObjectData, defaultGameSettings, defaultLevelData } from './constants';
import {
  GameObjectData,
  ProjectileData,
  PlayerObjectData,
  GameObjectType,
  GameSettings,
  LevelFlowType,
  LevelData,
  GameState,
  LevelState,
  LevelSettings,
  LevelResults,
} from './interfaces';

// import { Projectile } from './objects'

interface ZustandState {
  // data
  player: PlayerObjectData;
  playerUpdater: number;
  projectiles: Map<string, ProjectileData>;
  projectilesUpdater: number;
  gameObjectsMap: Map<string, GameObjectData>;
  colliderObjects: Map<string, GameObjectData>;
  gameSettings: GameSettings;
  // current level
  currentLevelData: LevelData;
  // inital settings
  allLevelSettings: Map<string, LevelSettings>;
  // what happened in each level? did player win? what was the score?
  allLevelResults: Map<string, LevelResults>;
  // for each levelId, save initial data of objects
  // used for restarts
  allLevelObjectInitData: Map<string, Map<string, GameObjectData>>;

  // functions
  // players
  setPlayer: (newPlayer: PlayerObjectData) => void;
  setPlayerPosition: (newPlayerPosition: number[]) => void;
  setPlayerLastShootTimeMs: (newShootTime: number) => void;

  // projectiles
  addProjectile: (newProjectile: ProjectileData) => void;
  updateProjectileByIndex: (newProjectile: ProjectileData, projectileIndex: number) => void;
  updateProjectileById: (newProjectile: ProjectileData, projectileId?: string) => void;
  removeProjectileById: (projectileId: string) => void;
  removeProjectileByIndex: (projectileIndex: number, projectileId: string) => void;

  // objects
  addObject: (newObject: GameObjectData) => void;

  // damage
  damageObjectById: (targetId: string, damage?: number, sourceId?: string) => void;

  // Game settings
  setGameSettings: (gameSettings: GameSettings) => void;
  updateGameSettings: (gameSettings: any) => void;
  goToNextLevel: () => void;
  resetLevel: (levelId: string) => void;

  // Level settings/data
  setCurrentLevelData: (levelData: LevelData) => void;
  updateCurrentLevelData: (levelData: any) => void;
  updateAllLevelSettings: (levelSettingsWithId: Map<string, LevelSettings>) => void;
  updateAllLevelResults: (levelResultsWithId: Map<string, LevelResults>) => void;

  // timer
  updateTimeLeft: (timeLeftMs?: number) => void;
}

const updateProjectileByIndex = (
  oldProjectiles: Map<string, ProjectileData>,
  index: number,
  newProjectile: ProjectileData,
) => {
  if (!oldProjectiles) {
    // old projectiles not found
    throw new Error('old projectiles not found');
  }

  const oldKey = Array.from(oldProjectiles.keys())[index];

  if (!oldKey) {
    // old key not found
    throw new Error('old key not found');
  }

  oldProjectiles.set(oldKey, newProjectile);

  return oldProjectiles;
};
const removeProjectileByIndex = (oldProjectiles: Map<string, ProjectileData>, index: number, id?: string) => {
  if (!oldProjectiles) {
    // old projectiles not found
    throw new Error('old projectiles not found');
  }

  // get oldkey
  let oldKey;
  if (index === 0) {
    oldKey = oldProjectiles.keys().next().value;
  } else {
    oldKey = Array.from(oldProjectiles.keys())[index];
  }

  if (!oldKey) {
    // oldKey not found
    throw new Error('oldKey not found');
  }

  if (id && oldKey !== id) {
    // id provided, but did not match projectile key
    console.warn('id mismatch (removeProjectileByIndex)');
  } else {
    oldProjectiles.delete(oldKey);
  }

  return oldProjectiles;
};

const getTimeLeftFromLevelData = (levelData: LevelData) => {
  const timeElapsedMs = Date.now() - (levelData.startTimeMs || 0) - (levelData.pauseOffsetMs || 0);
  let timeLeftSec = (levelData.timeLimitSec || 0) - Math.floor(timeElapsedMs / 1000);

  if (timeLeftSec < 0) {
    timeLeftSec = 0;
  }

  return timeLeftSec;
};

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
  // change updater number whenever we change dict
  // this lets zustand know that there has been a change
  // and we should rerender
  playerUpdater: 0,
  projectiles: new Map<string, ProjectileData>(),
  projectilesUpdater: 0,
  gameObjectsMap: new Map<string, GameObjectData>(),
  // live game objects with colliders
  colliderObjects: new Map<string, GameObjectData>(),
  gameSettings: defaultGameSettings,
  currentLevelData: defaultLevelData,
  allLevelSettings: new Map<string, LevelSettings>(),
  allLevelResults: new Map<string, LevelResults>(),
  allLevelObjectInitData: new Map(),

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
        throw new Error('new projectile not found');
      }

      if (!newProjectile.id) {
        throw new Error('new projectile id not found');
      }

      const tempProjectiles: Map<string, ProjectileData> = state.projectiles || new Map();
      if (tempProjectiles.size >= maxProjectilesOnScreen) {
        // too many projectiles on screen
        // remove the first projectile
        // get key of first projectile
        const keyOfFirstProjectile = tempProjectiles.keys().next().value;
        if (keyOfFirstProjectile) tempProjectiles.delete(keyOfFirstProjectile);
      }
      tempProjectiles.set(newProjectile.id, newProjectile);

      return {
        projectiles: tempProjectiles,
        projectilesUpdater: Date.now(),
      };
    }),
  updateProjectileByIndex: (newProjectile: ProjectileData, projectileIndex: number) =>
    set((state: ZustandState) => {
      let tempProjectiles = state.projectiles || new Map();
      tempProjectiles = updateProjectileByIndex(tempProjectiles, projectileIndex, newProjectile);
      // console.log("setting projectiles to", JSON.stringify(tempProjectiles));
      return {
        projectiles: tempProjectiles,
        projectilesUpdater: Date.now(),
      };
    }),
  updateProjectileById: (newProjectile: ProjectileData, inProjectileId?: string) =>
    set((state: ZustandState) => {
      const tempProjectiles = state.projectiles || new Map();
      const projectileId = inProjectileId || newProjectile.id;
      tempProjectiles.set(projectileId, newProjectile);

      return {
        projectiles: tempProjectiles,
        projectilesUpdater: Date.now(),
      };
    }),
  removeProjectileById: (id: string) =>
    set((state: ZustandState) => {
      const tempProjectiles = state.projectiles || new Map();
      tempProjectiles.delete(id);

      return {
        projectiles: tempProjectiles,
        projectilesUpdater: Date.now(),
      };
    }),
  removeProjectileByIndex: (projectileIndex: number, projectileId: string) =>
    set((state: ZustandState) => {
      let tempProjectiles = state.projectiles || [];
      tempProjectiles = removeProjectileByIndex(tempProjectiles, projectileIndex, projectileId);

      return {
        projectiles: tempProjectiles,
        projectilesUpdater: Date.now(),
      };
    }),

  // objects
  addObject: (newObject: GameObjectData) =>
    set((state: ZustandState) => {
      if (!newObject) {
        throw new Error('new object not found (addObject)');
      }
      if (!newObject.id) {
        throw new Error('new object missing id (addObject)');
      }

      const tempColliderObj = state.colliderObjects || new Map();
      if (newObject.collider) {
        tempColliderObj.set(newObject.id, newObject);
      }

      if (!newObject.parentLevelId) {
        throw new Error('new object missing parentLevelId (addObject)');
      }

      // save the initial data for this object
      // used in restarts
      const allLevelObjectInitData = state.allLevelObjectInitData || {};
      const initObjectsForThisLevel = allLevelObjectInitData.get(newObject.parentLevelId) || new Map();
      initObjectsForThisLevel.set(newObject.id, structuredClone(newObject));
      allLevelObjectInitData.set(newObject.parentLevelId, initObjectsForThisLevel);

      // clone objects map
      const newGameObjectsMap = new Map(state.gameObjectsMap);
      newGameObjectsMap.set(newObject.id, structuredClone(newObject));

      return {
        gameObjectsMap: newGameObjectsMap,
        colliderObjects: tempColliderObj,
        allLevelObjectInitData: allLevelObjectInitData,
      };
    }),
  removeObjectById: (objectId: string) =>
    set((state: ZustandState) => {
      const tempObjects = state.gameObjectsMap || new Map();
      tempObjects.delete(objectId);

      return {
        gameObjectsMap: tempObjects,
      };
    }),
  updateObjectById: (newObject: GameObjectData) =>
    set((state: ZustandState) => {
      if (!newObject) {
        throw new Error('new object not found (addObject)');
      }
      if (!newObject.id) {
        throw new Error('new object missing id (addObject)');
      }

      const tempObjects = state.gameObjectsMap || new Map();
      tempObjects.set(newObject.id, newObject);

      return {
        gameObjectsMap: tempObjects,
      };
    }),

  // damage
  damageObjectById: (targetId: string, damage?: number, sourceId?: string) =>
    set((state: ZustandState) => {
      if (!sourceId) {
        console.warn('source id not found in damageObjectById');
      }
      let damageAmount = 1;
      if (typeof damage === 'number') {
        damageAmount = damage;
      } else {
        console.warn('damage amount not found, using default (1) in damageObjectById');
      }

      if (!targetId) {
        throw new Error('invalid targetId in damageObjectById');
      }

      const tempObjects = new Map(state.gameObjectsMap);
      if (!tempObjects) {
        // old objects not found
        throw new Error('old objects not found');
      }

      const target = tempObjects.get(targetId);

      if (!target) {
        // target not found in list
        throw new Error('target not found in object dict. (damageObjectById)');
      }

      if (target.destroyed) {
        console.warn('target already destroyed (damageObjectById)');
        return {};
      }

      // console.log('target health', target.health);

      if (target.health && target.health > damageAmount) {
        target.health -= damageAmount;
      } else {
        // destroy target
        target.destroyed = true;
        let tempPlayerScore = state.currentLevelData.score || 0;

        const tempColliderObj = state.colliderObjects;
        tempColliderObj.delete(target.id);

        // count how many enemies are still alive
        let numLivingEnemies = 0;
        state.gameObjectsMap.forEach((thisObject: GameObjectData) => {
          if (!thisObject.destroyed && thisObject.isEnemy) {
            numLivingEnemies++;
          }
        });
        console.log('enemies remaining:', numLivingEnemies, 'objects', state.gameObjectsMap.values);

        if (target.scoreValue) {
          tempPlayerScore += target.scoreValue;
          console.log('setting new score to', tempPlayerScore);
        }

        return {
          gameObjectsMap: tempObjects,
          colliderObjects: tempColliderObj,
          currentLevelData: {
            ...state.currentLevelData,
            numLivingEnemies: numLivingEnemies,
            score: tempPlayerScore,
          },
        };
      }

      return {};
    }),

  // Game settings
  setGameSettings: (gameSettings: GameSettings) =>
    set(() => {
      if (!gameSettings) {
        throw new Error('gameSettings is empty');
      }

      return {
        gameSettings: gameSettings,
      };
    }),
  updateGameSettings: (gameSettings: any) =>
    set((state: ZustandState) => {
      if (!gameSettings) {
        throw new Error('gameSettings is empty');
      }

      const oldGameSettings = state.gameSettings;

      return {
        gameSettings: {
          ...oldGameSettings,
          ...gameSettings,
        },
      };
    }),
  goToNextLevel: () =>
    set((state: ZustandState) => {
      const tempGameSettings = state.gameSettings;

      const currentLevel = tempGameSettings.currentLevel;
      const levelFlow = tempGameSettings.levelFlow;
      const levelFlowType = tempGameSettings.levelFlowType;

      if (levelFlowType === LevelFlowType.Linear) {
        if (!currentLevel) {
          throw new Error('no current level found');
        }
        let currentLevelIndex = levelFlow.indexOf(currentLevel);
        if (currentLevelIndex === -1) {
          throw new Error('current level not in level flow');
        }

        currentLevelIndex++;
        if (currentLevelIndex === levelFlow.length) {
          // we're out of levels. end game
          return {
            gameSettings: {
              ...tempGameSettings,
              gameState: GameState.EndScreen,
            },
          };
        }

        // move to next level
        const newLevel = levelFlow[currentLevelIndex];
        return {
          gameSettings: {
            ...tempGameSettings,
            goToLevel: newLevel,
          },
        };
      }

      console.warn('cannot go to next level,', 'flow type is not linear (goToNextLevel)');
      return {};
    }),
  resetLevel: (levelId: string) =>
    set((state: ZustandState) => {
      const newProjectiles: Map<string, ProjectileData> = new Map();
      const tempGameObjectsMap = new Map(state.allLevelObjectInitData.get(levelId) || new Map());
      const thisLevelSettings = state.allLevelSettings.get(levelId);
      console.log('all level settings', state.allLevelSettings);
      if (!thisLevelSettings) {
        throw new Error('level settings not found for this level ' + levelId + ' (resetLevel)');
      }

      const newColliderObjs = new Map<string, GameObjectData>();

      tempGameObjectsMap.forEach((thisGameObject, thisGameObjectId) => {
        // we need to clone every game object so that when we reset the level,
        // these objects are still in their initial states
        tempGameObjectsMap.set(thisGameObjectId, structuredClone(thisGameObject));
      });

      tempGameObjectsMap.forEach((thisObject) => {
        if (thisObject.collider && thisObject.id) {
          newColliderObjs.set(thisObject.id, thisObject);
        }
      });

      const newLevelData: LevelData = {
        ...thisLevelSettings,
        timeLeftSec: thisLevelSettings.timeLimitSec || Infinity,
        levelState: LevelState.NormalPlay,
        startTimeMs: Date.now(),
        score: 0,
      };
      return {
        gameObjectsMap: tempGameObjectsMap,
        projectiles: newProjectiles,
        currentLevelData: newLevelData,
        colliderObjects: newColliderObjs,
      };
    }),

  // Level settings
  setCurrentLevelData: (levelData: LevelData) =>
    set(() => {
      if (!levelData) {
        throw new Error('levelSettings is empty (setLevelSettings)');
      }

      return {
        currentLevelData: levelData,
      };
    }),
  updateCurrentLevelData: (levelData: any) =>
    set((state: ZustandState) => {
      if (!levelData) {
        throw new Error('levelSettings is empty (updateCurrentLevelSettings)');
      }

      const oldLevelData = state.currentLevelData;
      const newLevelData = {
        ...oldLevelData,
        ...levelData,
      };

      const timeLeftSec = getTimeLeftFromLevelData(newLevelData);

      return {
        currentLevelData: {
          ...newLevelData,
          timeLeftSec: timeLeftSec,
        },
      };
    }),
  updateAllLevelSettings: (levelSettingsWithId: Map<string, LevelSettings>) =>
    set((state: ZustandState) => {
      if (!levelSettingsWithId) {
        throw new Error('levelSettingsWithId is empty (updateAllLevelSettings)');
      }

      const tempAllLevelSettings: Map<string, LevelSettings> = state.allLevelSettings || new Map();
      levelSettingsWithId.forEach((thisLevelSettings, thisLevelId) => {
        tempAllLevelSettings.set(thisLevelId, thisLevelSettings);
      });

      return {
        allLevelSettings: tempAllLevelSettings,
      };
    }),
  updateAllLevelResults: (levelResultsWithId: Map<string, LevelResults>) =>
    set((state: ZustandState) => {
      if (!levelResultsWithId) {
        throw new Error('levelResultsWithId is empty (updateAllLevelResults)');
      }

      const tempAllLevelResults: Map<string, LevelResults> = state.allLevelResults || new Map();
      levelResultsWithId.forEach((thisLevelResults, thisLevelId) => {
        tempAllLevelResults.set(thisLevelId, thisLevelResults);
      });

      console.log('level results with id', levelResultsWithId);
      console.log('tempAllLevelresults', tempAllLevelResults);

      return {
        allLevelResults: tempAllLevelResults,
      };
    }),

  // timer
  updateTimeLeft: (inTimeLeftSec?: number) =>
    set((state: ZustandState) => {
      // if timeLeftMs is provided, use that.
      // if not, calculate time left from level settings
      if (typeof inTimeLeftSec !== 'undefined') {
        return {
          currentLevelData: {
            ...state.currentLevelData,
            timeLeftSec: inTimeLeftSec,
          },
        };
      }

      const timeLeftSec = getTimeLeftFromLevelData(state.currentLevelData);

      return {
        currentLevelData: {
          ...state.currentLevelData,
          timeLeftSec: timeLeftSec,
        },
      };
    }),
}));

export { useZustandStore, ZustandState };
