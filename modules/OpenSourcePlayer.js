//  OpenSourcePlayer.js - Main player module for OSP

/* ===// Player //===
  1. Initialize player function
  2. Video player setup function
  3. Audio player setup function
  4. Load media function
  5. Check media support function
  ================================ */

import { setupVideoControls } from './controls.js';

// Global Configuration
const config = {
  usePreload: true,
  mouseEvent: true,
  useSvgIcons: true,
  useMediaSource: false,
  useSubtitles: true,
  useSettings: true,
  useContextMenu: true,
  useVerticalVidFill: true
};

// Initialize player
export async function initializePlayer() {
  try {
    const players = document.querySelectorAll('.osp-player');
    players.forEach(player => {
      const video = player.querySelector('video');
      const audio = player.querySelector('audio');
  
      if (video) {
        const hasSubtitles = video.hasAttribute('data-subtitle-src');
        setupVideoControls(video, player, hasSubtitles);
        videoPlayerSetup(video);
      } else if (audio) {
        setupVideoControls(audio, player, false);
        audioPlayerSetup(audio);
      }
    });
  } catch (error) {
    console.error("An error occurred while initializing the player:", error);
  }
}

// Video player setup
async function videoPlayerSetup(video) {
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
  } else {
    await loadMedia(video, source);
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

  if (video.readyState >= 2) {
    video.preload = 'auto';
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
async function audioPlayerSetup(audio) {
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

// Load media fallback function
export async function loadMedia(video, media) {
  if (!video || !media) {
    console.error("Required video elements not found");
    return;
  }

  try {
    const isExternal = media.startsWith('http') || media.startsWith('https');
    const response = await fetch(media);

    if (!response.ok) {
      throw new Error(`Failed to load media: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (!contentType.startsWith('video/')) {
      throw new Error(`Invalid media content type: ${contentType}`);
    }

    const source = document.createElement('source');
    source.setAttribute('src', media);

    if (isExternal) {
      source.setAttribute('type', contentType);
    } else {
      source.setAttribute('crossorigin', 'anonymous');
    }

    video.appendChild(source);
    video.preload = 'metadata';

  } catch (error) {
    console.error("An error occurred while loading media:", error);
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