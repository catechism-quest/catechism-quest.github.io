// Catechism Quest: the adventure world map, an overworld of every place in the journey.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// Each place (SCENES) shows as an island on a winding road. Places the kid has reached can be visited:
// the hero walks there and a card shows what's been done there, with a button to jump into that land.
// Long quests (Heidelberg's 52 Lord's Days) put several lands at one place.
const J_ROW=118,J_X=[22,52,78,48];
function placeLands(q,p){const out=[];q.lands.forEach((l,s)=>{if(sceneOf(q,s)===p)out.push(s);});return out;}
function landStart(s){return nodes().findIndex(n=>n.s===s);}
function placeReached(k,q,p){const ls=placeLands(q,p);return ls.length>0&&(isOpen(k)||ls.some(s=>landStart(s)<=curIdx(k)));}
function placeStats(k,q,p){
 const ls=placeLands(q,p),qs=[].concat(...ls.map(s=>q.lands[s].qs.map(n=>n-1)));
 return{ls,total:qs.length,learned:qs.filter(i=>stars(k,i)>0).length,stars:qs.reduce((a,i)=>a+stars(k,i),0),
  crowns:qs.filter(i=>k.mast[pkey(q.id,i)]).length,castles:ls.filter(s=>k.cps[ckey(q.id,s)]).length,guards:ls.filter(s=>k.guard[ckey(q.id,s)]).length};
}
// Where the hero stands: the last place tapped, or the place of the kid's current level.
function heroPlace(k,q){
 if(V.jp!=null)return V.jp;
 const n=nodes()[Math.min(curIdx(k),nodes().length-1)];return n?sceneOf(q,n.s):0;
}
const jPos=p=>({x:J_X[p%4],y:60+p*J_ROW});
function journeyV(){
 const k=kid(),q=QD(),hp=heroPlace(k,q),places=SCENES.map((s,p)=>p).filter(p=>placeLands(q,p).length);
 const H=60+SCENES.length*J_ROW,pts=places.map(p=>{const o=jPos(p);return`${o.x},${o.y}`;}).join(' ');
 const nodesH=places.map(p=>{
  const o=jPos(p),th=themeOf(q,placeLands(q,p)[0]),st=placeStats(k,q,p),open=placeReached(k,q,p),done=st.learned===st.total;
  return`<button class="jn ${open?'':'lock'} ${done?'done':''} ${k.visited[p]?'seen':''}" style="left:${o.x}%;top:${o.y}px" data-act="jPlace" data-p="${p}" aria-label="${esc(th.n)}${open?'':' (locked)'}">
   <span class="jimg" style="background-image:url(${sceneURL(p)})"></span>
   <span class="jemb" style="background:${th.c}">${spr(th.e,th.e==='castle'||th.e==='lion'||th.e==='sheep'?1:2,th.m)}</span>
   ${open?'':`<span class="jlock">${spr('lock',3,LOCKG)}</span>`}
   <span class="jname">${esc(th.n.toUpperCase())}</span>
   ${open&&st.learned?`<span class="jprog">${st.learned}/${st.total}${st.guards?' '+spr('shield',1):''}</span>`:''}
  </button>`;}).join('');
 const o=jPos(hp);
 return`${topBar('map','WORLD MAP')}
 <div class="tip">Tap a place you've reached to visit it. Keep learning to open the road ahead!</div>
 <div class="jmap" style="height:${H}px">
  <svg viewBox="0 0 100 ${H}" preserveAspectRatio="none" style="height:${H}px"><polyline points="${pts}" fill="none" stroke="#fffaf0" stroke-width="10" vector-effect="non-scaling-stroke" stroke-linecap="square" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="#c9a070" stroke-width="6" stroke-dasharray="6 8" vector-effect="non-scaling-stroke"/></svg>
  ${nodesH}
  <span class="jhero" id="jhero" style="left:${o.x}%;top:${o.y-58}px">${heroImg(k,3)}${petImg(k,2)}</span>
 </div>
 ${typeof wbAvailable==='function'&&wbAvailable()?`<button class="btn acc" style="width:100%;margin-top:10px" data-act="go" data-to="worlds">${spr('tree',3)} SAIL TO BUILDER ISLAND</button>`:''}`;
}
VIEWS.journey=journeyV;NEED.journey='quest';
MOUNT.journey=()=>{const h=$('#jhero');if(h)requestAnimationFrame(()=>h.scrollIntoView({block:'center'}));};
// Tap a place: walk there (if it's been reached), then show its card.
ACT.jPlace=el=>{
 const k=kid(),q=QD(),p=+el.dataset.p;
 if(!placeReached(k,q,p)){sfx.bad();shake(el);return toast('Keep learning to reach this place!');}
 const h=$('#jhero'),o=jPos(p);V.jp=p;
 if(h){h.classList.add('walk');h.style.left=o.x+'%';h.style.top=(o.y-58)+'px';}
 sfx.tap();
 const first=!k.visited[p];k.visited[p]=today();save(k);
 setTimeout(()=>{if(h)h.classList.remove('walk');placeCard(k,q,p,first);},REDUCED?0:650);
};
function placeCard(k,q,p,first){
 const th=themeOf(q,placeLands(q,p)[0]),st=placeStats(k,q,p),g=st.ls.find(s=>landDone(k,s));
 showModal(`<div class="jcard" style="background-image:url(${sceneURL(p)})"></div>
 <h2>${esc(th.n.toUpperCase())}</h2><p class="tiny" style="margin:0">${esc(th.r)}${q.id==='hc'?' · '+st.ls.map(s=>esc(q.lands[s].name)).join(', '):''}</p>
 <div class="rewards" style="flex-direction:row;flex-wrap:wrap;justify-content:center">
  <div class="rw">${spr('sheep',2)} ${st.learned}/${st.total}</div><div class="rw">${spr('star',2)} ${st.stars}</div>
  ${st.crowns?`<div class="rw">${spr('crown',2)} ${st.crowns}</div>`:''}${st.castles?`<div class="rw">${spr('castle',2)} ${st.castles}</div>`:''}${st.guards?`<div class="rw">${spr('shield',2)} ${st.guards}</div>`:''}
 </div>
 ${first?`<p style="color:var(--ok2)">${spr('flag',2)} You discovered a new place!</p>`:''}
 <div class="col"><button class="btn ok" data-act="jGo" data-s="${st.ls[0]}">GO THERE ${ic('play',2,W)}</button>
 ${g!=null?`<button class="btn acc" data-act="guard" data-s="${g}">${spr('guardian',2,guardMap(themeOf(q,g).c))} FACE THE GUARDIAN</button>`:''}
 <button class="btn" data-act="closeModal">KEEP EXPLORING</button></div>`);
 if(first)achToast(k);
}
ACT.jGo=el=>{const s=+el.dataset.s;closeModal();nav({name:'map',toLand:s});};
