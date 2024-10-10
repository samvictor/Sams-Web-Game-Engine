// This file handles all of the controls options for the game

'use client';

import React, { useState, useEffect } from 'react';
import { Canvas as ThreeCanvas, useFrame } from '@react-three/fiber';
import { Projectile } from './objects';
import { useMovePlayer, usePlayerShoot, useUpdateProjectiles } from './hooks';
import { useZustandStore, ZustandState } from './zustandStore';
import { StarsBackground } from './backgroundAdditions';
import { cssClassBase } from './constants';
import { ControlOptions } from './interfaces';

function KeyboardControls() {
  const updateControls = useZustandStore((state: ZustandState) => state.updateControls);

  const codeToControlId: any = {
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

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      const moveFieldChanged = codeToControlId[e.code];
      console.log(moveFieldChanged, 'pressed at', Date.now());
      updateControls({ [moveFieldChanged]: true });
    };
    const handleKeyUp = (e: any) => {
      const moveFieldChanged = codeToControlId[e.code];
      updateControls({ [moveFieldChanged]: false });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return <></>;
}

function OnScreenControls(this: any) {
  const updateControls = useZustandStore((state: ZustandState) => state.updateControls);

  const buttonsXml = ['left', 'right', 'shoot'].map((direction) => (
    <button
      onTouchStart={updateControls.bind(this, { [direction]: true })}
      onTouchEnd={updateControls.bind(this, { [direction]: false })}
      onMouseDown={updateControls.bind(this, { [direction]: true })}
      onMouseUp={updateControls.bind(this, { [direction]: false })}
      style={{
        margin: '20px',
      }}
      key={direction + '_button'}
    >
      {direction.toUpperCase()}
    </button>
  ));

  const leftSideControls = buttonsXml.slice(0, 2);
  const rightSideControls = buttonsXml[2];

  return (
    <>
      <div
        id={`${cssClassBase}-onscreen-controls`}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
        }}
      >
        {leftSideControls}
      </div>
      <div
        id={`${cssClassBase}-onscreen-controls`}
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
        }}
      >
        {rightSideControls}
      </div>
    </>
  );
}

export { KeyboardControls, OnScreenControls, ControlOptions };
