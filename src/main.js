import './styles/main.css';
import cv from './data/cv.fr.json';
import uiAll from './data/ui.json';
import { renderFooter, renderPage } from './lib/render.js';
import { initVortex } from './lib/vortex.js';

const ui = uiAll.fr;

document.getElementById('content').innerHTML = renderPage(cv, ui);
document.getElementById('footer').innerHTML = renderFooter(cv.identity, ui);

initVortex(document.getElementById('vortex'));
