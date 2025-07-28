import { Profiler, ProfilerOnRenderCallback, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Necho from './Necho';
import './index.css';

const handleRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
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
