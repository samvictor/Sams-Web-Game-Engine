import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFrame } from '@react-three/fiber';


function Box(props) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef()
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current.rotation.x += delta))
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

function Ship(props) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef();
  const color = props.color || 'red';

  return (
    <mesh {...props}
            ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}


function PlayerShip(props) {
  const playerShipData = useSelector(state => state.playerShip);
  const playerPosition = playerShipData.position || [0, 0, 1];
  return <Ship color={'blue'} position={playerPosition}/>
}

function Bullet (props) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef();
  const color = props.color || 'yellow';

  return (
    <mesh {...props}
            ref={ref}>
      <boxGeometry args={[0.1, 0.5, 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}


export {Box, Ship, PlayerShip, Bullet};
