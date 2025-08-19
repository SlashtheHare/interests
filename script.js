window.onYouTubeIframeAPIReady = function() {
  console.log("API is ready");
  // your existing player setup here
};

// 1) Dynamically inject the YouTube IFrame API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

let ytPlayer;

// 2) Called by the API once it’s loaded
function onYouTubeIframeAPIReady() {
    console.log("YouTube API is ready");
  ytPlayer = new YT.Player('yt-player', {
    playerVars: {
      listType: 'playlist',
      list:     'PLoIQJyXr_UzTqDAXEIeG1wvY-thPGN9oJ', // ← your playlist ID
      loop:     0,    // we’ll manually loop below
      autoplay: 0
    },
    events: {
      onReady:       onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

// 3) Once the player’s ready, wire up your UI
function onPlayerReady() {
  const prevBtn    = document.getElementById('prev');
  const playBtn    = document.getElementById('play-pause');
  const nextBtn    = document.getElementById('next');
  const volSlider  = document.getElementById('volume');
  const progSlider = document.getElementById('progress');
  const canvas      = document.getElementById('progressWave');
  const ctx         = canvas.getContext('2d');
  const trackInfo  = document.getElementById('track-info');

  function resizeWave() {
  const box = document.querySelector('.radio-progress');
  canvas.width  = box.clientWidth;
  canvas.height = box.clientHeight;
}
window.addEventListener('resize', resizeWave);
resizeWave();

// draw a “static” wave each frame
function drawWave() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth   = 2;
  ctx.strokeStyle = 'white';
  ctx.beginPath();

  // generate a quick noise-jagged sine
  const slices = 50;
  let x = 0;
  const dx = w / slices;
  for (let i = 0; i <= slices; i++) {
    const norm = i / slices;
    const sine = Math.sin(norm * Math.PI * 2 + performance.now() * 0.002);
    const noise = (Math.random() - 0.5) * 0.4;
    const y = (h/2) + (sine * 0.5 + noise) * (h/2);
    if (i === 0) ctx.moveTo(x, y);
    else        ctx.lineTo(x, y);
    x += dx;
  }

  ctx.stroke();
  requestAnimationFrame(drawWave);
}
drawWave();

  // Sync initial volume (YT volume 0–100 → slider 0–1)
  volSlider.value = ytPlayer.getVolume() / 100;

  // Previous / Next
  prevBtn.addEventListener('click', () => ytPlayer.previousVideo());
  nextBtn.addEventListener('click', () => ytPlayer.nextVideo());

  // Play / pause toggle
  playBtn.addEventListener('click', () => {
    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  });

  // Volume control
  volSlider.addEventListener('input', () => {
    ytPlayer.setVolume(volSlider.value * 100);
  });

  // Seek when user drags progress
  progSlider.addEventListener('input', () => {
    const duration = ytPlayer.getDuration() || 0;
    if (duration) {
      ytPlayer.seekTo((progSlider.value / 100) * duration, true);
    }
  });

  // Update UI every 250ms
  setInterval(() => {
    const state    = ytPlayer.getPlayerState();
    const duration = ytPlayer.getDuration() || 0;
    const current  = ytPlayer.getCurrentTime() || 0;
    const pct = duration ? (current / duration) : 0;
    
    canvas.style.width = (pct * 100) + '%';

    // 1) Play/Pause icon
    playBtn.textContent = (state === YT.PlayerState.PLAYING) ? '⏸️' : '▶️';

    // 2) Progress slider
    progSlider.value = duration ? (current / duration) * 100 : 0;

    // 3) Track title
    if (state === YT.PlayerState.PLAYING) {
      const { title } = ytPlayer.getVideoData();
      trackInfo.textContent = title;
    }
  }, 250);
}

// 4) Loop playlist & refresh title on video end
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    // Jump back to first video in the playlist
    ytPlayer.playVideoAt(0);
  }

  if (event.data === YT.PlayerState.PLAYING) {
    // Ensure title is up to date upon start
    const trackInfo = document.getElementById('track-info');
    const { title } = ytPlayer.getVideoData();
    trackInfo.textContent = title;
  }
}
