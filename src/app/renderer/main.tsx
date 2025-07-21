import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Necho from './Necho';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Necho />
  </StrictMode>,
)