interface Collider {
  shape: string;
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
  collider: Collider,
  type: string,
}

interface GameObjectsDictionary {
  [id: string]: GameObjectData,
}

interface BulletData extends GameObjectData {
  damage: number,
}


export {Collider, GameObjectData, GameObjectsDictionary}
