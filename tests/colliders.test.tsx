import * as React from 'react'
import { render } from '@testing-library/react'

import 'jest-canvas-mock'

import { collisionCheck } from '../src'
import { ColliderShape } from '../src/components/library/interfaces'

describe('Collisions', () => {
  test('miss evaluates to false', () => {
    const object1 = {
      position: [0, 2, 0],
      collider: {
        shape: ColliderShape.Sphere,
        sphereRadius: 1,
      },
    }

    const object2 = {
      position: [2, 0, 0],
      collider: {
        shape: ColliderShape.Sphere,
        sphereRadius: 1,
      },
    }

    expect(collisionCheck(object1, object2)).toBe(false)
  })

  test('hit evaluates to true', () => {
    const object1 = {
      position: [0, 1, 0],
      collider: {
        shape: ColliderShape.Sphere,
        sphereRadius: 1,
      },
    }

    const object2 = {
      position: [1, 0, 0],
      collider: {
        shape: ColliderShape.Sphere,
        sphereRadius: 1,
      },
    }

    expect(collisionCheck(object1, object2)).toBe(true)
  })
})
