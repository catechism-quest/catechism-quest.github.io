// Catechism Quest: sound effects, the chiptune hymn player, speech and confetti.
// Loaded as a classic script by index.html; files share top-level names and must load in the order listed there.
'use strict';
// ================= SOUND =================
let AC=null;
function ac(){try{if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();}catch(e){AC=null;}return AC;}
function tone(f,d,type,when,vol){
 if(!S.sound)return;const a=ac();if(!a)return;
 try{const t0=a.currentTime+(when||0),o=a.createOscillator(),g=a.createGain();o.type=type||'square';o.frequency.value=f;g.gain.setValueAtTime(vol||.05,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+d+.03);}catch(e){}
}
const sfx={
 ok(){tone(988,.08);tone(1319,.12,'square',.07);},
 bad(){tone(196,.12,'square',0,.06);tone(147,.18,'square',.1,.06);},
 coin(){tone(988,.07,'square',0,.05);tone(1319,.25,'square',.07,.05);},
 win(){[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.14,'square',i*.09,.05));},
 lose(){[392,349,330].forEach((f,i)=>tone(f,.18,'square',i*.14,.05));},
 tap(){tone(660,.04,'square',0,.03);},
 sword(){[1600,1200,800].forEach((f,i)=>tone(f,.06,'sawtooth',i*.04,.04));}
};
// chiptune hymn player
const MU={on:false,k:-1,timer:null,master:null,seq:null,i:0,t:0,bt:0,beat:0,spb:.5,bar:4,pick:0,noise:null};
function midiOf(n){const m=n.match(/^([A-G])(#|b)?(\d)$/);if(!m)return 60;const b={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);return 12*(+m[3]+1)+b;}
const hz=m=>440*Math.pow(2,(m-69)/12);
function parseSong(s){return s.trim().split(/\s+/).map(tok=>{const [n,d]=tok.split(':');return{r:n==='R',m:n==='R'?0:midiOf(n),d:parseFloat(d)};});}
function voice(a,f,t,d,type,vol,dest){const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.012);g.gain.setValueAtTime(vol,t+Math.max(.02,d*.7));g.gain.linearRampToValueAtTime(.0001,t+Math.max(.04,d*.94));o.connect(g);g.connect(dest);o.start(t);o.stop(t+d+.02);}
function hat(a,t,dest,v){if(!MU.noise){const b=a.createBuffer(1,a.sampleRate*.1,a.sampleRate),c=b.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=Math.random()*2-1;MU.noise=b;}
 const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=MU.noise;f.type='highpass';f.frequency.value=6500;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.05);s.connect(f);f.connect(g);g.connect(dest);s.start(t);s.stop(t+.06);}
function kick(a,t,dest){const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);g.gain.setValueAtTime(.35,t);g.gain.exponentialRampToValueAtTime(.0001,t+.15);o.connect(g);g.connect(dest);o.start(t);o.stop(t+.16);}
// The jukebox plays the kid's unlocked hymns on shuffle: each one plays once through, then a
// different unlocked hymn starts. Every hymn plays once before any plays again.
function playSong(k){
 const a=ac();if(!a)return;stopSong();
 const s=SONGS[k];if(!s)return;
 const master=a.createGain(),lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;master.gain.value=.5;lp.connect(master);master.connect(a.destination);
 Object.assign(MU,{on:true,k,master,lp,seq:parseSong(s.n),i:0,spb:60/s.bpm,bar:s.bar,pick:s.pick||0,t:a.currentTime+.12,beat:0,end:0});
 MU.bt=MU.t;MU.bag=(MU.bag||[]).filter(x=>x!==k);
 MU.timer=setInterval(sched,50);sched();
 if(V.name==='music')render();
}
function nextSong(){
 const k=kid(),own=k?k.songs.filter(i=>SONGS[i]):[];if(!own.length)return 0;
 MU.bag=(MU.bag||[]).filter(i=>own.includes(i)&&i!==MU.k);
 if(!MU.bag.length)MU.bag=shuffle(own.filter(i=>i!==MU.k||own.length===1));
 return MU.bag.shift();
}
function sched(){
 const a=AC;if(!a||!MU.on)return;const horizon=a.currentTime+.3;
 if(MU.end){if(a.currentTime>=MU.end)playSong(nextSong());return;}
 while(MU.t<horizon&&MU.i<MU.seq.length){
  const nt=MU.seq[MU.i],dur=nt.d*MU.spb;
  if(!nt.r){voice(a,hz(nt.m),MU.t,dur,'square',.07,MU.lp);voice(a,hz(nt.m-12),MU.t,dur,'triangle',.16,MU.lp);}
  MU.t+=dur;MU.i++;
 }
 while(MU.bt<horizon&&MU.bt<MU.t-.001){
  const pos=((MU.beat-MU.pick)%MU.bar+MU.bar)%MU.bar;
  if(pos===0)kick(a,MU.bt,MU.master);
  hat(a,MU.bt,MU.master,pos===0?.05:.03);
  MU.bt+=MU.spb;MU.beat++;
 }
 if(MU.i>=MU.seq.length&&MU.bt>=MU.t-.001)MU.end=MU.t+MU.spb*2;   // a short breath between hymns
}
function stopSong(){
 if(MU.timer)clearInterval(MU.timer);MU.timer=null;MU.on=false;
 if(MU.master&&AC){const m=MU.master;try{m.gain.setValueAtTime(m.gain.value,AC.currentTime);m.gain.linearRampToValueAtTime(.0001,AC.currentTime+.15);}catch(e){}setTimeout(()=>{try{m.disconnect();}catch(e){}},400);}
 MU.master=null;MU.k=-1;
}
function syncMusic(){
 const k=kid();if(!(S.music&&k&&V.name!=='title')){if(MU.on)stopSong();return;}
 // keep the current hymn going; start over only when nothing plays or this kid hasn't unlocked it
 if(!MU.on||!k.songs.includes(MU.k)){MU.bag=[];playSong(k.songs.includes(k.song)?k.song:0);}
}

// voice
let TTS=null;
(async()=>{try{if(window.claude&&window.claude.use)TTS=await window.claude.use('tts');}catch(e){}})();
function webSpeak(t){try{const s=window.speechSynthesis;if(!s)return;s.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.9;s.speak(u);}catch(e){}}
function speak(t){if(TTS){TTS.speak(t,{rate:.9}).catch(()=>webSpeak(t));return;}webSpeak(t);}

// fx
function confetti(n){
 const c=$('#fx'),x=c.getContext('2d'),dpr=window.devicePixelRatio||1,W=c.width=innerWidth*dpr,H=c.height=innerHeight*dpr;
 const cols=['#ffd23f','#ff9a3c','#7b4dff','#2ec463','#ff3b5c','#5ec4ff','#ffffff'];
 const ps=Array.from({length:n},()=>({x:W/2+(Math.random()-.5)*W*.4,y:H*.55,vx:(Math.random()-.5)*W*.02,vy:-(Math.random()*H*.022+H*.01),s:Math.round((Math.random()*3+3))*2*dpr,c:rnd(cols)}));
 let t=0;(function f(){x.clearRect(0,0,W,H);ps.forEach(p=>{p.vy+=H*.0008;p.x+=p.vx;p.y+=p.vy;x.fillStyle=p.c;x.fillRect(Math.round(p.x/(4*dpr))*4*dpr,Math.round(p.y/(4*dpr))*4*dpr,p.s,p.s);});if(++t<150)requestAnimationFrame(f);else x.clearRect(0,0,W,H);})();
}
let toastT=null;
function toast(m){const el=$('#toast');el.innerHTML=`<div class="toast">${m}</div>`;clearTimeout(toastT);toastT=setTimeout(()=>{el.innerHTML='';},2200);}
function shake(el){if(!el)return;el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');}
