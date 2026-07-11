/* Start-page tour: Spark walks the visitor through the four doors.
   Beats come from an embedded JSON block (#tour-data, generated from
   tour-content.json). Audio per beat is optional — if the mp3 is missing
   or autoplay is blocked, a timer advances the tour instead. */
(function () {
  var data = document.getElementById('tour-data');
  if (!data) return;
  var cfg = JSON.parse(data.textContent);
  var textEl = document.getElementById('tour-text');
  var startBtn = document.getElementById('tour-start');
  var skipBtn = document.getElementById('tour-skip');
  var audioBase = cfg.audioBase || ('tour-' + (cfg.lang || 'en') + '-');
  var beats = cfg.beats || [];
  var i = -1, audio = null, timer = null, running = false;

  function glow(target) {
    document.querySelectorAll('.tour-glow').forEach(function (d) { d.classList.remove('tour-glow'); });
    if (target) {
      var el = document.getElementById(target);
      if (el) {
        el.classList.add('tour-glow');
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }
  function stopAudio() {
    if (audio) { audio.onended = null; audio.pause(); audio = null; }
    clearTimeout(timer);
  }
  function step() {
    i += 1;
    if (i >= beats.length) { return end(); }
    var b = beats[i];
    textEl.textContent = b.text;
    glow(b.target || null);
    stopAudio();
    audio = new Audio('audio/' + audioBase + i + '.mp3');
    audio.onended = step;
    audio.onerror = function () { timer = setTimeout(step, 4500); };
    audio.play().catch(function () { timer = setTimeout(step, 4500); });
  }
  function end() {
    stopAudio(); glow(null); running = false;
    textEl.textContent = cfg.done;
    skipBtn.hidden = true; startBtn.hidden = true;
    document.getElementById('tour').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  startBtn.addEventListener('click', function () {
    if (running) return;
    running = true; i = -1;
    startBtn.hidden = true; skipBtn.hidden = false;
    step();
  });
  skipBtn.addEventListener('click', end);
})();
