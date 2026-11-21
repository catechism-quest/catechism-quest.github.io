// Catechism Quest: the play modes: study, fill-in, bonus castle, Word Builder, guardians and lost-lamb review.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// ----- study -----
function studyV(){
 const it=QAS()[V.i],w=words(it.a),hide=Math.round(w.length*G.level/4),hidden=new Set(G.order.slice(0,hide));
 const tip=G.level===0?'Read it out loud together. Then tap HIDE and say it from memory!':G.level>=4?'All hidden! Say the whole answer. Tap a blank to peek.':'Say the whole answer out loud. Tap a blank to peek.';
 const refs=it.refs?`<div class="row" style="margin-top:12px"><button class="btn sm" data-act="toggleRefs">${ic('book')} ${G.refs?'HIDE':'SHOW'} SCRIPTURE</button></div>${G.refs?`<div class="refs">${esc(it.refs)}</div>`:''}`:'';
 return`${topBar('map','QUESTION '+it.n)}
 <section class="box dark"><div class="lbl">QUESTION ${it.n}</div><div class="qtext">${esc(it.q)}</div><div class="row" style="margin-top:12px"><button class="btn sm" data-act="sayQ">${ic('speaker')} HEAR IT</button></div></section>
 <section class="box"><div class="lbl">ANSWER</div><div class="words ${w.length>40?'long':''}">${w.map((x,j)=>hidden.has(j)&&!G.peek.has(j)?`<button class="blank" data-act="peek" data-j="${j}" aria-label="hidden word" style="width:${Math.max(2,x.length)*.6}em"></button>`:`<span class="w">${esc(x)}</span>`).join(' ')}</div>${refs}</section>
 <div class="row" style="margin-bottom:14px"><button class="btn sm" data-act="sayA">${ic('speaker')} READ</button><button class="btn sm pri" data-act="hideMore" ${G.level>=4?'disabled':''}>${ic('shut',2,W)} HIDE</button><button class="btn sm" data-act="showAll">${ic('eye')} SHOW</button></div>
 <div class="tip">${tip}</div>
 <button class="btn ok" style="width:100%" data-act="startFill">I'M READY! ${ic('play',2,W)}</button>
 ${stars(kid(),V.i)>0?`<button class="btn acc" style="width:100%;margin-top:12px" data-act="startBuild">${spr('crown',2)} WORD BUILDER</button>`:''}`;
}
function startStudy(i){V={name:'study',i};const n=words(QAS()[i].a).length;G={level:0,order:shuffle([...Array(n).keys()]),peek:new Set(),refs:false};render();window.scrollTo(0,0);}

// ----- fill -----
function makeFill(i,st){
 const w=words(QAS()[i].a);
 let cand=w.map((_,j)=>j).filter(j=>norm(w[j]).length>=3&&!STOP.has(norm(w[j])));
 if(!cand.length)cand=w.map((_,j)=>j);
 const frac=[.3,.3,.5,.7][st||0];
 const cnt=Math.max(1,Math.min(10,Math.round(w.length*frac),cand.length));
 const F={w,blanks:shuffle(cand).slice(0,cnt).sort((a,b)=>a-b),bi:0,opts:[],wrong:new Set(),i};
 makeOpts(F);return F;
}
function makeOpts(F){
 const correct=clean(F.w[F.blanks[F.bi]]),seen=new Set([norm(correct)]),picks=[];
 const add=x=>{const c=clean(x),n=norm(c);if(picks.length<2&&n.length>=2&&!seen.has(n)){seen.add(n);picks.push(c);}};
 shuffle(F.w).forEach(add);
 const others=[];QAS().forEach((q,j)=>{if(j!==F.i)words(q.a).forEach(x=>others.push(x));});
 shuffle(others).slice(0,200).forEach(add);
 ['God','love','life','heart','world','grace','truth','good'].forEach(add);
 F.opts=shuffle([correct,...picks]);F.wrong=new Set();
}
function heartsHTML(m){const s=starsFor(m);return`<span class="hearts">${[0,1,2].map(n=>spr('heart',4,n<s?null:GRAY)).join('')}</span>`;}
function swordBtn(){const k=kid();return`<button class="btn sm gold" data-act="useSword" ${k.swords>0?'':'disabled'}>${spr('sword',2)} SWORD ×${k.swords}</button>`;}
function fillBody(F){
 return`<section class="box"><div class="words ${F.w.length>40?'long':''}">${F.w.map((x,j)=>{const b=F.blanks.indexOf(j);if(b<0)return`<span class="w">${esc(x)}</span>`;if(b<F.bi)return`<span class="fb got">${esc(x)}</span>`;return`<span class="fb ${b===F.bi?'cur':''}">&nbsp;</span>`;}).join(' ')}</div>
 <div class="bar"><i style="width:${Math.round(F.bi/F.blanks.length*100)}%"></i></div></section>
 <div class="tip">Which word fits the <b style="color:var(--acc2)">orange</b> blank?</div>
 <div class="tiles">${F.opts.map((o,j)=>`<button class="opt ${F.wrong.has(j)?'bad':''}" data-act="opt" data-k="${j}" ${F.wrong.has(j)?'disabled':''}>${esc(o)}</button>`).join('')}</div>`;
}
function fillV(){
 const it=QAS()[V.i];
 return`${topBar('map','FILL IT · Q'+it.n)}
 <div class="gamebar">${heartsHTML(G.mistakes)}<span class="sp"></span>${swordBtn()}</div>
 <section class="box dark"><div class="qtext">${esc(it.q)}</div></section>
 ${fillBody(G.F)}`;
}
function startFill(i){const k=kid();V={name:'fill',i};G={mistakes:0,F:makeFill(i,stars(k,i))};render();window.scrollTo(0,0);
 // long answers: bring the first blank into view
 requestAnimationFrame(()=>{const b=document.querySelector('.fb.cur');if(b&&b.getBoundingClientRect().top>innerHeight*.6)b.scrollIntoView({block:'center'});});}

// ----- bonus -----
// Long answers are built a few chunks at a time (two in the castle), starting at a random point, with a few words before it as a cue.
function makeBuild(i,max){
 max=max||2;const all=words(QAS()[i].a);let segs=chunk(all),lead=[];
 if(segs.length>max){const s0=Math.floor(Math.random()*(segs.length-max+1)),start=segs.slice(0,s0).reduce((a,x)=>a+x.length,0);lead=all.slice(Math.max(0,start-4),start);segs=segs.slice(s0,s0+max);}
 const B={i,segs,lead,seg:0,pos:0,placed:[],tiles:[]};B.tiles=shuffleNew(B.segs[0].map((w,j)=>({w,id:j,used:false})));return B;
}
function makePick(i,rev){const n=N(),others=shuffle([...Array(n).keys()].filter(j=>j!==i)).slice(0,Math.min(2,n-1));return{i,rev:!!rev,opts:shuffle([i,...others]),wrong:new Set()};}
function startBonus(s){
 const n=N(),sec=QD().lands[s].qs.map(x=>x-1),earlier=[...Array(sec[0]).keys()];
 let rounds=sec.map(i=>({type:'pick',i}));
 if(n>=3){const r=rnd(sec);rounds.push({type:'pickq',i:r});}
 rounds.push({type:'build',i:rnd(sec)});
 if(earlier.length)rounds.push({type:n>=2?'pick':'build',i:rnd(earlier)});
 if(n<2)rounds=rounds.map(r=>({type:'build',i:r.i}));
 rounds=shuffle(rounds);
 V={name:'bonus',s};G={rounds,r:0,mistakes:0,cur:null};loadRound();render();window.scrollTo(0,0);
}
function loadRound(){const R=G.rounds[G.r];G.busy=false;G.cur=R.type==='build'?makeBuild(R.i):makePick(R.i,R.type==='pickq');}
function buildBody(C,lbl){
 const qa=QAS(),k=kid(),total=C.segs.reduce((a,x)=>a+x.length,0),part=C.lead.length||C.segs.length>1;
 return`<section class="box dark"><div class="lbl">${lbl} · Q${qa[C.i].n}</div><div class="qtext">${esc(qa[C.i].q)}</div></section>
 <section class="box"><div class="words ${total>40?'long':''}">${C.lead.length?`<span class="w" style="color:var(--mut)">… ${esc(C.lead.join(' '))}</span> `:''}${C.placed.map(x=>`<span class="w ok">${esc(x)}</span>`).join(' ')}<span class="cursor"></span></div><div class="bar"><i style="width:${Math.round(C.placed.length/total*100)}%"></i></div></section>
 <div class="tip">${C.lead.length?'Keep going from the gray words. ':''}Tap the words in order${part?` · part ${Math.min(C.seg+1,C.segs.length)} of ${C.segs.length}`:''}</div>
 <div class="tiles">${C.tiles.map(t=>`<button class="wt ${t.used?'used':''}" data-act="tile" data-id="${t.id}" ${t.used?'disabled':''}>${esc(t.w)}</button>`).join('')}</div>
 <div class="row"><button class="btn sm gold" data-act="useSword" ${k.swords>0?'':'disabled'} style="flex:none">${spr('sword',2)} SHOW NEXT ×${k.swords}</button></div>`;
}
function pickBody(C){
 const qa=QAS();
 if(C.rev)return`<section class="box"><div class="lbl">WHICH QUESTION HAS THIS ANSWER?</div><div class="qtext">${esc(shortText(qa[C.i].a,40))}</div></section>
  <div class="opts">${C.opts.map(j=>`<button class="opt long ${C.wrong.has(j)?'bad':''}" data-act="pick" data-j="${j}" ${C.wrong.has(j)?'disabled':''}>Q${qa[j].n}. ${esc(qa[j].q)}</button>`).join('')}</div>`;
 return`<section class="box dark"><div class="lbl">PICK THE RIGHT ANSWER · Q${qa[C.i].n}</div><div class="qtext">${esc(qa[C.i].q)}</div><div class="row" style="margin-top:12px"><button class="btn sm" data-act="sayBonusQ">${ic('speaker')} HEAR IT</button></div></section>
 <div class="opts">${C.opts.map(j=>`<button class="opt long ${C.wrong.has(j)?'bad':''}" data-act="pick" data-j="${j}" ${C.wrong.has(j)?'disabled':''}>${esc(shortText(qa[j].a,18))}</button>`).join('')}</div>`;
}
const roundBody=(R,C)=>R.type==='build'?buildBody(C,'BUILD THE ANSWER'):pickBody(C);
function bonusV(){
 const R=G.rounds[G.r];
 return`${topBar('map','BONUS CASTLE')}<div class="gamebar"><span class="round">ROUND ${G.r+1}/${G.rounds.length}</span>${heartsHTML(G.mistakes)}<span class="sp"></span>${R.type==='build'?'':swordBtn()}</div>${roundBody(R,G.cur)}`;
}
// Advance after a short pause; ignores taps in between and does nothing if the player left the round.
function advanceSoon(ms){G.busy=true;const tok=G,v=V.name;setTimeout(()=>{if(G!==tok||V.name!==v)return;if(v==='build')finishBuild();else nextRound();},ms);}
function nextRound(){
 if(G.done)return;G.r++;
 if(G.r>=G.rounds.length)return V.name==='guard'?finishGuard():finishBonus();
 loadRound();if(V.name==='guard'){G.hit=true;sfx.sword();}render();G.hit=false;window.scrollTo(0,0);
}
// A wrong tap. In a guardian battle, running out of hearts ends the try (nothing is lost).
function missed(){
 G.mistakes++;sfx.bad();
 if(V.name==='guard'&&G.mistakes>=GUARD_HEARTS){G.busy=true;const tok=G;setTimeout(()=>{if(G===tok&&V.name==='guard')loseGuard();},600);}
}
const gameHearts=()=>V.name==='guard'?`<span class="hearts">${[...Array(GUARD_HEARTS).keys()].map(n=>spr('heart',3,n<GUARD_HEARTS-G.mistakes?null:GRAY)).join('')}</span>`:heartsHTML(G.mistakes);

// ----- word builder: build a whole answer from shuffled word tiles -----
// For a question the kid has already learned. Answers up to four chunks (about 40 words) are built
// all the way through; longer ones build a four-chunk stretch from a random point. Finishing crowns
// the question on the map, and a lost lamb's build counts as its review.
const BUILD_SEGS=4;
function startBuild(i){V={name:'build',i};G={mistakes:0,cur:makeBuild(i,BUILD_SEGS)};render();window.scrollTo(0,0);}
function buildV(){return`${topBar('map','WORD BUILDER')}<div class="gamebar">${heartsHTML(G.mistakes)}<span class="sp"></span></div>${buildBody(G.cur,'WORD BUILDER')}`;}
function finishBuild(){
 if(G.done)return;G.done=true;
 const k=kid(),i=V.i,key=pkey(k.quest,i),st=starsFor(G.mistakes),prev=k.mast[key]||0,first=!prev;
 if(st>prev)k.mast[key]=st;
 const wasLost=isLost(k,i);if(wasLost)srsReview(k,i,st>=2);
 const coins=first?10:st===3?4:2;k.coins+=coins;save(k);const extra=celebrate(k);
 showModal(`<div style="margin:6px 0">${spr('crown',8)}</div><h2>${first?'QUESTION CROWNED!':st===3?'PERFECT BUILD!':'WELL BUILT!'}</h2>
 <div class="bigstars">${[0,1,2].map(n=>`<span class="${n<st?'on':''}">${spr('star',6,n<st?null:STARG)}</span>`).join('')}</div>
 <p>${first?'You built the answer word by word. Look for the crown on the map!':'Every build makes it stick a little better.'}</p>
 <div class="rewards"><div class="rw">${spr('coin',3)} +${coins} COINS</div>${wasLost?`<div class="rw">${spr('sheep',3)} A LOST LAMB CAME HOME!</div>`:''}${extra}</div>
 <div class="col"><button class="btn ok" data-act="nextNode">NEXT ${ic('play',2,W)}</button><button class="btn" data-act="startBuild">BUILD AGAIN</button><button class="btn" data-act="go" data-to="map">MAP</button></div>`);
 sfx.win();setTimeout(()=>confetti(st===3?160:80),150);
}

// ----- land guardians -----
// Once every level in a land is done, its guardian waits at the end. Each right round knocks off
// a bit of the guardian's health; five wrong taps and the guardian wins this time (try again, nothing lost).
// The first win earns the land's badge, coins, and the next locked hymn.
const GUARD_HEARTS=5,GUARD_MAX=8;
function mix(a,b,t){const p=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16)),A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
const guardMap=c=>({a:mix(c,'#ffffff',.45),b:c});
const landTheme=s=>themeOf(QD(),s);
const landDone=(k,s)=>nodes().filter(n=>n.s===s).every(n=>isDone(k,n));
function guardBtn(k,s){
 if(!landDone(k,s))return'';const th=landTheme(s),won=!!k.guard[ckey(k.quest,s)];
 return`<button class="gbtn ${won?'won':'new'}" data-act="guard" data-s="${s}">${spr('guardian',3,guardMap(th.c))}<span>${won?`${spr('shield',2)} BADGE EARNED<br><span style="color:var(--mut)">FACE THE GUARDIAN AGAIN</span>`:'THE GUARDIAN AWAITS!<br><span style="color:var(--acc2)">TAP TO FACE THE CHALLENGE</span>'}</span></button>`;
}
function startGuard(s){
 const n=N(),sec=QD().lands[s].qs.map(x=>x-1);
 let rounds=sec.map(i=>({type:'build',i}));
 if(n>=2)sec.forEach((i,j)=>rounds.push({type:n>=3&&j%2?'pickq':'pick',i}));
 rounds=shuffle(rounds).slice(0,GUARD_MAX);
 while(rounds.length<3)rounds.push({type:n>=2?'pick':'build',i:rnd(sec)});
 V={name:'guard',s};G={rounds,r:0,mistakes:0,cur:null};loadRound();render();window.scrollTo(0,0);
}
function guardV(){
 const R=G.rounds[G.r],th=landTheme(V.s),hp=G.rounds.length-G.r;
 return`${topBar('map','GUARDIAN')}<div class="arena"><div style="padding-bottom:8px">${heroImg(kid(),4)}</div><div class="foe ${G.hit?'hit':''}"><span class="foename">${esc(th.n.toUpperCase())}</span><div class="hp" aria-label="Guardian health ${hp} of ${G.rounds.length}"><i style="width:${Math.round(hp/G.rounds.length*100)}%"></i></div>${spr('guardian',5,guardMap(th.c))}</div></div>
 <div class="gamebar"><span class="round">ROUND ${G.r+1}/${G.rounds.length}</span>${gameHearts()}<span class="sp"></span>${R.type==='build'?'':swordBtn()}</div>${roundBody(R,G.cur)}`;
}
function finishGuard(){
 if(G.done)return;G.done=true;
 const k=kid(),s=V.s,key=ckey(k.quest,s),first=!k.guard[key],perfect=G.mistakes===0,th=landTheme(s);
 const bar=document.querySelector('.hp i');if(bar)bar.style.width='0%';
 k.guard[key]=1;let coins=first?30:5,song=-1;if(perfect)coins+=10;
 if(first){song=SONGS.findIndex((x,j)=>!k.songs.includes(j));if(song>=0)k.songs.push(song);else coins+=SONG_COST;}
 k.coins+=coins;save(k);const extra=celebrate(k);
 showModal(`<div style="margin:6px 0">${spr('guardian',5,guardMap(th.c))}</div><h2>${first?'BADGE EARNED!':'WELL FOUGHT!'}</h2>
 <p>The guardian of ${esc(th.n)} salutes you and lets you pass!</p>
 <div class="rewards">${first?`<div class="rw">${spr('shield',3)} ${esc(th.n.toUpperCase())} BADGE</div>`:''}<div class="rw">${spr('coin',3)} +${coins} COINS${perfect?' (PERFECT!)':''}</div>${song>=0?`<div class="rw">${spr('note',2)} NEW HYMN: ${esc(SONGS[song].t.toUpperCase())}</div>`:''}${extra}</div>
 <div class="col"><button class="btn ok" data-act="go" data-to="map">MAP ${ic('play',2,W)}</button>${song>=0?`<button class="btn" data-act="go" data-to="music">${ic('note',2)} JUKEBOX</button>`:''}</div>`);
 sfx.win();setTimeout(()=>confetti(220),150);
}
function loseGuard(){
 if(G.done)return;G.done=true;const th=landTheme(V.s);
 showModal(`<div style="margin:6px 0">${spr('guardian',5,guardMap(th.c))}</div><h2>NOT YET!</h2>
 <p>The guardian of ${esc(th.n)} is still standing. Practice this land’s questions and try again. You didn’t lose anything!</p>
 <div class="col"><button class="btn ok" data-act="guardAgain">TRY AGAIN</button><button class="btn" data-act="go" data-to="map">MAP</button></div>`);
 sfx.lose();
}

// ----- results -----
function finishLevel(){
 if(G.done)return;G.done=true;
 const k=kid(),i=V.i,key=pkey(k.quest,i),m=G.mistakes,st=starsFor(m),prev=k.prog[key]||0,first=!prev;
 if(st>prev)k.prog[key]=st;
 // a lost lamb's level played on the map counts as its review
 const wasLost=!first&&isLost(k,i);
 if(first)srsSeed(k,i);else if(wasLost)srsReview(k,i,st>=2);
 const coins=first?st*5:st*2;k.coins+=coins;save(k);const extra=celebrate(k);
 showModal(`<h2>${st===3?'PERFECT!':st===2?'GREAT JOB!':'YOU DID IT!'}</h2>
 <div class="bigstars">${[0,1,2].map(n=>`<span class="${n<st?'on':''}">${spr('star',6,n<st?null:STARG)}</span>`).join('')}</div>
 <p>${st<3?'Fewer oops = more stars. Replay anytime to earn 3!':'Every word in the right place!'}</p>
 <div class="rewards"><div class="rw">${spr('coin',3)} +${coins} COINS</div>${first?`<div class="rw">${spr('sheep',3)} A LAMB JOINED YOUR FLOCK!</div>`:wasLost?`<div class="rw">${spr('sheep',3)} A LOST LAMB CAME HOME!</div>`:''}${extra}</div>
 <div class="col"><button class="btn ok" data-act="nextNode">NEXT ${ic('play',2,W)}</button><button class="btn acc" data-act="startBuild">${spr('crown',2)} WORD BUILDER</button><button class="btn" data-act="go" data-to="map">MAP</button></div>`);
 sfx.win();setTimeout(()=>confetti(st===3?160:80),150);
}
function finishBonus(){
 if(G.done)return;G.done=true;
 const k=kid(),s=V.s,key=ckey(k.quest,s),first=!k.cps[key],perfect=G.mistakes===0;
 k.cps[key]=1;let coins=first?20:5;if(perfect)coins+=10;if(first)k.swords++;k.coins+=coins;save(k);const extra=celebrate(k);
 showModal(`<div style="margin:6px 0">${spr('castle',6)}</div><h2>CASTLE CLEARED!</h2>
 <p>${perfect?'A perfect bonus round!':'You finished the bonus round!'}</p>
 <div class="rewards"><div class="rw">${spr('coin',3)} +${coins} COINS${perfect?' (PERFECT!)':''}</div>${first?`<div class="rw">${spr('sword',3)} +1 SWORD</div>`:''}${extra}</div>
 <p class="tiny">Use swords during a game to knock out a wrong answer.</p>
 <div class="col">${first&&landDone(k,s)?`<button class="btn acc" data-act="guard" data-s="${s}">${spr('guardian',2,guardMap(landTheme(s).c))} FACE THE GUARDIAN</button>`:''}<button class="btn ok" data-act="nextNode">NEXT ${ic('play',2,W)}</button><button class="btn" data-act="go" data-to="map">MAP</button></div>`);
 sfx.win();setTimeout(()=>confetti(200),150);
}
function openNode(gi){
 const ns=nodes(),n=ns[gi];if(!n)return nav({name:'map'});
 closeModal();
 if(n.t==='q')startStudy(n.i);else startBonus(n.s);
}

// ----- find the lost lambs: a quick review of the questions that are due -----
// Right on the first try: the lamb comes home and its next review moves further out.
// A miss: the lamb gets one more try at the end of the round; if it comes home then, it
// starts over and wanders again tomorrow. Missed twice, it stays lost for another day's search.
const HERD_MAX=10;
function startHerd(){
 const k=kid(),lost=lostIdx(k).slice(0,HERD_MAX);if(!lost.length)return nav({name:'flock'});
 V={name:'herd'};G={queue:lost.map(i=>({i,tries:0})),total:lost.length,found:[],stray:[],pos:0,cur:null,busy:false,done:false};
 loadHerd();render();window.scrollTo(0,0);
}
function loadHerd(){
 const it=G.queue[0];G.busy=false;G.miss=false;
 G.cur=N()>=2?makePick(it.i,false):{i:it.i,self:true,show:false,opts:[],wrong:new Set()};
}
function herdV(){
 const it=G.queue&&G.queue[0];if(!it||!G.cur)return topBar('flock','FIND YOUR LAMBS');
 const C=G.cur,qa=QAS()[C.i],done=G.found.length,again=it.tries>0;
 const head=`${topBar('flock','FIND YOUR LAMBS')}<div class="gamebar"><span class="round">LAMB ${Math.min(G.pos+1,G.total)}/${G.total}</span><span class="sp"></span><span class="found">${spr('sheep',2)} ${done} HOME</span></div>`;
 const q=`<section class="box dark"><div class="lbl">${again?'ONE MORE TRY · ':''}LAMB #${qa.n}</div><div class="qtext">${esc(qa.q)}</div><div class="row" style="margin-top:12px"><button class="btn sm" data-act="sayHerdQ">${ic('speaker')} HEAR IT</button></div></section>`;
 if(C.self){
  return`${head}${q}${C.show?`<section class="box"><div class="lbl">ANSWER</div><p style="font-size:20px;margin:0">${esc(qa.a)}</p></section><div class="tip">Did you say it right?</div><div class="row"><button class="btn ok" data-act="herdSelf" data-ok="1">I KNEW IT!</button><button class="btn" data-act="herdSelf" data-ok="0">NOT YET</button></div>`
   :`<div class="tip">Say the answer out loud, then check.</div><button class="btn pri" style="width:100%" data-act="herdShow">${ic('eye')} CHECK MY ANSWER</button>`}`;
 }
 return`${head}${q}<div class="tip">Pick the right answer to bring this lamb home.</div>
 <div class="opts">${C.opts.map(j=>`<button class="opt long ${C.wrong.has(j)?'bad':''}" data-act="herdPick" data-j="${j}" ${C.wrong.has(j)?'disabled':''}>${esc(shortText(QAS()[j].a,18))}</button>`).join('')}</div>`;
}
function herdResult(ok){
 const k=kid(),it=G.queue.shift();G.busy=true;
 if(ok){
  // home: a first-try answer stretches the gap; a lamb that needed another try starts over
  srsReview(k,it.i,it.tries===0);k.stats.found++;G.found.push(it.i);G.pos++;save(k);sfx.coin();
 }else if(it.tries<1){it.tries++;G.queue.push(it);sfx.bad();toast('Almost! This lamb gets one more try.');}
 else{G.stray.push(it.i);G.pos++;sfx.bad();}
 const tok=G;setTimeout(()=>{if(G!==tok||V.name!=='herd')return;if(!G.queue.length)return finishHerd();loadHerd();render();window.scrollTo(0,0);},ok?550:900);
}
function finishHerd(){
 if(G.done)return;G.done=true;
 const k=kid(),n=G.found.length,coins=n*3,left=lostIdx(k).filter(i=>!G.stray.includes(i)).length;k.coins+=coins;save(k);const extra=n?celebrate(k):'';
 showModal(`<div class="parade" style="margin:6px 0 10px;flex-wrap:wrap">${G.found.slice(0,8).map(()=>spr('sheep',4)).join('')||spr('sheep',4,LOSTG)}</div>
 <h2>${n===G.total?'ALL FOUND!':n?'LAMBS FOUND!':'KEEP LOOKING!'}</h2>
 <p>${n?`You brought <b>${n}</b> lamb${n===1?'':'s'} home!`:'These lambs are still wandering. Try again soon!'}</p>
 ${n?`<div class="rewards"><div class="rw">${spr('coin',3)} +${coins} COINS</div>${extra}</div>`:''}
 ${G.stray.length?`<p class="tiny">${G.stray.length} lamb${G.stray.length===1?' is':'s are'} still out there. Practice ${G.stray.length===1?'it':'them'} on the map, or look again later.</p>`:''}
 ${n?'<p style="font-size:16px;color:var(--mut)">“Rejoice with me; for I have found my sheep which was lost.” Luke 15:6</p>':''}
 <div class="col">${left?`<button class="btn acc" data-act="startHerd">FIND ${left} MORE</button>`:''}<button class="btn ok" data-act="go" data-to="flock">BACK TO MY FLOCK</button></div>`);
 if(n){sfx.win();setTimeout(()=>confetti(n===G.total?160:80),150);}
}
