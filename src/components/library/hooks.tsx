import { useSelector } from 'react-redux'
import reduxStore from './reduxStore'
import { screenBoundsMax, screenBoundsMin } from './constants'
import { collisionCheck } from './helpfulFunctions';
import {BulletData, GameObjectData, ColliderShape, GameObjectType} from './interfaces';

function useMovePlayer() {
  const playerShipData = useSelector((state: any) => state.playerShip)
  const playerShipUpdater = useSelector((state: any) => state.playerShipUpdater)

  function movePlayer(direction: string, delta: number) {
    const oldPosition = playerShipData.position
    const scaledDelta = delta * 7
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

    const bulletStartingPosition = [...playerPosition];
    bulletStartingPosition[2] += 0;

    const newBullet:BulletData = {
      position: bulletStartingPosition,
      sourceId: 'player',
      // bullet id is bullet_ + time created + random number
      id: 'bullet_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      rotation: [0, 0, 0], // degrees where 0 is up
      size: [0.1, 0.5, 0.1],
      type: GameObjectType.Projectile,
      speed: 1,
      damage: 1,
      collider: {
        shape: ColliderShape.Point,
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
  const objectsDict = useSelector((state: any) => state.gameObjectsDict)
  const objects:GameObjectData[] = Object.values(objectsDict);

  function updateBullets(delta: number) {
    if (typeof delta === 'undefined') {
      throw new Error('delta not found');
    }

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
      objects.forEach((thisObject:GameObjectData) => {
        if (collisionCheck(bullet, thisObject)) {
          console.log("collision", thisObject.id);
          reduxStore.dispatch({
            type: 'damageObjectById',
            value: {
              sourceId: bullet.id,
              damage: bullet.damage,
              targetId: thisObject.id
            },
          });
          // console.log("collision", bullet, thisObject);
        }
      });

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
