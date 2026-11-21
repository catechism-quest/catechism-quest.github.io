// Catechism Quest test suite. Open tests/index.html (served from the repo root) and read the report,
// or read window.__TESTS = {done, pass, fail, errors}. Tests run against the real app code with a separate save key.
'use strict';
const T={pass:0,fail:0,errors:[],log:[]};
function test(name,fn){try{fn();T.pass++;T.log.push('<span class="pass">✓</span> '+name);}catch(e){T.fail++;T.errors.push(name+': '+e.message);T.log.push('<span class="fail">✗ '+name+'\n    '+e.message+'</span>');}}
function eq(a,b,m){const x=JSON.stringify(a),y=JSON.stringify(b);if(x!==y)throw new Error((m||'')+' expected '+y+' got '+x);}
function ok(v,m){if(!v)throw new Error(m||'expected truthy');}
const dayNow=today();
function testKid(extra){const k=newKid('Test','knight');k.quest='wsc';return Object.assign(k,extra||{});}

// ---------- existing app ----------
test('catechisms load',()=>{ok(CAT.wsc&&CAT.wsc.qas.length===107);ok(CAT.hc&&CAT.hc.qas.length===129);});
test('every sprite row has the same width',()=>{Object.keys(SPR).forEach(n=>{const w=SPR[n][0].length;SPR[n].forEach((r,i)=>{if(r.length!==w)throw new Error(n+' row '+i);});});});
test('every sprite uses palette letters',()=>{Object.keys(SPR).forEach(n=>SPR[n].forEach(r=>{for(const c of r)if(c!=='.'&&!PAL[c])throw new Error(n+' uses '+c);}));});
test('songs parse',()=>{SONGS.forEach(s=>{const q=parseSong(s.n);ok(q.length>8,s.t);q.forEach(n=>ok(n.d>0,s.t));});});
test('parseQA reads numbered questions',()=>{const r=parseQA('1. Who made you?\nGod made me.\n\n2. What else?\nAll things.');eq(r.items.length,2);eq(r.items[0].a,'God made me.');});
test('fix() upgrades an old save',()=>{const old={id:'o1',name:'Old',hero:'knight',quest:'wsc',prog:{'wsc:1':2},coins:3};S.kids.push(old);fix();const k=S.kids.find(x=>x.id==='o1');ok(k.srs['wsc:1'],'srs seeded');eq(typeof k.streak.n,'number');ok(Array.isArray(k.songs));S.kids=S.kids.filter(x=>x.id!=='o1');});
test('spaced repetition grows the gap',()=>{const k=testKid({prog:{'wsc:1':3}});srsSeed(k,0);const r=srsReview(k,0,true);eq(r.b,1);eq(r.d,dayNow+GAPS[1]);srsReview(k,0,false);eq(k.srs['wsc:1'].b,0);});
test('streak counts days in a row once per day',()=>{const k=testKid();k.streak={n:4,best:4,last:dayNow-1};ok(bumpStreak(k));eq(k.streak.n,5);ok(!bumpStreak(k));k.streak.last=dayNow-3;eq(streakNow(k),0);});
test('achievements pay once',()=>{const k=testKid({prog:{'wsc:1':1}});const c=k.coins;const a=checkAch(k);ok(a.some(x=>x.id==='lamb1'));eq(k.coins,c+ACH_COINS*a.length);eq(checkAch(k).length,0);});
test('achievement ids are unique',()=>{const ids=ACH.map(a=>a.id);eq(new Set(ids).size,ids.length);});
test('every screen renders for a test kid',()=>{const k=testKid({prog:{'wsc:1':3}});S.kids.push(k);fix();S.kidId=k.id;['map','flock','shop','music','settings','badges','quests','players'].forEach(n=>{V={name:n};render();ok(app.innerHTML.length>100,n);});S.kids=S.kids.filter(x=>x!==k);S.kidId=null;V={name:'title'};render();});
