import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProductBuilderApp } from './ProductBuilderApp';
import './styles.css';

const el = document.getElementById('pb-root')!;
createRoot(el).render(
  <StrictMode>
    <ProductBuilderApp />
  </StrictMode>
);
