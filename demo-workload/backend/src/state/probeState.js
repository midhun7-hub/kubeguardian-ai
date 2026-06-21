const probeState = {
  ready: true,
  live: true,
};

function isReady() {
  return probeState.ready;
}

function isLive() {
  return probeState.live;
}

function setReady(value) {
  probeState.ready = Boolean(value);
  return probeState.ready;
}

function setLive(value) {
  probeState.live = Boolean(value);
  return probeState.live;
}

function toggleReady() {
  probeState.ready = !probeState.ready;
  return probeState.ready;
}

function toggleLive() {
  probeState.live = !probeState.live;
  return probeState.live;
}

function getProbeState() {
  return { ...probeState };
}

module.exports = {
  isReady,
  isLive,
  setReady,
  setLive,
  toggleReady,
  toggleLive,
  getProbeState,
};
