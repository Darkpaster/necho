import { Profiler, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Necho from './Necho';
import './index.css';

const handleRender = (
  id: any,
  phase: any,
  actualDuration: any,
  baseDuration: any,
  startTime: any,
  commitTime: any,
) => {
  console.log(
    `id: ${id}, phase: ${phase}, actualDuration: ${actualDuration}, baseDuration: ${baseDuration}, startTime: ${startTime}, commitTime: ${commitTime}`,
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Profiler id={'Necho'} onRender={handleRender}>
      <Necho />
    </Profiler>
  </StrictMode>,
);
