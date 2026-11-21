// Catechism Quest: experience points, levels, unlockable heroes, hats and companions, and the level-up celebration.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// ================= ART =================
Object.assign(PAL,{u:'#c98a5a',l:'#9ee6ff',d:'#5a3420',x:'#a9a3c0',z:'#ff9ec4'});
Object.assign(SPR,{
 // unlockable heroes (16×16, like the first four)
 shepherd:["...kkkk....kkk..","..kttttk..k...k.",".kttttttk.....k.",".kttsssstk....k.",".ktsesesk.....k.",".ktsssssk....kk.","..kssSssk.....k.","...kkkkk......k.","..knnnnnk...ssk.",".knnnnnnnkkkk.k.",".knnynnnnk....k.",".knnnnnnnk....k.","..knnnnnk.....k.","..knnnnnk.....k.","...kSkSk......k.","...kkkkk......k."],
 gardener:["................","....kkkkkk......","...khhhhhhk.....",".kkhhHHHHhhkk...","...kssssssk.....","...ksessesk.....","...kssppssk.....","....kssssk...pp.","...kkggggkk..pyp","..ksgggggggsk.g.","..ksgcgggcgsk.g.","...kgggggggk.sk.","...kccccccck....","...kcckkkcck....","...knnk.knnk....","...kkkk.kkkk...."],
 astronaut:[".....kkkkkk.....","....kwwwwwwk....","...kwwwwwwwwk...","...kwkkkkkkwk...","...kwkCwcckwk...","...kwkCccCkwk...","...kwkkkkkkwk...","....kwwwwwwk....","..kkwwwrrwwwkk..",".kwwkwwwwwwkwwk.",".kwwkwwccwwkwwk.",".kaakwwwwwwkaak.","....kwwwwwwk....","....kwwkkwwk....","....kbbkkbbk....","....kkkkkkkk...."],
 robot:[".......kk.......",".......rr.......","........k.......","...kkkkkkkkkk...","...kaaaaaaaak...","...kakkaakkak...","...kakcaakcak...","...kaaaaaaaak...","...kabkbkbkak...","...kkkkkkkkkk...",".kkkbbbbbbbbkkk.","kaakbbrbbcbbkaak","kaakbbbbbbbbkaak",".kk.kbbbbbbk.kk.","....kak..kak....","...kkkk..kkkk..."],
 // hats
 cap:[".kkkkk...","krrrrrk..","krrrrrrkk","kkkkkkkkk"],
 bow:["kk...kk","kpk.kpk","kppkppk","kpk.kpk","kk...kk"],
 flowers:[".p...y...p.","pyp.pyp.pyp","kgggggggggk"],
 tophat:["..kkkkk..","..kMMMk..","..kMMMk..","..krrrk..","kkMMMMMkk","kkkkkkkkk"],
 beanie:["...ww...","..kkkk..",".kccCck.","kcCccCck","kwwwwwwk"],
 party:["...y...","...k...","..kmk..","..kmyk.",".kmymk.",".kymmyk","kkkkkkk"],
 // companions (also creatures in the World Builder)
 dog:["......kkk..",".....knnnk.",".....knenkk","k...kknnnnk","knkknnnnkk.",".knnnnnnk..",".knkkknk...",".kk...kk..."],
 cat:["......k.k..",".....kbbbk.","k....kbebk.","bk...kbbbk.",".bkkkkbbk..","..kbbbbbk..","..kbkkbk...","..kk..kk..."],
 bunny:["....k.k..","...kpkpk.","...kwwwk.","...kwewk.",".kkkwwwpk","kwwwwwwk.","kwwwwwwk.",".kkkkkk.."],
 chick:["..kkk..",".kyeyk.",".kyyyoo","kyyyyk.","kyyyyk.",".kkkk..","..o.o.."],
 duck:["....kkk..","...kwewk.","...kwwwoo","k..kwwwk.","kwkkwwwwk",".kwwwwwk.","..kkkkk.."],
 turtle:["...kkkkk....","..kGgGgGk...",".kGgGgGgGkk.","kkkkkkkkkgek",".kgk...kgkk.",".kk.....kk.."],
 dragonling:["......kk..",".....kggk.","MM..kggegk","MMMkgggggk","..kgttttk.","kgkgttttk.",".kkgggggk.","..kgk.kgk."],
 xpstar:["...k...","..kyk..","kkyyykk",".kyyyk.","kyykyyk","kk...kk"]
});
Object.assign(HEROES,{
 shepherd:{name:'Shepherd',desc:'Watches the flock',colors:[{n:'Classic',m:{}},{n:'Sky',m:{n:'#5c8cff',t:'#ffffff'},cost:40}]},
 gardener:{name:'Gardener',desc:'Grows good things',colors:[{n:'Classic',m:{}},{n:'Sunny',m:{g:'#ffd23f',c:'#ff9a3c'},cost:40}]},
 astronaut:{name:'Astronaut',desc:'Reaches for the stars',colors:[{n:'Classic',m:{}},{n:'Mars',m:{w:'#ffb08a',c:'#ff5e3a',C:'#c43c22'},cost:40}]},
 robot:{name:'Robot',desc:'Helpful and clever',colors:[{n:'Classic',m:{}},{n:'Copper',m:{a:'#e8a87c',b:'#c98a5a'},cost:40}]}
});
// Where a hat sits on each hero: the column it centers on and the row its bottom row covers.
const HAT_AT={knight:[6.5,3],princess:[6,2],dragon:[7,3],lion:[6.5,1],shepherd:[4.5,1],gardener:[6.5,3],astronaut:[7.5,1],robot:[7.5,4]};
const HAT_TOP=6;   // extra transparent rows above a hatted hero
const compCache={};
// A hero with a hat, drawn into one image (cached). Plain heroes use the normal sprite.
function heroURL(h,map,hat){
 const key=h+'|'+JSON.stringify(map||{})+'|'+hat;
 if(compCache[key])return compCache[key];
 const g=SPR[h],t=SPR[hat],c=document.createElement('canvas');c.width=g[0].length;c.height=g.length+HAT_TOP;const x=c.getContext('2d');
 const dot=(ch,i,r,m)=>{if(ch==='.')return;x.fillStyle=(m&&m[ch])||PAL[ch];x.fillRect(i,r,1,1);};
 g.forEach((row,r)=>{for(let i=0;i<row.length;i++)dot(row[i],i,r+HAT_TOP,map);});
 const [cx,cy]=HAT_AT[h]||[g[0].length/2,2],ox=Math.round(cx-t[0].length/2+.5),oy=cy+HAT_TOP-t.length+1;
 t.forEach((row,r)=>{for(let i=0;i<row.length;i++)dot(row[i],ox+i,oy+r);});
 return compCache[key]=c.toDataURL();
}

// ================= UNLOCKS =================
// Everything a kid can collect. Each unlocks by reaching a level (lv), earning an achievement (ach),
// or buying it with coins (coins); free ones start owned. kind: hero | hat | pet (and 'wb' for World Builder treasures,
// added in the builder files). Append new entries freely; ids are saved in k.own, so never rename one.
const UNLOCKS=[
 {id:'hero:shepherd',kind:'hero',key:'shepherd',lv:3},
 {id:'hero:gardener',kind:'hero',key:'gardener',coins:80},
 {id:'hero:astronaut',kind:'hero',key:'astronaut',lv:8},
 {id:'hero:robot',kind:'hero',key:'robot',ach:'guard1'},
 {id:'hat:cap',kind:'hat',key:'cap',n:'Ball Cap',lv:2},
 {id:'hat:bow',kind:'hat',key:'bow',n:'Big Bow',lv:2},
 {id:'hat:flowers',kind:'hat',key:'flowers',n:'Flower Crown',coins:40},
 {id:'hat:beanie',kind:'hat',key:'beanie',n:'Cozy Beanie',coins:40},
 {id:'hat:party',kind:'hat',key:'party',n:'Party Hat',ach:'day3'},
 {id:'hat:tophat',kind:'hat',key:'tophat',n:'Top Hat',lv:6},
 {id:'hat:crown',kind:'hat',key:'crown',n:'Gold Crown',lv:10},
 {id:'pet:lamb',kind:'pet',key:'sheep',n:'Lamb',free:1},
 {id:'pet:dog',kind:'pet',key:'dog',n:'Puppy',coins:60},
 {id:'pet:cat',kind:'pet',key:'cat',n:'Kitten',coins:60},
 {id:'pet:bunny',kind:'pet',key:'bunny',n:'Bunny',lv:4},
 {id:'pet:chick',kind:'pet',key:'chick',n:'Chick',ach:'found1'},
 {id:'pet:duck',kind:'pet',key:'duck',n:'Duckling',coins:50},
 {id:'pet:turtle',kind:'pet',key:'turtle',n:'Turtle',lv:7},
 {id:'pet:dragonling',kind:'pet',key:'dragonling',n:'Little Dragon',lv:12}
];
const unlockById=id=>UNLOCKS.find(u=>u.id===id);
const unlockName=u=>u.n||(u.kind==='hero'?HEROES[u.key].name:u.key);
const owns=(k,id)=>{const u=unlockById(id);return !!(u&&(u.free||k.own[id]));};
const heroOwned=(k,h)=>HERO_KEYS.includes(h)||owns(k,'hero:'+h);
const unlockReq=u=>u.lv?`LEVEL ${u.lv}`:u.ach?`BADGE: ${(ACH.find(a=>a.id===u.ach)||{n:'?'}).n.toUpperCase()}`:u.coins?`${u.coins} COINS`:'';
// Give a kid every level/achievement unlock they've reached. Returns the newly granted ones.
function grantUnlocks(k){
 const lv=levelOf(k.xp),out=[];
 UNLOCKS.forEach(u=>{if(k.own[u.id]||u.free||u.coins)return;if((u.lv&&lv>=u.lv)||(u.ach&&k.ach[u.ach])){k.own[u.id]=today();out.push(u);}});
 return out;
}
const unlockIcon=(u,s)=>u.kind==='hero'?spr(u.key,s||3):spr(u.key,(s||3)+(SPR[u.key][0].length<9?1:0));

// ================= XP AND LEVELS =================
// Going from level L to L+1 takes 50 + 25×(L−1) XP, so early levels come quickly and later ones steadily.
const MAX_LEVEL=50;
const XP={levelFirst:20,levelStar:5,levelReplay:5,castleFirst:40,castleReplay:10,buildFirst:25,buildReplay:8,guardFirst:60,guardReplay:15,lamb:6,challenge:50};
const needFor=L=>50+25*(L-1);
function xpAt(L){let t=0;for(let i=1;i<L;i++)t+=needFor(i);return t;}
function levelOf(xp){let L=1;while(L<MAX_LEVEL&&xp>=xpAt(L+1))L++;return L;}
function levelInfo(xp){const L=levelOf(xp),a=xpAt(L),b=L>=MAX_LEVEL?a:xpAt(L+1);return{L,into:xp-a,need:b-a,pct:L>=MAX_LEVEL?100:Math.round((xp-a)/(b-a)*100)};}
// A fair starting XP for kids who played before XP existed.
const xpEstimate=k=>learnedAll(k)*25+cnt(k.cps)*40+cnt(k.guard)*60+cnt(k.mast)*25+(k.stats.found||0)*6;
// Add XP and return the results-screen rows: the XP bar, plus a level-up row and any unlocks.
function gainXP(k,amt){
 const before=levelInfo(k.xp);k.xp+=amt;const after=levelInfo(k.xp);
 const ups=after.L>before.L;
 let h=`<div class="rw xprow">${spr('xpstar',3)} +${amt} XP <span class="xpb" style="--a:${ups?0:before.pct}%;--b:${after.pct}%"><i></i></span></div>`;
 if(ups){
  const got=grantUnlocks(k);
  h+=`<div class="rw lvrow">LEVEL UP! LV ${after.L}</div>`+got.map(u=>`<div class="rw">${unlockIcon(u,2)} NEW ${u.kind.toUpperCase()}: ${esc(unlockName(u).toUpperCase())}</div>`).join('');
  setTimeout(()=>levelUpFx(k,after.L,got),650);
 }
 return h;
}
// The level-up celebration: rays, a big number and the hero hopping. Tap or wait to close.
function levelUpFx(k,L,got){
 const el=$('#lvfx')||document.body.appendChild(Object.assign(document.createElement('div'),{id:'lvfx'}));
 el.innerHTML=`<div class="lvbox" data-act="closeLv"><div class="rays"></div><div class="lvt">LEVEL</div><div class="lvn">${L}</div><div class="lvhero">${heroImg(k,6)}${petImg(k,4)}</div>${got.length?`<div class="lvgot">${got.map(u=>unlockIcon(u,3)).join('')}</div><div class="lvsub">NEW THINGS IN THE SHOP!</div>`:'<div class="lvsub">KEEP LEARNING!</div>'}</div>`;
 el.className='on';sfx.win();setTimeout(()=>tone(1568,.3,'square',.5,.05),0);confetti(160);
 clearTimeout(levelUpFx.t);levelUpFx.t=setTimeout(()=>{el.className='';},3200);
}
ACT.closeLv=()=>{const el=$('#lvfx');if(el)el.className='';};

// ================= COMPANIONS =================
function petImg(k,scale,cls){const u=k&&k.pet&&unlockById(k.pet);return u&&owns(k,u.id)?spr(u.key,scale||2,null,'pet '+(cls||'')):'';}

// ================= MORE ACHIEVEMENTS =================
// (appended to ACH from rewards.js; never reorder or rename ids)
// Kids loaded before this file existed get their starting XP now.
S.kids.forEach(k=>{if(k.xp<0)k.xp=xpEstimate(k);});
ACH.push(
 {id:'lv5',n:'Rising Star',d:'Reach level 5',ic:'xpstar',got:k=>levelOf(k.xp),of:5},
 {id:'lv10',n:'Bright Light',d:'Reach level 10',ic:'xpstar',got:k=>levelOf(k.xp),of:10},
 {id:'lv20',n:'Shining Hero',d:'Reach level 20',ic:'xpstar',got:k=>levelOf(k.xp),of:20},
 {id:'hero1',n:'New Friend',d:'Unlock a new hero',ic:'knight',got:k=>UNLOCKS.filter(u=>u.kind==='hero'&&k.own[u.id]).length,of:1},
 {id:'hat1',n:'Snappy Dresser',d:'Wear a hat',ic:'cap',got:k=>k.hat?1:0,of:1},
 {id:'pet1',n:'Best Buddies',d:'Bring a companion along',ic:'dog',got:k=>k.pet?1:0,of:1},
 {id:'own8',n:'Collector',d:'Collect 8 heroes, hats or pets',ic:'coin',got:k=>Object.keys(k.own).length+1,of:8},
 {id:'visit5',n:'Explorer',d:'Visit 5 places on the world map',ic:'flag',got:k=>cnt(k.visited),of:5}
);
