//  uiUpdates.js

/*============// UI Updates //============
  1. update UI function
  2. Volume & seeker-bar updates functions
  3. Updates timestamps functions
  5. Updates seeker global function
  6. Updates the icons & text functions
  7. checkIfVertical: Checks the video's vertical aspect ratio
  10. resizeCanvas: Resizes the canvas
  11. renderCanvas: Renders the video on the canvas
  ======================================== */

import { config } from './OpenSourcePlayer.js';
import { svgIcons } from './controls.js';
import stateMachine, { states } from './stateMachine.js';
import playerManager from './PlayerManager.js';

let updateUITimer;

// Main UI update function
export async function updateUI(video, controls) {
  if (!video) return;

  if (updateUITimer) {
    cancelAnimationFrame(updateUITimer);
  }

  const { seekerBar, volumeBar, muteBtn } = controls;

  if (muteBtn) {
    if (video.volume > 0) {
      video.muted = false;
    } else {
      video.muted = true;
    }
  }

  if (playerManager.getActivePlayer(video) === video) {
    if (config.useSvgIcons) {
      updateSvgIcons(video, controls, svgIcons);
    } else {
      updateTextContent(video, controls);
    }
  }

  updateUITimer = requestAnimationFrame(() => {
    updateSeekerBar(video, seekerBar, controls);
    updateVolumeBar(video, volumeBar);
    updateTimestamps(video, controls);
  });
}

// Bars & timestamps
async function updateSeekerBar(video, seekerBar, controls) {
  if (!video) return;
  
  if (stateMachine.getState('seeking') === states.SEEKING) return;

  if (seekerBar) {
    const currentTime = parseFloat(video.currentTime);
    const duration = parseFloat(video.duration);
    const currentPercentage = ((currentTime / duration) * 100).toFixed(1);
    const bufferedEnd = video.buffered.length > 0 ? ((video.buffered.end(video.buffered.length - 1) / duration) * 100).toFixed(1) : 0;
    
    if (currentTime === 0) {
      seekerBar.style.borderRadius = '5px 0 0 5px';
    } else if (currentTime === duration) {
      seekerBar.style.borderRadius = '0 5px 5px 0';
    } else {
      seekerBar.style.borderRadius = 'initial';
    }

    seekerBar.value = isNaN(currentPercentage) ? 0 : currentPercentage;
    seekerBar.style.setProperty('--buffered-percentage', `${bufferedEnd}%`);
    updateSliderBackground(seekerBar);
  }

  if (stateMachine.getState('playback') === states.PLAYING) {
    updateUITimer = requestAnimationFrame(() => updateUI(video, controls));
  }
}

// Volume bar
async function updateVolumeBar(video, volumeBar) {
  if (playerManager.getActivePlayer(video) !== video) return;

  if (volumeBar) {
    volumeBar.value = video.volume;
    if (video.volume > 0) {
      sessionStorage.setItem('videoVolume', video.volume);
    }
    updateSliderBackground(volumeBar);
  }
}

// Timestamps
export async function updateTimestamps(video, controls) {
  const { timestamp, timelength } = controls;
  const currentTime = video.currentTime;
  const duration = video.duration;

  if (timestamp && timelength) {
    timestamp.textContent = isNaN(currentTime) ? '' : formatTime(Number(currentTime));
    timelength.textContent = isNaN(duration) ? '00:00' : formatTime(Number(duration));
  }
}

// Updates the background left of the seekers 'head' / the already played video.
export async function updateSliderBackground(slider) {
  if (!slider) return;

  const value = parseFloat(slider.value);
  const min = parseFloat(slider.min) || 0.0;
  const max = parseFloat(slider.max) || 100.0;
  const percentage = (((value - min) / (max - min)) * 100).toFixed(1);

  slider.style.setProperty('--current-percentage', `${percentage}%`);
}

// Helpers
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Update Svg icons and buttons
export async function updateSvgIcons(video, controls, svgIcons) {
  const { playPauseBtn, muteBtn, cinematicModeBtn, fullScreenBtn } = controls;
  const isCinematicMode = stateMachine.getState('cinematicMode') === states.CINEMATIC_MODE;
  const isFullscreen = stateMachine.getState('fullscreen') === states.FULLSCREEN;

  const updates = [
    { button: playPauseBtn, iconId: video.paused ? svgIcons.play : svgIcons.pause },
    { button: muteBtn, iconId: video.muted ? svgIcons.mute : svgIcons.volumeUp },
    { button: cinematicModeBtn, iconId: isCinematicMode ? svgIcons.cinemaModeQ : svgIcons.cinemaMode },
    { button: fullScreenBtn, iconId: isFullscreen ? svgIcons.fullscreenExit : svgIcons.fullscreen }
  ];

  for (const { button, iconId } of updates) {
    if (button) {
      updateButtonIcon(button, iconId);
    }
  }
}

export async function updateButtonIcon(button, iconId) {
  try {
    let svgElement = button.querySelector('svg');
    let useElement;

    if (!svgElement) {
      svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      svgElement.appendChild(useElement);
      svgElement.setAttribute('aria-hidden', 'false');
      svgElement.setAttribute('focusable', 'false');
      button.innerHTML = '';
      button.appendChild(svgElement);
    } else {
      useElement = svgElement.querySelector('use');
    }

    useElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', iconId);
  } catch (error) {
    console.error(`Error loading SVG icon: ${error}`);
  }
}

// Update Text content
function updateTextContent(video, controls) {
  const { playPauseBtn, muteBtn, cinematicModeBtn, fullScreenBtn } = controls;
  const isCinematicMode = stateMachine.getState('cinematicMode') === states.CINEMATIC_MODE;
  const isFullscreen = stateMachine.getState('fullscreen') === states.FULLSCREEN;
  
  if (playPauseBtn) playPauseBtn.textContent = video.paused ? "►" : "❚❚";
  if (muteBtn) muteBtn.textContent = video.muted ? '🔇' : '🔊';
  if (cinematicModeBtn) cinematicModeBtn.style.filter = isCinematicMode ? "grayscale(100%)" : "none";
  if (fullScreenBtn) fullScreenBtn.textContent = isFullscreen ? '⧈' : '⛶';
}

// Check if the video is vertical
export function checkIfVertical(video) {
  let isVertical = false;
  if (!config.useVerticalVidFill) return;
  if (!video || playerManager.getActivePlayer(video) !== video) return;

  const videoAspect = video.videoHeight / video.videoWidth;
  isVertical = videoAspect > 1;
  return isVertical;
}

// Resize the canvas
export function resizeCanvas(container) {
  if (!config.useVerticalVidFill) return;
  if (!container) return;

  let canvas = container.querySelector('.osp-player-background');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.classList.add('osp-player-background');
    container.prepend(canvas);
    const ctx = canvas.getContext('2d');
    container.canvasContext = ctx;
  }

  const width = container.clientWidth;
  const height = container.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

// Render the video on the canvas
export function renderCanvas(video, container) {
  if (!config.useVerticalVidFill) return;
  if (!video || playerManager.getActivePlayer(video) !== video) return;
  if (!checkIfVertical(video)) return;

  const canvas = container.querySelector('.osp-player-background');
  const ctx = container.canvasContext;
  if (!canvas || !ctx) return;

  video.style.background = 'transparent';

  if (!video.paused && !video.ended && playerManager.getActivePlayer(video) === video) {
    requestAnimationFrame(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      renderCanvas(video, container);
    });
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
}