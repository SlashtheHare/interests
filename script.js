let ytPlayer;
let isPlaying = false;
let phase = 0;
let amplitude = 20;

// Ensure the API callback is globally accessible
window.onYouTubeIframeAPIReady = function () {
  console.log("✅ YouTube API is ready");

  ytPlayer = new YT.Player('yt-player', {
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};

function onPlayerReady(event) {
  console.log("✅ Player is ready");

  ytPlayer.cuePlaylist({
    list: 'PLoIQJyXr_UzTqDAXEIeG1wvY-thPGN9oJ',
    listType: 'playlist',
    index: 0,
    startSeconds: 0,
    suggestedQuality: 'default'
  });

  const playBtn = document.getElementById('play-pause');
  const trackInfo = document.getElementById('track-info');
  const volumeSlider = document.getElementById('volume');
  const dialPointer = document.querySelector('.dial-pointer');

  playBtn.addEventListener('click', () => {
    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  });

  // Set initial volume and tick angle
  const initialVolume = parseInt(volumeSlider.value);
  ytPlayer.setVolume(initialVolume);
  const initialAngle = (initialVolume / 100) * 270 - 135;
  dialPointer.style.transform = `rotate(${initialAngle}deg) translateY(-40px)`;

  // Update volume and rotate tick on input
  volumeSlider.addEventListener('input', () => {
    const volume = parseInt(volumeSlider.value);
    ytPlayer.setVolume(volume);

    const angle = (volume / 100) * 270 - 135;
    dialPointer.style.transform = `rotate(${angle}deg) translateY(-40px)`;
  });

  animateWaveform(); // Start animation loop
}

function animateWaveform() {
  const canvas = document.getElementById('waveform');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function draw() {
    requestAnimationFrame(draw);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw horizontal center line
    ctx.beginPath();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Draw waveform
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isPlaying ? '#fff' : '#888';

    const frequency = isPlaying ? 0.10 + Math.random() * 0.01 : 0.03;
    const dynamicAmplitude = isPlaying ? amplitude + Math.random() * 40 : amplitude / 2;

    for (let x = 0; x < canvas.width; x++) {
      const y = canvas.height / 2 + Math.sin((x + phase) * frequency) * dynamicAmplitude;
      ctx.lineTo(x, y);
    }

    ctx.stroke();
    phase += 4;
  }

  draw();
}

function onPlayerStateChange(event) {
  console.log("🔄 Player state changed:", event.data);

  const trackInfo = document.getElementById('track-info');

  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    const videoData = ytPlayer.getVideoData();
    trackInfo.textContent = `🎵 Now Playing: ${videoData.title}`;
  } else {
    isPlaying = false;
    if (event.data === YT.PlayerState.PAUSED) {
      trackInfo.textContent = '⏸️ Paused';
    } else if (event.data === YT.PlayerState.ENDED) {
      trackInfo.textContent = '✅ Finished';
    } else {
      trackInfo.textContent = '🚫 Not playing';
    }
  }
}
