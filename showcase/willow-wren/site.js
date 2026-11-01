fetch('season.json').then(function(r){return r.json()}).then(function(c){if(!c||!c.theme||c.theme==='none')return;
document.documentElement.setAttribute('data-season',c.theme);document.getElementById('sb').textContent=(c.emoji||'')+' '+c.banner+(c.offer?' · '+c.offer:'')+' '+(c.emoji||'');
if(!matchMedia('(prefers-reduced-motion:reduce)').matches){var em={halloween:['🎃','🦇','👻'],bonfire:['🎆','✨'],christmas:['❄️','🎄'],spring:['🌸','🌼']}[c.theme]||[c.emoji||'✨'];
for(var i=0;i<12;i++)(function(i){setTimeout(function(){var d=document.createElement('div');d.className='fx';d.textContent=em[i%em.length];d.style.left=Math.random()*95+'vw';d.style.animationDuration=(7+Math.random()*6)+'s';document.body.appendChild(d);setTimeout(function(){d.remove()},14000)},i*700)})(i)}}).catch(function(){});
var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.12});
document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});

if(!window.__hal){window.__hal=1;fetch('season.json').then(function(r){return r.json()}).then(function(c){if(c&&c.theme==='halloween'&&!document.getElementById('halcard')){var s=document.querySelector('.strip');if(!s)return;var d=document.createElement('section');d.id='halcard';d.innerHTML='<div class="w"><div class="card" style="display:grid;gap:18px;align-items:center;grid-template-columns:1fr"><img src="img/halloween.jpg" alt="Illustration: a witch with a cleaning spray among pumpkins" style="width:100%;max-height:420px;object-fit:cover;object-position:50% 20%;border-radius:18px"><div><h2 style="margin:0 0 .3em">'+(c.banner||'Happy Halloween!')+'</h2><p class="lead">Seasonal illustration, drawings not photos. Ask me about a pre-party deep clean.</p><a class="btn gold" href="book.html">Join the waiting list</a></div></div></div>';s.parentNode.insertBefore(d,s.nextSibling)}}).catch(function(){})}

(function(){var pages=['index.html','services.html','book.html','fans.html'];var cur=location.pathname.split('/').pop();var ci=pages.indexOf(cur);if(ci<0)ci=0;
var d=document.createElement('div');d.className='dots';d.innerHTML=pages.map(function(p,i){return '<i'+(i===ci?' class="on"':'')+'></i>'}).join('');document.body.appendChild(d);
function go(n){if(n<0||n>=pages.length||go.busy)return;go.busy=1;location.href=pages[n]}
var sx=0,sy=0,lx=0,ly=0,st=0,on=false,skip=false;
function ok(el){return !(el&&el.closest&&el.closest('input,textarea,select,.tabs,.wz .opts,.strip,#rooms,#sw'))}
document.addEventListener('touchstart',function(e){if(e.touches.length!==1){on=false;return}var t=e.touches[0];sx=lx=t.clientX;sy=ly=t.clientY;st=Date.now();on=ok(e.target)&&sx>20&&sx<window.innerWidth-20;go.busy=0},{passive:true});
document.addEventListener('touchmove',function(e){if(!on)return;var t=e.touches[0];lx=t.clientX;ly=t.clientY},{passive:true});
function end(){if(!on)return;on=false;var dx=lx-sx,dy=ly-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.2&&Date.now()-st<900){go(dx<0?ci+1:ci-1)}}
document.addEventListener('touchend',end,{passive:true});document.addEventListener('touchcancel',end,{passive:true});
document.addEventListener('keydown',function(e){if(/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||''))return;if(e.key==='ArrowRight')go(ci+1);if(e.key==='ArrowLeft')go(ci-1)});
var seen=false;try{seen=sessionStorage.getItem('swh')}catch(e){}
if(!seen){try{sessionStorage.setItem('swh','1')}catch(e){}var h=document.createElement('div');h.className='swh';h.textContent='← Swipe to move between pages →';document.body.appendChild(h);setTimeout(function(){h.style.opacity=0},3200);setTimeout(function(){h.remove()},3800)}
setTimeout(function(){document.querySelectorAll('.rv:not(.in)').forEach(function(el){el.classList.add('in')})},1500);
window.addEventListener('pageshow',function(){go.busy=0;document.querySelectorAll('.rv').forEach(function(el){el.classList.add('in')})});
})();
