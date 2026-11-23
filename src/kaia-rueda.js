/* <kaia-rueda> — Rueda estacional KAIA. Sin dependencias.
   Atributos: lat, lon, tz, lugar, controles (muestra el panel de previsualización). */
(() => {
const IMG = /*__IMG__*/{}, LOGO = '/*__LOGO__*/';
const DAY = 864e5, SYN = 29.530588853, rad = Math.PI / 180;
const mod = (a, n) => ((a % n) + n) % n;
const MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const LUNAS = [['ene','Luna del Lobo','Instinto · Comunidad'],['feb','Luna de la Nieve','Purificación · Silencio'],['mar','Luna del Gusano','Despertar · Renovación'],['abr','Luna Rosa','Floración · Apertura'],['may','Luna de las Flores','Expansión · Vitalidad'],['jun','Luna de Fresa','Madurez · Dulzura'],['jul','Luna del Ciervo','Crecimiento · Fuerza'],['ago','Luna del Esturión','Abundancia · Pesca'],['sep','Luna de la Cosecha','Recolección · Gratitud'],['oct','Luna del Cazador','Preparación · Abundancia'],['nov','Luna del Castor','Construcción · Refugio'],['dic','Luna Fría','Descanso · Introspección']];
// [imagen, nombre] en orden horario; la fresa queda al centro de junio
const FRUTOS = [['fresa','Fresa'],['papaya','Papaya y jamaica'],['limon','Limón'],['guanabana','Guanábana'],['hoja','Hojas verdes'],['calabaza','Calabaza y naranja'],['guaya','Frutos verdes'],['raiz','Raíces'],['mandarina','Mandarina'],['citrico','Cítricos'],['yuca','Yuca'],['chaya','Hojas de invierno'],['naranja','Naranja'],['nabo','Nabo'],['rabano','Rábano'],['azahar','Azahar'],['mango','Mango'],['maiz','Maíz']];
const EST = [
 {n:'Primavera',k:'Renovación · Siembra',e:'Equinoccio · 20 mar',m:2,d:20,t:'Crecimiento',c:'#cdd69b',i:'#46601f'},
 {n:'Verano',k:'Expansión · Abundancia',e:'Solsticio · 20–21 jun',m:5,d:21,t:'Cosecha',c:'#f6d27a',i:'#7a4e05'},
 {n:'Otoño',k:'Cosecha · Integración',e:'Equinoccio · 22–23 sep',m:8,d:22,t:'Cuidado',c:'#f2b98a',i:'#8a3f12'},
 {n:'Invierno',k:'Descanso · Regeneración',e:'Solsticio · 21–22 dic',m:11,d:21,t:'Siembra',c:'#c3daf0',i:'#1f4a86'}];
const CLIMA = [{n:'Temporada lluviosa',k:'Mayo – octubre',a:120,b:300,c:'#b5d4f2'},{n:'Temporada seca',k:'Noviembre – abril',a:300,b:480,c:'#f5d7a4'}];
const EVENTOS = [{n:'Transición',k:'Abril – mayo',a:90,b:150,c:'#9cb87a'},{n:'Ciclones',k:'Junio – noviembre',a:150,b:330,c:'#3f7fc4'},{n:'Nortes',k:'Noviembre – febrero',a:300,b:420,c:'#6f7fb5'}];
const FASES = ['Luna nueva','Creciente','Cuarto creciente','Gibosa creciente','Luna llena','Gibosa menguante','Cuarto menguante','Menguante'];
const FULL = {compact:false,rim:790,mes:[646,778],fruto:[566,646],clima:[482,566],luz:[434,482],est:[336,434],luna:[270,336],dia:[206,270],centro:200};
const MINI = {compact:true,rim:794,mes:[634,780],fruto:[546,634],clima:[466,546],luz:null,est:[380,466],luna:null,dia:[310,380],centro:303};

const pt = (r, a) => [r * Math.sin(a * rad), -r * Math.cos(a * rad)].map(v => v.toFixed(2)).join(' ');
const sector = (r0, r1, a, b) => { const l = b - a > 180 ? 1 : 0; return `M${pt(r1,a)}A${r1} ${r1} 0 ${l} 1 ${pt(r1,b)}L${pt(r0,b)}A${r0} ${r0} 0 ${l} 0 ${pt(r0,a)}Z`; };
const CHROMIUM = !!window.chrome || !!navigator.userAgentData;
// Mapa de desplazamiento del tamaño exacto del vidrio (solo Chromium lo refracta)
const lensMap = (im, W, H, e, k) => { const v = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="r"><stop offset="0" stop-color="#f00"/><stop offset="1" stop-color="#000"/></linearGradient><linearGradient id="g" x2="0" y2="1"><stop offset="0" stop-color="#0f0"/><stop offset="1" stop-color="#000"/></linearGradient><filter id="b"><feGaussianBlur stdDeviation="${e*.56}"/></filter></defs><rect width="${W}" height="${H}" fill="#000"/><rect width="${W}" height="${H}" fill="url(#r)"/><rect width="${W}" height="${H}" fill="url(#g)" style="mix-blend-mode:screen"/><rect x="${e}" y="${e}" width="${W-2*e}" height="${H-2*e}" rx="24" fill="#808000" filter="url(#b)"/></svg>`; im.setAttribute('width', W); im.setAttribute('height', H); im.setAttribute('href', 'data:image/svg+xml,' + encodeURIComponent(v)); };
let uid = 0;
const arcText = (r, a, span, txt, cls, size) => { const id = 'k' + (++uid); return `<path id="${id}" d="M${pt(r,a-span/2)}A${r} ${r} 0 ${span>180?1:0} 1 ${pt(r,a+span/2)}" fill="none"/><text class="${cls}" font-size="${size}"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${txt}</textPath></text>`; };
const circ = (r, c) => `<circle r="${r}" class="${c}"/>`;
const lines = (r0, r1, n, off = 0) => { let d = ''; for (let i = 0; i < n; i++) d += `M${pt(r0, off + i*360/n)}L${pt(r1, off + i*360/n)}`; return `<path d="${d}" class="ln"/>`; };
// p: 0 nueva, .5 llena
const phase = (r, p) => { const k = Math.cos(2*Math.PI*p), wax = p < .5, s = wax ? 1 : 0; return `M0 ${-r}A${r} ${r} 0 0 ${s} 0 ${r}A${Math.abs(k*r).toFixed(2)} ${r} 0 0 ${(k > 0) === wax ? 0 : 1} 0 ${-r}Z`; };
const moonSvg = (p, r) => `<circle r="${r}" fill="#2c3a55"/><path d="${phase(r,p)}" fill="#fff3d0"/>`;
const dim = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const yAng = t => { const d = new Date(t); return (d.getUTCMonth() + (d.getUTCDate() - 1 + mod(t, DAY)/DAY) / dim(d.getUTCFullYear(), d.getUTCMonth())) * 30; };
const doy = t => Math.floor((t - Date.UTC(new Date(t).getUTCFullYear(), 0, 1)) / DAY);
const angDate = (m, d) => (m + (d - 1) / dim(2025, m)) * 30;
const hm = h => { const m = Math.round(h * 60); return `${Math.floor(m/60)} h ${String(m%60).padStart(2,'0')} min`; };
const clock = h => { const m = mod(Math.floor(h * 60 + 1e-6), 1440); return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`; };
EST.forEach((e, i) => { e.a = angDate(e.m, e.d); }); EST.forEach((e, i) => { e.b = EST[(i+1)%4].a; if (e.b < e.a) e.b += 360; });
const inside = (o, a) => (a >= o.a && a < o.b) || (a + 360 >= o.a && a + 360 < o.b);

const CSS = `
:host{display:block;--ease-out:cubic-bezier(.23,1,.32,1);--azul:#1c5fa8;container-type:inline-size;font-family:var(--kaia-font,Montserrat,system-ui,sans-serif);color:var(--ink);
 --bg:#b7cfdf;--paper2:rgba(255,255,255,.3);--ink:#11265a;--soft:#253a68;--gold:rgba(255,255,255,.75);--line:rgba(17,38,90,.16);--card:#f3f8fb;--gl:rgba(255,255,255,.2);--hi:rgba(255,255,255,.95);--lo:rgba(255,255,255,.38);--shade:rgba(22,48,96,.24)}
:host([estacion=Primavera]){--bg:#c3d0a6}:host([estacion=Verano]){--bg:#eccb7a}:host([estacion=Otoño]){--bg:#e0a583}:host([estacion=Invierno]){--bg:#b4cde0}
:host([momento=dorado]){--bg:#e58f70}
:host([momento][noche]){--bg:#0b1d45;--paper2:rgba(160,190,255,.07);--ink:#f2f5ff;--soft:#bac8e6;--gold:rgba(214,230,255,.35);--line:rgba(214,230,255,.16);--card:#152449;--gl:rgba(24,50,116,.66);--hi:rgba(220,234,255,.75);--lo:rgba(200,220,255,.13);--shade:rgba(0,4,20,.5)}
*{box-sizing:border-box}
.root{position:relative;overflow:hidden;overflow:clip;background:var(--bg);padding:20px 24px 32px;transition:background-color 1.2s ease,color .7s ease}
.ondas{position:absolute;left:50%;top:50%;width:300%;height:300%;transform:translate(-50%,-50%);pointer-events:none;fill:none;stroke:var(--ink);stroke-width:1.6}
.ondas *{transition:stroke 1.2s ease}
.astro{position:absolute;left:50%;top:50%;width:19%;height:19%;margin:-9.5% 0 0 -9.5%;pointer-events:none;will-change:transform;transition:opacity .9s ease}
.astro svg{width:100%;height:100%;display:block;overflow:visible}.astro .s{fill:#fff3c4;transition:fill 1.2s ease}:host([momento=dorado]) .astro .s{fill:#ffdf8e}
.root>*{z-index:1}.say,.cards{position:relative}

.stage{position:relative;width:100%;max-width:min(940px,calc(100svh - 224px));min-width:min(100%,600px);aspect-ratio:1;margin:0 auto;container-type:inline-size;touch-action:pan-y;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;cursor:grab;border-radius:50%;outline-offset:4px}
.stage.drag{cursor:grabbing}.stage:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid var(--azul);outline-offset:2px}
:host([noche]) :focus-visible{outline-color:#8fc1ff}
.ring{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.ring.spin{will-change:transform}
.ring path,.ring circle,.ring text{transition:fill .7s ease,stroke .7s ease}
.seg{transition:opacity .16s ease!important;opacity:0;fill:var(--azul)}.seg.on{opacity:.17}:host([noche]) .seg.on{fill:#9cc8ff;opacity:.24}
.ring .dd{transition:none}
.thin{fill:none;stroke:var(--gold);stroke-width:1.5}.ln{stroke:var(--line);stroke-width:1.5;fill:none}
.pf,.frt{fill:var(--paper2)}
.disc{position:absolute;border-radius:50%;pointer-events:none}
.disc.g{background:linear-gradient(145deg,rgba(255,255,255,.3),transparent 45%),var(--gl);-webkit-backdrop-filter:blur(9px) saturate(1.25);backdrop-filter:blur(9px) saturate(1.25);transition:background-color .7s ease}
.disc.e{box-shadow:0 .9cqw 2.2cqw var(--shade),0 .15cqw .4cqw var(--shade),inset .16cqw .16cqw .1cqw -.04cqw var(--hi),inset -.12cqw -.12cqw .1cqw -.04cqw var(--hi),inset 0 0 1.4cqw var(--lo)}
.disc.sh{--w:1.5cqw;will-change:rotate;transition:rotate .7s var(--ease-out);background:conic-gradient(from -70deg,transparent,var(--hi) 9%,transparent 22%,transparent 47%,var(--lo) 58%,transparent 70%);-webkit-mask:radial-gradient(closest-side,transparent calc(100% - var(--w)),#000 100%);mask:radial-gradient(closest-side,transparent calc(100% - var(--w)),#000 100%)}
.drop{fill:#fff;fill-opacity:.5;stroke:var(--ink);stroke-opacity:.22;stroke-width:1.5}.drop.on{fill:var(--azul);fill-opacity:.95;stroke-opacity:0}:host([noche]) .drop{fill-opacity:.16;stroke-opacity:.3}:host([noche]) .drop.on{fill:#9cd3ff;fill-opacity:.95}
.ring .drop{transition:fill .5s ease,fill-opacity .5s ease}
.head{will-change:transform;transition:transform .55s var(--ease-out)}.head .h1,.head .h2{fill:#d8432f}.head .h2{opacity:.25}:host([noche]) .head circle{fill:#ffb347}
.rip{position:absolute;inset:0;border-radius:50%;border:.5cqw solid #fff;opacity:0;pointer-events:none}
.agua{position:absolute;left:0;right:0;top:0;height:100%;pointer-events:none;transition:transform 1s linear;transform:translateY(100%)}
.agua.vac{transition:transform 1.1s var(--ease-out)}
.agua svg{position:absolute;left:0;top:-13.8%;width:200%;height:14%;margin:0;fill:#8fd0ff;opacity:.26;animation:ola 5s linear infinite}.agua svg+svg{fill:#fff;opacity:.16;animation-duration:8s;animation-direction:reverse}
.agua i{position:absolute;left:0;right:0;top:0;height:100%;margin:0;background:linear-gradient(rgba(143,208,255,.26),rgba(90,180,245,.06))}
.root.quieta .agua svg{animation-play-state:paused}
@keyframes ola{to{transform:translateX(-50%)}}
.face{z-index:1}
.lens{z-index:3;filter:drop-shadow(0 .6cqw 1cqw var(--shade))}.lens .g0{fill:url(#kg);stroke:var(--hi);stroke-width:3;stroke-linejoin:round}.lens .g1{fill:none;stroke:#fff;stroke-width:7;stroke-linecap:round;opacity:.75}:host([noche]) .lens .g1{opacity:.4}:host([noche]) .lens .g2{stroke:#ffb347}.lens .g2{stroke:#d8432f;stroke-width:9;stroke-linecap:round}
.t{fill:var(--ink)}.b{font-weight:700;letter-spacing:.05em}.m{font-weight:500}.s{fill:var(--soft)}
.tint{opacity:.9;transition:opacity .7s ease}:host([noche]) .tint{opacity:.62}.dk{fill:#11265a}:host([noche]) .dk{fill:#f2f5ff}
.ico.f{border-radius:50%;background:#fffaf0 center/cover;box-shadow:inset 0 0 0 .12cqw rgba(255,255,255,.9),inset .35cqw .45cqw .7cqw rgba(255,255,255,.85),inset -.35cqw -.5cqw .9cqw rgba(30,60,110,.28),0 .5cqw 1.1cqw var(--shade)}
.ico.f::after{content:'';position:absolute;left:16%;top:8%;width:44%;height:26%;border-radius:50%;transform:rotate(-24deg);background:linear-gradient(rgba(255,255,255,.9),rgba(255,255,255,0))}
.ico.m{filter:drop-shadow(0 .4cqw .5cqw var(--shade))}:host([noche]) .ico.f{background-color:#dfe6f4}
.ico{position:absolute;left:50%;top:50%;pointer-events:none;object-fit:contain;will-change:transform}
:host([noche]) .ico.m{filter:drop-shadow(0 0 5px #ffe7b455)}
.ctr{position:absolute;left:50%;top:50%;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle at 50% 108%,#6fc0f5,transparent 46%),radial-gradient(circle at 40% 25%,#2f80d0,#134a90 72%);color:#fff;border:0;box-shadow:0 1cqw 2.6cqw var(--shade),inset .25cqw .25cqw .2cqw -.05cqw #fff,inset -.2cqw -.2cqw .2cqw -.05cqw rgba(255,255,255,.7),inset 0 0 2.6cqw rgba(255,255,255,.4),inset 0 -2cqw 3cqw -1.4cqw rgba(170,225,255,.8);cursor:pointer;overflow:hidden;padding:0;font:inherit;transition:background-color .7s}
:host([noche]) .ctr{background:radial-gradient(circle at 50% 108%,#3f7fd0,transparent 46%),radial-gradient(circle at 40% 25%,#23539b,#0b2150 72%)}
.ctr::before{content:'';position:absolute;left:17%;top:3.5%;width:66%;height:30%;border-radius:50%;background:linear-gradient(rgba(255,255,255,.5),rgba(255,255,255,0) 75%)}
.face{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:9%;transition:opacity .16s var(--ease-out),transform .2s var(--ease-out);line-height:1.12}
.face.off{opacity:0;transform:scale(.96)}
.face svg{fill-rule:evenodd;width:21%;fill:#fff;margin-bottom:3%}.w{font-size:2.9cqw;letter-spacing:.16em;padding-left:.16em}.sl{font-size:1.2cqw;letter-spacing:.16em}
.fd{white-space:nowrap;font-weight:600;font-size:2.7cqw;margin-top:4%;font-variant-numeric:tabular-nums}.fs{font-size:1.6cqw;margin-top:2%;opacity:.92}
.face b{font-size:2.25cqw;line-height:1.05;font-weight:600}.face i{font-style:normal;font-size:1.45cqw;margin-top:4%}.face span.x{font-size:1.4cqw;margin-top:4%;opacity:.95}
.pin{position:absolute;left:50%;top:-.4%;width:4%;transform:translateX(-50%);pointer-events:none;filter:drop-shadow(0 2px 2px #0004);z-index:3}
.say{text-align:center;width:fit-content;max-width:min(46ch,100%);margin:6px auto 0;padding:2px 18px;background:var(--bg);border-radius:18px;transition:background-color 1.2s ease;min-height:2.9em;font-size:15.5px;line-height:1.5;color:var(--soft);text-wrap:balance}.say b{color:var(--ink)}
.cards{display:grid;grid-template-columns:repeat(4,1fr);max-width:900px;margin:40px auto 0;border-radius:26px;background:linear-gradient(160deg,rgba(255,255,255,.22),transparent 45%),var(--gl);-webkit-backdrop-filter:blur(12px) saturate(1.25);backdrop-filter:blur(12px) saturate(1.25);box-shadow:0 12px 34px var(--shade),inset 1.5px 1.5px 1px -.5px var(--hi),inset -1.5px -1.5px 1px -.5px var(--hi)}
.card{padding:14px 18px;border-left:1px solid var(--line);min-width:0}.card:first-child{border-left:0}
.card small{display:block;font-size:13px;line-height:1.4;color:var(--soft)}.card strong{display:block;font-size:18px;line-height:1.3;font-weight:600}
.ctlw{position:sticky;bottom:max(12px,env(safe-area-inset-bottom));z-index:5!important;margin-top:22px;pointer-events:none}
.ctl{--gl:rgba(255,255,255,.34);--well:rgba(17,38,90,.1);--pill:rgba(255,255,255,.72);
 pointer-events:auto;position:relative;isolation:isolate;max-width:940px;margin:0 auto;padding:12px;border-radius:32px;display:grid;grid-template-columns:repeat(24,1fr);gap:8px 10px;font-weight:600;font-size:13.5px;color:var(--ink);
 box-shadow:0 14px 40px var(--shade),0 2px 6px var(--shade)}
:host([noche]) .ctl{--gl:rgba(28,48,104,.42);--well:rgba(255,255,255,.1);--pill:rgba(255,255,255,.24)}
.ctl::before,.ctl::after{content:"";position:absolute;inset:0;border-radius:inherit;z-index:-1;pointer-events:none}
.ctl::before{background:linear-gradient(160deg,rgba(255,255,255,.22),transparent 45%),var(--gl);-webkit-backdrop-filter:blur(12px) saturate(1.3);backdrop-filter:blur(12px) saturate(1.3);transition:background-color .7s ease}
.ctl.lensed::before{backdrop-filter:url(#kaia-lens) blur(5px) saturate(1.3)}
.ctl::after{box-shadow:inset 1.5px 1.5px 1px -.5px var(--hi),inset -1.5px -1.5px 1px -.5px var(--hi),inset 0 0 14px var(--lo),inset 0 -10px 20px -14px var(--hi)}
.seg2.p{grid-column:span 9}.seg2.n{grid-column:span 5}.seg2.e{grid-column:span 10;order:0}.sld{grid-column:span 12;order:1}
.seg2{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:2px;padding:3px;background:var(--well);border-radius:999px;box-shadow:inset 0 1px 3px var(--shade)}
.pz{position:absolute;left:0;top:3px;bottom:3px;width:0;opacity:0;border-radius:999px;background:var(--pill);box-shadow:inset 1px 1px 1px var(--hi),inset -1px -1px 1px var(--lo),0 3px 10px var(--shade);transition:transform .32s cubic-bezier(.32,.72,0,1),width .32s cubic-bezier(.32,.72,0,1),opacity .2s ease;pointer-events:none}
button.c{position:relative;font:inherit;color:inherit;background:none;border:0;border-radius:999px;min-height:44px;min-width:0;padding:0 6px;cursor:pointer;white-space:nowrap;transition:transform .14s var(--ease-out),background-color .2s ease}
button.c:active{transform:scale(.95)}button.c svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;display:block;margin:auto}
@media(hover:hover){button.c:not([aria-pressed=true]):hover{background:var(--lo)}}
.sld{display:grid;grid-template-columns:1fr;align-items:center;gap:4px;padding:0 10px}.sld.f{grid-template-columns:40px 1fr 40px;padding:0}
.lab{display:flex;justify-content:space-between;gap:8px;font-size:13px;line-height:1;font-variant-numeric:tabular-nums}.lab span{font-weight:500}
.in{min-width:0;padding-top:5px}
input{-webkit-appearance:none;appearance:none;display:block;width:100%;height:34px;margin:0;background:none;cursor:pointer;touch-action:pan-y;border-radius:999px}
input::-webkit-slider-runnable-track{height:8px;border-radius:9px;background:linear-gradient(90deg,var(--azul) var(--v,50%),var(--well) var(--v,50%));box-shadow:inset 0 1px 2px var(--shade)}
input::-moz-range-track{height:8px;border-radius:9px;background:var(--well)}input::-moz-range-progress{height:8px;border-radius:9px;background:var(--azul)}
input::-webkit-slider-thumb{-webkit-appearance:none;width:38px;height:26px;margin-top:-9px;border-radius:999px;border:0;background:linear-gradient(160deg,rgba(255,255,255,.95),rgba(255,255,255,.62));box-shadow:inset 0 0 0 1px rgba(255,255,255,.9),inset 0 -3px 6px rgba(28,95,168,.18),0 3px 9px rgba(10,20,50,.35);transition:transform .16s var(--ease-out)}
input::-moz-range-thumb{width:38px;height:26px;border:0;border-radius:999px;background:rgba(255,255,255,.85);box-shadow:0 3px 9px rgba(10,20,50,.35)}
input:active::-webkit-slider-thumb{transform:scale(1.12)}
:host([noche]) .ctl{--azul:#7fb5f2}
.def{position:absolute;width:0;height:0}
@media(prefers-reduced-transparency:reduce){.disc.g,.cards{background:var(--card)!important;backdrop-filter:none!important}.ctl::before{background:var(--card)!important;backdrop-filter:none!important}}
@container (max-width:920px){.ctl>.seg2.p{grid-column:span 15}.ctl>.seg2.n{grid-column:span 9}.ctl>.seg2.e{grid-column:1/-1;order:2}}
@container (max-width:640px){
 .root{padding:12px 0 24px}
 .stage{width:100%;min-width:0;max-width:none}
 .say{padding:0 12px;font-size:13.5px}.cards{grid-template-columns:1fr 1fr;margin-inline:16px}.card{padding:11px 12px}.card:nth-child(odd){border-left:0}.card:nth-child(n+3){border-top:1px solid var(--line)}.card strong{font-size:16px}
 .ctl{margin:0 10px;padding:9px;border-radius:30px;grid-template-columns:1fr;gap:5px;font-size:12.5px}.ctl>.seg2.p,.ctl>.seg2.n,.ctl>.seg2.e,.ctl>.sld{grid-column:1/-1}.ctl>.seg2.e{order:4}button.c{padding:0 2px}}
.stage.mini .w{font-size:5cqw}.stage.mini .sl{display:none}.stage.mini .fd{font-size:5.2cqw}.stage.mini .fs{font-size:3.1cqw}
.stage.mini .face b{font-size:4cqw}.stage.mini .face i{font-size:3.1cqw}.stage.mini .face span.x{display:none}
@media(prefers-reduced-motion:reduce){.agua svg{animation:none!important}*{transition-duration:.01ms!important}}
`;

class KaiaRueda extends HTMLElement {
 connectedCallback() {
  if (this.shadowRoot) { this.start(); return; }
  this.lat = +(this.getAttribute('lat') || 20.63); this.lon = +(this.getAttribute('lon') || -87.08);
  this.tz = this.getAttribute('tz') || 'America/Cancun'; this.lugar = this.getAttribute('lugar') || 'Riviera Maya';
  const s = this.attachShadow({mode:'open'});
  s.innerHTML = `<style>${CSS}</style><section class="root" aria-label="Rueda estacional KAIA">
  
  <div class="stage" tabindex="0" role="slider" aria-label="Rueda del año. Flechas para cambiar de día; Re Pág y Av Pág para cambiar de mes" aria-valuemin="1" aria-valuemax="366"></div>
  <p class="say"></p><div class="cards"></div><div class="ctlw"></div></section>`;
  this.$ = q => s.querySelector(q); this.stage = this.$('.stage');
  this.live = true; this.play = null; this.info = null; this.pinned = false; this.seen = false;
  this.rm = matchMedia('(prefers-reduced-motion:reduce)');
  this.sp = { mes:[-250,0,26], fruto:[200,0,18], clima:[-160,0,34], luz:[130,0,22], est:[-220,0,15], luna:[300,0,12], dia:[-300,0,20] };
  this.t = this.now();
  if (this.hasAttribute('controles')) this.buildCtl();
  this.bind(); this.start();
 }
 disconnectedCallback() { this.ro.disconnect(); this.io.disconnect(); clearTimeout(this.iv); cancelAnimationFrame(this.raf); this.raf = 0; }
 start() {
  this.ro = new ResizeObserver(e => { const w = e[0].contentRect.width; if (!w) return; const L = w < 560 ? MINI : FULL; this.W = w; if (L !== this.L) { this.L = L; this.build(); } else this.place(); this.kick(); });
  this.ro.observe(this.stage);
  this.io = new IntersectionObserver(e => { this.vis = e[0].isIntersecting; this.$('.root').classList.toggle('quieta', !this.vis); if (this.vis) this.beat(); if (this.vis) { this.seen = true; this.kick(); } }, {threshold:.1}); this.io.observe(this.stage);
  this.tick();
 }
 // Un solo temporizador, alineado al cambio de segundo del reloj
 tick() { clearTimeout(this.iv); this.iv = setTimeout(() => { if (this.vis && !document.hidden) { this.beat(); if (this.live) this.set(this.now(), true); } this.tick(); }, 1000 - Date.now() % 1000 + 5); }
 beat() {
  if (!this.drops) return; const n = Math.floor(Date.now()/1000), c = n % 60, jump = this.sec === null || n - this.sec > 2, turn = !jump && c === 0;
  if (this.sec === n) return; this.sec = n;
  this.drops.forEach((d, i) => d.classList.toggle('on', i <= c));
  this.headEl.style.transition = jump ? 'none' : ''; this.headEl.style.transform = `rotate(${n % 3600 * 6}deg)`;
  if (!jump && n % 3600 === 0) this.headEl.style.transition = 'none';
  this.agua.classList.toggle('vac', turn || jump); this.agua.style.transform = `translateY(${(100 - (c/59)*86).toFixed(1)}%)`;
  if (turn && !this.rm.matches) this.$('.rip').animate([{transform:'scale(.25)',opacity:.8},{transform:'scale(2.2)',opacity:0}], {duration:2600,easing:'cubic-bezier(.23,1,.32,1)'});
 }
 now() { const p = {}; for (const x of new Intl.DateTimeFormat('en-US', {timeZone:this.tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}).formatToParts(new Date())) p[x.type] = +x.value;
  const f = Date.UTC(p.year, p.month-1, p.day, p.hour, p.minute, p.second); this.off = Math.round((f - Date.now()) / 6e4) / 60; return f; }
 sun(t) { const g = 2*Math.PI/365*(doy(t)+.5), c = Math.cos, n = Math.sin;
  const dec = .006918-.399912*c(g)+.070257*n(g)-.006758*c(2*g)+.000907*n(2*g)-.002697*c(3*g)+.00148*n(3*g);
  const eot = 229.18*(.000075+.001868*c(g)-.032077*n(g)-.014615*c(2*g)-.040849*n(2*g));
  const f = this.lat*rad, x = Math.max(-1, Math.min(1, (n(-.833*rad)-n(f)*n(dec))/(c(f)*c(dec)))), H = Math.acos(x)/rad/15;
  const noon = 12 + this.off - this.lon/15 - eot/60;
  return {len:2*H, rise:noon-H, set:noon+H, alt:h => Math.asin(n(f)*n(dec)+c(f)*c(dec)*c((h-noon)*15*rad))/rad}; }
 moon(t) { const p = mod((t - this.off*36e5 - Date.UTC(2000,0,6,18,14))/DAY/SYN, 1); return {p, n:FASES[Math.floor(p*8+.5)%8], i:Math.round((1-Math.cos(2*Math.PI*p))*50)}; }
 season(a) { return EST.find(e => inside(e, a)); }

 build() {
  const L = this.L, st = this.stage, C = L.compact; st.classList.toggle('mini', C);
  const svg = (n, h) => `<svg class="ring ${n?'spin':''}" ${n?`data-r="${n}"`:''} viewBox="-832 -832 1664 1664" aria-hidden="true">${h}</svg>`;
  const disc = (r, c) => `<div class="disc ${c}" style="inset:${50-r/16.64}%"></div>`, edge = r => disc(r,'e') + disc(r,'sh');
  let wv = '', wr = 862; for (let i = 0; i < 26; i++) { wv += `<circle r="${wr.toFixed(0)}" opacity="${(.34*(1-i/26)).toFixed(3)}"/>`; wr += 26 + i*3.6; }
  let h = `<svg class="ondas" viewBox="-2496 -2496 4992 4992" aria-hidden="true">${wv}</svg><div class="astro sol"><svg viewBox="-100 -100 200 200"><circle class="s" r="100"/></svg></div><div class="astro lun"><svg viewBox="-100 -100 200 200"></svg></div>` + disc(L.rim,'g') + edge(L.rim);
  // meses
  let m = lines(...L.mes, 12);
  LUNAS.forEach((l, i) => { const a = i*30+15; m += `<path class="seg" data-s="mes${i}" d="${sector(...L.mes,i*30,i*30+30)}"/>`;
   m += C ? arcText(L.mes[1]-40, a, 28, l[0].toUpperCase(), 't b', 42) : arcText(L.mes[1]-34, a-4.4, 20, l[0].toUpperCase(), 't b', 28) + arcText(L.mes[0]+13, a, 29, l[1], 't m', 19.5); });
  h += svg('mes', m);
  let f = `<path class="frt" fill-rule="evenodd" d="${sector(...L.fruto,0,180)}${sector(...L.fruto,180,360)}"/>`;
  FRUTOS.forEach((_, i) => f += `<path class="seg" data-s="fruto${i}" d="${sector(...L.fruto,155+i*20,175+i*20)}"/>`); h += edge(L.fruto[1]) + svg('fruto', f);
  // clima
  const mid = L.clima[0] + (L.clima[1]-L.clima[0])*.23; let c = '<g class="tint">';
  CLIMA.forEach(x => c += `<path d="${sector(mid,L.clima[1],x.a,x.b)}" fill="${x.c}"/>`);
  c += `<path d="${sector(L.clima[0],mid,0,180)}${sector(L.clima[0],mid,180,360)}" fill="#fff" opacity=".4"/>`;
  EVENTOS.forEach(x => c += `<path d="${sector(L.clima[0],mid,x.a,x.b)}" fill="${x.c}" opacity=".7"/>`); c += '</g>';
  CLIMA.forEach((x, i) => { c += `<path class="seg" data-s="clima${i}" d="${sector(mid,L.clima[1],x.a,x.b)}"/>`; for (const o of [-45,45]) c += arcText(mid+(L.clima[1]-mid)*(C?.24:.29), (x.a+x.b)/2+o, 86, x.n.toUpperCase(), 'dk b', C?46:38); });
  EVENTOS.forEach((x, i) => c += `<path class="seg" data-s="ev${i}" d="${sector(L.clima[0],mid,x.a,x.b)}"/>`);
  h += edge(L.clima[1]) + svg('clima', c);
  if (L.luz) { let z = `<path class="pf" d="${sector(...L.luz,0,180)}${sector(...L.luz,180,360)}"/>` + lines(...L.luz,12);
   for (let i = 0; i < 12; i++) z += `<path class="seg" data-s="luz${i}" d="${sector(...L.luz,i*30,i*30+30)}"/>` + arcText(L.luz[0]+17, i*30+15, 28, hm(this.sun(Date.UTC(2025,i,15)).len), 't m', 23); h += svg('luz', z); }
  h += edge(L.est[1]);
  let e = '<g class="tint">' + EST.map(x => `<path d="${sector(...L.est,x.a,x.b)}" fill="${x.c}" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>`).join('') + '</g>';
  EST.forEach((x, i) => { const a = (x.a+x.b)/2; e += `<path class="seg" data-s="est${i}" d="${sector(...L.est,x.a,x.b)}"/>`;
   e += C ? arcText(L.est[0]+27, a, 80, x.n.toUpperCase(), 'dk b', 44) : arcText(L.est[1]-45, a, 80, x.n.toUpperCase(), 'dk b', 37) + arcText(L.est[0]+19, a, 86, x.k, 'dk m', 24); });
  h += svg('est', e);
  if (L.luna) { let u = `<path d="${sector(...L.luna,0,180)}${sector(...L.luna,180,360)}" fill="#0d2150" fill-opacity=".82"/>`; const r = (L.luna[0]+L.luna[1])/2;
   for (let i = 0; i < 24; i++) u += `<g transform="translate(${pt(r,i*15)}) rotate(${i*15})">${moonSvg(i/24, i%6?20:26)}</g>`;
   for (let i = 0; i < 8; i++) u += `<path class="seg" data-s="luna${i}" d="${sector(...L.luna,i*45-22.5,i*45+22.5)}"/>`; h += edge(L.luna[1]) + svg('luna', u); }
  let d = ''; for (let i = 0; i < 144; i++) d += `<path class="dd" d="${sector(...L.dia,i*2.5-.1,i*2.5+2.6)}"/>`;
  const dr = (L.dia[0]+L.dia[1])/2, fs = C?36:30;
  for (let i = 0; i < 24; i++) d += (i%3 ? `<circle r="4" fill="#fff" opacity=".7" transform="translate(${pt(dr,i*15)})"/>` : i === 12 ? `<circle r="${fs*.6}" fill="#fff3b8" stroke="#e09a1d" stroke-width="4" transform="translate(${pt(dr,180)})"/>` : i === 0 ? `<g transform="translate(${pt(dr,0)})">${moonSvg(.2,fs*.6)}</g>` : `<g transform="rotate(${i*15})"><text y="${-dr+fs*.35}" font-size="${fs}" font-weight="700" text-anchor="middle" fill="#fff" stroke="#10224a" stroke-width="5" paint-order="stroke">${i}</text></g>`);
  h += edge(L.dia[1]) + svg('dia', d);
  LUNAS.forEach((l, i) => h += `<img class="ico m" data-i="${i}" alt="" draggable="false" src="${IMG['m_'+l[0]]}">`);
  FRUTOS.forEach((l, i) => h += `<div class="ico f" data-i="${i}" style="background-image:url(${IMG['f_'+l[0]]})"></div>`);
  const RS = 815, svgDrops = svg('gotas', '').replace('data-r="gotas"','').replace('ring spin','ring gotas').replace('></svg>', '>' + Array.from({length:60}, (_, i) => `<circle class="drop" r="${i%5 ? (C?6.5:6) : (C?10:9)}" transform="translate(${pt(RS,i*6)})"/>`).join('') + '</svg>')
   + `<svg class="ring head" viewBox="-832 -832 1664 1664" aria-hidden="true"><circle class="h2" r="${C?24:19}" cy="${-RS}"/><circle class="h1" r="${C?13:11}" cy="${-RS}"/></svg>`;
  const l0 = L.mes[0]+2, l1 = L.rim+14, sector2 = (() => { const q = 14.5, e = 1.6, c = 22; return `M${pt(l1,-q+e)}A${l1} ${l1} 0 0 1 ${pt(l1,q-e)}Q${pt(l1,q)} ${pt(l1-c,q)}L${pt(l0+c,q)}Q${pt(l0,q)} ${pt(l0,q-e*1.25)}A${l0} ${l0} 0 0 0 ${pt(l0,-q+e*1.25)}Q${pt(l0,-q)} ${pt(l0+c,-q)}L${pt(l1-c,-q)}Q${pt(l1,-q)} ${pt(l1,-q+e)}Z`; })();
  h += `<svg class="ring lens" viewBox="-832 -832 1664 1664" aria-hidden="true"><defs><linearGradient id="kg" x1="0" y1="0" x2=".5" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".45" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity=".26"/></linearGradient></defs><path class="g0" d="${sector2}"/><path class="g1" d="M${pt(l1-10,-11.5)}A${l1-10} ${l1-10} 0 0 1 ${pt(l1-10,-3)}"/><path class="g2" d="M0 ${-l1-4}V${-l1+22}"/></svg>
  ${svgDrops}<div class="rip"></div>
  <button class="ctr" aria-label="Volver al resumen" data-c style="width:${L.centro/8.32}%;height:${L.centro/8.32}%"><div class="agua"><i></i><svg viewBox="0 0 400 20" preserveAspectRatio="none"><path d="M0 10Q25 0 50 10T100 10T150 10T200 10T250 10T300 10T350 10T400 10V20H0Z"/></svg><svg viewBox="0 0 400 20" preserveAspectRatio="none"><path d="M0 10Q25 0 50 10T100 10T150 10T200 10T250 10T300 10T350 10T400 10V20H0Z"/></svg></div><div class="face a"><svg viewBox="8 7 76 74"><path d="${LOGO}"/></svg><div class="w">KAIA</div><div class="sl">SEASONAL LIVING</div><div class="fd"></div><div class="fs"></div></div><div class="face inf off"></div></button>`;
  st.innerHTML = h; this.fa = this.$('.face.a'); this.fb = this.$('.face.inf');
  this.rings = [...st.querySelectorAll('[data-r]')]; this.ms = [...st.querySelectorAll('.ico.m')]; this.fsx = [...st.querySelectorAll('.ico.f')]; this.dd = [...st.querySelectorAll('.dd')];
  this.$('.ctr').onclick = () => { this.pinned = false; this.show(null); };
  this.lastDay = null; this.info = null; this.sol = this.$('.sol'); this.lun = this.$('.lun'); this.mp = null; this.drops = [...st.querySelectorAll('.drop')]; this.headEl = this.$('.head'); this.agua = this.$('.agua'); this.sec = null; this.beat(); this.place(); this.update();
 }
 place() { const k = this.W/1664, L = this.L, C = L.compact, sz = (els, w, hh) => els.forEach(x => { x.style.width = w*k+'px'; x.style.height = hh*k+'px'; x.style.marginLeft = -w*k/2+'px'; x.style.marginTop = -hh*k/2+'px'; });
  sz(this.ms, C?90:88, C?90:88); sz(this.fsx, C?80:76, C?80:76); if (this.lun && this.key) this.update(); this.draw(); }
 draw() { const L = this.L, k = this.W/1664, S = this.sp;
  for (const r of this.rings) r.style.transform = `rotate(${S[r.dataset.r][0].toFixed(3)}deg)`;
  const at = (el, r, a) => el.style.transform = `translate3d(${(r*Math.sin(a*rad)*k).toFixed(2)}px,${(-r*Math.cos(a*rad)*k).toFixed(2)}px,0)`;
  const rm = L.compact ? L.mes[0]+51 : L.mes[0]+82, rf = (L.fruto[0]+L.fruto[1])/2;
  this.ms.forEach((x, i) => at(x, rm, i*30+(L.compact?15:21)+S.mes[0])); this.fsx.forEach((x, i) => at(x, rf, 165+i*20+S.fruto[0])); }
 targets() { const u = this.t + (this.play === 'año' ? (this.acc||0)*DAY : 0), y = -yAng(u); return {mes:y,fruto:y,clima:y,luz:y,est:y,luna:-this.moon(u).p*360,dia:-mod(this.t,DAY)/DAY*360}; }
 kick() { if (!this.raf && this.L && this.seen) { this.last = 0; this.raf = requestAnimationFrame(x => this.frame(x)); } }
 frame(ts) {
  this.raf = 0; if (!this.vis || !this.isConnected) return;
  const dt = this.last ? Math.min(.05, (ts - this.last)/1000) : .016; this.last = ts;
  if (this.play) { if (this.play === 'año') { this.acc = (this.acc||0) + dt*365/32; const n = Math.floor(this.acc); this.acc -= n; this.t += n*DAY; } else { this.acc = 0; this.t += dt*DAY/16; } if (!(ts - this.lu < 60)) { this.lu = ts; this.update(); } }
  const T = this.targets(); let busy = !!this.play;
  for (const n in T) { const s = this.sp[n], g = s[0] + mod(T[n]-s[0]+180, 360) - 180;
   if (this.rm.matches || this.dragging === n) { s[0] = g; s[1] = 0; continue; }
   const c = 2*.82*Math.sqrt(s[2]), N = 4; for (let i = 0; i < N; i++) { s[1] += ((g-s[0])*s[2] - c*s[1])*dt/N; s[0] += s[1]*dt/N; }
   if (Math.abs(g-s[0]) < .01 && Math.abs(s[1]) < .02) { s[0] = g; s[1] = 0; } else busy = true; }
  this.draw(); if (busy || this.dragging) this.raf = requestAnimationFrame(x => this.frame(x));
 }
 set(t, live = false) { this.t = t; this.live = live; if (!live) this.play = null; this.update(); this.kick(); }
 update() {
  if (!this.fa) return;
  const t = this.t, d = new Date(t), h = mod(t,DAY)/36e5, sun = this.sun(t), moon = this.moon(t), a = yAng(t), es = this.season(a), alt = sun.alt(h), L = LUNAS[d.getUTCMonth()];
  if (this.hasAttribute('noche') !== alt < -4) this.toggleAttribute('noche', alt < -4); const mo = alt < -4 ? 'noche' : alt < 9 ? 'dorado' : 'dia'; if (mo !== this.mo) { this.mo = mo; this.setAttribute('momento', mo); }
  if (this.es !== es.n) { this.es = es.n; this.setAttribute('estacion', es.n); }
  // Sol y luna recorren su arco real entre salida y puesta
  const arc = (el, f, on) => { const z = Math.PI*(1-f), q = this.W/1664; el.style.transform = `translate3d(${(Math.cos(z)*870*q).toFixed(1)}px,${(120*q-Math.sin(z)*850*q).toFixed(1)}px,0)`; el.style.opacity = on ? 1 : 0; };
  const dayOn = h >= sun.rise-.25 && h <= sun.set+.25; arc(this.sol, (h-sun.rise)/sun.len, dayOn); arc(this.lun, mod(h-sun.set,24)/(24-sun.len), !dayOn);
  const mq = Math.round(moon.p*60)/60; if (mq !== this.mp) { this.mp = mq; this.lun.firstChild.innerHTML = `<circle r="82" fill="#1b3163"/><path d="${phase(82,mq)}" fill="#f6ecd2"/>`; }
  const cl = CLIMA.find(x => inside(x,a)), ev = EVENTOS.filter(x => inside(x,a)), momento = alt < -6 ? 'Noche' : alt < 6 ? (h < 12 ? 'Amanecer' : 'Atardecer') : 'Día';
  const fecha = `${d.getUTCDate()} ${MES[d.getUTCMonth()]}`;
  const put = (e, x) => { if (e.textContent !== x) e.textContent = x; };
  put(this.fa.querySelector('.fd'), this.live ? d.toISOString().slice(11,19) : clock(h));
  put(this.fa.querySelector('.fs'), `${d.getUTCDate()} ${L[0]} · ${es.n}`);
  const fi = Math.floor(mod(a-155,360)/20);
  const key = [doy(t),es.n,moon.n,momento,cl.n,ev.length,fi,d.getUTCFullYear()].join();
  if (key !== this.key) { this.key = key; this.$('.cards').innerHTML = [['Estación',es.n,`${es.k}. Tierra: ${es.t.toLowerCase()}`],['Luna',moon.n,`${moon.i}% iluminada · ${L[1]}`],['Luz en '+this.lugar,hm(sun.len),`Sale ${clock(sun.rise)} · se pone ${clock(sun.set)}`],['Clima',cl.n,ev.length ? ev.map(x=>x.n).join(' y ') : 'Sin fenómeno de temporada']].map(x => `<div class="card"><small></small><strong></strong><small></small></div>`.replace('<small></small>',`<small>${x[0]}</small>`).replace('<strong></strong>',`<strong>${x[1]}</strong>`).replace('<small></small>',`<small>${x[2]}</small>`)).join(''); }
  if (!this.info) this.sayDefault(L, es, fi);
  if (this.lastDay !== doy(t)) { this.lastDay = doy(t); this.dd.forEach((p, i) => { const z = sun.alt(i/6); const f = z > 8 ? '#7fbfea' : z > 2 ? '#f5c56b' : z > -3 ? '#e58a55' : z > -9 ? '#5d5390' : '#1a2d5e'; if (p.f !== f) { p.f = f; p.setAttribute('fill', f); } }); }
  const st = this.stage; st.setAttribute('aria-valuenow', doy(t)+1); st.setAttribute('aria-valuetext', `${fecha}, ${clock(h)}, ${es.n}, ${moon.n}`);
  const D = this.ctl; if (D) { D.dia.value = doy(t); D.hora.value = h*60; D.dia.style.setProperty('--v', (doy(t)/3.64).toFixed(1)+'%'); D.hora.style.setProperty('--v', (h/.24).toFixed(1)+'%'); put(D.ld, `${fecha} ${d.getUTCFullYear()}`); put(D.lh, `${clock(h)} · ${momento}`);
   D.el.querySelectorAll('[data-e]').forEach(b => b.setAttribute('aria-pressed', EST[b.dataset.e] === es)); D.el.querySelectorAll('[data-p]').forEach(b => b.setAttribute('aria-pressed', this.play === b.dataset.p));
   D.el.querySelector('[data-now]').setAttribute('aria-pressed', this.live); D.el.querySelector('[data-n="12"]').setAttribute('aria-pressed', alt >= -4); D.el.querySelector('[data-n="22"]').setAttribute('aria-pressed', alt < -4); this.pz(); }
 }
 sayDefault(L, es, fi) { const x = `<b>${L[1]}.</b> ${L[2]}. En la tierra es tiempo de ${es.t.toLowerCase()}; de temporada: ${FRUTOS[fi][1].toLowerCase()}.`; if (x !== this.sx) { this.sx = x; this.$('.say').innerHTML = x; } }
 hit(ev) {
  const b = this.stage.getBoundingClientRect(), x = (ev.clientX-b.left)/b.width*1664-832, y = (ev.clientY-b.top)/b.height*1664-832, r = Math.hypot(x,y), a = mod(Math.atan2(x,-y)/rad,360), L = this.L;
  for (const n of ['mes','fruto','clima','luz','est','luna','dia']) if (L[n] && r >= L[n][0] && r < L[n][1]) return {n, r, a, l:mod(a-this.sp[n][0],360)};
  if (r >= L.rim && r < 840) return {n:'seg', r, a, l:a};
  return {n:null, a};
 }
 describe(q) {
  const i30 = Math.floor(q.l/30);
  if (q.n === 'mes') { const l = LUNAS[i30]; return {s:'mes'+i30, t:l[1], k:l[2], x:`${MES[i30][0].toUpperCase()+MES[i30].slice(1)} · ${hm(this.sun(Date.UTC(2025,i30,15)).len)} de luz`}; }
  if (q.n === 'fruto') { const i = Math.floor(mod(q.l-155,360)/20), a = mod(165+i*20,360); return {s:'fruto'+i, t:FRUTOS[i][1], k:'Fruto de la tierra', x:`De temporada en ${MES[Math.floor(a/30)]}`}; }
  if (q.n === 'clima') { const mid = this.L.clima[0]+(this.L.clima[1]-this.L.clima[0])*.23; if (q.r < mid) { const i = EVENTOS.findIndex(e => inside(e,q.l)); if (i >= 0) return {s:'ev'+i, t:EVENTOS[i].n, k:EVENTOS[i].k, x:'Clima regional'}; } const i = CLIMA.findIndex(e => inside(e,q.l)); return {s:'clima'+i, t:CLIMA[i].n, k:CLIMA[i].k, x:'Clima regional'}; }
  if (q.n === 'luz') { const u = this.sun(Date.UTC(2025,i30,15)); return {s:'luz'+i30, t:hm(u.len), k:`de luz en ${MES[i30]}`, x:`Sale ${clock(u.rise)} · se pone ${clock(u.set)}`}; }
  if (q.n === 'est') { const e = this.season(q.l); return {s:'est'+EST.indexOf(e), t:e.n, k:e.k, x:`${e.e}. Tierra: ${e.t.toLowerCase()}`}; }
  if (q.n === 'luna') { const i = Math.floor(q.l/45+.5)%8; return {s:'luna'+i, t:FASES[i], k:'Ciclo lunar', x:'Un giro completo cada 29.5 días'}; }
  if (q.n === 'seg') return {s:'seg', t:'Reloj de agua', k:'Cada gota es un segundo', x:'El domo se llena al completar el minuto'};
  if (q.n === 'dia') { const z = this.sun(this.t).alt(q.l/15); return {s:'dia', t:clock(Math.floor(q.l/2.5)/6), k:z > 6 ? 'Luz de día' : z > -6 ? 'Luz dorada' : 'Noche', x:'Anillo de 24 horas'}; }
  return null;
 }
 show(o) {
  if (!o && !this.info) return; if (o && this.info && o.s === this.info.s && o.t === this.info.t) return;
  this.stage.querySelectorAll('.seg.on').forEach(x => x.classList.remove('on')); this.info = o;
  this.fa.classList.toggle('off', !!o); this.fb.classList.toggle('off', !o);
  if (o) { this.stage.querySelector(`[data-s="${o.s}"]`)?.classList.add('on'); this.fb.innerHTML = `<b>${o.t}</b><i>${o.k}</i><span class="x">${o.x}</span>`; this.sx = ''; this.$('.say').innerHTML = `<b>${o.t}.</b> ${o.k}. ${o.x}.`; } else this.update();
 }
 bind() {
  const st = this.stage; let dn = null;
  st.addEventListener('pointerdown', e => { if (e.button || e.target.closest('.ctr')) return; const q = this.hit(e); if (!q.n) return; dn = {x:e.clientX,y:e.clientY,a:q.a,q,id:e.pointerId}; });
  st.addEventListener('pointermove', e => {
   if (!this.L) return; const q = this.hit(e); if (e.pointerType === 'mouse') this.stage.querySelectorAll('.sh').forEach((x, i) => x.style.rotate = `${((mod(q.a+45+180,360)-180)*.3).toFixed(1)}deg`);
   if (dn && e.pointerId === dn.id) {
    if (!this.dragging && dn.q.n !== 'seg' && Math.hypot(e.clientX-dn.x,e.clientY-dn.y) > 7) { st.setPointerCapture(e.pointerId); st.classList.add('drag'); this.dragging = dn.q.n; this.pinned = false; this.show(null); }
    if (this.dragging) { const da = mod(q.a-dn.a+180,360)-180; dn.a = q.a; const per = this.dragging === 'dia' ? DAY : this.dragging === 'luna' ? SYN*DAY : 365.25*DAY; this.set(this.t - da/360*per); }
   } else if (e.pointerType === 'mouse' && !this.pinned) this.show(this.describe(q)); });
  const end = e => { if (!dn || e.pointerId !== dn.id) return; if (!this.dragging && e.type === 'pointerup') { const o = this.describe(this.hit(e)); if (this.pinned && o && this.info && o.s === this.info.s) { this.pinned = false; this.show(null); } else { this.show(o); this.pinned = !!o; } } this.dragging = null; dn = null; st.classList.remove('drag'); this.kick(); };
  st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
  st.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !this.pinned) this.show(null); });
  st.addEventListener('keydown', e => { if (e.target !== st) return; const k = {ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1}[e.key]; if (k) { e.preventDefault(); this.set(this.t + k*DAY); } else if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); this.month(e.key === 'PageUp' ? -1 : 1); } });
 }
 pz(force) { this.ctl && this.ctl.el.querySelectorAll('.seg2').forEach(g => { const b = g.querySelector('[aria-pressed=true]'), i = g.querySelector('.pz'); if (!force && i.b === b) return; i.b = b; i.style.opacity = b ? 1 : 0; if (b) { i.style.width = b.offsetWidth + 'px'; i.style.transform = `translateX(${b.offsetLeft}px)`; } }); }
 month(k) { const d = new Date(this.t), y = d.getUTCFullYear(), m = d.getUTCMonth()+k, last = new Date(Date.UTC(y,m+1,0)).getUTCDate(); this.set(Date.UTC(y,m,Math.min(d.getUTCDate(),last)) + mod(this.t,DAY)); }
 buildCtl() {
  const w = this.$('.ctlw'); w.innerHTML = `<svg class="def" aria-hidden="true"><filter id="kaia-lens" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage result="m" preserveAspectRatio="none"/><feDisplacementMap in="SourceGraphic" in2="m" scale="46" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
  <div class="ctl" role="group" aria-label="Previsualizar cambios">
  <div class="seg2 p"><i class="pz"></i><button class="c" data-now>Ahora</button><button class="c" data-p="día">Ver un día</button><button class="c" data-p="año">Ver un año</button></div>
  <div class="seg2 n"><i class="pz"></i><button class="c" data-n="12">Día</button><button class="c" data-n="22">Noche</button></div>
  <div class="sld f"><button class="c" data-m="-1" aria-label="Mes anterior"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><div class="in"><label class="lab" for="kd"><span>Fecha</span><b class="ld"></b></label><input id="kd" type="range" min="0" max="364" step="1"></div><button class="c" data-m="1" aria-label="Mes siguiente"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div>
  <div class="sld"><div class="in"><label class="lab" for="kh"><span>Hora</span><b class="lh"></b></label><input id="kh" type="range" min="0" max="1439" step="5"></div></div>
  <div class="seg2 e"><i class="pz"></i>${EST.map((e,i)=>`<button class="c" data-e="${i}">${e.n}</button>`).join('')}</div></div>`;
  const gl = w.querySelector('.ctl');
  // Lente: mapa de desplazamiento del tamaño exacto del panel (solo Chromium; el resto usa desenfoque)
  this.gro = new ResizeObserver(() => { const W = gl.offsetWidth, H = gl.offsetHeight; if (!W) return; this.pz(true);
   if (CHROMIUM) { lensMap(w.querySelector('feImage'), W, H, 16); gl.classList.add('lensed'); } });
  this.gro.observe(gl);
  const q = x => w.querySelector(x), D = this.ctl = {el:w,dia:q('#kd'),hora:q('#kh'),ld:q('.ld'),lh:q('.lh')};
  const base = () => Math.floor(this.t/DAY)*DAY, yr = () => new Date(this.t).getUTCFullYear();
  D.dia.oninput = () => this.set(Date.UTC(yr(),0,1) + D.dia.value*DAY + mod(this.t,DAY));
  D.hora.oninput = () => this.set(base() + D.hora.value*6e4);
  w.onclick = e => { const b = e.target.closest('button'); if (!b) return; const o = b.dataset; this.pinned = false; this.show(null);
   if ('now' in o) { this.play = null; this.set(this.now(), true); }
   else if (o.m) this.month(+o.m); else if (o.n) this.set(base() + o.n*36e5);
   else if (o.e) { const s = EST[o.e]; this.set(Date.UTC(yr(),s.m,s.d+1) + mod(this.t,DAY)); }
   else if (o.p) { const on = this.play !== o.p; this.live = false; this.play = on ? o.p : null; this.update(); this.kick(); } };
 }
}
if (!customElements.get('kaia-rueda')) customElements.define('kaia-rueda', KaiaRueda);
})();
