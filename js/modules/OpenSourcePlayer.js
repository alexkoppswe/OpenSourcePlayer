//  OpenSourcePlayer.js - Main player module for OSP

/* ===// Player //===
  1. Initialize player function
  2. Video player setup function
  3. Audio player setup function
  4. Check media support function
  ================================ */

import { setupVideoControls } from './controls.js';
import { addEventListeners } from './eventListeners.js';

// Global Configuration
const config = {
  usePreload: true,
  mouseEvent: true,
  useSvgIcons: true,
  useMediaSource: false,
  useSubtitles: true,
  useSettings: true,
  useContextMenu: true,
  useVerticalVidFill: true,
  useCinematicMode: true
};

// Initialize player
export async function initializePlayer() {
  try {
    const players = document.querySelectorAll('.osp-player');
    players.forEach(async (player) => {
      const video = player.querySelector('video');
      const audio = player.querySelector('audio');

      if (video) {
        const controls = await setupVideoControls(video, player);
        await addEventListeners(video, player, controls);
        videoPlayerSetup(video);
      } else if (audio) {
        const controls = await setupVideoControls(audio, player, false);
        await addEventListeners(audio, player, controls);
        audioPlayerSetup(audio);
      }
    });
  } catch (error) {
    console.error("An error occurred while initializing the player:", error);
  }
}

// Video player setup
export async function videoPlayerSetup(video) {
  if (!video) {
    console.error("Required video elements not found");
    return;
  }

  let source = video.querySelector('source[src]');
  const videoSrc = video.getAttribute('src');
  const subtitleSrc = video.getAttribute('data-subtitle-src');
  const segmentsAttr = video.getAttribute('data-segments');
  let segments = [];

  if (source) {
    video.preload = 'metadata';
  } else if (videoSrc) {
    source = document.createElement("source");
    source.setAttribute('src', videoSrc);
    video.appendChild(source);
    video.preload = 'metadata';
  }

  // Dynamic video playback from mediaSourceHelper.js
  if (config.useMediaSource) {
    if (segmentsAttr) {
      try {
        segments = JSON.parse(segmentsAttr);
        if (!Array.isArray(segments) || segments.length === 0) {
          throw new Error("Invalid segments array");
        }
      } catch (error) {
        console.error("Error parsing data-segments attribute:", error);
      }
    }

    if (segments.length > 0) {
      const { setupMediaSource } = await import('./mediaSourceHelper.js');
      setupMediaSource(video, segments);
    }
  }

  if (video.readyState === 0) {
    checkMediaSupport(video.querySelector('source[src]'));
  }

  if (config.useSubtitles && subtitleSrc && subtitleSrc.length > 0) {
    const { loadSubtitle } = await import('./subtitles.js');
    loadSubtitle(video, subtitleSrc);
  }
}

// Audio player setup
export async function audioPlayerSetup(audio) {
  if (!audio) {
    console.error("Required audio elements not found");
    return;
  }
  
  let source = audio.querySelector('source[src]');
  const audioSrc = audio.getAttribute('src');

  if (source) {
    audio.preload = 'metadata';
  } else if (audioSrc) {
    source = document.createElement("source");
    source.setAttribute('src', audioSrc);
    audio.appendChild(source);
    audio.preload = 'metadata';
  }
}

// Check media support function
async function checkMediaSupport(source) {
  try {
    if (!source) return console.warn('No source element found for the video.');

    let type = source.type || `video/${source.getAttribute('src').split('.').pop()}`;
    const codecOptions = ["vp9, vorbis", "avc1.42E01E, mp4a.40.5", "theora, vorbis", "vp8, opus", "mpeg4, aac", "theora, speex", "av01.0.15M.10", "V_MPEG4/ISO/AVC, A_AAC", "avc1.64001E, mp4a.40.2", "vorbis", "vp8", "flac"];
    const url = new URL(source.getAttribute('src'), window.location.href);

    if (!url.protocol.startsWith('http')) {
      console.warn('The source URL must be HTTP or HTTPS.');
      return false;
    }

    if (!("MediaSource" in window) || !window.MediaSource) {
      console.warn('MediaSource is not supported.');
      return false;
    }

    for (const codec of codecOptions) {
      const updatedType = `${type}; codecs="${codec}"`;
      if (MediaSource.isTypeSupported(updatedType)) {
        source.setAttribute('type', updatedType);
        //console.log(`Media type supported: ${updatedType}`);  // Uncomment for debugging
        break;
      }
    }
  } catch (error) {
    console.error("An error occurred while loading media:", error);
  }
}

// Export configuration
export { config };