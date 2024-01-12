enum ColliderShape {
  Box,
  Point,
  Cylinder,
  Sphere,
}

enum GameObjectType {
  Default,
  Player,
  Projectile,
}

interface Collider {
  shape: ColliderShape;
  offset: number[];
  boxSize?: number[];
  boxRotation?: number[],
  cylinderSize?: number[];
  cylinderRotation?: number[];
  sphereRadius?: number;
  visible?: boolean;
}

interface GameObjectData {
  position: number[],
  size: number[],
  id: string,
  rotation: number[],
  speed: number,
  health?: number,
  scoreValue?: number,
  collider: Collider,
  type: GameObjectType,
  destroyed?: boolean,
}

interface PlayerObjectData extends GameObjectData {
  lastShootTimeMs: number,
  shootDelayMs: number,
}


interface BulletData extends GameObjectData {
  damage: number,
  sourceId: string,
}


interface GameObjectsDictionary {
  [id: string]: GameObjectData,
}


export {
  Collider, 
  GameObjectData, 
  GameObjectsDictionary, 
  BulletData,
  PlayerObjectData,
  ColliderShape,
  GameObjectType,
}
