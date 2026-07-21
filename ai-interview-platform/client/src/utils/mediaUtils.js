/**
 * Media constraints and browser API utility wrappers for webcam proctoring.
 */

export const getCameraPermission = async () => {
  return navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
    audio: { echoCancellation: true, noiseSuppression: true }
  });
};

export const stopStreamTracks = (stream) => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};
