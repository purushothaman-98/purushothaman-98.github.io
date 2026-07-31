const button=document.querySelector('.menu-button');
const links=document.querySelector('.nav-links');
if(button&&links){
  button.addEventListener('click',()=>{
    const open=links.classList.toggle('open');
    button.setAttribute('aria-expanded',open);
  });
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));
}

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting) entry.target.classList.add('visible');
}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

if(document.body&&document.querySelector('.article-body')&&location.pathname.endsWith('titan.html')){
  const setMeta=(selector,value)=>{
    const el=document.querySelector(selector);
    if(el) el.setAttribute('content',value);
  };
  setMeta('meta[property="og:image"]',new URL('titan-article-og.webp',location.href).href);
  setMeta('meta[name="twitter:image"]',new URL('titan-article-og.webp',location.href).href);

  const hero=document.querySelector('.titan-hero');
  if(hero){
    hero.style.minHeight='clamp(520px,62vw,760px)';
    hero.style.display='flex';
    hero.style.alignItems='flex-end';
    hero.style.backgroundImage="linear-gradient(90deg,rgba(3,12,21,.96) 0%,rgba(3,12,21,.86) 34%,rgba(3,12,21,.46) 62%,rgba(3,12,21,.15) 100%),linear-gradient(0deg,rgba(3,12,21,.70) 0%,rgba(3,12,21,0) 55%),url('titan-public-private-hero.webp')";
    hero.style.backgroundSize='cover';
    hero.style.backgroundPosition='center';
    hero.style.backgroundRepeat='no-repeat';
    hero.style.padding='clamp(90px,12vw,150px) 0 clamp(58px,7vw,86px)';
  }

  const style=document.createElement('style');
  style.textContent=`
    .titan-hero .hero-inner{max-width:760px;margin-left:0}
    .titan-hero h1{text-shadow:0 3px 18px rgba(0,0,0,.5)}
    .titan-hero .deck{max-width:700px;color:#f0f5f8;text-shadow:0 2px 12px rgba(0,0,0,.5)}
    .context-card{margin:28px 0;padding:22px;border:1px solid var(--line);border-radius:10px;background:#f7fafb}
    .context-card.series-card{border-left:4px solid #c58b35;background:linear-gradient(135deg,#fffaf1,#f7fafb)}
    .context-card.act-card{border-left:4px solid #0f5b78;background:linear-gradient(135deg,#edf5f8,#fff)}
    .context-card h2{margin:0 0 12px;font-size:25px}
    .context-card h3{margin:18px 0 8px;font-size:18px}
    .context-card p{margin:10px 0}
    .context-meta{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 18px}
    .context-meta span{padding:6px 9px;border-radius:999px;background:#fff;border:1px solid var(--line);font-size:12px;font-weight:700;color:#29485e}
    .law-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}
    .law-grid section{padding:16px;border:1px solid var(--line);border-radius:8px;background:#fff}
    .law-grid h3{margin-top:0}
    .context-card .small-note{font-size:13.5px!important;color:var(--muted);text-align:left!important}
    .essay-figure{margin:32px 0 38px}
    .essay-figure img{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:10px;background:#edf2f4;box-shadow:0 12px 32px rgba(14,38,61,.08)}
    .essay-figure figcaption{margin-top:10px;color:var(--muted);font-size:13px;line-height:1.5;text-align:left}
    .essay-figure figcaption strong{color:var(--ink)}
    .essay-figure.diagram img{background:#fbf8f0}
    .image-disclosure{display:block;margin-top:4px;font-size:12px;font-style:italic;color:#6b7d88}
    @media(max-width:760px){
      .titan-hero{min-height:620px!important;background-position:62% center!important;padding-bottom:52px!important}
      .titan-hero .hero-inner{max-width:92%}
      .titan-hero h1{font-size:clamp(40px,12vw,58px)}
      .titan-hero .deck{font-size:18px;line-height:1.45}
    }
    @media(max-width:620px){
      .law-grid{grid-template-columns:1fr}
      .context-card{padding:18px}
      .context-card h2{font-size:22px}
      .essay-figure{margin:24px 0 30px}
    }
  `;
  document.head.appendChild(style);

  const makeFigure=(src,alt,caption,classes='')=>{
    const figure=document.createElement('figure');
    figure.className=`essay-figure ${classes}`.trim();
    figure.innerHTML=`<img src="${src}" alt="${alt}" loading="lazy" decoding="async"><figcaption>${caption}</figcaption>`;
    figure.querySelector('img').addEventListener('error',()=>figure.remove(),{once:true});
    return figure;
  };

  const standfirst=document.querySelector('.standfirst');
  if(standfirst&&!document.getElementById('about-the-series')){
    const series=document.createElement('section');
    series.className='context-card series-card';
    series.id='about-the-series';
    series.innerHTML=`
      <p class="eyebrow">The screen version</p>
      <h2>About <em>Made in India: A Titan Story</em></h2>
      <div class="context-meta"><span>Six-part historical drama</span><span>Released June 2026</span><span>Amazon MX Player</span></div>
      <p>The series stars Naseeruddin Shah as J.R.D. Tata and Jim Sarbh as Xerxes Desai. It is directed by Robbie Grewal, written by Karan Vyas and adapted from Vinay Kamath's book <em>Titan: Inside India's Most Successful Consumer Brand</em>. Its six episodes follow the watch idea from the late 1970s through bureaucratic rejection, the Tamil Nadu partnership, manufacturing, pricing, branding and later reinvention.</p>
      <p>It works best as an entry point into the history, not as the final archive. The series compresses people, meetings and negotiations into dramatic scenes. Here, those scenes identify questions; official records provide the factual backbone.</p>
      <p class="small-note"><strong>Production details:</strong> <a href="https://www.titancompany.in/naseeruddin-shah-and-jim-sarbh-in-made-in-india-a-titan-story-now-streaming" target="_blank" rel="noopener">Titan Company</a> · <a href="https://www.aboutamazon.in/news/entertainment/made-in-india-titan-story-amazon-mx-player" target="_blank" rel="noopener">Amazon MX Player</a></p>`;
    standfirst.insertAdjacentElement('afterend',series);
  }

  const policyHeading=document.getElementById('policy-context');
  if(policyHeading&&!document.getElementById('mrtp-act')){
    const firstPolicyPara=policyHeading.nextElementSibling;
    const act=document.createElement('section');
    act.className='context-card act-card';
    act.id='mrtp-act';
    act.innerHTML=`
      <p class="eyebrow">The legal setting</p>
      <h2>What the MRTP Act actually did</h2>
      <p>The Monopolies and Restrictive Trade Practices Act, 1969 aimed to limit concentration of economic power and address monopolistic and restrictive practices. In its pre-1991 form, it also added scrutiny for specified large industrial undertakings.</p>
      <div class="law-grid">
        <section><h3>Industrial licensing</h3><p>The Industries (Development and Regulation) Act, 1951 governed licences for new undertakings and capacity.</p></section>
        <section><h3>MRTP scrutiny</h3><p>The MRTP Act focused on concentration and business practices. The 1991 reforms removed its asset-based pre-entry controls.</p></section>
      </div>
      <p>Titan was not created by the MRTP Act. It arose inside a regulated environment in which a state development corporation could help negotiate, approve and anchor a large-house project through equity and governance.</p>
      <p class="small-note"><strong>Official legal trail:</strong> <a href="https://www.indiacode.nic.in/handle/123456789/2118?view_type=browse" target="_blank" rel="noopener">IDR Act, 1951</a> · <a href="https://www.indiacode.nic.in/show-data?actid=AC_CEN_22_29_00005_200312_1517807324781&orderno=98" target="_blank" rel="noopener">Competition Act, section 66</a></p>`;
    firstPolicyPara?.insertAdjacentElement('afterend',act);
  }

  const policyChain=document.querySelector('.policy-chain');
  if(policyChain&&!document.querySelector('img[src="joint-sector-model.webp"]')){
    policyChain.insertAdjacentElement('afterend',makeFigure('joint-sector-model.webp','Diagram showing how state institutional support and private operating capability combined in a joint-sector company.','<strong>How the model worked.</strong> Public institutions reduced entry barriers and represented regional goals; private partners supplied management, technology, capital and market execution.','diagram'));
  }

  const hosurHeading=document.getElementById('hosur');
  if(hosurHeading&&!document.querySelector('img[src="hosur-capability-building.webp"]')){
    let anchor=hosurHeading;
    while(anchor.nextElementSibling&&anchor.nextElementSibling.tagName==='P') anchor=anchor.nextElementSibling;
    anchor.insertAdjacentElement('afterend',makeFigure('hosur-capability-building.webp','Workers receiving precision-manufacturing training inside an early watch factory in Hosur.','<strong>Capability-building at Hosur.</strong> The factory accumulated skills, production discipline and industrial careers.<span class="image-disclosure">AI-assisted editorial illustration; historical interpretation, not an archival photograph.</span>'));
  }

  const comparisonTable=document.querySelector('.comparisons');
  if(comparisonTable&&!document.querySelector('img[src="joint-sector-outcomes.webp"]')){
    comparisonTable.insertAdjacentElement('afterend',makeFigure('joint-sector-outcomes.webp','Four possible outcomes of state-supported companies: retained ownership, strategic exit, industrial acquisition and infrastructure partnership.','<strong>Different endings, different forms of public value.</strong> Retention, exit, acquisition and PPP evolution each preserve some benefits while giving up others.','diagram'));
  }

  const toc=document.querySelector('.aside-card ol');
  if(toc){
    if(!toc.querySelector('a[href="#about-the-series"]')){
      const li=document.createElement('li');
      li.innerHTML='<a href="#about-the-series">About the series</a>';
      toc.insertBefore(li,toc.firstChild);
    }
    if(!toc.querySelector('a[href="#mrtp-act"]')){
      const li=document.createElement('li');
      li.innerHTML='<a href="#mrtp-act">MRTP Act</a>';
      const policyLink=toc.querySelector('a[href="#policy-context"]');
      policyLink?.parentElement.insertAdjacentElement('afterend',li);
    }
  }
}
