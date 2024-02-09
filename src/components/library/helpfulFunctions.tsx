import { Collider, ColliderShape } from './interfaces'

const collisionCheck3D = (object1: any, object2: any) => {
  // are these objects currently colliding?
  // all objects must have a collider
  if (!object1 || !object2) {
    console.error('object1:', object1, 'object2:', object2)
    throw new Error('an object is missing')
  }

  if (!object1.collider || !object2.collider) {
    console.error(object1, object2)
    throw new Error('an object is missing a collider')
  }

  if (typeof object1.collider.shape === 'undefined' || typeof !object2.collider.shape === 'undefined') {
    console.error(object1, object2)
    throw new Error('an object is missing collider shape')
  }

  // map is faster than if tree
  const mapShapesToFunction: any = {
    [ColliderShape.Point]: {
      [ColliderShape.Point]: pointToPointCollisionCheck3D,
      [ColliderShape.Box]: pointToBoxCollisionCheck3D,
      [ColliderShape.Sphere]: pointToSphereCollisionCheck3D,
    },
    [ColliderShape.Box]: {
      [ColliderShape.Point]: pointToBoxCollisionCheck3D,
      [ColliderShape.Box]: boxToBoxCollisionCheck3D,
      [ColliderShape.Sphere]: boxToSphereCollisionCheck3D,
    },
    [ColliderShape.Sphere]: {
      [ColliderShape.Point]: pointToSphereCollisionCheck3D,
      [ColliderShape.Box]: boxToSphereCollisionCheck3D,
      [ColliderShape.Sphere]: sphereToSphereCollisionCheck3D,
    },
  }

  return mapShapesToFunction[object1.collider.shape]?.[object2.collider.shape]?.(object1, object2) || false
}

// point, box, cylinder, sphere
const pointToPointCollisionCheck3D = (object1: any, object2: any) => {
  // check for a collision between two point shaped colliders

  const { isValid } = collisionCheckValidateArgs(object1, object2, ColliderShape.Point, ColliderShape.Point)

  if (!isValid) {
    return
  }

  const object1Position = getColliderPosition3D(object1)
  const object2Position = getColliderPosition3D(object2)

  return (
    object1Position[0] === object2Position[0] &&
    object1Position[1] === object2Position[1] &&
    object1Position[2] === object2Position[2]
  )
}

const pointToBoxCollisionCheck3D = (object1: any, object2: any) => {
  // check for collision between a point and a box shaped collider
  // console.log("doing point to box collision");

  const { outObject1, outObject2, isValid } = collisionCheckValidateArgs(
    object1,
    object2,
    ColliderShape.Point,
    ColliderShape.Box,
  )
  const point = outObject1
  const box = outObject2

  if (!isValid) {
    return
  }

  const boxSize = box.collider.boxSize
  if (!boxSize) {
    console.error(box)
    throw new Error('missing box size')
  }

  const pointPosition = getColliderPosition3D(point)
  const boxCenter = getColliderPosition3D(box)
  const boxC1 = [boxCenter[0] - boxSize[0] / 2, boxCenter[1] - boxSize[1] / 2, boxCenter[2] - boxSize[2] / 2]
  const boxC2 = [boxC1[0] + boxSize[0], boxC1[1] + boxSize[1], boxC1[2] + boxSize[2]]

  // check all components of point are greater than box
  // corner 1 (bottom-left-back corner)
  // and check all components of point are less than
  // box corner 2 (top-right-front corner)
  // C1 holds all of the mins and C2 holds all of the maxs

  return (
    boxC1[0] <= pointPosition[0] &&
    pointPosition[0] <= boxC2[0] &&
    boxC1[1] <= pointPosition[1] &&
    pointPosition[1] <= boxC2[1] &&
    boxC1[2] <= pointPosition[2] &&
    pointPosition[2] <= boxC2[2]
  )
}

const pointToSphereCollisionCheck3D = (object1: any, object2: any) => {
  // check for collision between a point and a sphere shaped collider
  // the first argument must be a point and the second argument
  // must be a shpere

  const { outObject1, outObject2, isValid } = collisionCheckValidateArgs(
    object1,
    object2,
    ColliderShape.Point,
    ColliderShape.Sphere,
  )

  const point = outObject1
  const sphere = outObject2

  if (!isValid) {
    return
  }

  const sphereRadius = sphere.collider.sphereRadius
  if (!sphereRadius) {
    console.error(sphere)
    throw new Error('missing shpere radius')
  }

  const pointPosition = getColliderPosition3D(point)
  const spherePosition = getColliderPosition3D(sphere)

  // calc distance between sphere center and point center
  // if distance is less than radius, they are colliding
  return (
    Math.sqrt(
      (pointPosition[0] - spherePosition[0]) ** 2 +
        (pointPosition[1] - spherePosition[1]) ** 2 +
        (pointPosition[2] - spherePosition[2]) ** 2,
    ) < sphereRadius
  )
}

const boxToBoxCollisionCheck3D = (box1: any, box2: any) => {
  // check for collision between 2 box shaped colliders
  const { isValid } = collisionCheckValidateArgs(box1, box2, ColliderShape.Box, ColliderShape.Box)

  if (!isValid) {
    return
  }

  const box1Size = box1.collider.boxSize
  if (!box1Size) {
    console.error(box1)
    throw new Error('missing box size for object 1')
  }

  const box2Size = box2.collider.boxSize
  if (!box2Size) {
    console.error(box2)
    throw new Error('missing box size for object 2')
  }

  // corner 1 (bottom-left-back corner)
  // box corner 2 (top-right-front corner)
  const box1Center = getColliderPosition3D(box1)
  const box1C1 = [box1Center[0] - box1Size[0] / 2, box1Center[1] - box1Size[1] / 2, box1Center[2] - box1Size[2] / 2]
  const box1C2 = [box1C1[0] + box1Size[0], box1C1[1] + box1Size[1], box1C1[2] + box1Size[2]]

  const box2Center = getColliderPosition3D(box2)
  const box2C1 = [box2Center[0] - box2Size[0] / 2, box2Center[1] - box2Size[1] / 2, box2Center[2] - box2Size[2] / 2]
  const box2C2 = [box2C1[0] + box2Size[0], box2C1[1] + box2Size[1], box2C1[2] + box2Size[2]]

  // for each axis, check if box1min < box2max and box2min < box1max
  // C1 holds all of the mins and C2 holds all of the maxs

  return (
    box1C1[0] < box2C2[0] &&
    box2C1[0] < box1C2[0] &&
    box1C1[1] < box2C2[1] &&
    box2C1[1] < box1C2[1] &&
    box1C1[2] < box2C2[2] &&
    box2C1[2] < box1C2[2]
  )
}

const boxToSphereCollisionCheck3D = (object1: any, object2: any) => {
  // check for collision between a box and a sphere shaped collider
  // the first argument must be a box and the second argument
  // must be a shpere

  const { outObject1, outObject2, isValid } = collisionCheckValidateArgs(
    object1,
    object2,
    ColliderShape.Box,
    ColliderShape.Sphere,
  )

  const box = outObject1
  const sphere = outObject2

  if (!isValid) {
    return
  }

  const boxSize = box.collider.boxSize
  if (!boxSize) {
    console.error(box)
    throw new Error('missing box size')
  }

  // corner 1 (bottom-left-back corner)
  // box corner 2 (top-right-front corner)
  // C1 holds all of the mins and C2 holds all of the maxs
  const boxCenter = getColliderPosition3D(box)
  const boxC1 = [boxCenter[0] - boxSize[0] / 2, boxCenter[1] - boxSize[1] / 2, boxCenter[2] - boxSize[2] / 2]
  const boxC2 = [boxC1[0] + boxSize[0], boxC1[1] + boxSize[1], boxC1[2] + boxSize[2]]

  const sphereRadius = sphere.collider.sphereRadius
  if (!sphereRadius) {
    console.error(sphere)
    throw new Error('missing shpere radius')
  }

  const spherePosition = getColliderPosition3D(sphere)

  // Every face of the box sits on a plane.
  // We can call the planes perpendicular to the x-axis the x-planes
  // the box has 2 x-planes: x-plane1 and x-plane2
  // check if sphere intersects with box's x-plane1, box's x-plane2,
  // or center is between the two planes
  // if this is true for x, y and z planes, they intersect
  const abs = Math.abs
  return (
    (abs(spherePosition[0] - boxC1[0]) < sphereRadius ||
      abs(spherePosition[0] - boxC2[0]) < sphereRadius ||
      (boxC1[0] < spherePosition[0] && spherePosition[0] < boxC2[0])) &&
    (abs(spherePosition[1] - boxC1[1]) < sphereRadius ||
      abs(spherePosition[1] - boxC2[1]) < sphereRadius ||
      (boxC1[1] < spherePosition[1] && spherePosition[1] < boxC2[1])) &&
    (abs(spherePosition[2] - boxC1[2]) < sphereRadius ||
      abs(spherePosition[2] - boxC2[2]) < sphereRadius ||
      (boxC1[2] < spherePosition[2] && spherePosition[2] < boxC2[2]))
  )
}

const sphereToSphereCollisionCheck3D = (sphere1: any, sphere2: any) => {
  // check for collision between 2 sphere shaped colliders

  const { isValid } = collisionCheckValidateArgs(sphere1, sphere2, ColliderShape.Sphere, ColliderShape.Sphere)

  if (!isValid) {
    return
  }

  const sphere1Radius = sphere1.collider.sphereRadius
  if (!sphere1Radius) {
    console.error('missing shpere1 radius')
    console.error(sphere1)
    return false
  }

  const sphere2Radius = sphere2.collider.sphereRadius
  if (!sphere2Radius) {
    console.error(sphere2)
    throw new Error('missing shpere2 radius')
  }

  const sphere1Position = getColliderPosition3D(sphere1)
  const sphere2Position = getColliderPosition3D(sphere2)

  return (
    Math.sqrt(
      (sphere1Position[0] - sphere2Position[0]) ** 2 +
        (sphere1Position[1] - sphere2Position[1]) ** 2 +
        (sphere1Position[2] - sphere2Position[2]) ** 2,
    ) <
    sphere1Radius + sphere2Radius
  )
}

// == helpers ==

const collisionCheckValidateArgs = (inObject1: any, inObject2: any, type1: ColliderShape, type2: ColliderShape) => {
  // make sure all objects exist, have colliders, and are in right order
  // return objects in correct order as well as if validate passed
  let isValid = true
  let outObject1 = inObject1
  let outObject2 = inObject2

  if (!inObject1 || !inObject2) {
    console.error('object1:', inObject1, 'object2:', inObject2)
    isValid = false
    throw new Error('an object is missing')
  }

  if (!inObject1.collider || !inObject2.collider) {
    console.error(inObject1, inObject2)
    isValid = false
    throw new Error('an object is missing a collider')
  }

  if (inObject1.collider.shape !== type1) {
    if (inObject2.collider.shape === type1 && type1 !== type2) {
      // arguments are probably in wrong order. switch
      outObject1 = inObject2
    } else {
      console.error(inObject1, inObject2)
      isValid = false
      throw new Error('object1 is not a ' + type1)
    }
  }

  if (inObject2.collider.shape !== type2) {
    if (inObject1.collider.shape === type2 && type1 !== type2) {
      // arguments are probably in wrong order. switch
      outObject2 = inObject1
    } else {
      console.error(inObject1, inObject2)
      isValid = false
      throw new Error('object2 is not a ' + type2)
    }
  }

  return {
    outObject1: outObject1,
    outObject2: outObject2,
    isValid: isValid,
  }
}

const getColliderPosition3D = (object: any) => {
  // get absolute position of a collider
  // by combining the object position with the collider offset

  if (!object.collider) {
    console.error(object)
    throw new Error('object did not have a collider')
  }
  if (!object.position) {
    console.error(object)
    throw new Error('object did not have a position')
  }

  const collider: Collider = object.collider
  const colliderOffset = collider.offset || [0, 0, 0]
  const position = object.position

  if (colliderOffset.length < 3) {
    console.error(colliderOffset)
    throw new Error('collider offset is invalid')
  }
  if (position.length < 3) {
    console.error(object.position)
    throw new Error('object position is invalid')
  }

  return [colliderOffset[0] + position[0], colliderOffset[1] + position[1], colliderOffset[2] + position[2]]
}

const collisionCheck = collisionCheck3D

const timer = {
  startTime: 0,
  endTime: 0,
  start: function () {
    this.startTime = Date.now()
  },
  stop: function () {
    this.endTime = Date.now()
    return this.endTime - this.startTime
  },
  reset: function () {
    this.startTime = 0
    this.endTime = 0
  },
}

export { collisionCheck, timer }
