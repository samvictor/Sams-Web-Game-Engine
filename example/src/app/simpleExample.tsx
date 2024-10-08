import Image from 'next/image';
import styles from './page.module.css';

// import { Canvas, Player, Box, GameObject, Game, Level, Enemy, BackgroundAdditionOptions } from '../../../src/index';
import { Canvas, Player, Box, GameObject, Game, Level, Enemy, BackgroundAdditionOptions } from 'sams-web-game-engine';

export default function SimpleExample() {
  const gameSettings: any = {
    background: 'black',
    backgroundAddition: BackgroundAdditionOptions.StarsMovingDown,
    overlayTextColor: 'white',
    levelFlow: ['level1', 'level2'],
  };

  const level1Settings = {
    id: 'level1',
    title: 'Level 1',
    startScreenBody: 'Defeat all enemies to win!',
    timeLimitSec: Infinity,
  };

  const level2Settings = {
    id: 'level2',
    title: 'Level 2',
    startScreenBody: 'Defeat the boss!',
  };

  return (
    <Game settings={gameSettings}>
      <Level settings={level1Settings}>
        <Canvas>
          <Enemy color={'green'} position={[0, 1, 0]} objectId='greenBox' />
          <Enemy
            color='red'
            objectId='redship'
            position={[5, 1, 0]}
            filePath='/3d_files/low_poly_space_ship/scene.gltf'
            rotation={[Math.PI / 2, 0, 0]}
            scale={[0.2, 0.2, 0.4]}
          />
          <Enemy color={'pink'} position={[-1, 1, 0]} objectId='pinkBox' size={[1.5, 0.5, 1.5]} />
          <Player
            filePath='/3d_files/low_poly_space_ship/scene.gltf'
            rotation={[-Math.PI / 2, 0, Math.PI]}
            scale={[0.2, 0.2, 0.4]}
          />
        </Canvas>
      </Level>
      <Level settings={level2Settings}>
        <Canvas>
          <Enemy color={'red'} objectId='boss' size={[3, 3, 3]} health={5} scoreValue={5} />
          <Player />
        </Canvas>
      </Level>
    </Game>
  );
}
