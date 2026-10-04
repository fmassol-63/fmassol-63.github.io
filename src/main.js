import './styles/main.css';
import cv from './data/cv.fr.json';
import uiAll from './data/ui.json';
import { initMotion } from './lib/motion.js';
import { renderFooter, renderPage } from './lib/render.js';
import { initTerminal } from './lib/terminal.js';
import { initVortex } from './lib/vortex.js';

const ui = uiAll.fr;

document.getElementById('content').innerHTML = renderPage(cv, ui);
document.getElementById('footer').innerHTML = renderFooter(cv.identity, ui);

initVortex(document.getElementById('vortex'));
initTerminal();
initMotion();
