//  stateMachine.js

export const states = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  MUTED: 'muted',
  UNMUTED: 'unmuted',
  FULLSCREEN: 'fullscreen',
  EXIT_FULLSCREEN: 'exit_fullscreen',
  CINEMATIC_MODE: 'cinematic_mode',
  EXIT_CINEMATIC_MODE: 'exit_cinematic_mode',
  SUBTITLES_ON: 'subtitles_on',
  SUBTITLES_OFF: 'subtitles_off',
  SETTINGS_OPEN: 'settings_open',
  SETTINGS_CLOSED: 'settings_closed',
  SEEKING: 'seeking',
  NOT_SEEKING: 'not_seeking',
  LOOPING: 'looping',
  NOT_LOOPING: 'not_looping',
  PIP_ENABLED: 'pip_enabled',
  PIP_DISABLED: 'pip_disabled'
};

class StateMachine {
  constructor() {
    this.state = {};
    this.listeners = [];
  }

  setState(key, value) {
    this.state[key] = value;
    this.notifyListeners();
  }

  getState(key) {
    return this.state[key];
  }

  toggleState(key, value1, value2) {
    this.state[key] = this.state[key] === value1 ? value2 : value1;
    this.notifyListeners();
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

const stateMachine = new StateMachine();
export default stateMachine;