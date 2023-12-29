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

  // map is faster than if tree
  // bind arguments so we can swap arguments when we need to
  // but avoid calling all functions
  const mapShapesToFunction:any = {
    point: {
      point: pointToPointCollisionCheck3D.bind(object1, object2),
      box: pointToBoxCollisionCheck3D.bind(object1, object2),
      sphere: pointToSphereCollisionCheck3D.bind(object1, object2),
    },
    box: {
      // we need to reverse arguments because first argument
      // must be point and second must be box
      point: pointToBoxCollisionCheck3D.bind(object2, object1),

    }
  }


}

// point, box, cylinder, sphere
const pointToPointCollisionCheck3D = (object1:any, object2:any) => {
  // check for a collision between two point shaped colliders

  let {isValid} = collisionCheckValidateArgs(object1, object2, "point", "point");

  if (!isValid) {
    return;
  }

  const object1Position = getColliderPosition3D(object1);
  const object2Position = getColliderPosition3D(object2);

  return object1Position[0] === object2Position[0]
    && object1Position[1] === object2Position[1]
    && object1Position[2] === object2Position[2]
}

const pointToBoxCollisionCheck3D = (object1:any, object2:any) => {
  // check for collision between a point and a box shaped collider
  // the first argument must be a point and the second argument
  // must be a box

  let {point, box, isValid} = collisionCheckValidateArgs(
                                          object1, object2, "point", "box");

  if (!isValid) {
    return;
  }

  const boxSize = box.collider.boxSize;
  if (!boxSize) {
    console.error("missing box size");
    console.error(box);
    return false;
  }

  const pointPosition = getColliderPosition3D(point);
  const boxC1 = getColliderPosition3D(box);
  const boxC2 = [boxC1[0] + boxSize[0], boxC1[1] + boxSize[1], boxC1[2] + boxSize[2]];

  // check all components of point are greater than box
  // corner 1 (bottom-left-back corner)
  // and check all components of point are less than
  // box corner 2 (top-right-front corner)

  return boxC1[0] < pointPosition[0] && pointPosition[0] < boxC2[0]
          && boxC1[1] < pointPosition[1] && pointPosition[1] < boxC2[1]
          && boxC1[2] < pointPosition[2] && pointPosition[2] < boxC2[2];
}

const pointToSphereCollisionCheck3D = (point:any, sphere:any) => {
  // check for collision between a point and a sphere shaped collider
  // the first argument must be a point and the second argument
  // must be a shpere

  let {point, sphere, isValid} = collisionCheckValidateArgs(
                                          object1, object2, "point", "sphere");

  if (!isValid) {
    return;
  }

  const pointPosition = getColliderPosition3D(point);
  const spherePosition = getColliderPosition3D(sphere);

}

const boxToBoxCollisionCheck3D = (object1:any, object2:any) => {
  // check for collision between 2 box shaped colliders
  let {isValid} = collisionCheckValidateArgs(
                                            object1, object2, "box", "box");

  if (!isValid) {
    return;
  }

  const object1Position = getColliderPosition3D(object1);
  const object2Position = getColliderPosition3D(object2);
}

const boxToSphereCollisionCheck3D = (box:any, sphere:any) => {
  // check for collision between a box and a sphere shaped collider
  // the first argument must be a box and the second argument
  // must be a shpere

  let {box, sphere, isValid} = collisionCheckValidateArgs(
                                            object1, object2, "box", "sphere");

  if (!isValid) {
    return;
  }

  const boxPosition = getColliderPosition3D(box);
  const spherePosition = getColliderPosition3D(sphere);
}

const sphereToSphereCollisionCheck3D = (object1:any, object2:any) => {
  // check for collision between 2 sphere shaped colliders

  let {isValid} = collisionCheckValidateArgs(
                                          object1, object2, "sphere", "sphere");

  if (!isValid) {
    return;
  }

  const object1Position = getColliderPosition3D(object1);
  const object2Position = getColliderPosition3D(object2);
}




// == helpers ==

const collisionCheckValidateArgs = (inObject1:any, inObject2:any, type1, type2) => {
  // make sure all objects exist, have colliders, and are in right order
  // return objects in correct order as well as if validate passed
  let isValid = true;
  let outObject1 = inObject1;
  let outObject2 = inObject2;

  if (!inObject1 || !inObject2) {
    console.error("an object is missing");
    console.error("object1:", inObject1, "object2:", inObject2);
    isValid = false;
  }

  if (!inObject1.collider || !inObject2.collider) {
    console.error("an object is missing a collider");
    console.error(inObject1, inObject2);
    isValid = false;
  }

  if (inObject1.collider.shape !== type1) {
    if (inObject2.collider.shape === type1 && type1 !== type2) {
      // arguments are probably in wrong order. switch
      outObject1 = inObject2;
    }
    else {
      console.error("object1 is not a " + type1);
      console.error(inObject1, inObject2);
      return false;
    }
  }

  if (inObject2.collider.shape !== type2) {
    if (inObject1.collider.shape === type2 && type1 !== type2) {
      // arguments are probably in wrong order. switch
      outObject2 = inObject1;
    }
    else {
      console.error("object2 is not a " + type2)
      console.error(inObject1, inObject2);
      return false;
    }
  }

  return {
    [type1]: outObject1,
    [type2]: outObject2,
    isValid: isValid
  }
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
