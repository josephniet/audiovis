class SmoothProgressBar {
  constructor(audioElement, progressBar) {
    this.audio = audioElement;
    this.progressBar = progressBar;
    this.lastUpdateTime = 0;
    this.lastAudioTime = 0;
    this.targetProgress = 0;
    this.currentProgress = 0;
    this.isAnimating = false;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.audio.addEventListener('timeupdate', () => {
      this.lastUpdateTime = performance.now();
      this.lastAudioTime = this.audio.currentTime;
      this.targetProgress = (this.audio.currentTime / this.audio.duration) * 100;

      if (!this.isAnimating) {
        this.startAnimation();
      }
    });

    this.audio.addEventListener('seeking', () => {
      // Jump immediately when seeking
      this.currentProgress = this.targetProgress;
      this.updateProgressBar();
    });

    this.audio.addEventListener('pause', () => {
      this.isAnimating = false;
    });
  }

  startAnimation() {
    this.isAnimating = true;
    this.animate();
  }

  animate() {
    if (!this.audio.paused) {
      const now = performance.now();
      const timeSinceUpdate = (now - this.lastUpdateTime) / 1000;

      // Estimate current position based on playback
      const estimatedTime = this.lastAudioTime + timeSinceUpdate;
      const estimatedProgress = (estimatedTime / this.audio.duration) * 100;

      // Smooth interpolation toward estimated position
      this.currentProgress += (estimatedProgress - this.currentProgress) * 0.1;

      this.updateProgressBar();
      requestAnimationFrame(() => this.animate());
    } else {
      this.isAnimating = false;
    }
  }

  updateProgressBar() {
    this.progressBar.value = Math.min(100, Math.max(0, this.currentProgress));
  }
}

// Usage
const smoothProgress = new SmoothProgressBar(
  document.getElementById('audio'),
  document.getElementById('progress')
);