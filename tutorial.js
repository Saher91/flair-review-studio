(() => {
  'use strict';
  const dialog = document.createElement('dialog');
  dialog.id = 'onboardingTutorial';
  dialog.setAttribute('aria-labelledby', 'tutorialTitle');
  dialog.setAttribute('aria-describedby', 'tutorialDescription');
  dialog.innerHTML = `<header class="tutorial-header"><div><h2 id="tutorialTitle">Welcome to FLAIR Review Studio</h2><p id="tutorialDescription">A quick guide to reviewing images, rating cases, and saving your work.</p></div><button type="button" class="tutorial-skip" id="tutorialSkip">Skip tutorial</button></header><video id="tutorialVideo" class="tutorial-video" controls playsinline preload="metadata" poster="assets/tutorial/overview-poster.png?v=no-csv-1" aria-label="FLAIR Review Studio overview with English narration"><track kind="captions" srclang="en" label="English" src="assets/tutorial/overview-en.vtt?v=no-csv-1"></video><footer class="tutorial-footer"><p id="tutorialPlaybackHint" aria-live="polite">English narration. Select Start tutorial to hear the guide.</p><button type="button" class="tutorial-play" id="tutorialPlay" autofocus>Start tutorial</button></footer>`;
  document.body.appendChild(dialog);
  const video = document.getElementById('tutorialVideo');
  const play = document.getElementById('tutorialPlay');
  const hint = document.getElementById('tutorialPlaybackHint');
  const replay = document.createElement('button');
  replay.type = 'button'; replay.id = 'tutorialReplay'; replay.className = 'btn-ghost';
  replay.textContent = 'Watch tutorial';
  // Keep replay available beside the reviewer identity and finishing controls.
  document.getElementById('notice').appendChild(replay);
  let returnFocus = null;
  function dismiss() {
    if (dialog.open) dialog.close();
  }
  function openTutorial() {
    if (dialog.open) return;
    returnFocus = document.activeElement;
    if (!video.getAttribute('src')) video.src = 'assets/tutorial/overview-en.mp4?v=no-csv-1';
    video.currentTime = 0;
    play.textContent = 'Start tutorial';
    hint.textContent = 'English narration. Select Start tutorial to hear the guide.';
    dialog.showModal();
    video.play().catch(() => { /* Browsers may require a click before playing narration. */ });
  }
  play.addEventListener('click', () => {
    if (video.paused) video.play().catch(() => {
      hint.textContent = 'The video could not start. Try the video controls, or skip to begin reviewing.';
    });
    else video.pause();
  });
  video.addEventListener('play', () => {
    play.textContent = 'Pause tutorial'; hint.textContent = 'You can skip at any time and replay the guide later.';
  });
  video.addEventListener('pause', () => { play.textContent = 'Continue tutorial'; });
  video.addEventListener('ended', dismiss);
  video.addEventListener('error', () => { hint.textContent = 'The tutorial is unavailable. Select Skip tutorial to start reviewing.'; });
  document.getElementById('tutorialSkip').addEventListener('click', dismiss);
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  dialog.addEventListener('close', () => {
    video.pause();
    const focusTarget = returnFocus === replay ? replay : document.getElementById('reviewerName');
    if (focusTarget) focusTarget.focus();
  });
  replay.addEventListener('click', openTutorial);
  openTutorial();
})();
