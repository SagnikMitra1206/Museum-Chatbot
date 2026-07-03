let currentSpeech = null;
let isSpeaking = false;

function ensureVoiceReady(callback) {
  const voices = window.speechSynthesis.getVoices();

  if (voices.length > 0) {
    callback();
  } else {
    // 🔥 Chrome lazy-load fix
    window.speechSynthesis.onvoiceschanged = () => {
      callback();
    };
  }
}

export function speakText(text) {
  if (!text) return;

  // 🛑 stop previous speech
  window.speechSynthesis.cancel();

  const speakNow = () => {
    currentSpeech = new SpeechSynthesisUtterance(text);

    currentSpeech.lang = "en-IN";
    currentSpeech.rate = 1;
    currentSpeech.pitch = 1;
    currentSpeech.volume = 1;

    currentSpeech.onstart = () => {
      isSpeaking = true;
    };

    currentSpeech.onend = () => {
      isSpeaking = false;
    };

    currentSpeech.onerror = () => {
      isSpeaking = false;
    };

    // 🔥 Chrome unlock fix
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(currentSpeech);
  };

  // 🔥 delay fixes async blocking issue
  setTimeout(() => {
    ensureVoiceReady(speakNow);
  }, 100);
}

export function stopSpeech() {
  window.speechSynthesis.cancel();
  isSpeaking = false;
}