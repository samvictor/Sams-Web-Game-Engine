import {Collider} from './interfaces';

const collisionCheck3D = (object1:any, object2:any) => {
  // are these objects currently colliding?
  // all objects must have a collider
  if (!object1 || !object2) {
    console.error("an object is missing");
    console.error("object1:", object1, "object2:", object2);
    return false;
  }

  if (!object1.collider || !object2.collider) {
    console.error("an object is missing a collider");
    console.error(object1, object2);
    return false;
  }


}

// point, box, cylinder, sphere
const pointToPointCollisionCheck3D = (object1:any, object2:any) => {
  // check for a collision between two point shaped colliders
  if (!object1 || !object2) {
    console.error("an object is missing");
    console.error("object1:", object1, "object2:", object2);
    return false;
  }

  if (!object1.collider || !object2.collider) {
    console.error("an object is missing a collider");
    console.error(object1, object2);
    return false;
  }

  const object1Position = getColliderPosition3D(object1);
  const object2Position = getColliderPosition3D(object2);

  return object1Position[0] === object2Position[0]
    && object1Position[1] === object2Position[1]
    && object1Position[2] === object2Position[2]
}

const getColliderPosition3D(object:any) => {
  // get absolute position of a collider
  // by combining the object position with the collider offset

  if (!object.collider) {
    console.error("object did not have a collider");
    console.error(object);
    return;
  }
  if (!object.position) {
    console.error("object did not have a position");
    console.error(object);
    return;
  }

  const collider:Collider = object.collider;
  const colliderOffset = collider.offset || [0, 0, 0];
  const position = object.position;

  if (colliderOffset.length < 3 ) {
    console.error("collider offset is invalid")
    console.error(colliderOffset);
    return;
  }
  if (position.length < 3) {
    console.error("object position is invalid")
    console.error(object.position);
    return;
  }

  return [
    colliderOffset[0] + position[0],
    colliderOffset[1] + position[1],
    colliderOffset[2] + position[2]
  ];
}

const collisionCheck = collisionCheck3D;

export { collisionCheck }
