/* Booking journey: VISUAL DEMONSTRATION ONLY. Nothing is saved, sent or stored. */
(function(){
  const S=window.SITE, root=document.getElementById("booking");
  const $=(s,r=document)=>r.querySelector(s);
  const steps=["Treatment","Date","Time","Details","Done"];
  const st={step:0,t:null,date:null,time:null,month:new Date(new Date().getFullYear(),new Date().getMonth(),1),name:"",email:""};
  const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DOW=["Mo","Tu","We","Th","Fr","Sa","Su"];
  const today=new Date(); today.setHours(0,0,0,0);
  const maxD=new Date(today); maxD.setDate(maxD.getDate()+70);

  // Sample availability only: derived from the date so it looks realistic and stays stable
  const seed=d=>(d.getDate()*7+d.getMonth()*13+d.getDay()*5)%11;
  function times(d){
    const sat=d.getDay()===6, start=sat?9:10, end=sat?15:(d.getDay()===4?20:18), out=[];
    for(let h=start;h<end;h++)for(const m of [0,30]){const i=h*2+m/30;out.push({t:String(h).padStart(2,"0")+":"+(m?"30":"00"),ok:((i+seed(d))%4)!==0})}
    return out.filter((_,i)=>i%1===0).slice(0,14);
  }
  const fmtDate=d=>d.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
  const tr=id=>S.treatments.find(x=>x.id===id);

  function stepper(){return `<div class="stepper" aria-label="Progress">${steps.map((s,i)=>`<span class="${i<st.step?"done":""} ${i===st.step?"cur":""}">${s}</span>`).join("")}</div>`}
  function render(){
    let h=stepper();
    if(st.step===0){
      h+=`<h3>Choose your treatment</h3><p class="sub">Select one to continue.</p><div class="opts">${S.treatments.map(t=>`<button class="opt" data-t="${t.id}" aria-pressed="${st.t===t.id}"><span><b>${t.name}</b><small>${t.mins} min · ${t.cat}</small></span><span class="pr2">Price to be confirmed</span></button>`).join("")}</div>
      <div class="nav-row"><span></span><button class="btn" id="n" ${st.t?"":"disabled style='opacity:.45;pointer-events:none'"}>Choose a date</button></div>`;
    }else if(st.step===1){
      const y=st.month.getFullYear(),m=st.month.getMonth(),first=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate();
      const prevOk=new Date(y,m,0)>=today, nextOk=new Date(y,m+1,1)<=maxD;
      let cells=DOW.map(d=>`<div class="dow">${d}</div>`).join("")+"<span class='blank'></span>".repeat(first);
      for(let d=1;d<=days;d++){const dt=new Date(y,m,d),ok=dt>=today&&dt<=maxD&&S.openDays.includes(dt.getDay());
        cells+=`<button data-d="${y}-${m}-${d}" ${ok?"":"disabled"} aria-pressed="${st.date&&+st.date===+dt}" aria-label="${fmtDate(dt)}">${d}</button>`}
      h+=`<h3>Pick a date</h3><p class="sub">${tr(st.t).name} · ${tr(st.t).mins} min. Closed Sunday and Monday.</p>
      <div class="cal-h"><button id="pm" aria-label="Previous month" ${prevOk?"":"disabled"}>←</button><b>${MONTHS[m]} ${y}</b><button id="nm" aria-label="Next month" ${nextOk?"":"disabled"}>→</button></div><div class="cal">${cells}</div>
      <div class="nav-row"><button class="link" id="b">← Back</button></div>`;
    }else if(st.step===2){
      h+=`<h3>Choose a time</h3><p class="sub">${fmtDate(st.date)}. Sample availability, for demonstration.</p><div class="times">${times(st.date).map(x=>`<button data-tm="${x.t}" ${x.ok?"":"disabled"} aria-pressed="${st.time===x.t}">${x.t}</button>`).join("")}</div>
      <div class="nav-row"><button class="link" id="b">← Back</button><button class="btn" id="n" ${st.time?"":"disabled style='opacity:.45;pointer-events:none'"}>Your details</button></div>`;
    }else if(st.step===3){
      h+=`<h3>Your details</h3><p class="sub">Use made-up details. Nothing leaves this page.</p>
      <div class="two"><div class="fld"><label for="bn">Name</label><input id="bn" autocomplete="off" value="${st.name}" placeholder="Demo customer"></div><div class="fld"><label for="be">Email</label><input id="be" type="email" autocomplete="off" value="${st.email}" placeholder="demo@example.com"></div></div>
      <div class="fld"><label for="bm">Anything we should know? (optional)</label><textarea id="bm" placeholder="Demo note"></textarea></div>
      <div class="sum"><div><span>Treatment</span><b>${tr(st.t).name}</b></div><div><span>When</span><b>${fmtDate(st.date)}, ${st.time}</b></div></div>
      <div class="nav-row"><button class="link" id="b">← Back</button><button class="btn" id="n">Confirm demo booking</button></div>`;
    }else{
      const ref="DEMO-"+(1000+(st.date.getDate()*37+st.time.length*11+st.t.length)%9000);
      h+=`<div class="conf"><div class="tick"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
      <h3>Sample confirmation</h3><p class="sub">${st.name?("Thank you, "+st.name.replace(/[<>&"]/g,"")+". "):""}This is what your confirmation would look like. No appointment has been made.</p>
      <div class="sum"><div><span>Reference</span><b>${ref}</b></div><div><span>Treatment</span><b>${tr(st.t).name}</b></div><div><span>When</span><b>${fmtDate(st.date)}, ${st.time}</b></div><div><span>Where</span><b>${S.address[0]}</b></div></div>
      <div class="nav-row" style="justify-content:center"><button class="btn" id="r">Try again</button><a class="link" href="#home">Back to home <span class="arr">→</span></a></div></div>`;
    }
    root.innerHTML=h;
    root.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{st.t=b.dataset.t;render()});
    root.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{const[y,m,d]=b.dataset.d.split("-").map(Number);st.date=new Date(y,m,d);st.time=null;st.step=2;render()});
    root.querySelectorAll("[data-tm]").forEach(b=>b.onclick=()=>{st.time=b.dataset.tm;render()});
    const n=$("#n",root),b=$("#b",root);
    if(n)n.onclick=()=>{if(st.step===3){st.name=$("#bn",root).value;st.email=$("#be",root).value}st.step++;render()};
    if(b)b.onclick=()=>{if(st.step===3){st.name=$("#bn",root).value;st.email=$("#be",root).value}st.step--;render()};
    const pm=$("#pm",root),nm=$("#nm",root);
    if(pm)pm.onclick=()=>{st.month=new Date(st.month.getFullYear(),st.month.getMonth()-1,1);render()};
    if(nm)nm.onclick=()=>{st.month=new Date(st.month.getFullYear(),st.month.getMonth()+1,1);render()};
    const r=$("#r",root); if(r)r.onclick=()=>{Object.assign(st,{step:0,t:null,date:null,time:null,name:"",email:""});render()};
  }
  const mm=(location.hash||"").match(/^#book-(.+)$/); if(mm&&tr(mm[1])){st.t=mm[1];st.step=1}
  render();
  addEventListener("studio:route",e=>{if(e.detail.v==="book"&&tr(e.detail.sub)){st.t=e.detail.sub;st.step=1;st.date=null;st.time=null;render()}});

  // Sidebar + contact form
  const cl=$("#cl"); if(cl) cl.innerHTML=[["Address",S.address.join(", ")],["Phone",S.phone],["Email",S.email]].map(([a,b])=>`<div class="row"><span>${a}</span><b class="ph-tag">${b}</b></div>`).join("")+S.hours.map(x=>`<div class="row"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
  const ig=$("#igh"); if(ig) ig.textContent=S.instagramHandle;
  const sel=$("#cft"); if(sel) sel.innerHTML=S.treatments.map(t=>`<option>${t.name}</option>`).join("");
  const f=$("#cf"); if(f) f.addEventListener("submit",e=>{e.preventDefault();const t=$("#cft2");t.hidden=false;t.textContent="Demonstration only: your message was not sent and nothing was stored.";f.reset()});
})();
