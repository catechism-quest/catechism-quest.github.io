// Catechism Quest: daily streaks, achievements and the badges screen.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// ----- daily streak -----
// Finishing any level, castle, Word Builder, guardian or lost-lamb review counts as playing that day.
// k.streak = {n: days in a row, best: longest ever, last: local day number of the last day played}.
const STREAK_DAYS=[3,7,14,30,50,100];
function streakNow(k){const s=k.streak,t=today();return s&&s.last>=t-1?s.n:0;}
function bumpStreak(k){
 const t=today(),s=k.streak;if(s.last===t)return false;
 s.n=s.last===t-1?s.n+1:1;s.last=t;if(s.n>s.best)s.best=s.n;return true;
}

// ----- achievements -----
// Each one is earned once per kid (k.ach[id] = the day it was earned) and pays ACH_COINS.
// Counts add up across all of a kid's quests.
const ACH_COINS=10;
const cnt=o=>Object.keys(o).length;
const learnedAll=k=>Object.values(k.prog).filter(v=>v>0).length;
const perfectAll=k=>Object.values(k.prog).filter(v=>v>=3).length;
const questDone=k=>Object.keys(CAT).some(id=>{const n=CAT[id].qas.length;return n>0&&learnedIn(k,id)===n;});
const ACH=[
 {id:'lamb1',n:'First Lamb',d:'Learn your first question',ic:'sheep',got:k=>learnedAll(k),of:1},
 {id:'lamb10',n:'Little Flock',d:'Learn 10 questions',ic:'sheep',got:k=>learnedAll(k),of:10},
 {id:'lamb25',n:'Growing Flock',d:'Learn 25 questions',ic:'sheep',got:k=>learnedAll(k),of:25},
 {id:'lamb50',n:'Great Flock',d:'Learn 50 questions',ic:'sheep',got:k=>learnedAll(k),of:50},
 {id:'lamb100',n:'Hundredfold',d:'Learn 100 questions',ic:'sheep',got:k=>learnedAll(k),of:100},
 {id:'star10',n:'Sharp Memory',d:'Get 3 stars on 10 questions',ic:'star',got:perfectAll,of:10},
 {id:'star50',n:'Shining Memory',d:'Get 3 stars on 50 questions',ic:'star',got:perfectAll,of:50},
 {id:'castle1',n:'Castle Climber',d:'Clear a bonus castle',ic:'castle',got:k=>cnt(k.cps),of:1},
 {id:'castle10',n:'Castle Keeper',d:'Clear 10 bonus castles',ic:'castle',got:k=>cnt(k.cps),of:10},
 {id:'crown1',n:'Word Builder',d:'Crown a question in Word Builder',ic:'crown',got:k=>cnt(k.mast),of:1},
 {id:'crown10',n:'Master Builder',d:'Crown 10 questions',ic:'crown',got:k=>cnt(k.mast),of:10},
 {id:'guard1',n:'Brave Heart',d:'Earn a guardian badge',ic:'shield',got:k=>cnt(k.guard),of:1},
 {id:'guard5',n:'Guardian Friend',d:'Earn 5 guardian badges',ic:'shield',got:k=>cnt(k.guard),of:5},
 {id:'found1',n:'Seeker',d:'Bring a lost lamb home',ic:'crook',got:k=>k.stats.found,of:1},
 {id:'found25',n:'Good Shepherd',d:'Bring 25 lost lambs home',ic:'crook',got:k=>k.stats.found,of:25},
 {id:'song5',n:'Joyful Noise',d:'Unlock 5 hymns',ic:'note',got:k=>k.songs.length,of:5},
 {id:'day3',n:'Three in a Row',d:'Play 3 days in a row',ic:'fire',got:k=>k.streak.best,of:3},
 {id:'day7',n:'Faithful Week',d:'Play 7 days in a row',ic:'fire',got:k=>k.streak.best,of:7},
 {id:'day30',n:'Faithful Month',d:'Play 30 days in a row',ic:'fire',got:k=>k.streak.best,of:30},
 {id:'done',n:"Journey's End",d:'Learn every question in a quest',ic:'flag',got:k=>questDone(k)?1:0,of:1}
];
// Mark newly earned achievements and pay for them. Returns the new ones.
function checkAch(k){
 const t=today(),out=[];
 ACH.forEach(a=>{if(!k.ach[a.id]&&a.got(k)>=a.of){k.ach[a.id]=t;k.coins+=ACH_COINS;out.push(a);}});
 return out;
}
const rwRow=(icon,text)=>`<div class="rw">${icon} ${esc(text)}</div>`;
// Call after a game's own rewards are added: counts today toward the streak, checks achievements,
// saves, and returns extra reward rows for the results screen.
function celebrate(k,xp){
 let h=xp?gainXP(k,xp):'';
 if(bumpStreak(k)){const n=k.streak.n;h+=rwRow(spr('fire',3),n===1?'DAY 1 STREAK!':`${n}-DAY STREAK!`);}
 checkAch(k).forEach(a=>{h+=rwRow(spr('trophy',3),`${a.n.toUpperCase()} +${ACH_COINS}`);});
 grantUnlocks(k).forEach(u=>{h+=rwRow(unlockIcon(u,2),`NEW ${u.kind.toUpperCase()}: ${unlockName(u).toUpperCase()}`);});
 save(k);return h;
}
// For rewards earned outside a game (like buying a hymn): a toast instead of rows.
function achToast(k){const n=checkAch(k);grantUnlocks(k);if(n.length){save(k);toast(`${spr('trophy',2)} ${n.map(a=>esc(a.n.toUpperCase())).join(' · ')} +${ACH_COINS*n.length}`);sfx.win();}}

// ----- badges screen -----
function streakBtn(k){const n=streakNow(k);return`<button class="stk ${n?'':'off'}" data-act="go" data-to="badges" aria-label="${n}-day streak. Badges">${spr('fire',3,n?null:GRAYFIRE)}<b>${n}</b></button>`;}
const GRAYFIRE={f:'#b3acc6',o:'#c9c3d6',y:'#ddd8e8',G:'#9a93b0',g:'#b3acc6'};
function badgesV(){
 const k=kid(),n=streakNow(k),s=k.streak,t=today(),played=s.last===t,earned=ACH.filter(a=>k.ach[a.id]).length;
 const next=STREAK_DAYS.find(d=>d>n);
 const msg=!n?'Finish any level today to start a streak!':played?`You played today. Come back tomorrow for day ${n+1}!`:`Play today to keep your streak going!`;
 return`${topBar('map','BADGES')}
 <section class="box center"><div class="lbl">DAILY STREAK</div>
 <div class="bigfire">${spr('fire',8,n?null:GRAYFIRE)}<b>${n}</b></div>
 <p style="font-size:19px;margin:6px 0">${n===1?'1 day':`${n} days`} in a row</p>
 <p class="tiny" style="margin:0">${msg}${next&&n?` ${next-n} more to reach ${next}.`:''}<br>Best: ${s.best} day${s.best===1?'':'s'}</p></section>
 <section class="box"><div class="lbl">ACHIEVEMENTS · ${earned}/${ACH.length}</div>
 <div class="achs">${ACH.map(a=>{const has=!!k.ach[a.id],v=Math.min(a.got(k)||0,a.of);return`<div class="ach ${has?'on':''}">${spr('trophy',3,has?null:LOCKT)}<div><b>${esc(a.n.toUpperCase())}</b><span>${esc(a.d)}${has?'':a.of>1?` · ${v}/${a.of}`:''}</span></div>${spr(a.ic,2,has?null:LOCKT)}</div>`;}).join('')}</div>
 <p class="tiny" style="margin:10px 0 0">Each achievement earns ${ACH_COINS} coins.</p></section>`;
}
const LOCKT={y:'#ddd8e8',Y:'#c9c3d6',t:'#f2f0ff',k:'#9a93b0',w:'#ddd8e8',r:'#c9c3d6',c:'#c9c3d6',a:'#ddd8e8',b:'#c9c3d6',m:'#ddd8e8',f:'#c9c3d6',o:'#ddd8e8',g:'#c9c3d6',G:'#b3acc6',n:'#b3acc6',v:'#c9c3d6'};
