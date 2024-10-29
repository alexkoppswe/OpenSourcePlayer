//  controls.js

/*===========// Controls //===========
  1. Svg icons paths
  2. Setup video controls function
  3. Create player UI function
  4. Insert SVG icons function
  5. Set button text content function
  ==================================== */

import { config } from './OpenSourcePlayer.js';
import { initializeContextMenu } from './contextMenu.js';
import { updateButtonIcon } from './uiUpdates.js';

// SVG icons paths
const iconPath = 'assets/icons.svg';
export const svgIcons = {
  src: iconPath,
  play: `${iconPath}#icon-play`,
  pause: `${iconPath}#icon-pause`,
  volumeUp: `${iconPath}#icon-volume-up`,
  volumeDown: `${iconPath}#icon-volume-down`,
  mute: `${iconPath}#icon-mute`,
  fullscreen: `${iconPath}#icon-fullscreen`,
  fullscreenExit: `${iconPath}#icon-fullscreen-exit`,
  cinemaMode: `${iconPath}#icon-lightlamp`,
  cinemaModeQ: `${iconPath}#icon-lamp`,
  settings: `${iconPath}#icon-settings`,
  subtitle: `${iconPath}#icon-subtitle`
};

// Setup video controls
export async function setupVideoControls(video, playerContainer) {
  if (!video || !playerContainer) {
    console.error("Required video elements not found");
    return;
  }

  try {
    let controls = playerContainer.querySelector('.osp-controls-outter') ? await getExistingControls(playerContainer) : await createPlayerUI(playerContainer);

    if (!config.useSettings && controls.settingsButton  || video.tagName === 'AUDIO') controls.settingsButton.style.display = 'none';
    if (config.useContextMenu && video.tagName === 'VIDEO') initializeContextMenu(video, playerContainer, controls.videoControls);
    if (!config.useCinematicMode && controls.cinematicModeBtn) controls.cinematicModeBtn.style.display = 'none';
    if(config.useSubtitles && controls.subtitleButton) {
      const subtitle = video.getAttribute('data-subtitle-src');
      if (subtitle) {
        controls.subtitleButton.style.display = 'block';
      }
    }

    if (config.useSvgIcons) {
      insertSvgIcons(controls); // Insert SVG icons
    } else {
      setButtonTextContent(controls); // Set Text content
    }

    return controls;
  } catch (error) {
    console.error("An error occurred while loading UI:", error);
  }
}

// Create player HTML UI
async function createPlayerUI(playerContainer) {
  try {
    const videoControlsHtml = `
      <div class="osp-loading-display"></div>
      <span class="osp-message-display"></span>
      <div class="osp-controls-outter">
        <div class="osp-seeker-bar-container">
          <input class="osp-seeker-bar" type="range" min="0" max="100" value="0" step="0.1" aria-label="Seeker" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        </div>
        <div class="osp-controls-inner">
          <span class="osp-button osp-play-pause" role="button" tabindex="0" aria-label="Play"></span>
          <span class="osp-timestamp" aria-live="off"><time datetime="PT0S">00:00</time></span>
          <span class="osp-button osp-mute" role="button" tabindex="0" title="Mute (M)" aria-label="Mute"></span>
          <input class="osp-volume-bar" type="range" min="0" max="1" step="0.1" value="1" aria-label="Volume" aria-valuemin="0" aria-valuemax="1" aria-valuenow="1">
          <span class="osp-padding"></span>
          <span class="osp-time-length" aria-live="off"><time datetime="PT0S">00:00</time></span>
          <div class="osp-settings-outter">
            <div class="osp-settings">
              <span class="osp-button osp-cinema-button" role="button" tabindex="0" title="Cinematic Mode (C)" aria-label="Cinematic Mode"></span>
              <span class="osp-button osp-subtitle" role="button" tabindex="0" title="Subtitle (S)" aria-label="Subtitle"></span>
            </div>
            <span class="osp-button osp-settings-button" role="button" tabindex="0" title="Settings (T)" aria-label="Settings"></span>
          </div>
          <span class="osp-button osp-fullscreen" role="button" tabindex="0" title="Fullscreen (F)" aria-label="Fullscreen"></span>
        </div>
      </div>
    `;

    const videoControlsElement = document.createElement('div');
    videoControlsElement.innerHTML = videoControlsHtml;
    playerContainer.appendChild(videoControlsElement);

    return getExistingControls(playerContainer);
  } catch (error) {
    console.error("An error occurred while creating player UI:", error);
  }
}

// Get existing controls from the DOM
export async function getExistingControls(playerContainer) {
  return {
    videoControls: playerContainer.querySelector('.osp-controls-outter'),
    playPauseBtn: playerContainer.querySelector('.osp-play-pause'),
    muteBtn: playerContainer.querySelector('.osp-mute'),
    fullScreenBtn: playerContainer.querySelector('.osp-fullscreen'),
    cinematicModeBtn: playerContainer.querySelector('.osp-cinema-button'),
    subtitleButton: playerContainer.querySelector('.osp-subtitle'),
    settingsButton: playerContainer.querySelector('.osp-settings-button'),
    settingsMenu: playerContainer.querySelector('.osp-settings'),
    volumeBar: playerContainer.querySelector('.osp-volume-bar'),
    seekerBar: playerContainer.querySelector('.osp-seeker-bar'),
    timestamp: playerContainer.querySelector('.osp-timestamp'),
    timelength: playerContainer.querySelector('.osp-time-length'),
    loadingDisplay: playerContainer.querySelector('.osp-loading-display'),
    messageDisplay: playerContainer.querySelector('.osp-message-display')
  };
}

// Insert SVG icons
export async function insertSvgIcons(controls) {
  if (!config.useSvgIcons) return;

  const { playPauseBtn, muteBtn, fullScreenBtn, cinematicModeBtn, settingsButton, subtitleButton } = controls;

  // [Optional.] Fetch SVG icons to check MIME type
  /*try {
    const response = await fetch(svgIcons.src);
    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('image/svg+xml')) {
      console.error(`Invalid MIME type for ${svgIcons.src}: ${contentType}`);
    }
  } catch (error) {
    console.error(`Failed to fetch ${svgIcons.src}:`, error);
  }*/

    const buttons = {
      play: playPauseBtn,
      volumeUp: muteBtn,
      fullscreen: fullScreenBtn,
      cinemaMode: cinematicModeBtn,
      settings: settingsButton,
      subtitle: subtitleButton
    };

  try {
    for (const [key, iconId] of Object.entries(svgIcons)) {
      if (buttons[key]) {
        updateButtonIcon(buttons[key], iconId);
      }
    }
  } catch (error) {
    console.error('Error updating icons:' + error);
  }
}

// Set Text content
async function setButtonTextContent(controls) {
  const { playPauseBtn, muteBtn, fullScreenBtn, cinematicModeBtn, subtitleButton, settingsButton } = controls;

  if (playPauseBtn) {
    playPauseBtn.innerHTML = '&#9658;';
    playPauseBtn.setAttribute('aria-label', 'Play/Pause');
  }
  if (muteBtn) {
    muteBtn.innerHTML = '&#128266;';
    muteBtn.setAttribute('aria-label', 'Mute/Unmute');
  }
  if (fullScreenBtn) {
    fullScreenBtn.innerHTML = '&#9974;';
    fullScreenBtn.setAttribute('aria-label', 'Fullscreen');
  }
  if (cinematicModeBtn) {
    cinematicModeBtn.innerHTML = '&#128161;';
    cinematicModeBtn.setAttribute('aria-label', 'Cinematic Mode');
  }
  if (subtitleButton) {
    subtitleButton.innerHTML = '&#127916;';
    subtitleButton.setAttribute('aria-label', 'Subtitles');
  }
  if (settingsButton) {
    settingsButton.innerHTML = '&#9881;';
    settingsButton.setAttribute('aria-label', 'Settings');
  }
}