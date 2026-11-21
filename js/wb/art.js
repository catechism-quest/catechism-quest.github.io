// Catechism Quest World Builder: isometric art. Turns object definitions (lists of simple parts) into
// pixel-art sprites, draws animated parts live, and paints creature sprites.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// ================= ISO PROJECTION =================
// One tile is 32×16 art pixels; one unit of height is 16 art pixels. The camera scales art pixels up,
// with smoothing off, so everything stays crisp and blocky like the rest of the app.
const TW=32,TH=16,HU=16,TW2=TW/2,TH2=TH/2;
const OUT='rgba(27,21,48,.9)';   // outline color (the app's ink)
// Color helpers: mix toward white (t>0) or black (t<0).
function shade(c,t){
 if(!c||c[0]!=='#')return c;const n=parseInt(c.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255,f=t>0?255:0,a=Math.abs(t);
 const m=v=>Math.round(v+(f-v)*a);return'#'+((1<<24)|(m(r)<<16)|(m(g)<<8)|m(b)).toString(16).slice(1);
}
// A small deterministic random number from integers, for texture details that never flicker.
function hash(a,b,c){let h=(a*374761393+b*668265263+(c||0)*2147483647)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296;}

// ================= PIXEL SPRITES ON CANVAS =================
// Creatures and some decorations reuse the app's string sprites (SPR), painted onto canvases.
const pixCache={};
function pixCanvas(name,map,flip){
 const key=name+'|'+JSON.stringify(map||{})+'|'+(flip?1:0);if(pixCache[key])return pixCache[key];
 const g=SPR[name],c=document.createElement('canvas');c.width=g[0].length;c.height=g.length;const x=c.getContext('2d');
 g.forEach((row,r)=>{for(let i=0;i<row.length;i++){const ch=row[i];if(ch==='.')continue;x.fillStyle=(map&&map[ch])||PAL[ch];x.fillRect(flip?row.length-1-i:i,r,1,1);}});
 return pixCache[key]=c;
}

// ================= PARTS =================
// Each object is a list of parts in tile units, relative to the top corner of its footprint (r=0 facing).
//  ['box',x,y,z,w,d,h,color,{win,door,doorFace,stripe,trim}]  a block; win: window color; door: door color
//  ['roof',x,y,z,w,d,h,color,kind,axis]   kind: gable | pyr | flat | dome; axis 'x' or 'y' (gable ridge)
//  ['cyl',cx,cy,z,r,h,color,{stripe}]       upright cylinder     ['cone',cx,cy,z,r,h,color]
//  ['ball',cx,cy,z,r,color]                 sphere (tree tops, bushes, boulders)
//  ['tile',x,y,w,d,color,z]                 flat area (pools, fields, gardens)
//  ['dots',x,y,w,d,colors,n,z]              scattered pixels (flowers, crops)
//  ['pole',cx,cy,z,h,color]   ['flag',cx,cy,z,h,color]   ['px',cx,cy,z,sprite,scale,map]
//  ['live',kind,cx,cy,z,...]               drawn every frame (wheels, blades, water, smoke, glow)
const P=(x,y,z,o)=>[o.ox+(x-y)*TW2,o.oy+(x+y)*TH2-z*HU];
function poly(ctx,pts,fill,line){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(line!==false){ctx.strokeStyle=line||OUT;ctx.lineWidth=1;ctx.stroke();}}
const ELX=TW2*Math.SQRT2*.7,ELY=TH2*Math.SQRT2*.7;   // a circle of radius 1 on the ground, on screen
function ell(ctx,cx,cy,rx,ry,fill,line,half){ctx.beginPath();ctx.ellipse(cx,cy,Math.max(.5,rx),Math.max(.5,ry),0,half?0:0,half?Math.PI:Math.PI*2);if(half)ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(line!==false){ctx.strokeStyle=line||OUT;ctx.lineWidth=1;ctx.stroke();}}
// a quad on a box face, in that face's own u (along) / v (up) units
function faceQuad(ctx,o,face,b,u0,v0,u1,v1,fill){
 const [x,y,z,w,d]=b;let pts;
 if(face==='y')pts=[[x+u0,y+d,z+v0],[x+u1,y+d,z+v0],[x+u1,y+d,z+v1],[x+u0,y+d,z+v1]];
 else pts=[[x+w,y+u0,z+v0],[x+w,y+u1,z+v0],[x+w,y+u1,z+v1],[x+w,y+u0,z+v1]];
 poly(ctx,pts.map(p=>P(p[0],p[1],p[2],o)),fill,shade(fill,-.5));
}
function drawBox(ctx,o,p){
 const [,x,y,z,w,d,h,c,opt={}]=p,top=shade(c,.2),side=c,dark=shade(c,-.22);
 const pt=(a,b,e)=>P(a,b,e,o);
 poly(ctx,[pt(x,y+d,z),pt(x+w,y+d,z),pt(x+w,y+d,z+h),pt(x,y+d,z+h)],side);         // +y face (left, front)
 poly(ctx,[pt(x+w,y,z),pt(x+w,y+d,z),pt(x+w,y+d,z+h),pt(x+w,y,z+h)],dark);         // +x face (right, front)
 poly(ctx,[pt(x,y,z+h),pt(x+w,y,z+h),pt(x+w,y+d,z+h),pt(x,y+d,z+h)],top);          // top
 const b=[x,y,z,w,d,h];
 if(opt.stripe){for(let v=opt.stripe;v<h;v+=opt.stripe*2){faceQuad(ctx,o,'y',b,0,v,w,Math.min(h,v+opt.stripe),shade(opt.sc||c,-.12));faceQuad(ctx,o,'x',b,0,v,d,Math.min(h,v+opt.stripe),shade(opt.sc||c,-.3));}}
 if(opt.trim)faceQuad(ctx,o,'y',b,0,h-.08,w,h,opt.trim),faceQuad(ctx,o,'x',b,0,h-.08,d,h,shade(opt.trim,-.2));
 if(opt.win){
  const wc=opt.win,floors=Math.max(1,Math.round(h/.75));
  ['y','x'].forEach(f=>{const len=f==='y'?w:d,n=Math.max(1,Math.round(len*1.6));for(let fl=0;fl<floors;fl++){const v0=fl*(h/floors)+(h/floors)*.38,v1=v0+(h/floors)*.32;
   for(let i=0;i<n;i++){const u=(i+.5)*len/n;if(opt.door&&f===opt.df&&fl===0&&Math.abs(u-len/2)<.3)continue;faceQuad(ctx,o,f,b,u-.1,v0,u+.1,v1,f==='y'?wc:shade(wc,-.2));}}});
 }
 if(opt.door&&(opt.df==='y'||opt.df==='x')){const len=opt.df==='y'?w:d,dw=Math.min(.36,len*.4)*(opt.dw||1);faceQuad(ctx,o,opt.df,b,len/2-dw/2,0,len/2+dw/2,Math.min(h*.85,.55*(opt.dh||1)),opt.door);}
}
function drawRoof(ctx,o,p){
 const [,x,y,z,w,d,h,c,kind,axis]=p,top=shade(c,.12),dark=shade(c,-.25),pt=(a,b,e)=>P(a,b,e,o);
 if(kind==='flat'){drawBox(ctx,o,['box',x,y,z,w,d,h||.08,c]);return;}
 if(kind==='dome'){const [cx,cy]=pt(x+w/2,y+d/2,z),r=Math.min(w,d)/2;ell(ctx,cx,cy,r*ELX*1.4,r*HU*1.6*(h||1),c,undefined,false);ctx.save();ctx.beginPath();ctx.rect(cx-99,cy,198,99);ctx.clip();ell(ctx,cx,cy,r*ELX*1.4,r*ELY*1.4,shade(c,-.15));ctx.restore();ell(ctx,cx-r*ELX*.5,cy-r*HU*(h||1)*.9,r*3,r*2,shade(c,.35),false);return;}
 if(kind==='pyr'){const a=pt(x+w/2,y+d/2,z+h);
  poly(ctx,[pt(x,y,z),pt(x+w,y,z),a],top);poly(ctx,[pt(x,y,z),pt(x,y+d,z),a],top);
  poly(ctx,[pt(x+w,y,z),pt(x+w,y+d,z),a],dark);poly(ctx,[pt(x,y+d,z),pt(x+w,y+d,z),a],c);return;}
 if(axis==='y'){const m=x+w/2;
  poly(ctx,[pt(x,y,z),pt(x,y+d,z),pt(m,y+d,z+h),pt(m,y,z+h)],top);
  poly(ctx,[pt(x+w,y,z),pt(x+w,y+d,z),pt(m,y+d,z+h),pt(m,y,z+h)],dark);
  poly(ctx,[pt(x,y+d,z),pt(x+w,y+d,z),pt(m,y+d,z+h)],shade(c,-.05));
 }else{const m=y+d/2;
  poly(ctx,[pt(x,y,z),pt(x+w,y,z),pt(x+w,m,z+h),pt(x,m,z+h)],top);
  poly(ctx,[pt(x+w,y,z),pt(x+w,y+d,z),pt(x+w,m,z+h)],dark);
  poly(ctx,[pt(x,y+d,z),pt(x+w,y+d,z),pt(x+w,m,z+h),pt(x,m,z+h)],c);
 }
}
function drawCyl(ctx,o,p){
 const [,cx,cy,z,r,h,c,opt={}]=p,[bx,by]=P(cx,cy,z,o),ty=by-h*HU,rx=r*ELX*1.4,ry=r*ELY*1.4;
 ell(ctx,bx,by,rx,ry,shade(c,-.25));
 ctx.fillStyle=c;ctx.fillRect(bx-rx,ty,rx,by-ty);ctx.fillStyle=shade(c,-.22);ctx.fillRect(bx,ty,rx,by-ty);
 if(opt.stripe){for(let v=opt.stripe;v<h;v+=opt.stripe*2){ctx.fillStyle=opt.sc;ctx.fillRect(bx-rx,by-(v+opt.stripe)*HU,rx*2,opt.stripe*HU);}}
 if(opt.win){for(let v=.4;v<h-.2;v+=.8){ctx.fillStyle=opt.win;ctx.fillRect(Math.round(bx-rx*.5),Math.round(by-v*HU-5),2,3);ctx.fillRect(Math.round(bx+rx*.3),Math.round(by-v*HU-5),2,3);}}
 ctx.strokeStyle=OUT;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx-rx,ty);ctx.lineTo(bx-rx,by);ctx.moveTo(bx+rx,ty);ctx.lineTo(bx+rx,by);ctx.stroke();
 ell(ctx,bx,ty,rx,ry,shade(c,.2));
}
function drawCone(ctx,o,p){
 const [,cx,cy,z,r,h,c]=p,[bx,by]=P(cx,cy,z,o),ax=bx,ay=by-h*HU,rx=r*ELX*1.4,ry=r*ELY*1.4;
 ell(ctx,bx,by,rx,ry,shade(c,-.2));
 poly(ctx,[[bx-rx,by],[ax,ay],[bx,by+ry]],c);poly(ctx,[[bx,by+ry],[ax,ay],[bx+rx,by]],shade(c,-.22));
}
function drawBall(ctx,o,p){
 const [,cx,cy,z,r,c]=p,[bx,by]=P(cx,cy,z,o),R=r*ELX*1.45,y0=by-r*HU*1.1;
 ell(ctx,bx,y0,R,R*.92,shade(c,-.2));
 ctx.save();ctx.beginPath();ctx.ellipse(bx,y0,R,R*.92,0,0,Math.PI*2);ctx.clip();
 ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(bx-R*.18,y0-R*.18,R*.9,R*.8,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=shade(c,.25);ctx.beginPath();ctx.ellipse(bx-R*.4,y0-R*.45,R*.32,R*.22,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawTile(ctx,o,p){const [,x,y,w,d,c,z=0]=p,pt=(a,b)=>P(a,b,z,o);poly(ctx,[pt(x,y),pt(x+w,y),pt(x+w,y+d),pt(x,y+d)],c,shade(c,-.35));}
function drawDots(ctx,o,p){const [,x,y,w,d,cols,n,z=0]=p;for(let i=0;i<n;i++){const a=x+hash(i,1,n)*w,b=y+hash(i,2,n)*d,[sx,sy]=P(a,b,z,o);const X=Math.round(sx),Y=Math.round(sy);ctx.fillStyle='#2a9a48';ctx.fillRect(X,Y-1,1,2);ctx.fillStyle=cols[i%cols.length];ctx.fillRect(X-1,Y-3,3,2);ctx.fillStyle=shade(cols[i%cols.length],-.35);ctx.fillRect(X-1,Y-2,3,1);}}
function drawPole(ctx,o,p){const [,cx,cy,z,h,c]=p,[bx,by]=P(cx,cy,z,o);ctx.fillStyle=OUT;ctx.fillRect(Math.round(bx)-1,Math.round(by-h*HU),3,Math.round(h*HU));ctx.fillStyle=c;ctx.fillRect(Math.round(bx),Math.round(by-h*HU)+1,1,Math.round(h*HU)-1);}
function drawFlag(ctx,o,p){const [,cx,cy,z,h,c]=p;drawPole(ctx,o,['pole',cx,cy,z,h,'#d7dde8']);const [bx,by]=P(cx,cy,z+h,o);poly(ctx,[[bx+1,by],[bx+11,by+3],[bx+1,by+7]],c);}
function drawPx(ctx,o,p){const [,cx,cy,z,name,s=1,map]=p,c=pixCanvas(name,map),[bx,by]=P(cx,cy,z,o);ctx.drawImage(c,Math.round(bx-c.width*s/2),Math.round(by-c.height*s),c.width*s,c.height*s);}
const PART_DRAW={box:drawBox,roof:drawRoof,cyl:drawCyl,cone:drawCone,ball:drawBall,tile:drawTile,dots:drawDots,pole:drawPole,flag:drawFlag,px:drawPx};

// ================= ROTATION =================
// Turning an object a quarter turn clockwise maps (x,y) in a W×D footprint to (D−y, x).
const rotPt=(x,y,D)=>[D-y,x];
function rotPart(p,W,D){
 const q=p.slice(),t=p[0];
 if(t==='box'){const [x,y,w,d]=[p[1],p[2],p[4],p[5]];q[1]=D-(y+d);q[2]=x;q[4]=d;q[5]=w;if(p[8]){q[8]=Object.assign({},p[8]);if(p[8].df)q[8].df={y:'-x','-x':'-y','-y':'x',x:'y'}[p[8].df];}}
 else if(t==='roof'){const [x,y,w,d]=[p[1],p[2],p[4],p[5]];q[1]=D-(y+d);q[2]=x;q[4]=d;q[5]=w;q[9]=p[9]==='y'?'x':'y';}
 else if(t==='tile'||t==='dots'){const [x,y,w,d]=[p[1],p[2],p[3],p[4]];q[1]=D-(y+d);q[2]=x;q[3]=d;q[4]=w;}
 else if(t==='live'){const r=rotPt(p[2],p[3],D);q[2]=r[0];q[3]=r[1];q.rot=(p.rot||0)+1;}
 else{const r=rotPt(p[1],p[2],D);q[1]=r[0];q[2]=r[1];}
 return q;
}
function partsFor(def,r,state){
 let parts=typeof def.parts==='function'?def.parts(state||{}):def.parts,W=def.w||1,D=def.d||1;
 for(let i=0;i<(r||0);i++){parts=parts.map(p=>rotPart(p,W,D));[W,D]=[D,W];}
 return{parts,W,D};
}
// How tall a part list is, in height units, so the sprite canvas is big enough.
function partsTop(parts){let t=0;parts.forEach(p=>{const ty=p[0];
 if(ty==='box'||ty==='roof')t=Math.max(t,p[3]+(p[6]||.1)+(p[8]==='dome'?Math.min(p[4],p[5])*.8:0));
 else if(ty==='cyl'||ty==='cone')t=Math.max(t,p[3]+p[5]);else if(ty==='ball')t=Math.max(t,p[3]+p[4]*2.6);
 else if(ty==='pole'||ty==='flag')t=Math.max(t,p[3]+p[4]+.5);else if(ty==='px'){const g=SPR[p[4]];t=Math.max(t,p[3]+g.length*(p[5]||1)/HU+.2);}
 else if(ty==='live')t=Math.max(t,p[4]+(typeof p[5]==='number'?p[5]:.5)*2+.5);});return t;}

// ================= OBJECT SPRITES =================
// Static parts are drawn once per object/rotation/state into a cached canvas; 'live' parts are kept
// aside and drawn every frame. Edges are snapped to whole pixels so sprites stay crisp when scaled.
const objCache=new Map();
function objSprite(def,r,state){
 const sk=def.stateKey?def.stateKey(state||{}):'';const key=def.id+'|'+(r||0)+'|'+sk;
 let s=objCache.get(key);if(s)return s;
 const {parts,W,D}=partsFor(def,r,state),top=Math.ceil(partsTop(parts)*HU)+6,pad=4;
 const cw=(W+D)*TW2+pad*2,chh=(W+D)*TH2+top+pad*2;
 const c=document.createElement('canvas');c.width=Math.ceil(cw);c.height=Math.ceil(chh);const ctx=c.getContext('2d');
 const o={ox:D*TW2+pad,oy:top+pad};
 const live=[];parts.forEach(p=>{if(p[0]==='live')live.push(p);else if(PART_DRAW[p[0]])PART_DRAW[p[0]](ctx,o,p);});
 // crisp edges: every pixel is either solid or empty
 try{const im=ctx.getImageData(0,0,c.width,c.height),a=im.data;for(let i=3;i<a.length;i+=4)a[i]=a[i]>110?255:0;ctx.putImageData(im,0,0);}catch(e){}
 s={c,ax:o.ox,ay:o.oy,W,D,live};objCache.set(key,s);return s;
}
// A catalog icon for an object, as a data URL (cached).
const iconCache={};
function objIcon(def){
 if(iconCache[def.id])return iconCache[def.id];
 const s=objSprite(def,0,def.iconState||{}),c=document.createElement('canvas'),size=64;c.width=size;c.height=size;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
 // draw the live parts once too, so wheels and blades show in the icon
 const tmp=document.createElement('canvas');tmp.width=s.c.width;tmp.height=s.c.height;const tx=tmp.getContext('2d');tx.drawImage(s.c,0,0);s.live.forEach(p=>drawLive(tx,p,s.ax,s.ay,1.2,{}));
 const k=Math.min(size/tmp.width,size/tmp.height,3),w=Math.round(tmp.width*k),h=Math.round(tmp.height*k);
 x.drawImage(tmp,Math.round((size-w)/2),Math.round((size-h)/2),w,h);
 return iconCache[def.id]=c.toDataURL();
}

// ================= LIVE PARTS =================
// Drawn each frame at the object's screen anchor (ax, ay = top corner of the footprint on screen).
// t is seconds; st is the object's runtime state (speed boosts, open lids, launches, eruptions).
function drawLive(ctx,p,ax,ay,t,st){
 const [,kind,cx,cy,z]=p,o={ox:ax,oy:ay},[bx,by]=P(cx,cy,z,o),boost=st.boost?3:1;
 if(kind==='wheel'){const R=p[5]*HU,n=8,a0=t*.6*boost;ctx.strokeStyle=OUT;ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx,by,R,0,7);ctx.stroke();ctx.strokeStyle=p[6]||'#ff3b5c';ctx.lineWidth=1;ctx.beginPath();ctx.arc(bx,by,R,0,7);ctx.stroke();
  for(let i=0;i<n;i++){const a=a0+i*Math.PI*2/n,ex=bx+Math.cos(a)*R,ey=by+Math.sin(a)*R;ctx.strokeStyle='#d7dde8';ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(ex,ey);ctx.stroke();ctx.fillStyle=OUT;ctx.fillRect(Math.round(ex)-3,Math.round(ey)-1,6,6);ctx.fillStyle=['#ffd23f','#5ec4ff','#47d16a','#ff7aa8'][i%4];ctx.fillRect(Math.round(ex)-2,Math.round(ey),4,4);}
  ctx.fillStyle='#ffd23f';ctx.fillRect(bx-2,by-2,4,4);}
 else if(kind==='blades'){const R=p[5]*HU,a0=t*1.3*boost;for(let i=0;i<4;i++){const a=a0+i*Math.PI/2,ex=bx+Math.cos(a)*R,ey=by+Math.sin(a)*R*.85,nx=-Math.sin(a)*3,ny=Math.cos(a)*3;poly(ctx,[[bx,by],[ex,ey],[ex+nx,ey+ny],[bx+nx*.5,by+ny*.5]],p[6]||'#fffaf0');}ctx.fillStyle=OUT;ctx.fillRect(bx-2,by-2,4,4);}
 else if(kind==='spin'){// carousel / teacups: little seats circling
  const R=p[5]*ELX*1.3,n=p[7]||6,a0=t*1.2*boost;for(let i=0;i<n;i++){const a=a0+i*Math.PI*2/n,ex=bx+Math.cos(a)*R,ey=by+Math.sin(a)*R*.5;ctx.fillStyle=OUT;ctx.fillRect(Math.round(ex)-3,Math.round(ey)-6,7,8);ctx.fillStyle=(p[6]||['#ff7aa8','#5ec4ff','#ffd23f','#47d16a'])[i%4];ctx.fillRect(Math.round(ex)-2,Math.round(ey)-5,5,6);}}
 else if(kind==='water'){// fountain / waterfall spray
  const h=p[5]||1;for(let i=0;i<10;i++){const ph=(t*1.4*boost+i/10)%1,sx=bx+Math.sin(i*2.1)*ph*8,sy=by-Math.sin(ph*Math.PI)*h*HU;ctx.fillStyle=i%2?'#ffffff':'#9ee6ff';ctx.fillRect(Math.round(sx),Math.round(sy),2,2);}}
 else if(kind==='fall'){const h=p[5]||1;for(let i=0;i<6;i++){const v=((t*2+i/6)%1)*h*HU;ctx.fillStyle=i%2?'#ffffff':'#9ee6ff';ctx.fillRect(Math.round(bx-4+i*1.5),Math.round(by-h*HU+v),2,3);}}
 else if(kind==='smoke'){if(st.night&&p[5]==='day')return;for(let i=0;i<4;i++){const ph=(t*.4+i/4)%1,sy=by-ph*24,sx=bx+Math.sin(ph*6+i)*3;ctx.globalAlpha=1-ph;ctx.fillStyle=p[6]||'#d7dde8';ctx.fillRect(Math.round(sx)-2,Math.round(sy)-2,4+Math.round(ph*3),4);}ctx.globalAlpha=1;}
 else if(kind==='flame'){const f=Math.floor(t*8)%2;ctx.fillStyle='#ff9a3c';ctx.fillRect(bx-2,by-6-f,4,6+f);ctx.fillStyle='#ffd23f';ctx.fillRect(bx-1,by-4-f,2,4);}
 else if(kind==='sway'){// swings
  const a=Math.sin(t*2.4*boost)*.6,L=p[5]*HU;for(let i=0;i<2;i++){const sx=bx+(i?6:-6),ex=sx+Math.sin(a*(i?-1:1))*L,ey=by+Math.cos(a)*L;ctx.strokeStyle=OUT;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sx,by);ctx.lineTo(ex,ey);ctx.stroke();ctx.fillStyle='#ff3b5c';ctx.fillRect(Math.round(ex)-2,Math.round(ey),5,2);}}
 else if(kind==='bob'){// boats, balloons, UFOs: the whole sprite bobs (handled by the engine); this draws a wake/ripple
  const w=Math.sin(t*2)*2;ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(Math.round(bx-10+w),Math.round(by+2),6,1);ctx.fillRect(Math.round(bx+5-w),Math.round(by+3),5,1);}
 else if(kind==='sparkle'){for(let i=0;i<5;i++){const ph=(t*.7+i/5)%1,sx=bx+Math.sin(i*2.4+t)*10,sy=by-ph*26;ctx.globalAlpha=1-ph;ctx.fillStyle=p[5]||'#ffd23f';ctx.fillRect(Math.round(sx),Math.round(sy),2,2);ctx.fillRect(Math.round(sx)-1,Math.round(sy)+1,4,0.01);}ctx.globalAlpha=1;}
 else if(kind==='lights'){// traffic light / siren: blinking colored pixels
  const on=Math.floor(t*(st.boost?6:1.2))%3;(p[5]||['#ff3b5c','#ffd23f','#47d16a']).forEach((c,i)=>{ctx.fillStyle=i===on?c:shade(c,-.6);ctx.fillRect(bx-1,by-i*4,3,3);});}
 else if(kind==='lava'){const h=st.erupt?1:0;for(let i=0;i<(h?16:3);i++){const ph=(t*(h?1.6:.5)+i/16)%1,sx=bx+Math.sin(i*3.3)*ph*(h?18:3),sy=by-Math.sin(ph*Math.PI)*(h?34:4);ctx.fillStyle=i%3?'#ff5e3a':'#ffd23f';ctx.fillRect(Math.round(sx),Math.round(sy),h?3:2,h?3:2);}}
 else if(kind==='jet'){if(!st.launch)return;const f=Math.floor(t*10)%2;ctx.fillStyle='#ff9a3c';ctx.fillRect(bx-3,by,6,6+f*3);ctx.fillStyle='#ffd23f';ctx.fillRect(bx-1,by,2,4+f*2);}
 else if(kind==='swirl'){for(let i=0;i<8;i++){const a=t*2+i*.8,r=3+i*1.2;ctx.fillStyle=i%2?'#c86bff':'#9ee6ff';ctx.fillRect(Math.round(bx+Math.cos(a)*r),Math.round(by+Math.sin(a)*r*.7),2,2);}}
 else if(kind==='bounce'){// trampoline kid, slide kid, seesaw
  const b=Math.abs(Math.sin(t*3*boost))*(p[5]||1)*HU,c=pixCanvas('kid',{c:p[6]||'#ff3b5c'});ctx.drawImage(c,Math.round(bx-c.width/2),Math.round(by-c.height-b));}
}

// ================= CREATURE SPRITES =================
// A villager's look: skin, hair, shirt and pants colors (letters in the 'person' sprite), plus an optional hat.
const SKINS=['#ffcf9e','#e8a87c','#c98a5a','#8a5a3a','#5a3a2a'],HAIRS=['#1b1530','#7a4a2a','#f2c14e','#c43c22','#8d86a6','#ff7aa8'],
 SHIRTS=['#ff3b5c','#3d7bff','#47d16a','#ffd23f','#c86bff','#ff9a3c','#fffaf0','#2b2350'],PANTS=['#2a55c2','#7a4a2a','#1b1530','#6a6385','#2a9a48'],VHATS=[null,'cap','beanie','bow','flowers','tophat','party'];
function lookMap(l){return{s:SKINS[l.s||0],h:HAIRS[l.h||0],c:SHIRTS[l.c||0],C:PANTS[l.p||0],S:shade(SKINS[l.s||0],-.15)};}
const villCache={};
// a villager as a canvas (with hat), in walking frame f (0/1), mirrored when facing left
function villCanvas(look,f,flip){
 const key=JSON.stringify(look)+f+(flip?1:0);if(villCache[key])return villCache[key];
 const base=pixCanvas(f?'person2':'person',lookMap(look),flip),hat=VHATS[look.hat||0],c=document.createElement('canvas');
 const ht=hat?SPR[hat].length-2:0;c.width=Math.max(base.width,hat?SPR[hat][0].length:0);c.height=base.height+ht;const x=c.getContext('2d');
 x.drawImage(base,Math.round((c.width-base.width)/2),ht);
 if(hat){const hc=pixCanvas(hat,null,flip);x.drawImage(hc,Math.round((c.width-hc.width)/2),0);}
 return villCache[key]=c;
}
