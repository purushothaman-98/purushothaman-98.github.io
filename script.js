const button=document.querySelector('.menu-button');const links=document.querySelector('.nav-links');if(button&&links){button.addEventListener('click',()=>{const open=links.classList.toggle('open');button.setAttribute('aria-expanded',open)});links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')))}const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

if(document.body&&document.querySelector('.article-body')&&location.pathname.endsWith('titan.html')){
  const style=document.createElement('style');
  style.textContent=`
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
    .essay-figure.hero-visual{margin-top:0}
    .essay-figure.diagram img{background:#fbf8f0}
    .image-disclosure{display:block;margin-top:4px;font-size:12px;font-style:italic;color:#6b7d88}
    @media(max-width:620px){.law-grid{grid-template-columns:1fr}.context-card{padding:18px}.context-card h2{font-size:22px}.essay-figure{margin:24px 0 30px}}
  `;
  document.head.appendChild(style);

  const makeFigure=(src,alt,caption,classes='')=>{
    const figure=document.createElement('figure');
    figure.className=`essay-figure ${classes}`.trim();
    figure.innerHTML=`<img src="${src}" alt="${alt}" loading="lazy" decoding="async"><figcaption>${caption}</figcaption>`;
    const image=figure.querySelector('img');
    image.addEventListener('error',()=>figure.remove(),{once:true});
    return figure;
  };

  const article=document.querySelector('.article-body');
  const standfirst=document.querySelector('.standfirst');
  if(article&&standfirst){
    const hero=makeFigure('images/titan-public-private-hero.webp','Editorial illustration of Tamil Nadu development officials and private engineers jointly establishing a precision-watch factory.','<strong>Institution and execution.</strong> Titan combined public participation with professional private-sector management.<span class="image-disclosure">AI-assisted editorial illustration; conceptual reconstruction, not an archival image.</span>','hero-visual');
    hero.querySelector('img').loading='eager';
    hero.querySelector('img').fetchPriority='high';
    article.insertBefore(hero,standfirst);

    const series=document.createElement('section');
    series.className='context-card series-card';
    series.id='about-the-series';
    series.innerHTML=`
      <p class="eyebrow">The screen version</p>
      <h2>About <em>Made in India: A Titan Story</em></h2>
      <div class="context-meta"><span>Six-part historical drama</span><span>Released June 2026</span><span>Amazon MX Player</span></div>
      <p>The series stars Naseeruddin Shah as J.R.D. Tata and Jim Sarbh as Xerxes Desai. It is directed by Robbie Grewal, written by Karan Vyas and adapted from Vinay Kamath's book <em>Titan: Inside India's Most Successful Consumer Brand</em>. Its six episodes follow the watch idea from the late 1970s through bureaucratic rejection, the Tamil Nadu partnership, manufacturing, pricing, branding and later reinvention.</p>
      <p>It works best as an entry point into the history, not as the final archive. The series compresses people, meetings and negotiations into dramatic scenes. In this essay, I use those scenes to identify questions, then test the factual claims against Titan, TIDCO, statutory and annual-report records.</p>
      <p class="small-note"><strong>Watch and production details:</strong> <a href="https://www.titancompany.in/naseeruddin-shah-and-jim-sarbh-in-made-in-india-a-titan-story-now-streaming" target="_blank" rel="noopener">Titan Company</a> · <a href="https://www.aboutamazon.in/news/entertainment/made-in-india-titan-story-amazon-mx-player" target="_blank" rel="noopener">Amazon MX Player</a> · <a href="https://tv.apple.com/in/show/made-in-india-a-titan-story/umc.cmc.64j21klxec8bbk6ejokn9nis9" target="_blank" rel="noopener">episode guide</a></p>`;
    standfirst.insertAdjacentElement('afterend',series);
  }

  const policyHeading=document.getElementById('policy-context');
  if(policyHeading){
    const firstPolicyPara=policyHeading.nextElementSibling;
    const act=document.createElement('section');
    act.className='context-card act-card';
    act.id='mrtp-act';
    act.innerHTML=`
      <p class="eyebrow">The legal setting</p>
      <h2>What the MRTP Act actually did</h2>
      <p>The Monopolies and Restrictive Trade Practices Act, 1969 was designed to limit the concentration of economic power and address monopolistic and restrictive trade practices. In its pre-1991 form, it also placed additional scrutiny on the establishment and expansion of certain large industrial undertakings. This is why major business houses were often described as "MRTP companies."</p>
      <div class="law-grid">
        <section><h3>Industrial licensing</h3><p>The Industries (Development and Regulation) Act, 1951 governed licences for new industrial undertakings and capacity. This was the broader entry-control system.</p></section>
        <section><h3>MRTP scrutiny</h3><p>The MRTP Act focused on concentration and business practices, and historically added pre-entry controls for specified large undertakings. The 1991 reforms removed these asset-based pre-entry restrictions.</p></section>
      </div>
      <p>Titan should therefore not be described as a company "created by the MRTP Act." A more accurate statement is that Titan arose inside a regulated industrial environment in which a state development corporation could make a large-house project easier to negotiate, approve and anchor locally through equity and governance.</p>
      <p>The MRTP Act was later repealed through section 66 of the Competition Act, 2002, with the modern framework shifting toward competition in markets rather than simply the size of an industrial house.</p>
      <p class="small-note"><strong>Official legal trail:</strong> <a href="https://www.indiacode.nic.in/handle/123456789/2118?view_type=browse" target="_blank" rel="noopener">Industries (Development and Regulation) Act, 1951</a> · <a href="https://www.indiacode.nic.in/show-data?actid=AC_CEN_22_29_00005_200312_1517807324781&orderno=98" target="_blank" rel="noopener">Competition Act, section 66</a> · <a href="https://www.indiacode.nic.in/repealedfileopen?rfilename=A1984-30.pdf" target="_blank" rel="noopener">MRTP Amendment Act, 1984</a></p>`;
    if(firstPolicyPara) firstPolicyPara.insertAdjacentElement('afterend',act); else policyHeading.insertAdjacentElement('afterend',act);

    const policyChain=document.querySelector('.policy-chain');
    if(policyChain){
      const model=makeFigure('images/joint-sector-model.webp','Diagram showing how state institutional support and private operating capability combined in a joint-sector company.','<strong>How the model worked.</strong> Public institutions reduced entry barriers and represented regional goals; private partners supplied management, technology, capital and market execution.','diagram');
      policyChain.insertAdjacentElement('afterend',model);
    }
  }

  const hosurHeading=document.getElementById('hosur');
  if(hosurHeading){
    const hosurParagraphs=[];
    let node=hosurHeading.nextElementSibling;
    while(node&&node.tagName==='P'){hosurParagraphs.push(node);node=node.nextElementSibling}
    const anchor=hosurParagraphs[hosurParagraphs.length-1]||hosurHeading;
    const hosur=makeFigure('images/hosur-capability-building.webp','Workers receiving precision-manufacturing training inside an early watch factory in Hosur.','<strong>Capability-building at Hosur.</strong> The factory accumulated skills, production discipline and industrial careers, not only physical output.<span class="image-disclosure">AI-assisted editorial illustration; historical interpretation, not an archival photograph.</span>');
    anchor.insertAdjacentElement('afterend',hosur);
  }

  const comparisonTable=document.querySelector('.comparisons');
  if(comparisonTable){
    const outcomes=makeFigure('images/joint-sector-outcomes.webp','Four possible outcomes of state-supported companies: retained ownership, strategic exit, industrial acquisition and infrastructure partnership.','<strong>Different endings, different forms of public value.</strong> Retention, exit, acquisition and PPP evolution each preserve some benefits while giving up others.','diagram');
    comparisonTable.insertAdjacentElement('afterend',outcomes);
  }

  const toc=document.querySelector('.aside-card ol');
  if(toc){
    const seriesLi=document.createElement('li');seriesLi.innerHTML='<a href="#about-the-series">About the series</a>';toc.insertBefore(seriesLi,toc.firstChild);
    const actLi=document.createElement('li');actLi.innerHTML='<a href="#mrtp-act">MRTP Act</a>';
    const policyLink=[...toc.querySelectorAll('a')].find(a=>a.getAttribute('href')==='#policy-context');
    if(policyLink) policyLink.parentElement.insertAdjacentElement('afterend',actLi); else toc.appendChild(actLi);
  }
}
