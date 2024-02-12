// import { useSelector } from 'react-redux'
// import reduxStore from './reduxStore'
import { useZustandStore, ZustandState } from './zustandStore';
import { screenBoundsMax, screenBoundsMin } from './constants';
import { collisionCheck } from './helpfulFunctions';
import { ProjectileData, GameObjectData, ColliderShape, GameObjectType } from './interfaces';

function useMovePlayer() {
  const playerData = useZustandStore((state: ZustandState) => state.player);
  const setPlayerPosition = useZustandStore((state: ZustandState) => state.setPlayerPosition);

  function movePlayer(direction: string, delta: number) {
    const oldPosition = playerData.position;
    const scaledDelta = delta * 7;
    const newPosition = [...oldPosition];
    if (direction === 'left') {
      newPosition[0] -= scaledDelta;
    } else if (direction === 'right') {
      newPosition[0] += scaledDelta;
    }
    // console.log('setting player position to', newPosition)
    // console.log('playerUpdater is', playerUpdater)
    setPlayerPosition(newPosition);
  }

  return movePlayer;
}

function usePlayerShoot() {
  const playerData = useZustandStore((state: ZustandState) => state.player);
  const addProjectile = useZustandStore((state: ZustandState) => state.addProjectile);
  const setPlayerLastShootTimeMs = useZustandStore((state: ZustandState) => state.setPlayerLastShootTimeMs);

  function playerShoot() {
    if (playerData.lastShootTimeMs + playerData.shootDelayMs > Date.now()) {
      // make sure we're not shooting too quickly
      return;
    }

    const playerPosition = [...playerData.position];

    // console.log('creating bullet at', playerPosition)

    const bulletStartingPosition = [...playerPosition];
    bulletStartingPosition[2] += 0;

    const newBullet: ProjectileData = {
      position: bulletStartingPosition,
      sourceId: 'player',
      // bullet id is bullet_ + time created + random number
      id: 'bullet_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      rotation: [0, 0, 0], // degrees where 0 is up
      size: [0.1, 0.5, 0.1],
      objectType: GameObjectType.Projectile,
      speed: 1,
      damage: 1,
      collider: {
        shape: ColliderShape.Point,
        offset: [0, 0, 0],
      },
    };

    // console.log('creating bullet:', newBullet)
    addProjectile(newBullet);
    setPlayerLastShootTimeMs(Date.now());
  }

  return playerShoot;
}

function useUpdateProjectiles() {
  const projectiles = useZustandStore((state: ZustandState) => state.projectiles);
  const removeProjectileByIndex = useZustandStore((state: ZustandState) => state.removeProjectileByIndex);
  const damageObjectById = useZustandStore((state: ZustandState) => state.damageObjectById);
  const updateProjectileByIndex = useZustandStore((state: ZustandState) => state.updateProjectileByIndex);

  const objects = useZustandStore((state: ZustandState) => state.colliderObjects);

  function updateBullets(delta: number) {
    if (typeof delta === 'undefined') {
      throw new Error('delta not found');
    }

    const scaledDelta = delta * 10;
    projectiles.forEach((bullet: any, i: number) => {
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
        removeProjectileByIndex(i, bullet.id);
        return;
      }

      // move bullet
      bullet.position[1] += (bullet.speed || 1) * scaledDelta;

      // console.log('new bullet position is', bullet.position);

      // check for collision
      let hadCollision = false;
      objects.forEach((thisObject: GameObjectData) => {
        if (collisionCheck(bullet, thisObject)) {
          console.log('collision', thisObject.id);
          damageObjectById(thisObject.id, bullet.damage, bullet.id);
          // console.log("collision", bullet, thisObject);
          hadCollision = true;
          // destroy this projectile
          removeProjectileByIndex(i, bullet.id);
        }
      });

      if (!hadCollision) {
        updateProjectileByIndex(i, bullet);
      }
    });
  }

  return updateBullets;
}

export { useMovePlayer, usePlayerShoot, useUpdateProjectiles };
