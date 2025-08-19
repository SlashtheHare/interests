// 1. Dynamically load the YouTube IFrame API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

let ytPlayer;

// 2. Called by the API once it's loaded
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('yt-player', {
    playerVars: {
      listType: 'playlist',
      list:     'PLoIQJyXr_UzTqDAXEIeG1wvY-thPGN9oJ', // ← replace with your playlist ID
      loop:     0,                  // we'll loop manually
      autoplay: 0
    },
    events: {
      onReady:      onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

// 3. Initialize your UI once the player is ready
function onPlayerReady() {
  const playBtn   = document.getElementById('play-pause');
  const volSlider = document.getElementById('volume');
  const progSlider= document.getElementById('progress');

  // Sync initial volume (YT uses 0–100, our slider 0–1)
  const initVol = ytPlayer.getVolume() / 100;
  volSlider.value = initVol;

  // Play/Pause
  playBtn.addEventListener('click', () => {
    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
      playBtn.textContent = '▶️';
    } else {
      ytPlayer.playVideo();
      playBtn.textContent = '⏸️';
    }
  });

  // Volume control
  volSlider.addEventListener('input', () => {
    ytPlayer.setVolume(volSlider.value * 100);
  });

  // Seek on slider drag
  progSlider.addEventListener('input', () => {
    const duration = ytPlayer.getDuration();
    const seekTo   = (progSlider.value / 100) * duration;
    ytPlayer.seekTo(seekTo, true);
  });

  // Update progress every half-second
  setInterval(() => {
    if (ytPlayer && ytPlayer.getDuration) {
      const duration = ytPlayer.getDuration();
      const current  = ytPlayer.getCurrentTime();
      progSlider.value = duration
        ? (current / duration) * 100
        : 0;
    }
  }, 500);
}

// 4. Loop the playlist when it ends
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    // jump back to first video and play
    ytPlayer.playVideoAt(0);
  }
}
