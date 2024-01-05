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
  id: string,
  rotation: number[],
  speed: number,
  health: number,
  collider: Collider,
  type: string,
}


export {Collider, GameObjectData}
