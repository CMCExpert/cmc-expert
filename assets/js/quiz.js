/* Quiz Lab engine: category select -> round-size select -> round -> instant feedback -> score + review.
   Best scores (as score/total) persist in localStorage. */
(function(){
  const CATS = [...new Set(QUESTIONS.map(q=>q.c))];
  const box = document.getElementById('quizbox');
  const SIZES = [10, 25, 50];

  function bestKey(cat){ return 'cmcquiz_best_' + cat; }
  function getBest(cat){ return localStorage.getItem(bestKey(cat)) || null; } // "score/total"
  function bestPct(b){
    if(!b) return -1;
    const parts = b.split('/').map(Number);
    return (parts.length===2 && parts[1]>0) ? parts[0]/parts[1] : -1;
  }
  function setBest(cat, score, total){
    if (total>0 && score/total > bestPct(getBest(cat)))
      localStorage.setItem(bestKey(cat), score+'/'+total);
  }

  function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  function renderCategories(){
    box.innerHTML = '<h2 class="stitle" style="margin-bottom:6px">Pick a category</h2>' +
      '<p class="sub">Choose a round size up to the full bank, with instant feedback and explanations. Your best score per category is saved on this device.</p>' +
      '<div class="catgrid">' + CATS.map(c=>{
        const n = QUESTIONS.filter(q=>q.c===c).length;
        const b = getBest(c);
        return '<button class="catchoice" data-cat="'+esc(c)+'"><h4>'+esc(c)+'</h4><p>'+n+' questions in bank</p>' +
          (b? '<span class="best">Best: '+b+'</span>':'') + '</button>';
      }).join('') + '</div>';
    box.querySelectorAll('.catchoice').forEach(btn=>{
      btn.addEventListener('click',()=>renderSizePicker(btn.getAttribute('data-cat')));
    });
  }

  function renderSizePicker(cat){
    const n = QUESTIONS.filter(q=>q.c===cat).length;
    const sizes = SIZES.filter(s=>s<n);
    box.innerHTML = '<h2 class="stitle" style="margin-bottom:6px">'+esc(cat)+'</h2>' +
      '<p class="sub">'+n+' questions in the bank. How many per round?</p>' +
      '<div class="catgrid">' +
        sizes.map(s=>'<button class="catchoice" data-n="'+s+'"><h4>'+s+' questions</h4><p>quick round</p></button>').join('') +
        '<button class="catchoice" data-n="'+n+'"><h4>All '+n+'</h4><p>full bank marathon</p></button>' +
      '</div>' +
      '<div class="qnav"><button class="btn ghost" id="back" style="color:var(--teal-d);border-color:var(--teal-d)">← All categories</button></div>';
    box.querySelectorAll('.catchoice').forEach(btn=>{
      btn.addEventListener('click',()=>startRound(cat, parseInt(btn.getAttribute('data-n'),10)));
    });
    document.getElementById('back').addEventListener('click', renderCategories);
  }

  function startRound(cat, count){
    const pool = shuffle(QUESTIONS.filter(q=>q.c===cat)).slice(0, count);
    const state = {cat, pool, i:0, score:0, answers:[]};
    renderQ(state);
  }

  function renderQ(s){
    const q = s.pool[s.i];
    const pct = Math.round(s.i/s.pool.length*100);
    box.innerHTML =
      '<div class="qprogress"><i style="width:'+pct+'%"></i></div>' +
      '<div class="qmeta">'+esc(s.cat)+' · Question '+(s.i+1)+' of '+s.pool.length+' · Score: '+s.score+'</div>' +
      '<div class="qtext">'+q.q+'</div>' +
      '<div id="opts">' + q.o.map((t,idx)=>'<button class="opt" data-idx="'+idx+'">'+t+'</button>').join('') + '</div>' +
      '<div class="explain" id="expl"><b>Why:</b> '+q.e+'</div>' +
      '<div class="qnav"><button class="btn ghost" id="quit" style="color:var(--teal-d);border-color:var(--teal-d)">End round</button>' +
      '<button class="btn" id="next" disabled>Next →</button></div>';
    const opts = box.querySelectorAll('.opt');
    const next = document.getElementById('next');
    const expl = document.getElementById('expl');
    opts.forEach(b=>b.addEventListener('click',()=>{
      const chosen = parseInt(b.getAttribute('data-idx'),10);
      const ok = chosen===q.a;
      opts.forEach(x=>{x.disabled=true;
        const xi=parseInt(x.getAttribute('data-idx'),10);
        if(xi===q.a) x.classList.add('correct'); else if(xi===chosen) x.classList.add('wrong'); else x.classList.add('dim');
      });
      if(ok) s.score++;
      s.answers.push({q:q.q, chosen:q.o[chosen], correct:q.o[q.a], ok});
      expl.classList.add('show');
      next.disabled=false;
      next.textContent = (s.i===s.pool.length-1) ? 'See results →' : 'Next →';
    }));
    next.addEventListener('click',()=>{ s.i++; s.i<s.pool.length ? renderQ(s) : renderResults(s); });
    document.getElementById('quit').addEventListener('click',()=>renderCategories());
  }

  function renderResults(s){
    setBest(s.cat, s.score, s.pool.length);
    const pct = Math.round(s.score/s.pool.length*100);
    const msg = pct>=90 ? 'Expert-level. A reviewer would be pleased.' :
                pct>=70 ? 'Solid — review the misses below and re-run the round.' :
                pct>=50 ? 'Getting there. Revisit the explanations, then try again.' :
                          'Good news: every wrong answer just told you exactly what to study next.';
    box.innerHTML =
      '<div class="qmeta">'+esc(s.cat)+' · Round complete</div>' +
      '<div class="scorebig">'+s.score+' / '+s.pool.length+'</div>' +
      '<div class="scoremsg">'+msg+'<br>Best in this category: '+getBest(s.cat)+'</div>' +
      '<div class="qnav" style="justify-content:center;gap:12px">' +
        '<button class="btn ghost" id="again" style="color:var(--teal-d);border-color:var(--teal-d)">Retry ('+s.pool.length+')</button>' +
        '<button class="btn" id="cats">All categories</button></div>' +
      '<div class="review"><h3 style="color:var(--navy);margin:18px 0 6px">Review</h3>' +
        s.answers.map(a=>'<div class="ritem"><div class="rq">'+(a.ok?'✓ ':'✗ ')+a.q+'</div>' +
          '<div class="ra">You: '+a.chosen+'<br>Correct: <b>'+a.correct+'</b></div></div>').join('') +
      '</div>';
    document.getElementById('again').addEventListener('click',()=>startRound(s.cat, s.pool.length));
    document.getElementById('cats').addEventListener('click',()=>renderCategories());
    window.scrollTo({top:0,behavior:'smooth'});
  }

  renderCategories();
})();
