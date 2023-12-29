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


export {Collider}
