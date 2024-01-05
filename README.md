# Sams Web Game Engine
This library makes it easier to make web-based games.

Designed for 3rd person, side scroller games that use 3D models.
Powered by React Three Fiber.

This library is designed for games that use 3D assets, but 2D movement
(e.g. side scrollers, tetris, galaga).


## Features:
* Movement
* Collisions
* Fire projectiles
* Menus
* Play flow
* Power ups
* Enemy AI
* Difficulty levels
* Scale difficulty based on player skill
* Score/high score management
* Light weight
* Easy to use

## Future Features:
* Use LLM for quest text generation and level design
* AI controlled allies/teammates


## Canvas
The Canvas is the entry point for your game.
It holds all of the data and does most of the processing.
Start with a Canvas and add other components to it.

```tsx
import { Canvas } from 'sams-web-game-engine';

const gameSettings:any = {
  background: 'white'
}

return (
  <Canvas settings={gameSettings}>
    ...
  </Canvas>
)
```

Use the `settings` argument to choose your game settings.
 * background - anything that can be used as a value for the background property in CSS. 'transparent' by default.
 * gravity - up, down, left, right, or none. 'none' by default.
 * travelDirection: up, down, left, right, or none. 'up' by default.

`Canvas` is based on `Canvas` from React Three Fiber, so anything that will work in that Canvas should also work in this Canvas, but there may be compatibility issues when not using components from this package.  

This is the notation for positions: `[x, y, z]`. `[0, 0, 0]` is the center of the screen.
The x-axis is the horizontal axis. It increases to the right.
The y-axis is the vertical axis. It increases upwards.
The z-axis is the axis that goes into  and out of the screen. It increases out of the screen towards the camera.


## Game Objects
Game Objects are general objects that you can put on the `Canvas`.


```tsx
import { Canvas, Object } from 'sams-web-game-engine';

return (
  <Canvas>
    <Object position={[1.2, 0, 0]} />
    <Object color={'red'} />
  </Canvas>
)
```

Supported arguments:
 * color - color names or hex notation.
 * position - x, y, and z components of object position. [0, 0, 0] by default.
 This is the position of the center of the object.
 * size - x, y, and z components of object sie. [1, 1, 1] by default.


## Player
A player is essentially an extension of a game object. The only difference is that user inputs affect the player object.

```tsx
import { Canvas, Player } from 'sams-web-game-engine';

return (
  <Canvas>
    <Player />
  </Canvas>
)
```


## Colliders
Colliders are used to detect when two objects touch.
(e.g. player touches a power-up, bullet touches enemy). Every object has a collider by default, but you can provide your own collider if you'd like.

``` tsx
import { Canvas, Object, Collider } from 'sams-web-game-engine';

const myCollider:Collider = {
  shape: 'box',
  boxSize: [1, 1, 1],
  offset: [0, 0, 0],
  visible: true,
}

return (
  <Canvas>
    <Object collider={myCollider} />
  </Canvas>
)

```


Supported values:
 * **shape** - (required) point, box, cylinder, sphere. "box" by default
 * **boxSize** - Must be, and should only be used with box shape. x, y, and z components of collider size. "[1, 1, 1]" by default.
 * **boxRotation** - (future) Must be, and should only be used with box shape. x, y, and z components of collider rotation. "[0, 0, 0]" by default.
 * **cylinderSize** - Must be, and should only be used with cylinder shape. radius and height components of collider size. "[1, 1]" by default.
 * **cylinderRotation** - (future) Must be, and should only be used with cylinder shape. x, y, and z components of collider rotation. "[0, 0, 0]" by default.
 * **cylinderOrientation** - (future) Must be, and should only be used with cylinder shape. Orientation of the cylinder. Which axis is the height of the cylinder parallel to? x, y, or z. "x" by default.
 * **sphereRadius** - Must be, and should only be used with sphere shape. Radius of collider. "1" by default.
 * **offset** - (required) x, y, and z components of collider position offset. "[0, 0, 0]" by default.
 * **visible** - Only designed for testing purposes. This option lets you see where the collider will be, even though it's usually invisible. "false" by default.
