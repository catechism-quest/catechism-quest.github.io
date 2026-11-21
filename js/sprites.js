// Catechism Quest: pixel-art sprites, icons, palette and heroes.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// ================= DATA =================
const PAL={"k":"#1b1530","w":"#ffffff","s":"#ffcf9e","S":"#e8a87c","e":"#1b1530","p":"#ff7aa8","a":"#d7dde8","b":"#8e9ab0","r":"#ff3b5c","c":"#3d7bff","C":"#2a55c2","y":"#ffd23f","Y":"#e0a800","n":"#7a4a2a","g":"#47d16a","G":"#2a9a48","o":"#ff9a3c","O":"#d9661a","m":"#c86bff","M":"#9a3fd6","h":"#f2c14e","H":"#c98a1b","f":"#ff5e3a","t":"#ffe9a8","v":"#ffffff"};
const SPR={"knight":["......rr........",".....rrrr.......","....kkkkkk......","...kaaaaaak.....","...kabbbbak..w..","...kkkkkkkk..w..","...kaaaaaak..w..","....kaaaak...w..","..kkccyycckkyyy.",".kaakcyyckaak.k.",".kaakccccckak...",".kkk.kccck.kk...","....kbbkbbk.....","....kak.kak.....","....knk.knk.....","....kkk.kkk....."],"princess":["....y.y.y.......","....yyyyy.......","...khhhhhk......","..khhsssshk.....","..khsesseshk....","..khsssssh......","..khhspsshk.....","..kh.kssk.hk....","....kmmmmk......","...kmmyymmk.....","..ksmmmmmmsk....","...kmmmmmmk.....","..kmmmmmmmmk....","..kMmmmmmmMk....",".kMMMMMMMMMMk...","..kkkkkkkkkk...."],"dragon":["...Y......Y.....","...Yk....kY.....","...kgkkkkgk.....","..kgggggggggk...","..kgvkgggvkgk...","..kgggggggggk...","..kggGGGGGggk...","...kgGkGkGgk....","MM.kkggggkk.MM..","MMMkgttttgkMMM..",".MkggttttggkM...","..kggttttggk..f.","..kggttttggkkof.","...kggggggkgkk..","...kgk..kgk.....","...kkk..kkk....."],"lion":["...kkkkkkkk.....","..koooooooook...",".koOooooooOook..",".koohhhhhhhook..","koohhehhhehhook.","koohhhhhhhhhook.","koohhhkkkhhhook.",".koohhppphhook..",".kooohhhhhoook..","..koooooooook.k.","...khhhhhhk..kok","..khhhtthhhk.ko.","..khhttttthhkk..","...khhhhhhhk....","...khk...khk....","...kkk...kkk...."],"sheep":["..kkkkkk....",".kwwwwwwkk..","kwwwwwwwwwk.","kwwwwwwwkkkk","kwwwwwwwkvkk","kwwwwwwwkkk.",".kwwwwwwwk..","..kkkkkkk...","..kk..kk....","..kk..kk...."],"coin":["..kkkk..",".kyyyYk.","kyytyyYk","kyytyyYk","kyytyyYk","kyyyyyYk",".kYYYYk.","..kkkk.."],"sword":[".......kk","......kwk",".....kwk.","....kwk..",".k.kwk...",".kykk....","..kyk....",".knkyk...","knk..k..."],"heart":[".kk.kk.","krrkrrk","krrrrrk","krrrrrk",".krrrk.","..krk..","...k..."],"castle":["k.k.k....k.k.k","kakak....kakak","kaaak.kk.kaaak","kaaakkrrkkaaak","kaaaakrrkaaaak","kaaaaakkaaaaak","kabaaaaaaaabak","kaaaaakkaaaaak","kaaaakbbkaaaak","kaaaakbbkaaaak","kkkkkkkkkkkkkk"],"flag":["kyyy..","kyyyy.","kyyy..","k.....","k.....","k....."]};
// 8-bit UI icons and land emblems (same palette letters as the sprites above).
Object.assign(SPR,{
 gear:[".....kkk.....",".kk..kak..kk.",".kakkkakkkak.","..kaaaaaaak..","..kaabbbaak..","kkkab...bakkk","kaaab...baaak","kkkab...bakkk","..kaabbbaak..","..kaaaaaaak..",".kakkkakkkak.",".kk..kak..kk.",".....kkk....."],
 note:["...kkkkkkk","...kkkkkkk","...k.....k","...k.....k","...k.....k","...k.....k","...k.....k",".kkk...kkk","kmmk..kmmk","kmmk..kmmk",".kk....kk."],
 lock:["..kkkk..",".kk..kk.",".k....k.","kkkkkkkk","kyyyyyyk","kyykkyyk","kyykkyyk","kyyyyyyk","kkkkkkkk"],
 speaker:["....k....","...kk..k.","kkkwk.k.k","kwwwk.k.k","kwwwk.k.k","kkkwk.k.k","...kk..k.","....k...."],
 book:["kkkkkkk.","knnnnnkk","knnynnkw","knyyynkw","knnynnkw","knnynnkw","knnnnnkk","kkkkkkk."],
 eye:["..kkkkk..",".kwwcwwk.","kwwcCcwwk",".kwwcwwk.","..kkkkk.."],
 shut:["k.......k",".kk...kk.","...kkk...","..k.k.k.."],
 back:["...k...","..kk...",".kkkkkk","kkkkkkk",".kkkkkk","..kk...","...k..."],
 play:["k....","kk...","kkk..","kkkk.","kkk..","kk...","k...."],
 stop:["kkkkk","kkkkk","kkkkk","kkkkk","kkkkk"],
 star:["....k....","...kyk...","kkkyyykkk","kyyyyyyyk",".kyyyyyk.","..kyyyk..",".kyykyyk.",".kyk.kyk.",".kk...kk."],
 crook:["..kkk.",".k...k","k....k","k....k",".....k",".....k",".....k",".....k",".....k",".....k"],
 tree:["..gggg..",".gGggrg.","gggGgggg","grgggGgg",".ggggrg.","...nn...","...nn...","..nnnn.."],
 ark:["........","...nnn..","...nwn..","nnnnnnnn",".nHHHHn.","..nnnn..","cccccccc","CcCcCcCc"],
 rainbow:["..rrrr..",".roooor.","royyyyor","oyggggyo","ygc..cgy","gc....cg"],
 nstar:["...y...","..yyy..","yyyyyyy",".yyyyy.","..yyy..",".yy.yy.","y.....y"],
 ladder:["n....n","nnnnnn","n....n","nnnnnn","n....n","nnnnnn","n....n"],
 pyramid:["...hh...","..hhHh..",".hhhhHh.","hhhhhhHh"],
 fire:["...f...","..ff.f.",".fofff.",".foyof.","foyyyof","foyyyof",".fyyyf.",".GgGgG."],
 wave:["..ccc...",".cwwCc..","cw...cc.","ccc..cCc","CCcccCCc","cCCCCCCC"],
 bread:["..tttt..",".thhhht.","thhhhhht","tHHHHHHt",".tttttt."],
 tablets:[".aa...aa.","aaaa.aaaa","abba.abba","aaaa.aaaa","abba.abba","aaaa.aaaa","abba.abba","aaaa.aaaa"],
 crown:["y..y..y","yy.y.yy","yyyyyyy","yrycyry","yyyyyyy","YYYYYYY"],
 dove:["ww......","www..ww.",".wwwwwkY","..wwwww.","...ww..."],
 palm:["gg..gg",".gggg.","g.nn.g","..nn..","..nn..","..nn.."],
 cup:["yyyyyy","yyyyyy",".yyyy.","..yy..","..yy..",".yyyy."],
 cross:["..nn..","..nn..","nnnnnn","nnnnnn","..nn..","..nn..","..nn..",".GggG."],
 tomb:["..bbbb..",".baaaab.","baa..aab","ba....ab","ba....ab","bbbbbbbb"],
 ship:["...w....","...ww...","...www..","...wwww.","...n....","nnnnnnnn",".nnnnnn.","cccccccc"],
 scroll:["nttttttn",".tkkkkt.",".tttttt.",".tkkkkt.",".tttttt.","nttttttn"],
 // the guardian at the end of each land; 'a'/'b' armor takes the land's color
 guardian:["......kk......k.",".....kyyk....kwk","....kkkkkk...kwk","...kaaaaaak...n.","..kaakkkkaak..n.","..kaakyykaak..n.","..kaaaaaaaak..n.","...kaaaaaak...n.",".kkkbbbbbbkkkkn.","kyyykbbbbkaaakn.","kyrykbbbbkaaakn.","kyyykbbbbkaaakn.",".kyk.kbbk.kkk.n.","....kaak.kaak.n.","....kaak.kaak.n.","....kkkk.kkkk.n."],
 trophy:["..kkkkkkk..","kkkyyyytkkk","k.kyyyytk.k","k.kyyyyyk.k",".kkyyyyykk.","...kyyyk...","....kyk....","....kyk....","...kYYYk...","..kkkkkkk.."],
 shield:[".kkkkkk.","kyyyyyyk","kyykkyyk","kykyykyk","kyykkyyk",".kyyyyk.","..kyyk..","...kk..."]
});
// Small inline icon; pass {k:'#fff'} as the map on colored buttons.
const ic=(n,s,m)=>spr(n,s||2,m,'ic');
const W={k:'#ffffff'},LOSTG={w:'#e8e4f0',k:'#9a93b0',v:'#c9c3d6'},LOCKG={k:'#7d7698',y:'#ddd8e8'},STARG={y:'#d8d1e6',k:'#9a93b0'};
const starRow=p=>[0,1,2].map(n=>spr('star',2,n<p?{y:'#ffffff'}:{y:'#e0a800',k:'#c98a1b'})).join('');
const HEROES={
 knight:{name:'Knight',desc:'Brave and true',colors:[{n:'Classic',m:{}},{n:'Gold',m:{a:'#ffe27a',b:'#d9a520',c:'#e0413a'},cost:40},{n:'Shadow',m:{a:'#8a8fb0',b:'#4b4f70',c:'#8a3fe0',r:'#47d16a'},cost:80}]},
 princess:{name:'Princess',desc:'Kind and wise',colors:[{n:'Classic',m:{}},{n:'Ocean',m:{m:'#5cc8ff',M:'#2a8fd6'},cost:40},{n:'Rose',m:{m:'#ff7aa8',M:'#d9467a',h:'#8a5a3a'},cost:80}]},
 dragon:{name:'Dragon',desc:'Fiery and loyal',colors:[{n:'Classic',m:{}},{n:'Fire',m:{g:'#ff6b4a',G:'#c43c22',M:'#ffd23f',m:'#e0a800'},cost:40},{n:'Ice',m:{g:'#8ae6ff',G:'#3aa7d6',M:'#ffffff',f:'#5cc8ff',o:'#c9f2ff'},cost:80}]},
 lion:{name:'Lion',desc:'Strong and bold',colors:[{n:'Classic',m:{}},{n:'Snow',m:{o:'#f2f0ff',O:'#c9c6e6',h:'#ffffff',t:'#e6e3ff'},cost:40},{n:'Night',m:{o:'#5b3fd6',O:'#3a2a9a'},cost:80}]}
};
const HERO_KEYS=['knight','princess','dragon','lion'];
