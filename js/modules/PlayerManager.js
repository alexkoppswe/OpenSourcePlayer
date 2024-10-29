// PlayerManager.js
class PlayerManager {
  constructor() {
    if (PlayerManager.instance) {
      return PlayerManager.instance;
    }
    this.activePlayer = null;
    PlayerManager.instance = this;
  }

  setActivePlayer(player) {
    if (!player || !(player instanceof HTMLMediaElement)) {
      console.error("Invalid player instance");
      return;
    }
    this.activePlayer = player;
    this.emit('activePlayerChanged', player);
  }

  getActivePlayer() {
    return this.activePlayer;
  }

  clearActivePlayer() {
    this.activePlayer = null;
    this.emit('activePlayerCleared');
  }

  on(event, listener) {
    document.addEventListener(event, listener);
  }

  emit(event, detail) {
    document.dispatchEvent(new CustomEvent(event, { detail }));
  }
}

const playerManager = new PlayerManager();
export default playerManager;