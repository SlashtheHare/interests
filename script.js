// 1) Dynamically inject the YouTube IFrame API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

let ytPlayer;

// 2) Called by the API once it’s loaded
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('yt-player', {
    playerVars: {
      listType: 'playlist',
      list:     'PLoIQJyXr_UzTqDAXEIeG1wvY-thPGN9oJ', // ← your playlist ID
      loop:     0,    // we’ll manually loop below
      autoplay: 0
    },
    events: {
      onReady:      onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

// 3) Once the player’s ready, wire up your UI
function onPlayerReady() {
  const playBtn   = document.getElementById('play-pause');
  const volSlider = document.getElementById('volume');
  const progSlider= document.getElementById('progress');

  // Sync initial volume (YT volume is 0–100, our slider 0–1)
  volSlider.value = ytPlayer.getVolume() / 100;

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
    const d = ytPlayer.getDuration();
    if (d) {
      ytPlayer.seekTo((progSlider.value / 100) * d, true);
    }
  });

  // Update progress bar & play/pause icon every 250ms
  setInterval(() => {
    const state = ytPlayer.getPlayerState();
    // update play/pause icon
    playBtn.textContent = (state === YT.PlayerState.PLAYING)
      ? '⏸️'
      : '▶️';

    // update progress slider
    const d = ytPlayer.getDuration();
    const t = ytPlayer.getCurrentTime();
    progSlider.value = d ? (t / d) * 100 : 0;
  }, 250);
}

// 4) When a video ends, jump back to the first in the playlist
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    ytPlayer.playVideoAt(0);
  }
}
