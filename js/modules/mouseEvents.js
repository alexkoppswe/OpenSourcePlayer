//  mouseEvents.js

/*====// Mouse Events //====
  1. Mouse move function
  2. Show controls function
  3. Hide controls function
  =========================== */

import { config } from './OpenSourcePlayer.js';
export let mouseMoveTimer;

export function handleMouseMove(video, videoControls) {
  if (!video || !videoControls) return;
  if (!config.mouseEvent) return;

  showControls(video, videoControls);
  clearTimeout(mouseMoveTimer);
  mouseMoveTimer = setTimeout(() => hideControls(video, videoControls), 3500);
  video.style.cursor = "auto";
}

export function showControls(video, videoControls) {
  if (!video || !videoControls) return;

  videoControls.style.opacity = "1";
  video.style.cursor = "auto";
}

export function hideControls(video, videoControls) {
  if (!video || !videoControls) return;
  if (!config.mouseEvent) return;

  if (!video.paused) {
    videoControls.style.opacity = "0";
    video.style.cursor = "none";
  }
}