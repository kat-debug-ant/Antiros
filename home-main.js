/* ANTIRŌS — interakce úvodní stránky (hvězdy, planety, mapa, kmeny, košík). */
(()=>{'use strict';
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const formatPrice=n=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(n);
  const cards=[...document.querySelectorAll('.product')];
  const catalog=Object.fromEntries(cards.map(c=>[c.dataset.id,{id:c.dataset.id,name:c.dataset.name,price:Number(c.dataset.price)}]));
  const storageKey='antiros-demo-kosik-v1';
  const sanitizeCart=value=>{const clean={};if(value&&typeof value==='object'&&!Array.isArray(value))for(const [id,n] of Object.entries(value)){if(catalog[id]&&Number.isInteger(n)&&n>0&&n<=99)clean[id]=n;}return clean;};
  let cart={};try{cart=sanitizeCart(JSON.parse(localStorage.getItem(storageKey)||'{}'));}catch(e){cart={};}
  const saveCart=()=>{try{localStorage.setItem(storageKey,JSON.stringify(cart));}catch(e){/* Private browsing may disable storage. */}};
  const els={overlay:document.getElementById('overlay'),drawer:document.getElementById('cartDrawer'),cartItems:document.getElementById('cartItems'),cartTotal:document.getElementById('cartTotal'),count:document.getElementById('cartCount'),checkout:document.getElementById('checkout'),modal:document.getElementById('demoModal'),toast:document.getElementById('toast')};
  let lastFocus=null;let toastTimer;
  const renderCart=()=>{
    const entries=Object.entries(cart);const count=entries.reduce((sum,[,qty])=>sum+qty,0);const total=entries.reduce((sum,[id,qty])=>sum+catalog[id].price*qty,0);
    els.count.textContent=count;els.cartTotal.textContent=formatPrice(total);els.checkout.disabled=!count;
    if(!count){els.cartItems.innerHTML='<div class="empty-cart"><span class="empty-icon">✧</span>Tvůj košík je zatím prázdný.<br>Vyber si kousek Antirōsu.</div>';return;}
    els.cartItems.innerHTML=entries.map(([id,qty])=>{const p=catalog[id];return `<div class="cart-item"><div><h3>${p.name}</h3><p>${formatPrice(p.price)} / kus</p><div class="cart-qty"><button type="button" class="qty-btn" data-qty="${id}" data-change="-1" aria-label="Odebrat jeden kus ${p.name}">−</button><span aria-label="${qty} kusů">${qty}</span><button type="button" class="qty-btn" data-qty="${id}" data-change="1" aria-label="Přidat jeden kus ${p.name}">+</button><button type="button" class="remove-btn" data-remove="${id}">Odebrat</button></div></div><div class="cart-price">${formatPrice(p.price*qty)}</div></div>`;}).join('');
  };
  function notify(message){els.toast.textContent=message;els.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>els.toast.classList.remove('show'),2300);}
  document.querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.add;cart[id]=Math.min(99,(cart[id]||0)+1);saveCart();renderCart();notify('Přidáno do košíku: '+catalog[id].name);}));
  els.cartItems.addEventListener('click',e=>{const q=e.target.closest('[data-qty]'),remove=e.target.closest('[data-remove]');if(q){const id=q.dataset.qty;cart[id]=Math.max(0,Math.min(99,(cart[id]||0)+Number(q.dataset.change)));if(!cart[id])delete cart[id];}else if(remove){delete cart[remove.dataset.remove];}else{return;}saveCart();renderCart();});
  const setOverlay=()=>{els.overlay.hidden=els.drawer.hidden&&els.modal.hidden;document.body.style.overflow=els.overlay.hidden?'':'hidden';};
  const openDrawer=()=>{lastFocus=document.activeElement;els.drawer.hidden=false;setOverlay();document.getElementById('closeCart').focus();};
  const closeDrawer=()=>{els.drawer.hidden=true;setOverlay();if(lastFocus?.focus)lastFocus.focus();};
  const closeModal=()=>{els.modal.hidden=true;setOverlay();document.getElementById('openCart').focus();};
  document.getElementById('openCart').addEventListener('click',openDrawer);
  document.getElementById('closeCart').addEventListener('click',closeDrawer);
  els.checkout.addEventListener('click',()=>{els.drawer.hidden=true;els.modal.hidden=false;setOverlay();document.getElementById('closeModal').focus();});
  document.getElementById('closeModal').addEventListener('click',closeModal);
  els.overlay.addEventListener('click',()=>{if(!els.modal.hidden)closeModal();else if(!els.drawer.hidden)closeDrawer();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!els.modal.hidden)closeModal();else if(!els.drawer.hidden)closeDrawer();}if(e.key==='Tab'){const active=!els.modal.hidden?els.modal:!els.drawer.hidden?els.drawer:null;if(!active)return;const focuses=[...active.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled)')];if(!focuses.length)return;const first=focuses[0],last=focuses[focuses.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));cards.forEach(card=>card.hidden=btn.dataset.filter!=='all'&&card.dataset.category!==btn.dataset.filter);}));
  const menuButton=document.getElementById('menuButton'),mainNav=document.getElementById('mainNav');
  menuButton.addEventListener('click',()=>{const open=mainNav.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Zavřít nabídku':'Otevřít nabídku');});
  mainNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mainNav.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Otevřít nabídku');}));
  renderCart();
  // Animated fantasy starfield background: entirely local, no external rendering libraries.
  const starsCanvas=document.getElementById('starCanvas'),sc=starsCanvas.getContext('2d');let w=0,h=0,stars=[];
  const rand=(a,b)=>a+Math.random()*(b-a);
  function resizeStars(){const ratio=Math.min(devicePixelRatio||1,2);w=window.innerWidth;h=window.innerHeight;starsCanvas.width=Math.round(w*ratio);starsCanvas.height=Math.round(h*ratio);sc.setTransform(ratio,0,0,ratio,0,0);stars=Array.from({length:Math.min(500,Math.round(w*h/2000))},()=>({x:rand(0,w),y:rand(0,h),r:rand(.3,1.35),phase:rand(0,6.28),speed:rand(.16,.78),light:rand(.23,.80)}));}
  function paintStars(t){sc.clearRect(0,0,w,h);for(const s of stars){const flicker=prefersReduced?0.85:(.75+.25*Math.sin(t*s.speed+s.phase));const opacity=s.light*flicker;sc.fillStyle=`rgba(226,226,243,${opacity})`;sc.beginPath();sc.arc(s.x,s.y,s.r,0,Math.PI*2);sc.fill();if(s.r>1.15){sc.strokeStyle=`rgba(222,209,183,${opacity*.22})`;sc.lineWidth=.65;sc.beginPath();sc.moveTo(s.x-3,s.y);sc.lineTo(s.x+3,s.y);sc.moveTo(s.x,s.y-3);sc.lineTo(s.x,s.y+3);sc.stroke();}}}
  // A close binary pair at the common center and nine stylized circumbinary orbits.
  const orbitCanvas=document.getElementById('orbitCanvas'),oc=orbitCanvas.getContext('2d');let ow=0,oh=0,hitPlanets=[];
  const system=[
    {color:'#d9af85',edge:'#8d655b',size:3.7,start:2.9,spd:.24},
    {color:'#b7abd5',edge:'#746e94',size:5.5,start:4.65,spd:.18},
    {color:'#73e5cc',edge:'#1e778a',size:7.7,start:5.90,spd:.145,ant:true},
    {color:'#dc907c',edge:'#8f4b52',size:5.6,start:2.2,spd:.12},
    {color:'#c6a9a0',edge:'#74596e',size:10.5,start:3.9,spd:.095},
    {color:'#90b8cf',edge:'#426983',size:7.5,start:5.1,spd:.077},
    {color:'#c9b9db',edge:'#5c6f9c',size:10,start:1.1,spd:.062},
    {color:'#90d0b6',edge:'#407a79',size:6.4,start:3.1,spd:.051},
    {color:'#c9a083',edge:'#816476',size:8.4,start:5.37,spd:.042}
  ];
  function resizeOrbit(){const r=orbitCanvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);ow=r.width;oh=r.height;orbitCanvas.width=Math.round(ow*d);orbitCanvas.height=Math.round(oh*d);oc.setTransform(d,0,0,d,0,0);}
  function glow(x,y,r,color){const g=oc.createRadialGradient(x,y,0,x,y,r);for(const [n,c] of color)g.addColorStop(n,c);oc.fillStyle=g;oc.beginPath();oc.arc(x,y,r,0,Math.PI*2);oc.fill();}
  function drawSun(x,y,r,primary,t){glow(x,y,r*4,primary?[ [0,'rgba(255,223,165,.28)'],[.25,'rgba(239,139,64,.13)'],[1,'rgba(239,139,64,0)'] ]:[[0,'rgba(182,251,238,.23)'],[.3,'rgba(98,211,213,.11)'],[1,'rgba(98,211,213,0)']]);oc.save();oc.translate(x,y);oc.rotate(t*.11);oc.globalAlpha=.39;oc.strokeStyle=primary?'#fedaa0':'#baffef';oc.lineWidth=.8;for(let k=0;k<10;k++){let a=k*Math.PI/5,inner=r*1.4,outer=r*(1.9+(k%3)*.25);oc.beginPath();oc.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);oc.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);oc.stroke();}oc.restore();const g=oc.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r*1.14);if(primary){g.addColorStop(0,'#fffbe5');g.addColorStop(.3,'#ffedae');g.addColorStop(.69,'#ffbc73');g.addColorStop(1,'rgba(235,112,59,.38)');}else{g.addColorStop(0,'#f2fff2');g.addColorStop(.38,'#d5f4e5');g.addColorStop(.76,'#91c8c3');g.addColorStop(1,'rgba(78,141,153,.4)');}oc.fillStyle=g;oc.beginPath();oc.arc(x,y,r,0,Math.PI*2);oc.fill();}
  function pointFor(r,a,centerX,centerY){const cr=Math.cos(-.19),sr=Math.sin(-.19),x=r*Math.cos(a),y=r*.76*Math.sin(a);return {x:centerX+x*cr-y*sr,y:centerY+x*sr+y*cr};}
  function drawPlanet(p,x,y,scale,t){const r=p.size*scale; if(p.ant)glow(x,y,r*5,[[0,'rgba(73,227,201,.16)'],[.52,'rgba(69,181,181,.05)'],[1,'rgba(69,181,181,0)']]);const g=oc.createRadialGradient(x-r*.37,y-r*.48,r*.08,x,y,r*1.23);g.addColorStop(0,'#f5f0db');g.addColorStop(.13,p.color);g.addColorStop(.68,p.color);g.addColorStop(1,p.edge);oc.fillStyle=g;oc.beginPath();oc.arc(x,y,r,0,Math.PI*2);oc.fill();oc.save();oc.beginPath();oc.arc(x,y,r*.98,0,Math.PI*2);oc.clip();oc.globalAlpha=.16;oc.strokeStyle=p.edge;oc.lineWidth=2*scale;for(let i=0;i<3;i++){oc.beginPath();oc.moveTo(x-r,y-r*.5+i*r*.5);oc.bezierCurveTo(x-r*.3,y-r*.75+i*r*.5,x+r*.25,y-r*.15+i*r*.5,x+r,y-r*.58+i*r*.5);oc.stroke();}oc.restore();if(p.ant){oc.strokeStyle='rgba(152,255,226,.86)';oc.lineWidth=1.1;oc.beginPath();oc.arc(x,y,r+2,0,Math.PI*2);oc.stroke();}}
  function drawOrbit(t){oc.clearRect(0,0,ow,oh);const base=Math.min(ow,oh);const cx=ow*.5,cy=oh*.51;const minR=base*.135,step=base*.0362,scale=base/600;
    // Nebula flecks floating behind the orbits.
    for(let i=0;i<32;i++){const a=i*2.399,rad=(.19+(i%9)*.027)*base;oc.fillStyle=`rgba(197,204,226,${.04+(i%4)*.027})`;oc.beginPath();oc.arc(cx+rad*Math.cos(a),cy+rad*.75*Math.sin(a),(.6+i%3*.3)*scale,0,Math.PI*2);oc.fill();}
    for(let i=8;i>=0;i--){const r=minR+i*step;oc.save();oc.translate(cx,cy);oc.rotate(-.19);oc.beginPath();oc.ellipse(0,0,r,r*.76,0,0,Math.PI*2);oc.strokeStyle=i===2?'rgba(110,223,202,.37)':'rgba(221,197,165,.16)';oc.lineWidth=i===2?1.25:.7;if(i!==2)oc.setLineDash([2,6]);oc.stroke();oc.restore();}
    const phase=prefersReduced?0:t*.16;
    drawSun(cx-Math.cos(phase)*16*scale,cy-Math.sin(phase)*7*scale,22*scale,true,t);
    drawSun(cx+Math.cos(phase)*27*scale,cy+Math.sin(phase)*12*scale,14*scale,false,t);
    hitPlanets=[];
    system.forEach((p,i)=>{const angle=p.start+(prefersReduced?0:t*p.spd);const r=minR+i*step;const loc=pointFor(r,angle,cx,cy);drawPlanet(p,loc.x,loc.y,scale,t);hitPlanets.push({x:loc.x,y:loc.y,r:Math.max(15,p.size*scale+10),index:i});if(p.ant){oc.beginPath();oc.moveTo(loc.x+9*scale,loc.y-7*scale);oc.lineTo(loc.x+37*scale,loc.y-33*scale);oc.lineTo(loc.x+82*scale,loc.y-33*scale);oc.strokeStyle='rgba(123,232,206,.7)';oc.lineWidth=.8;oc.stroke();oc.font=`${Math.max(9,11*scale)}px 'Segoe UI', sans-serif`;oc.fillStyle='#b9f2de';oc.fillText('ANTIRŌS',loc.x+39*scale,loc.y-39*scale);}});
  }
  orbitCanvas.addEventListener('click',event=>{const bounds=orbitCanvas.getBoundingClientRect();const x=event.clientX-bounds.left,y=event.clientY-bounds.top;let selected=null,nearest=1e9;for(const p of hitPlanets){const d=Math.hypot(x-p.x,y-p.y);if(d<p.r&&d<nearest){selected=p.index;nearest=d;}}if(selected!==null){document.getElementById('orbitTip').textContent=selected===2?'Antirōs · třetí planeta':`Dosud nepojmenovaná · planeta ${selected+1}`;}});
  orbitCanvas.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();document.getElementById('orbitTip').textContent='Antirōs · třetí z devíti planet';}});
  resizeStars();resizeOrbit();window.addEventListener('resize',()=>{resizeStars();resizeOrbit();});
  const start=performance.now();let last=0;
  const orbitToggle=document.getElementById('orbitToggle');
  let paused=false,freezeAt=0,pausedSince=0,pausedTotal=0;
  if(prefersReduced){orbitToggle.disabled=true;orbitToggle.textContent='✧ Omezený pohyb';orbitToggle.setAttribute('aria-label','Animace je vypnutá v nastavení zařízení');}
  else orbitToggle.addEventListener('click',()=>{const now=performance.now();if(paused){pausedTotal+=now-pausedSince;paused=false;}else{freezeAt=(now-start-pausedTotal)/1000;pausedSince=now;paused=true;}orbitToggle.setAttribute('aria-pressed',String(paused));orbitToggle.setAttribute('aria-label',paused?'Spustit pohyb hvězdné soustavy':'Pozastavit pohyb hvězdné soustavy');orbitToggle.textContent=paused?'▶ Spustit pohyb':'Ⅱ Zastavit pohyb';});
  function animate(now){if(document.hidden){requestAnimationFrame(animate);return;}if(now-last<30){requestAnimationFrame(animate);return;}last=now;const t=paused?freezeAt:(now-start-pausedTotal)/1000;paintStars(t);drawOrbit(t);if(!prefersReduced)requestAnimationFrame(animate);}
  requestAnimationFrame(animate);
  if(prefersReduced)window.addEventListener('resize',()=>{paintStars(0);drawOrbit(0);});

  // ===== Atlas, encyclopedia and 36 tribe detail pages =====
  const loreBiomes=[{"name": "Şivrűa", "type": "Džungle", "tribes": ["Eshavë", "Noruai", "Tëlyra"], "desc": "Lesy a spleť živých korun, kde Ayru mají srst, netopýří uši, vlčí oči a dlouhý ocas s Kaeli.", "glyph": "🌿", "color": "#8fcda2"}, {"name": "Aqçuarïn", "type": "Oceán", "tribes": ["Meïlë", "Oqîrra", "Uraqo"], "desc": "Podmořský svět, jehož Ayru nesou šupiny, žábry, ploutve a dlouhou ocasní ploutev s Kaeli.", "glyph": "≈", "color": "#82dcdf"}, {"name": "Shaqaar", "type": "Poušť", "tribes": ["Aşurë", "Khevai", "Atąro"], "desc": "Pouštní oblast. Zdejší Ayru mají krátkou tvrdou srst, šakalí uši, liščí oči a krátký ocas s Kaeli.", "glyph": "☀", "color": "#f0c390"}, {"name": "Luravai", "type": "Létající ostrovy", "tribes": ["Påmyrė", "Alqëri", "Awyarai"], "desc": "Krajina zavěšená ve výšinách. Ayru mají peří, křídla, plachticí membrány a dlouhý ocas s Kaeli.", "glyph": "✧", "color": "#cab7f1"}, {"name": "Muruven", "type": "Mokřady", "tribes": ["Evrashi", "Talumo", "Nqavë"], "desc": "Mokřady a bažiny; Ayru zde mají tvrdé šupiny, žábry, ploutve a dlouhé nohy s blánami.", "glyph": "♒", "color": "#8dc6ac"}, {"name": "Vhalmir", "type": "Ledová krajina", "tribes": ["Qirnau", "Sëlyon", "Avrûq"], "desc": "Ledová země. Místní Ayru jsou přizpůsobeni chladu a nesou hustou srst.", "glyph": "❄", "color": "#b5deef"}, {"name": "Møthaña", "type": "Hory", "tribes": ["Ravësh", "Onqari", "Tëlqû"], "desc": "Horský biom. Detailní podoba místních Ayru je zatím v revizi a není schválená.", "glyph": "△", "color": "#b7bed5"}, {"name": "Velrahn", "type": "Jeskyně", "tribes": ["Umorë", "Qeïsha", "Varnu"], "desc": "Jeskynní biom tajemných hlubin. Podrobnosti kultur a místních adaptací se připravují.", "glyph": "◇", "color": "#c2a0df"}, {"name": "Ishvara", "type": "Tropické ostrovy", "tribes": ["Lomai", "Eshqë", "Pavûra"], "desc": "Tropické ostrovy Antirōsu. Podrobnosti kultur a místních adaptací se připravují.", "glyph": "❀", "color": "#88dcbe"}, {"name": "Dravari", "type": "Planiny", "tribes": ["Sëranu", "Wertuû", "Pawmia"], "desc": "Široké planiny Antirōsu. Podrobnosti kultur a místních adaptací se připravují.", "glyph": "✺", "color": "#d4d29a"}, {"name": "Tzhorin", "type": "Vulkanická krajina", "tribes": ["Haoru", "Ishnëq", "Kavûri"], "desc": "Vulkanický biom. Podrobnosti kultur a místních adaptací se připravují.", "glyph": "♨", "color": "#e7aa85"}, {"name": "Veyran", "type": "Větrné stepi", "tribes": ["Savaï", "Përona", "Yarqel"], "desc": "Větrné stepi Antirōsu. Podrobnosti kultur a místních adaptací se připravují.", "glyph": "〰", "color": "#a3cee0"}];
  const loreCreatures=[{"name": "Piluin", "kind": "Posvátný tvor", "status": "Záznam kánonu", "desc": "Roztomilý tvor s modrozelenou srstí a listy, špičatými oušky a dvěma tykadly se zářícími kuličkami. Bez ocasu.", "home": "Şivrűa", "glyph": "✦", "group": "canon"}, {"name": "Džunglový hřebenatý tvor", "kind": "Návrh fauny", "status": "Neschválený koncept", "desc": "Vizuální koncept inspirovaný parasaurolophem, leguánem a kosmanem. Název v Nyvarë zatím není stanoven.", "home": "Şivrűa", "glyph": "❧", "group": "concept"}, {"name": "Noční okřídlený strážce", "kind": "Návrh fauny", "status": "Neschválený koncept", "desc": "Koncept spojení výra a havrana. Přesné proporce, výskyt a jméno čekají na schválení.", "home": "Neurčeno", "glyph": "✺", "group": "concept"}, {"name": "Vodní mnohochapadlovec", "kind": "Návrh fauny", "status": "Neschválený koncept", "desc": "Návrh inspirovaný vydrou, chobotnicí a tučňákem pro vodní prostředí.", "home": "Aqçuarïn", "glyph": "〰", "group": "concept"}, {"name": "Zářící noční plachtař", "kind": "Návrh fauny", "status": "Neschválený koncept", "desc": "Koncept biomu Luravai s prvky harpyje, vakoveverky a kaloně a bioluminiscencí.", "home": "Luravai", "glyph": "✧", "group": "concept"}, {"name": "Pouštní špičatouch", "kind": "Návrh fauny", "status": "Neschválený koncept", "desc": "Koncept inspirovaný fenkem a trnorepem; finální biologická karta zatím nevznikla.", "home": "Shaqaar", "glyph": "☼", "group": "concept"}];
  const tribeEntries=loreBiomes.flatMap((biome,biomeIndex)=>biome.tribes.map((name,index)=>({name,biomeIndex,index})))
  const loreDialog=document.getElementById('loreDialog');
  const loreContent=document.getElementById('loreContent');
  let loreReturn='#biomy';
  let selectedBiome=0;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normal=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs');
  const tribeByName=name=>tribeEntries.find(t=>t.name===name);
  const biomeByName=name=>loreBiomes.findIndex(b=>b.name===name);
  function chooseBiome(index){
    if(!Number.isInteger(index)||index<0||index>=loreBiomes.length)return;
    selectedBiome=index;const b=loreBiomes[index];
    document.getElementById('mapNum').textContent=`BIOM ${String(index+1).padStart(2,'0')} / 12`;
    document.getElementById('mapName').textContent=b.name;
    document.getElementById('mapType').textContent=b.type;
    document.getElementById('mapDescription').textContent=b.desc;
    const tribeBox=document.getElementById('mapTribes');tribeBox.replaceChildren();
    b.tribes.forEach(name=>{const el=document.createElement('button');el.type='button';el.textContent=name;el.addEventListener('click',()=>openLore('kmen',name));tribeBox.append(el)});
    document.querySelectorAll('.map-pin').forEach(pin=>{const active=Number(pin.dataset.biome)===index;pin.classList.toggle('is-active',active);pin.setAttribute('aria-pressed',String(active));});
  }
  document.querySelectorAll('.map-pin').forEach(btn=>btn.addEventListener('click',()=>chooseBiome(Number(btn.dataset.biome))));
  document.querySelectorAll('.biome-card').forEach(btn=>btn.addEventListener('click',()=>openLore('biom',loreBiomes[Number(btn.dataset.biome)].name)));
  document.getElementById('openBiomeDetail').addEventListener('click',()=>openLore('biom',loreBiomes[selectedBiome].name));
  chooseBiome(0);
  // Render and filter 36 canonical tribe names.
  const tribeGrid=document.getElementById('tribesGrid'),tribeSelect=document.getElementById('tribeBiome'),tribeSearch=document.getElementById('tribeSearch');
  loreBiomes.forEach((b,i)=>{const opt=document.createElement('option');opt.value=String(i);opt.textContent=`${b.name} · ${b.type}`;tribeSelect.append(opt)});
  tribeGrid.innerHTML=tribeEntries.map((t,i)=>{const b=loreBiomes[t.biomeIndex];return `<button type="button" class="tribe-card" data-tribe="${esc(t.name)}" style="--tribe-color:${b.color}"><span class="tribe-number">KMEN ${String(i+1).padStart(2,'0')} / 36</span><span class="tribe-glyph" aria-hidden="true">${esc(b.glyph)}</span><strong>${esc(t.name)}</strong><span class="tribe-home">${esc(b.name)} · ${esc(b.type)}</span><span class="tribe-go" aria-hidden="true">↗</span></button>`}).join('');
  tribeGrid.addEventListener('click',e=>{const btn=e.target.closest('[data-tribe]');if(btn)openLore('kmen',btn.dataset.tribe)});
  function filterTribes(){const q=normal(tribeSearch.value.trim());const selected=tribeSelect.value;let visible=0;tribeGrid.querySelectorAll('[data-tribe]').forEach(btn=>{const t=tribeByName(btn.dataset.tribe),b=loreBiomes[t.biomeIndex];const show=(selected==='all'||Number(selected)===t.biomeIndex)&&(!q||normal(`${t.name} ${b.name} ${b.type}`).includes(q));btn.hidden=!show;if(show)visible++});document.getElementById('tribeCount').textContent=`${visible} / 36`;document.getElementById('tribeEmpty').hidden=visible!==0;}
  tribeSearch.addEventListener('input',filterTribes);tribeSelect.addEventListener('change',filterTribes);
  // Creature records: the Piluin is canon; other entries are explicitly unapproved concepts.
  const creatureGrid=document.getElementById('creaturesGrid');
  const creatureColors=['#89e5c4','#9bcaa5','#c6b3ed','#80d3d6','#c4b9ed','#edc39a'];
  creatureGrid.innerHTML=loreCreatures.map((c,i)=>`<button type="button" class="creature-card" data-creature="${i}" data-group="${c.group}" style="--creature-color:${creatureColors[i]};--creature-glow:${creatureColors[i]}50"><span class="creature-art"><span class="creature-stamp">${c.group==='canon'?'Kánon':'Návrh'}</span><span class="creature-symbol" aria-hidden="true">${esc(c.glyph)}</span></span><span class="creature-body"><span class="creature-sub">${esc(c.home)} · ${esc(c.kind)}</span><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p><span class="creature-link">Otevřít záznam ↗</span></span></button>`).join('');
  // Reuse the existing, local SVG illustration of Piluin without loading external assets.
  const origPil=document.querySelector('.product[data-id="piluin"] .product-image svg');
  const pilArt=creatureGrid.querySelector('[data-creature="0"] .creature-art');
  if(origPil&&pilArt){const pic=origPil.cloneNode(true);pic.innerHTML=pic.innerHTML.replaceAll('pilBody','bestPilBody').replaceAll('softGlow','bestSoftGlow');pic.setAttribute('aria-label','Piluin s dvěma tykadly a zářícími kuličkami');const rune=pilArt.querySelector('.creature-symbol');if(rune)rune.replaceWith(pic)}
  creatureGrid.addEventListener('click',e=>{const btn=e.target.closest('[data-creature]');if(btn)openLore('tvor',loreCreatures[Number(btn.dataset.creature)].name)});
  document.querySelectorAll('[data-bestiary]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-bestiary]').forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));creatureGrid.querySelectorAll('[data-group]').forEach(card=>card.hidden=btn.dataset.bestiary!=='all'&&btn.dataset.bestiary!==card.dataset.group)}));
  function loreMarkup(kind,name){
    if(kind==='biom'){
      const i=biomeByName(name);if(i<0)return null;const b=loreBiomes[i];
      return `<div class="lore-rune" aria-hidden="true">${esc(b.glyph)}</div><p class="lore-subtitle">Atlas Antirōsu / biom ${String(i+1).padStart(2,'0')} z 12</p><h2 id="loreTitle">${esc(b.name)}</h2><p class="map-type">${esc(b.type)}</p><p>${esc(b.desc)}</p><h3>Tři místní kmeny</h3><div class="lore-chiprow">${b.tribes.map(n=>`<button type="button" class="lore-chip" data-lore-tribe="${esc(n)}">${esc(n)} ↗</button>`).join('')}</div><div class="lore-note">Poloha na mapě je zatím ilustrativní. Již existující názvy kmenů zůstávají zachované; nová fakta zde nejsou vydávána za schválený kánon.</div>`;
    }
    if(kind==='kmen'){
      const t=tribeByName(name);if(!t)return null;const b=loreBiomes[t.biomeIndex];
      return `<div class="lore-rune" aria-hidden="true">${esc(b.glyph)}</div><p class="lore-subtitle">Kronika Ayru / kmen ${String(tribeEntries.indexOf(t)+1).padStart(2,'0')} z 36</p><h2 id="loreTitle">${esc(t.name)}</h2><p class="map-type">${esc(b.name)} · ${esc(b.type)}</p><p>Kmen <strong>${esc(t.name)}</strong> patří mezi tři kmeny biomu ${esc(b.name)}. Ayru tohoto biomu sdílejí přírodní prostředí a základní biologické adaptace popsané v atlasu.</p><h3>Domovský biom</h3><p>${esc(b.desc)}</p><button class="lore-chip" type="button" data-lore-biome="${esc(b.name)}">Otevřít biom ${esc(b.name)} ↗</button><div class="lore-note">Tento profil je připraven k rozšíření o posvátnou rostlinu, zvíře, totem, barvy, tradice a další ověřené části lore. Nezapsané detaily nejsou domyšleny.</div>`;
    }
    if(kind==='tvor'){
      const c=loreCreatures.find(x=>x.name===name);if(!c)return null;
      return `<div class="lore-rune" aria-hidden="true">${esc(c.glyph)}</div><p class="lore-subtitle">Bestiář / ${c.group==='canon'?'schválený záznam':'pracovní návrh'}</p><h2 id="loreTitle">${esc(c.name)}</h2><p class="map-type">${esc(c.kind)} · ${esc(c.home)}</p><p>${esc(c.desc)}</p><div class="lore-note">${c.group==='canon'?'Tento záznam vychází z potvrzeného vzhledu Piluina.':'Tento tvor je zatím pouze vizuální koncept. Finální jméno v Nyvarë a další údaje ještě nejsou schváleny.'}</div>`;
    }
    return null;
  }
  function openLore(kind,name,fromHash=false){
    const html=loreMarkup(kind,name);if(!html)return;
    loreReturn=kind==='kmen'?'#kmeny':kind==='tvor'?'#bestiar':'#biomy';
    loreContent.innerHTML=html;
    if(!loreDialog.open)loreDialog.showModal();
    loreContent.scrollTop=0;
    if(!fromHash){const key=`${kind}/${encodeURIComponent(name)}`;if(location.hash.slice(1)!==key)history.pushState(null,'',`#${key}`)}
  }
  loreContent.addEventListener('click',e=>{const t=e.target.closest('[data-lore-tribe]'),b=e.target.closest('[data-lore-biome]');if(t)openLore('kmen',t.dataset.loreTribe);else if(b)openLore('biom',b.dataset.loreBiome)});
  document.getElementById('loreClose').addEventListener('click',()=>loreDialog.close());
  loreDialog.addEventListener('click',e=>{if(e.target===loreDialog)loreDialog.close()});
  loreDialog.addEventListener('close',()=>{if(/^(biom|kmen|tvor)\//.test(location.hash.slice(1)))history.replaceState(null,'',loreReturn)});
  function handleDeepLink(){const raw=decodeURIComponent(location.hash.slice(1));const match=raw.match(/^(biom|kmen|tvor)\/(.+)$/);if(match)openLore(match[1],match[2],true);else if(loreDialog.open)loreDialog.close();}
  window.addEventListener('hashchange',handleDeepLink);
  handleDeepLink();

})();
