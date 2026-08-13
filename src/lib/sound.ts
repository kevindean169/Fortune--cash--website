let audioCtx: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;

if (typeof window !== 'undefined') {
  // Initialize and decode the audio into raw memory for zero-latency playback
  const initAudio = async () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      audioCtx = new AudioContextClass();
      const response = await fetch('/lottery-sound.mp3');
      const arrayBuffer = await response.arrayBuffer();
      audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.warn('Failed to load audio for Web Audio API', err);
    }
  };
  initAudio();
}

export const playClickSound = () => {
  try {
    if (!audioCtx || !audioBuffer) return;
    
    // Browsers suspend audio contexts until first user interaction; resume if needed
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Create a source node, attach the decoded buffer, and play instantly
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
  } catch (error) {
    console.warn('Web Audio API playback failed', error);
  }
};
