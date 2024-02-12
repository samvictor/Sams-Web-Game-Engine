'use client';

import React, { useState } from 'react';

type Props = {
  value?: number;
};
const Test = ({ value = 0 }: Props) => {
  const [counter, setCounter] = useState(value);

  const onMinus = () => {
    setCounter((prev) => prev - 1);
  };

  const onPlus = () => {
    setCounter((prev) => prev + 1);
  };

  return (
    <div>
      <h1>Counter: {counter}</h1>
      <button onClick={onMinus}>-</button>
      <button onClick={onPlus}>+</button>
      version 0.1.3
    </div>
  );
};

// const Canvas = () => {
//   return (
//       <div id='parent'
//             style={{ position: 'relative', width: '100vw', height: '100vh' }}>
//         <Canvas camera={{position: [0, 0, 10]}}>
//           <Updater/>
//           <ambientLight />
//           <pointLight position={[10, 10, 10]} />
//           <Box position={[-1.2, 0, 0]} />
//           <Box position={[1.2, 0, 0]} />
//           <Ship/>
//           <RenderBullets/>
//           <PlayerShip />
//         </Canvas>
//         <Test/>
//       </div>
//   );
// }

export default Test;
