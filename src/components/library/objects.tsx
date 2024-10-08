'use client';

import React, { useRef, useState, useEffect, useContext } from 'react';
// import { useSelector } from 'react-redux'
import { useFrame } from '@react-three/fiber';
import PropTypes from 'prop-types';
// import reduxStore from './reduxStore'
import { ZustandState, useZustandStore } from './zustandStore';

import { Collider, GameObjectData, ColliderShape, GameObjectType } from './interfaces';
import { LevelDataContext } from './contexts';

import { useLoader } from '@react-three/fiber';
// import { GLTFLoader } from './GLTFLoader.d';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/**
 * This function creates a new game object with the given properties.
 * @param props - The properties of the game object, including its position, rotation, size, speed, health, score value, collider, and whether it is an enemy.
 */
function GameObject(props: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number, number];
  speed?: number;
  health?: number;
  scoreValue?: number;
  collider?: Collider;
  showCollider?: boolean;
  isEnemy?: boolean;
  objectType?: GameObjectType;
  objectId?: string;
  color?: string;
  filePath?: string;
  filePathType?: string;
  type?: string;
}) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<any>();
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  const objectType = props.objectType || GameObjectType.Default;
  const size = props.size || [1, 1, 1];
  const position = props.position || [0, 0, 0];
  const rotation = props.rotation || [0, 0, 0];
  const id = props.objectId || 'object_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const speed = props.speed || 1;
  const health = props.health || 1;
  const scoreValue = props.scoreValue || 1;
  const collider: Collider = props.collider || {
    shape: ColliderShape.Box,
    boxSize: size,
    offset: [0, 0, 0],
  };
  const isEnemy = props.isEnemy || false;
  const addObject = useZustandStore((state: ZustandState) => state.addObject);
  const levelDataContext = useContext(LevelDataContext);

  const filePath = props.filePath || '';
  const type = props.type || 'defualt';

  useEffect(() => {
    // register myself into the store (should only happen once)
    console.log('regeristing object');
    const newObjectData: GameObjectData = {
      position: position,
      // object id is object_ + time created + random number
      id: id,
      rotation: rotation,
      size: size,
      speed: speed,
      health: health,
      objectType: objectType,
      scoreValue: scoreValue,
      collider: collider,
      isEnemy: isEnemy,
      parentLevelId: levelDataContext.id,
    };

    // console.log('parent data is ', JSON.stringify(levelDataContext, null, 4));
    if (type !== 'player') {
      addObject(newObjectData);
    }
  }, []);

  // Subscribe this component to the render-loop, rotate the mesh every frame
  // useFrame((_, delta) => {
  //   if (ref?.current?.rotation?.x) ref.current.rotation.x += delta;
  // });

  // Return the view, these are regular Threejs elements expressed in JSX
  const defaultColor = props.color || 'orange';

  // get this object data from store
  const objects: Map<string, GameObjectData> = useZustandStore((state: ZustandState) => state.gameObjectsMap);
  const thisObjectData: any = objects.get(id) || {};
  if (thisObjectData.destroyed) {
    return null;
  }

  if (filePath) {
    return <LoadModelFromFile {...props} filePath={filePath} />;
  }

  return (
    <mesh
      {...props}
      scale={1}
      onClick={() => click(!clicked)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      // gameObjectId={id}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={defaultColor} />
    </mesh>
  );
}

function LoadModelFromFile(props: { filePath: string; filePathType?: string }) {
  const filePath = props.filePath || '';
  const filePathType = props.filePathType || 'gltf';
  if (!filePath) {
    throw new Error('Invalid file path');
  }

  const objectFromFile = useLoader(GLTFLoader, filePath);

  if (!objectFromFile) {
    throw new Error('Failed to load file');
  }

  // console.log('object from file is', objectFromFile);

  return <primitive {...props} object={objectFromFile.scene.clone()} />;
}

function Enemy(props: any) {
  // create basic game object, but set 'isEnemy' to true by default
  let isEnemy = true;
  if (typeof props.isEnemy !== 'undefined') {
    isEnemy = props.isEnemy;
  }

  const objectType = props.objectType || 'enemy';

  delete props.isEnemy;
  delete props.objectType;

  return <GameObject {...props} isEnemy={isEnemy} objectType={objectType} />;
}

function Box(props: any) {
  // create a basic game object, but make the collider a box

  const size = props.size || [1, 1, 1];
  const collider: Collider = props.collider || {
    shape: ColliderShape.Box,
    boxSize: size,
    offset: [0, 0, 0],
  };

  return <GameObject {...props} collider={collider} objectType='box'></GameObject>;
}

function Ship(props: any) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef();
  const color = props.color || 'red';

  return (
    <mesh {...props} ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

Ship.propTypes = {
  color: PropTypes.string,
  position: PropTypes.array,
};

function Player(props: any) {
  const playerData = useZustandStore((state: any) => state.player);
  const playerPosition = playerData.position || [0, 0, 1];
  return <GameObject {...props} type='player' position={playerPosition} />;
}

function Projectile(props: any) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef();
  const color = props.color || 'yellow';

  return (
    <mesh {...props} ref={ref}>
      <boxGeometry args={[0.1, 0.5, 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

Projectile.propTypes = {
  color: PropTypes.string,
  position: PropTypes.array,
};

export { Box, Ship, Player, Projectile, GameObject, Enemy };
