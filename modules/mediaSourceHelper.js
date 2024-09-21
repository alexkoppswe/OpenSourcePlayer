// mediaSourceHelper.js
import { config } from './OpenSourcePlayer.js';

export function setupMediaSource(video, segments) {
  if (!config.useMediaSource) return;
  
  if (!video || !segments || !Array.isArray(segments) || segments.length === 0) {
    console.error("Missing or invalid parameters for MediaSource");
    return;
  }

  if (!("MediaSource" in window) || !window.MediaSource) {
    console.warn('MediaSource is not supported.');
    return;
  }

  const mediaSource = new MediaSource();
  video.src = URL.createObjectURL(mediaSource);

  // Add your own code here to handle the 'sourceopen' event
  mediaSource.addEventListener('sourceopen', () => {
    const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001f"');
    sourceBuffer.mode = 'sequence';
  });
}