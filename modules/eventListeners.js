//  eventlisteners.js

/*========// Event Listeners //=========
  1. Video loaded event
  2. Show message function
  3. Initial UI update
  4. Event listeners for multiple video players
  5. State machine event listeners
  6. Vertical video fill event listener
  7. Mouse event listeners
  8. Video event listeners
  9. Loading video event listeners
  10. Error event listeners
  11. Button click event listeners
  12. Volume & seeker-bar event listeners
  13. Keyboard shortcuts event listener
  ====================================== */

import { config } from './OpenSourcePlayer.js';
import { debounce } from './utils.js';
import playerManager from './PlayerManager.js';
import stateMachine, { states } from './stateMachine.js';
import { handleMouseMove, showControls, mouseMoveTimer } from './mouseEvents.js';
import { updateUI, updateSliderBackground, checkIfVertical, resizeCanvas, renderCanvas, isVertical } from './uiUpdates.js';
import { togglePlayPause, toggleMute, toggleFullscreen, toggleSubtitles, toggleSettingsMenu, toggleCinematicMode, increaseVolume, decreaseVolume, skipBackward, skipForward, prefetchNextSegment } from './videoInput.js';

let timer;

// Main function
export function addEventListeners(video, mediaContainer, controls) {
  const { playPauseBtn, muteBtn, fullScreenBtn, volumeBar, seekerBar, cinematicModeBtn, subtitleButton, settingsButton, settingsMenu, videoControls, loadingDisplay, messageDisplay } = controls;

  // Video loaded event
  async function videoLoaded() {
    if (playerManager.getActivePlayer(video) === video) {
      loadingDisplay.style.display = 'none';
      messageDisplay.textContent = '';
      clearTimeout(timer);
  
      if (config.useVerticalVidFill) {
        checkIfVertical(video);
        if (isVertical) {
          resizeCanvas(mediaContainer);
          renderCanvas(video, mediaContainer);
        }
      }
    }
  }

  // Show message
  function showMessage(message) {
    if (playerManager.getActivePlayer(video) === video) {
      loadingDisplay.style.display = 'none';
      messageDisplay.textContent = message;
      video.removeAttribute('poster');
    }
  }

  try {
    // Initial UI update
    updateSliderBackground(seekerBar);
    updateSliderBackground(volumeBar);

    // For multiple video players
    mediaContainer.addEventListener('focus', () => playerManager.setActivePlayer(video));
    mediaContainer.addEventListener('click', () => playerManager.setActivePlayer(video));
    controls.videoControls.addEventListener('focus', () => playerManager.setActivePlayer(video));

    // State machine event listeners
    if (playerManager.getActivePlayer(video) === video) {
      stateMachine.addListener(() => updateUI(video, controls));
    }

    // Vertical video fill
    if (config.useVerticalVidFill) {
      window.addEventListener('resize', () => resizeCanvas(mediaContainer));  // Background canvas
    }

    // Mouse event listeners
    if (config.mouseEvent && video.tagName === 'VIDEO') {
      video.addEventListener('pause', () => showControls(video, videoControls));
      mediaContainer.addEventListener("mousemove", debounce(() => handleMouseMove(video, videoControls), 100));
      videoControls.addEventListener("mouseleave", () => handleMouseMove(video, videoControls));
      videoControls.addEventListener("click", () => clearTimeout(mouseMoveTimer));
      videoControls.addEventListener("mousemove", debounce(() => handleMouseMove(video, videoControls), 50));
      videoControls.addEventListener("mouseenter", () => {
        showControls(video, videoControls);
        clearTimeout(mouseMoveTimer);
      });
    }
    
    // Video event listeners
    video.addEventListener('fullscreenchange', () => updateUI(video, controls));
    video.addEventListener('ended', () => playerManager.clearActivePlayer(video));
    video.addEventListener('emptied', () => video.pause());
    video.addEventListener('canplaystart', () => videoLoaded());
    video.addEventListener('canplay', () => videoLoaded());
    video.addEventListener('loadeddata', () => videoLoaded());
    video.addEventListener('loadedmetadata', () => videoLoaded());
    video.addEventListener('progress', () => updateSliderBackground(seekerBar));
    video.addEventListener('encrypted', () => console.warn('Media is encrypted.'));

    video.addEventListener('click', () => {
      if (playerManager.getActivePlayer() !== video) {
        playerManager.setActivePlayer(video);
      }
      togglePlayPause(video);
    });

    video.addEventListener('playing', async () => {
      playerManager.setActivePlayer(video);
      stateMachine.setState('playback', states.PLAYING);
      videoLoaded();
    });

    video.addEventListener('timeupdate', async () => {
      // [Optional.] Smoother loop transition (I think..)
      /*
      if (stateMachine.getState('loop') === states.LOOPING) {
        const bufferTime = 0.2;
        if (video.duration - video.currentTime <= bufferTime) {
          video.currentTime = 0.2;
          prefetchNextSegment(video);
          video.play();
        }
      }
      */

      updateUI(video, controls);
      prefetchNextSegment(video);
    });

    // Loading video
    video.addEventListener('abort', () => showMessage('Video playback was aborted.'));
    video.addEventListener("loadstart", () => loadingDisplay.style.display = 'block');
    video.addEventListener('stalled', () => loadingDisplay.style.display = 'block');

    video.addEventListener('waiting', () => {
      if (messageDisplay.textContent === '') {
        loadingDisplay.style.display = 'block';
      }

      timer = setTimeout(() => {
        showMessage('An error occurred while loading the video.');
        playPauseBtn.disabled = true;
        playerManager.clearActivePlayer(video);
      }, 10000);
    });

    //  Errors
    video.addEventListener('error', (event) => {
      const mediaError = event.target.error;
      switch (mediaError.code) {
        case mediaError.MEDIA_ERR_ABORTED:
          console.warn('The fetching process for the media resource was aborted by the user.');
          break;
        case mediaError.MEDIA_ERR_NETWORK:
          console.warn('A network error occurred while fetching the media resource.');
          break;
        case mediaError.MEDIA_ERR_DECODE:
          console.warn('The media resource could not be decoded.');
          break;
        case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          console.warn('The media resource is not supported.');
          break;
        case mediaError.MEDIA_ERR_ENCRYPTED:
          console.warn('The media resource is encrypted and cannot be used.');
          break;
        case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          console.warn('The media resource is not supported.');
          break;
        case mediaError.NS_ERROR_DOM_MEDIA_METADATA_ERR:
          console.warn('A metadata error occurred while fetching the media resource.');
          break;
        default:
          console.error('Video error:', event);
          break;
      }

      showMessage('An error occurred while loading the video.');
    });

    // Button clicks
    controls.videoControls.addEventListener('click', (event) => {
      try {
        const target = event.target.closest('.osp-button');

        if (!target) return;
      
        if (target === playPauseBtn || target.closest('.osp-play-pause')) {
          togglePlayPause(video);
        } else if (target === muteBtn || target.closest('.osp-mute')) {
          toggleMute(video);
        } else if (target === fullScreenBtn || target.closest('.osp-fullscreen')) {
          toggleFullscreen(mediaContainer);
        } else if (target === cinematicModeBtn || target.closest('.osp-cinema-button')) {
          toggleCinematicMode();
        } else if (target === subtitleButton || target.closest('.osp-subtitle')) {
          toggleSubtitles(mediaContainer, video, subtitleButton);
        } else if (target === settingsButton || target.closest('.osp-settings-button')) {
          toggleSettingsMenu(settingsMenu, settingsButton);
        }
  
        if (playerManager.getActivePlayer(video) === video) {
          updateUI(video, controls);
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    });

    // Bars
    volumeBar.addEventListener('input', () => {
      video.volume = volumeBar.value;
      video.muted = video.volume === 0;
      updateSliderBackground(volumeBar);
    });

    volumeBar.addEventListener('volumechange', () => {
      updateUI(video, controls);
    });

    seekerBar.addEventListener('mousedown', () => {
      stateMachine.setState('seeking', states.SEEKING);
    });
  
    seekerBar.addEventListener('mouseup', () => {
      stateMachine.setState('seeking', states.NOT_SEEKING);
      updateUI(video, controls);
    });
  
    seekerBar.addEventListener('input', async () => {
      const newTime = (seekerBar.value / 100) * video.duration;
      video.currentTime = newTime;
      updateSliderBackground(seekerBar);
      updateUI(video, controls);
    });

    // Keyboard Shortcuts
    mediaContainer.addEventListener('keydown', (event) => {
      if (document.activeElement.tagName === 'INPUT' || playerManager.getActivePlayer(video) !== video) return;
      if(event.target.error) return;

      if (config.mouseEvent) handleMouseMove(video, videoControls);

      switch (event.key) {
        case ' ':
        case 'Spacebar':
        case 'Space':
          event.preventDefault();
          togglePlayPause(video);
          break;
        case 'ArrowUp':
          event.preventDefault();
          increaseVolume(video);
          break;
        case 'ArrowDown':
          event.preventDefault();
          decreaseVolume(video);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          skipBackward(video);
          prefetchNextSegment(video);
          break;
        case 'ArrowRight':
          event.preventDefault();
          skipForward(video);
          prefetchNextSegment(video);
          break;
        case 'f':
        case 'F':
          toggleFullscreen(mediaContainer);
          break;
        case 'm':
        case 'M':
          toggleMute(video);
          break;
        case 'c':
        case 'C':
          toggleCinematicMode();
          break;
        case 's':
        case 'S':
          toggleSubtitles(mediaContainer, video, subtitleButton);
          break;
        case 't':
        case 'T':
          toggleSettingsMenu(settingsMenu, settingsButton);
          break;
        default:
          break;
      }

      if (playerManager.getActivePlayer(video) === video) {
        updateUI(video, controls);
      }
    });
  } catch (error) {
    showMessage('An error occurred while loading the video.');
    console.error('An error occurred:', error);
  }
}