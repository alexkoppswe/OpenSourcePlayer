// stateMachine.js

/*======// State Machine //======
  1. Player States
    -Initial States
  2. Player State Machine class
    -State Machine methods
    -State Machine listeners
    -State Machine helpers
============================= */

export default '';  // *Bugfix

export const states = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  PLAYING: 'playing',
  PAUSED: 'paused',
  SEEKING: 'seeking',
  ENDED: 'ended',
  ERROR: 'error',
  MUTED: 'muted',
  UNMUTED: 'unmuted',
  FULLSCREEN: 'fullscreen',
  WINDOWED: 'windowed',
  CINEMATIC_MODE: 'cinematic_mode',
  NORMAL_MODE: 'normal_mode',
  SUBTITLES_ON: 'subtitles_on',
  SUBTITLES_OFF: 'subtitles_off',
  SETTINGS_OPEN: 'settings_open',
  SETTINGS_CLOSED: 'settings_closed',
  LOOPING: 'looping',
  NOT_LOOPING: 'not_looping',
  PIP_ENABLED: 'pip_enabled',
  PIP_DISABLED: 'pip_disabled'
};

const defaultInitialStates = {
  playback: states.IDLE,
  volume: states.UNMUTED,
  display: states.WINDOWED,
  visualMode: states.NORMAL_MODE,
  subtitles: states.SUBTITLES_OFF,
  settings: states.SETTINGS_CLOSED,
  loop: states.NOT_LOOPING,
  pip: states.PIP_DISABLED,
  seeking: states.IDLE
};

export class StateMachine {
#state;
#listeners;

constructor(initialStates = {}) {
  this.#state = { ...defaultInitialStates, ...initialStates };
  this.#listeners = new Set();
}

/**
 * Updates the state for a given key.
 * @param {string} key - The state category (e.g., 'playback', 'volume').
 * @param {string} value - The new state value (must be one of the defined states).
 * @returns {boolean} - True if the state was changed, false otherwise.
 */
setState(key, value) {
  if (!(key in this.#state)) {
    console.warn(`StateMachine: Attempted to set unknown state key "${key}"`);
    return false;
  }

  if (this.#state[key] !== value) {
    this.#state[key] = value;
    this.#notifyListeners(key, value);
    return true;
  }
  return false; // State did not change
}

getState(key) {
  return this.#state[key];
}

toggleState(key, value1, value2) {
  if (!(key in this.#state)) {
    console.warn(`StateMachine: Attempted to toggle unknown state key "${key}"`);
    return false;
  }
  const currentValue = this.#state[key];
  const newValue = currentValue === value1 ? value2 : value1;

  if (currentValue !== newValue) {
    this.#state[key] = newValue;
    this.#notifyListeners(key, newValue);
    return true;
  }
  return false;
}

addListener(listener) {
  if (typeof listener === 'function') {
    this.#listeners.add(listener);
  } else {
    console.warn('StateMachine: Attempted to add non-function listener.');
  }
}

removeListener(listener) {
  this.#listeners.delete(listener);
}

#notifyListeners(key, value) {
  this.#listeners.forEach(listener => listener(key, value, this.#state));
}

clearListeners() {
    this.#listeners.clear();
}
}