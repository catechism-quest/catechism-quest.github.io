// Catechism Quest World Builder: the catalog. Terrain, themes, every placeable object and every creature
// are plain config here. To add an object, add one entry to OBJECTS; to add a creature, add a sprite and a
// CREATURES entry; to add a theme, add a THEMES entry. Ids are saved in worlds, so never rename or remove one.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// ================= CREATURE & PERSON SPRITES =================
Object.assign(SPR,{
 person:["...kkk...","..khhhk..",".khhhhhk.",".khsssshk",".ksesesk.",".ksssssk.","..kkkkk..",".kcccccck".slice(0,9),"kscccccsk",".kcccccck".slice(0,9),".kCCkCCk.",".kCk.kCk.",".kk...kk."],
 person2:["...kkk...","..khhhk..",".khhhhhk.",".khsssshk",".ksesesk.",".ksssssk.","..kkkkk..",".kcccccck".slice(0,9),"kscccccsk",".kcccccck".slice(0,9),".kCCkCCk.","..kCkCk..","..kk.kk.."],
 kid:["..kk.",".ksk.","..k..","kcccc".slice(0,5),".kck.",".k.k."],
 cow:[".........k.k.",".kkkkkkkkwwwk","kwwkwwwwkwewk","kwkkwwwkkwppk","kwwwwkkwwkkk.","kwwwwkwwwwk..",".kwkkkkkwk...",".kwk...kwk...",".kkk...kkk..."],
 horse:["..........kk.",".........kdnk","........kdnek",".kkkkkkkkdnnk","dknnnnnnnnk..","dknnnnnnnnk..","d.knnnnnnk...","..knk..knk...","..knk..knk...","..kkk..kkk..."],
 pig:[".......k.k.",".kkkkkkzzzk","kzzzzzzzezk","kzzzzzzzzpp","kzzzzzzzzk.",".kzk..kzk..",".kk...kk..."],
 hen:["......r..",".....krk.",".....kwek","k...kwwwo","kk.kwwwwk","kwkwwwwwk",".kwwwwwk.","..kkkkk..","...o.o..."],
 trex:[".......kkkkk.","......kgggggk","......kgegggk","......kgggkkk",".....kgggk...","k...kgggggk..","kk.kgggGgkgk.",".kkgggGgggk..","..kgggggggk..","...kgk.kgk...","...kkk.kkk..."],
 longneck:["..........kkk.",".........kccek",".........kcck.","........kcck..","........kck...",".......kcck...","...kkkkkcck...",".kkcccccccck..","kccccccccccck.","..kcck..kcck..","..kcck..kcck..","..kkkk..kkkk.."],
 fish:["...kkk..","k.kooek.","kkoooook","k.koook.","...kkk.."],
 penguin:["..kkk..",".kkkkk.",".kwkwk.",".kwowk.","kkwwwkk","kkwwwkk","kkwwwkk",".kwwwk.",".kkkkk.",".oo.oo."],
 parrot:["..kkk...",".krrrk..",".krekyy.",".krrrk..","krrrrrk.","krryyrk.","krcccrk.",".krccck.","..kcck..","...cc..."],
 monkey:["...kkkk...","..knnnnk..","knkttttknk",".ktettetk.","..kttttk..","...kkkk...","..knnnnk.n",".knnttnnkn",".knnnnnnk.","..kk..kk.."],
 frog:[".kk...kk.","kwek.kwek","kgggggggk","kgkkkkkgk","kgggggggk","kk.kkk.kk"],
 alien:["....k....","....y....","..kkkkk..",".kgggggk.","kgkkgkkgk","kgkwgkwgk",".kgggggk.","..kkkkk..",".kgmmmgk.",".kgmmmgk.","..kk.kk.."],
 gift:[".r...r.","..rrr..","kkkrkkk","kyyryyk","kyyryyk","kyyryyk","kkkkkkk"]
});

// ================= TERRAIN =================
// c: two alternating top colors, side: the color of the world's edge, dot: texture detail color.
const TERRAIN={
 g:{n:'Grass',c:['#5fd36a','#4cc65c'],side:'#2a9a48',dot:'#2a9a48'},
 d:{n:'Dirt',c:['#c98a5a','#bb7c4c'],side:'#7a4a2a',dot:'#8a5a3a'},
 s:{n:'Sand',c:['#f2d98a','#ead07c'],side:'#c9a050',dot:'#d9b860'},
 t:{n:'Stone',c:['#b3acc6','#a8a1bb'],side:'#6a6385',dot:'#8d86a6'},
 w:{n:'Snow',c:['#f4f6ff','#e8ecfa'],side:'#a9b8d8',dot:'#ffffff'},
 a:{n:'Water',c:['#3d9ae6','#3893e0'],side:'#1f5fa8',dot:'#9ee6ff',water:1}
};
const TERRAIN_KEYS=['g','d','s','t','w','a'];
// Overlays sit on top of terrain and connect to their neighbors: roads, paths and railroad tracks.
// Over water, a road or path becomes a bridge.
const OVERLAYS={r:{n:'Road',c:'#5a5670',line:'#ffd23f',w:.56},p:{n:'Path',c:'#e8d6b0',w:.5,dot:'#c9b08a'},l:{n:'Railroad',w:.44}};

// ================= THEMES =================
// ground: the default terrain; pal: terrain color changes; sky: [day, night] background;
// amb: ambient effect (snow, bubbles, leaves, stars, sparkle); feat: catalog items shown first; pets: creatures shown first.
const THEMES=[
 {id:'village',n:'Cozy Village',ground:'g',sky:['#9ee6ff','#1d1850'],amb:'leaves',icon:'cottage',feat:['cottage','bluehouse','bakery','oak','flowers','well','bench','pond'],pets:['villager','dog','cat','duck']},
 {id:'dino',n:'Dinosaur Island',ground:'g',pal:{g:{c:['#7ac85a','#6cbb4e'],side:'#3a7a2a'}},sky:['#ffd8a0','#2b1d40'],amb:'leaves',icon:'volcano',feat:['volcano','dinohab','dinoegg','fern','palm','bigmush','rock','hut'],pets:['trex','longneck','dragonling','monkey']},
 {id:'medieval',n:'Medieval Kingdom',ground:'g',sky:['#b3e8ff','#1b1240'],amb:'none',icon:'castle',feat:['castle','tower','wallc','gate','well','windmill','chapel','flagpole'],pets:['villager','horse','hen','dragon']},
 {id:'space',n:'Outer Space',ground:'g',pal:{g:{c:['#8d86a6','#827a9c'],side:'#4b4f70',dot:'#6a6385'},a:{c:['#5a2fd6','#5228c8'],side:'#2b2350',dot:'#c86bff'},s:{c:['#c9b8e8','#beaddc'],side:'#8a7ab0'}},sky:['#1b1530','#0e0a1c'],amb:'stars',icon:'rocket',feat:['spacestation','rocket','ufo','rover','dish','crystal','domehouse','portal'],pets:['alien','villager','dragonling']},
 {id:'pirate',n:'Pirate Cove',ground:'s',sky:['#86d6ff','#1d1850'],amb:'none',icon:'pirateship',feat:['pirateship','rowboat','chest','palm','shack','sandcastle','lighthouse','cave'],pets:['parrot','monkey','villager','fish']},
 {id:'winter',n:'Winter Wonderland',ground:'w',pal:{a:{c:['#9ee6ff','#8fdcf8'],side:'#5c9ac8',dot:'#ffffff'}},sky:['#d8ecff','#141c40'],amb:'snow',icon:'snowman',feat:['igloo','snowman','snowpine','rink','cabin','sled','lamp','bench'],pets:['penguin','villager','bunny','dog']},
 {id:'jungle',n:'Jungle Adventure',ground:'g',pal:{g:{c:['#3fb85a','#35ab4f'],side:'#1d7a35'}},sky:['#a8e8b0','#102a28'],amb:'leaves',icon:'hut',feat:['hut','palm','fern','treehouse','waterfall','bigmush','cave','totem'],pets:['monkey','parrot','frog','villager']},
 {id:'sea',n:'Underwater City',ground:'s',pal:{s:{c:['#e8d6a0','#ddca92'],side:'#a08a5a'},g:{c:['#3aa58a','#329a80'],side:'#1d6a5a'},a:{c:['#2a7ad0','#2470c4'],side:'#1a4a90'}},sky:['#2a8fd6','#0a1a40'],amb:'bubbles',icon:'domehouse',feat:['domehouse','coral','seaweed','submarine','chest','shell','cave','crystal'],pets:['fish','turtle','duck','villager']},
 {id:'farm',n:'Farm Country',ground:'g',sky:['#b3e8ff','#1d1850'],amb:'none',icon:'barn',feat:['barn','silo','farmhouse','veggies','pumpkins','hay','windmill','fence'],pets:['cow','horse','pig','hen']},
 {id:'candy',n:'Candy Kingdom',ground:'g',pal:{g:{c:['#ffb8d8','#ffaacd'],side:'#d9467a',dot:'#ffffff'},d:{c:['#c98a5a','#bb7c4c'],side:'#7a4a2a',dot:'#ffd23f'},a:{c:['#ff9ec4','#ff92bc'],side:'#c43c7a',dot:'#ffffff'}},sky:['#ffe0f0','#3a1840'],amb:'sparkle',icon:'candyhouse',feat:['candyhouse','lollitree','candycane','cupcake','gumdrop','icecream','rainbow','fountain'],pets:['bunny','villager','dragonling','cat']}
];
const themeById=id=>THEMES.find(t=>t.id===id)||THEMES[0];
function terrainOf(theme,ch){const b=TERRAIN[ch]||TERRAIN.g,o=themeById(theme).pal&&themeById(theme).pal[ch];return o?Object.assign({},b,o):b;}

// ================= OBJECT CATALOG =================
// Part shorthand (see art.js for what each part draws)
const box=(x,y,z,w,d,h,c,o)=>['box',x,y,z,w,d,h,c,o],roof=(x,y,z,w,d,h,c,k,a)=>['roof',x,y,z,w,d,h,c,k||'gable',a||'x'],
 cyl=(x,y,z,r,h,c,o)=>['cyl',x,y,z,r,h,c,o],cone=(x,y,z,r,h,c)=>['cone',x,y,z,r,h,c],ball=(x,y,z,r,c)=>['ball',x,y,z,r,c],
 flat=(x,y,w,d,c,z)=>['tile',x,y,w,d,c,z||0],dots=(x,y,w,d,c,n,z)=>['dots',x,y,w,d,c,n,z||0],pole=(x,y,z,h,c)=>['pole',x,y,z,h,c],
 flag=(x,y,z,h,c)=>['flag',x,y,z,h,c],px=(x,y,z,n,s,m)=>['px',x,y,z,n,s||1,m],live=(k,x,y,z,a,b,c)=>['live',k,x,y,z,a,b,c];
const RED='#ff3b5c',BLU='#3d7bff',YEL='#ffd23f',GRN='#47d16a',DGR='#2a9a48',BRN='#7a4a2a',LBR='#a86b3c',WHT='#fffaf0',GRY='#a9a3c0',DGY='#6a6385',PNK='#ff7aa8',PUR='#9a3fd6',ORG='#ff9a3c',SKY='#9ee6ff',STN='#c9c3d6',BRK='#c8553d',TAN='#e8d6b0',INK='#2b2350';
// a house: walls, windows, a door on the front-left face, and a roof
function house(o){
 const w=o.w||1,d=o.d||1,h=(o.h||.7)*(o.fl||1),wall=o.wall||WHT;
 const p=[box(.12,.12,0,w-.24,d-.24,h,wall,{win:o.win||SKY,door:o.door||BRN,df:'y',stripe:o.stripe,sc:o.sc,trim:o.trim})];
 if(o.rk!=='none')p.push(roof(.04,.04,h,w-.08,d-.08,o.rh||.5,o.roof||RED,o.rk||'gable',o.ax||'x'));
 if(o.chim){p.push(box(w*.68,.24,h,.14,.14,o.rh?o.rh*.9:.5,BRK));p.push(live('smoke',w*.75,.31,h+(o.rh?o.rh*.9:.5)));}
 return p.concat(o.extra||[]);
}
const tree=(trunk,leaf,r,h,extra)=>[cyl(.5,.5,0,.07,h||.45,trunk||BRN),ball(.5,.5,(h||.45)-.1,r||.36,leaf||GRN)].concat(extra||[]);
const pine=(c,snow)=>[cyl(.5,.5,0,.07,.25,BRN),cone(.5,.5,.2,.4,.6,c),cone(.5,.5,.55,.3,.5,c),cone(.5,.5,.85,.2,.4,snow||c)];
// fences and hedges join up with neighbors of the same kind: m is a bit mask (1 −y, 2 +x, 4 +y, 8 −x)
function fenceParts(c,post,rails,hedge){return st=>{const m=st.m||0,p=[];
 const arm=(bit,x,y,w,d)=>{if(m&bit)rails.forEach(z=>p.push(box(x,y,z,w,d,hedge?.45:.07,c)));};
 if(hedge){p.push(box(.28,.28,0,.44,.44,.45,c));arm(1,.28,0,.44,.3);arm(8,0,.28,.3,.44);arm(2,.7,.28,.3,.44);arm(4,.28,.7,.44,.3);return p;}
 arm(1,.46,0,.08,.46);arm(8,0,.46,.46,.08);p.push(box(.4,.4,0,.2,.2,.5,post));arm(2,.54,.46,.46,.08);arm(4,.46,.54,.08,.46);return p;};}
// gardens that grow: g is the stage (0 seeds … 3 ready)
function gardenParts(crop,leaf){return st=>{const g=st.g||0,p=[box(.08,.08,0,.84,.84,.08,LBR),flat(.14,.14,.72,.72,'#8a5a3a',.09)];
 if(g>=1)p.push(dots(.16,.16,.68,.68,[leaf],10+g*4,.1));if(g>=2)for(let i=0;i<3;i++)for(let j=0;j<2;j++)p.push(ball(.25+i*.25,.3+j*.4,.08,.07+(g-2)*.04,g>=3?crop:leaf));return p;};}
// every object: id, n (name), cat, th (theme), w×d footprint, parts, and optional behavior flags:
//  act: what tapping it does · home: villagers live here · visit: villagers visit · play: a play spot
//  light: glows at night · flat: low, creatures walk over it · water: 'on' (must be on water) | 'any'
//  float/hover: bobs on water / in the air · conn: joins to neighbors · grow: stages · reward: unlock id
const OBJECTS=[
 // ---------- buildings ----------
 {id:'cottage',n:'Cottage',cat:'build',th:'village',parts:house({wall:WHT,roof:RED,chim:1}),act:'door',home:1},
 {id:'bluehouse',n:'Blue House',cat:'build',th:'village',parts:house({wall:'#9ec8ff',roof:BLU,win:YEL}),act:'door',home:1},
 {id:'yellowhouse',n:'Sunny House',cat:'build',th:'village',parts:house({wall:'#ffe9a8',roof:ORG,fl:1.6,rk:'pyr'}),act:'door',home:1},
 {id:'pinkhouse',n:'Pink House',cat:'build',th:'candy',parts:house({wall:'#ffd0e4',roof:PUR,ax:'y'}),act:'door',home:1},
 {id:'townhouse',n:'Townhouse',cat:'build',th:'village',w:2,parts:house({w:2,wall:BRK,roof:DGY,fl:2,rk:'flat',win:YEL,trim:WHT}),act:'door',home:2},
 // helpers: ids and footprints are saved in worlds, so only the look and name may change
 {id:'firestation',n:'Fire Station',cat:'build',th:'village',w:2,parts:[box(.12,.12,0,1.76,.76,.95,'#e8463a',{win:WHT,trim:WHT}),roof(.04,.04,.95,1.92,.92,.1,'#8a2a2a','flat'),box(.28,.88,0,.62,.04,.64,WHT,{win:SKY}),box(1.1,.88,0,.62,.04,.64,WHT,{win:SKY}),box(.2,.92,0,1.6,.12,.03,GRY),px(1,.93,.72,'fire',1),box(1.5,.16,.95,.34,.34,.75,'#e8463a',{win:WHT}),roof(1.46,.12,1.7,.42,.42,.25,'#8a2a2a','pyr'),live('lights',1.67,.33,1.98,['#ff3b5c','#ffd23f','#ff3b5c'])],act:'siren',visit:1},
 {id:'police',n:'Police Station',cat:'build',th:'village',w:2,parts:[box(.18,.92,0,1.64,.1,.05,STN),box(.12,.12,0,1.76,.76,.9,'#dfe9ff',{win:SKY,door:BLU,df:'y',trim:BLU,stripe:.3,sc:'#dfe9ff'}),box(.12,.12,.3,1.76,.76,.12,BLU),roof(.04,.04,.9,1.92,.92,.1,'#2a55c2','flat'),px(1,.92,.84,'star',1),box(.7,.35,1,.6,.25,.07,INK),live('lights',1,.48,1.1,['#3d7bff','#ff3b5c','#3d7bff']),flag(1.82,.2,1,.7,BLU)],act:'siren',visit:1},
 {id:'hospital',n:'Hospital',cat:'build',th:'village',w:2,parts:[box(.12,.12,0,1.76,.76,1.25,WHT,{win:SKY,door:SKY,df:'y',trim:RED}),roof(.04,.04,1.25,1.92,.92,.1,STN,'flat'),box(.55,.88,.55,.9,.22,.06,RED),pole(.6,1.06,0,.55,WHT),pole(1.4,1.06,0,.55,WHT),box(1.4,.88,.68,.2,.03,.5,RED),box(1.22,.88,.83,.56,.03,.2,RED),box(1.88,.4,.68,.03,.2,.5,RED),box(1.88,.22,.83,.03,.56,.2,RED),box(.72,.4,1.35,.56,.2,.03,RED),box(.9,.22,1.35,.2,.56,.03,RED)],act:'door',visit:1},
 {id:'cabin',n:'Log Cabin',cat:'build',th:'winter',parts:house({wall:LBR,roof:DGR,stripe:.1,sc:BRN,chim:1}),act:'door',home:1},
 {id:'farmhouse',n:'Farmhouse',cat:'build',th:'farm',w:2,d:2,parts:house({w:2,d:2,wall:WHT,roof:RED,fl:1.4,chim:1,extra:[box(.4,1.75,0,1.2,.2,.08,LBR)]}),act:'door',home:2},
 {id:'barn',n:'Barn',cat:'build',th:'farm',w:2,d:2,parts:house({w:2,d:2,wall:'#d9463a',roof:'#8a2a2a',fl:1.6,ax:'y',rh:.8,door:WHT,win:WHT}),act:'door',visit:1},
 {id:'silo',n:'Silo',cat:'build',th:'farm',parts:[cyl(.5,.5,0,.3,1.4,STN,{stripe:.2,sc:GRY}),roof(.2,.2,1.4,.6,.6,.5,RED,'dome')]},
 {id:'castle',n:'Castle',cat:'build',th:'medieval',w:2,d:2,parts:[box(.25,.25,0,1.5,1.5,1.1,STN,{win:INK,door:BRN,df:'y'}),cyl(.25,.25,0,.25,1.5,STN),cyl(1.75,.25,0,.25,1.5,STN),cyl(.25,1.75,0,.25,1.5,STN),cyl(1.75,1.75,0,.25,1.5,STN),cone(.25,.25,1.5,.3,.6,BLU),cone(1.75,.25,1.5,.3,.6,BLU),cone(.25,1.75,1.5,.3,.6,BLU),cone(1.75,1.75,1.5,.3,.6,BLU),flag(1,1,1.1,.8,RED)],act:'door',home:2,visit:1},
 {id:'tower',n:'Castle Tower',cat:'build',th:'medieval',parts:[cyl(.5,.5,0,.32,1.6,STN,{win:INK}),cone(.5,.5,1.6,.38,.7,PUR),flag(.5,.5,2.25,.5,YEL)]},
 {id:'wallc',n:'Castle Wall',cat:'build',th:'medieval',conn:'wall',parts:st=>{const m=st.m||0,p=[box(.2,.2,0,.6,.6,.7,STN)];if(m&1)p.push(box(.2,0,0,.6,.3,.7,STN));if(m&8)p.push(box(0,.2,0,.3,.6,.7,STN));if(m&2)p.push(box(.7,.2,0,.3,.6,.7,STN));if(m&4)p.push(box(.2,.7,0,.6,.3,.7,STN));p.push(box(.2,.2,.7,.2,.2,.15,STN),box(.6,.6,.7,.2,.2,.15,STN));return p;}},
 {id:'gate',n:'Castle Gate',cat:'build',th:'medieval',w:2,parts:[box(.1,.2,0,.5,.6,1.1,STN),box(1.4,.2,0,.5,.6,1.1,STN),box(.1,.2,.8,1.8,.6,.4,STN),box(.75,.75,0,.5,.06,.7,BRN),cone(.35,.5,1.1,.3,.4,RED),cone(1.65,.5,1.1,.3,.4,RED)],act:'door'},
 {id:'treehouse',n:'Treehouse',cat:'build',th:'jungle',parts:[cyl(.5,.5,0,.12,1.1,BRN),ball(.5,.5,1.1,.5,DGR),box(.2,.2,.9,.6,.6,.45,LBR,{win:YEL,door:BRN,df:'y'}),roof(.15,.15,1.35,.7,.7,.3,RED,'pyr'),box(.7,.55,0,.06,.06,.9,LBR)],act:'door',home:1,play:1},
 {id:'school',n:'School',cat:'build',th:'village',w:2,parts:house({w:2,wall:BRK,roof:DGY,fl:1.4,win:SKY,trim:WHT,extra:[box(.85,.35,.98,.3,.3,.35,WHT),roof(.8,.3,1.33,.4,.4,.25,RED,'pyr'),flag(1.8,.1,0,1.2,BLU)]}),act:'bell',visit:1},
 {id:'library',n:'Library',cat:'build',th:'medieval',w:2,d:2,parts:[box(.15,.15,0,1.7,1.7,.12,STN),box(.3,.3,.12,1.4,1.4,.9,'#f2ead0',{win:BLU,door:BRN,df:'y'}),cyl(.4,1.75,.12,.07,.9,WHT),cyl(.8,1.75,.12,.07,.9,WHT),cyl(1.2,1.75,.12,.07,.9,WHT),cyl(1.6,1.75,.12,.07,.9,WHT),box(.2,.2,1.02,1.6,1.6,.12,STN),roof(.5,.5,1.14,1,1,.6,'#5cc8ff','dome')],act:'door',visit:1},
 {id:'shop',n:'Toy Shop',cat:'build',th:'village',parts:house({wall:'#c8f0d0',roof:GRN,rk:'flat',fl:1.2,extra:[box(.05,.85,.55,.9,.15,.08,RED,{stripe:.04,sc:WHT})]}),act:'door',visit:1},
 {id:'bakery',n:'Bakery',cat:'build',th:'village',parts:house({wall:'#ffe0c0',roof:'#c8553d',chim:1,extra:[px(.5,1,.35,'bread',1)]}),act:'door',visit:1},
 {id:'market',n:'Market Stall',cat:'build',th:'village',parts:[box(.1,.2,0,.8,.6,.35,LBR),box(.1,.2,.35,.8,.6,.06,TAN),dots(.15,.25,.7,.5,[RED,ORG,GRN,YEL],14,.42),pole(.12,.22,0,.9,LBR),pole(.88,.78,0,.9,LBR),roof(.05,.15,.9,.9,.7,.2,RED,'gable','x')],visit:1},
 {id:'church',n:'Church',cat:'build',th:'village',w:2,parts:[box(.2,.25,0,1.3,.6,.85,WHT,{win:'#c86bff',door:BRN,df:'y'}),roof(.15,.2,.85,1.4,.7,.5,RED,'gable','x'),box(1.45,.3,0,.4,.5,1.3,WHT,{win:'#c86bff'}),roof(1.42,.27,1.3,.46,.56,.8,RED,'pyr'),pole(1.65,.55,2.05,.35,YEL),box(1.58,.55,2.25,.16,.02,.05,YEL)],act:'bell',visit:1},
 {id:'chapel',n:'Stone Chapel',cat:'build',th:'medieval',parts:[box(.15,.15,0,.7,.7,.7,STN,{win:YEL,door:BRN,df:'y'}),roof(.1,.1,.7,.8,.8,.45,DGY,'gable','y'),pole(.5,.85,1.1,.3,YEL)],act:'bell',visit:1},
 {id:'lighthouse',n:'Lighthouse',cat:'build',th:'pirate',parts:[cyl(.5,.5,0,.3,1.7,WHT,{stripe:.3,sc:RED}),box(.3,.3,1.7,.4,.4,.3,YEL),roof(.25,.25,2,.5,.5,.3,RED,'pyr')],light:{z:1.85,r:44,c:'#ffe9a8'},act:'light'},
 {id:'windmill',n:'Windmill',cat:'build',th:'farm',parts:[cyl(.5,.5,0,.3,1.2,TAN,{win:BRN}),cone(.5,.5,1.2,.35,.5,RED),live('blades',.5,.95,1.1,.9,WHT)],act:'spin'},
 {id:'spacestation',n:'Space Station',cat:'build',th:'space',w:2,d:2,parts:[box(.3,.3,0,1.4,1.4,.5,STN,{win:SKY,door:DGY,df:'y'}),roof(.4,.4,.5,1.2,1.2,1,'#c9e8ff','dome'),cyl(1.7,.3,0,.22,1.1,WHT,{win:YEL}),pole(.3,.3,.5,1,GRY),live('lights',.3,.3,1.55,['#ff3b5c','#47d16a','#ffd23f'])],act:'door',home:2},
 {id:'domehouse',n:'Bubble Dome',cat:'build',th:'sea',parts:[box(.15,.15,0,.7,.7,.12,STN),roof(.15,.15,.12,.7,.7,1,'#bfe8ff','dome'),box(.4,.75,.12,.2,.1,.3,BLU)],act:'door',home:1},
 {id:'igloo',n:'Igloo',cat:'build',th:'winter',parts:[roof(.1,.1,0,.8,.8,.9,'#f4f6ff','dome'),box(.38,.78,0,.24,.2,.28,'#e4e8f8')],act:'door',home:1},
 {id:'candyhouse',n:'Gingerbread House',cat:'build',th:'candy',parts:house({wall:'#c98a5a',roof:'#ff9ec4',door:'#ff3b5c',win:WHT,trim:WHT,extra:[dots(.1,.1,.8,.8,[RED,GRN,YEL,BLU],14,1.05)]}),act:'door',home:1},
 {id:'hut',n:'Grass Hut',cat:'build',th:'jungle',parts:[cyl(.5,.5,0,.32,.5,LBR,{win:BRN}),cone(.5,.5,.45,.45,.6,'#e8c27a')],act:'door',home:1},
 {id:'shack',n:'Pirate Shack',cat:'build',th:'pirate',parts:house({wall:LBR,roof:BRN,stripe:.12,sc:BRN,rk:'gable',ax:'y',extra:[flag(.9,.1,0,1.4,INK)]}),act:'door',home:1},
 {id:'station',n:'Train Station',cat:'build',th:'village',w:2,parts:[box(.05,.1,0,1.9,.8,.15,STN),box(.2,.15,.15,.8,.5,.6,TAN,{win:SKY,door:BRN,df:'y'}),pole(1.2,.2,.15,.8,GRY),pole(1.8,.8,.15,.8,GRY),roof(1.1,.1,.95,.85,.8,.15,RED,'flat'),roof(.15,.1,.75,.9,.6,.3,RED,'gable','x')],visit:1},
 {id:'tent',n:'Camping Tent',cat:'build',th:'jungle',parts:[roof(.1,.15,0,.8,.7,.6,ORG,'gable','x'),box(.42,.8,0,.16,.05,.3,INK)],home:1},
 {id:'cafe',n:'Ice Cream Shop',cat:'build',th:'candy',parts:house({wall:WHT,roof:PNK,rk:'flat',fl:1.1,extra:[box(.05,.85,.5,.9,.15,.08,PNK,{stripe:.04,sc:WHT}),px(.85,.5,.86,'icecone',1)]}),act:'door',visit:1},
 // ---------- nature ----------
 {id:'oak',n:'Oak Tree',cat:'nature',th:'village',parts:tree(BRN,GRN,.4,.45)},
 {id:'pine',n:'Pine Tree',cat:'nature',th:'winter',parts:pine(DGR)},
 {id:'snowpine',n:'Snowy Pine',cat:'nature',th:'winter',parts:pine('#3a8a5a',WHT)},
 {id:'birch',n:'Birch Tree',cat:'nature',th:'village',parts:[cyl(.5,.5,0,.06,.7,WHT,{stripe:.15,sc:INK}),ball(.5,.5,.6,.3,'#8ad86a')]},
 {id:'appletree',n:'Apple Tree',cat:'nature',th:'farm',parts:tree(BRN,GRN,.4,.45,[dots(.2,.2,.6,.6,[RED],7,.9)]),act:'shake'},
 {id:'palm',n:'Palm Tree',cat:'nature',th:'pirate',parts:[cyl(.5,.5,0,.06,1,LBR,{stripe:.1,sc:BRN}),ball(.5,.5,.95,.2,DGR),box(.05,.42,1.02,.9,.16,.05,GRN),box(.42,.05,1.02,.16,.9,.05,GRN),ball(.45,.45,.9,.08,BRN)]},
 {id:'cherry',n:'Blossom Tree',cat:'nature',th:'candy',parts:tree(BRN,'#ffb8d8',.42,.45,[dots(.15,.15,.7,.7,[WHT,PNK],10,.95)])},
 {id:'autumn',n:'Autumn Tree',cat:'nature',th:'farm',parts:tree(BRN,ORG,.4,.45,[dots(0,0,1,1,[ORG,YEL],6,0)])},
 {id:'bush',n:'Bush',cat:'nature',th:'village',parts:[ball(.5,.5,0,.3,DGR)]},
 {id:'berrybush',n:'Berry Bush',cat:'nature',th:'jungle',parts:[ball(.5,.5,0,.3,DGR),dots(.25,.25,.5,.5,[BLU,PUR],8,.5)],act:'shake'},
 {id:'flowers',n:'Flower Bed',cat:'nature',th:'village',flat:1,parts:[dots(.1,.1,.8,.8,[RED,YEL,PNK,WHT,'#c86bff'],22)]},
 {id:'tulips',n:'Tulips',cat:'nature',th:'farm',flat:1,parts:[box(.1,.1,0,.8,.8,.06,LBR),dots(.15,.15,.7,.7,[RED,PNK,YEL],14,.12)]},
 {id:'sunflowers',n:'Sunflowers',cat:'nature',th:'farm',parts:[pole(.3,.3,0,.6,DGR),pole(.7,.4,0,.7,DGR),pole(.45,.7,0,.55,DGR),ball(.3,.3,.55,.1,YEL),ball(.7,.4,.65,.1,YEL),ball(.45,.7,.5,.1,YEL)]},
 {id:'rock',n:'Rock',cat:'nature',th:'village',parts:[ball(.5,.5,0,.2,GRY)]},
 {id:'boulder',n:'Big Boulder',cat:'nature',th:'dino',parts:[ball(.5,.5,0,.4,DGY),ball(.25,.6,0,.18,GRY)]},
 {id:'mushroom',n:'Mushroom',cat:'nature',th:'jungle',parts:[cyl(.5,.5,0,.07,.2,WHT),roof(.3,.3,.2,.4,.4,.5,RED,'dome'),dots(.35,.35,.3,.3,[WHT],5,.42)]},
 {id:'bigmush',n:'Giant Mushroom',cat:'nature',th:'jungle',parts:[cyl(.5,.5,0,.14,.7,WHT),roof(.1,.1,.7,.8,.8,.7,PUR,'dome'),dots(.2,.2,.6,.6,[WHT],8,1.05)],act:'bounce2'},
 {id:'pond',n:'Pond',cat:'nature',th:'village',w:2,d:2,flat:1,parts:[flat(.1,.1,1.8,1.8,'#c9a070'),flat(.2,.2,1.6,1.6,'#3d9ae6',.02),dots(.4,.4,1,1,[WHT],5,.03),ball(.4,1.5,0,.12,DGR)],act:'splash'},
 {id:'waterfall',n:'Waterfall',cat:'nature',th:'jungle',w:2,parts:[box(.1,.1,0,1.8,.5,1.3,DGY),box(.6,.55,0,.8,.45,.06,'#3d9ae6'),box(.65,.58,.06,.7,.02,1.2,'#5ec4ff'),live('fall',1,.6,1.25,1.2),live('water',1,.9,.05,.4)]},
 {id:'mountain',n:'Mountain',cat:'nature',th:'winter',w:2,d:2,parts:[cone(1,1,0,1,1.8,'#8d86a6'),cone(1,1,1.2,.35,.6,WHT),cone(.5,1.5,0,.4,.8,DGY)]},
 {id:'veggies',n:'Vegetable Garden',cat:'nature',th:'farm',flat:1,parts:gardenParts(ORG,DGR),grow:3,act:'grow',stateKey:s=>'g'+(s.g||0),iconState:{g:3}},
 {id:'pumpkins',n:'Pumpkin Patch',cat:'nature',th:'farm',flat:1,parts:gardenParts(ORG,'#3a8a3a'),grow:3,act:'grow',stateKey:s=>'g'+(s.g||0),iconState:{g:3}},
 {id:'hay',n:'Hay Bale',cat:'nature',th:'farm',parts:[cyl(.5,.5,0,.3,.4,'#ffd884',{stripe:.1,sc:'#e8b860'})]},
 {id:'logs',n:'Log Pile',cat:'nature',th:'winter',parts:[box(.15,.3,0,.7,.4,.15,LBR),box(.2,.35,.15,.6,.3,.15,BRN),box(.3,.4,.3,.4,.2,.12,LBR)]},
 {id:'cactus',n:'Cactus',cat:'nature',th:'pirate',parts:[cyl(.5,.5,0,.12,.8,DGR),cyl(.3,.5,.3,.07,.3,DGR),cyl(.7,.5,.45,.07,.25,DGR)]},
 {id:'lily',n:'Lily Pads',cat:'nature',th:'jungle',flat:1,water:'on',parts:[flat(.2,.2,.3,.3,GRN,.02),flat(.55,.5,.3,.3,GRN,.02),dots(.3,.3,.3,.3,[PNK],2,.05)]},
 {id:'coral',n:'Coral',cat:'nature',th:'sea',parts:[cyl(.4,.5,0,.08,.5,PNK),cyl(.6,.4,0,.07,.7,ORG),ball(.4,.5,.45,.12,PNK),ball(.6,.4,.65,.1,ORG),cyl(.55,.65,0,.06,.35,'#c86bff')]},
 {id:'seaweed',n:'Seaweed',cat:'nature',th:'sea',parts:[cyl(.35,.5,0,.05,.8,DGR),cyl(.55,.4,0,.05,1,GRN),cyl(.6,.65,0,.05,.6,DGR)]},
 {id:'shell',n:'Seashell',cat:'nature',th:'sea',parts:[roof(.25,.25,0,.5,.5,.4,'#ffd0e4','dome')]},
 {id:'volcano',n:'Volcano',cat:'nature',th:'dino',w:2,d:2,parts:[cone(1,1,0,.95,1.5,'#6a4a3a'),cone(1,1,1.1,.4,.4,'#8a5a3a'),flat(.7,.7,.6,.6,'#ff5e3a',1.5),live('lava',1,1,1.5),live('smoke',1,1,1.6)],act:'erupt'},
 {id:'fern',n:'Fern',cat:'nature',th:'dino',parts:[box(.1,.45,0,.8,.1,.25,GRN),box(.45,.1,0,.1,.8,.3,DGR),ball(.5,.5,0,.18,GRN)]},
 {id:'snowman',n:'Snowman',cat:'nature',th:'winter',parts:[ball(.5,.5,0,.28,WHT),ball(.5,.5,.6,.2,WHT),ball(.5,.5,1.05,.14,WHT),box(.38,.38,1.4,.24,.24,.25,INK),box(.48,.62,1.2,.08,.12,.05,ORG)],act:'wave'},
 {id:'lollitree',n:'Lollipop Tree',cat:'nature',th:'candy',parts:[pole(.5,.5,0,.8,WHT),ball(.5,.5,.7,.32,PNK),dots(.3,.3,.4,.4,[WHT,YEL],6,1.2)]},
 {id:'candycane',n:'Candy Cane',cat:'nature',th:'candy',parts:[cyl(.5,.5,0,.08,.9,WHT,{stripe:.12,sc:RED}),box(.5,.42,.85,.25,.16,.16,RED)]},
 {id:'gumdrop',n:'Gumdrops',cat:'nature',th:'candy',parts:[roof(.15,.15,0,.35,.35,.4,GRN,'dome'),roof(.5,.2,0,.35,.35,.4,PNK,'dome'),roof(.3,.5,0,.35,.35,.4,YEL,'dome')]},
 {id:'cupcake',n:'Giant Cupcake',cat:'nature',th:'candy',parts:[cyl(.5,.5,0,.32,.4,'#c98a5a',{stripe:.08,sc:'#e8a87c'}),roof(.15,.15,.4,.7,.7,.6,PNK,'dome'),ball(.5,.5,.8,.1,RED)]},
 {id:'crystal',n:'Crystals',cat:'nature',th:'space',parts:[cone(.4,.5,0,.15,.7,'#c86bff'),cone(.6,.4,0,.12,.5,'#5ec4ff'),cone(.55,.7,0,.1,.4,PNK),live('sparkle',.5,.5,.6,'#ffffff')],light:{z:.4,r:22,c:'#c86bff'}},
 {id:'totem',n:'Jungle Totem',cat:'nature',th:'jungle',parts:[box(.3,.3,0,.4,.4,.4,LBR,{win:INK}),box(.3,.3,.4,.4,.4,.4,ORG,{win:INK}),box(.3,.3,.8,.4,.4,.35,GRN,{win:INK}),box(.1,.42,1.05,.8,.16,.1,RED)]},
 // ---------- fun ----------
 {id:'playground',n:'Playground',cat:'fun',th:'village',w:2,d:2,parts:[flat(.05,.05,1.9,1.9,'#f2d98a'),box(.2,.2,0,.5,.5,.6,RED),roof(.15,.15,.6,.6,.6,.3,YEL,'pyr'),box(.3,.7,0,.3,.9,.06,BLU),box(.3,.7,.3,.3,.3,.06,BLU),pole(1.2,.4,0,.8,DGY),pole(1.8,.4,0,.8,DGY),box(1.2,.38,.8,.6,.04,.04,DGY),live('sway',1.5,.4,.8,.55),live('bounce',.45,1.4,.1,.3,'#3d7bff')],play:1,act:'bounce'},
 {id:'slide',n:'Slide',cat:'fun',th:'village',parts:[box(.15,.15,0,.3,.3,.7,BLU),box(.15,.45,.1,.3,.5,.05,RED),box(.15,.45,.4,.3,.25,.05,RED),live('bounce',.3,.3,.75,.2,'#ff9a3c')],play:1,act:'bounce'},
 {id:'swings',n:'Swings',cat:'fun',th:'village',parts:[pole(.15,.5,0,.85,DGY),pole(.85,.5,0,.85,DGY),box(.15,.48,.85,.7,.04,.04,DGY),live('sway',.5,.5,.85,.55)],play:1,act:'bounce'},
 {id:'seesaw',n:'Seesaw',cat:'fun',th:'village',parts:[box(.42,.42,0,.16,.16,.2,DGY),box(.05,.45,.2,.9,.1,.05,YEL),live('bounce',.15,.5,.25,.15,'#47d16a')],play:1,act:'bounce'},
 {id:'trampoline',n:'Trampoline',cat:'fun',th:'village',parts:[cyl(.5,.5,0,.4,.2,BLU),cyl(.5,.5,.2,.35,.02,INK),live('bounce',.5,.5,.25,.8,'#c86bff')],play:1,act:'bounce'},
 {id:'sandbox',n:'Sandbox',cat:'fun',th:'pirate',flat:1,parts:[box(.08,.08,0,.84,.84,.12,LBR),flat(.14,.14,.72,.72,'#f2d98a',.13),box(.3,.3,.13,.15,.15,.1,RED)],play:1},
 {id:'skatepark',n:'Skate Ramp',cat:'fun',th:'village',w:2,parts:[flat(.05,.05,1.9,.9,STN),box(.1,.1,0,.4,.8,.5,GRY),box(1.5,.1,0,.4,.8,.5,GRY),box(.5,.1,0,.3,.8,.25,STN),box(1.2,.1,0,.3,.8,.25,STN)],play:1},
 {id:'pool',n:'Swimming Pool',cat:'fun',th:'village',w:2,d:2,flat:1,parts:[box(.05,.05,0,1.9,1.9,.1,WHT),flat(.15,.15,1.7,1.7,'#5ec4ff',.11),dots(.2,.2,1.6,1.6,[WHT],8,.12),box(1.7,.3,.1,.08,.4,.4,GRY)],act:'splash',play:1},
 {id:'ferris',n:'Ferris Wheel',cat:'fun',th:'candy',w:2,parts:[box(.2,.4,0,1.6,.3,.1,DGY),box(.3,.45,0,.1,.1,1.4,GRY),box(1.6,.45,0,.1,.1,1.4,GRY),live('wheel',1,.5,1.35,1.2)],act:'spin',play:1},
 {id:'carousel',n:'Carousel',cat:'fun',th:'candy',w:2,d:2,parts:[cyl(1,1,0,.85,.2,'#fffaf0'),pole(1,1,.2,1,YEL),roof(.15,.15,1.2,1.7,1.7,.6,RED,'pyr'),live('spin',1,1,.35,.7,null,8)],act:'spin',play:1},
 {id:'teacups',n:'Teacup Ride',cat:'fun',th:'candy',w:2,d:2,parts:[cyl(1,1,0,.9,.1,PNK),live('spin',1,1,.15,.55,[RED,BLU,YEL,GRN],4)],act:'spin',play:1},
 {id:'field',n:'Sports Field',cat:'fun',th:'village',w:3,d:2,flat:1,parts:[flat(.05,.05,2.9,1.9,'#3fb85a'),flat(.2,.2,2.6,1.6,'#4cc65c',.01),flat(1.47,.2,.06,1.6,WHT,.02),flat(.2,.2,2.6,.04,WHT,.02),flat(.2,1.76,2.6,.04,WHT,.02),box(.2,.8,0,.08,.4,.3,WHT),box(2.72,.8,0,.08,.4,.3,WHT)],play:1},
 {id:'hoop',n:'Basketball Hoop',cat:'fun',th:'village',parts:[flat(.05,.05,.9,.9,STN),pole(.2,.5,0,1.1,DGY),box(.2,.3,1,.06,.4,.3,WHT),cyl(.38,.5,1.05,.1,.02,ORG)],play:1},
 {id:'picnic',n:'Picnic Table',cat:'fun',th:'village',parts:[box(.15,.3,.3,.7,.4,.06,LBR),box(.15,.15,.15,.7,.1,.05,LBR),box(.15,.75,.15,.7,.1,.05,LBR),box(.2,.45,0,.08,.1,.3,BRN),box(.72,.45,0,.08,.1,.3,BRN),flat(.3,.35,.3,.3,RED,.37)],visit:1},
 {id:'fountain',n:'Fountain',cat:'fun',th:'village',parts:[cyl(.5,.5,0,.42,.2,STN),cyl(.5,.5,.2,.35,.01,'#5ec4ff'),cyl(.5,.5,0,.08,.6,STN),live('water',.5,.5,.6,.6)],act:'splash',visit:1},
 {id:'gazebo',n:'Bandstand',cat:'fun',th:'village',w:2,d:2,parts:[cyl(1,1,0,.8,.15,WHT),pole(.45,.45,.15,.8,WHT),pole(1.55,.45,.15,.8,WHT),pole(.45,1.55,.15,.8,WHT),pole(1.55,1.55,.15,.8,WHT),roof(.2,.2,.95,1.6,1.6,.6,GRN,'pyr')],act:'music',visit:1},
 {id:'balloon',n:'Hot Air Balloon',cat:'fun',th:'village',hover:1,parts:[box(.38,.38,.3,.24,.24,.2,LBR),pole(.4,.4,.5,.4,BRN),pole(.6,.6,.5,.4,BRN),ball(.5,.5,.8,.45,RED),dots(.2,.2,.6,.6,[YEL],6,1.6)],act:'float'},
 {id:'rink',n:'Ice Rink',cat:'fun',th:'winter',w:2,d:2,flat:1,parts:[box(.05,.05,0,1.9,1.9,.08,WHT),flat(.12,.12,1.76,1.76,'#c9f2ff',.09),dots(.2,.2,1.6,1.6,[WHT],10,.1)],play:1},
 {id:'sled',n:'Sled Hill',cat:'fun',th:'winter',w:2,parts:[box(.1,.1,0,1.8,.8,.15,WHT),box(.1,.1,.15,.9,.8,.4,WHT),box(1.2,.35,.15,.4,.25,.08,RED)],play:1},
 {id:'icecream',n:'Ice Cream Cart',cat:'fun',th:'candy',parts:[box(.2,.3,.1,.6,.4,.35,WHT,{stripe:.08,sc:PNK}),cyl(.3,.75,0,.1,.12,INK),cyl(.7,.75,0,.1,.12,INK),pole(.5,.5,.45,.5,GRY),roof(.2,.2,.95,.6,.6,.2,PNK,'pyr')],visit:1},
 {id:'coaster',n:'Mini Coaster',cat:'fun',th:'candy',w:3,parts:[box(.1,.4,0,2.8,.2,.12,RED),box(.4,.4,0,.1,.2,.8,GRY),box(.5,.4,.8,.8,.2,.08,RED),box(1.3,.4,0,.1,.2,.5,GRY),box(1.4,.4,.5,.8,.2,.08,RED),box(2.2,.4,0,.1,.2,.3,GRY),live('spin',1.5,.5,.6,.5,[YEL,BLU],2)],act:'spin',play:1},
 // ---------- town ----------
 {id:'lamp',n:'Streetlight',cat:'town',th:'village',parts:[pole(.5,.5,0,1.1,DGY),box(.4,.4,1.05,.2,.2,.12,YEL)],light:{z:1.1,r:30,c:'#ffe9a8'},act:'light'},
 {id:'lantern',n:'Lantern Post',cat:'town',th:'medieval',parts:[pole(.5,.5,0,.8,BRN),box(.42,.42,.8,.16,.16,.2,ORG),live('flame',.5,.5,.88)],light:{z:.9,r:24,c:'#ffb070'},act:'light'},
 {id:'bench',n:'Bench',cat:'town',th:'village',parts:[box(.15,.4,.2,.7,.25,.05,LBR),box(.15,.6,.25,.7,.05,.25,LBR),box(.2,.45,0,.06,.15,.2,DGY),box(.74,.45,0,.06,.15,.2,DGY)],visit:1},
 {id:'fence',n:'Wood Fence',cat:'town',th:'farm',conn:'fence',parts:fenceParts(LBR,BRN,[.15,.35])},
 {id:'picket',n:'Picket Fence',cat:'town',th:'village',conn:'picket',parts:fenceParts(WHT,WHT,[.15,.35])},
 {id:'hedge',n:'Hedge',cat:'town',th:'village',conn:'hedge',parts:fenceParts(DGR,DGR,[0],true)},
 {id:'stonewall',n:'Stone Wall',cat:'town',th:'medieval',conn:'stone',parts:fenceParts(STN,GRY,[0,.2])},
 {id:'mailbox',n:'Mailbox',cat:'town',th:'village',parts:[pole(.5,.5,0,.4,BRN),box(.38,.35,.4,.24,.3,.18,BLU),box(.6,.4,.5,.03,.06,.12,RED)]},
 {id:'bin',n:'Trash Can',cat:'town',th:'village',parts:[cyl(.5,.5,0,.18,.35,GRN),cyl(.5,.5,.35,.2,.04,DGR)]},
 {id:'busstop',n:'Bus Stop',cat:'town',th:'village',parts:[box(.1,.3,0,.8,.06,.7,'#9ee6ff'),roof(.05,.2,.7,.9,.5,.06,BLU,'flat'),box(.2,.4,.2,.6,.2,.05,LBR),pole(.9,.85,0,.9,GRY),box(.82,.8,.85,.16,.06,.16,YEL)],visit:1},
 {id:'trafficlight',n:'Traffic Light',cat:'town',th:'village',parts:[pole(.5,.5,0,1,DGY),box(.42,.42,.75,.16,.16,.45,INK),live('lights',.5,.6,.95)]},
 {id:'well',n:'Wishing Well',cat:'town',th:'medieval',parts:[cyl(.5,.5,0,.3,.3,STN),cyl(.5,.5,.3,.25,.01,'#3d9ae6'),pole(.25,.5,.3,.5,BRN),pole(.75,.5,.3,.5,BRN),roof(.15,.2,.8,.7,.6,.3,RED,'gable','y')],act:'wish'},
 {id:'signpost',n:'Signpost',cat:'town',th:'village',parts:[pole(.5,.5,0,.8,BRN),box(.25,.45,.55,.5,.06,.15,TAN),box(.45,.25,.35,.06,.5,.15,TAN)]},
 {id:'flagpole',n:'Flagpole',cat:'town',th:'village',parts:[flat(.3,.3,.4,.4,STN),flag(.5,.5,0,1.4,RED)]},
 {id:'car',n:'Parked Car',cat:'town',th:'village',parts:[box(.15,.3,.08,.7,.4,.2,RED),box(.3,.32,.28,.4,.36,.16,SKY),cyl(.3,.75,0,.09,.1,INK),cyl(.7,.75,0,.09,.1,INK)],act:'honk'},
 {id:'truck',n:'Fire Truck',cat:'town',th:'village',w:2,parts:[box(.1,.3,.1,1.4,.45,.3,RED),box(1.5,.3,.1,.4,.45,.45,RED,{win:SKY}),box(.2,.38,.4,1.2,.08,.05,GRY),cyl(.4,.8,0,.1,.12,INK),cyl(1.7,.8,0,.1,.12,INK),live('lights',1.7,.5,.62,['#ff3b5c','#3d7bff','#ff3b5c'])],act:'siren'},
 {id:'policecar',n:'Police Car',cat:'town',th:'village',parts:[box(.15,.3,.08,.7,.4,.2,WHT,{stripe:.1,sc:'#2a55c2'}),box(.3,.32,.28,.4,.36,.16,SKY),cyl(.3,.75,0,.09,.1,INK),cyl(.7,.75,0,.09,.1,INK),live('lights',.5,.5,.5,['#3d7bff','#ff3b5c','#3d7bff'])],act:'siren'},
 {id:'ambulance',n:'Ambulance',cat:'town',th:'village',w:2,parts:[box(.1,.3,.1,1.25,.45,.5,WHT),box(1.35,.3,.1,.5,.45,.35,WHT,{win:SKY}),box(.1,.3,.18,1.75,.45,.06,RED),box(.6,.76,.36,.08,.02,.26,RED),box(.51,.76,.45,.26,.02,.08,RED),cyl(.4,.8,0,.1,.12,INK),cyl(1.6,.8,0,.1,.12,INK),live('lights',.9,.5,.65,['#ff3b5c','#3d7bff','#ff3b5c'])],act:'siren'},
 {id:'hydrant',n:'Fire Hydrant',cat:'town',th:'village',parts:[cyl(.5,.5,0,.1,.3,RED),roof(.4,.4,.3,.2,.2,.15,RED,'dome')],act:'splash'},
 {id:'planter',n:'Flower Pot',cat:'town',th:'village',parts:[cyl(.5,.5,0,.2,.25,BRK),ball(.5,.5,.2,.18,DGR),dots(.35,.35,.3,.3,[PNK,YEL],5,.6)]},
 {id:'statue',n:'Statue',cat:'town',th:'medieval',parts:[box(.25,.25,0,.5,.5,.3,STN),cyl(.5,.5,.3,.12,.5,GRY),ball(.5,.5,.8,.12,GRY)]},
 {id:'bridgepost',n:'Dock',cat:'town',th:'pirate',water:'any',flat:1,parts:[box(.05,.2,0,.9,.6,.12,LBR,{stripe:.04,sc:BRN}),pole(.1,.2,0,.35,BRN),pole(.9,.8,0,.35,BRN)]},
 // ---------- fantasy & adventure ----------
 {id:'pirateship',n:'Pirate Ship',cat:'fantasy',th:'pirate',w:2,water:'on',float:1,parts:[box(.1,.3,0,1.8,.4,.25,BRN),box(.05,.35,.25,1.9,.3,.06,LBR),box(1.5,.3,.25,.4,.4,.3,BRN),pole(.9,.5,.3,1.3,LBR),box(.55,.48,.65,.7,.04,.6,WHT),flag(.9,.5,1.6,.3,INK),live('bob',1,.5,0)],act:'float'},
 {id:'rowboat',n:'Rowboat',cat:'fantasy',th:'pirate',water:'on',float:1,parts:[box(.2,.35,0,.6,.3,.15,LBR),box(.25,.38,.15,.5,.24,.02,BRN),live('bob',.5,.5,0)],act:'float'},
 {id:'sailboat',n:'Sailboat',cat:'fantasy',th:'pirate',water:'on',float:1,parts:[box(.1,.35,0,.8,.3,.15,WHT),pole(.5,.5,.15,1,BRN),roof(.5,.45,.25,.35,.1,.8,'#ff9ec4','pyr'),live('bob',.5,.5,0)],act:'float'},
 {id:'submarine',n:'Submarine',cat:'fantasy',th:'sea',w:2,water:'any',float:1,parts:[cyl(1,.5,0,.35,.01,YEL),box(.2,.3,0,1.6,.4,.4,YEL,{win:SKY}),box(.8,.35,.4,.4,.3,.25,YEL),pole(1,.5,.65,.3,GRY),live('bob',1,.5,0)],act:'float'},
 {id:'rocket',n:'Rocket',cat:'fantasy',th:'space',parts:[flat(.1,.1,.8,.8,DGY),cyl(.5,.5,.05,.22,1.1,WHT,{win:SKY}),cone(.5,.5,1.15,.22,.45,RED),box(.2,.45,.05,.15,.1,.35,RED),box(.65,.45,.05,.15,.1,.35,RED),live('jet',.5,.5,.05)],act:'launch'},
 {id:'ufo',n:'Flying Saucer',cat:'fantasy',th:'space',hover:1,parts:[cyl(.5,.5,.6,.45,.12,GRY),roof(.3,.3,.72,.4,.4,.5,SKY,'dome'),live('lights',.5,.9,.62,['#47d16a','#ffd23f','#ff3b5c'])],act:'float'},
 {id:'rover',n:'Moon Rover',cat:'fantasy',th:'space',parts:[box(.15,.3,.12,.7,.4,.15,WHT),box(.3,.35,.27,.3,.3,.15,GRY),cyl(.25,.75,0,.1,.12,INK),cyl(.75,.75,0,.1,.12,INK),pole(.75,.35,.27,.4,GRY),roof(.6,.25,.67,.3,.2,.1,SKY,'dome')],act:'honk'},
 {id:'dish',n:'Satellite Dish',cat:'fantasy',th:'space',parts:[box(.35,.35,0,.3,.3,.4,GRY),roof(.15,.15,.4,.7,.7,.4,WHT,'dome'),pole(.5,.5,.55,.4,DGY)],act:'magic'},
 {id:'portal',n:'Magic Portal',cat:'fantasy',th:'space',parts:[box(.1,.4,0,.15,.2,1,PUR),box(.75,.4,0,.15,.2,1,PUR),box(.1,.4,1,.8,.2,.15,PUR),live('swirl',.5,.5,.55)],act:'magic',light:{z:.55,r:26,c:'#c86bff'}},
 {id:'dinohab',n:'Dino Habitat',cat:'fantasy',th:'dino',w:3,d:3,flat:1,walk:1,parts:[flat(.05,.05,2.9,2.9,'#8ab86a'),box(.05,.05,0,2.9,.08,.3,LBR),box(.05,.05,0,.08,2.9,.3,LBR),box(2.87,.05,0,.08,2.9,.3,LBR),box(.05,2.87,0,1.2,.08,.3,LBR),box(1.75,2.87,0,1.2,.08,.3,LBR),ball(.6,.6,0,.25,DGR),ball(2.3,.8,0,.3,DGR),flat(1.6,1.6,.8,.6,'#3d9ae6',.02)],act:'roar',hab:'dino'},
 {id:'dinoegg',n:'Dino Nest',cat:'fantasy',th:'dino',parts:[cyl(.5,.5,0,.35,.08,'#c9a070'),ball(.4,.45,.05,.12,'#e8f0d0'),ball(.6,.5,.05,.12,'#d0e8ff'),ball(.5,.65,.05,.12,'#ffe0c0')],act:'hatch'},
 {id:'dragonnest',n:'Dragon Nest',cat:'fantasy',th:'medieval',parts:[cyl(.5,.5,0,.4,.15,'#8a5a3a'),ball(.4,.45,.1,.14,'#c86bff'),ball(.62,.52,.1,.14,'#47d16a'),live('sparkle',.5,.5,.3,'#ffd23f')],act:'hatch'},
 {id:'chest',n:'Treasure Chest',cat:'fantasy',th:'pirate',parts:st=>[box(.25,.3,0,.5,.4,.25,LBR,{stripe:.08,sc:BRN}),st.open?box(.25,.22,.25,.5,.08,.35,BRN):box(.25,.3,.25,.5,.4,.12,BRN),box(.45,.68,.12,.1,.03,.1,YEL)],stateKey:s=>s.open?'o':'c',act:'chest'},
 {id:'magictree',n:'Magic Tree',cat:'fantasy',th:'candy',parts:tree('#5a3a6a','#c86bff',.45,.5,[live('sparkle',.5,.5,.9,'#ffffff')]),light:{z:.9,r:26,c:'#c86bff'},act:'magic'},
 {id:'cave',n:'Secret Cave',cat:'fantasy',th:'jungle',w:2,d:2,parts:[ball(1,1,0,.85,DGY),ball(.5,1.4,0,.45,GRY),roof(.75,1.7,0,.5,.3,.5,INK,'dome')],act:'cave'},
 {id:'wizard',n:'Wizard Tower',cat:'fantasy',th:'medieval',parts:[cyl(.5,.5,0,.3,1.5,'#5a2fd6',{win:YEL}),cone(.5,.5,1.5,.38,.9,'#2b2350'),live('sparkle',.5,.5,2.2,'#ffd23f')],light:{z:1.2,r:22,c:'#c86bff'},act:'magic'},
 {id:'rainbow',n:'Rainbow Arch',cat:'fantasy',th:'candy',w:2,parts:[RED,ORG,YEL,GRN,BLU,PUR].map((c,i)=>box(.1+i*.05,.45,0,.12,.1,1.3-i*.12,c)).concat([RED,ORG,YEL,GRN,BLU,PUR].map((c,i)=>box(1.78-i*.05,.45,0,.12,.1,1.3-i*.12,c)),[RED,ORG,YEL,GRN,BLU,PUR].map((c,i)=>box(.1+i*.05,.45,1.3-i*.12,1.8-i*.1,.1,.1,c))),act:'magic'},
 {id:'sandcastle',n:'Sandcastle',cat:'fantasy',th:'pirate',parts:[box(.2,.2,0,.6,.6,.3,'#f2d98a'),cyl(.25,.25,0,.12,.5,'#f2d98a'),cyl(.75,.75,0,.12,.5,'#f2d98a'),cyl(.75,.25,0,.12,.5,'#f2d98a'),flag(.5,.5,.3,.4,RED)]},
 {id:'dragonstatue',n:'Dragon Statue',cat:'fantasy',th:'medieval',parts:[box(.2,.2,0,.6,.6,.25,STN),px(.5,.5,.25,'dragon',1)],act:'roar'},
 {id:'treasuremap',n:'X Marks the Spot',cat:'fantasy',th:'pirate',flat:1,parts:[flat(.25,.25,.5,.5,'#c9a070',.01),box(.35,.47,.02,.3,.06,.01,RED),box(.47,.35,.02,.06,.3,.01,RED)],act:'dig'},
 // ---------- treasures (unlocked by learning; always free in Creative Mode) ----------
 {id:'goldlamb',n:'Golden Lamb',cat:'treasure',th:'village',parts:[box(.2,.2,0,.6,.6,.3,STN),px(.5,.5,.3,'sheep',1,{w:'#ffd23f',k:'#c98a1b',v:'#fff2b0'}),live('sparkle',.5,.5,.6,'#fff2b0')],reward:'wb:goldlamb'},
 {id:'trophy',n:'Giant Trophy',cat:'treasure',th:'village',parts:[box(.25,.25,0,.5,.5,.25,BRN),px(.5,.5,.25,'trophy',2),live('sparkle',.5,.5,.8,'#ffffff')],reward:'wb:trophy'},
 {id:'starfountain',n:'Star Fountain',cat:'treasure',th:'candy',w:2,d:2,parts:[cyl(1,1,0,.8,.25,'#c9e8ff'),cyl(1,1,.25,.7,.01,'#5ec4ff'),cyl(1,1,0,.12,.8,YEL),px(1,1,.8,'star',1),live('water',1,1,.8,.8)],light:{z:.9,r:30,c:'#fff2b0'},reward:'wb:starfountain',act:'splash'},
 {id:'hymnstand',n:'Hymn Bandstand',cat:'treasure',th:'village',w:2,d:2,parts:[cyl(1,1,0,.8,.15,'#ffe9a8'),pole(.45,.45,.15,.8,YEL),pole(1.55,.45,.15,.8,YEL),pole(.45,1.55,.15,.8,YEL),pole(1.55,1.55,.15,.8,YEL),roof(.2,.2,.95,1.6,1.6,.6,PUR,'pyr'),px(1,1,.2,'note',1,{k:'#1b1530',m:'#ffd23f'})],act:'music',reward:'wb:hymnstand'},
 {id:'shieldgate',n:'Guardian Gate',cat:'treasure',th:'medieval',w:2,parts:[box(.1,.3,0,.4,.4,1.2,STN),box(1.5,.3,0,.4,.4,1.2,STN),box(.1,.3,1.2,1.8,.4,.2,STN),px(1,.5,1.4,'shield',1),px(.3,.5,1.2,'guardian',1),px(1.7,.5,1.2,'guardian',1)],reward:'wb:shieldgate',act:'magic'},
 {id:'arkmodel',n:"Noah's Ark",cat:'treasure',th:'village',w:3,parts:[box(.2,.3,0,2.6,.4,.3,BRN),box(.1,.25,.3,2.8,.5,.08,LBR),box(.7,.3,.38,1.4,.4,.4,LBR,{win:INK}),roof(.65,.25,.78,1.5,.5,.3,BRN,'gable','x'),px(.4,.5,.38,'sheep',1),px(2.5,.5,.38,'lion',1)],reward:'wb:arkmodel',act:'float'}
];
// small sprites used by a few objects
Object.assign(SPR,{icecone:["..kkk..",".kzwzk.","kzzzwzk","kkkkkkk",".kyyyk.","..kyk..","...k..."]});
// Vehicles that drive by themselves (not in the catalog: cat is null)
OBJECTS.push(
 {id:'carb',n:'Car',cat:null,parts:[box(.15,.3,.08,.7,.4,.2,BLU),box(.3,.32,.28,.4,.36,.16,SKY),cyl(.3,.75,0,.09,.1,INK),cyl(.7,.75,0,.09,.1,INK)]},
 {id:'cary',n:'Car',cat:null,parts:[box(.15,.3,.08,.7,.4,.2,YEL),box(.3,.32,.28,.4,.36,.16,SKY),cyl(.3,.75,0,.09,.1,INK),cyl(.7,.75,0,.09,.1,INK)]},
 {id:'trainhead',n:'Train',cat:null,parts:[box(.1,.3,.1,.8,.4,.3,RED),box(.1,.3,.4,.35,.4,.3,RED,{win:SKY}),cyl(.75,.5,.4,.1,.25,INK),cyl(.25,.75,0,.1,.12,INK),cyl(.75,.75,0,.1,.12,INK),live('smoke',.75,.5,.7)]},
 {id:'traincar',n:'Train Car',cat:null,parts:[box(.1,.3,.1,.8,.4,.35,BLU,{win:YEL}),cyl(.25,.75,0,.1,.12,INK),cyl(.75,.75,0,.1,.12,INK)]}
);
const OBJ=Object.fromEntries(OBJECTS.map(o=>[o.id,o]));
const CATS=[['build','HOMES','cottage'],['nature','NATURE','oak'],['fun','FUN','ferris'],['town','TOWN','lamp'],['fantasy','MAGIC','wizard'],['treasure','PRIZES','trophy']];
// World Builder treasures are unlockables too (shop tab WORLD): earned by learning, or bought with coins.
UNLOCKS.push(
 {id:'wb:goldlamb',kind:'wb',key:'sheep',n:'Golden Lamb',ach:'found25'},
 {id:'wb:trophy',kind:'wb',key:'trophy',n:'Giant Trophy',lv:5},
 {id:'wb:starfountain',kind:'wb',key:'star',n:'Star Fountain',coins:120},
 {id:'wb:hymnstand',kind:'wb',key:'note',n:'Hymn Bandstand',ach:'song5'},
 {id:'wb:shieldgate',kind:'wb',key:'shield',n:'Guardian Gate',ach:'guard5'},
 {id:'wb:arkmodel',kind:'wb',key:'scroll',n:"Noah's Ark",coins:150}
);

// ================= CREATURES =================
// spr: sprite; move: walk | hop | swim (water only) | fly; home: 'land' | 'water' | 'any';
// speed in tiles per second; snd: notes it makes when tapped; cat: group in the catalog.
const CREATURES=[
 {id:'villager',n:'Villager',spr:'person',cat:'people',move:'walk',home:'land',speed:1},
 {id:'dog',n:'Dog',spr:'dog',cat:'pets',move:'walk',home:'land',speed:1.5,snd:[523,784]},
 {id:'cat',n:'Cat',spr:'cat',cat:'pets',move:'walk',home:'land',speed:1.1,snd:[880,660]},
 {id:'bunny',n:'Bunny',spr:'bunny',cat:'pets',move:'hop',home:'land',speed:1.2,snd:[1046]},
 {id:'chick',n:'Chick',spr:'chick',cat:'farm',move:'walk',home:'land',speed:.8,snd:[1568,1760]},
 {id:'hen',n:'Hen',spr:'hen',cat:'farm',move:'walk',home:'land',speed:.8,snd:[988,1175,988]},
 {id:'duck',n:'Duck',spr:'duck',cat:'farm',move:'walk',home:'any',speed:.9,snd:[659,587]},
 {id:'cow',n:'Cow',spr:'cow',cat:'farm',move:'walk',home:'land',speed:.6,snd:[196,174]},
 {id:'horse',n:'Horse',spr:'horse',cat:'farm',move:'walk',home:'land',speed:1.6,snd:[440,523,440]},
 {id:'pig',n:'Pig',spr:'pig',cat:'farm',move:'walk',home:'land',speed:.8,snd:[330,294]},
 {id:'sheep',n:'Sheep',spr:'sheep',cat:'farm',move:'walk',home:'land',speed:.7,snd:[392,370]},
 {id:'turtle',n:'Turtle',spr:'turtle',cat:'wild',move:'walk',home:'any',speed:.4,snd:[262]},
 {id:'frog',n:'Frog',spr:'frog',cat:'wild',move:'hop',home:'any',speed:1,snd:[220,330]},
 {id:'fish',n:'Fish',spr:'fish',cat:'wild',move:'swim',home:'water',speed:1,snd:[1318]},
 {id:'penguin',n:'Penguin',spr:'penguin',cat:'wild',move:'walk',home:'any',speed:.7,snd:[784,698]},
 {id:'parrot',n:'Parrot',spr:'parrot',cat:'wild',move:'fly',home:'land',speed:1.6,snd:[1175,1568]},
 {id:'monkey',n:'Monkey',spr:'monkey',cat:'wild',move:'hop',home:'land',speed:1.3,snd:[880,1046,880]},
 {id:'lionw',n:'Lion',spr:'lion',cat:'wild',move:'walk',home:'land',speed:1,snd:[147,131]},
 {id:'trex',n:'T. Rex',spr:'trex',cat:'dinos',move:'walk',home:'land',speed:1,snd:[110,98]},
 {id:'longneck',n:'Longneck',spr:'longneck',cat:'dinos',move:'walk',home:'land',speed:.6,snd:[165,147]},
 {id:'dragonling',n:'Little Dragon',spr:'dragonling',cat:'dinos',move:'fly',home:'land',speed:1.3,snd:[523,659,784]},
 {id:'dragon',n:'Dragon',spr:'dragon',cat:'dinos',move:'fly',home:'land',speed:1.1,snd:[220,196,175]},
 {id:'alien',n:'Space Buddy',spr:'alien',cat:'people',move:'hop',home:'land',speed:1,snd:[1046,1318,1568]}
];
const CRE=Object.fromEntries(CREATURES.map(c=>[c.id,c]));
const CRE_CATS=[['people','PEOPLE','person'],['pets','PETS','dog'],['farm','FARM','cow'],['wild','WILD','frog'],['dinos','DINOS','trex']];
// Friendly names for new villagers (kids can rename them).
const VILLAGER_NAMES=['Sam','Ruth','Eli','Hannah','Ben','Lydia','Noah','Grace','Caleb','Joy','Micah','Esther','Levi','Anna','Jude','Mary','Silas','Ivy','Abel','Rose'];
