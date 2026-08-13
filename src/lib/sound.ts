// Create a base audio object outside the function to preload the file
let baseAudio: HTMLAudioElement | null = null;

if (typeof window !== 'undefined') {
  baseAudio = new Audio('/lottery-sound.mp3');
  baseAudio.preload = 'auto'; // ensure it loads immediately
}

export const playClickSound = () => {
  try {
    if (!baseAudio) return;
    
    // Clone the audio node so rapid clicks overlap without resetting
    const audioClone = baseAudio.cloneNode() as HTMLAudioElement;
    audioClone.play().catch((e) => console.warn('Audio playback prevented:', e));
  } catch (error) {
    console.warn('Audio initialization failed', error);
  }
};
