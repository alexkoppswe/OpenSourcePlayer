# 🎬 Open Source Media Player

A customizable and feature-rich media player for web applications. Without any dependencies and modular design.

## 🚀 Features

- **Video and Audio Playback**: Supports video and audio with respective html tags (Works best for video).
- **Subtitles Support**: Easily add and manage subtitles via the `data-subtitle-src` attribute in the video tag.
- **Modular**
- **Context Menu**
- **Picture-in-Picture Mode**
- **Fullscreen Mode**
- **Cinematic Mode**: Darkens the page background.
- **Settings Menu**: Customizable settings.
- **Addons**: (Javascript files enabled via config)
- Svg icons or unicode icons as fallback.

## Images
![show](https://github.com/user-attachments/assets/04ec3ab0-eb2b-401a-924e-209732c358ea)


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
import { initializePlayer } from './js/modules/OpenSourcePlayer.js';

document.addEventListener('DOMContentLoaded', () => {
  initializePlayer();
});
```

## 📚 Documentation

### Configuration

Customize the player by modifying addons in `js/modules/OpenSourcePlayer.js`:

```javascript
const config = {
  usePreload: true,
  mouseEvent: true,
  useSvgIcons: true,
  useMediaSource: false,
  useSubtitles: true,
  useSettings: true,
  useContextMenu: true,
  useVerticalVidFill: true,
  useCinematicMode: true,
  useFastForward: true,
  debugger: false
};
```

### Adding Subtitles

To add subtitles, include the `data-subtitle-src` attribute in the video tag:

```html
<video data-subtitle-src="path/to/subtitles.vtt">
```

### Changeing icons

Set each icons in `controls.js -> svgIcons` from a singe icons.svg file.

**Currently using 'Streamline Remix' icons**

## 🤝 Contributing

Contributions are welcome just submit a pull request or donate a coffee.

<a href='https://ko-fi.com/X8X11DTGJQ' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

## 📄 License

This project is licensed under the GNU General Public License - see the LICENSE file for details.

---

Happy coding! 🎉
