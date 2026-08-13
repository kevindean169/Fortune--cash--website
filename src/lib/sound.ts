export const playClickSound = () => {
  try {
    const audio = new Audio('/lottery-sound.mp3');
    audio.play().catch((e) => console.warn('Audio playback prevented:', e));
  } catch (error) {
    console.warn('Audio initialization failed', error);
  }
};
