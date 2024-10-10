// The Canvas receives inputs for player movements
// and helps render the GameObjects in the level
// Add GameObjects and a Player to your Canvas

'use client';

import React, { useState, useEffect } from 'react';
import { Canvas as ThreeCanvas, useFrame } from '@react-three/fiber';
import { Projectile } from './library/objects';
import { useMovePlayer, usePlayerShoot, useUpdateProjectiles } from './library/hooks';
import { useZustandStore, ZustandState } from './library/zustandStore';
import { StarsBackground } from './library/backgroundAdditions';
import { cssClassBase } from './library/constants';
import { ControlOptions, KeyboardControls, OnScreenControls } from './library/controls';
import { BackgroundAdditionOptions } from './library/interfaces';

// import {useZustandStore} from './library/zustandStore'

// const defaultSettings: any = {}

function Canvas(props: any) {
  // const settings = { ...defaultSettings, ...props.settings }

  const updateBullets = useUpdateProjectiles();
  const movePlayer = useMovePlayer();
  const playerShoot = usePlayerShoot();

  const controls = useZustandStore((state: ZustandState) => state.controls);

  function Updater() {
    useFrame((_, delta: number) => {
      if (controls.left) {
        movePlayer('left', delta);
      } else if (controls.right) {
        movePlayer('right', delta);
      }
      if (controls.shoot) {
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
      id={`${cssClassBase}-overlay`}
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

  // show background additions, if they're needed
  let backgroundAdditionXml = null;
  if (gameSettings?.backgroundAddition) {
    if (
      [
        BackgroundAdditionOptions.Stars,
        BackgroundAdditionOptions.StarsMovingDown,
        BackgroundAdditionOptions.StarsMovingUp,
        BackgroundAdditionOptions.StarsMovingLeft,
        BackgroundAdditionOptions.StarsMovingRight,
      ].includes(gameSettings.backgroundAddition)
    ) {
      backgroundAdditionXml = <StarsBackground direction={gameSettings.backgroundAddition} />;
    }
  }

  return (
    <div
      id={`${cssClassBase}-canvas`}
      style={{
        height: '100%',
      }}
    >
      <ThreeCanvas camera={{ position: [0, 0, 10] }}>
        <Updater />
        <KeyboardControls />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        {backgroundAdditionXml}

        <RenderBullets />
        {props.children}
      </ThreeCanvas>

      {overlayXml}
      <OnScreenControls />
    </div>
  );
}

export default Canvas;
