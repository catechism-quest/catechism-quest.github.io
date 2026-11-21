// Catechism Quest World Builder: the engine. Camera, terrain baking, the render loop, day and night,
// weather, particles, and touch/mouse input for every tool.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// The open world's runtime state (one at a time). null when the builder isn't open.
let WBS=null;
// ================= COORDINATES =================
// Art space: tile (x,y) height z → art pixels, with the world's top corner at (S.ox, S.oy).
function W2A(S,x,y,z){return[S.ox+(x-y)*TW2,S.oy+(x+y)*TH2-(z||0)*HU];}
function A2T(S,ax,ay){const dx=(ax-S.ox)/TW2,dy=(ay-S.oy)/TH2;return[(dy+dx)/2,(dy-dx)/2];}
function scr2art(S,sx,sy){const c=S.cam;return[(sx-S.vw/2)/c.z+c.x,(sy-S.vh/2)/c.z+c.y];}
function art2scr(S,ax,ay){const c=S.cam;return[(ax-c.x)*c.z+S.vw/2,(ay-c.y)*c.z+S.vh/2];}

// ================= OPEN / CLOSE =================
function wbStart(k,w,cv){
 wbStop();
 const S={k,w,cv,ctx:cv.getContext('2d'),hist:History(w),tool:'play',sel:null,rot:0,brush:1,paint:'g',ovt:'r',hover:null,selected:null,moving:null,
  ents:[],veh:[],parts:[],ostate:{},pop:{},t:0,last:performance.now(),ptrs:new Map(),drag:null,shake:0,precip:[],dirty:false,night:false,dark:0,ui:{}};
 S.ox=w.N*TW2+TW;S.oy=HU*3;
 WBS=S;wbResize();
 S.cam={x:S.ox,y:S.oy+w.N*TH2,z:Math.max(1.7,Math.min(3,S.vw/(w.N*TW)*2.4))};
 wbRebuild(S,true);
 const on=(t,f,o)=>{cv.addEventListener(t,f,o);(S.off=S.off||[]).push(()=>cv.removeEventListener(t,f,o));};
 on('pointerdown',wbDown);on('pointermove',wbMove);on('pointerup',wbUp);on('pointercancel',wbUp);on('pointerleave',e=>{if(!S.ptrs.size)S.hover=null;});
 on('wheel',wbWheel,{passive:false});on('contextmenu',e=>e.preventDefault());
 S.onResize=()=>wbResize();addEventListener('resize',S.onResize);
 S.raf=requestAnimationFrame(wbFrame);
 return S;
}
function wbStop(){const S=WBS;if(!S)return;cancelAnimationFrame(S.raf);(S.off||[]).forEach(f=>f());removeEventListener('resize',S.onResize);wbSaveNow(S);WBS=null;}
function wbResize(){const S=WBS;if(!S)return;const dpr=Math.min(2,window.devicePixelRatio||1);S.dpr=dpr;S.vw=innerWidth;S.vh=innerHeight;S.cv.width=Math.round(S.vw*dpr);S.cv.height=Math.round(S.vh*dpr);S.cv.style.width=S.vw+'px';S.cv.style.height=S.vh+'px';}
// After any edit: recompute what's blocked, fence joins, cars and trains, creature list, and maybe the terrain image.
function wbRebuild(S,all){
 const w=S.w;S.ox=w.N*TW2+TW;
 S.blocked=blockedSet(w);
 w.o.forEach(o=>{if(OBJ[o.t].conn)o._m=connMask(w,o);});
 if(all||S.terrainDirty){bakeTerrain(S);S.terrainDirty=false;}
 if(all||S.vehDirty){S.veh=makeVehicles(w);S.vehDirty=false;}
 // keep the running creatures in step with the saved list
 const have=new Set(S.ents.map(e=>e.c));S.ents=S.ents.filter(e=>w.c.includes(e.c));w.c.forEach(c=>{if(!have.has(c))S.ents.push(...makeEnts({c:[c]}));});
 S.water=[];for(let y=0;y<w.N;y++)for(let x=0;x<w.N;x++)if(isWater(w,x,y)&&ovAt(w,x,y)==='.')S.water.push([x,y]);
}
// Saving: a short wait after the last edit, then the world goes into the kid's save (and the cloud, if on).
let wbSaveT=null;
function wbDirty(structural){const S=WBS;if(!S)return;if(structural)wbRebuild(S);clearTimeout(wbSaveT);wbSaveT=setTimeout(()=>wbSaveNow(S),700);if(typeof wbAfterEdit==='function')wbAfterEdit(S);}
function wbSaveNow(S){clearTimeout(wbSaveT);if(!S)return;S.w.at=Date.now();save(S.k);}

// ================= TERRAIN =================
// The ground (tiles, roads, paths, rails, bridges and the world's edges) is drawn once into an image.
function bakeTerrain(S){
 const w=S.w,N=w.N,c=S.tcan||(S.tcan=document.createElement('canvas'));c.width=N*TW+TW*2;c.height=N*TH+HU*5;const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);
 const o={ox:S.ox,oy:S.oy},pt=(a,b,z)=>P(a,b,z||0,o);
 // the toy-diorama edges: soil under the world's two front sides
 const side=terrainOf(w.theme,themeById(w.theme).ground).side,dep=HU*.75;
 for(let i=0;i<N;i++){
  const tr=terrainOf(w.theme,tAt(w,N-1,i)),tl=terrainOf(w.theme,tAt(w,i,N-1));
  poly(x,[pt(N,i),pt(N,i+1),[pt(N,i+1)[0],pt(N,i+1)[1]+dep],[pt(N,i)[0],pt(N,i)[1]+dep]],shade(tr.side,-.15),false);
  poly(x,[pt(i,N),pt(i+1,N),[pt(i+1,N)[0],pt(i+1,N)[1]+dep],[pt(i,N)[0],pt(i,N)[1]+dep]],tl.side,false);
 }
 x.strokeStyle=OUT;x.lineWidth=1;x.beginPath();x.moveTo(...pt(N,0));x.lineTo(pt(N,0)[0],pt(N,0)[1]+dep);x.lineTo(pt(N,N)[0],pt(N,N)[1]+dep);x.lineTo(pt(0,N)[0],pt(0,N)[1]+dep);x.lineTo(...pt(0,N));x.stroke();
 for(let y=0;y<N;y++)for(let X=0;X<N;X++){
  const ch=tAt(w,X,y),t=terrainOf(w.theme,ch),wet=!!t.water,z=wet?-.12:0,col=t.c[(X+y)%2];
  poly(x,[pt(X,y,z),pt(X+1,y,z),pt(X+1,y+1,z),pt(X,y+1,z)],col,false);
  if(wet){// banks where water meets land on the far sides
   if(!isWater(w,X,y-1)&&y>0)poly(x,[pt(X,y,0),pt(X+1,y,0),pt(X+1,y,z),pt(X,y,z)],shade(terrainOf(w.theme,tAt(w,X,y-1)).side,-.1),false);
   if(!isWater(w,X-1,y)&&X>0)poly(x,[pt(X,y,0),pt(X,y+1,0),pt(X,y+1,z),pt(X,y,z)],terrainOf(w.theme,tAt(w,X-1,y)).side,false);
  }else for(let i=0;i<3;i++){const h=hash(X,y,i);if(h<.55){const [a,b]=pt(X+hash(y,X,i+5)*.8+.1,y+hash(X+i,y,7)*.8+.1);x.fillStyle=t.dot;x.fillRect(Math.round(a),Math.round(b),ch==='g'?1:2,ch==='g'?2:1);}}
 }
 // overlays: roads, paths and rails join toward neighbors of the same kind
 for(let y=0;y<N;y++)for(let X=0;X<N;X++){const ov=ovAt(w,X,y);if(ov==='.')continue;drawOverlay(x,o,w,X,y,ov);}
}
function drawOverlay(x,o,w,X,y,ov){
 const def=OVERLAYS[ov],hw=def.w/2,wet=isWater(w,X,y),z=wet?.12:.01,pt=(a,b,zz)=>P(X+a,y+b,zz==null?z:zz,o);
 const n=[ovAt(w,X,y-1)===ov,ovAt(w,X+1,y)===ov,ovAt(w,X,y+1)===ov,ovAt(w,X-1,y)===ov];
 const rect=(a0,b0,a1,b1,c,zz)=>poly(x,[pt(a0,b0,zz),pt(a1,b0,zz),pt(a1,b1,zz),pt(a0,b1,zz)],c,false);
 const lo=.5-hw,hi=.5+hw,arms=[[lo,0,hi,.5],[.5,lo,1,hi],[lo,.5,hi,1],[0,lo,.5,hi]];
 if(wet){// a bridge: a wooden deck on posts
  const deck='#a86b3c';rect(lo-.04,lo-.04,hi+.04,hi+.04,deck);arms.forEach((a,i)=>{if(n[i])rect(a[0]-(i%2?0:.04),a[1]-(i%2?.04:0),a[2]+(i%2?0:.04),a[3]+(i%2?.04:0),deck);});
  for(let i=0;i<4;i++){const [a,b]=pt(i%2?hi:lo,i<2?lo:hi,z);x.fillStyle=OUT;x.fillRect(Math.round(a)-1,Math.round(b),2,5);}
  if(ov==='l')drawRails(x,o,X,y,n,z+.01);return;
 }
 if(ov==='l'){drawRails(x,o,X,y,n,z);return;}
 const c=def.c;rect(lo,lo,hi,hi,c);arms.forEach((a,i)=>{if(n[i])rect(a[0],a[1],a[2],a[3],c);});
 if(ov==='r'){// lane dashes along each connected direction
  x.fillStyle=def.line;const d=(a,b)=>{const [sx,sy]=pt(a,b);x.fillRect(Math.round(sx)-1,Math.round(sy),2,1);};
  if(n[1]||n[3]){d(.25,.5);d(.75,.5);}if(n[0]||n[2]){d(.5,.25);d(.5,.75);}
 }else{x.fillStyle=def.dot;for(let i=0;i<3;i++){const [sx,sy]=pt(.35+hash(X,y,i)*.3,.35+hash(y,X,i)*.3);x.fillRect(Math.round(sx),Math.round(sy),2,1);}}
}
function drawRails(x,o,X,y,n,z){
 const pt=(a,b)=>P(X+a,y+b,z,o),line=(a0,b0,a1,b1,c,wd)=>{x.strokeStyle=c;x.lineWidth=wd||1;x.beginPath();x.moveTo(...pt(a0,b0));x.lineTo(...pt(a1,b1));x.stroke();};
 const any=n.some(Boolean),ax=n[1]||n[3]||!any,ay=n[0]||n[2];
 if(ax){for(let i=.1;i<1;i+=.25){const a=n[3]||i>=.5?i:i;if(!n[3]&&i<.5&&any&&!ax)continue;line(a,.32,a,.68,'#7a4a2a',2);}line(n[3]?0:.3,.38,n[1]?1:.7,.38,'#8d86a6');line(n[3]?0:.3,.62,n[1]?1:.7,.62,'#8d86a6');}
 if(ay){for(let i=.1;i<1;i+=.25)line(.32,i,.68,i,'#7a4a2a',2);line(.38,n[0]?0:.3,.38,n[2]?1:.7,'#8d86a6');line(.62,n[0]?0:.3,.62,n[2]?1:.7,'#8d86a6');}
}

// ================= RENDER LOOP =================
const DAY_LEN=180;   // seconds for a full day when the cycle is on
function wbFrame(now){
 const S=WBS;if(!S)return;S.raf=requestAnimationFrame(wbFrame);
 if(document.hidden)return;
 const dt=Math.min(.05,(now-S.last)/1000);S.last=now;S.t+=dt;
 // day and night
 const mode=S.w.set.day;const b=mode==='day'?1:mode==='night'?0:.5+.5*Math.cos(S.t/DAY_LEN*Math.PI*2);
 S.dark=Math.max(0,Math.min(.62,(.58-b)*1.5));const wasNight=S.night;S.night=S.dark>.3;
 if(S.night!==wasNight)S.ents.forEach(e=>{if(e.st==='idle'||e.st==='walk'){e.tt=Math.min(e.tt,.5);}});
 S.ents.forEach(e=>stepEnt(S,e,dt));S.veh.forEach(v=>stepVehicle(S,v,dt));
 S.parts=S.parts.filter(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=40*dt;return p.life>0;});
 if(S.shake>0)S.shake-=dt;
 // remember where creatures wander, now and then (quietly, without an undo step)
 if((S.saveCre=(S.saveCre||0)+dt)>20){S.saveCre=0;S.ents.forEach(e=>{e.c.x=Math.round(e.x);e.c.y=Math.round(e.y);});wbSaveNow(S);}
 draw(S);
}
function skyColor(S){const th=themeById(S.w.theme);return S.dark>.05?mixC(th.sky[0],th.sky[1],Math.min(1,S.dark/.62)):th.sky[0];}
function mixC(a,b,t){const p=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16)),A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
function draw(S){
 const {ctx,cam,dpr}=S,w=S.w;
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=skyColor(S);ctx.fillRect(0,0,S.cv.width,S.cv.height);
 const sh=S.shake>0?(Math.random()-.5)*4:0;
 ctx.setTransform(cam.z*dpr,0,0,cam.z*dpr,(S.vw/2-cam.x*cam.z+sh)*dpr,(S.vh/2-cam.y*cam.z)*dpr);ctx.imageSmoothingEnabled=false;
 ctx.drawImage(S.tcan,0,0);
 // water shimmer
 ctx.fillStyle='rgba(255,255,255,.55)';S.water.forEach(([x,y])=>{const ph=(S.t*.6+hash(x,y,3))%1;if(ph<.5){const [a,b]=W2A(S,x+.3+ph*.4,y+.5,-.12);ctx.fillRect(Math.round(a),Math.round(b),4,1);}});
 // build the draw list: flat things first, then everything upright from back to front
 const flat=[],up=[];
 w.o.forEach(o=>{const def=OBJ[o.t],[W,D]=footprint(def,o.r),k=(o.x+W-1)+(o.y+D-1);(def.flat?flat:up).push({k,o,def});});
 S.ents.forEach(e=>{if(!e.hidden)up.push({k:e.x+e.y+.6+(e.def.move==='fly'?.4:0),e});});
 S.veh.forEach(v=>{up.push({k:v.x+v.y+.55,v});if(v.kind==='train')for(let i=1;i<=2;i++){const p=v.trail[Math.min(v.trail.length-1,i*10)];if(p)up.push({k:p[0]+p[1]+.55,v,car:p});}});
 up.sort((a,b)=>a.k-b.k);flat.sort((a,b)=>a.k-b.k);
 S.drawn=[];
 flat.forEach(d=>drawObj(S,d.o,d.def));
 drawGuides(S);
 up.forEach(d=>d.o?drawObj(S,d.o,d.def):d.e?drawEnt(S,d.e):drawVeh(S,d.v,d.car));
 drawGhost(S);
 // particles
 S.parts.forEach(p=>{const a=Math.min(1,p.life*2);ctx.globalAlpha=a;const spn={heart:'heart',note:'note',star:'star',leaf:null,veg:null}[p.kind];
  if(spn){const c=pixCanvas(spn,p.kind==='note'?{k:'#1b1530',m:'#ffd23f'}:null);ctx.drawImage(c,Math.round(p.x-c.width/2),Math.round(p.y-c.height/2));}
  else{ctx.fillStyle={spark:'#ffd23f',drop:'#9ee6ff',leaf:'#47d16a',veg:'#ff9a3c'}[p.kind]||'#fff';ctx.fillRect(Math.round(p.x),Math.round(p.y),2,2);}ctx.globalAlpha=1;});
 // bubbles over creatures
 S.ents.forEach(e=>{if(e.bub&&!e.hidden)drawBubble(S,e);});
 // night: darken, then add glowing lights
 ctx.setTransform(1,0,0,1,0,0);
 if(S.dark>0){
  ctx.fillStyle=`rgba(14,10,44,${S.dark})`;ctx.fillRect(0,0,S.cv.width,S.cv.height);
  ctx.globalCompositeOperation='lighter';
  w.o.forEach(o=>{const def=OBJ[o.t],os=S.ostate[o.u]||{},L=def.light||(def.home&&{z:.4,r:16,c:'#ffd27a'});if(!L)return;if(os.on===false)return;
   const [W,D]=footprint(def,o.r),[ax,ay]=W2A(S,o.x+W/2,o.y+D/2,L.z),[sx,sy]=art2scr(S,ax,ay),r=L.r*cam.z*dpr*(os.on?1.4:1);
   const g=ctx.createRadialGradient(sx*dpr,sy*dpr,0,sx*dpr,sy*dpr,r);g.addColorStop(0,hexA(L.c,S.dark*1.2));g.addColorStop(1,hexA(L.c,0));ctx.fillStyle=g;ctx.fillRect(sx*dpr-r,sy*dpr-r,r*2,r*2);});
  ctx.globalCompositeOperation='source-over';
 }
 drawWeather(S);
}
const hexA=(c,a)=>{const n=parseInt(c.slice(1),16);return`rgba(${n>>16},${(n>>8)&255},${n&255},${Math.max(0,Math.min(1,a))})`;};
function drawObj(S,o,def){
 const ctx=S.ctx,os=S.ostate[o.u]||{},state=Object.assign({},o.s,{m:o._m});
 const spr=objSprite(def,def.conn?0:o.r,state),[ax,ay]=W2A(S,o.x,o.y,0);
 let dy=0,sq=1;
 if(def.float)dy=Math.sin(S.t*2+o.x)*1.5*(os.boost>S.t?2.5:1);
 if(def.hover)dy=-4+Math.sin(S.t*1.5+o.y)*3*(os.boost>S.t?2:1);
 // rockets go up for two seconds, then float back down to the pad
 if(os.launch){const e=S.t-os.launch;if(e<2)dy=-e*e*50;else if(e<4)dy=-Math.pow(4-e,2)*50;else os.launch=0;}
 const p=S.pop[o.u];if(p!=null){const e=S.t-p;if(e<.35)sq=1+Math.sin(e/.35*Math.PI)*.18;else delete S.pop[o.u];}
 if(os.squash&&S.t-os.squash<.4)sq=1-Math.sin((S.t-os.squash)/.4*Math.PI)*.15;
 const x0=Math.round(ax-spr.ax),y0=Math.round(ay-spr.ay+dy);
 if(sq!==1){ctx.save();ctx.translate(ax,ay+dy);ctx.scale(1/sq,sq);ctx.translate(-ax,-(ay+dy));}
 if(S.moving&&S.moving.o===o)ctx.globalAlpha=.35;
 ctx.drawImage(spr.c,x0,y0);
 const st2={boost:os.boost>S.t,night:S.night,erupt:os.erupt>S.t,launch:!!os.launch};
 spr.live.forEach(p=>drawLive(ctx,p,ax,ay+dy,S.t,st2));
 // door opening, gift popping out of a chest or dig spot
 if(os.door>S.t){const d=doorstep(S.w,o,S.blocked);if(d){const [dx,dy2]=W2A(S,d[0]+.5,d[1]+.5,0);ctx.fillStyle='#ffd27a';ctx.fillRect(Math.round(dx)-2,Math.round(dy2)-12,4,1);}}
 if(os.gift&&S.t-os.giftT<3){const e=S.t-os.giftT,c=pixCanvas(os.gift,os.gift==='note'?{k:'#1b1530',m:'#ffd23f'}:null),[gx,gy]=W2A(S,o.x+.5,o.y+.5,.5+Math.min(1,e*2)*.8);ctx.drawImage(c,Math.round(gx-c.width),Math.round(gy-c.height*2),c.width*2,c.height*2);}
 ctx.globalAlpha=1;if(sq!==1)ctx.restore();
 S.drawn.push({o,spr,x0,y0});
}
function entCanvas(e){const f=e.st==='walk'?Math.floor((e.step||0))%2:0;return e.c.t==='villager'?villCanvas(e.c.l||{},f,e.face):pixCanvas(e.def.spr,null,e.face);}
function drawEnt(S,e){
 const ctx=S.ctx,[ax,ay]=W2A(S,e.x+.5,e.y+.5,0),c=entCanvas(e),wet=isWater(S.w,Math.round(e.x),Math.round(e.y))&&ovAt(S.w,Math.round(e.x),Math.round(e.y))==='.';
 if(e.def.move==='fly'||e.hop>2){ctx.fillStyle='rgba(27,21,48,.25)';ctx.fillRect(Math.round(ax-c.width/3),Math.round(ay-1),Math.round(c.width*2/3),2);}
 const sink=wet&&e.def.move!=='fly'?(e.def.move==='swim'?3:4):0,x0=Math.round(ax-c.width/2),y0=Math.round(ay-c.height-e.hop+sink+2);
 if(sink){ctx.save();ctx.beginPath();ctx.rect(x0-2,y0-2,c.width+4,c.height-sink+1);ctx.clip();ctx.drawImage(c,x0,y0);ctx.restore();ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillRect(x0,Math.round(ay)-1+2,c.width,1);}
 else ctx.drawImage(c,x0,y0);
 if(S.selected&&S.selected.e===e){ctx.fillStyle='#ffd23f';const b=Math.floor(S.t*4)%2;ctx.fillRect(Math.round(ax)-2,y0-8-b,5,3);ctx.fillRect(Math.round(ax)-1,y0-5-b,3,2);}
 e.box=[x0,y0,c.width,c.height];
}
function drawVeh(S,v,car){
 const ctx=S.ctx,p=car||[v.x,v.y,v.face],id=v.kind==='car'?v.def:car?'traincar':'trainhead',spr=objSprite(OBJ[id],p[2]%2,{}),[ax,ay]=W2A(S,p[0],p[1],ovAt(S.w,Math.round(p[0]),Math.round(p[1]))!=='.'&&isWater(S.w,Math.round(p[0]),Math.round(p[1]))?.12:0);
 ctx.drawImage(spr.c,Math.round(ax-spr.ax),Math.round(ay-spr.ay));spr.live.forEach(q=>drawLive(ctx,q,ax,ay,S.t,{}));
 if(!car)v.box=[Math.round(ax-spr.ax),Math.round(ay-spr.ay),spr.c.width,spr.c.height];
}
const BUB={heart:['heart'],note:['note',{k:'#1b1530',m:'#ffd23f'}],star:['star'],zz:['zz'],wave:['hand']};
function drawBubble(S,e){
 const ctx=S.ctx,b=BUB[e.bub];if(!b)return;const c=pixCanvas(b[0],b[1]),[x0,y0,wd]=e.box||[0,0,0];const bx=Math.round(x0+wd/2-c.width/2-3),by=y0-c.height-8;
 ctx.fillStyle=OUT;ctx.fillRect(bx-1,by-1,c.width+8,c.height+6);ctx.fillStyle='#fffaf0';ctx.fillRect(bx,by,c.width+6,c.height+4);ctx.fillRect(bx+3,by+c.height+4,3,2);ctx.drawImage(c,bx+3,by+2);
}
// footprint diamonds under the pointer: green where something fits, red where it doesn't
function diamond(S,x,y,c,line){const ctx=S.ctx,o={ox:S.ox,oy:S.oy},z=isWater(S.w,x,y)?-.12:0;poly(ctx,[P(x,y,z,o),P(x+1,y,z,o),P(x+1,y+1,z,o),P(x,y+1,z,o)],c,line||false);}
function drawGuides(S){
 const sel=S.selected;if(sel&&sel.o&&!S.moving){const a=.35+.25*Math.sin(S.t*6);objTiles(sel.o).forEach(([x,y])=>diamond(S,x,y,`rgba(255,210,63,${a})`,'#ffd23f'));}
}
function drawGhost(S){
 const h=S.hover;if(!h)return;const ctx=S.ctx;
 if(S.tool==='build'&&S.sel&&S.sel.kind==='o'||S.moving){
  const def=S.moving?OBJ[S.moving.o.t]:OBJ[S.sel.id],r=S.moving?S.moving.o.r:S.rot,ok=canPlace(S.w,def,h[0],h[1],r,S.moving&&S.moving.o),[W,D]=footprint(def,r);
  for(let j=0;j<D;j++)for(let i=0;i<W;i++)if(inW(S.w,h[0]+i,h[1]+j))diamond(S,h[0]+i,h[1]+j,ok?'rgba(71,209,106,.45)':'rgba(255,59,92,.45)',ok?'#2a9a48':'#ff3b5c');
  const spr=objSprite(def,def.conn?0:r,Object.assign({},def.iconState||{})),[ax,ay]=W2A(S,h[0],h[1],0);ctx.globalAlpha=.6;ctx.drawImage(spr.c,Math.round(ax-spr.ax),Math.round(ay-spr.ay));ctx.globalAlpha=1;
 }else if(S.tool==='friends'&&S.sel){const ok=canStand(S.w,S.sel.id,h[0],h[1]);diamond(S,h[0],h[1],ok?'rgba(71,209,106,.45)':'rgba(255,59,92,.45)',ok?'#2a9a48':'#ff3b5c');}
 else if(['paint','road','erase'].includes(S.tool)){const r=S.tool==='paint'?S.brush-1:0;for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(inW(S.w,h[0]+i,h[1]+j))diamond(S,h[0]+i,h[1]+j,S.tool==='erase'?'rgba(255,59,92,.35)':'rgba(255,255,255,.35)','#fffaf0');}
}
// rain, snow and each theme's ambient effect, in screen space
function drawWeather(S){
 const ctx=S.ctx,dpr=S.dpr,kind=S.w.set.weather!=='none'?S.w.set.weather:themeById(S.w.theme).amb,n={rain:90,snow:70,bubbles:26,leaves:14,stars:40,sparkle:22}[kind]||0;
 if(!n||S.photoClean)return;
 while(S.precip.length<n)S.precip.push({x:Math.random()*S.vw,y:Math.random()*S.vh,s:Math.random()});S.precip.length=n;
 S.precip.forEach(p=>{
  if(kind==='rain'){p.y+=9;p.x-=2;ctx.fillStyle='rgba(158,230,255,.8)';ctx.fillRect(p.x*dpr,p.y*dpr,2*dpr,8*dpr);}
  else if(kind==='snow'){p.y+=.6+p.s;p.x+=Math.sin(S.t+p.s*9)*.4;ctx.fillStyle='#fff';ctx.fillRect(p.x*dpr,p.y*dpr,3*dpr,3*dpr);}
  else if(kind==='bubbles'){p.y-=.5+p.s*.6;p.x+=Math.sin(S.t*2+p.s*9)*.3;ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=dpr;ctx.strokeRect(p.x*dpr,p.y*dpr,(3+p.s*4)*dpr,(3+p.s*4)*dpr);}
  else if(kind==='leaves'){p.y+=.4+p.s*.4;p.x+=Math.sin(S.t+p.s*7)*.7;ctx.fillStyle=p.s>.5?'#ff9a3c':'#47d16a';ctx.fillRect(p.x*dpr,p.y*dpr,3*dpr,2*dpr);}
  else if(kind==='stars'){if(Math.sin(S.t*3+p.s*20)>0){ctx.fillStyle='#fff';ctx.fillRect(p.x*dpr,(p.y*.5)*dpr,2*dpr,2*dpr);}return;}
  else if(kind==='sparkle'){p.y-=.3;ctx.fillStyle=p.s>.5?'#ffffff':'#ff9ec4';if(Math.sin(S.t*4+p.s*30)>.3)ctx.fillRect(p.x*dpr,p.y*dpr,2*dpr,2*dpr);}
  if(p.y>S.vh+10){p.y=-10;p.x=Math.random()*S.vw;}if(p.y<-10){p.y=S.vh+10;p.x=Math.random()*S.vw;}if(p.x<-10)p.x=S.vw+5;if(p.x>S.vw+10)p.x=-5;
 });
}

// ================= INPUT =================
const PAINT_TOOLS=['paint','road','erase'];
function evTile(S,e){const r=S.cv.getBoundingClientRect(),[ax,ay]=scr2art(S,e.clientX-r.left,e.clientY-r.top),[tx,ty]=A2T(S,ax,ay);return[Math.floor(tx),Math.floor(ty),ax,ay];}
function wbDown(e){
 const S=WBS;if(!S)return;S.cv.setPointerCapture&&S.cv.setPointerCapture(e.pointerId);S.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 afterGesture();
 if(S.ptrs.size===2){S.drag=null;const [a,b]=[...S.ptrs.values()];S.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:S.cam.z,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2};if(S.stroke){S.stroke=null;}return;}
 const [tx,ty]=evTile(S,e);S.hover=[tx,ty];
 S.drag={x0:e.clientX,y0:e.clientY,cx:S.cam.x,cy:S.cam.y,moved:false};
 if(PAINT_TOOLS.includes(S.tool)&&e.pointerType!=='mouse'||PAINT_TOOLS.includes(S.tool)&&e.button===0){S.stroke={did:false,last:null};paintAt(S,tx,ty);}
}
function wbMove(e){
 const S=WBS;if(!S)return;const [tx,ty]=evTile(S,e);S.hover=[tx,ty];
 if(!S.ptrs.has(e.pointerId))return;S.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(S.pinch&&S.ptrs.size>=2){const [a,b]=[...S.ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y),cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
  S.cam.x-=(cx-S.pinch.cx)/S.cam.z;S.cam.y-=(cy-S.pinch.cy)/S.cam.z;S.pinch.cx=cx;S.pinch.cy=cy;zoomTo(S,S.pinch.z*d/S.pinch.d,cx,cy);return;}
 if(S.stroke){paintAt(S,tx,ty);return;}
 const d=S.drag;if(!d)return;
 if(!d.moved&&Math.hypot(e.clientX-d.x0,e.clientY-d.y0)>7)d.moved=true;
 if(d.moved){S.cam.x=d.cx-(e.clientX-d.x0)/S.cam.z;S.cam.y=d.cy-(e.clientY-d.y0)/S.cam.z;clampCam(S);}
}
function wbUp(e){
 const S=WBS;if(!S)return;S.ptrs.delete(e.pointerId);
 if(S.pinch){if(S.ptrs.size<2)S.pinch=null;S.drag=null;return;}
 if(S.stroke){if(S.stroke.did){wbDirty(true);}S.stroke=null;S.drag=null;return;}
 const d=S.drag;S.drag=null;if(!d||d.moved)return;
 const [tx,ty,ax,ay]=evTile(S,e);wbTap(S,tx,ty,ax,ay);
 if(e.pointerType!=='mouse')S.hover=S.tool==='build'||S.moving?[tx,ty]:null;
}
function wbWheel(e){const S=WBS;if(!S)return;e.preventDefault();const r=S.cv.getBoundingClientRect();zoomTo(S,S.cam.z*(e.deltaY<0?1.12:1/1.12),e.clientX-r.left,e.clientY-r.top);}
function zoomTo(S,z,sx,sy){const [ax,ay]=scr2art(S,sx,sy);S.cam.z=Math.max(.8,Math.min(5,z));const [bx,by]=scr2art(S,sx,sy);S.cam.x+=ax-bx;S.cam.y+=ay-by;clampCam(S);}
function clampCam(S){const N=S.w.N,[cx,cy]=[S.ox,S.oy+N*TH2];S.cam.x=Math.max(cx-N*TW2,Math.min(cx+N*TW2,S.cam.x));S.cam.y=Math.max(cy-N*TH2-HU*3,Math.min(cy+N*TH2,S.cam.y));}
// Painting with a finger: terrain, roads/paths/rails, or the eraser. One stroke is one undo step.
function paintAt(S,x,y){
 const st=S.stroke;if(!st||!inW(S.w,x,y)||(st.last&&st.last[0]===x&&st.last[1]===y))return;st.last=[x,y];
 const w=S.w,first=!st.did,before=snap(w);let changed=false;
 if(S.tool==='paint'){const r=S.brush-1;for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const a=x+i,b=y+j;if(!inW(w,a,b))continue;
   if(S.paint==='a'){const o=objAt(w,a,b);if(o&&!OBJ[o.t].water)continue;if(w.c.some(c=>c.x===a&&c.y===b&&CRE[c.t].home==='land'&&CRE[c.t].move!=='fly'))continue;}
   if(S.paint!=='a'){const o=objAt(w,a,b);if(o&&OBJ[o.t].water==='on')continue;}
   if(setT(w,a,b,S.paint))changed=true;}if(changed)S.terrainDirty=true;}
 else if(S.tool==='road'){const o=objAt(w,x,y);if(S.ovt==='.'?setOv(w,x,y,'.'):(!o||OBJ[o.t].flat)&&setOv(w,x,y,S.ovt))changed=true;if(changed){S.terrainDirty=true;S.vehDirty=true;}}
 else if(S.tool==='erase'){changed=eraseAt(S,x,y);}
 if(changed){if(first){S.hist.u.push(before);if(S.hist.u.length>UNDO_MAX)S.hist.u.shift();S.hist.r=[];st.did=true;}tone(S.tool==='erase'?330:600+Math.random()*200,.04,'square',0,.025);wbRebuild(S);}
}
// The eraser takes the top thing off a tile: a creature, then an object, then a road, then paints the ground back.
function eraseAt(S,x,y){
 const w=S.w,ci=w.c.findIndex(c=>{const e=S.ents.find(e=>e.c===c);return e&&Math.round(e.x)===x&&Math.round(e.y)===y;});
 if(ci>=0){w.c.splice(ci,1);puff(S,x,y);return true;}
 const o=objAt(w,x,y);if(o){removeObj(w,o);if(S.selected&&S.selected.o===o)S.selected=null;puff(S,x,y);return true;}
 if(ovAt(w,x,y)!=='.'){setOv(w,x,y,'.');S.terrainDirty=true;S.vehDirty=true;return true;}
 const g=themeById(w.theme).ground;if(tAt(w,x,y)!==g){setT(w,x,y,g);S.terrainDirty=true;return true;}
 return false;
}
function puff(S,x,y){const [ax,ay]=W2A(S,x+.5,y+.5,.5);for(let i=0;i<8;i++)S.parts.push({x:ax,y:ay,vx:(Math.random()-.5)*40,vy:-Math.random()*30,life:.6,kind:'spark'});}
// Which creature, car or object is under a point (front-most first, checking actual pixels for objects)
function pickAt(S,ax,ay){
 for(const e of S.ents.slice().sort((a,b)=>(b.x+b.y)-(a.x+a.y))){if(e.hidden||!e.box)continue;const [x0,y0,w,h]=e.box;if(ax>=x0-2&&ax<=x0+w+2&&ay>=y0-2&&ay<=y0+h+2)return{e};}
 for(const v of S.veh){if(!v.box)continue;const [x0,y0,w,h]=v.box;if(ax>=x0&&ax<=x0+w&&ay>=y0&&ay<=y0+h)return{v};}
 for(let i=(S.drawn||[]).length-1;i>=0;i--){const d=S.drawn[i],px=Math.floor(ax-d.x0),py=Math.floor(ay-d.y0);if(px<0||py<0||px>=d.spr.c.width||py>=d.spr.c.height)continue;
  try{if(d.spr.c.getContext('2d').getImageData(px,py,1,1).data[3]>0)return{o:d.o};}catch(e){return{o:d.o};}}
 return null;
}
