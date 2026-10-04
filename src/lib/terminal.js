// Terminal de l'accueil : « tape » les commandes puis affiche leurs sorties.
// Le texte complet est déjà dans le HTML ; avec « réduire les animations », il est affiché d'un coup.
// Les lignes non encore affichées sont seulement invisibles : la hauteur du bloc ne change pas.

const TYPE_DELAY_MS = 45;
const OUTPUT_DELAY_MS = 140;
const COMMAND_PAUSE_MS = 500;

/** Étapes d'animation : une par caractère de commande, une par ligne de sortie. */
export function buildSteps(lines) {
  const steps = [];
  lines.forEach((line, index) => {
    if (line.command === undefined) {
      steps.push({ index, delay: OUTPUT_DELAY_MS });
      return;
    }
    steps.push({ index, text: '', delay: COMMAND_PAUSE_MS });
    for (let i = 1; i <= line.command.length; i++) {
      steps.push({ index, text: line.command.slice(0, i), delay: TYPE_DELAY_MS });
    }
  });
  return steps;
}

export function initTerminal(root = document) {
  const terminal = root.querySelector('[data-terminal]');
  if (!terminal) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    terminal.classList.add('is-done');
    return;
  }

  const elements = [...terminal.querySelectorAll('.terminal__line')];
  const lines = elements.map((element) => {
    const cmd = element.querySelector('.terminal__cmd');
    return { element, cmd, command: cmd?.textContent };
  });
  const steps = buildSteps(lines);

  terminal.classList.add('is-typing');
  lines.forEach(({ cmd }) => cmd && (cmd.textContent = ''));

  let position = 0;
  function next() {
    if (position >= steps.length) {
      terminal.classList.replace('is-typing', 'is-done');
      return;
    }
    const step = steps[position++];
    const line = lines[step.index];
    line.element.classList.add('is-shown');
    line.element.append(terminal.querySelector('.terminal__cursor'));
    if (step.text !== undefined) line.cmd.textContent = step.text;
    setTimeout(next, step.delay);
  }
  setTimeout(next, 300);
}
