const collisionCheck3D = (object1:any, object2:any) => {
  // are these objects currently colliding?
  // all objects must have a collider
  if (!object1.collider || !object2.collider) {
    console.error("an object is missing a collider");
    console.log(object1, object2);
    return;
  }

  
}

const collisionCheck = collisionCheck3D;

export { collisionCheck }
