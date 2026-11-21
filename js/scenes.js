// Catechism Quest: the painted land backgrounds and the journey through the Bible story.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// ================= SCENES =================
// Each land is a place from the Bible story, in order. Its background is drawn on a tiny
// canvas (BW x BH) with whole-pixel rectangles and scaled up, so it looks like the sprites.
const BW=120,BH=200;
function drawScene(fn){
 const cv=document.createElement('canvas');cv.width=BW;cv.height=BH;const x=cv.getContext('2d');
 const R=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),Math.round(w),Math.round(h));};
 let seed=11;const rn=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const P={R,rn,
  sky(a,b,c){R(0,0,BW,44,a);R(0,44,BW,52,b);R(0,96,BW,BH-96,c);},
  ground(y,c,top){R(0,y,BW,BH-y,c);if(top)R(0,y,BW,2,top);},
  ridge(base,amp,f,ph,c,st){st=st||2;for(let i=0;i<BW;i++){const y=Math.round((base+amp*Math.sin(i*f+ph))/st)*st;R(i,y,1,BH-y,c);}},
  // a peak at (cx,top); slope = pixels down per pixel sideways; stops at base
  mtn(cx,top,slope,c,base){base=base||BH;for(let i=0;i<BW;i++){const y=Math.round(top+Math.abs(i-cx)*slope);if(y<base)R(i,y,1,base-y,c);}},
  mtnS(cx,top,slope,c,dark,base){base=base||BH;for(let i=0;i<BW;i++){const y=Math.round(top+Math.abs(i-cx)*slope);if(y<base)R(i,y,1,base-y,i>cx+1?dark:c);}},
  disc(cx,cy,r,c){for(let j=-r;j<=r;j++){const w=Math.round(Math.sqrt(r*r-j*j));R(cx-w,cy+j,w*2+1,1,c);}},
  ring(cx,cy,r0,r1,c,maxY){for(let j=-r1;j<=0;j++)for(let i=-r1;i<=r1;i++){const d=Math.sqrt(i*i+j*j);if(d>=r0&&d<r1&&cy+j<maxY)R(cx+i,cy+j,1,1,c);}},
  stars(n,maxY,c){for(let i=0;i<n;i++){const a=rn()*BW|0,b=rn()*maxY|0;R(a,b,1,1,c||'#fff');if(rn()<.12){R(a-1,b,3,1,c||'#fff');R(a,b-1,1,3,c||'#fff');}}},
  tree(t,y,leaf,dark,fruit){R(t-1,y-7,3,7,'#7a4a2a');P.disc(t,y-12,6,dark||'#2a9a48');P.disc(t-1,y-13,4,leaf||'#47d16a');if(fruit){R(t-3,y-14,2,2,fruit);R(t+2,y-11,2,2,fruit);R(t-1,y-9,2,2,fruit);}},
  palm(t,y){for(let i=0;i<16;i++)R(t+Math.round(i*i/70),y-i,2,1,'#a86b3c');const tx=t+4,ty=y-16;
   [[-1,0],[1,0],[-1,1],[1,1],[0,-1]].forEach(([dx,dy])=>{for(let i=1;i<8;i++)R(tx+dx*i,ty+dy*Math.round(i*i/14)+(dy<0?-i/2:0),2,2,i<5?'#2a9a48':'#47d16a');});},
  sheep(a,b){R(a,b,7,4,'#fff');R(a+1,b-1,5,1,'#fff');R(a+6,b,3,3,'#1b1530');R(a+1,b+4,1,2,'#1b1530');R(a+5,b+4,1,2,'#1b1530');},
  house(a,b,w,h,c,roof){R(a,b,w,h,c);R(a-1,b-2,w+2,2,roof||'#b98a5a');R(a+2,b+3,2,3,'#1b1530');if(w>8)R(a+w-5,b+h-6,3,6,'#7a4a2a');},
  waves(y0,y1,c1,c2,c3){for(let y=y0;y<y1;y++)R(0,y,BW,1,y<y0+6?c1:y<y0+18?c2:c3);for(let y=y0+3;y<y1;y+=5)for(let i=(y*7)%9;i<BW;i+=14)R(i,y,5,1,'rgba(255,255,255,.55)');},
  sun(a,b,r,c,glow){if(glow)P.disc(a,b,r+3,glow);P.disc(a,b,r,c);}
 };
 fn(P);return cv.toDataURL();
}
const SCENES=[
 {name:'Garden of Eden',d(p){p.sky('#5ec4ff','#86d6ff','#b3e8ff');p.ridge(146,5,.09,0,'#7fd88a');p.ground(160,'#47d16a','#2a9a48');
  for(let y=160;y<BH;y++)p.R(56+Math.round(7*Math.sin(y/7)),y,12,1,'#5ec4ff');
  [[14,170],[34,186],[92,172],[108,190]].forEach(([a,b])=>p.tree(a,b,null,null,'#ff3b5c'));p.tree(84,192,'#7fe08a','#2a9a48','#ffd23f');
  for(let i=0;i<26;i++)p.R(p.rn()*BW,164+p.rn()*34,2,2,p.rn()<.5?'#ff7aa8':'#ffd23f');}},
 {name:"Noah's Ark",d(p){p.sky('#86b9e0','#a9d4f0','#cfeaff');['#ff3b5c','#ff9a3c','#ffd23f','#47d16a','#3d7bff','#9a3fd6'].forEach((c,i)=>p.ring(60,150,56-i*3,59-i*3,c,150));
  p.waves(150,BH,'#3d7bff','#2a55c2','#1f3f94');p.R(28,152,64,8,'#7a4a2a');p.R(32,160,56,4,'#5a3420');p.R(40,142,40,10,'#a86b3c');p.R(36,140,48,3,'#5a3420');
  for(let i=44;i<78;i+=8)p.R(i,145,3,3,'#1b1530');p.R(26,150,68,2,'#a86b3c');}},
 {name:'Tower of Babel',d(p){p.sky('#ff9a5c','#ffc07a','#ffe0a0');p.sun(96,70,9,'#fff2b0','#ffd88a');p.ground(176,'#e8c27a','#c98a4a');
  [60,50,40,30,22,14].forEach((w,i)=>{const y=176-(i+1)*11;p.R(60-w/2,y,w,11,i%2?'#c98a5a':'#b8784a');p.R(60-w/2,y,w,1,'#e8b07a');p.R(58,y+4,4,7,'#5a3420');});
  for(let i=0;i<14;i++)p.R(10+i*7,186,4,2,'#b8784a');}},
 {name:"Abraham's Tents",night:1,d(p){p.sky('#120e2e','#1d1850','#2b2770');p.stars(90,150);p.ridge(168,4,.07,1,'#4a3a5a');p.ground(178,'#6a5040','#5a4030');
  [[34,178,14,'#d9c49a'],[82,180,11,'#c9a070']].forEach(([cx,b,h,c])=>{for(let j=0;j<h;j++){p.R(cx-j*1.4,b-h+j,j*2.8+1,1,j%4<2?c:'#a86b3c');}p.R(cx-2,b-6,4,6,'#1b1530');});
  p.palm(100,178);p.R(56,176,6,3,'#ff9a3c');p.R(58,174,2,2,'#ffd23f');}},
 {name:'Mount Moriah',d(p){p.sky('#ffd6a0','#ffe6c0','#fff2dc');p.mtnS(60,86,1.3,'#b8946a','#8a6a4a');p.R(52,80,16,6,'#7d7698');p.R(54,78,12,2,'#a9a3c0');
  p.R(56,74,8,4,'#7a4a2a');p.R(58,70,4,4,'#ff9a3c');p.R(59,67,2,3,'#ffd23f');p.ground(186,'#c9a070','#a88a6a');p.sheep(64,100);}},
 {name:'Bethel',night:1,d(p){p.sky('#1b1240','#2e1f60','#3e2c7a');p.stars(70,120);
  for(let y=0;y<176;y++){const s=Math.round(4+y/18);p.R(60-s-2,y,2,1,'#ffe9a8');p.R(60+s,y,2,1,'#ffe9a8');if(y%9===0)p.R(60-s,y,2*s,1,'#ffd23f');}
  p.ground(176,'#5a4a6a','#7d6a8a');p.R(40,172,12,5,'#8d86a6');p.R(66,170,9,7,'#8d86a6');}},
 {name:'Land of Egypt',d(p){p.sky('#ffd23f','#ffe27a','#fff0b0');p.sun(24,36,10,'#fff8d0','#ffe9a8');p.ridge(160,3,.05,2,'#e8b860');
  [[34,128,'#d9a040'],[74,116,'#e8b050'],[102,138,'#c98a30']].forEach(([cx,t,c])=>{p.mtn(cx,t,1,c,172);p.mtn(cx+1,t,1,'rgba(0,0,0,.12)',172);});
  p.ground(172,'#f2c870','#d9a040');p.R(0,188,BW,12,'#3d7bff');p.R(0,188,BW,2,'#86d6ff');p.palm(10,188);p.palm(110,188);}},
 {name:'The Red Sea',d(p){p.sky('#7ec8ff','#a0d8ff','#c8ecff');
  for(let i=0;i<BW;i++){const inW=i<44||i>76;if(!inW)continue;const top=Math.round(80+Math.abs(i-60)*.3+3*Math.sin(i/3));for(let y=top;y<BH;y++)p.R(i,y,1,1,y<top+3?'#ffffff':y%12<6?'#3d7bff':'#2a55c2');}
  for(let y=110;y<BH;y++){const w=Math.round(14+(y-110)*.08);p.R(60-w,y,w*2,1,'#e8c27a');}for(let y=120;y<BH;y+=10)p.R(57,y,6,2,'#c9a060');}},
 {name:'Mount Sinai',d(p){p.sky('#4a4470','#625a88','#857ca6');p.mtnS(60,70,1.2,'#5a4a60','#43354d');
  for(let i=0;i<40;i++){const a=60+(p.rn()-.5)*24,b=58+p.rn()*16;p.R(a,b,3,3,p.rn()<.5?'#ff9a3c':'#ffd23f');}
  p.disc(36,50,9,'#a9a3c0');p.disc(84,46,10,'#a9a3c0');p.disc(60,40,8,'#c9c3d6');
  [[92,10],[88,18],[94,26],[90,34]].forEach(([a,b],i,arr)=>{if(arr[i+1])for(let t=0;t<8;t++)p.R(a+(arr[i+1][0]-a)*t/8,b+t,2,1,'#ffe27a');});p.ground(186,'#a88a6a','#8a6a4a');}},
 {name:'The Wilderness',d(p){p.sky('#ffe0a0','#ffecc0','#fff6e0');p.ridge(150,6,.06,0,'#e8c27a');p.ridge(166,4,.1,2,'#d9a860');p.ground(178,'#e8c27a','#c9a060');
  for(let y=20;y<150;y++)p.R(80+Math.round(2*Math.sin(y/5)),y,8,1,'rgba(255,255,255,.85)');
  p.R(28,160,30,14,'#fff');p.R(36,152,14,10,'#d9c49a');p.R(36,150,14,2,'#9a3fd6');for(let i=28;i<58;i+=4)p.R(i,158,1,16,'#c9a070');
  for(let i=0;i<40;i++)p.R(p.rn()*BW,180+p.rn()*18,1,1,'#fff');}},
 {name:'Jordan River',d(p){p.sky('#5ec4ff','#86d6ff','#b3e8ff');p.ridge(140,8,.05,1,'#8acb7a');p.ground(156,'#5fbf5a','#47a048');
  p.R(0,170,BW,14,'#3d7bff');p.R(0,170,BW,2,'#86d6ff');for(let i=6;i<BW;i+=17)p.R(i,176,6,1,'#86d6ff');
  for(let i=0;i<BW;i+=5){p.R(i,166,1,4,'#2a9a48');p.R(i+2,184,1,4,'#2a9a48');}
  [[50,193],[56,193],[62,193],[68,193],[53,189],[59,189],[65,189],[56,185],[62,185],[59,181]].forEach(([a,b])=>p.R(a,b,5,4,'#a9a3c0'));p.ground(197,'#8a6a4a');}},
 {name:'Jericho',d(p){p.sky('#86c8ff','#a6d8ff','#c8ecff');p.ground(176,'#c9a070','#a88a6a');
  [[16,128,14],[36,120,16],[64,124,14],[86,118,16]].forEach(([a,b,w])=>p.house(a,b,w,14,'#e8d6b0','#c9a070'));
  p.R(8,138,104,38,'#d9b880');for(let i=8;i<112;i+=8)p.R(i,134,5,4,'#d9b880');for(let y=142;y<176;y+=6)for(let i=8+(y%12?4:0);i<112;i+=8)p.R(i,y,1,6,'#b8946a');
  p.R(90,148,6,6,'#1b1530');p.R(95,152,2,20,'#ff3b5c');p.R(54,156,12,20,'#7a4a2a');p.R(18,170,10,6,'#c9a070');p.R(24,166,6,4,'#d9b880');}},
 {name:'Fields of Boaz',d(p){p.sky('#ffb070','#ffd090','#ffe8b8');p.sun(30,96,9,'#fff2b0','#ffe0a0');p.ridge(150,4,.08,0,'#c9a050');p.ground(156,'#ffd23f','#e0a800');
  for(let y=160;y<BH;y+=6)for(let i=(y*5)%7;i<BW;i+=7){p.R(i,y,1,4,'#e0a800');p.R(i,y-1,2,2,'#c98a1b');}
  [[24,170],[52,182],[90,168]].forEach(([a,b])=>{p.R(a,b,6,12,'#e0a800');p.R(a-1,b+4,8,2,'#a86b3c');p.R(a+1,b-2,4,2,'#ffd23f');});p.house(88,138,16,12,'#e8d6b0','#a86b3c');}},
 {name:"David's Pasture",d(p){p.sky('#5ec4ff','#86d6ff','#b3e8ff');p.ridge(128,8,.06,0,'#8ad88a');p.ridge(146,6,.08,2,'#5fc85f');p.ground(162,'#47d16a','#2a9a48');
  [[18,170],[44,184],[70,166],[92,180],[30,152],[84,148]].forEach(([a,b])=>p.sheep(a,b));
  p.R(104,170,2,22,'#7a4a2a');p.R(103,168,5,2,'#7a4a2a');p.R(106,170,1,3,'#7a4a2a');}},
 {name:'Valley of Elah',d(p){p.sky('#7ec0f0','#a0d4f8','#c8e8ff');p.mtn(10,110,.6,'#9ab070');p.mtn(110,106,.6,'#8aa060');p.ground(172,'#b8a070','#a08a5a');
  p.R(0,182,BW,6,'#5ec4ff');[[16,124],[28,130]].forEach(([a,b])=>{p.mtn(a,b,1,'#d9c49a',b+6);p.R(a-1,b+3,2,3,'#5a3420');});[[92,122],[104,128]].forEach(([a,b])=>{p.mtn(a,b,1,'#ff3b5c',b+6);p.R(a-1,b+3,2,3,'#5a3420');});
  [44,52,60,68,76].forEach(a=>{p.R(a,190,4,3,'#c9c3d6');p.R(a+1,189,2,1,'#fff');});}},
 {name:'Jerusalem',d(p){p.sky('#5ec4ff','#86d6ff','#b3e8ff');p.ridge(150,10,.04,1,'#a8a070');
  [[10,126,14,26],[26,118,12,34],[40,110,18,42],[60,104,14,48],[76,114,16,38],[94,122,14,30]].forEach(([a,b,w,h])=>{p.R(a,b,w,h,'#f2e6c8');p.R(a,b,w,2,'#d9c49a');for(let y=b+5;y<b+h-4;y+=7)for(let i=a+2;i<a+w-2;i+=5)p.R(i,y,2,3,'#7a4a2a');});
  p.R(0,150,BW,26,'#d9c49a');for(let i=0;i<BW;i+=8)p.R(i,146,5,4,'#d9c49a');p.R(52,158,16,18,'#5a3420');p.R(54,156,12,2,'#d9c49a');p.ground(176,'#a8a070','#8a8a5a');}},
 {name:"Solomon's Temple",d(p){p.sky('#86d6ff','#b0e4ff','#d8f2ff');p.ground(176,'#e8d6b0','#c9b08a');
  p.R(28,96,64,64,'#f2ead0');p.R(24,90,72,6,'#ffd23f');p.R(30,84,60,6,'#e0a800');p.R(50,120,20,40,'#7a4a2a');p.R(52,122,16,36,'#e0a800');
  [[36,'#c98a1b'],[78,'#c98a1b']].forEach(([a,c])=>{p.R(a,104,6,56,c);p.R(a-1,100,8,4,'#ffd23f');});
  for(let i=0;i<4;i++)p.R(20-i*2,160+i*4,80+i*4,4,i%2?'#e8d6b0':'#d9c49a');p.R(4,170,10,6,'#c98a1b');p.R(106,170,10,6,'#c98a1b');}},
 {name:'Mount Carmel',d(p){p.sky('#6a6a8a','#8a8aa8','#aaaac4');p.disc(100,30,7,'#5a5a78');
  for(let y=0;y<108;y++){const w=3+Math.round(y/24);p.R(60-w,y,w*2,1,'#ff9a3c');p.R(60-w+1+Math.round(p.rn()*2),y,w*2-4,1,'#ffd23f');}for(let i=0;i<30;i++)p.R(50+p.rn()*20,96+p.rn()*12,2,2,p.rn()<.5?'#ff5e3a':'#ffe9a8');
  p.mtn(60,108,.7,'#5a8a4a');p.mtn(60,108,.7,'#4a7a3a',140);p.R(50,106,20,8,'#8d86a6');p.R(46,112,28,2,'#5ec4ff');p.ground(186,'#4a7a3a','#3a6a2a');}},
 {name:"Jonah's Sea",d(p){p.sky('#3a3a5a','#4a4a6a','#5a5a7a');[[14,30,9],[28,26,11],[42,32,8],[78,22,10],[94,18,12],[110,26,9]].forEach(([a,b,r])=>p.disc(a,b,r,'#2b2b44'));p.R(0,30,BW,8,'#2b2b44');
  for(let i=0;i<BW;i++){const top=Math.round(126+7*Math.sin(i/6));for(let y=top;y<BH;y++)p.R(i,y,1,1,y<top+2?'#c8ecff':y<150?'#2a55c2':'#1f3f94');}
  p.R(34,114,30,8,'#7a4a2a');p.R(38,122,22,3,'#5a3420');p.R(48,92,2,22,'#5a3420');p.R(50,94,10,14,'#e8d6b0');
  p.disc(80,176,12,'#4a5a8a');p.R(62,172,12,4,'#4a5a8a');p.R(56,166,6,8,'#4a5a8a');p.R(84,170,3,3,'#fff');p.R(85,171,1,1,'#1b1530');}},
 {name:'Babylon',night:1,d(p){p.sky('#101030','#1a1a48','#262660');p.stars(50,90);p.disc(96,26,8,'#f2f0ff');p.disc(99,24,7,'#101030');
  [40,32,24,16].forEach((w,i)=>p.R(20-w/2+10,150-(i+1)*10,w,10,i%2?'#6a5a8a':'#5a4a7a'));
  p.R(52,120,46,56,'#2a55c2');for(let y=124;y<170;y+=8)for(let i=56;i<96;i+=8)p.R(i,y,3,3,'#ffd23f');p.R(66,138,18,38,'#1b1530');p.disc(75,138,9,'#1b1530');
  for(let i=52;i<98;i+=6)p.R(i,116,4,4,'#2a55c2');p.R(100,140,18,10,'#2a9a48');p.R(104,150,14,8,'#47d16a');p.ground(176,'#3a3050','#4a4060');}},
 {name:"Daniel's Den",clouds:0,d(p){p.R(0,0,BW,BH,'#3a2a20');for(let y=0;y<BH;y++){const w=Math.round(30+Math.max(0,60-y)*0.5+6*Math.sin(y/9));p.R(60-w,y,w*2,1,'#5a4030');}
  p.disc(60,10,16,'#ffe9a8');for(let y=20;y<BH;y++){const w=Math.round(10+y/8);p.R(60-w,y,w*2,1,'rgba(255,233,168,.22)');}
  [[28,170],[78,176]].forEach(([a,b])=>{p.R(a,b,18,9,'#e0a800');p.disc(a+2,b+2,6,'#c98a1b');p.R(a,b+1,5,5,'#e0a800');p.R(a+16,b+3,6,2,'#e0a800');});
  p.R(56,164,8,20,'#c86bff');p.disc(60,160,4,'#ffcf9e');p.ground(186,'#4a3428');}},
 {name:'Bethlehem',night:1,d(p){p.sky('#0e1430','#16204a','#203060');p.stars(60,110);
  p.R(84,26,3,3,'#fff');p.R(76,27,19,1,'#ffe9a8');p.R(85,18,1,19,'#ffe9a8');p.R(80,22,11,1,'rgba(255,233,168,.6)');p.R(80,32,11,1,'rgba(255,233,168,.6)');
  
  p.ridge(150,6,.07,0,'#2a3050');[[8,132,12],[22,126,14],[96,130,14]].forEach(([a,b,w])=>p.house(a,b,w,14,'#3a4068','#2a3050'));
  p.R(70,148,30,24,'#5a4030');p.mtn(85,138,.8,'#7a5a40',150);p.R(78,156,14,16,'#ffd23f');p.R(80,166,10,4,'#a86b3c');p.ground(172,'#2a3a40','#3a4a50');}},
 {name:'Nazareth',d(p){p.sky('#a0d8ff','#c0e6ff','#e0f4ff');p.ridge(130,10,.05,0,'#9ac080');p.ridge(150,6,.08,1,'#7ab060');
  [[10,140,14],[30,132,16],[56,144,12],[76,136,16],[98,142,14]].forEach(([a,b,w])=>p.house(a,b,w,12,'#fffaf0','#e8d6b0'));p.ground(170,'#c9a070','#a88a6a');
  for(let i=0;i<4;i++)p.R(30,178+i*3,30,2,i%2?'#c98a5a':'#a86b3c');p.R(70,176,12,8,'#7a4a2a');p.R(72,174,8,2,'#c9c3d6');p.tree(100,192,'#a8c890','#7a9a6a');}},
 {name:'Sea of Galilee',d(p){p.sky('#ffb8a0','#ffd0b0','#ffe6cc');p.sun(60,112,11,'#fff2b0','#ffd88a');p.ridge(112,6,.05,0,'#8a7aa0');
  for(let y=116;y<BH;y++)p.R(0,y,BW,1,y<130?'#5ec4ff':y<160?'#3d9ae6':'#2a7ad0');for(let y=120;y<BH;y+=6)for(let i=(y*3)%11;i<BW;i+=16)p.R(i,y,6,1,'#b3e8ff');
  p.R(34,150,40,6,'#7a4a2a');p.R(38,156,32,3,'#5a3420');p.R(52,112,2,38,'#5a3420');for(let y=114;y<146;y++)p.R(54,y,Math.round((y-112)*.5),1,'#fffaf0');
  for(let i=0;i<6;i++)p.R(74+i*3,154+i*3,1,3,'#d9c49a');p.R(92,170,5,2,'#c9c3d6');p.R(96,169,2,1,'#c9c3d6');}},
 {name:'Mount of Olives',d(p){p.sky('#c8a0d8','#e0bce0','#f2d8e8');p.ridge(110,4,.1,0,'#b8a0b0');for(let i=18;i<104;i+=12)p.R(i,100,8,10,'#d8c8c8');
  p.ridge(132,10,.04,2,'#7a9a6a');p.ground(150,'#8aaa70','#6a8a5a');
  [[16,166],[44,178],[74,170],[102,184],[30,196],[88,198]].forEach(([a,b])=>{p.R(a-1,b-8,3,8,'#6a5040');p.R(a-3,b-10,2,3,'#6a5040');p.disc(a,b-13,6,'#7a9a8a');p.disc(a+2,b-14,4,'#a8c0b0');});}},
 {name:'The Empty Tomb',d(p){p.sky('#ffb0a0','#ffd0a0','#ffeab8');p.sun(60,96,8,'#fffbe0','#fff2b0');for(let i=-5;i<=5;i++)for(let t=12;t<44;t+=2)p.R(60+i*t/5,96-Math.abs(t*(5-Math.abs(i))/8),1,1,'rgba(255,255,255,.7)');
  p.ridge(118,3,.1,0,'#a88a7a');[[18,108],[26,110],[34,108]].forEach(([a,b])=>{p.R(a,b-10,1,10,'#5a4030');p.R(a-2,b-8,5,1,'#5a4030');});
  p.mtn(52,120,.9,'#9a8a80');p.R(44,150,16,20,'#2b2350');p.disc(52,150,8,'#2b2350');p.disc(74,160,10,'#c9c3d6');p.disc(74,160,7,'#a9a3c0');
  p.ground(170,'#47d16a','#2a9a48');for(let i=0;i<24;i++)p.R(p.rn()*BW,174+p.rn()*24,2,2,p.rn()<.5?'#fff':'#ff7aa8');}},
 {name:'New Jerusalem',d(p){p.sky('#ffe9a8','#fff2c8','#fffaf0');for(let i=0;i<30;i++)p.R(p.rn()*BW,p.rn()*90,1,1,'#ffd23f');
  p.R(14,96,92,74,'#ffd23f');for(let i=14;i<106;i+=8)p.R(i,90,5,6,'#ffd23f');['#3d7bff','#47d16a','#c86bff','#ff3b5c'].forEach((c,i)=>p.R(14,150+i*5,92,5,c));
  [[30,110],[52,104],[74,110]].forEach(([a,b])=>{p.R(a,b,14,16,'#fff2c8');p.disc(a+7,b,7,'#fff2c8');});p.R(54,128,12,22,'#fffaf0');p.disc(60,128,6,'#fffaf0');
  p.ground(170,'#47d16a','#2a9a48');for(let y=170;y<BH;y++)p.R(60-Math.round(6+(y-170)/4),y,Math.round(12+(y-170)/2),1,'#86d6ff');
  p.tree(22,196,null,null,'#ffd23f');p.tree(98,196,null,null,'#ffd23f');}}
];
const LAND_NAMES=SCENES.map(s=>s.name);
// Each place's banner on the map: Bible reference, emblem sprite, banner color (and an optional emblem recolor).
const SCENE_META=[
 ['Genesis 2','tree','#2a9a48'],["Genesis 6",'ark','#7a4a2a'],['Genesis 11','pyramid','#b8784a'],['Genesis 15','nstar','#2b2350'],
 ['Genesis 22','sheep','#8a6a4a'],['Genesis 28','ladder','#5a2fd6'],['Genesis 41','pyramid','#c98a1b'],['Exodus 14','wave','#2a55c2'],
 ['Exodus 20','tablets','#6a6385'],['Exodus 16','bread','#b8862b'],['Joshua 4','wave','#2a8fd6'],['Joshua 6','castle','#a0522d'],
 ['Ruth 2','bread','#c98a1b'],['1 Samuel 16','sheep','#2a9a48'],['1 Samuel 17','sword','#6a8a4a'],['2 Samuel 5','castle','#8a6a3a'],
 ['1 Kings 8','crown','#c98a1b'],['1 Kings 18','fire','#c43c22'],['Jonah 1','ship','#3a3a6a'],['Daniel 1','castle','#262660',{a:'#5c8cff',b:'#2a55c2'}],
 ['Daniel 6','lion','#9a3fd6'],['Luke 2','nstar','#1b1530'],['Luke 4','scroll','#a86b3c'],['Mark 4','ship','#2a7ad0'],
 ['Luke 22','cup','#7a2a4a'],['Luke 24','tomb','#d9a520'],['Revelation 21','castle','#e0a800',{a:'#ffe27a',b:'#ffffff',r:'#5cc8ff'}]
];
function themeOf(q,s){const i=sceneOf(q,s),m=SCENE_META[i]||SCENE_META[0];return{n:SCENES[i].name,r:m[0],e:m[1],c:m[2],m:m[3]};}
const sceneCache={};
function sceneURL(i){return sceneCache[i]||(sceneCache[i]=drawScene(SCENES[i].d));}
// Which scene a land shows. Long quests (Heidelberg's 52 Lord's Days) walk through the story more slowly.
function sceneOf(q,s){const L=q.lands.length;return L<=SCENES.length?s%SCENES.length:Math.floor(s*SCENES.length/L);}
let SCN=-1,scnFlip=0;
function setScene(i){
 if(i===SCN)return;SCN=i;const ls=document.querySelectorAll('#scene .sc');if(!ls.length)return;
 const sc=SCENES[i];document.body.classList.toggle('night',!!(sc&&sc.night));document.body.classList.toggle('noclouds',!!(sc&&(sc.night||sc.clouds===0)));
 if(i<0){ls.forEach(l=>l.classList.remove('on'));return;}
 scnFlip^=1;const on=ls[scnFlip],off=ls[scnFlip^1];on.style.backgroundImage=`url(${sceneURL(i)})`;on.classList.add('on');off.classList.remove('on');
}
// The map follows the land in the middle of the screen; a level shows its own land.
function pickScene(){
 const q=QD();if(!q){setScene(-1);return;}
 if(V.name==='map'){const mid=innerHeight*.5;let s=null;document.querySelectorAll('.land').forEach(el=>{if(el.getBoundingClientRect().top<=mid)s=+el.dataset.s;});
  if(s===null){const f=document.querySelector('.land');s=f?+f.dataset.s:0;}setScene(sceneOf(q,s));return;}
 if(['study','fill','build'].includes(V.name)){const s=q.lands.findIndex(l=>l.qs.includes(V.i+1));setScene(s<0?-1:sceneOf(q,s));return;}
 if(V.name==='bonus'||V.name==='guard'){setScene(sceneOf(q,V.s));return;}
 setScene(-1);
}
let scnRaf=0;
addEventListener('scroll',()=>{if(V.name!=='map'||scnRaf)return;scnRaf=requestAnimationFrame(()=>{scnRaf=0;pickScene();});},{passive:true});
