import { useSelector } from 'react-redux'
import reduxStore from './reduxStore'
import { screenBoundsMax, screenBoundsMin } from './constants'
import { collisionCheck } from './helpfulFunctions';

function useMovePlayer() {
  const playerShipData = useSelector((state: any) => state.playerShip)
  const playerShipUpdater = useSelector((state: any) => state.playerShipUpdater)

  function movePlayer(direction: string, delta: number) {
    const oldPosition = playerShipData.position
    const scaledDelta = delta * 10
    const newPosition = [...oldPosition]
    if (direction === 'left') {
      newPosition[0] -= scaledDelta
    } else if (direction === 'right') {
      newPosition[0] += scaledDelta
    }
    console.log('setting player position to', newPosition)
    console.log('playerShipUpdater is', playerShipUpdater)
    reduxStore.dispatch({ type: 'setPlayerPosition', value: newPosition })
  }

  return movePlayer
}

function usePlayerShoot() {
  const playerShipData = useSelector((state: any) => state.playerShip)

  function playerShoot() {
    if (playerShipData.lastShootTimeMs + playerShipData.shootDelayMs > Date.now()) {
      // make sure we're not shooting too quickly
      return
    }

    const playerPosition = [...playerShipData.position]

    console.log('creating bullet at', playerPosition)

    const newBullet = {
      position: playerPosition,
      source: 'player',
      // bullet id is bullet_ + time created + random number
      id: 'bullet_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      direction: 0, // degrees where 0 is up
      speed: 1,
      damage: 1,
      collider: {
        shape: "point",
        offset: [0, 0, 0],
      }
    }

    console.log('creating bullet:', newBullet)
    reduxStore.dispatch({ type: 'addBullet', value: newBullet })
    reduxStore.dispatch({ type: 'setPlayerLastShootTimeMs', value: Date.now() })
  }

  return playerShoot
}

function useUpdateBullets() {
  const bullets = useSelector((state: any) => state.bullets)

  function updateBullets(delta: number) {
    const scaledDelta = delta * 10
    bullets.forEach((bullet: any, i: number) => {
      // check if bullet is out of bounds
      if (
        bullet.position[0] > screenBoundsMax[0] ||
        bullet.position[0] < screenBoundsMin[0] ||
        bullet.position[1] > screenBoundsMax[1] ||
        bullet.position[1] < screenBoundsMin[1] ||
        bullet.position[2] > screenBoundsMax[2] ||
        bullet.position[2] < screenBoundsMin[2]
      ) {
        // bullet is out of bounds, delete and return
        reduxStore.dispatch({
          type: 'removeBulletByIndex',
          value: {
            index: i,
            id: bullet.id,
          },
        })
        return
      }

      // move bullet
      bullet.position[1] += (bullet.speed || 1) * scaledDelta

      // check for collision
      console.log("collision is", collisionCheck(bullet, bullet));

      reduxStore.dispatch({
        type: 'updateBulletByIndex',
        value: {
          index: i,
          id: bullet.id,
          bullet: bullet,
        },
      })
    })
  }

  return updateBullets
}

export { useMovePlayer, usePlayerShoot, useUpdateBullets }
