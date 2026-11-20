"use strict";
/* =========================================================
   HUMAN OR AI? — playable prototype
   All samples (SVG art, prose, synthesized audio) are
   authored locally in this file — no external assets.
   ========================================================= */

/* ---------- deterministic RNG ---------- */
function hashSeed(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shuffledBy(arr,rand){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));const x=a[i];a[i]=a[j];a[j]=x}return a}
function todayKey(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function weekKey(){const d=new Date();const on=new Date(d.getFullYear(),0,1);const wk=Math.ceil((((d-on)/86400000)+on.getDay()+1)/7);return d.getFullYear()+"-W"+wk}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function freq(n){return 440*Math.pow(2,(n-69)/12)}
function NOTE(t,f,d,g){return{t:t,f:f,d:d,g:g}}

/* ---------- SVG media ---------- */
const SVGS={};
SVGS.ai_landscape='<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">'
+'<defs><linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb56b"/><stop offset="1" stop-color="#3b2a72"/></linearGradient></defs>'
+'<rect width="400" height="240" fill="url(#sky1)"/>'
+'<circle cx="200" cy="150" r="42" fill="#ffe9c9"/>'
+'<path d="M0 170 Q60 140 120 172 Q180 150 240 176 Q320 148 400 174 L400 240 L0 240 Z" fill="#241d4a"/>'
+'<path d="M0 195 Q80 172 160 198 Q250 176 330 200 Q370 188 400 198 L400 240 L0 240 Z" fill="#171233"/>'
+'<ellipse cx="90" cy="236" rx="70" ry="9" fill="#0b0920"/>'
+'<ellipse cx="310" cy="238" rx="70" ry="9" fill="#0b0920"/></svg>';
SVGS.ai_cat='<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">'
+'<defs><radialGradient id="g1" cx="0.5" cy="0.35" r="0.9"><stop offset="0" stop-color="#2c2f45"/><stop offset="1" stop-color="#0e1122"/></radialGradient></defs>'
+'<rect width="400" height="240" fill="url(#g1)"/>'
+'<path d="M140 90 L128 42 Q152 56 164 76 Q200 66 236 76 Q248 56 272 42 L260 90 Q282 118 272 152 Q258 190 200 190 Q142 190 128 152 Q118 118 140 90 Z" fill="#57506b"/>'
+'<ellipse cx="166" cy="128" rx="17" ry="21" fill="#8fe4d8"/>'
+'<ellipse cx="234" cy="128" rx="17" ry="21" fill="#8fe4d8"/>'
+'<circle cx="172" cy="131" r="9" fill="#101322"/><circle cx="228" cy="130" r="9" fill="#101322"/>'
+'<circle cx="175" cy="127" r="3" fill="#fff"/><circle cx="225" cy="128" r="2.4" fill="#fff"/>'
+'<path d="M196 150 L200 158 L204 150 Z" fill="#f0a3b3"/>'
+'<path d="M188 150 Q186 156 180 158" stroke="#8fe4d8" stroke-width="2.5" fill="none"/>'
+'<path d="M212 150 Q214 156 220 158" stroke="#8fe4d8" stroke-width="2.5" fill="none"/>'
+'<path d="M188 154 Q180 156 174 149" stroke="#8fe4d8" stroke-width="2.5" fill="none"/>'
+'<path d="M212 154 Q220 156 226 149" stroke="#8fe4d8" stroke-width="2.5" fill="none"/></svg>';
SVGS.ai_logo='<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">'
+'<defs><linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7ac1"/><stop offset="0.5" stop-color="#7c5cff"/><stop offset="1" stop-color="#38e0c8"/></linearGradient>'
+'<linearGradient id="lg2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#38e0c8"/><stop offset="1" stop-color="#ff7ac1"/></linearGradient></defs>'
+'<rect width="400" height="240" fill="#0e1122"/>'
+'<circle cx="200" cy="98" r="58" fill="none" stroke="url(#lg1)" stroke-width="9"/>'
+'<circle cx="200" cy="98" r="40" fill="none" stroke="url(#lg2)" stroke-width="5" stroke-dasharray="10 6"/>'
+'<circle cx="200" cy="98" r="20" fill="url(#lg1)"/>'
+'<polygon points="200,52 209,80 200,88 191,80" fill="url(#lg1)" opacity="0.9"/>'
+'<rect x="118" y="182" width="118" height="11" rx="5.5" fill="url(#lg1)" opacity="0.85"/>'
+'<rect x="128" y="146" width="60" height="11" rx="5.5" fill="url(#lg2)" opacity="0.55"/>'
+'<rect x="252" y="150" width="52" height="7" rx="3.5" fill="#7c5cff66"/></svg>';
SVGS.ai_windows='<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">'
+'<defs><linearGradient id="ws" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a7bd8"/><stop offset="1" stop-color="#1b2350"/></linearGradient></defs>'
+'<rect width="400" height="240" fill="#0d1226"/>'
+'<rect x="40" y="20" width="88" height="220" fill="url(#ws)"/>'
+'<rect x="150" y="20" width="88" height="220" fill="url(#ws)" opacity="0.92"/>'
+'<rect x="260" y="20" width="88" height="220" fill="url(#ws)"/>'
+'<circle cx="350" cy="34" r="11" fill="#fef4d8"/>'
+windowsCol(52,0)+windowsCol(162,1)+windowsCol(272,2)+'</svg>';
function windowsCol(x0,seed){
  let s="";
  for(let r=0;r<7;r++)for(let c=0;c<2;c++){
    const o=(0.55+(((r*2+c+seed)%3))*0.15).toFixed(2);
    s+='<rect x="'+(x0+c*40)+'" y="'+(32+r*30)+'" width="26" height="20" rx="2" fill="#ffd98a" opacity="'+o+'"/>';
  }
  return s;
}
SVGS.human_sketch='<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">'
+'<rect width="400" height="240" fill="#f6f1e5"/>'
+'<path d="M30 175 Q90 128 128 150 Q150 122 185 146 Q230 118 275 150 Q330 132 372 172" fill="none" stroke="#3a3a3a" stroke-width="3" stroke-linecap="round"/>'
+'<path d="M60 190 L102 168 L150 186 L188 172 L240 190 L292 172 L340 188" fill="none" stroke="#3a3a3a" stroke-width="2.6" stroke-linecap="round"/>'
+'<circle cx="316" cy="66" r="26" fill="none" stroke="#3a3a3a" stroke-width="3"/>'
+'<path d="M316 30 L316 44 M316 88 L316 98 M280 66 L294 66 M338 66 L352 66" stroke="#3a3a3a" stroke-width="2.6" stroke-linecap="round"/>'
+'<ellipse cx="318" cy="196" rx="40" ry="4.5" fill="#00000018"/>'
+'<path d="M96 108 q6 -14 20 -8 q2 -14 18 -10" stroke="#4a4a4a" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
+'<text x="96" y="140" font-family="cursive" font-size="17" fill="#4a4a4a" transform="rotate(-3 96 140)">our holiday :)</text></svg>';
SVGS.human_cat='<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">'
+'<rect width="400" height="240" fill="#fdf6ec"/>'
+'<g stroke="#2e2a26" fill="none" stroke-linecap="round">'
+'<path d="M176 96 Q170 58 190 46 Q200 62 197 84" stroke-width="3.4"/>'
+'<path d="M228 92 Q238 52 222 44 Q208 66 210 82" stroke-width="3.4"/>'
+'<path d="M172 100 Q160 138 172 166 Q186 196 202 194 Q226 192 234 164 Q244 138 228 102 Q200 92 172 100 Z" stroke-width="3.6"/></g>'
+'<ellipse cx="188" cy="126" rx="8" ry="11" fill="#2e2a26" transform="rotate(-8 188 126)"/>'
+'<ellipse cx="222" cy="128" rx="8" ry="11" fill="#2e2a26" transform="rotate(10 222 128)"/>'
+'<path d="M200 146 l-4 7 h9 Z" fill="#c56a7a"/>'
+'<path d="M196 152 q-9 3 -16 -2 M210 152 q9 3 16 -2 M197 155 q-7 6 -14 4 M209 155 q7 6 14 4" stroke="#2e2a26" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
+'<path d="M198 196 q6 10 -2 12 M206 196 q-2 12 6 12" stroke="#2e2a26" stroke-width="2.4" fill="none"/>'
+'<text x="70" y="216" font-family="cursive" font-size="15" fill="#6a625a" transform="rotate(2 70 216)">milo, age 4 *</text></svg>';
SVGS.human_logo='<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">'
+'<rect width="400" height="240" fill="#fffdf6"/>'
+'<g stroke="#3a3530" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">'
+'<path d="M178 76 q-16 4 -18 24 q-2 18 12 26 q18 12 40 8 q26 -4 28 -28 q2 -22 -16 -30"/>'
+'<path d="M196 74 q-2 -12 8 -18 M218 74 q2 -10 -6 -16"/>'
+'<path d="M196 96 q-6 10 2 18 q10 8 16 0 q8 -10 -2 -18 q-8 -6 -16 0 Z"/>'
+'<path d="M206 118 l-2 20"/><path d="M172 132 q-10 8 -4 16"/></g>'
+'<g font-family="Georgia, serif">'
+'<text x="196" y="180" text-anchor="middle" font-size="24" font-weight="bold" fill="#3a3530" transform="rotate(-1 196 180)">Mug &amp; Co</text>'
+'<text x="199" y="200" text-anchor="middle" font-size="10" letter-spacing="3" fill="#8a8078" transform="rotate(-1 199 200)">EST. 2011 - LOCALLY ROASTED</text></g></svg>';
SVGS.human_poster='<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">'
+'<rect width="400" height="240" fill="#f3ead9"/>'
+'<rect x="26" y="26" width="348" height="188" fill="none" stroke="#2d2a24" stroke-width="3"/>'
+'<circle cx="120" cy="118" r="44" fill="#d94f30"/>'
+'<circle cx="150" cy="94" r="30" fill="#2d2a24" opacity="0.9"/>'
+'<g font-family="Impact, Arial Black, sans-serif" fill="#2d2a24">'
+'<text x="196" y="86" font-size="30" transform="rotate(-2 196 86)">FILM NIGHT</text>'
+'<text x="196" y="118" font-size="15" font-family="Courier New, monospace" transform="rotate(-2 196 118)">thu 21:00 - hall B</text></g>'
+'<text x="196" y="152" font-size="13" font-family="Georgia, serif" fill="#2d2a24" transform="rotate(-2 196 152)">- tickets at the door, members free -</text>'
+'<text x="34" y="230" font-size="10" font-family="Georgia" fill="#7c746a" transform="rotate(-2 34 230)">hand screen-printed, ink misaligned on purpose</text></svg>';

/* ---------- audio sample data ----------
   human samples: hand-written note events with rubato, dynamics, detune.
   ai samples: programmatic grids with machine-perfect timing and
   uniform dynamics. Play them side by side and the difference is audible. */
function humanFolk(){
  const base=[[0,64,0.5,0.5],[0.62,67,0.42,0.42],[1.15,69,0.55,0.62],[1.92,67,0.4,0.44],[2.35,64,0.6,0.35],[3.15,62,0.5,0.5],[3.72,64,0.9,0.66]];
  return base.map(function(n){return NOTE(n[0],freq(n[1]),n[2],n[3])});
}
function aiArps(){
  const out=[];const sc=[57,60,64,67];
  for(let i=0;i<28;i++){const n=sc[i%4]+12*Math.floor(i/8);out.push(NOTE(i*0.25,freq(n),0.24,0.75))}
  return out;
}
function humanSigh(){
  const base=[[0,72,0.7,0.25],[0.85,71,0.55,0.4],[1.5,69,0.9,0.6],[2.6,67,0.6,0.3],[3.3,69,1.4,0.5],[4.9,68,0.8,0.25],[5.8,69,1.6,0.45]];
  return base.map(function(n){return NOTE(n[0],freq(n[1]),n[2],n[3])});
}
function aiPad(){
  const out=[];const chords=[[45,52,57,61],[43,50,55,59]];
  chords.forEach(function(ch,ci){
    ch.forEach(function(n){out.push(NOTE(ci*4,freq(n),4.0,0.35))});
    ch.forEach(function(n,i){out.push(NOTE(ci*4+i*0.999,freq(n+12),0.98,0.4))});
  });
  return out;
}
function aiVoice(){
  const pitches=[196,196,208,196,175,196];
  const durs=[0.35,0.3,0.45,0.3,0.4,0.7];
  const sent=[];let t=0.4;
  pitches.forEach(function(f,i){sent.push({t:t,f:f,d:durs[i],g:0.5,type:"sawtooth"});t+=durs[i]+0.2});
  return {voice:true,sent:sent,dur:t+0.3};
}
function humanVoice(){
  const sent=[
    {t:0.1,f:170,d:0.3,g:0.4,type:"square"},
    {t:0.52,f:210,d:0.44,g:0.65,type:"square"},
    {t:1.1,f:160,d:0.36,g:0.35,type:"square"},
    {t:1.62,f:225,d:0.58,g:0.6,type:"square"},
  ];
  return {voice:true,sent:sent,dur:2.6};
}

/* ---------- question bank (content + verified answers) ---------- */
const QUESTIONS=[
  {id:"t1",cat:"text",type:"Text - social post",answer:"ai",question:"Who wrote this social post?",
   body:"🚀 Excited to announce that I have completed an incredible journey of growth and learning! This experience has been truly transformative, allowing me to unlock my full potential. 🌟 Grateful for the amazing opportunities ahead. What are YOU excited about? Let's connect! 💡 #growth #mindset #journey",
   explain:"AI tells: stacked buzzwords (transformative, unlock, journey), gratitude that could belong to anyone, an engagement-bait question, one emoji per sentence, and zero concrete detail - no project, no names, no numbers."},
  {id:"t2",cat:"text",type:"Text - message",answer:"human",question:"Who wrote this message?",
   body:"ledo - stuck on the 38, driver just said everyone off at the cathedral stop 😩 be there ~20 late. if you order before I arrive get me the usual + extra croissant, I'll pay you back. don't let them seat us next to the kitchen again",
   explain:"Human tells: a typo (ledo), real-time texture (a bus being cancelled), a shaky time estimate, a callback to a shared memory ('next to the kitchen again'), and no capitalization. LLMs rarely invent grumpy bus drivers."},
  {id:"t3",cat:"text",type:"Text - poem",answer:"ai",question:"Who wrote this poem?",
   body:"The whispers of the autumn breeze,\nDance gently through the golden trees,\nAs twilight paints the evening sky,\nThe world prepares to say goodbye.\n\nIn dreams we find our peaceful rest,\nWithin this world so richly blessed.",
   explain:"AI poetry gives itself away: perfect AABB rhyme, generic nature imagery (whispers, golden trees, twilight), zero personal detail. Human poets usually break rhythm somewhere, or choose an ugly, true detail over a pretty, empty one."},
  {id:"t4",cat:"text",type:"Text - short story",answer:"human",question:"Who wrote this story opening?",
   body:"The rent was due the same week Rosa's bicycle got stolen, which is why she was walking to the interview in her mother's shoes - size 39 on a 37 foot - carrying her CV inside a pizza box because she had run out of anything else that would keep it flat.",
   explain:"A human writer builds stakes from awkward specifics: wrong-sized shoes, a pizza box. AI fiction opens with weather or 'In a world where...' abstractions and resolves too neatly. Messy specific detail is expensive; pattern completion avoids spending it."},
  {id:"t5",cat:"text",type:"Text - review",answer:"ai",question:"Who wrote this product review?",
   body:"I recently purchased this blender and I must say, it has exceeded my expectations! First and foremost, the build quality is exceptional. The blender is powerful, efficient, and easy to clean. Whether you're making smoothies, soups, or sauces, this blender handles it all with ease. Overall, I would highly recommend this product to anyone. Five stars!",
   explain:"AI review structure: 'I recently purchased', 'I must say', 'First and foremost', a marketing-copied feature list, universal claims, and no defect mentioned anywhere. Human reviews overshare: what broke, what it smells like, what the kids think."},
  {id:"t6",cat:"text",type:"Text - email",answer:"human",question:"Who wrote this email?",
   body:"Subject: projector - still on the wall??\n\nHi Anja,\n\nDid anyone unmount the projector from room 2.14? Facilities swore they'd do it Friday. It's Wednesday and I can still see it pointing at my whiteboard like a very expensive reproach.\n\nIf it's yours or your team's, could we get it down before the parent visit on the 14th?\n\nThanks,\nTomas\n\nps. my green marker has disappeared again - if it migrated to your desk, please send it home",
   explain:"Human email texture: impatient subject ending in '??', a real room number and dates, an idiosyncratic joke ('expensive reproach'), and a lowercase afterthought postscript. AI emails are perfectly structured and rarely mourn markers."},
  {id:"t7",cat:"text",type:"Text - article intro",answer:"ai",question:"Who wrote this article introduction?",
   body:"In today's rapidly evolving digital landscape, cybersecurity has become more important than ever before. With the rise of remote work, organizations of all sizes are facing unprecedented challenges in protecting their valuable data. Experts agree that staying ahead of emerging threats is crucial in this ever-changing environment.",
   explain:"Every sentence is an unfalsifiable generality: 'more important than ever', 'unprecedented challenges', 'experts agree'. Real reportage opens with a name, a number, a place. These four sentences could run in any year without edits."},
  {id:"t8",cat:"text",type:"Text - recipe",answer:"human",question:"Who wrote this recipe?",
   body:"ILAYDA'S LENTIL SOUP (the real one, not Kuzey's version)\n\n2 cups red lentils, rinse till water runs clear-ish\n1 onion, chopped however\n1 tbsp tomato paste - more if you're feeling dramatic\n2 tbsp butter. DO NOT use margarine. we have discussed this.\n\nBoil everything 25 min. Blend if you're fancy, chunky if you're honest.\nMom adds a pinch of cumin 'for the soul'. Burnt paprika in butter on top. Bread torn, never cut.\n\nServes 4. Or 2. Depends on the day.",
   explain:"Human: family rivalry embedded in the title, an opinionated margarine warning, vague units ('chopped however'), quoted kitchen wisdom, and a joke serving size. AI recipes are clean, numbered, neutral, and never argue with relatives."},
  {id:"t9",cat:"text",type:"Text - blog intro",answer:"ai",question:"Who wrote this blog introduction?",
   body:"Welcome to our comprehensive guide on sustainable living! In this article, we will delve into the fascinating world of eco-friendly practices and explore ten essential tips that will empower you to make a difference. From energy efficiency to mindful consumption, let's embark on this journey together.",
   explain:"LLM scaffolding: 'Welcome to our comprehensive guide', 'we will delve into', 'embark on this journey together'. 'Delve' is a notorious language-model favorite. No actual tip appears - just a promise of content a human editor would cut."},
  {id:"t10",cat:"text",type:"Text - forum comment",answer:"human",question:"Who wrote this forum comment?",
   body:"been dailying the same mechanical keyboard since 2019 and honestly the spacebar pings now and I love it?? like yes I dropped it down the stairs twice and the keycap economics are absurd but you pry my switches from my cold dead hands. new owners: do NOT lube the stabilizers on day one. or do. I'm not your dad",
   explain:"Human markers: abrupt logic pivots, self-aware contradiction ('or do. I'm not your dad'), niche vocabulary used naturally (stabs, lube, ping), chaotic punctuation and a dropped capital. AI comments are balanced, polite, and end with tidy advice."},
  {id:"t11",cat:"text",type:"Text - cover letter",answer:"ai",question:"Who wrote this cover letter excerpt?",
   body:"I am writing to express my keen interest in the Data Analyst position at your esteemed organization. As a highly motivated and detail-oriented professional, I possess a proven track record of leveraging cutting-edge analytics to drive actionable insights and deliver tangible value. I am confident that my skill set aligns seamlessly with the requirements of this role.",
   explain:"The 'esteemed organization' letter: motivated, detail-oriented, proven track record, drive actionable insights, aligns seamlessly. Not one word about an actual project, tool, or the company itself. Recycling since 1995 - now at machine speed."},
  {id:"t12",cat:"text",type:"Text - diary",answer:"human",question:"Who wrote this diary entry?",
   body:"Day 4, Fez. Got aggressively lost in the medina again. A kid named Yassine walked me all the way to the tannery for no reason except he wanted to practice his Spanish verbs and critique my pronunciation. Smell of the leather pits: exactly as bad as everyone says. Bought a rug I 100% did not need. He opened at 400, I offered 120, we shook hands at 190 and both pretended to be heartbroken.",
   explain:"Human: named strangers, self-deprecation, a haggling scene with feelings on both sides, and knowledge you only get by being there. AI travel prose romanticizes ('the labyrinthine alleys whispered stories') and rarely admits buying something it regrets."},

  {id:"i1",cat:"image",type:"Image - artwork",answer:"ai",svg:"ai_landscape",question:"Who created this artwork?",
   mediaLabel:"Digital artwork - 'Golden Dusk'",
   explain:"Too-perfect: hills recede in unnaturally even bands, the sun sits dead center, reflections are flawlessly mirrored, and the lighting is mathematically clean. Beautiful - and completely free of accident, grain, or the uneven hand an artist leaves behind."},
  {id:"i2",cat:"image",type:"Image - ink drawing",answer:"human",svg:"human_cat",question:"Who created this drawing?",
   mediaLabel:"Ink drawing - found in a sketchbook",
   explain:"Human imprecision: uneven line weight, one ear visibly different from the other, pupils slightly misaligned, a handwritten caption. AI renders both sides almost identical with polished shading everywhere. Imperfection like this is usually authored by hand."},
  {id:"i3",cat:"image",type:"Image - logo concept",answer:"ai",svg:"ai_logo",question:"Who designed this logo?",
   mediaLabel:"Logo concept - untitled brand",
   explain:"AI 'designs' lean on gradients, concentric perfect circles and decorative geometry - then leave pseudo-text behind: rectangles standing in for words at sizes that ignore the layout grid. Real identities need kerning, restraint, and a reason for each shape."},
  {id:"i4",cat:"image",type:"Image - night city",answer:"ai",svg:"ai_windows",question:"Who created this image?",
   mediaLabel:"Photograph - 'Night Windows'",
   explain:"The windows repeat in a perfect mathematical grid; lit rooms are flat glowing cells with no interiors, lamps or furniture. Real buildings show varied curtains and uneven light per floor. Algorithmic repetition with no human variance is a classic generation signature."},
  {id:"i5",cat:"image",type:"Image - cafe logo",answer:"human",svg:"human_logo",question:"Who designed this logo?",
   mediaLabel:"Logo scan - 'Mug & Co'",
   explain:"Human craft cues: a slightly wobbly one-stroke cup, hand-set letters at a small tilt, and slightly irregular letter-spacing on the small line - typesetting done by a person. The concept is simple and legible at any size; AI logos over-decorate and smear small text."},
  {id:"i6",cat:"image",type:"Image - event poster",answer:"human",svg:"human_poster",question:"Who designed this poster?",
   mediaLabel:"Poster - pinned to a noticeboard",
   explain:"Real poster design is full of deliberate compromise: bold shapes that survive cheap printing, mixed typefaces, and hand-adjusted slants in the text lines. The footnote even confesses the crooked ink - work by a person. AI posters overflow with decoration and fake lettering."},
  {id:"i7",cat:"image",type:"Image - pencil sketch",answer:"human",svg:"human_sketch",question:"Who created this drawing?",
   mediaLabel:"Pencil sketch - 'our holiday'",
   explain:"Human tells: trembling partial contour lines, sun rays at uneven lengths, a shadow oval that does not quite fit the landscape, and a casual handwritten caption with a smiley. Compare with AI's smooth, confident, symmetrical strokes and mathematically even shading."},

  {id:"v1",cat:"voice",type:"Voice - narration",answer:"ai",audio:"ai_voice",
   question:"Who is speaking - a person, or a synthetic voice?",
   mediaLabel:"Audio clip - narration sample",
   explain:"Machine tells: every pause between phrases is exactly the same length, pitch sits at one flat level, and each phrase carries identical weight. No breaths, no hurry, no thought mid-sentence. Real speech wobbles, speeds up, hesitates."},
  {id:"v2",cat:"voice",type:"Voice - memo",answer:"human",audio:"human_voice",
   question:"Who recorded this voice message?",
   mediaLabel:"Voice memo - sent from a phone",
   explain:"Human tells: pitch that rises and falls with meaning, uneven phrase lengths, dynamics that swing, and a slightly clipped ending as the speaker cuts off. Synthetic voices are dynamically flat even when their pronunciation is flawless."},

  {id:"m1",cat:"music",type:"Music - melody",answer:"human",audio:"human_folk",
   question:"Who composed this melody?",
   mediaLabel:"Audio - untitled tune",
   explain:"Timing is the evidence: notes arrive early and late with expressive rubato, volume swells on phrase peaks, and pitch drifts slightly - a finger pressing a physical string. Machines quantize to a grid. Liveliness this imperfect is played, not generated."},
  {id:"m2",cat:"music",type:"Music - arpeggio",answer:"ai",audio:"ai_arps",
   question:"Who composed this track?",
   mediaLabel:"Audio - generated composition",
   explain:"Every note is spaced at exactly the same interval, hit at the same volume, cycling perfectly every four notes - a quantized loop with no dynamics, no phrase shape, no breathing. Generative music gets harmony plausible; human expression (timing, dynamics, error) is what it flattens."},
  {id:"m3",cat:"music",type:"Music - slow theme",answer:"human",audio:"human_sigh",
   question:"Who composed this theme?",
   mediaLabel:"Audio - 'for the piano bench'",
   explain:"Long uneven pauses between phrases, notes leaning into each other, dynamics that swell on each repetition. This shape - tension, hesitation, release - comes from someone making choices in the moment, not completing a pattern."},
  {id:"m4",cat:"music",type:"Music - ambience",answer:"ai",audio:"ai_pad",
   question:"Who composed this piece?",
   mediaLabel:"Audio - ambient loop",
   explain:"Chord changes land precisely on 4-second boundaries like a template, and the top line is a metrically locked, evenly spaced arpeggio. Pitch is mathematically exact, with zero drift - while human players waver constantly. Too stable to be human."},
];

function buildAllQ(){
  const audioMap={
    human_folk:{notes:humanFolk(),dur:5.2},
    ai_arps:{notes:aiArps(),dur:7.2},
    human_sigh:{notes:humanSigh(),dur:7.6},
    ai_pad:{notes:aiPad(),dur:8.2},
    ai_voice:aiVoice(),
    human_voice:humanVoice(),
  };
  return QUESTIONS.map(function(q){
    let media=null;
    if(q.svg)media={kind:"svg",body:SVGS[q.svg],label:q.mediaLabel};
    else if(q.audio)media={kind:"audio",body:audioMap[q.audio],label:q.mediaLabel};
    const r={id:q.id,cat:q.cat,type:q.type,answer:q.answer,question:q.question,explain:q.explain,media:media};
    if(q.body)r.body=q.body;
    return r;
  });
}
const ALLQ=buildAllQ();

/* ---------- profile / persistence ---------- */
const LEVELS=[
  {xp:0,name:"Rookie"},{xp:150,name:"Observer"},{xp:400,name:"Pattern Spotter"},
  {xp:800,name:"Skeptic"},{xp:1400,name:"Image Detective"},{xp:2200,name:"Text Detective"},
  {xp:3200,name:"Voice Hunter"},{xp:4500,name:"AI Hunter"},{xp:6000,name:"Turing Solver"},
  {xp:8000,name:"Master of Both Worlds"}
];
const BADGES=[
  {id:"first",icon:"🎬",name:"First session",desc:"Complete 1 game",test:function(p){return p.games>=1}},
  {id:"perfect",icon:"💯",name:"Flawless",desc:"100% in a 10-question round",test:function(p){return p.perfectEver}},
  {id:"streak",icon:"🔥",name:"On fire",desc:"7 correct in a row",test:function(p){return p.longestStreak>=7}},
  {id:"daily5",icon:"📅",name:"Habit",desc:"Finish 5 daily challenges",test:function(p){return p.dailies>=5}},
  {id:"lvl5",icon:"🚀",name:"Level 5",desc:"Reach Level 5",test:function(p){return levelOf(p.xp).n>=5}},
  {id:"score300",icon:"🌟",name:"High scorer",desc:"300+ points in one round",test:function(p){return p.bestRound>=300}},
];
function levelOf(xp){
  let n=1,cur=LEVELS[0],next=LEVELS[1]||null;
  for(let i=0;i<LEVELS.length;i++){if(xp>=LEVELS[i].xp){n=i+1;cur=LEVELS[i];next=LEVELS[i+1]||null}}
  return {n:n,name:cur.name,cur:cur,next:next};
}
function loadP(){
  const base={xp:0,games:0,correct:0,asked:0,longestStreak:0,dailies:0,bestRound:0,perfectEver:false,lastDaily:"",name:"You",dailyScores:{}};
  let saved={};
  try{saved=JSON.parse(localStorage.getItem("hoai_profile")||"{}")}catch(e){}
  const merged=Object.assign(base,saved);
  merged.dailyScores=saved.dailyScores||{};
  return merged;
}
function saveP(){localStorage.setItem("hoai_profile",JSON.stringify(P))}
let P=loadP();

/* ---------- UI plumbing ---------- */
function show(id){
  document.querySelectorAll(".screen").forEach(function(s){s.classList.remove("active")});
  document.getElementById(id).classList.add("active");
  window.scrollTo(0,0);
  if(id==="sc-lb")renderLB("daily");
}
function toast(msg){
  const t=document.getElementById("toast");
  t.textContent=msg;t.style.display="block";
  clearTimeout(t._tid);t._tid=setTimeout(function(){t.style.display="none"},2000);
}
function renderHome(){
  const l=levelOf(P.xp);
  document.getElementById("h-lvl").textContent="Lv "+l.n;
  let pct=100;
  if(l.next)pct=Math.min(100,Math.round(100*(P.xp-l.cur.xp)/(l.next.xp-l.cur.xp)));
  document.getElementById("h-xp").style.width=pct+"%";
  document.getElementById("daily-done").style.display=P.lastDaily===todayKey()?"":"none";
  document.getElementById("s-acc").textContent=P.asked?Math.round(100*P.correct/P.asked)+"%":"—";
  document.getElementById("s-streak").textContent="🔥 "+P.longestStreak;
  document.getElementById("s-games").textContent=P.games;
}
function showProfile(){renderProfile();show("sc-profile")}
function renderProfile(){
  const l=levelOf(P.xp);
  document.getElementById("p-lvl").textContent="Level "+l.n+" · "+l.name;
  const lo=l.cur.xp,hi=l.next?l.next.xp:l.cur.xp+1;
  document.getElementById("p-xptxt").textContent=P.xp.toLocaleString()+" / "+(l.next?hi.toLocaleString()+" XP":"MAX LEVEL");
  document.getElementById("p-xp").style.width=(l.next?Math.min(100,100*(P.xp-lo)/(hi-lo)):100)+"%";
  document.getElementById("p-correct").textContent=P.correct;
  document.getElementById("p-acc").textContent=P.asked?Math.round(100*P.correct/P.asked)+"%":"—";
  document.getElementById("p-streak").textContent="🔥 "+P.longestStreak;
  document.getElementById("p-dailies").textContent=P.dailies;
  document.getElementById("p-badges").innerHTML=BADGES.map(function(b){
    const got=b.test(P);
    return '<div class="bdg'+(got?"":" off")+'"><div class="bi">'+b.icon+'</div><div class="bn">'+b.name+'<br><span class="xs">'+(got?b.desc:"🔒 "+b.desc)+'</span></div></div>';
  }).join("");
}
function resetAll(){
  if(confirm("Delete all local progress?")){
    localStorage.removeItem("hoai_profile");
    P=loadP();saveP();renderProfile();renderHome();toast("Progress reset.");
  }
}

/* ---------- session engine ---------- */
let S=null;
function pickDailySet(){
  const rand=mulberry32(hashSeed("daily-"+todayKey()));
  return shuffledBy(ALLQ,rand).slice(0,10);
}
function startDaily(){startGame({mode:"daily"})}
function startTimeAttack(){startGame({mode:"attack"})}
function startGame(opts){
  stopTimers();stopSample();
  const rand=mulberry32(hashSeed("s-"+todayKey()+"-"+Date.now()));
  let list;
  if(opts.mode==="daily")list=pickDailySet();
  else if(opts.mode==="challenge")list=pickChallengeSet(opts.challenge);
  else if(opts.mode==="attack")list=shuffledBy(ALLQ,rand);
  else if(opts.mode==="mixed")list=shuffledBy(ALLQ,rand).slice(0,10);
  else{
    const pool=ALLQ.filter(function(q){return q.cat===opts.category});
    list=shuffledBy(pool,rand).slice(0,10);
    while(list.length<10)list=list.concat(shuffledBy(pool,rand)).slice(0,10);
  }
  S={mode:opts.mode,category:opts.category||null,challenge:opts.challenge||null,
     qi:-1,list:list,score:0,streak:0,bestStreak:0,correct:0,answeredCount:0,
     answered:false,taTime:60,taTimer:null,qTimer:null,autoTO:null,time:20,finished:false};
  document.getElementById("ta-bar").style.display=opts.mode==="attack"?"":"none";
  document.getElementById("g-score").textContent="🏆 0";
  show("sc-game");
  if(opts.mode==="attack"){
    S.taTimer=setInterval(function(){
      S.taTime--;
      updateTA();
      if(S.taTime<=0)endGame(true);
    },1000);
    updateTA();
  }
  nextQuestion();
}
function updateTA(){
  const f=document.getElementById("ta-fill");
  if(!f)return;
  f.style.width=Math.max(0,100*S.taTime/60)+"%";
  f.classList.toggle("low",S.taTime<=15);
}
function stopTimers(){
  if(S){
    if(S.taTimer)clearInterval(S.taTimer);
    if(S.qTimer)clearInterval(S.qTimer);
    if(S.autoTO)clearTimeout(S.autoTO);
  }
}
function nextQuestion(){
  stopSample();
  if(!S||S.finished)return;
  if(S.mode!=="attack"){
    S.qi++;
    if(S.qi>=S.list.length){endGame(false);return}
  }else{
    S.qi++;
    if(S.qi>=S.list.length)S.list=S.list.concat(shuffledBy(ALLQ,mulberry32(Date.now()>>>0)));
  }
  const q=S.list[S.qi];
  S.answered=false;
  if(S.mode==="attack"){
    document.getElementById("g-num").textContent="⚡ "+S.qi+" seen";
    document.getElementById("g-prog").style.width="0%";
  }else{
    document.getElementById("g-num").innerHTML="Question <b>"+String(S.qi+1).padStart(2,"0")+"</b> / "+S.list.length;
    document.getElementById("g-prog").style.width=(100*S.qi/S.list.length)+"%";
  }
  document.getElementById("g-cat").textContent=q.type;
  document.getElementById("g-question").textContent=q.question;

  const box=document.getElementById("g-content");
  if(q.media&&q.media.kind==="svg"){
    box.innerHTML='<div class="media">'+q.media.body+'</div><div class="imgcap">'+esc(q.media.label)+'</div>';
  }else if(q.media&&q.media.kind==="audio"){
    box.innerHTML='<div class="audiobox"><button class="playbtn" id="playb">▶</button><div class="replayhint">Tap play - listen as many times as you like</div></div>';
    const b=document.getElementById("playb");
    b.onclick=function(){
      if(b.classList.contains("playing")){stopSample();return}
      playSample(q.media.body,function(){b.textContent="▶";b.classList.remove("playing")});
      b.textContent="❚❚";b.classList.add("playing");
    };
  }else{
    box.innerHTML='<div class="textbody">'+esc(q.body)+'</div>';
  }
  document.getElementById("g-answers").style.display="";
  document.getElementById("btn-human").disabled=false;
  document.getElementById("btn-ai").disabled=false;
  document.getElementById("g-fb").classList.remove("show");
  document.getElementById("g-score").textContent="🏆 "+S.score;

  if(S.mode!=="attack"){
    S.time=20;
    document.getElementById("g-time").textContent=S.time;
    document.getElementById("g-timerwrap").style.display="";
    document.getElementById("g-timerwrap").classList.remove("low");
    clearInterval(S.qTimer);
    S.qTimer=setInterval(function(){
      S.time--;
      document.getElementById("g-time").textContent=S.time;
      if(S.time<=5)document.getElementById("g-timerwrap").classList.add("low");
      if(S.time<=0){clearInterval(S.qTimer);answerTimeout()}
    },1000);
  }else{
    document.getElementById("g-timerwrap").style.display="none";
  }
}

/* ---------- audio playback ---------- */
let ac=null,lastStop=null;
function stopSample(){if(lastStop){lastStop();lastStop=null}}
function playSample(body,onend){
  stopSample();
  if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();
  if(ac.state==="suspended")ac.resume();
  const master=ac.createGain();master.gain.value=0.9;master.connect(ac.destination);
  const t0=ac.currentTime+0.08;
  if(body.voice){
    body.sent.forEach(function(sn){
      const o=ac.createOscillator();o.type=sn.type;o.frequency.value=sn.f;
      const g=ac.createGain();
      g.gain.setValueAtTime(0.0001,t0+sn.t);
      g.gain.linearRampToValueAtTime(sn.g,t0+sn.t+0.03);
      g.gain.setValueAtTime(sn.g,t0+sn.t+sn.d*0.7);
      g.gain.linearRampToValueAtTime(0.0001,t0+sn.t+sn.d);
      o.connect(g);g.connect(master);
      o.start(t0+sn.t);o.stop(t0+sn.t+sn.d+0.05);
    });
  }else{
    body.notes.forEach(function(n){
      const o=ac.createOscillator();o.type="sine";
      o.frequency.setValueAtTime(n.f,t0+n.t);
      const g=ac.createGain();
      g.gain.setValueAtTime(0.0001,t0+n.t);
      g.gain.linearRampToValueAtTime(n.g,t0+n.t+0.02);
      g.gain.setValueAtTime(n.g,t0+n.t+Math.max(0.05,n.d*0.6));
      g.gain.linearRampToValueAtTime(0.0001,t0+n.t+n.d+0.25);
      o.connect(g);g.connect(master);
      o.start(t0+n.t);o.stop(t0+n.t+n.d+0.4);
    });
  }
  const to=setTimeout(function(){lastStop=null;onend&&onend()},(body.dur||3)*1000+600);
  lastStop=function(){
    try{master.gain.cancelScheduledValues(0);master.gain.setValueAtTime(0,ac.currentTime)}catch(e){}
    clearTimeout(to);
    onend&&onend();
  };
}

/* ---------- answering ---------- */
function revealFB(ok,q,delta,prefix){
  document.getElementById("btn-human").disabled=true;
  document.getElementById("btn-ai").disabled=true;
  const fb=document.getElementById("g-fb");
  fb.classList.remove("ok","no");fb.classList.add("show",ok?"ok":"no");
  document.getElementById("fb-head").innerHTML=prefix+
    (q.answer==="human"?" a human made this":" AI generated this")+
    '<span class="fbpts">'+(delta>=0?"+":"")+delta+'</span>';
  document.getElementById("fb-exp").textContent=q.explain;
  const nb=document.getElementById("btn-next");
  nb.textContent=(S.mode!=="attack"&&S.qi>=S.list.length-1)?"See results ›":"Next ›";
  nb.style.display=S.mode==="attack"?"none":"";
}
function answer(choice){
  if(!S||S.answered||S.finished)return;
  S.answered=true;
  clearInterval(S.qTimer);stopSample();
  S.answeredCount++;
  const q=S.list[S.qi];
  const ok=choice===q.answer;
  let delta;
  if(ok){
    S.correct++;S.streak++;
    delta=10;
    if(S.streak>0&&S.streak%5===0){delta+=15;toast("🔥 "+S.streak+" in a row! +15 bonus")}
    if(S.streak>S.bestStreak)S.bestStreak=S.streak;
  }else{
    S.streak=0;delta=-5;
  }
  S.score=Math.max(0,S.score+delta);
  document.getElementById("g-score").innerHTML="🏆 "+S.score+' <span class="plus">'+(delta>=0?"+":"")+delta+"</span>";
  revealFB(ok,q,delta,ok?"✓ Correct —":"✗ Not quite —");
  if(S.mode==="attack")S.autoTO=setTimeout(function(){nextQuestion()},ok?1200:2100);
}
function answerTimeout(){
  if(!S||S.answered||S.finished)return;
  S.answered=true;S.answeredCount++;S.streak=0;
  const q=S.list[S.qi];
  revealFB(false,q,0,"⏰ Time's up —");
}
function replayLives(){
  const m=S.mode==="challenge"?"challenge":S.mode==="practice"?"practice":S.mode;
  startGame({mode:m,category:S.category,challenge:S.challenge});
}

/* ---------- end of round ---------- */
function endGame(timedOut){
  if(S.finished)return;
  S.finished=true;
  stopTimers();stopSample();
  const lines=[];
  if(!timedOut){
    if(S.list.length>=10){S.score+=20;lines.push("Completed 10 questions: +20")}
    if(S.mode==="daily"&&P.lastDaily!==todayKey()){
      S.score+=25;lines.push("Daily challenge complete: +25");
      P.dailies++;P.lastDaily=todayKey();
    }else if(S.mode==="daily"&&P.lastDaily===todayKey()){
      lines.push("Today's daily bonus already claimed");
    }
    if(S.mode==="challenge")lines.push("Challenge set: "+String(S.challenge||"").toUpperCase());
    P.games++;P.asked+=S.list.length;P.correct+=S.correct;
    if(S.correct===S.list.length&&S.list.length>=10)P.perfectEver=true;
    if(S.score>P.bestRound)P.bestRound=S.score;
    if(S.streak>P.longestStreak)P.longestStreak=S.streak;
    if(S.mode==="daily")P.dailyScores[todayKey()]=S.score;
  }else{
    lines.push("Time ran with "+S.answeredCount+" items answered");
  }
  const xpGain=Math.max(0,Math.round(S.score*0.8));
  P.xp+=xpGain;saveP();checkBadges();renderHome();

  const answered=S.answeredCount;
  const acc=answered?Math.round(100*S.correct/answered):0;
  let emoji,title,sub;
  if(acc>=90){emoji="🏆";title="HUMAN OR AI? MASTER";sub="Nothing gets past you. Terrifyingly good judgment."}
  else if(acc>=70){emoji="🕵️";title="AI DETECTIVE";sub="You are pretty good at spotting artificial intelligence!"}
  else if(acc>=50){emoji="⚖️";title="TURING TOSS-UP";sub="You are at coin-flip level. Look closer, trust vibes less."}
  else{emoji="🌱";title="APPRENTICE OBSERVER";sub="Everyone starts somewhere. Notice the details next round!"}
  if(timedOut&&S.score>=200){emoji="⚡";title="SPEED DEMON";sub="Points per second. Relentless."}
  document.getElementById("r-emoji").textContent=emoji;
  document.getElementById("r-title").textContent=title;
  document.getElementById("r-sub").textContent=sub;
  document.getElementById("r-score").textContent=S.score;
  document.getElementById("r-acc").textContent=acc+"%";
  document.getElementById("r-xp").textContent="+"+xpGain;
  document.getElementById("r-best").textContent="🔥 "+S.bestStreak;
  lines.unshift(S.correct+" of "+answered+" answered correctly");
  document.getElementById("r-break").innerHTML=lines.map(function(l){return "• "+esc(l)}).join("<br>");
  show("sc-results");
}
function checkBadges(){
  BADGES.forEach(function(b){
    if(b.test(P)&&!P["b_"+b.id]){P["b_"+b.id]=true;toast("🏅 Achievement unlocked: "+b.name)}
  });
}

/* alias used by the results screen buttons */
function replay(){replayLives()}
