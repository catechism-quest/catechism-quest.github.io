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

// ---------- progression ----------
test('level curve is increasing and capped',()=>{eq(levelOf(0),1);eq(levelOf(49),1);eq(levelOf(50),2);eq(levelOf(xpAt(10)),10);eq(levelOf(1e9),MAX_LEVEL);for(let L=1;L<MAX_LEVEL;L++)ok(xpAt(L+1)>xpAt(L));});
test('gainXP levels up and grants level unlocks',()=>{const k=testKid();const h=gainXP(k,xpAt(3));ok(/LEVEL UP/.test(h));eq(levelOf(k.xp),3);ok(k.own['hero:shepherd']&&k.own['hat:cap']);clearTimeout(levelUpFx.t);ACT.closeLv();});
test('coin unlocks are never granted for free',()=>{const k=testKid({xp:xpAt(50)});grantUnlocks(k);ok(!k.own['hero:gardener']&&!k.own['pet:dog']);});
test('achievement unlocks follow the badge',()=>{const k=testKid();k.ach.guard1=dayNow;grantUnlocks(k);ok(k.own['hero:robot']);});
test('every unlock points at real art and a valid rule',()=>{const ids=new Set();UNLOCKS.forEach(u=>{ok(!ids.has(u.id),'dup '+u.id);ids.add(u.id);ok(SPR[u.key],u.id+' art');ok(u.free||u.lv||u.ach||u.coins,u.id+' rule');if(u.ach)ok(ACH.find(a=>a.id===u.ach),u.id+' ach');});});
test('every hero has a hat spot',()=>{Object.keys(HEROES).forEach(h=>ok(HAT_AT[h],h));});
test('hat composite renders',()=>{const k=testKid({own:{'hat:cap':1},hat:'hat:cap'});const h=heroImg(k,3);ok(/data:image\/png/.test(h));});
test('fix() drops a hat the kid does not own',()=>{const k=testKid({hat:'hat:crown',pet:'pet:dog'});S.kids.push(k);fix();eq(k.hat,null);eq(k.pet,null);S.kids=S.kids.filter(x=>x!==k);});
test('old kids get estimated XP',()=>{const old={id:'o2',name:'Old',hero:'knight',quest:'wsc',prog:{'wsc:1':3,'wsc:2':3},cps:{'wsc:L1':1}};S.kids.push(old);fix();ok(old.xp===2*25+40,'xp '+old.xp);S.kids=S.kids.filter(x=>x!==old);});
test('at least 28 achievements so far',()=>ok(ACH.length>=28,String(ACH.length)));

// ---------- adventure world map ----------
test('every land belongs to exactly one place',()=>{['wsc','hc'].forEach(id=>{const q=CAT[id],seen=[];SCENES.forEach((s,p)=>placeLands(q,p).forEach(l=>seen.push(l)));eq(seen.sort((a,b)=>a-b),q.lands.map((l,i)=>i),id);});});
test('world map renders and locks unreached places',()=>{const k=testKid({prog:{'wsc:1':3}});S.kids.push(k);fix();S.kidId=k.id;V={name:'journey'};render();ok(document.querySelectorAll('.jn').length===27);ok(document.querySelectorAll('.jn.lock').length>=25);ok(placeReached(k,CAT.wsc,0));ok(!placeReached(k,CAT.wsc,5));S.kids=S.kids.filter(x=>x!==k);S.kidId=null;V={name:'title'};render();});

// ---------- World Builder ----------
test('100+ placeable objects in every category',()=>{const vis=OBJECTS.filter(o=>o.cat);ok(vis.length>=100,'only '+vis.length);CATS.forEach(c=>ok(vis.some(o=>o.cat===c[0]),c[0]));});
test('object ids are unique',()=>{const ids=OBJECTS.map(o=>o.id);eq(new Set(ids).size,ids.length);});
test('every object renders in all 4 turns',()=>{OBJECTS.forEach(o=>{for(let r=0;r<4;r++){const s=objSprite(o,r,o.iconState||{m:5});ok(s.c.width>0&&s.c.height>0,o.id);}});});
test('every object has a catalog icon',()=>{OBJECTS.filter(o=>o.cat).forEach(o=>ok(/^data:image/.test(objIcon(o)),o.id));});
test('10 themes and every theme item exists',()=>{eq(THEMES.length,10);THEMES.forEach(t=>{ok(OBJ[t.icon],t.id+' icon');t.feat.forEach(f=>ok(OBJ[f],t.id+' '+f));t.pets.forEach(p=>ok(CRE[p],t.id+' '+p));ok(TERRAIN[t.ground]);});});
test('every creature sprite exists',()=>{CREATURES.forEach(c=>ok(SPR[c.spr],c.id));ok(CREATURES.length>=20);});
test('a new world has terrain, scenery and friends',()=>{THEMES.forEach(t=>{const w=newWorld(t.id);eq(w.t.length,w.N*w.N);ok(w.o.length>=2,t.id+' objects '+w.o.length);ok(w.c.length>=1,t.id+' creatures');});});
test('placement rules: inside, not on water, no overlap',()=>{const w=newWorld('village');w.o=[];w.t='g'.repeat(w.N*w.N);w.ov='.'.repeat(w.N*w.N);ok(canPlace(w,OBJ.castle,2,2,0));placeObj(w,'castle',2,2,0);ok(!canPlace(w,OBJ.cottage,3,3,0));ok(canPlace(w,OBJ.cottage,4,2,0));ok(!canPlace(w,OBJ.castle,w.N-1,0,0));setT(w,8,8,'a');ok(!canPlace(w,OBJ.cottage,8,8,0));ok(canPlace(w,OBJ.rowboat,8,8,0));ok(!canPlace(w,OBJ.rowboat,9,9,0));});
test('rotation swaps the footprint',()=>{eq(footprint(OBJ.school,0),[2,1]);eq(footprint(OBJ.school,1),[1,2]);});
test('fences join to their neighbors',()=>{const w=newWorld('farm');w.o=[];const a=placeObj(w,'fence',3,3,0),b=placeObj(w,'fence',4,3,0),c=placeObj(w,'fence',3,4,0);eq(connMask(w,a),2|4);eq(connMask(w,b),8);eq(connMask(w,c),1);});
test('undo and redo restore the world',()=>{const w=newWorld('village'),h=History(w),n=w.o.length;h.push();placeObj(w,'oak',0,0,0);eq(w.o.length,n+1);ok(h.undo());eq(w.o.length,n);ok(h.redo());eq(w.o.length,n+1);});
test('expanding keeps things in place',()=>{const w=newWorld('village'),o=w.o[0],x=o.x,N=w.N;ok(expandWorld(w));eq(w.N,N+4);eq(o.x,x+2);eq(w.t.length,w.N*w.N);});
test('migrateWorld repairs damaged saves',()=>{const w=migrateWorld({N:14,t:'gg',o:[{t:'nope',x:1,y:1},{t:'oak',x:1,y:1}],c:[{t:'dog',x:2,y:2}],theme:'zzz'});eq(w.t.length,14*14);eq(w.o.length,1);eq(w.theme,'village');ok(w.o[0].u&&w.c[0].u);});
test('pathfinding goes around buildings',()=>{const w=newWorld('village');w.o=[];w.t='g'.repeat(w.N*w.N);for(let y=0;y<6;y++)placeObj(w,'cottage',5,y,0);const p=findPath(w,'villager',2,2,8,2,blockedSet(w));ok(p&&p.length>6,'path '+(p&&p.length));ok(!p.some(([x,y])=>x===5&&y<6),'walked through');});
test('water creatures stay in water',()=>{const w=newWorld('village');w.t='g'.repeat(w.N*w.N);ok(!canStand(w,'fish',3,3));setT(w,3,3,'a');ok(canStand(w,'fish',3,3));ok(!canStand(w,'dog',3,3));ok(canStand(w,'duck',3,3));});
test('cars and trains appear on roads and rails',()=>{const w=newWorld('village');w.ov='.'.repeat(w.N*w.N);for(let x=1;x<9;x++){setOv(w,x,1,'r');setOv(w,x,3,'l');}const v=makeVehicles(w);ok(v.some(x=>x.kind==='car'));ok(v.some(x=>x.kind==='train'));});
test('challenges check worlds',()=>{const w=newWorld('village');w.o=[];w.c=[];CHALLENGES.forEach(c=>{const [h,n]=c.check(w);ok(n>0&&h<n,c.id);});for(let i=0;i<6;i++)placeObj(w,'lamp',i,0,0);const L=CHALLENGES.find(c=>c.id==='lights').check(w);eq(L[0],L[1]);});
test('treasures need earning unless Creative Mode',()=>{const k=testKid();ok(!wbHas(k,OBJ.trophy));k.creative=true;ok(wbHas(k,OBJ.trophy));k.creative=false;k.xp=xpAt(5);grantUnlocks(k);ok(wbHas(k,OBJ.trophy));ok(wbHas(k,OBJ.oak));});
test('at least 30 achievements',()=>ok(ACH.length>=30,String(ACH.length)));
test('worlds list and editor open and close',()=>{const k=testKid();k.worlds=[newWorld('candy')];S.kids.push(k);fix();S.kidId=k.id;V={name:'worlds'};render();ok(document.querySelectorAll('.wcard').length===1);V={name:'wb',wid:k.worlds[0].id};render();ok(WBS&&WBS.w===k.worlds[0],'engine started');ok($('#wbui').innerHTML.includes('wbbar'));V={name:'title'};render();ok(!WBS,'engine stopped');S.kids=S.kids.filter(x=>x!==k);S.kidId=null;});
