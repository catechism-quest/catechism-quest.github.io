// Catechism Quest World Builder: screens and controls. The worlds list, the theme picker, the editor's
// toolbar, catalog drawer and selection panel, building challenges, photo mode, and builder achievements.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// ================= ICONS =================
Object.assign(SPR,{
 hand:["..k.k...",".kwkwk..",".kwkwkk.","kkwwwwwk","kwwwwwwk","kwwwwwk.",".kwwwwk.","..kkkk.."],
 brush:["......kk",".....kyk","....kyk.","...kyk..","..knk...",".kmmk...","kmmk....","kk......"],
 eraser:["...kkkk.","..kppppk",".kppppk.","kwwwpk..","kwwwk...",".kkk....","........","kkkkkkkk"],
 move:["....k....","...kkk...","....k....",".k..k..k.","kkkkkkkkk",".k..k..k.","....k....","...kkk...","....k...."],
 movebig:["......k......",".....kkk.....","....kkkkk....","......k......","..k...k...k..",".kk...k...kk.","kkkkkkkkkkkkk",".kk...k...kk.","..k...k...k..","......k......","....kkkkk....",".....kkk.....","......k......"],
 undo:["..k.....",".kk.....","kkkkkk..",".kk...k.","..k....k",".......k","......k.","..kkkk.."],
 rotate:["..kkk.k",".k...kk","k...kkk","k......","k......",".k...k.","..kkk.."],
 camera:["..kkk....","kkkkkkkkk","kaaakkkak","kaakwkaak","kaakkkaak","kaaaaaaak","kkkkkkkkk"],
 sun:["...y...",".y.y.y.","..yyy..","yyyyyyy","..yyy..",".y.y.y.","...y..."],
 moon:["..kkk..",".kyyk..","kyyk...","kyyk...","kyyk...",".kyyk..","..kkk.."],
 cloud:["..kkk...",".kwwwkk.","kwwwwwwk","kwwwwwwk",".kkkkkk.",".c.c.c..","c.c.c..."],
 plus:["..kk..","..kk..","kkkkkk","kkkkkk","..kk..","..kk.."],
 minus:["......","......","kkkkkk","kkkkkk","......","......"],
 trash:[".kkkk.","kkkkkk",".kaak.",".kaak.",".kaak.",".kkkk."],
 copy:["kkkk..","kwwk..","kwkkkk","kkkwwk","..kwwk","..kkkk"],
 expand:["kk...kk","k.....k","..kkk..","..kwk..","..kkk..","k.....k","kk...kk"],
 roadi:["kkkkkkkk","kbbbbbbk","kyybyybk","kbbbbbbk","kkkkkkkk"],
 zz:["kkk.....","..k.....",".k..kkk.","kkk...k.",".....k..","....kkk."],
 pencil:[".....kk","....kyk","...kyk.","..kyk..",".kyk...","kkk....","kk....."]
});
SPR.redo=SPR.undo.map(r=>[...r].reverse().join(''));

// ================= CHALLENGES =================
// Optional ideas for what to build. Each check looks at a world and says how close it is: [have, need].
// Finishing one earns a badge, XP and coins once per kid. Nothing happens if a kid ignores them.
const homesIn=w=>w.o.filter(o=>OBJ[o.t].home),cre=(w,f)=>w.c.filter(c=>f(CRE[c.t],c));
const near=(a,b,d)=>Math.abs(a.x-b.x)<=d&&Math.abs(a.y-b.y)<=d;
const CHALLENGES=[
 {id:'town10',n:'Town of Ten',d:'Build a town for 10 villagers, with 3 homes',ic:'cottage',check:w=>{const v=cre(w,d=>d.id==='villager').length,h=homesIn(w).length;return[Math.min(v,10)+Math.min(h,3),13];}},
 {id:'zoo',n:'Zoo Keeper',d:'Make a zoo with 5 kinds of animals and a fence',ic:'fence',check:w=>{const k=new Set(cre(w,d=>d.id!=='villager').map(c=>c.t)).size,f=w.o.filter(o=>OBJ[o.t].conn).length;return[Math.min(k,5)+Math.min(f,3),8];}},
 {id:'moat',n:'Castle Moat',d:'Build a castle with water all around it',ic:'castle',check:w=>{const cs=w.o.filter(o=>['castle','tower','wizard'].includes(o.t));for(const c of cs){const [W,D]=footprint(OBJ[c.t],c.r);let ok=true;for(let y=c.y-1;y<=c.y+D;y++)for(let x=c.x-1;x<=c.x+W;x++){if(x>=c.x&&x<c.x+W&&y>=c.y&&y<c.y+D)continue;if(inW(w,x,y)&&!isWater(w,x,y))ok=false;}if(ok)return[2,2];}return[cs.length?1:0,2];}},
 {id:'rail3',n:'All Aboard',d:'Lay a railroad that reaches 3 buildings',ic:'station',check:w=>{const bs=new Set();w.o.forEach(o=>{if(OBJ[o.t].cat!=='build')return;const [W,D]=footprint(OBJ[o.t],o.r);for(let y=o.y-1;y<=o.y+D;y++)for(let x=o.x-1;x<=o.x+W;x++)if(ovAt(w,x,y)==='l')bs.add(o.u);});const rails=w.ov.split('').filter(c=>c==='l').length;return[Math.min(bs.size,3)+(rails>=4?1:0),4];}},
 {id:'dinopark',n:'Dino Park',d:'Make a dinosaur park: 3 dinos, a habitat and a ride',ic:'dinohab',check:w=>{const d=cre(w,c=>c.cat==='dinos').length,h=w.o.some(o=>o.t==='dinohab')?1:0,r=w.o.some(o=>OBJ[o.t].cat==='fun')?1:0;return[Math.min(d,3)+h+r,5];}},
 {id:'gardens',n:'Garden Town',d:'Give every house a garden (at least 3 houses)',ic:'veggies',check:w=>{const hs=homesIn(w),g=w.o.filter(o=>['veggies','pumpkins','flowers','tulips','sunflowers'].includes(o.t)),ok=hs.filter(h=>g.some(x=>near(x,h,2))).length;return[Math.min(hs.length>=3?ok:Math.min(ok,hs.length),3)+(hs.length>=3&&ok===hs.length?1:0),4];}},
 {id:'playground',n:'Dream Playground',d:'Put 4 fun things close together',ic:'slide',check:w=>{const f=w.o.filter(o=>OBJ[o.t].play);let best=0;f.forEach(a=>{best=Math.max(best,f.filter(b=>near(a,b,3)).length);});return[Math.min(best,4),4];}},
 {id:'planet',n:'Another Planet',d:'Build a space base: a station, 2 space things and 3 friends',ic:'spacestation',check:w=>{const s=w.o.some(o=>o.t==='spacestation')?1:0,t=w.o.filter(o=>['rocket','ufo','rover','dish','domehouse','crystal','portal'].includes(o.t)).length,f=w.c.length;return[s+Math.min(t,2)+Math.min(f,3),6];}},
 {id:'farm',n:'Happy Farm',d:'Make a farm: a barn, 3 kinds of farm animals and a garden',ic:'barn',check:w=>{const b=w.o.some(o=>o.t==='barn')?1:0,a=new Set(cre(w,d=>d.cat==='farm').map(c=>c.t)).size,g=w.o.some(o=>OBJ[o.t].grow)?1:0;return[b+Math.min(a,3)+g,5];}},
 {id:'lights',n:'Lights On',d:'Light up your town with 6 lamps',ic:'lamp',check:w=>[Math.min(w.o.filter(o=>['lamp','lantern'].includes(o.t)).length,6),6]},
 {id:'harbor',n:'Harbor',d:'Build a lighthouse, a dock and 2 boats',ic:'lighthouse',check:w=>{const l=w.o.some(o=>o.t==='lighthouse')?1:0,d=w.o.some(o=>o.t==='bridgepost')?1:0,b=w.o.filter(o=>OBJ[o.t].float).length;return[l+d+Math.min(b,2),4];}},
 {id:'bloom',n:'In Full Bloom',d:'Plant 10 flower beds, tulips or sunflowers',ic:'flowers',check:w=>[Math.min(w.o.filter(o=>['flowers','tulips','sunflowers','planter'].includes(o.t)).length,10),10]},
 {id:'bridge',n:'Bridge Builder',d:'Build a road or path across water',ic:'bridgepost',check:w=>{let n=0;for(let i=0;i<w.ov.length;i++)if(w.ov[i]!=='.'&&w.t[i]==='a')n++;return[Math.min(n,2),2];}},
 {id:'pets',n:'Pet Pals',d:'Adopt 3 pets and give them a home',ic:'cottage',check:w=>[Math.min(cre(w,d=>d.cat==='pets').length,3)+(homesIn(w).length?1:0),4]}
];
let chT=null;
// After edits: see if any challenge was just finished, and award builder achievements.
function wbAfterEdit(S){clearTimeout(chT);chT=setTimeout(()=>{if(WBS!==S)return;
 const k=S.k,w=S.w;k.stats.kinds=Math.max(k.stats.kinds||0,new Set(w.c.filter(c=>c.t!=='villager').map(c=>c.t)).size);
 for(const c of CHALLENGES){if(w.ch[c.id])continue;const [h,n]=c.check(w);if(h>=n){w.ch[c.id]=today();challengeDone(S,c);return;}}
 achToast(k);if(S.ui.drawer==='ch')wbUI();},600);}
function challengeDone(S,c){
 const k=S.k,first=!k.wbch[c.id];k.wbch[c.id]=k.wbch[c.id]||today();let extra='';
 if(first){k.coins+=20;extra=celebrate(k,XP.challenge);}else save(k);
 confetti(200);sfx.win();
 showModal(`<div style="margin:6px 0">${wbIcon(c.ic,3)}</div><h2>CHALLENGE DONE!</h2><p><b>${esc(c.n)}</b><br>${esc(c.d)}</p>
 <div class="rewards">${first?`<div class="rw">${spr('coin',3)} +20 COINS</div>`:''}${extra}</div><div class="col"><button class="btn ok" data-act="closeModal">KEEP BUILDING</button></div>`);
}
// builder achievements (appended; never reorder or rename ids)
ACH.push(
 {id:'wb1',n:'First Brick',d:'Build something in the World Builder',ic:'flag',got:k=>k.stats.placed||0,of:1},
 {id:'wb100',n:'Busy Builder',d:'Build 100 things',ic:'castle',got:k=>k.stats.placed||0,of:100},
 {id:'paint50',n:'Little Painter',d:'Paint 50 tiles of ground',ic:'brush',got:k=>k.stats.painted||0,of:50},
 {id:'vill1',n:'New Neighbor',d:'Welcome a villager to your world',ic:'person',got:k=>k.stats.vill||0,of:1},
 {id:'zoo5',n:'Zookeeper',d:'Have 5 kinds of animals in one world',ic:'cow',got:k=>k.stats.kinds||0,of:5},
 {id:'ch1',n:'Dreamer',d:'Finish a building challenge',ic:'star',got:k=>cnt(k.wbch),of:1},
 {id:'ch5',n:'Big Dreamer',d:'Finish 5 building challenges',ic:'star',got:k=>cnt(k.wbch),of:5},
 {id:'worlds3',n:'World Maker',d:'Make 3 worlds',ic:'tree',got:k=>(k.worlds||[]).length,of:3},
 {id:'photo1',n:'Photographer',d:'Take a photo of your world',ic:'camera',got:k=>k.stats.photos||0,of:1}
);
// a catalog object's icon (or a sprite) as an <img>
function wbIcon(id,s){if(OBJ[id])return`<img class="spr" src="${objIcon(OBJ[id])}" width="${16*(s||2)}" alt="">`;return spr(id,s||2);}
const creIcon=(id,s)=>id==='villager'?`<img class="spr" src="${villCanvas({s:0,h:1,c:1,p:0},0,false).toDataURL()}" width="${9*(s||3)}" alt="">`:spr(CRE[id].spr,s||3);
// Treasures need to be earned (or Creative Mode turned on by a grown-up). Everything else is free.
const wbHas=(k,def)=>!def.reward||k.creative||owns(k,def.reward);

// ================= WORLDS LIST =================
function wbAvailable(){const k=kid();return!!(k&&k.hero);}
const previewCache={};
function worldPreview(w){
 const key=w.id+'|'+w.at;if(previewCache[key])return previewCache[key];
 const S={w,ox:w.N*TW2+TW,oy:HU*3};bakeTerrain(S);const c=document.createElement('canvas');c.width=S.tcan.width;c.height=S.tcan.height;const x=c.getContext('2d');x.drawImage(S.tcan,0,0);
 w.o.slice().sort((a,b)=>(a.x+a.y)-(b.x+b.y)).forEach(o=>{const def=OBJ[o.t],sp=objSprite(def,def.conn?0:o.r,Object.assign({},o.s,{m:connMask(w,o)})),[ax,ay]=W2A(S,o.x,o.y,0);x.drawImage(sp.c,Math.round(ax-sp.ax),Math.round(ay-sp.ay));});
 return previewCache[key]=c.toDataURL();
}
function worldsV(){
 const k=kid(),ws=kidWorlds(k);
 return`<div class="top"><button class="ib" data-act="go" data-to="map" aria-label="Back">${ic('back',3)}</button><div class="ttl">WORLD BUILDER</div><span style="width:46px"></span></div>
 <section class="box center wbhero"><div class="parade">${['cottage','oak','ferris','castle'].map(id=>wbIcon(id,3)).join('')}</div><p style="font-size:18px;margin:6px 0 0">Build anything you can imagine! Everything is free. Learning earns special treasures.</p></section>
 ${ws.length<WB_MAX_WORLDS?`<button class="btn ok" style="width:100%;margin-bottom:16px" data-act="wbNewPick">${ic('plus',3,W)} NEW WORLD</button>`:'<p class="tiny center">You have the most worlds you can keep. Delete one to make another.</p>'}
 <div class="wlist">${ws.slice().sort((a,b)=>b.at-a.at).map(w=>`<div class="wcard"><button class="wprev" data-act="wbOpen" data-id="${w.id}" aria-label="Open ${esc(w.name)}" style="background-color:${themeById(w.theme).sky[0]}"><img src="${worldPreview(w)}" alt=""></button>
  <div class="winfo"><b>${esc(w.name)}</b><span>${esc(themeById(w.theme).n)} · ${w.o.length} things · ${w.c.length} friends${cnt(w.ch)?` · ${spr('star',1)}${cnt(w.ch)}`:''}</span></div>
  <div class="wbtns"><button class="btn sm ok" data-act="wbOpen" data-id="${w.id}">${ic('play',2,W)} PLAY</button><button class="btn sm" data-act="wbDup" data-id="${w.id}" aria-label="Copy">${spr('copy',3)}</button><button class="btn sm bad" data-act="wbDelAsk" data-id="${w.id}" aria-label="Delete">${spr('trash',3)}</button></div></div>`).join('')}</div>
 ${ws.length?'':'<p class="tiny center" style="color:var(--k)">Make your first world to start building!</p>'}`;
}
VIEWS.worlds=worldsV;NEED.worlds='hero';NAVTABS.push('worlds');
const findWorld=id=>kidWorlds(kid()).find(w=>w.id===id);
Object.assign(ACT,{
 wbNewPick:()=>{sfx.tap();showModal(`<h2>PICK A WORLD</h2><div class="themes">${THEMES.map(t=>`<button class="theme" data-act="wbNew" data-t="${t.id}" style="background:${t.sky[0]}">${wbIcon(t.icon,2)}<span>${esc(t.n.toUpperCase())}</span></button>`).join('')}</div><button class="btn" style="width:100%;margin-top:12px" data-act="closeModal">CANCEL</button>`);},
 wbNew:el=>{const k=kid();if(kidWorlds(k).length>=WB_MAX_WORLDS)return;const w=newWorld(el.dataset.t);k.worlds.push(w);save(k);sfx.win();closeModal();achToast(k);nav({name:'wb',wid:w.id});},
 wbOpen:el=>{sfx.tap();nav({name:'wb',wid:el.dataset.id});},
 wbDup:el=>{const k=kid(),w=findWorld(el.dataset.id);if(!w||kidWorlds(k).length>=WB_MAX_WORLDS)return toast('You have the most worlds you can keep');dupWorld(k,w);save(k);sfx.coin();render();toast('World copied!');},
 wbDelAsk:el=>{const w=findWorld(el.dataset.id);if(!w)return;sfx.tap();showModal(`<div style="margin:6px 0"><img src="${worldPreview(w)}" width="180" alt="" style="image-rendering:pixelated"></div><h2>DELETE THIS WORLD?</h2><p><b>${esc(w.name)}</b> will be gone forever. This can't be undone.</p><p class="tiny">Tip: make a copy first if you might want it later.</p><div class="col"><button class="btn bad" data-act="wbDelYes" data-id="${w.id}">${spr('trash',3)} YES, DELETE IT</button><button class="btn ok" data-act="closeModal">KEEP IT</button></div>`);},
 wbDelYes:el=>{const k=kid();k.worlds=kidWorlds(k).filter(w=>w.id!==el.dataset.id);save(k);closeModal();render();toast('World deleted');}
});

// ================= EDITOR =================
VIEWS.wb=()=>`<div class="wbwrap"><canvas id="wbc" aria-label="Your world. Drag to look around, pinch to zoom."></canvas><div id="wbui"></div></div>`;NEED.wb='hero';
MOUNT.wb=()=>{const k=kid(),w=findWorld(V.wid);if(!w)return nav({name:'worlds'});document.body.classList.add('inwb');const S=wbStart(k,w,$('#wbc'));S.ui={drawer:null,cat:'build',ccat:'people',more:false};wbUI();};
UNMOUNT.wb=()=>{wbStop();document.body.classList.remove('inwb');};
const TOOLS=[['play','PLAY','hand'],['build','BUILD','cottage'],['friends','FRIENDS','person'],['paint','PAINT','brush'],['road','ROADS','roadi'],['erase','ERASE','eraser'],['select','MOVE','movebig']];
function toolIcon(t){return t[2]==='cottage'?wbIcon('cottage',3):t[2]==='person'?creIcon('villager',3):t[2]==='movebig'?spr('movebig',3,{k:'#ffffff'}):spr(t[2],4);}
function wbUI(){
 const S=WBS,el=$('#wbui');if(!S||!el)return;const w=S.w,ui=S.ui;
 if(S.photo){el.innerHTML=`<div class="wbphoto"><button class="wbround" data-act="wbShot" aria-label="Save photo">${spr('camera',4)}</button><button class="btn sm" data-act="wbPhoto">DONE</button></div>`;return;}
 const top=`<div class="wbtop"><button class="wbb" data-act="wbBack" aria-label="Back to worlds">${ic('back',3)}</button><button class="wbname" data-act="wbRename"><span>${esc(w.name)}</span>${spr('pencil',2)}</button>
  <button class="wbb" data-act="wbUndo" ${S.hist.u.length?'':'disabled'} aria-label="Undo">${spr('undo',3)}</button><button class="wbb" data-act="wbRedo" ${S.hist.r.length?'':'disabled'} aria-label="Redo">${spr('redo',3)}</button>
  <button class="wbb ${ui.drawer==='ch'?'on':''}" data-act="wbCh" aria-label="Challenges">${spr('star',2)}</button><button class="wbb ${ui.more?'on':''}" data-act="wbMore" aria-label="More">${ic('gear',2)}</button></div>
  <div class="wbzoom"><button class="wbb" data-act="wbZoom" data-z="1" aria-label="Zoom in">${spr('plus',3)}</button><button class="wbb" data-act="wbZoom" data-z="-1" aria-label="Zoom out">${spr('minus',3)}</button></div>`;
 const bar=`<div class="wbbar">${TOOLS.map(t=>`<button class="wbt ${S.tool===t[0]?'on':''}" data-act="wbTool" data-t="${t[0]}">${toolIcon(t)}<span>${t[1]}</span></button>`).join('')}</div>`;
 el.innerHTML=top+(ui.more?moreHTML(S):'')+drawerHTML(S)+bar;
}
function moreHTML(S){const s=S.w.set;
 return`<div class="wbmore"><div class="lbl">TIME OF DAY</div><div class="seg">${[['day','sun','DAY'],['night','moon','NIGHT'],['cycle','sun','CHANGES']].map(x=>`<button class="${s.day===x[0]?'on':''}" data-act="wbSet" data-k="day" data-v="${x[0]}">${spr(x[1],2)} ${x[2]}</button>`).join('')}</div>
 <div class="lbl">WEATHER</div><div class="seg">${[['none','sun','CLEAR'],['rain','cloud','RAIN'],['snow','cloud','SNOW']].map(x=>`<button class="${s.weather===x[0]?'on':''}" data-act="wbSet" data-k="weather" data-v="${x[0]}">${spr(x[1],2)} ${x[2]}</button>`).join('')}</div>
 <div class="seg"><button data-act="wbExpand" ${S.w.N+4>WB_MAX?'disabled':''}>${spr('expand',2)} BIGGER WORLD</button><button data-act="wbPhoto">${spr('camera',2)} PHOTO</button></div>
 <p class="tiny" style="margin:8px 0 0">${S.k.creative?'Creative Mode is on: every treasure is unlocked.':'Grown-ups can turn on Creative Mode in Settings to unlock every treasure.'}</p></div>`;}
function drawerHTML(S){
 const ui=S.ui,k=S.k;
 if(ui.drawer==='ch'){return`<div class="wbdrawer tall"><div class="lbl">BUILDING IDEAS · ALL OPTIONAL</div><div class="chl">${CHALLENGES.map(c=>{const [h,n]=c.check(S.w),done=!!S.w.ch[c.id];return`<div class="chi ${done?'done':''}">${wbIcon(c.ic,2)}<div><b>${esc(c.n.toUpperCase())}</b><span>${esc(c.d)}</span><i><u style="width:${Math.round(Math.min(1,h/n)*100)}%"></u></i></div>${done?spr('star',2):''}</div>`;}).join('')}</div></div>`;}
 if(S.selected)return selPanel(S);
 if(S.moving)return`<div class="wbdrawer"><p class="wbhint">${spr('move',2)} Tap where it should go</p><button class="btn sm" data-act="wbCancelMove">CANCEL</button></div>`;
 if(S.tool==='build'){const items=OBJECTS.filter(o=>o.cat===ui.cat).sort((a,b)=>(themeById(S.w.theme).feat.includes(b.id)?1:0)-(themeById(S.w.theme).feat.includes(a.id)?1:0));
  return`<div class="wbdrawer"><div class="wbcats">${CATS.map(c=>`<button class="${ui.cat===c[0]?'on':''}" data-act="wbCat" data-c="${c[0]}" aria-label="${c[1]}">${wbIcon(c[2],2)}</button>`).join('')}<button class="rot" data-act="wbRot" aria-label="Turn">${spr('rotate',3)}</button></div>
  <div class="wbitems">${items.map(o=>{const has=wbHas(k,o);return`<button class="wbi ${S.sel&&S.sel.id===o.id?'on':''} ${has?'':'locked'}" data-act="wbPick" data-id="${o.id}" aria-label="${esc(o.n)}"><img src="${objIcon(o)}" alt=""><span>${esc(o.n)}</span>${has?'':`<em>${ic('lock',2,LOCKG)}</em>`}</button>`;}).join('')}</div></div>`;}
 if(S.tool==='friends'){const items=CREATURES.filter(c=>c.cat===ui.ccat);
  return`<div class="wbdrawer"><div class="wbcats">${CRE_CATS.map(c=>`<button class="${ui.ccat===c[0]?'on':''}" data-act="wbCCat" data-c="${c[0]}" aria-label="${c[1]}">${c[2]==='person'?creIcon('villager',2):spr(c[2],2)}</button>`).join('')}</div>
  <div class="wbitems">${items.map(c=>`<button class="wbi ${S.sel&&S.sel.id===c.id?'on':''}" data-act="wbPickC" data-id="${c.id}"><span class="ci">${creIcon(c.id,3)}</span><span>${esc(c.n)}</span></button>`).join('')}</div></div>`;}
 if(S.tool==='paint')return`<div class="wbdrawer"><div class="wbitems">${TERRAIN_KEYS.map(t=>{const d=terrainOf(S.w.theme,t);return`<button class="wbi ${S.paint===t?'on':''}" data-act="wbPaint" data-t="${t}"><span class="sw" style="background:${d.c[0]};border-color:${d.side}"></span><span>${d.n}</span></button>`;}).join('')}
  ${[1,2,3].map(b=>`<button class="wbi ${S.brush===b?'on':''}" data-act="wbBrush" data-b="${b}"><span class="bsz" style="width:${b*10+4}px;height:${b*10+4}px"></span><span>${b===1?'SMALL':b===2?'MEDIUM':'BIG'}</span></button>`).join('')}</div></div>`;
 if(S.tool==='road')return`<div class="wbdrawer"><div class="wbitems">${[['r','Road','#5a5670'],['p','Path','#e8d6b0'],['l','Railroad','#7a4a2a'],['.','No Road','#5fd36a']].map(x=>`<button class="wbi ${S.ovt===x[0]?'on':''}" data-act="wbOv" data-t="${x[0]}"><span class="sw" style="background:${x[2]}">${x[0]==='l'?'<b class="rails"></b>':x[0]==='r'?'<b class="dash"></b>':''}</span><span>${x[1]}</span></button>`).join('')}</div><p class="wbhint">Drag to draw. Roads and tracks join up by themselves. Draw across water to make a bridge!</p></div>`;
 const hints={play:'Tap anything to see what it does! Drag to look around, pinch to zoom.',erase:'Drag over things to clear them away. Oops? Tap undo.',select:'Tap something to move, turn, copy or remove it.'};
 return hints[S.tool]?`<div class="wbdrawer slim"><p class="wbhint">${hints[S.tool]}</p></div>`:'';
}
function selPanel(S){
 const sel=S.selected;
 if(sel.o){const def=OBJ[sel.o.t];return`<div class="wbdrawer"><div class="selhead"><img src="${objIcon(def)}" alt="" width="48"><b>${esc(def.n.toUpperCase())}</b></div><div class="seg">
  <button data-act="wbSRot">${spr('rotate',2)} TURN</button><button data-act="wbSMove">${spr('move',2)} MOVE</button><button data-act="wbSCopy">${spr('copy',2)} COPY</button><button class="bad" data-act="wbSDel">${spr('trash',2)} REMOVE</button></div><button class="btn sm" style="margin-top:8px" data-act="wbDesel">DONE</button></div>`;}
 const e=sel.e,c=e.c,v=c.t==='villager';
 return`<div class="wbdrawer"><div class="selhead"><span class="ci">${v?`<img class="spr" src="${villCanvas(c.l,0,false).toDataURL()}" width="36" alt="">`:spr(e.def.spr,3)}</span><input class="kin" id="wbcname" maxlength="14" value="${esc(c.n||'')}" aria-label="Name"></div>
 ${v?`<div class="seg looks">${[['s','SKIN'],['h','HAIR'],['c','SHIRT'],['p','PANTS'],['hat','HAT']].map(x=>`<button data-act="wbLook" data-f="${x[0]}">${x[1]}</button>`).join('')}</div>`:''}
 <div class="seg"><button data-act="wbSMove">${spr('move',2)} MOVE</button><button class="bad" data-act="wbSDel">${spr('trash',2)} SAY BYE</button><button data-act="wbDesel">DONE</button></div></div>`;
}
// ----- taps on the world -----
function wbTap(S,x,y,ax,ay){
 const w=S.w,k=S.k;
 if(S.moving){const m=S.moving;
  if(m.o){if(canPlace(w,OBJ[m.o.t],x,y,m.o.r,m.o)){S.hist.push();m.o.x=x;m.o.y=y;S.pop[m.o.u]=S.t;S.moving=null;S.selected={o:m.o};sfx.ok();wbDirty(true);}else{sfx.bad();toast("It doesn't fit there");}}
  else if(m.e){if(canStand(w,m.e.c.t,x,y)){S.hist.push();m.e.c.x=x;m.e.c.y=y;m.e.x=x;m.e.y=y;m.e.path=[];m.e.st='idle';m.e.tt=2;S.moving=null;sfx.ok();wbDirty(true);}else{sfx.bad();toast("They can't stand there");}}
  wbUI();return;}
 if(S.tool==='play'){const p=pickAt(S,ax,ay);if(!p)return;
  if(p.e){tapCreature(S,p.e);return;}
  if(p.v){p.v.honk=1;tone(392,.12,'square',0,.05);tone(392,.12,'square',.18,.05);return;}
  const def=OBJ[p.o.t],f=ACTS[def.act];if(f)f(S,p.o);else{(S.ostate[p.o.u]=S.ostate[p.o.u]||{}).squash=S.t;sfx.tap();fx(S,p.o,'spark',4);}return;}
 if(S.tool==='build'){if(!S.sel)return toast('Pick something to build first!');const def=OBJ[S.sel.id];
  if(!wbHas(k,def)){sfx.bad();return toast(`Earn this treasure: ${unlockReq(unlockById(def.reward))}`);}
  if(w.o.length>=WB_MAX_OBJ){sfx.bad();return toast('This world is full! Try a bigger world.');}
  if(!canPlace(w,def,x,y,S.rot)){sfx.bad();return toast(def.water==='on'?'This goes on water!':"It doesn't fit there");}
  S.hist.push();const o=placeObj(w,def.id,x,y,S.rot);if(def.grow)o.s={g:0};S.pop[o.u]=S.t;
  k.stats.placed=(k.stats.placed||0)+1;sfx.ok();tone(784,.06,'square',.06,.03);puff(S,x,y);wbDirty(true);wbUI();return;}
 if(S.tool==='friends'){if(!S.sel)return toast('Pick a friend first!');const id=S.sel.id;
  if(w.c.length>=WB_MAX_CRE){sfx.bad();return toast('That\'s a lot of friends! This world is full.');}
  if(!canStand(w,id,x,y)){sfx.bad();return toast(CRE[id].home==='water'?'Fish need water!':"They can't stand there");}
  S.hist.push();addCreature(w,id,x,y);if(id==='villager')k.stats.vill=(k.stats.vill||0)+1;
  const d=CRE[id];if(d.snd)d.snd.forEach((f,i)=>tone(f,.1,'square',i*.1,.04));puff(S,x,y);wbDirty(true);wbUI();return;}
 if(S.tool==='select'){const p=pickAt(S,ax,ay);S.selected=p&&(p.o||p.e)?(p.o?{o:p.o}:{e:p.e}):null;if(S.selected)sfx.tap();wbUI();}
}
Object.assign(ACT,{
 wbBack:()=>{nav({name:'worlds'});},
 wbTool:el=>{const S=WBS;if(!S)return;const t=el.dataset.t;S.tool=t;S.selected=null;S.moving=null;S.ui.drawer=null;S.ui.more=false;
  if(t==='build'&&!S.sel||t==='build'&&S.sel.kind!=='o'){const first=OBJECTS.find(o=>o.cat===S.ui.cat&&wbHas(S.k,o));S.sel=first?{kind:'o',id:first.id}:null;}
  if(t==='friends'&&(!S.sel||S.sel.kind!=='c'))S.sel={kind:'c',id:'villager'};
  sfx.tap();wbUI();},
 wbCat:el=>{const S=WBS;S.ui.cat=el.dataset.c;sfx.tap();wbUI();},
 wbCCat:el=>{const S=WBS;S.ui.ccat=el.dataset.c;sfx.tap();wbUI();},
 wbPick:el=>{const S=WBS,def=OBJ[el.dataset.id];if(!wbHas(S.k,def)){sfx.bad();toast(`Earn this treasure: ${unlockReq(unlockById(def.reward))}`);return;}S.sel={kind:'o',id:def.id};sfx.tap();toast(`${def.n}: tap the world to build`);wbUI();},
 wbPickC:el=>{const S=WBS;S.sel={kind:'c',id:el.dataset.id};const d=CRE[el.dataset.id];if(d.snd)tone(d.snd[0],.1);toast(`${d.n}: tap the world to add`);wbUI();},
 wbRot:()=>{const S=WBS;S.rot=(S.rot+1)%4;sfx.tap();toast('Turned!');},
 wbPaint:el=>{WBS.paint=el.dataset.t;sfx.tap();wbUI();},
 wbBrush:el=>{WBS.brush=+el.dataset.b;sfx.tap();wbUI();},
 wbOv:el=>{WBS.ovt=el.dataset.t;sfx.tap();wbUI();},
 wbUndo:()=>{const S=WBS;if(S.hist.undo()){S.selected=null;S.moving=null;S.terrainDirty=S.vehDirty=true;wbRebuild(S);wbDirty();sfx.tap();}wbUI();},
 wbRedo:()=>{const S=WBS;if(S.hist.redo()){S.selected=null;S.terrainDirty=S.vehDirty=true;wbRebuild(S);wbDirty();sfx.tap();}wbUI();},
 wbZoom:el=>{const S=WBS;zoomTo(S,S.cam.z*(+el.dataset.z>0?1.3:1/1.3),S.vw/2,S.vh/2);},
 wbMore:()=>{const S=WBS;S.ui.more=!S.ui.more;S.ui.drawer=null;sfx.tap();wbUI();},
 wbCh:()=>{const S=WBS;S.ui.drawer=S.ui.drawer==='ch'?null:'ch';S.ui.more=false;sfx.tap();wbUI();},
 wbSet:el=>{const S=WBS;S.w.set[el.dataset.k]=el.dataset.v;S.precip=[];sfx.tap();wbDirty();wbUI();},
 wbExpand:()=>{const S=WBS;S.hist.push();if(expandWorld(S.w)){S.cam.x+=TW;S.terrainDirty=S.vehDirty=true;S.ents.forEach(e=>{e.x+=2;e.y+=2;e.anchor=[e.anchor[0]+2,e.anchor[1]+2];e.path=[];});wbRebuild(S);wbDirty();sfx.win();toast('Your world got bigger!');}wbUI();},
 wbRename:()=>{const S=WBS;showModal(`<h2>NAME YOUR WORLD</h2><input class="name" id="wbwname" maxlength="24" value="${esc(S.w.name)}"><div class="col" style="margin-top:12px"><button class="btn ok" data-act="wbRenameOk">SAVE</button><button class="btn" data-act="closeModal">CANCEL</button></div>`);},
 wbRenameOk:()=>{const S=WBS,i=$('#wbwname');if(S&&i&&i.value.trim()){S.w.name=i.value.trim().slice(0,24);wbDirty();}closeModal();wbUI();},
 wbPhoto:()=>{const S=WBS;S.photo=!S.photo;S.photoClean=S.photo;document.body.classList.toggle('wbphotomode',S.photo);if(S.photo){const f=document.createElement('div');f.className='flash';document.body.appendChild(f);setTimeout(()=>f.remove(),400);tone(1568,.05);}wbUI();},
 wbShot:()=>{const S=WBS;try{S.cv.toBlob(b=>{if(!b)return;const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=(S.w.name||'world').replace(/[^\w ]+/g,'')+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);});}catch(e){}
  S.k.stats.photos=(S.k.stats.photos||0)+1;save(S.k);achToast(S.k);const f=document.createElement('div');f.className='flash';document.body.appendChild(f);setTimeout(()=>f.remove(),400);[2093,1568].forEach((f2,i)=>tone(f2,.05,'square',i*.06,.04));toast('Photo saved!');},
 wbDesel:()=>{const S=WBS;S.selected=null;S.moving=null;sfx.tap();wbUI();},
 wbCancelMove:()=>{const S=WBS;S.moving=null;wbUI();},
 wbSRot:()=>{const S=WBS,o=S.selected&&S.selected.o;if(!o)return;const r=(o.r+1)%4;if(canPlace(S.w,OBJ[o.t],o.x,o.y,r,o)){S.hist.push();o.r=r;S.pop[o.u]=S.t;sfx.tap();wbDirty(true);}else{sfx.bad();toast('No room to turn it here');}wbUI();},
 wbSMove:()=>{const S=WBS,s=S.selected;if(!s)return;S.moving=s.o?{o:s.o}:{e:s.e};S.selected=null;sfx.tap();wbUI();},
 wbSCopy:()=>{const S=WBS,o=S.selected&&S.selected.o;if(!o)return;S.tool='build';S.sel={kind:'o',id:o.t};S.rot=o.r;S.ui.cat=OBJ[o.t].cat;S.selected=null;sfx.tap();toast('Tap the world to place copies');wbUI();},
 wbSDel:()=>{const S=WBS,s=S.selected;if(!s)return;S.hist.push();if(s.o){removeObj(S.w,s.o);puff(S,s.o.x,s.o.y);}else{S.w.c=S.w.c.filter(c=>c!==s.e.c);puff(S,Math.round(s.e.x),Math.round(s.e.y));}S.selected=null;tone(330,.08);toast('Removed. Tap undo to bring it back.');wbDirty(true);wbUI();},
 wbLook:el=>{const S=WBS,e=S.selected&&S.selected.e;if(!e)return;const f=el.dataset.f,n={s:SKINS,h:HAIRS,c:SHIRTS,p:PANTS,hat:VHATS}[f].length;e.c.l[f]=((e.c.l[f]||0)+1)%n;sfx.tap();wbDirty();wbUI();}
});
document.addEventListener('input',e=>{if(e.target.id==='wbcname'&&WBS&&WBS.selected&&WBS.selected.e){WBS.selected.e.c.n=e.target.value.slice(0,14);wbDirty();}});
// Kids from before the builder existed: give everyone a worlds list and new counters.
S.kids.forEach(k=>{kidWorlds(k);k.worlds=k.worlds.map(migrateWorld).filter(Boolean);if(!k.wbch||typeof k.wbch!=='object')k.wbch={};});
