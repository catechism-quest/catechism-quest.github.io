// Catechism Quest: small helpers and sprite drawing.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// ================= HELPERS =================
const SONG_COST=25,SWORD_COST=30;
const STOP=new Set(['the','and','but','for','with','that','this','are','was','his','her','its','our','who','not','all','has','have','from','into','him','them','they','you','your']);

const $=s=>document.querySelector(s);
const app=$('#app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,10);
const norm=w=>String(w).replace(/[’‘]/g,"'").toLowerCase().replace(/[^\p{L}\p{N}']/gu,'');
const clean=w=>String(w).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');
const words=a=>String(a).split(/\s+/).filter(Boolean);
const rnd=a=>a[Math.floor(Math.random()*a.length)];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function shuffleNew(a){if(a.length<2)return a.slice();const k=x=>x.map(y=>y.w).join('|');let b=a;for(let t=0;t<8;t++){b=shuffle(a);if(k(b)!==k(a))break;}return b;}
function chunk(w){if(w.length<=12)return[w];const n=Math.ceil(w.length/10),size=Math.ceil(w.length/n),out=[];for(let i=0;i<w.length;i+=size)out.push(w.slice(i,i+size));return out;}
const starsFor=m=>m===0?3:m<=2?2:1;

// sprites
const sprCache={};
function sprURL(name,map){
 const key=name+'|'+JSON.stringify(map||{});
 if(!sprCache[key]){const g=SPR[name],c=document.createElement('canvas');c.width=g[0].length;c.height=g.length;const x=c.getContext('2d');
  g.forEach((row,r)=>{for(let i=0;i<row.length;i++){const ch=row[i];if(ch==='.')continue;x.fillStyle=(map&&map[ch])||PAL[ch];x.fillRect(i,r,1,1);}});sprCache[key]=c.toDataURL();}
 return sprCache[key];
}
function spr(name,scale,map,cls){const w=SPR[name][0].length*(scale||3);return`<img class="spr ${cls||''}" src="${sprURL(name,map)}" width="${w}" alt="" draggable="false">`;}
const GRAY={r:'#c9c3d6',k:'#8d86a6'};
function heroImg(k,scale,cls){const h=HEROES[k.hero]?k.hero:'knight';const ci=(k.colors&&k.colors[h])||0;return spr(h,scale,HEROES[h].colors[ci].m,cls);}
