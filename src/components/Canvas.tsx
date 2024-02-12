// The Canvas is the entry point for your game
// It holds all of the data and does most of the processing
// Start with a Canvas and add other components to it

'use client';

import React, { useState, useEffect } from 'react';
import { Canvas as ThreeCanvas, useFrame } from '@react-three/fiber';
// import { useSelector } from 'react-redux'
// import reduxStore from './library/reduxStore';
import { Projectile } from './library/objects';
import { useMovePlayer, usePlayerShoot, useUpdateProjectiles } from './library/hooks';
import { useZustandStore, ZustandState } from './library/zustandStore';

// import { Provider } from 'react-redux'
// import {useZustandStore} from './library/zustandStore'

// const defaultSettings: any = {}

function CanvasNoProv(props: any) {
  // const settings = { ...defaultSettings, ...props.settings }

  const movePlayer = useMovePlayer();
  const playerShoot = usePlayerShoot();
  const updateBullets = useUpdateProjectiles();

  const keys: any = {
    KeyW: 'up',
    KeyS: 'down',
    KeyA: 'left',
    KeyD: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    Space: 'shoot',
  };

  const moveFieldByKey = (key: any) => keys[key];

  const [movement, setMovement] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      setMovement((m) => ({ ...m, [moveFieldByKey(e.code)]: true }));
    };
    const handleKeyUp = (e: any) => {
      setMovement((m: any) => ({ ...m, [moveFieldByKey(e.code)]: false }));
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  function Updater() {
    useFrame((_, delta: number) => {
      if (movement.left) {
        movePlayer('left', delta);
      } else if (movement.right) {
        movePlayer('right', delta);
      }
      if (movement.shoot) {
        playerShoot();
      }

      updateBullets(delta);
    });

    return <mesh />;
  }

  const bullets = useZustandStore((state: ZustandState) => state.projectiles);
  const projectilesUpdater = useZustandStore((state: ZustandState) => state.projectilesUpdater);

  function RenderBullets() {
    const bulletsXml: any[] = [];

    bullets.forEach((thisBullet: any) => {
      bulletsXml.push(<Projectile position={thisBullet.position} key={'bullet_' + thisBullet.id} />);
    });

    return bulletsXml;
  }

  // make overlay
  const gameSettings = useZustandStore((state: ZustandState) => state.gameSettings);
  const currentLevelData = useZustandStore((state: ZustandState) => state.currentLevelData);

  const overlayXml: any = (
    <div
      id='webGameEngineOverlay'
      style={{
        color: gameSettings.overlayTextColor,
        position: 'fixed',
        top: 0,
        padding: '20px',
      }}
    >
      Score: {currentLevelData.score}
      Time Left: {currentLevelData.timeLeftSec}
    </div>
  );

  return (
    <div
      id='webGameEngineCanvas'
      style={{
        height: '100%',
      }}
    >
      <ThreeCanvas camera={{ position: [0, 0, 10] }}>
        <Updater />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <RenderBullets />
        {props.children}
      </ThreeCanvas>

      {overlayXml}
    </div>
  );
}

const Canvas = (props: any) => <CanvasNoProv {...props} />;

export default Canvas;
