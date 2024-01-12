import { createStore } from 'redux'
import { 
  maxBulletsOnScreen, 
  maxObjectsOnScreen, 
  defaultGameObjectData 
} from './constants'
import {
  GameObjectData, 
  GameObjectsDictionary,
  BulletData, 
  PlayerObjectData,
  GameObjectType,
} from './interfaces';

/**
 * This is a reducer - a function that takes a current state value and an
 * action object describing "what happened", and returns a new state value.
 * A reducer's function signature is: (state, action) => newState
 *
 * The Redux state should contain only plain JS objects, arrays, and primitives.
 * The root state value is usually an object. It's important that you should
 * not mutate the state object, but return a new object if the state changes.
 *
 * You can use any conditional logic you want in a reducer. In this example,
 * we use a switch statement, but it's not required.
 */


interface AppState {
  player: PlayerObjectData;
  playerUpdater: number;
  playerStats: any;
  bullets: BulletData[];
  gameObjectsDict: GameObjectsDictionary;
  colliderObjects: GameObjectData[];
}

const initialState: AppState = {
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
  bullets: [],
  gameObjectsDict: {},
  // live game objects with colliders
  colliderObjects: [],
}

const reducer = (state = initialState, action: any) => {
  if (action?.type?.includes('@@redux/INIT')) {
    // redux is doing init
    return state
  }

  if (!action?.type) {
    console.error('action:',  action)
    throw new Error('action or action type missing')
  }

  if (typeof action.value === 'undefined') {
    if (!['counter/incremented', 'counter/decremented', 'clearSignedInUser'].includes(action.type)) {
      // this is not one of the types that does not need a value,
      // so this is an error, do nothing
      console.error('action:', action)
      throw new Error('action value is undefined')
    }
  }

  let oldBullets, thisBullet, bulletIndex, tempState

  const removeBulletByIndex = (index: number, id?: string) => {
    oldBullets = [...state.bullets]
    if (!oldBullets) {
      // old bullets not found
      throw new Error('old bullets not found')
    }

    thisBullet = oldBullets[index]
    if (thisBullet && (!id || thisBullet.id === id)) {
      // make sure bullet exist and matches id if available
      oldBullets.splice(index, 1)
    } else {
      console.error('bullet not deleted')
    }

    return { ...state, bullets: oldBullets }
  }

  let oldObjects;


  switch (action.type) {
    // players
    case 'setPlayerShip':
      return { ...state, player: action.value, playerUpdater: Date.now() }
    case 'setPlayerPosition':
      return { ...state, player: { ...state.player, position: action.value }, 
                         playerUpdater: Date.now() }
    case 'setPlayerLastShootTimeMs':
      return {
        ...state,
        player: { ...state.player, lastShootTimeMs: action.value },
        playerUpdater: Date.now(),
      }

    // bullets
    case 'addBullet':
      tempState = state
      oldBullets = [...tempState.bullets]
      if (oldBullets.length > maxBulletsOnScreen) {
        tempState = removeBulletByIndex(0)
      }

      return { ...tempState, bullets: [...tempState.bullets, action.value] }
    case 'removeBulletByIndex':
      return removeBulletByIndex(action.value.index, action.value.id)
    case 'removeBulletById':
      oldBullets = [...state.bullets]
      if (!oldBullets) {
        // old bullets not found
        throw new Error('old bullets not found')
      }

      bulletIndex = oldBullets.findIndex((b) => b.id === action.value.id)
      thisBullet = null
      if (bulletIndex > -1) {
        // make sure bullet exist and matches id if available
        oldBullets.splice(bulletIndex, 1)
      } else {
        throw new Error('bullet not deleted')
      }

      return { ...state, bullets: oldBullets }

    case 'updateBulletByIndex':
      oldBullets = [...state.bullets]
      if (!oldBullets) {
        // old bullets not found
        throw new Error('old bullets not found')
      }

      thisBullet = oldBullets[action.value.index]
      if (thisBullet && (!action.value.id || thisBullet.id === action.value.id)) {
        // make sure bullet exist and matches id if available
        oldBullets[action.value.index] = action.value.bullet
      } else {
        // console.warn('bullet not changed')
        // console.log("this bullet", thisBullet);
        // console.log("action id", action.value.id);
        // console.log("bullet id", thisBullet?.id);
        // console.log("all bullets", oldBullets);
        // console.log("index", action.value.index);
      }

      return { ...state, bullets: oldBullets }

    // Game objects
    case 'addObject':
      tempState = state
      oldObjects = {...tempState.gameObjectsDict}
      if (Object.keys(oldObjects).length > maxObjectsOnScreen) {
        //TODO: too many objects on screen. remove one
      }

      const newObject = action.value;

      if (!newObject) {
        throw new Error("no new object found (addObject)")
      }
      if (!newObject.id) {
        throw new Error("new object does not have an id (add object)")
      }

      oldObjects[newObject.id] = newObject;

      return { ...tempState, gameObjectsDict: oldObjects }
    // case 'removeObjectByIndex':
    //   return removeObjectByIndex(action.value.index, action.value.id)
    case 'removeObjectById':
      oldObjects = {...state.gameObjectsDict}
      if (!oldObjects) {
        // old objects not found
        throw new Error('old objects not found')
      }

      delete oldObjects[action.value.id];

      return { ...state, gameObjectsDict: oldObjects }

    case 'updateObjectById':
      oldObjects = {...state.gameObjectsDict}
      if (!oldObjects) {
        // old objects not found
        throw new Error('old objects not found')
      }

      oldObjects[action.value.id] = action.value.object

      return { ...state, gameObjectsDict: oldObjects }

    // damage
    case 'damageObjectById':
      const sourceId = action.value.sourceId;
      if (!sourceId) {
        console.warn('source id not found in damageObjectById');
      }
      let damageAmount = 1;
      if (typeof action.value.damage === 'number') {
        damageAmount = action.value.damage;
      }
      else {
        console.warn('damage amount not found, using default (1) in damageObjectById');
      }


      const targetId = action.value.targetId;
      if (!targetId) {
        throw new Error('invalid targetId in damageObjectById');
      }

      oldObjects = {...state.gameObjectsDict}
      if (!oldObjects) {
        // old objects not found
        throw new Error('old objects not found')
      }

      const target = oldObjects[targetId];


      if (!target) {
        // target not found in list
        throw new Error('target not found in object dict. (damageObjectById)')
      }

      if (target.destroyed) {
        return state;
      }

      if (target.health && target.health > damageAmount) {
        target.health -= damageAmount;
      }
      else {
        // destroy target
        target.destroyed = true;
        const playerStatsClone = {...state.playerStats};
        const oldPlayerScore = playerStatsClone.score||0;

        if (target.scoreValue) {
          playerStatsClone.score = oldPlayerScore + target.scoreValue;
          console.log("setting new score to", playerStatsClone.score)
        }
        return {
          ...state,
          gameObjectsDict: oldObjects,
          playerStats: playerStatsClone,
        }
      }

      return state


    default:
      console.error('default reached in store', action)
      return state
  }
}

// Create a Redux store holding the state of your app.
// Its API is { subscribe, dispatch, getState }.
const store = createStore(reducer)

// You can use subscribe() to update the UI in response to state changes.
// Normally you'd use a view binding library (e.g. React Redux) rather than subscribe() directly.
// There may be additional use cases where it's helpful to subscribe as well.

// store.subscribe(() => console.log('new state:', store.getState()));

// The only way to mutate the internal state is to dispatch an action.
// The actions can be serialized, logged or stored and later replayed.
// store.dispatch({ type: 'counter/incremented' })
// // {value: 1}
// store.dispatch({ type: 'counter/incremented' })
// // {value: 2}
// store.dispatch({ type: 'counter/decremented' })
// // {value: 1}

export default store
