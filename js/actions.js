// Catechism Quest: taps and other input, then start-up.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// ================= ACTIONS =================
function afterGesture(){if(!started){started=true;ac();}syncMusic();}
const A={
 start:()=>{sfx.tap();if(!S.kids.length)CR={hero:null,name:'',editId:null};nav({name:S.kids.length?'players':'create'});},
 players:()=>nav({name:'players'}),
 newHero:()=>{CR={hero:null,name:'',editId:null};nav({name:'create'});},
 pickKid:el=>{const k=S.kids.find(x=>x.id===el.dataset.id);if(!k)return;S.kidId=k.id;persist();if(!k.hero){CR={hero:null,name:k.name,editId:k.id};return nav({name:'create'});}nav({name:k.quest?'map':'quests'});},
 pickHero:el=>{const i=$('#cname');if(i)CR.name=i.value;CR.hero=el.dataset.h;sfx.tap();render();},
 createGo:()=>{
  const i=$('#cname');const name=((i&&i.value)||CR.name||'').trim()||HEROES[CR.hero].name;
  let k=CR.editId&&S.kids.find(x=>x.id===CR.editId);
  if(k){k.name=name;k.hero=CR.hero;}else{k=newKid(name,CR.hero);S.kids.push(k);}
  S.kidId=k.id;save(k);sfx.win();nav({name:k.quest?'map':'quests'});
 },
 pickQuest:el=>{const k=kid();k.quest=el.dataset.q;save(k);sfx.tap();nav({name:'map'});},
 go:el=>{const to=el.dataset.to;nav({name:to,i:V.i});},
 toggleMusic:()=>{S.music=!S.music;persist();syncMusic();render();},
 install:async()=>{if(!DEFER)return;const d=DEFER;DEFER=null;try{d.prompt();await d.userChoice;}catch(e){}render();},
 node:el=>{
  const k=kid(),gi=+el.dataset.g,cur=curIdx(k);
  if(gi>cur&&!isOpen(k)){sfx.bad();shake(el);toast('Finish the earlier levels first!');return;}
  sfx.tap();openNode(gi);
 },
 nextNode:()=>{
  const ns=nodes(),k=kid();let gi;
  if(V.name==='bonus'){gi=ns.findIndex(n=>n.t==='c'&&n.s===V.s)+1;}else{gi=ns.findIndex(n=>n.t==='q'&&n.i===V.i)+1;}
  if(gi>=ns.length||(gi>curIdx(k)&&!isOpen(k))){closeModal();return nav({name:'map'});}
  openNode(gi);
 },
 sayQ:()=>speak(QAS()[V.i].q),
 sayA:()=>speak(QAS()[V.i].a),
 sayBonusQ:()=>speak(QAS()[G.cur.i].q),
 toggleRefs:()=>{G.refs=!G.refs;render();},
 hideMore:()=>{G.level=Math.min(4,G.level+1);G.peek=new Set();sfx.tap();render();},
 showAll:()=>{G.level=0;G.peek=new Set();render();},
 peek:el=>{G.peek.add(+el.dataset.j);render();},
 startFill:()=>startFill(V.i),
 opt:el=>{
  if(G.done)return;
  const F=G.F,j=+el.dataset.k;
  if(norm(F.opts[j])===norm(F.w[F.blanks[F.bi]])){sfx.ok();F.bi++;if(F.bi>=F.blanks.length){render();return finishLevel();}makeOpts(F);render();
   const b=document.querySelector('.fb.cur');if(b){const r=b.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight*.55)b.scrollIntoView({block:'center'});}}
  else{G.mistakes++;F.wrong.add(j);sfx.bad();render();shake(document.querySelector(`.opt[data-k="${j}"]`));}
 },
 useSword:()=>{
  const k=kid();if(k.swords<1||G.busy||G.done)return;
  if(V.name==='fill'){const F=G.F,correct=norm(F.w[F.blanks[F.bi]]);const left=F.opts.map((o,j)=>j).filter(j=>!F.wrong.has(j)&&norm(F.opts[j])!==correct);if(!left.length)return toast('Only the right answer is left!');F.wrong.add(rnd(left));}
  else if(['bonus','guard','build'].includes(V.name)){const C=G.cur;
   if(C.segs){const exp=C.segs[C.seg][C.pos];const t=C.tiles.find(x=>!x.used&&norm(x.w)===norm(exp));if(!t)return;k.swords--;save(k);sfx.sword();render();const b=document.querySelector(`.wt[data-id="${t.id}"]`);if(b)b.classList.add('glow');return;}
   const left=C.opts.filter(j=>j!==C.i&&!C.wrong.has(j));if(!left.length)return toast('Only the right answer is left!');C.wrong.add(rnd(left));}
  else return;
  k.swords--;save(k);sfx.sword();render();
 },
 tile:el=>{
  if(G.busy)return;
  const C=G.cur,t=C.tiles.find(x=>x.id===+el.dataset.id);if(!t||t.used)return;
  const seg=C.segs[C.seg],exp=seg[C.pos];
  if(norm(t.w)===norm(exp)){
   t.used=true;C.placed.push(exp);C.pos++;sfx.ok();
   if(C.pos>=seg.length){C.seg++;C.pos=0;if(C.seg>=C.segs.length){render();return advanceSoon(500);}C.tiles=shuffleNew(C.segs[C.seg].map((w,j)=>({w,id:j,used:false})));}
   render();
  }else{missed();shake(el);const hb=document.querySelector('.hearts');if(hb)hb.outerHTML=gameHearts();}
 },
 pick:el=>{
  if(G.busy)return;
  const C=G.cur,j=+el.dataset.j;
  if(j===C.i){sfx.ok();el.classList.add('good');advanceSoon(450);}
  else{missed();C.wrong.add(j);render();shake(document.querySelector(`.opt[data-j="${j}"]`));}
 },
 startHerd:()=>{closeModal();sfx.tap();startHerd();},
 startBuild:()=>{const i=V.i;closeModal();sfx.tap();startBuild(i);},
 guard:el=>{closeModal();sfx.tap();startGuard(+el.dataset.s);},
 guardAgain:()=>{closeModal();startGuard(V.s);},
 herdPick:el=>{
  if(G.busy||G.done)return;const C=G.cur,j=+el.dataset.j;
  if(j===C.i){el.classList.add('good');herdResult(!G.miss);}
  else{G.miss=true;C.wrong.add(j);sfx.bad();render();shake(document.querySelector(`.opt[data-j="${j}"]`));}
 },
 herdShow:()=>{G.cur.show=true;speak(QAS()[G.cur.i].a);render();},
 herdSelf:el=>{if(G.busy||G.done)return;herdResult(el.dataset.ok==='1');},
 sayHerdQ:()=>speak(QAS()[G.cur.i].q),
 lamb:el=>{const i=+el.dataset.i,it=QAS()[i],r=srsOf(kid(),i);sfx.tap();showModal(`${spr('sheep',6)}<h2>LAMB #${it.n}</h2><p><b>Q${it.n}.</b> ${esc(it.q)}</p><p style="color:var(--mut)">Can you say the answer?${r?`<br><span class="tiny">This lamb may wander ${daysText(r.d-today())}.</span>`:''}</p><div class="col"><button class="btn" data-act="lambAns" data-i="${i}">SHOW ANSWER</button><button class="btn" data-act="closeModal">CLOSE</button></div>`);speak(it.q);},
 lambAns:el=>{const it=QAS()[+el.dataset.i];el.outerHTML=`<p style="font-size:20px;text-align:left"><b>${esc(it.a)}</b></p>`;speak(it.a);},
 closeModal:()=>closeModal(),
 setHero:el=>{const k=kid();k.hero=el.dataset.h;save(k);sfx.tap();render();},
 color:el=>{
  const k=kid(),h=k.hero,i=+el.dataset.i,c=HEROES[h].colors[i],owned=k.owned[h]||(k.owned[h]=[0]);
  if(i===0||owned.includes(i)){k.colors[h]=i;save(k);sfx.tap();return render();}
  if(k.coins<c.cost){sfx.bad();return toast('Not enough coins yet!');}
  k.coins-=c.cost;owned.push(i);k.colors[h]=i;save(k);sfx.coin();render();toast('New look unlocked!');
 },
 buySword:()=>{const k=kid();if(k.coins<SWORD_COST){sfx.bad();return toast('Not enough coins yet!');}k.coins-=SWORD_COST;k.swords++;save(k);sfx.coin();render();},
 song:el=>{
  const k=kid(),i=+el.dataset.i;
  if(!k.songs.includes(i)){if(k.coins<SONG_COST){sfx.bad();return toast('Not enough coins yet!');}k.coins-=SONG_COST;k.songs.push(i);sfx.coin();toast('Hymn unlocked!');setTimeout(()=>achToast(k),1400);}
  k.song=i;S.music=true;save(k);playSong(i);render();
 },
 delKid:el=>{const id=el.dataset.id;if(DEL!==id){DEL=id;return render();}S.kids=S.kids.filter(k=>k.id!==id);DIRTY.delete(id);if(!S.dels.includes(id))S.dels.push(id);DEL=null;fix();save();if(!kid())return nav({name:S.kids.length?'players':'create'});render();},
 mkNew:el=>{MK={id:null,title:'',text:'',ans:'child',back:el.dataset.back||'quests'};nav({name:'maker'});},
 mkEdit:el=>{const c=S.custom.find(x=>x.id===el.dataset.id);if(!c)return;MK={id:c.id,title:c.title,text:serializeQA(c.qas),ans:'child',back:'settings'};nav({name:'maker'});},
 mkSave:()=>{
  const ti=$('#mkTitle'),tx=$('#mkText');if(ti)MK.title=ti.value;if(tx)MK.text=tx.value;
  const r=parseQA(MK.text,MK.ans);
  if(!r.items.length){sfx.bad();shake($('#mkCount'));return toast('Add at least one question and answer');}
  const title=MK.title.trim()||'My Quest',isNew=!MK.id;
  let c=!isNew&&S.custom.find(x=>x.id===MK.id);
  if(c){c.title=title;c.qas=r.items;}else{c={id:'my_'+uid(),title,qas:r.items,made:Date.now()};S.custom.push(c);}
  fix();persist();sfx.win();
  const k=kid();
  if(isNew&&k&&k.hero){k.quest=c.id;save(k);nav({name:'map'});}else nav({name:MK.back});
  toast('Quest saved!');
 },
 mkDel:el=>{
  const id=el.dataset.id;if(DEL!=='q:'+id){DEL='q:'+id;return render();}
  S.custom=S.custom.filter(c=>c.id!==id);const p=id+':';
  S.kids.forEach(k=>{let ch=false;[k.prog,k.cps,k.srs,k.mast,k.guard].forEach(o=>Object.keys(o).forEach(x=>{if(x.startsWith(p)){delete o[x];ch=true;}}));
   if(id in k.open){delete k.open[id];ch=true;}if(k.quest===id){k.quest=null;ch=true;}if(ch)save(k);});
  DEL=null;fix();persist();render();toast('Quest deleted');
 },
 resetProg:()=>{
  if(DEL!=='reset'){DEL='reset';return render();}
  const k=kid(),p=k.quest+':';[k.prog,k.cps,k.srs,k.mast,k.guard].forEach(o=>Object.keys(o).forEach(x=>{if(x.startsWith(p))delete o[x];}));
  DEL=null;save(k);render();toast('Progress reset');
 }
};
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-act]');
 if(!el||el.disabled){if(V.name==='title'){A.start();afterGesture();}return;}
 const f=A[el.dataset.act];if(f)f(el,e);afterGesture();
});
document.addEventListener('change',e=>{
 const t=e.target;
 if(t.matches('.kin')){const k=S.kids.find(x=>x.id===t.dataset.kid);if(k){k.name=t.value.trim()||k.name;save(k);}}
 if(t.id==='snd'){S.sound=t.checked;persist();}
 if(t.id==='mus'){S.music=t.checked;persist();syncMusic();}
 if(t.id==='openAll'){const k=kid();if(k){k.open[k.quest]=t.checked;save(k);}}
 if(t.name==='mkAns'){MK.ans=t.value;const c=$('#mkCount');if(c)c.textContent=mkCountText();}
});
document.addEventListener('input',e=>{
 const t=e.target;
 if(t.id==='cname')CR.name=t.value;
 if(t.id==='mkTitle')MK.title=t.value;
 if(t.id==='mkText'){MK.text=t.value;const c=$('#mkCount'),b=$('#mkBoth');if(c)c.textContent=mkCountText();if(b)b.style.display=parseQA(MK.text).both?'block':'none';}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='cname'&&CR.hero)A.createGo();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSong();});

render();
initCloud();
// Offline support when installed from a website (not inside Claude, where service workers aren't available).
try{if(window.top===window&&'serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});}catch(e){}
// test hook
window.__CQ={get S(){return S;},MU,SONGS,get V(){return V;},get G(){return G;},A,nodes,curIdx,render,startBonus,startFill,finishLevel,startBuild,startGuard,landDone,stars,QAS,QD,fix,parseQA,CAT,ACH,checkAch,streakNow,SCENES,sceneURL,setScene,pickScene,themeOf};
