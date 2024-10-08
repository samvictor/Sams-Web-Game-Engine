import React, { useRef, useState, useEffect, useContext, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackgroundAdditionOptions } from './interfaces';
import { MeshBasicMaterial, SphereGeometry, Vector3 } from 'three';

function StarsBackground({ direction = BackgroundAdditionOptions.StarsMovingDown, speed = 80, numStars = 20 }) {
  // Field of stars for a background.
  // const ref = useRef();
  const maxX = 50;
  const minX = -50;
  const maxY = 20;
  const minY = -20;
  const maxZ = -2;
  const minZ = -20;

  // generate random positions for stars
  const [starPositionsXY, updateStarPositionsXY] = useState<number[][]>([]);
  const [starPositionsUpdater, changeStarPositionsUpdater] = useState(0);

  useEffect(() => {
    console.log('starting effect');
    const tempStarPositionsXY = [];
    for (let i = 0; i < numStars; i++) {
      tempStarPositionsXY.push([
        Math.random() * (maxX - minX) + minX, // x
        Math.random() * (maxY - minY) + minY, // y
        Math.random() * (maxZ - minZ) + minZ, // z
      ]);
    }

    updateStarPositionsXY(tempStarPositionsXY);
    changeStarPositionsUpdater(Date.now());

    console.log('new star positions are', tempStarPositionsXY);
  }, []);

  console.log('star positions', starPositionsXY);

  useFrame((_, delta) => {
    if (!starPositions || starPositions.length === 0) {
      return;
    }

    const newStarPositionsXY: number[][] = starPositionsXY.map((pos: number[]) => {
      // increment the position of each star
      switch (direction) {
        case BackgroundAdditionOptions.StarsMovingUp:
          if (pos[1] > maxY) {
            // star has moved off top of screen. Move it back down to bottom
            return [Math.random() * (maxX - minX) + minX, minY, pos[2]];
          }
          return [pos[0], pos[1] + delta * speed, pos[2]];
        case BackgroundAdditionOptions.StarsMovingDown:
          if (pos[1] < minY) {
            return [Math.random() * (maxX - minX) + minX, maxY, pos[2]];
          }
          return [pos[0], pos[1] - delta * speed, pos[2]];
        case BackgroundAdditionOptions.StarsMovingRight:
          if (pos[0] > maxX) {
            return [minX, Math.random() * (maxY - minY) + minY, pos[2]];
          }
          return [pos[0] + delta * speed, pos[1], pos[2]];
        case BackgroundAdditionOptions.StarsMovingLeft:
          if (pos[0] < minX) {
            return [maxX, Math.random() * (maxY - minY) + minY, pos[2]];
          }
          return [pos[0] - delta * speed, pos[1], pos[2]];

        default:
          return pos;
      }
    });

    updateStarPositionsXY(newStarPositionsXY);
    changeStarPositionsUpdater(Date.now());
  });

  // turning a simple list of lists into a list of Vector3's with a consistent z value
  const starPositions = starPositionsXY.map((inList) => new Vector3(inList[0], inList[1], inList[2]));

  const starGeometry = useMemo(() => new SphereGeometry(0.05, 5, 4), []);
  const starMaterial = useMemo(() => new MeshBasicMaterial({ color: 'white' }), []);
  return starPositions.map((pos, index) => (
    <mesh geometry={starGeometry} material={starMaterial} position={pos} key={'star_' + index} />
  ));
}

export { StarsBackground };
