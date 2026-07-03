/* Shared stepper for the self-paced sales-cycle lessons.
   Reusable across all lessons: reads the current step from
   [data-step] on .wrap, builds the 9-node cycle map, wires the
   Back/Next stepper, the progress dots and any quiz blocks.
   No dependencies. */
(function () {
  var STEPS = ['Acquisition', 'Lead Research', 'First Contact', 'Conversation Prep',
    'Needs Analysis', 'Value Argument', 'Presentation', 'Closing', 'Follow-up'];

  var wrap = document.querySelector('.wrap[data-step]');
  var step = wrap ? parseInt(wrap.getAttribute('data-step'), 10) : 0;

  // Build every cycle map on the page.
  [].forEach.call(document.querySelectorAll('.map'), function (el) {
    var complete = el.hasAttribute('data-complete');
    el.innerHTML = '';
    for (var s = 1; s <= STEPS.length; s++) {
      var b = document.createElement('b');
      b.textContent = s;
      b.title = s + '. ' + STEPS[s - 1];
      if (s < step || (s === step && complete)) b.className = 'done';
      else if (s === step) b.className = 'cur';
      el.appendChild(b);
    }
  });

  // Stepper over the .screen elements inside the card.
  var screens = [].slice.call(document.querySelectorAll('.screen'));
  var total = screens.length;
  var cur = 0;

  var audioEl = null, playBtn = null;
  function stopAudio() {
    if (audioEl) { audioEl.pause(); audioEl = null; }
    if (playBtn) { playBtn.textContent = '► Listen'; playBtn.classList.remove('playing'); playBtn = null; }
  }

  var dotWrap = document.getElementById('dots');
  var dotEls = [];
  if (dotWrap) {
    for (var i = 0; i < total; i++) dotWrap.appendChild(document.createElement('i'));
    dotEls = [].slice.call(dotWrap.children);
  }

  function render() {
    screens.forEach(function (s, i) { s.classList.toggle('is-active', i === cur); });
    dotEls.forEach(function (d, i) {
      d.className = i < cur ? 'on' : (i === cur ? 'cur' : '');
    });
  }
  function go(n) {
    stopAudio();
    cur = Math.max(0, Math.min(total - 1, n));
    render();
    var card = document.querySelector('.card');
    if (card) card.scrollIntoView({ block: 'nearest' });
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-next],[data-back],[data-restart]');
    if (!t) return;
    if (t.hasAttribute('data-next')) go(cur + 1);
    else if (t.hasAttribute('data-back')) go(cur - 1);
    else if (t.hasAttribute('data-restart')) go(0);
  });

  // Any quiz: .quiz containing .opt[data-correct], feedback in the next .fb.
  // Per-quiz copy via data-ok / data-miss, with sensible defaults.
  [].forEach.call(document.querySelectorAll('.quiz'), function (quiz) {
    var fb = quiz.parentNode.querySelector('.fb');
    var okMsg = quiz.getAttribute('data-ok') || 'Right.';
    var missMsg = quiz.getAttribute('data-miss') || 'Not quite — try again.';
    quiz.addEventListener('click', function (e) {
      var o = e.target.closest('.opt');
      if (!o) return;
      var ok = o.getAttribute('data-correct') === '1';
      if (ok) {
        [].forEach.call(quiz.querySelectorAll('.opt'), function (x) { x.classList.remove('wrong'); });
        o.classList.add('correct');
        if (fb) { fb.className = 'fb'; fb.textContent = okMsg; }
      } else {
        o.classList.add('wrong');
        if (fb) { fb.className = 'fb miss'; fb.textContent = missMsg; }
      }
    });
  });

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('.listen');
    if (!b) return;
    if (playBtn === b) { stopAudio(); return; }
    stopAudio();
    audioEl = new Audio(b.getAttribute('data-audio'));
    playBtn = b;
    b.textContent = '❚❚ Playing';
    b.classList.add('playing');
    audioEl.play();
    audioEl.onended = stopAudio;
  });

  render();
})();
