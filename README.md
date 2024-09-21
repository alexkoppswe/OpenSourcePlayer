# 🎬 Open Source Media Player

A customizable and feature-rich media player for web applications.

## 🚀 Features

- **Video and Audio Playback**: Supports video and audio with respective html tags(Works best for video).
- **Subtitles Support**: Easily add and manage subtitles via the `data-subtitle-src` attribute in the video tag.
- **Modular**
- **Addons**
- **Picture-in-Picture Mode**
- **Fullscreen Mode**
- **Cinematic Mode**: Darkense the page background.
- **Settings Menu**: Customizable settings.

## Images
![Open Source Media Player](assets/player-screenshot.png)


## 🛠️ Usage

1. **Include the CSS** in your HTML:
  ```html
  <link rel="stylesheet" href="css/OpenSourcePlayer.css">
  ```
2. **Add the player HTML structure**
```html
<div class="osp-player">
  <video>
   <source src="your-video-here" type="video/mp4">
  </video>
</div>
```
3. **Initialize the player in JavaScript**
```javascript
import { initializePlayer } from './modules/OpenSourcePlayer.js';

document.addEventListener('DOMContentLoaded', () => {
  initializePlayer();
});
```

## 📚 Documentation

### Configuration

Customize the player by modifying addons in `modules/OpenSourcePlayer.js`:

```javascript
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
```

### Adding Subtitles

To add subtitles, include the `data-subtitle-src` attribute in the video tag:

```html
<video data-subtitle-src="path/to/subtitles.vtt">
```

### Changeing icons

Set each icons in `controls.js > svgIcons` from a singe icons.svg file.

**Currently using 'Streamline Remix'**

## 🤝 Contributing

Contributions are welcome!

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Happy coding! 🎉