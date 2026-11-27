/* Reviews block (reusable on any site we build).
   Visitors send a review -> it is emailed to the site owner (FormSubmit).
   NOTHING shows on the site until the owner says yes and it is added to reviews.json.
   Use:  <div id="reviews" data-email="owner@example.co.uk" data-name="Business name" data-google="https://g.page/r/..."></div>
         <link rel="stylesheet" href="reviews.css"><script src="reviews.js"></script>  */
(function(){
var root=document.getElementById('reviews');if(!root)return;
var email=root.dataset.email,biz=root.dataset.name||'this website',google=root.dataset.google||'';
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
var wapp=root.dataset.whatsapp||'';
function wa(d,stars){var a=el('a','btn alt','Send by WhatsApp');a.target='_blank';a.rel='noopener';if(!wapp){a.hidden=true;return a}
 a.href='https://wa.me/'+wapp+'?text='+encodeURIComponent('Review for '+biz+'\n'+stars+' stars\nName: '+d.name.value+(d.role.value?' ('+d.role.value+')':'')+'\n'+d.text.value+'\nI am happy for this to be shown on the website.');return a}
var wrap=el('div','rvw'),list=el('div','rvw-list');wrap.appendChild(list);
var host=document.getElementById('reviews-shown');
if(host)host.hidden=true;
fetch(root.dataset.json||'reviews.json',{cache:'no-store'}).then(function(r){return r.json()}).then(function(a){
 if(!a||!a.length)return;
 a.forEach(function(r){var c=el('div','rvw-card');var n=Math.max(1,Math.min(5,r.rating|0));
  c.appendChild(el('div','rvw-stars',new Array(n+1).join('★')));
  c.appendChild(el('p',null,'“'+r.text+'”'));
  c.appendChild(el('b',null,r.name));if(r.role)c.appendChild(el('small',null,r.role));list.appendChild(c)});
 if(host)host.hidden=false;
}).catch(function(){});
var f=el('form','rvw-form');f.setAttribute('novalidate','');
f.innerHTML='<h3>Leave a review</h3>'+
'<div style="font-weight:700">How did we do?</div><div class="rvw-pick" role="radiogroup" aria-label="Your rating"></div>'+
'<label>Your name<input type="text" name="name" autocomplete="name" required></label>'+
'<label>Your business or area (optional)<input type="text" name="role"></label>'+
'<label>Your review<textarea name="text" required placeholder="What was it like working with us?"></textarea></label>'+
'<label class="rvw-ok"><input type="checkbox" name="ok"><span>I’m happy for this review, with my name, to be shown on the website.</span></label>'+
'<input class="rvw-hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">'+
'<button class="btn" type="submit">Send my review</button><div class="rvw-msg" role="status"></div>'+
'<small>We read every review before it goes on the site.</small>';
var pick=f.querySelector('.rvw-pick');
for(var i=5;i>=1;i--){var r=document.createElement('input');r.type='radio';r.name='rating';r.value=i;r.id='rvw-s'+i;var l=el('label',null,'★');l.htmlFor=r.id;l.title=i+' star'+(i>1?'s':'');pick.appendChild(r);pick.appendChild(l)}
var msg=f.querySelector('.rvw-msg');
f.onsubmit=function(e){e.preventDefault();var d=f.elements;msg.className='rvw-msg';
 if(d._honey.value)return;
 var rt=f.querySelector('input[name=rating]:checked');
 if(!rt||!d.name.value.trim()||d.text.value.trim().length<10){msg.className='rvw-msg err';msg.textContent='Please pick your stars, add your name and write a few words.';return}
 if(!d.ok.checked){msg.className='rvw-msg err';msg.textContent='Please tick the box so we can show your review.';return}
 var btn=f.querySelector('button');btn.disabled=true;msg.textContent='Sending…';
 fetch('https://formsubmit.co/ajax/'+email,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({_subject:'New review to approve for '+biz,_captcha:'false',_template:'box',Stars:rt.value,Name:d.name.value,Role:d.role.value,Review:d.text.value,Permission:'Visitor ticked: happy to show this on the site',Status:'NOT LIVE until you say yes'})})
 .then(function(x){return x.json().catch(function(){return {}}).then(function(j){return {ok:x.ok,j:j}})})
 .then(function(o){var m=String((o.j&&o.j.message)||'');var act=/activat/i.test(m);
  if(!(o.ok&&o.j&&String(o.j.success)!=='false')&&!act)throw 0;
  var t=el('div','rvw-thanks');t.appendChild(el('b',null,'Thank you!'));
  t.appendChild(el('span',null,act?'Thanks, we have your review. To be sure it reaches us, please also send it by WhatsApp.':'Your review has been sent. It will appear on the site once we have read it.'));
  if(act)t.appendChild(wa(d,rt.value));
  f.replaceWith(t)})
 .catch(function(){btn.disabled=false;msg.className='rvw-msg err';msg.textContent='Sorry, that didn\u2019t send. You can send it by WhatsApp instead:';if(!msg.nextSibling||!msg.nextSibling.classList||!msg.nextSibling.classList.contains('btn'))msg.after(wa(d,rt.value))})};
wrap.appendChild(f);
if(google){var g=el('div','rvw-google');g.appendChild(el('span',null,'Happy with us? A Google review helps other people find us.'));var a=el('a','btn alt','Review us on Google');a.href=google;a.target='_blank';a.rel='noopener';g.appendChild(a);wrap.appendChild(g)}
root.appendChild(wrap);
})();
