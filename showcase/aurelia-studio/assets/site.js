/* Aurelia demo studio. EDIT THIS BLOCK to rebrand the whole site:
   name, contact details, hours, treatments and prices. Images live in /img (see README.md). */
window.SITE = {
  name: "Aurelia",
  descriptor: "Aesthetic Studio",
  area: "Basingstoke, Hampshire",
  tagline: "Considered skin care in a calm, private studio.",
  // Demo contact details. The WhatsApp number is the Standage Digital demo line, replace with the studio's own.
  whatsapp: "447751435993",
  whatsappText: "Hi, I'd like to ask about a treatment (message from the demo website)",
  instagram: "https://www.instagram.com/",
  instagramHandle: "@yourstudio",
  email: "hello@yourstudio.co.uk",
  phone: "07000 000000",
  address: ["Studio address goes here", "Basingstoke, Hampshire"],
  hours: [["Tuesday","10:00 – 18:00"],["Wednesday","10:00 – 18:00"],["Thursday","10:00 – 20:00"],["Friday","10:00 – 18:00"],["Saturday","09:00 – 15:00"],["Sunday – Monday","Closed"]],
  openDays: [2,3,4,5,6],   // 0 = Sunday. Used by the booking demo calendar
  // Where to anchor each photo when it is cropped to its frame ("x% y%"). Edit when swapping images.
  imgPos: {"hero-portrait.jpg":"72% 40%","hero-detail.jpg":"18% 50%","philosophy-a.jpg":"38% 50%","philosophy-b.jpg":"50% 50%","practitioner.jpg":"50% 30%","about-portrait.jpg":"50% 30%",
    "about-hands.jpg":"62% 50%","about-studio.jpg":"50% 50%","treatment-signature-facial.jpg":"45% 40%","treatment-deep-hydration.jpg":"88% 40%","treatment-dermaplaning.jpg":"40% 40%",
    "treatment-brow-lamination.jpg":"55% 20%","treatment-skin-consultation.jpg":"58% 40%","gallery-01.jpg":"62% 50%","gallery-02.jpg":"72% 40%","gallery-03.jpg":"62% 40%",
    "gallery-04.jpg":"40% 50%","gallery-05.jpg":"50% 50%","gallery-06.jpg":"50% 40%","gallery-09.jpg":"58% 40%","gallery-11.jpg":"20% 50%","gallery-12.jpg":"58% 40%","gallery-08.jpg":"45% 50%"},
  priceNote: "£00",        // shown wherever a real price will go
  treatments: [
    {id:"signature-facial", name:"The Signature Facial", cat:"Face", mins:75, tone:"t-rose",
     blurb:"A full skin consultation, deep cleanse, gentle exfoliation, massage and a nourishing mask. Tailored to your skin on the day.",
     detail:["Skin consultation and cleanse","Gentle exfoliation and massage","Mask chosen for your skin","Finishing care and sun protection"]},
    {id:"deep-hydration", name:"Deep Hydration Facial", cat:"Face", mins:60, tone:"t-pearl",
     blurb:"A comforting, moisture-rich facial for skin that feels dry, tight or tired. Calm, glowing and unhurried.",
     detail:["Cleanse and soothing steam","Layered hydrating serums","Cooling mask and massage","Aftercare advice"]},
    {id:"led-light", name:"LED Light Session", cat:"Face", mins:30, tone:"t-champ",
     blurb:"A relaxing light session on its own or added to any facial. Quiet, comfortable and easy to fit into your day.",
     detail:["Skin cleansed beforehand","Comfortable light session","Hydrating finish"]},
    {id:"dermaplaning", name:"Dermaplaning & Glow", cat:"Face", mins:45, tone:"t-blush",
     blurb:"A gentle exfoliating treatment for the face, with a calming finish.",
     detail:["Consultation and patch check","Gentle surface exfoliation","Calming mask and protection"]},
    {id:"brow-lamination", name:"Brow Lamination & Tint", cat:"Brows & Lashes", mins:60, tone:"t-champ",
     blurb:"Soft, brushed-up, defined brows shaped to suit your face. Includes a tint if you would like one.",
     detail:["Shape and colour consultation","Lamination and tint","Tidy and finish","Aftercare guidance"]},
    {id:"lash-lift", name:"Lash Lift & Tint", cat:"Brows & Lashes", mins:60, tone:"t-rose",
     blurb:"A natural curl and a touch of colour that frames the eyes, with no need for curlers.",
     detail:["Patch test arranged beforehand","Lift and tint","Aftercare guidance"]},
    {id:"skin-consultation", name:"Skin Consultation", cat:"Consultation", mins:30, tone:"t-pearl",
     blurb:"Talk through your skin, your routine and what you would like to feel good about. A calm place to start.",
     detail:["Relaxed conversation","Look at your current routine","A suggested plan, no pressure"]}
  ]
};

(function(){
  const S = window.SITE;
  const $ = (s,r=document)=>r.querySelector(s), $$ = (s,r=document)=>[...r.querySelectorAll(s)];
  let page = "home";
  const wa = "https://wa.me/"+S.whatsapp+"?text="+encodeURIComponent(S.whatsappText);
  const price = t => "From "+S.priceNote;
  const slot = (src,ratio,tone,label,alt,extra="") =>
    `<figure class="slot ${ratio} ${tone} ${extra}" data-src="img/${src}" role="img" aria-label="${alt}"><span class="tag">Image slot · ${label}</span></figure>`;
  window.slotHTML = slot;

  const mark = `<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8c6a38"/><stop offset=".3" stop-color="#e6cf9b"/><stop offset=".55" stop-color="#a98348"/><stop offset=".8" stop-color="#f1e0b4"/><stop offset="1" stop-color="#9c7a45"/></linearGradient></defs>
    <circle cx="24" cy="24" r="22.5" fill="none" stroke="url(#lg)" stroke-width="1"/><circle cx="24" cy="24" r="19" fill="none" stroke="url(#lg)" stroke-width=".5"/>
    <path d="M24 10 L33 36 M24 10 L15 36 M18.5 28 H29.5" fill="none" stroke="url(#lg)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const logo = `<a class="logo" href="#home" aria-label="${S.name} home">${mark}<span><span class="wm">${S.name}</span><span class="ds">${S.descriptor}</span></span></a>`;

  const links = [["#home","Home","home"],["#treatments","Treatments","treatments"],["#about","About","about"],["#gallery","Gallery","gallery"],["#book","Contact","book"]];
  const navHTML = links.map(([h,t,k])=>{
    if(k==="treatments") return `<div class="dd"><a href="${h}" data-k="${k}">${t}</a><div class="dd-menu">${S.treatments.map(x=>`<a href="#t-${x.id}">${x.name}<span>${x.mins} min</span></a>`).join("")}</div></div>`;
    return `<a href="${h}" data-k="${k}">${t}</a>`;
  }).join("");

  const hd = $("#site-header");
  if(hd) hd.innerHTML = `
    <div class="demo-strip"><b>Demonstration website</b> &nbsp;·&nbsp; studio name, images, prices and details are placeholders</div>
    <header class="hdr"><div class="wrap">${logo}<nav class="nav" aria-label="Main">${navHTML}</nav>
    <a class="btn hbtn" href="#book">Book Appointment</a><button class="burger" aria-label="Menu" aria-expanded="false"><i></i><i></i></button></div>
    <nav class="pagebar" aria-label="Pages">${links.map(([h,t,k])=>`<a href="${h}" data-k="${k}">${t}</a>`).join("")}</nav></header>
    <div class="drawer" id="drawer" aria-hidden="true"><div class="top">${logo}<button class="burger" aria-label="Close menu" aria-expanded="true" id="closeDrawer"><i></i><i></i></button></div>
      <a class="big" href="#home">Home</a><a class="big" href="#treatments">Treatments</a>
      <div class="sub">${S.treatments.map(x=>`<a href="#t-${x.id}">${x.name}</a>`).join("")}</div>
      <a class="big" href="#about">About</a><a class="big" href="#gallery">Gallery</a><a class="big" href="#book">Contact</a>
      <a class="btn" href="#book">Book Appointment</a></div>`;

  const ft = $("#site-footer");
  if(ft) ft.innerHTML = `<footer class="ftr"><div class="wrap"><div class="cols">
    <div>${logo}<p class="about">${S.tagline}</p><a class="link" href="${wa}" target="_blank" rel="noopener">WhatsApp us <span class="arr">→</span></a></div>
    <div><h5>Explore</h5><a href="#home">Home</a><a href="#treatments">Treatments</a><a href="#about">About</a><a href="#gallery">Gallery</a><a href="#book">Book &amp; contact</a></div>
    <div><h5>Treatments</h5>${S.treatments.slice(0,5).map(x=>`<a href="#t-${x.id}">${x.name}</a>`).join("")}</div>
    <div><h5>Visit</h5><p class="small" style="margin-bottom:16px">${S.address.join("<br>")}</p><div class="hrs">${S.hours.slice(0,3).map(h=>`<div><span>${h[0]}</span><span>${h[1]}</span></div>`).join("")}</div>
    <a href="${S.instagram}" target="_blank" rel="noopener" style="margin-top:12px">Instagram ${S.instagramHandle}</a></div></div>
    <div class="fine"><span>© ${S.name} ${S.descriptor}. Demonstration website, all details are placeholders.</span><span>Website by <a href="https://standagedigital.co.uk" target="_blank" rel="noopener" style="display:inline;color:var(--rose-deep)">Standage Digital</a>, Basingstoke</span></div></div></footer>`;

  const fab=document.createElement("div"); fab.className="fab"; fab.innerHTML=`<a class="btn" href="#book">Book Appointment</a>`; document.body.appendChild(fab);
  const updFab=()=>fab.classList.toggle("show",scrollY>420&&page!=="book"); addEventListener("scroll",updFab,{passive:true});

  // Mobile drawer
  const dr=$("#drawer"), bg=$(".hdr .burger");
  const setDr=o=>{dr.classList.toggle("open",o);dr.setAttribute("aria-hidden",!o);bg.setAttribute("aria-expanded",o);document.body.style.overflow=o?"hidden":""};
  if(bg){bg.addEventListener("click",()=>setDr(true));$("#closeDrawer").addEventListener("click",()=>setDr(false));addEventListener("keydown",e=>{if(e.key==="Escape")setDr(false)})}

  // Generated blocks
  $$("[data-render=featured]").forEach(el=>{
    el.innerHTML = S.treatments.slice(0,3).map(t=>`<a class="item" href="#t-${t.id}">
      ${slot("treatment-"+t.id+".jpg","ar-34",t.tone,"treatment-"+t.id+".jpg · 3:4 · 1200×1600","Image of "+t.name, "arch")}
      <div class="meta"><span>${t.cat}</span><i></i><span>${t.mins} min</span><i></i><span>${price(t)}</span></div>
      <h3>${t.name}</h3><p style="margin-top:10px">${t.blurb}</p><span class="link">Details <span class="arr">→</span></span></a>`).join("");
  });
  $$("[data-render=treatments]").forEach(el=>{
    const cats=["All",...new Set(S.treatments.map(t=>t.cat))];
    el.innerHTML = `<div class="filters" role="group" aria-label="Filter treatments">${cats.map((c,i)=>`<button class="fbtn" data-c="${c}" aria-pressed="${i===0}">${c}</button>`).join("")}</div>
      <div id="tlist">${S.treatments.map(t=>`<article class="trow" id="${t.id}" data-cat="${t.cat}">
        <div class="slot-wrap">${slot("treatment-"+t.id+".jpg","ar-45",t.tone,"treatment-"+t.id+".jpg · 4:5 · 1200×1500","Image of "+t.name,"arch")}</div>
        <div><span class="cat">${t.cat}</span><h3>${t.name}</h3><p class="desc">${t.blurb}</p>
        <div class="spec"><div><small>Duration</small><b>${t.mins} min</b></div><div><small>Price</small><b>${price(t)}</b></div></div>
        <details class="exp"><summary>What to expect</summary><ul>${t.detail.map(d=>`<li>${d}</li>`).join("")}</ul></details>
        <div class="actions"><a class="btn" href="#book-${t.id}">Book this treatment</a><a class="link" href="${wa}&t=1" target="_blank" rel="noopener" data-ask="${t.name}">Ask a question <span class="arr">→</span></a></div></div></article>`).join("")}</div>`;
    $$("[data-ask]",el).forEach(a=>a.href="https://wa.me/"+S.whatsapp+"?text="+encodeURIComponent("Hi, I have a question about "+a.dataset.ask+" (message from the demo website)"));
    $$(".fbtn",el).forEach(b=>b.addEventListener("click",()=>{
      $$(".fbtn",el).forEach(x=>x.setAttribute("aria-pressed",x===b));
      $$(".trow",el).forEach(r=>r.hidden = !(b.dataset.c==="All"||r.dataset.cat===b.dataset.c));
    }));
  });
  $$("[data-fill=wa]").forEach(a=>{a.href=wa;a.target="_blank";a.rel="noopener"});
  $$("[data-fill=ig]").forEach(a=>{a.href=S.instagram;a.target="_blank";a.rel="noopener"});
  $$("[data-fill=name]").forEach(e=>e.textContent=S.name);

  // Image slots: show real image if the file exists, otherwise the styled placeholder remains
  function hydrate(root){
    $$(".slot[data-src]:not([data-done])",root).forEach(s=>{
      s.dataset.done=1; const im=new Image(); im.alt=""; im.decoding="async"; 
      im.onload=()=>{const k=s.dataset.src.split("/").pop();if(S.imgPos[k])im.style.objectPosition=S.imgPos[k];s.appendChild(im);s.classList.add("loaded")}; im.src=s.dataset.src;
    });
  }
  window.hydrateSlots=hydrate; hydrate(document);

  // Router: one page, five views, hash links (#home #treatments #about #gallery #book, #t-<id>, #book-<id>)
  const ROUTES=["home","treatments","about","gallery","book"];
  $$("#drawer a").forEach(a=>a.addEventListener("click",()=>setDr(false)));
  function route(){
    let h=(location.hash||"#home").slice(1)||"home", v=h, sub="";
    if(h.indexOf("t-")===0){v="treatments";sub=h.slice(2)}else if(h.indexOf("book-")===0){v="book";sub=h.slice(5)}
    if(ROUTES.indexOf(v)<0) v="home";
    page=v;
    $$(".view").forEach(x=>{x.hidden=x.dataset.view!==v;if(!x.hidden){x.classList.remove("in");void x.offsetWidth;x.classList.add("in")}});
    $$(".nav [data-k], .pagebar [data-k]").forEach(a=>a.classList.toggle("on",a.dataset.k===v));
    setDr(false); updFab();
    const on=$(".pagebar a.on"); if(on&&on.scrollIntoView) on.scrollIntoView({inline:"center",block:"nearest"});
    window.dispatchEvent(new CustomEvent("studio:route",{detail:{v:v,sub:sub}}));
    const el=(sub&&v==="treatments")?document.getElementById(sub):null;
    if(el) requestAnimationFrame(()=>el.scrollIntoView({block:"start"})); else window.scrollTo(0,0);
  }
  // Swipe left/right between pages (ignored on rows that scroll sideways and on form fields)
  let tx=0,ty=0,ok=false;
  document.addEventListener("touchstart",e=>{const t=e.touches[0];tx=t.clientX;ty=t.clientY;ok=!e.target.closest(".pagebar,.ribbon,.stepper,.times,.filters,.lb,.cal,input,textarea,select,.drawer")},{passive:true});
  document.addEventListener("touchend",e=>{if(!ok)return;const t=e.changedTouches[0],dx=t.clientX-tx,dy=t.clientY-ty;
    if(Math.abs(dx)>80&&Math.abs(dy)<Math.abs(dx)*.5){const i=ROUTES.indexOf(page),n=i+(dx<0?1:-1);if(n>=0&&n<ROUTES.length)location.hash="#"+ROUTES[n]}},{passive:true});
  addEventListener("hashchange",route); route();
})();
