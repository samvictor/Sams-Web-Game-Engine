import * as React from 'react'
import { render } from '@testing-library/react'

import 'jest-canvas-mock'

import { Canvas, Player, Game, Level, Enemy } from '../src'

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

describe('Common render', () => {
  it('renders without crashing', () => {
    render(
      <Game>
        <Level>
          <Canvas>
            <Enemy color={'red'} objectId='redbox' />
            <Enemy color={'green'} position={[1, 1, 0]} objectId='greenBox' />
            <Enemy color={'pink'} position={[-1, 1, 0]} objectId='pinkBox' size={[1.5, 0.5, 1.5]} />
            <Player />
          </Canvas>
        </Level>
      </Game>,
    )
  })
})
