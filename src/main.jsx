import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/big-shoulders-display/800';
import '@fontsource/big-shoulders-display/900';
import '@fontsource/jetbrains-mono/500';
import '@fontsource/jetbrains-mono/600';
import '@fontsource/manrope/400';
import '@fontsource/manrope/500';
import '@fontsource/manrope/800';
import './styles/tokens.css';
import './index.css';
import './styles/projects.css';
import './styles/controls.css';
import App from './App';
import { clock, startTimeFromUrl, T } from './three/timeline';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
clock.t = reduce ? T.end : startTimeFromUrl();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App reduceMotion={reduce} />
  </React.StrictMode>
);
