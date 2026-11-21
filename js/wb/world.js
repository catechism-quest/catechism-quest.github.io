// Catechism Quest World Builder: the world model. Creating, saving, migrating and editing worlds,
// placement and collision rules, connections, undo/redo, and expanding a world.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// A world is plain JSON, saved inside its kid (k.worlds) so it syncs and backs up like everything else:
// {v, id, name, theme, N (size), t (N×N terrain letters), ov (N×N overlay letters, '.' = none),
//  o: [{u (unique id), t (object id), x, y, r (0–3), s (state, e.g. {g:2})}],
//  c: [{u, t (creature id), x, y, n (name), l (villager look)}], set: {day, weather}, made, at, ch (challenges done)}
const WB_VERSION=1,WB_MIN=12,WB_MAX=40,WB_START=16,WB_MAX_WORLDS=12;
const wuid=()=>Math.random().toString(36).slice(2,9);
// Fill a new world with its theme's ground, then a little starter scenery so it never opens empty.
function newWorld(theme,name){
 const th=themeById(theme),N=WB_START,w={v:WB_VERSION,id:wuid(),name:name||th.n,theme:th.id,N,t:th.ground.repeat(N*N),ov:'.'.repeat(N*N),o:[],c:[],set:{day:'cycle',weather:'none'},made:Date.now(),at:Date.now(),ch:{}};
 starter(w);return w;
}
// Starter scenery: a pond or coastline, some of the theme's nature, and a friend or two.
function starter(w){
 const N=w.N,th=themeById(w.theme),seed=hash(N,th.id.length,w.id.charCodeAt(0));
 const setT=(x,y,c)=>{if(x>=0&&y>=0&&x<N&&y<N)w.t=w.t.slice(0,y*N+x)+c+w.t.slice(y*N+x+1);};
 if(['pirate','sea'].includes(th.id)){for(let y=0;y<N;y++)for(let x=0;x<N;x++){const d=Math.hypot(x-N/2+.5,y-N/2+.5);if(d>N*.42+Math.sin(x*1.3+y)*.8)setT(x,y,'a');}}
 else{const cx=3+Math.floor(seed*3),cy=N-5;for(let y=-2;y<=2;y++)for(let x=-3;x<=3;x++)if(x*x/9+y*y/4<=1.05)setT(cx+x,cy+y,'a');}
 if(th.id==='farm')for(let y=3;y<6;y++)for(let x=N-6;x<N-2;x++)setT(x,y,'d');
 if(th.id==='winter'){for(let y=1;y<4;y++)for(let x=N-5;x<N-1;x++)setT(x,y,'t');}
 // a path through the middle
 for(let x=2;x<N-2;x++)setOv(w,x,Math.floor(N/2),'p');
 let nat=th.feat.filter(id=>OBJ[id]&&OBJ[id].cat==='nature'&&!OBJ[id].grow&&(OBJ[id].w||1)===1&&!OBJ[id].water);
 if(nat.length<2)nat=nat.concat(['oak','bush','pine','flowers','rock']);
 for(let i=0;i<10&&nat.length;i++){const x=Math.floor(hash(i,3,N)*N),y=Math.floor(hash(i,7,N)*N);canPlace(w,OBJ[nat[i%nat.length]],x,y,0)&&placeObj(w,nat[i%nat.length],x,y,0);}
 const home=th.feat.find(id=>OBJ[id]&&OBJ[id].home&&(OBJ[id].w||1)===1&&(OBJ[id].d||1)===1)||'cottage';
 const hx=Math.floor(N/2)-1,hy=Math.floor(N/2)-2;if(canPlace(w,OBJ[home],hx,hy,0))placeObj(w,home,hx,hy,0);
 addCreature(w,'villager',Math.floor(N/2),Math.floor(N/2)+1);
 const pet=th.pets.find(id=>id!=='villager'&&CRE[id]&&CRE[id].home!=='water');if(pet)addCreature(w,pet,Math.floor(N/2)+2,Math.floor(N/2)+1);
}
// Upgrade worlds saved by older versions of the app. Add a step here whenever the format changes.
function migrateWorld(w){
 if(!w||typeof w!=='object')return null;
 if(!w.v)w.v=1;
 w.N=Math.max(WB_MIN,Math.min(WB_MAX,w.N|0||WB_START));
 if(typeof w.t!=='string'||w.t.length!==w.N*w.N)w.t=(w.t||'').padEnd(w.N*w.N,'g').slice(0,w.N*w.N);
 if(typeof w.ov!=='string'||w.ov.length!==w.N*w.N)w.ov='.'.repeat(w.N*w.N);
 w.t=w.t.replace(/[^gdstwa]/g,'g');w.ov=w.ov.replace(/[^.rpl]/g,'.');
 if(!Array.isArray(w.o))w.o=[];if(!Array.isArray(w.c))w.c=[];
 w.o=w.o.filter(o=>o&&OBJ[o.t]);w.c=w.c.filter(c=>c&&CRE[c.t]);
 w.o.forEach(o=>{if(!o.u)o.u=wuid();o.r=(o.r|0)%4;});w.c.forEach(c=>{if(!c.u)c.u=wuid();});
 if(!w.set||typeof w.set!=='object')w.set={};if(!w.set.day)w.set.day='cycle';if(!w.set.weather)w.set.weather='none';
 if(!THEMES.some(t=>t.id===w.theme))w.theme='village';
 if(!w.ch||typeof w.ch!=='object')w.ch={};
 if(!w.id)w.id=wuid();if(!w.name)w.name=themeById(w.theme).n;
 return w;
}
// ----- tiles -----
const inW=(w,x,y)=>x>=0&&y>=0&&x<w.N&&y<w.N;
const tAt=(w,x,y)=>inW(w,x,y)?w.t[y*w.N+x]:'';
const ovAt=(w,x,y)=>inW(w,x,y)?w.ov[y*w.N+x]:'.';
function setT(w,x,y,c){if(!inW(w,x,y))return false;const i=y*w.N+x;if(w.t[i]===c)return false;w.t=w.t.slice(0,i)+c+w.t.slice(i+1);return true;}
function setOv(w,x,y,c){if(!inW(w,x,y))return false;const i=y*w.N+x;if(w.ov[i]===c)return false;w.ov=w.ov.slice(0,i)+c+w.ov.slice(i+1);return true;}
const isWater=(w,x,y)=>tAt(w,x,y)==='a';
// ----- objects -----
const footprint=(def,r)=>(r||0)%2?[def.d||1,def.w||1]:[def.w||1,def.d||1];
function objTiles(o){const def=OBJ[o.t],[W,D]=footprint(def,o.r),out=[];for(let y=0;y<D;y++)for(let x=0;x<W;x++)out.push([o.x+x,o.y+y]);return out;}
// an index of which object covers each tile (rebuilt after edits)
function occMap(w){const m=new Map();w.o.forEach(o=>objTiles(o).forEach(([x,y])=>m.set(x+','+y,o)));return m;}
function objAt(w,x,y){for(let i=w.o.length-1;i>=0;i--){const o=w.o[i];const def=OBJ[o.t],[W,D]=footprint(def,o.r);if(x>=o.x&&y>=o.y&&x<o.x+W&&y<o.y+D)return o;}return null;}
// Can this object go here? Inside the world, on the right ground, and not on another object.
function canPlace(w,def,x,y,r,ignore){
 const [W,D]=footprint(def,r);
 for(let j=0;j<D;j++)for(let i=0;i<W;i++){const a=x+i,b=y+j;if(!inW(w,a,b))return false;
  const wet=isWater(w,a,b);if(def.water==='on'&&!wet)return false;if(!def.water&&wet&&ovAt(w,a,b)==='.')return false;
  const o=objAt(w,a,b);if(o&&o!==ignore)return false;}
 return true;
}
function placeObj(w,id,x,y,r,s){const o={u:wuid(),t:id,x,y,r:r||0};if(s)o.s=s;w.o.push(o);return o;}
function removeObj(w,o){const i=w.o.indexOf(o);if(i>=0)w.o.splice(i,1);}
// fences, walls and hedges join to neighbors with the same conn group
function connMask(w,o){const def=OBJ[o.t];if(!def.conn)return 0;let m=0;[[0,-1,1],[1,0,2],[0,1,4],[-1,0,8]].forEach(([dx,dy,b])=>{const n=objAt(w,o.x+dx,o.y+dy);if(n&&OBJ[n.t].conn===def.conn)m|=b;});return m;}
// ----- creatures -----
function addCreature(w,id,x,y,name,look){
 const c={u:wuid(),t:id,x,y};
 if(id==='villager'){c.n=name||VILLAGER_NAMES[w.c.filter(v=>v.t==='villager').length%VILLAGER_NAMES.length];c.l=look||{s:Math.floor(Math.random()*SKINS.length),h:Math.floor(Math.random()*HAIRS.length),c:Math.floor(Math.random()*SHIRTS.length),p:Math.floor(Math.random()*PANTS.length),hat:0};}
 else c.n=name||CRE[id].n;
 w.c.push(c);return c;
}
const canStand=(w,id,x,y)=>{if(!inW(w,x,y))return false;const h=CRE[id].home,wet=isWater(w,x,y)&&ovAt(w,x,y)==='.';if(h==='water')return wet;if(h==='land'&&wet&&CRE[id].move!=='fly')return false;const o=objAt(w,x,y);return !o||!!OBJ[o.t].flat||!!OBJ[o.t].walk;};
// ----- undo / redo -----
// Every edit snapshots the world first, so anything (even erasing) can be undone.
const UNDO_MAX=40;
const snap=w=>JSON.stringify({N:w.N,t:w.t,ov:w.ov,o:w.o,c:w.c});
function restore(w,s){const d=JSON.parse(s);w.N=d.N;w.t=d.t;w.ov=d.ov;w.o=d.o;w.c=d.c;}
function History(w){return{w,u:[],r:[],
 push(){this.u.push(snap(this.w));if(this.u.length>UNDO_MAX)this.u.shift();this.r=[];},
 undo(){if(!this.u.length)return false;this.r.push(snap(this.w));restore(this.w,this.u.pop());return true;},
 redo(){if(!this.r.length)return false;this.u.push(snap(this.w));restore(this.w,this.r.pop());return true;}};}
// ----- expanding -----
// Grow the world by 2 tiles on every side (everything shifts so it stays centered).
function expandWorld(w){
 if(w.N+4>WB_MAX)return false;const N=w.N,M=N+4,g=themeById(w.theme).ground;let t='',ov='';
 for(let y=0;y<M;y++)for(let x=0;x<M;x++){const ox=x-2,oy=y-2,inside=ox>=0&&oy>=0&&ox<N&&oy<N;t+=inside?w.t[oy*N+ox]:g;ov+=inside?w.ov[oy*N+ox]:'.';}
 w.N=M;w.t=t;w.ov=ov;w.o.forEach(o=>{o.x+=2;o.y+=2;});w.c.forEach(c=>{c.x+=2;c.y+=2;});return true;
}
// ----- a kid's worlds -----
function kidWorlds(k){if(!Array.isArray(k.worlds))k.worlds=[];return k.worlds;}
function dupWorld(k,w){const c=migrateWorld(JSON.parse(JSON.stringify(w)));c.id=wuid();c.name=(w.name+' copy').slice(0,24);c.made=c.at=Date.now();c.ch={};kidWorlds(k).push(c);return c;}
