'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useFrame } from '@react-three/fiber'
import PropTypes from 'prop-types'
import reduxStore from './reduxStore'

import {Collider} from './interfaces';


function Box(props: any) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<any>()
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)

  const position = props.position || [0, 0, 0]
  const rotation = props.rotation || [0, 0, 0]
  const id = props.id || 'object_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
  const speed = props.speed || 1
  const health = props.health|| 1
  const collider:Collider = props.collider || {
                            shape: "box",
                            boxSize: [1, 1, 1],
                            offset: [0, 0, 0],
                          };

  useEffect(() => {
    const newObjectData = {
      position: position,
      // object id is object_ + time created + random number
      id: id,
      rotation: rotation,
      speed: speed,
      health: health,
      collider: collider,
    }

    reduxStore.dispatch({ type: 'addObject', value: newObjectData })
  }, [] );


  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((_, delta) => {
    if (ref?.current?.rotation?.x) ref.current.rotation.x += delta
  })
  // Return the view, these are regular Threejs elements expressed in JSX
  const defaultColor = props.color || "orange";


  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={() => click(!clicked)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      gameObjectId={id}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : defaultColor} />
    </mesh>
  )
}

function Ship(props: any) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef()
  const color = props.color || 'red'

  return (
    <mesh {...props} ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

Ship.propTypes = {
  color: PropTypes.string,
  position: PropTypes.array,
}

function PlayerShip() {
  const playerShipData = useSelector((state: any) => state.playerShip)
  const playerPosition = playerShipData.position || [0, 0, 1]
  return <Ship color={'blue'} position={playerPosition} />
}

function Bullet(props: any) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef()
  const color = props.color || 'yellow'

  return (
    <mesh {...props} ref={ref}>
      <boxGeometry args={[0.1, 0.5, 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

Bullet.propTypes = {
  color: PropTypes.string,
  position: PropTypes.array,
}

export { Box, Ship, PlayerShip, Bullet }
