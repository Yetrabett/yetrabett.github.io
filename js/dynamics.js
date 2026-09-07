(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Typewriter status line ---------- */
  var phrases = [
    'combining motor, CVT and generator',
    'closed-loop frequency conditioning',
    'an alternative to power-electronic switching',
    'TRL 1 — idea validation'
  ];
  var el = document.getElementById('type-target');
  if(el){
    if(reduce){
      el.textContent = phrases[0];
    } else {
      var p = 0, c = 0, deleting = false;
      var TYPE_MS = 45, DELETE_MS = 28, HOLD_MS = 1600, GAP_MS = 400;
      function tick(){
        var word = phrases[p];
        if(!deleting){
          c++;
          el.textContent = word.slice(0, c);
          if(c === word.length){
            deleting = true;
            setTimeout(tick, HOLD_MS);
            return;
          }
          setTimeout(tick, TYPE_MS);
        } else {
          c--;
          el.textContent = word.slice(0, c);
          if(c === 0){
            deleting = false;
            p = (p + 1) % phrases.length;
            setTimeout(tick, GAP_MS);
            return;
          }
          setTimeout(tick, DELETE_MS);
        }
      }
      tick();
    }
  }

  /* ---------- Hero slideshow ---------- */
  var stage = document.getElementById('hero-slideshow');
  if(stage){
    var slides = stage.querySelectorAll('.slide');
    var dots = document.querySelectorAll('#hero-dots button');
    var idx = 0, timer = null;

    function show(i){
      idx = i;
      slides.forEach(function(s, n){ s.classList.toggle('active', n === i); });
      dots.forEach(function(d, n){ d.classList.toggle('active', n === i); });
    }
    function next(){ show((idx + 1) % slides.length); }
    function startAuto(){
      if(reduce) return;
      stopAuto();
      timer = setInterval(next, 4500);
    }
    function stopAuto(){ if(timer) clearInterval(timer); }

    dots.forEach(function(d){
      d.addEventListener('click', function(){
        show(parseInt(d.dataset.i, 10));
        startAuto();
      });
    });

    startAuto();
  }
})();
