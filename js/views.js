// Catechism Quest: the map, menus, flock, shop, jukebox and settings screens.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// ================= PATH =================
// Each catechism is split into lands (4 questions each, or one Lord's Day); every land ends in a bonus castle.
function nodes(){const q=QD(),out=[];if(!q)return out;q.lands.forEach((l,s)=>{l.qs.forEach(n=>out.push({t:'q',i:n-1,s}));out.push({t:'c',s});});return out;}
function isDone(k,n){return n.t==='q'?stars(k,n.i)>0:!!k.cps[ckey(k.quest,n.s)];}
function curIdx(k){const ns=nodes();const i=ns.findIndex(n=>!isDone(k,n));return i<0?ns.length:i;}
const isOpen=k=>!!(k&&k.open[k.quest]);   // a grown-up let this kid play any level
const shortText=(t,n)=>{const w=words(t);return w.length>n?w.slice(0,n).join(' ')+' …':t;};

// ----- reading pasted questions and answers (for quests families make themselves) -----
// Question numbers like "1.", "Q1:", "Question 1" (but not a verse ref like "3:16").
const QPRE=[/^(?:question|q)\s*\d+\s*[:.)\-–]?\s*/i,/^(?:question|q)\s*[:.)\-–]\s*/i,/^\d+\s*(?:[.)\-–]|:(?!\d))\s*/];
// Answer labels: "Answer:", "Children's Answer", "Adult answer:" (straight or curly apostrophes).
const ALAB=/^(?:(children'?s|child'?s|kids'?|kid'?s)\s+|(adults?'?s?)\s+)?answers?\s*(?:[:.)\-–]\s*|$)/i;
const APRE=/^a\s*[:.)\-–]\s*/i;
const QEND=/\?["”’)]*$/;
const QSPLIT=/^(.*?\?["”’)]*)\s+(\S.*)$/;
function parseQA(t,use){
 const out=[];let cur=null;
 const addA=l=>{
  if(!cur)return;
  const m=l.replace(/[’‘]/g,"'").match(ALAB);
  if(m){cur.slot=m[1]?'child':m[2]?'adult':'a';l=l.slice(m[0].length);}
  else if(APRE.test(l))l=l.replace(APRE,'');
  l=l.trim();if(l)cur[cur.slot]=(cur[cur.slot]?cur[cur.slot]+' ':'')+l;
 };
 const addQ=text=>{
  text=text.trim();if(!text)return;
  const m=text.match(QSPLIT);
  if(m&&!QEND.test(text)){cur.q=(cur.q?cur.q+' ':'')+m[1];cur.open=false;addA(m[2]);return;}
  cur.q=(cur.q?cur.q+' ':'')+text;if(QEND.test(text))cur.open=false;
 };
 const startQ=text=>{cur={q:'',open:true,a:'',child:'',adult:'',slot:'a'};out.push(cur);addQ(text);};
 const hasA=c=>!!(c.a||c.child||c.adult);
 String(t||'').split(/\r?\n/).forEach(raw=>{
  const l=raw.trim();if(!l)return;
  if(/^questions?\s*:?$/i.test(l))return;
  for(const re of QPRE){const m=l.match(re);if(m)return startQ(l.slice(m[0].length));}
  const isLabel=ALAB.test(l.replace(/[’‘]/g,"'"))||APRE.test(l);
  if(cur&&cur.open&&!isLabel)return addQ(l);   // a question that wraps onto more lines
  if(isLabel)return addA(l);
  if(QEND.test(l))return startQ(l);
  if(QSPLIT.test(l)&&(!cur||hasA(cur)))return startQ(l); // "Question? Answer." on one line
  addA(l);
 });
 const both=out.some(x=>x.child&&x.adult);
 const items=out.map(x=>({q:x.q.trim(),a:(use==='adult'?(x.adult||x.a||x.child):(x.child||x.a||x.adult)).trim()})).filter(x=>x.q&&x.a).slice(0,400);
 return{items,both};
}
const serializeQA=qas=>qas.map((x,i)=>(i+1)+'. '+x.q+'\n'+x.a).join('\n\n');

// ================= VIEWS =================
let V={name:'title'},G={},CR={hero:null,name:'',editId:null},DEL=null,started=false,MK={id:null,title:'',text:'',ans:'child',back:'quests'};
function nav(v){V=v;V.scroll=true;DEL=null;closeModal();render();window.scrollTo(0,0);}
function render(){
 const k=kid();
 if(['map','flock','shop','music','quests','herd'].includes(V.name)&&!(k&&k.hero))V={name:S.kids.length?'players':'title'};
 else if(['map','flock','shop','music','herd'].includes(V.name)&&!QD())V={name:'quests'};
 const f={title:titleV,players:playersV,create:createV,quests:questsV,map:mapV,study:studyV,fill:fillV,bonus:bonusV,herd:herdV,build:buildV,guard:guardV,flock:flockV,shop:shopV,music:musicV,settings:settingsV,maker:makerV}[V.name]||titleV;
 app.innerHTML=f();
 $('#nav').innerHTML=['map','flock','shop','music'].includes(V.name)?navBar():'';
 document.body.classList.toggle('hasnav',!!$('#nav').innerHTML);
 // center the current level only when arriving at the map, not on every re-render
 if(V.name==='map'&&V.scroll){V.scroll=false;requestAnimationFrame(()=>{const c=document.querySelector('.node.cur');if(c)c.scrollIntoView({block:'center'});pickScene();});}
 pickScene();
}
function navBar(){
 const it=[['map','MAP',spr('flag',4)],['flock','FLOCK',spr('sheep',3)],['shop','SHOP',spr('coin',4)],['music','MUSIC',spr('note',3,{k:'#ffffff',m:'#ffd23f'})]];
 const lost=lostIdx(kid()).length;
 return`<div class="nav">${it.map(x=>`<button class="${V.name===x[0]?'on':''}" data-act="go" data-to="${x[0]}">${x[2]}${x[1]}${x[0]==='flock'&&lost?`<span class="badge" aria-label="${lost} lost">${lost}</span>`:''}</button>`).join('')}</div>`;
}
function hud(){
 const k=kid(),q=QD();
 return`<div class="hud"><button class="who" data-act="players">${heroImg(k,2)}<span>${esc(k.name)}</span></button>
 <button class="ib ${S.music?'':'off'}" data-act="toggleMusic" aria-label="Music">${ic('note',3)}</button><button class="ib" data-act="go" data-to="settings" aria-label="Settings">${ic('gear',3)}</button></div>
 <div class="hud2"><span class="chip">${spr('coin',2)}<b>${k.coins}</b><i>COINS</i></span><span class="chip">${spr('sheep',2)}<b>${sheepCount(k)}</b><i>LAMBS</i></span><span class="chip">${spr('sword',2)}<b>${k.swords}</b><i>SWORDS</i></span></div>
 <button class="qbar" data-act="go" data-to="quests" aria-label="Change quest"><span>${esc(q.short.toUpperCase())}</span><span class="sp"></span><span>${learnedIn(k,k.quest)}/${N()} ${ic('play',2,W)}</span></button>`;
}
function topBar(to,title){return`<div class="top"><button class="ib" data-act="go" data-to="${to}" aria-label="Back">${ic('back',3)}</button><div class="ttl">${esc(title)}</div><span style="width:46px"></span></div>`;}

function titleV(){
 return`<div class="title"><div class="logo">CATECHISM<br>QUEST<small>LEARN · PLAY · PRAISE</small></div>
 <div class="parade">${HERO_KEYS.map(h=>spr(h,4)).join('')}</div><div class="ground"></div>
 <div class="blink" data-act="start">PRESS START</div>
 <p class="tiny" style="color:#fff;text-shadow:2px 2px 0 #1b1530;margin-top:24px">Westminster Shorter Catechism<br>Heidelberg Catechism</p>
 <div style="max-width:340px;margin:18px auto 0">${installHTML()}</div></div>`;
}
// ----- install to home screen -----
let DEFER=null;
const standalone=()=>{try{return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;}catch(e){return false;}};
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
addEventListener('beforeinstallprompt',e=>{e.preventDefault();DEFER=e;if(['title','settings'].includes(V.name))render();});
addEventListener('appinstalled',()=>{DEFER=null;if(['title','settings'].includes(V.name))render();});
function installHTML(){
 if(standalone()||window.top!==window)return'';
 if(DEFER)return`<button class="btn gold" style="width:100%" data-act="install">⬇ INSTALL THE APP</button>`;
 if(isIOS)return`<div class="tip" style="margin:0">To install: tap the Share button <b>⬆</b>, then <b>Add to Home Screen</b>.</div>`;
 return'';
}
function playersV(){
 return`<div class="top"><span style="width:46px"></span><div class="ttl">WHO'S PLAYING?</div><button class="ib" data-act="go" data-to="settings" aria-label="Settings">${ic('gear',3)}</button></div>
 <div class="plist">${S.kids.map(k=>{const c=CAT[k.quest];return`<button class="pbtn" data-act="pickKid" data-id="${k.id}">${k.hero?heroImg(k,4):spr('knight',4,{a:'#c9c3d6',b:'#9a93b0',c:'#c9c3d6',r:'#c9c3d6',y:'#c9c3d6'})}<div><div class="pn">${esc(k.name)}</div><div class="pp">${!k.hero?'Tap to choose a hero':c?`${HEROES[k.hero].name} · ${esc(c.short)} ${learnedIn(k,k.quest)}/${c.qas.length}`:'Tap to pick a quest'}</div></div></button>`;}).join('')}</div>
 <button class="btn acc" style="width:100%" data-act="newHero">+ NEW HERO</button>`;
}
function createV(){
 return`${topBar(S.kids.length?'players':'title','CHOOSE YOUR HERO')}
 <div class="heroes">${HERO_KEYS.map(h=>`<button class="hcard ${CR.hero===h?'on':''}" data-act="pickHero" data-h="${h}">${spr(h,5)}<div class="hn">${HEROES[h].name.toUpperCase()}</div><div class="hd">${HEROES[h].desc}</div></button>`).join('')}</div>
 <div class="box"><div class="lbl">YOUR NAME</div><input class="name" id="cname" maxlength="16" placeholder="Type your name" value="${esc(CR.name)}" autocomplete="off"></div>
 <button class="btn ok" style="width:100%" data-act="createGo" ${CR.hero?'':'disabled'}>${CR.hero?'NEXT '+ic('play',2,W):'PICK A HERO'}</button>`;
}
function questsV(){
 const k=kid();
 return`${topBar(k.quest?'map':'players','CHOOSE A QUEST')}
 ${QUEST_KEYS.map(id=>{const c=CAT[id],n=c.qas.length,l=learnedIn(k,id);return`<button class="qcard ${k.quest===id?'on':''}" data-act="pickQuest" data-q="${id}"><div class="qt">${esc(c.title.toUpperCase())}</div><div class="qy">${c.custom?'Your own quest':c.year} · ${n} question${n===1?'':'s'} · ${c.lands.length} ${id==='hc'?'Lord’s Days':c.lands.length===1?'land':'lands'}</div><div class="bar" style="margin-top:0"><i style="width:${Math.round(l/n*100)}%"></i></div><div class="tiny" style="margin-top:8px">${l?`${l} of ${n} learned`:'Not started yet'}</div></button>`;}).join('')}
 <button class="btn acc" style="width:100%" data-act="mkNew">+ MAKE YOUR OWN QUEST</button>
 ${S.custom.length?`<div class="row" style="margin-top:10px"><button class="btn sm" data-act="go" data-to="settings">✎ EDIT MY QUESTS</button></div>`:''}
 <p class="tiny center" style="color:var(--k)">${esc(k.name)} keeps separate progress in each quest. Switch anytime.</p>`;
}
// ----- make your own quest -----
function mkCountText(){
 const r=parseQA(MK.text,MK.ans),n=r.items.length;
 if(!MK.text.trim())return'Paste your questions and answers above.';
 if(!n)return'No questions found yet. Each question should end with “?” and its answer should follow.';
 const f=r.items[0];return`Found ${n} question${n===1?'':'s'} (${Math.ceil(n/4)} land${n>4?'s':''}). First: “${shortText(f.q,12)}”`;
}
function makerV(){
 const r=parseQA(MK.text,MK.ans);
 return`${topBar(MK.back,MK.id?'EDIT QUEST':'MAKE A QUEST')}
 <section class="box"><div class="lbl">QUEST NAME</div><input class="name" id="mkTitle" maxlength="40" placeholder="e.g. Our Family Catechism" value="${esc(MK.title)}" autocomplete="off">
 <div class="lbl" style="margin-top:16px">QUESTIONS AND ANSWERS</div>
 <p class="tiny" style="margin-top:0">Type or paste them in order. Each question ends with “?” and its answer comes right after. Numbers like “1.” or “Q1” are fine. Leave out Bible verses and commentary so kids learn just the answer.</p>
 <textarea class="tall" id="mkText" placeholder="1. What is the chief end of man?&#10;Man’s chief end is to glorify God, and to enjoy him for ever.&#10;&#10;2. What rule hath God given…?">${esc(MK.text)}</textarea>
 <div id="mkBoth" style="display:${r.both?'block':'none'}"><p class="tiny" style="margin:0 0 8px">This text has children’s and adult answers. Which should kids learn?</p>
 <label class="tog"><input type="radio" name="mkAns" value="child" ${MK.ans!=='adult'?'checked':''}> Children’s answers</label>
 <label class="tog"><input type="radio" name="mkAns" value="adult" ${MK.ans==='adult'?'checked':''}> Adult answers</label></div>
 <div class="tip" id="mkCount" aria-live="polite">${esc(mkCountText())}</div></section>
 <button class="btn ok" style="width:100%" data-act="mkSave">SAVE QUEST</button>
 <p class="tiny center" style="color:var(--k);margin-top:14px">Your quest is saved only on this device. It is never uploaded or shared. Keep your own copy of the text too, in case this device’s data is cleared. Please use texts you have permission to use.</p>`;
}

function mapV(){
 const k=kid(),q=QD(),n=N(),ns=nodes(),cur=curIdx(k),X=[50,74,50,26],open=isOpen(k);
 let lands='',idx=0;
 q.lands.forEach((land,s)=>{
  const sec=ns.filter(x=>x.s===s);
  const rows=sec.map((nd,j)=>({nd,gi:idx+j,x:nd.t==='c'?50:X[j%4]}));
  const H=rows.length*92,pts=rows.map((r,j)=>`${r.x},${j*92+46}`).join(' ');
  const th=themeOf(q,s),sub=(q.id==='hc'?land.name:`Land ${s+1}`)+' · '+th.r;
  lands+=`<div class="land" data-s="${s}"><div class="landname" style="background:${th.c}"><span class="emb">${spr(th.e,th.e==='castle'||th.e==='lion'||th.e==='sheep'?2:3,th.m)}</span><span><b>${esc(th.n.toUpperCase())}${k.guard[ckey(q.id,s)]?' '+spr('shield',2):''}</b><small>${esc(sub)}</small></span></div><div class="path"><svg viewBox="0 0 100 ${H}" preserveAspectRatio="none" style="height:${H}px"><polyline points="${pts}" fill="none" stroke="#1b1530" stroke-width="6" stroke-dasharray="2 12" vector-effect="non-scaling-stroke" stroke-linecap="square"/></svg>
  ${rows.map(r=>{const st=isDone(k,r.nd)?'done':r.gi===cur?'cur':open?'':'lock';const me=r.gi===cur?`<span class="me">${heroImg(k,3)}</span>`:'';
   if(r.nd.t==='q'){const p=stars(k,r.nd.i);const crn=k.mast[pkey(k.quest,r.nd.i)]?`<span class="crn">${spr('crown',3)}</span>`:'';return`<div class="nrow"><button class="node ${st}" style="left:${r.x}%" data-act="node" data-g="${r.gi}" aria-label="Question ${q.qas[r.nd.i].n}${crn?' (crowned)':''}">${me}${crn}<span class="nn">${st==='lock'?spr('lock',3,LOCKG):q.qas[r.nd.i].n}</span><span class="ns">${st==='done'?starRow(p):st==='cur'?'GO!':''}</span></button></div>`;}
   return`<div class="nrow"><button class="node castle ${st}" style="left:${r.x}%" data-act="node" data-g="${r.gi}" aria-label="Bonus castle">${me}${spr('castle',4,st==='lock'?{a:'#ddd8e8',b:'#b3acc6',r:'#b3acc6'}:null)}<span class="ns">${st==='done'?'CLEAR':'BONUS'}</span></button></div>`;}).join('')}</div>${guardBtn(k,s)}</div>`;
  idx+=sec.length;
 });
 const doneAll=cur>=ns.length;
 return hud()+(doneAll?`<div class="box center"><h2 style="font-size:13px;color:var(--pri2)">QUEST COMPLETE!</h2><p style="font-size:18px">You learned all ${n} questions of the ${esc(q.title)} and walked all the way from the Garden of Eden to the New Jerusalem! Replay any level to earn more stars and coins.</p></div>`:'')+lands;
}

// ----- flock / shop / music / settings -----
function flockV(){
 const k=kid(),q=QD(),learned=learnedIdx(k),lost=lostIdx(k),lostSet=new Set(lost),home=learned.filter(i=>!lostSet.has(i));
 const H=Math.max(300,140+Math.ceil(home.length/6)*46);
 let seed=7;const r=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};
 const lambs=home.map(i=>{const x=6+r()*80,y=48+r()*(H-140);return`<button class="lamb ${r()>.5?'flip':''}" style="left:${x}%;top:${y}px;animation-delay:-${(r()*2).toFixed(2)}s" data-act="lamb" data-i="${i}" aria-label="Lamb for question ${q.qas[i].n}">${spr('sheep',4)}</button>`;}).join('');
 // lost lambs wait far off in the hills, small and gray, until they're found
 seed=11;const strays=lost.slice(0,14).map(()=>`<span class="stray ${r()>.5?'flip':''}" style="left:${4+r()*88}%;top:${6+r()*34}px">${spr('sheep',2,LOSTG)}</span>`).join('');
 const next=home.map(i=>srsOf(k,i).d).sort((x,y)=>x-y)[0];
 const msg=!learned.length?'Learn your first question to welcome your first lamb!'
  :lost.length?`<b>${lost.length}</b> lamb${lost.length===1?' has':'s have'} wandered off into the hills! Lambs wander when it's time to review. Find them to bring them home.`
  :`All <b>${home.length}</b> lamb${home.length===1?' is':'s are'} safe at home. Tap a lamb to practice its question.${next!=null?` A lamb may wander ${daysText(next-today())}.`:''}`;
 return`${hud()}<section class="box"><div class="lbl">YOUR ${esc(q.short.toUpperCase())} FLOCK</div><p style="font-size:19px;margin:0">${msg}</p>
 ${lost.length?`<button class="btn acc" style="width:100%;margin-top:14px" data-act="startHerd">${ic('crook',3,W)} FIND YOUR LOST LAMBS (${lost.length})</button>`:''}</section>
 ${lost.length?`<div class="hills" aria-label="${lost.length} lost lambs in the hills">${strays}</div>`:''}
 <div class="pasture" style="height:${H}px"><div class="fence"></div>${lambs}<div class="shep">${heroImg(k,4)}</div></div>
 <section class="box center"><p style="font-size:19px;margin:0">${lost.length?'“What man of you, having an hundred sheep, if he lose one of them, doth not leave the ninety and nine… and go after that which is lost, until he find it?”<br><span class="tiny">Luke 15:4</span>':'“I am the good shepherd.”<br><span class="tiny">John 10:11</span>'}</p></section>`;
}
function shopV(){
 const k=kid(),h=k.hero,cur=(k.colors[h]||0),owned=k.owned[h]||[0];
 return`${hud()}<section class="box"><div class="lbl">YOUR HERO</div>
 <div class="hrow">${HERO_KEYS.map(x=>`<button class="${x===h?'on':''}" data-act="setHero" data-h="${x}" aria-label="${HEROES[x].name}">${spr(x,3,HEROES[x].colors[k.colors[x]||0].m)}</button>`).join('')}</div>
 <div class="lbl">${HEROES[h].name.toUpperCase()} COLORS</div>
 <div class="grid3">${HEROES[h].colors.map((c,i)=>{const has=i===0||owned.includes(i);return`<button class="item ${cur===i?'on':''}" data-act="color" data-i="${i}">${spr(h,4,c.m)}<div class="in">${c.n.toUpperCase()}</div><div class="ip">${cur===i?'WEARING':has?'WEAR':spr('coin',2)+' '+c.cost}</div></button>`;}).join('')}</div></section>
 <section class="box"><div class="lbl">POWER-UPS</div>
 <div class="row"><div style="flex:1;font-size:18px">${spr('sword',4)} <b>Sword</b> — knocks out one wrong answer during a game.</div><button class="btn sm gold" style="flex:none" data-act="buySword">${spr('coin',2)} ${SWORD_COST}</button></div></section>
 <p class="tiny center">Earn coins by finishing questions and bonus castles. Replays earn coins too!</p>`;
}
function musicV(){
 const k=kid();
 return`${hud()}<section class="box"><div class="lbl">HYMN JUKEBOX</div><p style="font-size:18px;margin:0 0 4px">8-bit versions of classic hymns. Unlock new songs with coins. Your unlocked hymns play on shuffle while you play. Tap one to hear it now.</p></section>
 ${SONGS.map((s,i)=>{const has=k.songs.includes(i),on=MU.on&&MU.k===i;return`<button class="song ${has?'':'lock'} ${on||(!MU.on&&k.song===i)?'on':''}" data-act="song" data-i="${i}"><span class="si">${has?(on?'<span class="eq"><i></i><i></i><i></i><i></i></span>':ic('play',3)):ic('lock',3,LOCKG)}</span><span><div class="st">${esc(s.t.toUpperCase())}</div><div class="sb">${esc(s.tune)} · ${esc(s.by)}</div></span>${has?'':`<span class="pr">${spr('coin',2)}${SONG_COST}</span>`}</button>`;}).join('')}
 <div class="row" style="margin-top:6px"><button class="btn sm" data-act="toggleMusic">${S.music?ic('stop')+' MUSIC OFF':ic('note')+' MUSIC ON'}</button></div>`;
}
function settingsV(){
 const k=kid(),q=QD();
 return`${topBar(k&&k.hero&&q?'map':'players','SETTINGS')}
 <section class="box"><div class="lbl">PLAYERS</div>
 ${S.kids.map(x=>`<div class="krow">${x.hero?heroImg(x,3):''}<input class="kin" data-kid="${x.id}" value="${esc(x.name)}" maxlength="16" aria-label="Player name"><button class="btn sm bad" data-act="delKid" data-id="${x.id}">${DEL===x.id?'SURE?':'REMOVE'}</button></div>`).join('')}
 <button class="btn sm" data-act="players">SWITCH PLAYER</button></section>
 ${k&&q?`<section class="box"><div class="lbl">${esc(k.name.toUpperCase())} · ${esc(q.short.toUpperCase())}</div>
 <label class="tog"><input type="checkbox" id="openAll" ${isOpen(k)?'checked':''}> Let ${esc(k.name)} play any level (skip ahead)</label>
 <p class="tiny" style="margin-top:-4px">Handy if your family or church is already partway through the catechism.</p>
 <button class="btn sm bad" data-act="resetProg">${DEL==='reset'?'TAP AGAIN TO RESET':'RESET '+esc(k.name.toUpperCase())+'’S '+esc(q.short.toUpperCase())+' PROGRESS'}</button></section>`:''}
 <section class="box"><div class="lbl">MY QUESTS</div>
 ${S.custom.map(c=>`<div class="krow"><span style="flex:1;font-size:18px;overflow-wrap:anywhere">${esc(c.title)} <span class="tiny">(${c.qas.length})</span></span><button class="btn sm" data-act="mkEdit" data-id="${c.id}">EDIT</button><button class="btn sm bad" data-act="mkDel" data-id="${c.id}">${DEL==='q:'+c.id?'SURE?':'DELETE'}</button></div>`).join('')}
 <p class="tiny" style="margin-top:0">${S.custom.length?'Saved only on this device. Deleting a quest also erases everyone’s progress in it.':'Add your own catechism or memory verses as a new quest. It stays on this device.'}</p>
 <button class="btn sm" data-act="mkNew" data-back="settings">+ MAKE YOUR OWN QUEST</button></section>
 <section class="box"><div class="lbl">OPTIONS</div>
 <label class="tog"><input type="checkbox" id="snd" ${S.sound?'checked':''}> Sound effects</label>
 <label class="tog"><input type="checkbox" id="mus" ${S.music?'checked':''}> Music</label>${installHTML()}</section>
 <section class="box"><div class="lbl">ABOUT THE TEXTS</div>
 ${Object.keys(BUILT).map(id=>`<p class="src"><b>${esc(CAT[id].title)}</b> (${CAT[id].year}). ${esc(CAT[id].source)}</p>`).join('')}
 <p class="src">Footnote letters were removed from the Westminster text. In the Heidelberg Catechism, the numbers before the Creed's articles and the Lord's Prayer's petitions were removed so they read as recited, and four printing errors were corrected.</p></section>
 <p class="tiny center">${CLOUD?'Progress is saved to your Claude account and stays in sync across your devices.':'Progress is saved on this device.'}</p>`;
}

// ----- modal -----
function showModal(h){$('#modal').innerHTML=`<div class="ov"><div class="sheet">${h}</div></div>`;}
function closeModal(){$('#modal').innerHTML='';}
