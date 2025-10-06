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
  const volumeSlider = document.getElementById('volume');
  const tickContainer = document.querySelector('.tick-container');

  playBtn.addEventListener('click', () => {
    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  });

  document.getElementById('back').addEventListener('click', () => {
    ytPlayer.previousVideo();
  });

  document.getElementById('forward').addEventListener('click', () => {
    ytPlayer.nextVideo();
  });

  // Set initial volume and tick angle
  const initialVolume = parseInt(volumeSlider.value);
  ytPlayer.setVolume(initialVolume);
  const initialAngle = (initialVolume / 100) * 270 - 135;
  tickContainer.style.transform = `rotate(${initialAngle}deg)`;

  // Update volume and rotate tick container on input
  volumeSlider.addEventListener('input', () => {
    const volume = parseInt(volumeSlider.value);
    ytPlayer.setVolume(volume);

    const angle = (volume / 100) * 270 - 135;
    tickContainer.style.transform = `rotate(${angle}deg)`;
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

function updateTrackTitle(title) {
  const scrollText = document.querySelector('#track-info .scroll-text');
  if (!scrollText) return;

  scrollText.innerHTML = title;
  scrollText.classList.remove('scrollable', 'centered');

  // Strip HTML tags for comparison
  const tempDiv = document.createElement('div');
tempDiv.innerHTML = title;
const plainText = tempDiv.textContent || tempDiv.innerText || '';

const statusMessages = ['Paused', 'Finished', 'Not Playing'];
if (statusMessages.some(msg => plainText.includes(msg))) {
  scrollText.classList.add('centered');
  return;
}

  // Measure actual text width
  const tempSpan = document.createElement('span');
  tempSpan.style.visibility = 'hidden';
  tempSpan.style.position = 'absolute';
  tempSpan.style.whiteSpace = 'nowrap';
  tempSpan.style.fontSize = getComputedStyle(scrollText).fontSize;
  tempSpan.style.fontFamily = getComputedStyle(scrollText).fontFamily;
  tempSpan.textContent = plainText;

  document.body.appendChild(tempSpan);
  const textWidth = tempSpan.offsetWidth;
  document.body.removeChild(tempSpan);

  const containerWidth = scrollText.parentElement.clientWidth;

  if (textWidth > containerWidth) {
    scrollText.classList.add('scrollable');
  }
}



function onPlayerStateChange(event) {
  console.log("🔄 Player state changed:", event.data);

  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    const videoData = ytPlayer.getVideoData();
    updateTrackTitle(`<i class="fas fa-compact-disc"></i> ${videoData.title}`);
  } else {
    isPlaying = false;
    if (event.data === YT.PlayerState.PAUSED) {
      updateTrackTitle('<i class="fas fa-pause"></i> Paused');
    } else if (event.data === YT.PlayerState.ENDED) {
      updateTrackTitle('<i class="fas fa-check-circle"></i> Finished');
    } else {
      updateTrackTitle('<i class="fas fa-ban"></i> Not Playing');
    }
  }
}

// ——— Tab Highlight Logic ———
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll('.tab-btn');
  const highlight = document.querySelector('.tab-highlight');
  const tabTitle = document.getElementById('tab-title');

  const tabTitles = {
    games: "Video games",
    movies: "Movies",
    music: "Singers, bands, voice synths",
    anime: "Anime",
    podcasts: "Podcasts",
    tvshows: "TV shows",
    youtubers: "Youtubers, streamers and youtube series",
    manga: "Manga",
    cartoons: "Cartoons",
    reads: "Webcomics, books, creepypastas"
  };

  function moveHighlight(target) {
    const rect = target.getBoundingClientRect();
    const containerRect = target.parentElement.getBoundingClientRect();

    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    highlight.style.left = `${rect.left - containerRect.left}px`;
    highlight.style.top = `${rect.top - containerRect.top}px`;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelector('.tab-btn.active')?.classList.remove('active');
      tab.classList.add('active');
      moveHighlight(tab);

      // 🔊 Play tab click sound
      const tabSound = document.getElementById('tab-sound');
      tabSound.volume = 0.1;
      tabSound.currentTime = 0;
      tabSound.play();

      // 📝 Update tab title
      const tabId = tab.getAttribute('data-tab');
      if (tabTitle) {
        tabTitle.textContent = tabTitles[tabId] || "Untitled";
      }
    });
  });

  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab) {
    moveHighlight(activeTab);
    const initialTabId = activeTab.getAttribute('data-tab');
    if (tabTitle) {
      tabTitle.textContent = tabTitles[initialTabId] || "Untitled";
    }
  }

  // ——— Social Nav Click Sound ———
  const socialLinks = document.querySelectorAll('.social-nav');
  const socialSound = document.getElementById('social-sound');

  socialLinks.forEach(link => {
    link.addEventListener('click', () => {
      socialSound.volume = 0.1;
      socialSound.currentTime = 0;
      socialSound.play();
    });
  });
});
