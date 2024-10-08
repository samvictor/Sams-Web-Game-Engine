import * as React from 'react';
// import { render } from '@testing-library/react';

import 'jest-canvas-mock';

import { Canvas, Player, Game, Level, Enemy } from '../src';
import { GameState, LevelState } from '../src/components/library/interfaces';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('placeholder', () => {
  it('holds a place', () => {
    expect(1).toBe(1);
  });
});

// describe('Common render', () => {
//   it('renders start screen', () => {
//     render(
//       <Game>
//         <Level>
//           <Canvas>
//             <Enemy color={'red'} objectId='redbox' />
//             <Enemy color={'green'} position={[1, 1, 0]} objectId='greenBox' />
//             <Enemy color={'pink'} position={[-1, 1, 0]} objectId='pinkBox' size={[1.5, 0.5, 1.5]} />
//             <Player />
//           </Canvas>
//         </Level>
//       </Game>,
//     );
//   });

//   it('renders normal play', () => {
//     render(
//       <Game settings={{ gameState: GameState.NormalPlay }}>
//         <Level settings={{ levelState: LevelState.NormalPlay }}>
//           <Canvas>
//             <Enemy color={'red'} objectId='redbox' />
//             <Enemy color={'green'} position={[1, 1, 0]} objectId='greenBox' />
//             <Enemy color={'pink'} position={[-1, 1, 0]} objectId='pinkBox' size={[1.5, 0.5, 1.5]} />
//             <Player />
//           </Canvas>
//         </Level>
//       </Game>,
//     );
//   });
// });

// future tests
// damage objects, check damaged,
// start game, restart game, check settings match
