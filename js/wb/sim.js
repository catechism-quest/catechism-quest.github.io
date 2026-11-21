// Catechism Quest World Builder: the living world. Pathfinding, villager routines, animals,
// cars on roads, trains on tracks, and what happens when kids tap things.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// ================= PATHFINDING =================
// A* on the tile grid. Roads and paths are cheaper, so villagers prefer them; buildings block.
function findPath(w,id,sx,sy,tx,ty,blocked,maxN){
 const N=w.N,key=(x,y)=>y*N+x,start=key(sx,sy),goal=key(tx,ty);if(start===goal)return[];
 const cost=(x,y)=>{const o=ovAt(w,x,y);return o==='p'||o==='r'?1:o==='l'?3:2;};
 const ok=(x,y)=>inW(w,x,y)&&!blocked.has(key(x,y))&&canStandFast(w,id,x,y);
 const g=new Map([[start,0]]),came=new Map(),open=[[Math.abs(sx-tx)+Math.abs(sy-ty),start]];let n=0;
 while(open.length&&n++<(maxN||1800)){
  let bi=0;for(let i=1;i<open.length;i++)if(open[i][0]<open[bi][0])bi=i;const [,cur]=open.splice(bi,1)[0];
  if(cur===goal){const out=[];let c=cur;while(c!==start){out.push([c%N,Math.floor(c/N)]);c=came.get(c);}return out.reverse();}
  const cx=cur%N,cy=Math.floor(cur/N);
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy,nk=key(nx,ny);if(nk!==goal&&!ok(nx,ny))continue;if(!inW(w,nx,ny))continue;
   const ng=g.get(cur)+cost(nx,ny);if(ng<(g.has(nk)?g.get(nk):1e9)){g.set(nk,ng);came.set(nk,cur);open.push([ng+Math.abs(nx-tx)+Math.abs(ny-ty),nk]);}}
 }
 return null;
}
// tile rules without object lookups (the blocked set covers objects)
function canStandFast(w,id,x,y){const h=CRE[id].home,wet=isWater(w,x,y)&&ovAt(w,x,y)==='.';if(h==='water')return wet;if(CRE[id].move==='fly')return true;if(h==='land'&&wet)return false;return true;}
// tiles covered by solid objects (flat ones and habitats can be walked on)
function blockedSet(w){const s=new Set();w.o.forEach(o=>{const d=OBJ[o.t];if(d.flat||d.walk)return;objTiles(o).forEach(([x,y])=>s.add(y*w.N+x));});return s;}
// the walkable tile next to an object, where a villager stands to go in or play
function doorstep(w,o,blocked){const def=OBJ[o.t],[W,D]=footprint(def,o.r),c=[];
 for(let i=0;i<W;i++){c.push([o.x+i,o.y+D]);c.push([o.x+i,o.y-1]);}for(let j=0;j<D;j++){c.push([o.x+W,o.y+j]);c.push([o.x-1,o.y+j]);}
 return c.find(([x,y])=>inW(w,x,y)&&!blocked.has(y*w.N+x)&&!(isWater(w,x,y)&&ovAt(w,x,y)==='.'))||null;}

// ================= ENTITIES =================
// Runtime only: positions, plans and bubbles aren't saved (each creature's tile is, when it settles).
function makeEnts(w){return w.c.map(c=>({c,def:CRE[c.t],x:c.x,y:c.y,path:[],st:'idle',tt:Math.random()*2,face:Math.random()<.5,hop:0,bub:null,bubT:0,anchor:[c.x,c.y]}));}
const rnd2=(a,b)=>a+Math.random()*(b-a);
function say(e,icon,secs){e.bub=icon;e.bubT=secs||2.5;}
function goTo(S,e,tx,ty){const p=findPath(S.w,e.c.t,Math.round(e.x),Math.round(e.y),tx,ty,S.blocked);if(p&&p.length){e.path=p;e.st='walk';return true;}return false;}
function randomTile(S,e,r){const w=S.w;for(let i=0;i<20;i++){const x=Math.round(e.anchor[0]+rnd2(-r,r)),y=Math.round(e.anchor[1]+rnd2(-r,r));if(inW(w,x,y)&&!S.blocked.has(y*w.N+x)&&canStandFast(w,e.c.t,x,y))return[x,y];}return null;}
// Decide what a creature does next.
function plan(S,e){
 const w=S.w,id=e.c.t,night=S.night;
 if(night&&id!=='fish'&&id!=='villager'){e.st='sleep';e.tt=rnd2(6,12);say(e,'zz',e.tt);return;}
 if(id==='villager'){
  const homes=w.o.filter(o=>OBJ[o.t].home),visits=w.o.filter(o=>OBJ[o.t].visit),plays=w.o.filter(o=>OBJ[o.t].play);
  if(night&&homes.length){const h=homes[Math.abs(e.c.u.charCodeAt(0))%homes.length],d=doorstep(w,h,S.blocked);if(d&&goTo(S,e,d[0],d[1])){e.then={st:'inside',o:h,secs:rnd2(15,30),bub:'zz'};return;}}
  const r=Math.random();
  if(r<.3&&visits.concat(homes).length){const o=rnd(visits.concat(homes)),d=doorstep(w,o,S.blocked);if(d&&goTo(S,e,d[0],d[1])){e.then={st:'inside',o,secs:rnd2(3,6),bub:OBJ[o.t].visit?'heart':null};return;}}
  if(r<.55&&plays.length){const o=rnd(plays),d=doorstep(w,o,S.blocked);if(d&&goTo(S,e,d[0],d[1])){e.then={st:'play',secs:rnd2(3,5),bub:'star'};return;}}
  if(r<.7){const others=S.ents.filter(x=>x!==e&&x.c.t!=='fish');if(others.length){const f=rnd(others);if(goTo(S,e,Math.round(f.x),Math.round(f.y))){e.then={st:'chat',secs:2.5,bub:f.c.t==='villager'?'note':'heart',with:f};return;}}}
  // stroll, preferring paths and roads
  const paths=[];for(let i=0;i<40;i++){const x=Math.floor(Math.random()*w.N),y=Math.floor(Math.random()*w.N),ov=ovAt(w,x,y);if((ov==='p'||ov==='r')&&!S.blocked.has(y*w.N+x)){paths.push([x,y]);break;}}
  const t=paths[0]||randomTile(S,e,6);if(t&&goTo(S,e,t[0],t[1]))return;
  e.st='idle';e.tt=rnd2(1,3);return;
 }
 // animals: dinosaurs stay near a habitat if there is one; everyone else wanders near home
 if(e.def.cat==='dinos'&&id!=='dragon'&&id!=='dragonling'){const hab=w.o.find(o=>OBJ[o.t].hab==='dino');if(hab)e.anchor=[hab.x+1,hab.y+1];}
 if(Math.random()<.35){e.st='idle';e.tt=rnd2(1.5,4);if(Math.random()<.3)say(e,'heart',1.5);return;}
 const t=randomTile(S,e,e.def.move==='fly'?6:4);
 if(t){if(e.def.move==='fly'){e.path=[t];e.st='walk';}else if(!goTo(S,e,t[0],t[1])){e.st='idle';e.tt=1;}}else{e.st='idle';e.tt=2;}
}
function stepEnt(S,e,dt){
 if(e.bubT>0){e.bubT-=dt;if(e.bubT<=0)e.bub=null;}
 if(e.react>0){e.react-=dt;e.hop=Math.abs(Math.sin(e.react*10))*6;if(e.react<=0)e.hop=0;return;}
 if(e.st==='walk'){
  const n=e.path[0];if(!n){e.st='idle';e.tt=.5;arrive(S,e);return;}
  const sp=e.def.speed*dt*(e.def.move==='swim'?.8:1),dx=n[0]-e.x,dy=n[1]-e.y,d=Math.hypot(dx,dy);
  if(Math.abs(dx-dy)>.01)e.face=(dx-dy)<0;
  if(d<=sp){e.x=n[0];e.y=n[1];e.path.shift();if(!e.path.length){e.st='idle';e.tt=rnd2(.5,2);arrive(S,e);}}else{e.x+=dx/d*sp;e.y+=dy/d*sp;}
  e.step=(e.step||0)+dt*e.def.speed*4;
  e.hop=e.def.move==='hop'?Math.abs(Math.sin(e.step*1.6))*5:e.def.move==='fly'?6+Math.sin(e.step)*2:0;
  return;
 }
 e.tt-=dt;
 if(e.st==='play')e.hop=Math.abs(Math.sin(e.tt*8))*5;
 if(e.def.move==='fly'&&e.st!=='walk')e.hop=6+Math.sin(S.t*2+e.x)*2;
 if(e.tt<=0){if(e.st==='inside'||e.st==='sleep'){e.hidden=false;e.bub=null;}e.st='idle';e.hop=e.def.move==='fly'?6:0;plan(S,e);}
}
function arrive(S,e){
 e.c.x=Math.round(e.x);e.c.y=Math.round(e.y);   // remember where it settled (saved with the world)
 const t=e.then;e.then=null;if(!t)return;
 e.st=t.st;e.tt=t.secs;if(t.bub)say(e,t.bub,Math.min(t.secs,3));
 if(t.st==='inside'){e.hidden=true;e.inside=t.o;if(S.ostate)(S.ostate[t.o.u]=S.ostate[t.o.u]||{}).door=S.t+.8;}
 if(t.st==='chat'&&t.with&&t.with.st!=='walk'){t.with.st='chat';t.with.tt=2.5;say(t.with,t.bub==='note'?'note':'heart',2.5);}
}

// ================= VEHICLES =================
// Cars appear on roads and trains on railroad tracks, all by themselves.
const DIRS=[[1,0],[0,1],[-1,0],[0,-1]];
function ovNeighbors(w,x,y,c){return DIRS.map(([dx,dy])=>[x+dx,y+dy]).filter(([a,b])=>ovAt(w,a,b)===c);}
function makeVehicles(w){
 const out=[],roads=[],rails=[];for(let y=0;y<w.N;y++)for(let x=0;x<w.N;x++){const o=ovAt(w,x,y);if(o==='r')roads.push([x,y]);else if(o==='l')rails.push([x,y]);}
 const ncar=roads.length<3?0:Math.min(5,1+Math.floor(roads.length/8));
 for(let i=0;i<ncar;i++){const t=roads[Math.floor(hash(i,roads.length,9)*roads.length)];out.push({kind:'car',def:['car','carb','cary'][i%3],x:t[0],y:t[1],prev:null,next:null,sp:1.6+i*.2,face:0});}
 // one train per stretch of track at least 4 tiles long (up to 2)
 const seen=new Set();let trains=0;
 rails.forEach(([x,y])=>{const k=y*w.N+x;if(seen.has(k)||trains>=2)return;const comp=[],q=[[x,y]];seen.add(k);
  while(q.length){const [a,b]=q.shift();comp.push([a,b]);ovNeighbors(w,a,b,'l').forEach(([c,d])=>{const kk=d*w.N+c;if(!seen.has(kk)){seen.add(kk);q.push([c,d]);}});}
  if(comp.length>=4){trains++;const s=comp.find(([a,b])=>ovNeighbors(w,a,b,'l').length===1)||comp[0];out.push({kind:'train',x:s[0],y:s[1],prev:null,next:null,sp:1.4,trail:[],face:0});}});
 return out;
}
function stepVehicle(S,v,dt){
 const w=S.w,c=v.kind==='car'?'r':'l';
 if(!v.next){let ns=ovNeighbors(w,Math.round(v.x),Math.round(v.y),c).filter(n=>!v.prev||n[0]!==v.prev[0]||n[1]!==v.prev[1]);
  if(!ns.length)ns=ovNeighbors(w,Math.round(v.x),Math.round(v.y),c);if(!ns.length)return;v.next=rnd(ns);}
 const dx=v.next[0]-v.x,dy=v.next[1]-v.y,d=Math.hypot(dx,dy),sp=v.sp*dt*(v.honk>0?0:1);
 if(v.honk>0)v.honk-=dt;
 v.face=dx>0?0:dy>0?1:dx<0?2:3;
 // a train's cars follow the engine's trail, one point per tenth of a tile
 if(v.kind==='train'&&(!v.trail.length||Math.hypot(v.x-v.trail[0][0],v.y-v.trail[0][1])>=.1)){v.trail.unshift([v.x,v.y,v.face]);if(v.trail.length>40)v.trail.pop();}
 if(d<=sp){v.prev=[Math.round(v.x),Math.round(v.y)];v.x=v.next[0];v.y=v.next[1];v.next=null;}else{v.x+=dx/d*sp;v.y+=dy/d*sp;}
}

// ================= TAPPING THINGS =================
// What each object's act does when tapped in Play mode. Everything is gentle and reversible.
const GIFTS=['heart','star','note','crown','xpstar','gift','coin'];
const ACTS={
 door:(S,o)=>{const os=st(S,o);os.door=S.t+1.2;sfx.tap();const e=S.ents.find(e=>e.hidden&&e.inside===o);if(e){e.hidden=false;e.st='idle';e.tt=2;say(e,'note',2);}fx(S,o,'heart',3);},
 spin:(S,o)=>{st(S,o).boost=S.t+4;tone(523,.1);tone(784,.15,'square',.1);fx(S,o,'note',4);},
 launch:(S,o)=>{const os=st(S,o);if(os.launch&&S.t-os.launch<4)return;os.launch=S.t;[262,330,392,523,659,784].forEach((f,i)=>tone(f,.12,'sawtooth',i*.12,.03));},
 erupt:(S,o)=>{st(S,o).erupt=S.t+4;[110,98,87,82].forEach((f,i)=>tone(f,.25,'sawtooth',i*.15,.05));S.shake=.6;},
 chest:(S,o)=>{const os=st(S,o);if(o.s&&o.s.open)return;o.s=Object.assign({},o.s,{open:1});os.gift=rnd(GIFTS);os.giftT=S.t;sfx.coin();fx(S,o,'spark',12);setTimeout(()=>{if(o.s)delete o.s.open;},4500);},
 grow:(S,o)=>{o.s=o.s||{};const g=o.s.g||0;if(g>=3){o.s.g=0;fx(S,o,'veg',8);sfx.coin();wbDirty(true);}else{o.s.g=g+1;fx(S,o,'leaf',5);tone(660+g*120,.1);wbDirty(true);}},
 light:(S,o)=>{const os=st(S,o);os.on=!os.on;tone(os.on?880:440,.08);},
 bell:(S,o)=>{[784,659,523].forEach((f,i)=>tone(f,.35,'triangle',i*.35,.06));fx(S,o,'note',5);},
 splash:(S,o)=>{st(S,o).boost=S.t+3;[1318,1568,1175].forEach((f,i)=>tone(f,.06,'triangle',i*.05,.04));fx(S,o,'drop',8);},
 bounce:(S,o)=>{st(S,o).boost=S.t+4;tone(392,.08);tone(523,.08,'square',.1);fx(S,o,'star',3);},
 bounce2:(S,o)=>{st(S,o).squash=S.t;tone(330,.1);tone(660,.1,'square',.08);fx(S,o,'spark',4);},
 siren:(S,o)=>{st(S,o).boost=S.t+3;for(let i=0;i<6;i++)tone(i%2?660:880,.2,'square',i*.2,.03);},
 magic:(S,o)=>{fx(S,o,'spark',14);[1046,1318,1568,2093].forEach((f,i)=>tone(f,.12,'triangle',i*.08,.04));},
 honk:(S,o)=>{tone(392,.15,'square',0,.05);tone(392,.15,'square',.2,.05);},
 roar:(S,o)=>{[147,131,110].forEach((f,i)=>tone(f,.2,'sawtooth',i*.12,.05));S.shake=.4;fx(S,o,'spark',4);},
 float:(S,o)=>{st(S,o).boost=S.t+3;tone(523,.1,'triangle');fx(S,o,'drop',4);},
 shake:(S,o)=>{st(S,o).squash=S.t;fx(S,o,'leaf',6);tone(880,.06);},
 wave:(S,o)=>{fx(S,o,'heart',3);tone(784,.1,'triangle');},
 music:(S,o)=>{fx(S,o,'note',8);const n=parseSong(SONGS[0].n).slice(0,8);let t=0;n.forEach(x=>{if(!x.r)tone(hz(x.m),x.d*.25,'triangle',t,.04);t+=x.d*.25;});},
 wish:(S,o)=>{fx(S,o,'spark',8);tone(1568,.2,'triangle');},
 hatch:(S,o)=>{fx(S,o,'heart',4);const id=o.t==='dragonnest'?'dragonling':rnd(['trex','longneck']);if(S.w.c.length<WB_MAX_CRE){const d=doorstep(S.w,o,S.blocked)||[o.x,o.y];const c=addCreature(S.w,id,d[0],d[1]);S.ents.push(...makeEnts({c:[c]}));wbDirty(true);toast(`A baby ${CRE[id].n} hatched!`);}[523,659,784,1046].forEach((f,i)=>tone(f,.1,'square',i*.08,.04));},
 cave:(S,o)=>{fx(S,o,'spark',6);tone(220,.3,'triangle');tone(330,.3,'triangle',.2);},
 dig:(S,o)=>{fx(S,o,'spark',10);const os=st(S,o);os.gift=rnd(GIFTS);os.giftT=S.t;sfx.coin();}
};
const WB_MAX_CRE=60,WB_MAX_OBJ=600;
function st(S,o){return S.ostate[o.u]||(S.ostate[o.u]={});}
// little particles in world space: hearts, notes, sparkles, drops, leaves, veggies
function fx(S,o,kind,n){const def=OBJ[o.t],[W,D]=footprint(def,o.r);const [ax,ay]=W2A(S,o.x+W/2,o.y+D/2,(partsTop(partsFor(def,o.r,o.s).parts)||1)*.8);
 for(let i=0;i<n;i++)S.parts.push({x:ax+rnd2(-10,10),y:ay+rnd2(-6,6),vx:rnd2(-14,14),vy:rnd2(-38,-18),life:rnd2(.9,1.6),kind});}
function tapCreature(S,e){
 const d=e.def;e.react=.8;sfx.tap();if(d.snd)d.snd.forEach((f,i)=>tone(f,.12,d.id==='trex'||d.id==='dragon'||d.id==='lionw'?'sawtooth':'square',i*.11,.05));
 say(e,d.id==='villager'?'wave':'heart',2.2);
 const [ax,ay]=W2A(S,e.x+.5,e.y+.5,1);for(let i=0;i<3;i++)S.parts.push({x:ax,y:ay,vx:rnd2(-10,10),vy:rnd2(-30,-20),life:1.2,kind:'heart'});
 if(e.hidden){e.hidden=false;e.st='idle';e.tt=2;}
}
