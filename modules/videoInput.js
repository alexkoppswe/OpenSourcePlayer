//  videoInput.js

/*=======// Video Input Module //=======
  1. Toggle play/pause function
  2. toggle mute function
  3. toggle fullscreen function
  4. toggle settingsMenu function
  5. toggle cinematicMode function
  6. toggle loop function
  7. toggle subtitles function
  8. toggle pip function
  9. Prefetches the next video segment function
  10. Handle skip & volume from keyboard functions 
======================================== */

import { config } from './OpenSourcePlayer.js';
import stateMachine, { states } from './stateMachine.js';
import playerManager from './PlayerManager.js';
import { mouseMoveTimer } from './mouseEvents.js';

// Play/Pause
export function togglePlayPause(video) {
  if (!video) return;
  if (playerManager.getActivePlayer(video) !== video) return;

  if (video.paused) {
    video.play();
    stateMachine.setState('playback', states.PLAYING);
  } else {
    video.pause();
    stateMachine.setState('playback', states.PAUSED);
  }
}

// Mute
export function toggleMute(video) {
  if (!video) return;
  if (playerManager.getActivePlayer(video) !== video) return;

  const storedVolume = sessionStorage.getItem('videoVolume');
  video.muted = !video.muted;

  if (video.muted) {
    video.volume = 0;
  } else {
    if (storedVolume) {
      video.volume = parseFloat(storedVolume);
    } else {
      video.volume = 0.1;
    }
  }
  stateMachine.setState('mute', video.muted ? states.MUTED : states.UNMUTED);
}

// Fullscreen
export function toggleFullscreen(videoPlayerContainer) {
  try {
    if (!document.fullscreenElement) {
      videoPlayerContainer.controls = false;
      videoPlayerContainer.requestFullscreen();
      stateMachine.setState('fullscreen', states.FULLSCREEN);
      clearTimeout(mouseMoveTimer);
    } else {
      document.exitFullscreen();
      stateMachine.setState('fullscreen', states.EXIT_FULLSCREEN);
      videoPlayerContainer.scrollIntoView();
    }
  } catch (error) {
    console.error("An error occurred while toggling fullscreen:", error);
    videoPlayerContainer.controls = true;
  }
}

// Settings Menu
export function toggleSettingsMenu(settingsMenu, settingsButton) {
  settingsMenu.classList.toggle('open');
  stateMachine.toggleState('settings', states.SETTINGS_OPEN, states.SETTINGS_CLOSED);

  document.addEventListener('click', (event) => {
    if (!settingsMenu.contains(event.target) && !settingsButton.contains(event.target)) {
      settingsMenu.classList.remove('open');
    }
  });
}

// Cinematic Mode
export function toggleCinematicMode() {
  stateMachine.toggleState('cinematicMode', states.CINEMATIC_MODE, states.EXIT_CINEMATIC_MODE);
  const isCinematicMode = stateMachine.getState('cinematicMode') === states.CINEMATIC_MODE;
  document.body.classList.toggle("osp-cinema", isCinematicMode);
}

export function toggleLoop(video) {
  if (!video) return;
  if (playerManager.getActivePlayer(video) !== video) return;

  video.loop = !video.loop;
  stateMachine.setState('loop', video.loop ? states.LOOPING : states.NOT_LOOPING);
}

// Subtitles
export function toggleSubtitles(videoPlayerContainer, video, subtitleButton) {
  if (!video) return;
  if (!config.useSubtitles) return;
  if (playerManager.getActivePlayer(video) !== video) return;

  const track = video.querySelector('track');

  if (track) {
    const subtitleTrack = videoPlayerContainer.querySelector('.osp-track');
    const subtitlesEnabled = stateMachine.getState('subtitles') === states.SUBTITLES_ON;
    subtitleTrack.style.display = subtitlesEnabled ? 'none' : 'block';
    stateMachine.toggleState('subtitles', states.SUBTITLES_ON, states.SUBTITLES_OFF);

    // [Optional.] Just for UI feedback
    /*
    if(subtitleButton) {
      subtitleButton.style.boxShadow = "0 0 10px 5px var(--videoPlayer-ui-border-color)";
      subtitleButton.style.borderRadius = "25%";
      setTimeout(() => {
        subtitleButton.style.boxShadow = "none";
        subtitleButton.style.borderRadius = "0";
      }, 600);
    }
    */
  } else {
    console.warn('No subtitles found');
  }
}

// PIP
export function togglePip(video) {
  if (!video) return;
  if (playerManager.getActivePlayer(video) !== video) return;

  try {
    if (document.pictureInPictureEnabled) {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
        stateMachine.setState('pip', states.PIP_DISABLED);
      } else {
        video.requestPictureInPicture();
        stateMachine.setState('pip', states.PIP_ENABLED);
      }
    } else {
      console.warn('Picture-in-picture is not supported in this browser.');
    }
  } catch (error) {
    console.error("An error occurred while toggling picture-in-picture:", error);
  }
}

// Prefetch
export async function prefetchNextSegment(video) {
  if (!video) return;
  if (playerManager.getActivePlayer(video) !== video) return;

  const nextSegmentUrl = video.getAttribute('src');
  if (!nextSegmentUrl || (video.buffered.length > 0 && video.buffered.end(0) > video.currentTime)) {
    return;
  }

  try {
    const cache = await caches.open('video-buffer');
    cache.add(nextSegmentUrl).catch(error => {
      console.error('Error prefetching video segment:', error);
    });
  } catch (error) {
    console.error('Error opening cache for video segment:', error);
  }
}

// Keyboard shortcuts for skip & volume
export function increaseVolume(video) {
  if (!video) return;
  if (playerManager.getActivePlayer(video) !== video) return;
  if(video.muted) video.muted = false;

  video.volume = Math.min(parseFloat((video.volume + 0.1).toFixed(1)), 1);
}

export function decreaseVolume(video) {
  if (!video) return;
  if (playerManager.getActivePlayer(video) !== video) return;
  video.volume = Math.max(parseFloat((video.volume - 0.1).toFixed(1)), 0);
}

export function skipBackward(video) {
  if (!video) return;
  if (playerManager.getActivePlayer(video) !== video) return;
  video.currentTime = Math.max(Math.floor(video.currentTime - 10), video.minSegmentDuration || 0);
}

export function skipForward(video) {
  if (!video) return;
  if (playerManager.getActivePlayer(video) !== video) return;
  video.currentTime = Math.min(Math.ceil(video.currentTime + 10), video.duration);
}
