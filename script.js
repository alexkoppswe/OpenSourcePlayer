import { initializePlayer } from './js/modules/OpenSourcePlayer.js';

document.addEventListener('DOMContentLoaded', () => {
  initializePlayer();

  // [Optional.] Dark-mode (remove css variables as well if not needed.)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', checkColorScheme);

  function checkColorScheme() {
    const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }
  checkColorScheme();
});