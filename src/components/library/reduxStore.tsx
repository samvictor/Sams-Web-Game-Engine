import { createStore } from 'redux'
import { maxBulletsOnScreen } from './constants'

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
  playerShip: any
  playerShipUpdater: number
  bullets: any[]
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
        console.error('bullet not changed')
      }

      return { ...state, bullets: oldBullets }

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
