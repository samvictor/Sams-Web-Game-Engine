import { createStore } from 'redux'
import { maxBulletsOnScreen, maxObjectsOnScreen } from './constants'

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
  playerShip: any;
  playerShipUpdater: number;
  bullets: any[];
  objects: any[]; // objects do not include bullets
}

const initialState: AppState = {
  // default state
  playerShip: {
    position: [0, -5, 0],
    lastShootTimeMs: 0,
    shootDelayMs: 100,
  },
  playerShipUpdater: 0,
  bullets: [],
  objects: [],
}

const reducer = (state = initialState, action: any) => {
  if (action?.type?.includes('@@redux/INIT')) {
    // redux is doing init
    return state
  }

  if (!action?.type) {
    console.error('action or action type missing', action)
    return state
  }

  if (typeof action.value === 'undefined') {
    if (!['counter/incremented', 'counter/decremented', 'clearSignedInUser'].includes(action.type)) {
      // this is not one of the types that does not need a value,
      // so this is an error, do nothing
      console.log('action value is undefined', action)
      return state
    }
  }

  let oldBullets, thisBullet, bulletIndex, tempState

  const removeBulletByIndex = (index: number, id?: string) => {
    oldBullets = [...state.bullets]
    if (!oldBullets) {
      // old bullets not found
      console.error('old bullets not found')
      return state
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

  let oldObjects, thisObject, objectIndex

  const removeObjectByIndex = (index: number, id?: string) => {
    oldObjects = [...state.objects]
    if (!oldObjects) {
      // old Objects not found
      console.error('old objects not found')
      return state
    }

    thisObject = oldObjects[index]
    if (thisObject && (!id || thisObject.id === id)) {
      // make sure bullet exist and matches id if available
      oldObjects.splice(index, 1)
    } else {
      console.error('bullet not deleted')
    }

    return { ...state, objects: oldObjects }
  }

  switch (action.type) {
    // players
    case 'setPlayerShip':
      return { ...state, playerShip: action.value, playerShipUpdater: Date.now() }
    case 'setPlayerPosition':
      return { ...state, playerShip: { ...state.playerShip, position: action.value }, playerShipUpdater: Date.now() }
    case 'setPlayerLastShootTimeMs':
      return {
        ...state,
        playerShip: { ...state.playerShip, lastShootTimeMs: action.value },
        playerShipUpdater: Date.now(),
      }

    // bullets
    case 'addBullet':
      tempState = state
      oldBullets = [...tempState.bullets]
      if (oldBullets.length > maxObjectsOnScreen) {
        tempState = removeObjectByIndex(0)
      }

      return { ...tempState, objects: [...tempState.objects, action.value] }
    case 'removeObjectsByIndex':
      return removeObjectByIndex(action.value.index, action.value.id)
    case 'removeBulletById':
      oldBullets = [...state.bullets]
      if (!oldBullets) {
        // old bullets not found
        console.error('old bullets not found')
        return state
      }

      bulletIndex = oldBullets.findIndex((b) => b.id === action.value.id)
      thisBullet = null
      if (bulletIndex > -1) {
        // make sure bullet exist and matches id if available
        oldBullets.splice(bulletIndex, 1)
      } else {
        console.error('bullet not deleted')
      }

      return { ...state, bullets: oldBullets }

    case 'updateBulletByIndex':
      oldBullets = [...state.bullets]
      if (!oldBullets) {
        // old bullets not found
        console.error('old bullets not found')
        return state
      }

      thisBullet = oldBullets[action.value.index]
      if (thisBullet && (!action.value.id || thisBullet.id === action.value.id)) {
        // make sure bullet exist and matches id if available
        oldBullets[action.value.index] = action.value.bullet
      } else {
        console.warn('bullet not changed')
        console.log("this bullet", thisBullet);
        console.log("action id", action.value.id);
        console.log("bullet id", thisBullet?.id);
        console.log("all bullets", oldBullets);
        console.log("index", action.value.index);
      }

      return { ...state, bullets: oldBullets }

    // Game objects
    case 'addObject':
      tempState = state
      oldObjects = [...tempState.objects]
      if (oldObjects.length > maxObjectsOnScreen) {
        tempState = removeObjectById(0)
      }

      return { ...tempState, objects: [...tempState.objects, action.value] }
    case 'removeObjectByIndex':
      return removeObjectByIndex(action.value.index, action.value.id)
    case 'removeObjectById':
      oldObjects = [...state.objects]
      if (!oldObjects) {
        // old objects not found
        console.error('old objects not found')
        return state
      }

      objectIndex = oldObjects.findIndex((b) => b.id === action.value.id)
      thisObject = null
      if (objectIndex > -1) {
        // make sure object exist and matches id if available
        oldObjects.splice(objectIndex, 1)
      } else {
        console.error('object not deleted')
      }

      return { ...state, objects: oldObjects }

    case 'updateObjectByIndex':
      oldObjects = [...state.objects]
      if (!oldObjects) {
        // old objects not found
        console.error('old objects not found')
        return state
      }

      thisObject = oldObjects[action.value.index]
      if (thisObject && (!action.value.id || thisObject.id === action.value.id)) {
        // make sure object exist and matches id if available
        oldObjects[action.value.index] = action.value.object
      } else {
        console.warn('object not changed')
        console.log("this object", thisObject);
        console.log("action id", action.value.id);
        console.log("object id", thisObject?.id);
        console.log("all objects", oldObjects);
        console.log("index", action.value.index);
      }

      return { ...state, objects: oldObjects }

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
