/* ULTRA MAX 7 PRO PREMIUM — standalone progressive enhancements.
   All data comes from site-config.js; no server, tracking or fake testimonials. */
(() => {
  'use strict';
  const c = window.ULTRAMAX_SITE || {};
  const qs = s => document.querySelector(s);
  const qsa = s => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mk = (tag, className, text) => { const e=document.createElement(tag); if(className)e.className=className;if(text!==undefined)e.textContent=String(text);return e; };
  const configServices = () => {
    const list = (c.industries && c.industries[c.industry]) || c.industries?.general || [];
    if (Array.isArray(c.serviceOptions) && c.serviceOptions.length) {
      return c.serviceOptions.map(item => (item && typeof item==='object' && typeof item.name==='string') ? item : (list.find(s=>s.name===item) || {name:String(item),detail:'Contact us to discuss this service.',points:['Request details','Receive a quotation'],question:'Please describe what you need.'}));
    }
    return list;
  };
  const services = configServices();
  window.ULTRAMAX_SERVICES = services;
  const safeImage = raw => {
    try { const u = new URL(raw, location.href); return ['https:','http:'].includes(u.protocol) ? u.href : ''; } catch {return '';} 
  };
  const observer = (fn, margin='0px 0px -70px 0px') => {
    if (reduced || !('IntersectionObserver' in window)) return {observe:el=>fn(el),disconnect:()=>{}};
    const io = new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){fn(e.target);io.unobserve(e.target);}}),{threshold:.17,rootMargin:margin}); return io;
  };

  // Client branding, theme and contact affordances (static meta values are edited for SEO before go-live).
  const theme = c.theme || {};
  [['--navy',theme.navy],['--teal',theme.teal],['--teal-deep',theme.tealDeep]].forEach(([key,v])=> {if(typeof v==='string' && /^#[0-9a-f]{6}$/i.test(v))document.documentElement.style.setProperty(key,v);});
  qsa('[data-client-name]').forEach(el=> el.textContent=c.companyName || 'Client company');
  qsa('[data-brand-name]').forEach(el=> el.textContent=c.brandName || c.companyName || 'ULTRA MAX 7 PRO');
  qsa('[data-brand-initials]').forEach(el=> { el.textContent=c.brandInitials || 'U7'; if(c.brandLogo && safeImage(c.brandLogo)){ const im=mk('img','brand-client-image'); im.src=safeImage(c.brandLogo); im.alt=''; el.replaceChildren(im); }});
  qsa('[data-demo-caption]').forEach(el => el.textContent = c.demoMode ? 'DEMONSTRATION FIGURES — replace with approved business data' : 'Business at a glance');
  if (c.phoneNumber) qsa('[data-client-phone]').forEach(el=> {el.textContent=c.phoneNumber;el.href=`tel:${String(c.phoneNumber).replace(/[^+\d]/g,'')}`;});

  // Counter animations without fabricated numbers. Source controlled in site-config.js.
  const stats = qs('#premiumStats');
  if(stats) {
    const data = Array.isArray(c.stats) ? c.stats : [];
    data.forEach((item,i)=>{
      const article=mk('article','stat-card reveal slide-up');article.style.setProperty('--delay',`${i*80}ms`);
      const val=mk('strong','stat-value',(item.prefix||'')+'0'+(item.suffix||'')); val.dataset.prefix=String(item.prefix||''); val.dataset.counter=String(Number(item.value)||0);
      val.dataset.suffix=String(item.suffix||'');
      article.append(val,mk('span','stat-label',item.label||''));stats.append(article);
    });
    const run=el=>{
      const end=Math.max(0,Number(el.dataset.counter)||0);const suffix=el.dataset.suffix;const prefix=el.dataset.prefix||'';
      if(reduced){el.textContent=prefix+end.toLocaleString('en-ZA')+suffix;return;}
      const start=performance.now();const duration=1400;
      const tick=now=>{const p=Math.min(1,(now-start)/duration);const ease=1-Math.pow(1-p,3);el.textContent=prefix+Math.round(end*ease).toLocaleString('en-ZA')+suffix;if(p<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);
    };
    const io=observer(container=>container.querySelectorAll('[data-counter]').forEach(run));io.observe(stats);
  }
  const bars=qs('#premiumBars');
  if(bars && Array.isArray(c.graph)) {
    c.graph.forEach(item=>{
      const pct=Math.max(0,Math.min(100,Number(item.value)||0));
      const row=mk('div','bar-row');const heading=mk('div','bar-heading');heading.append(mk('span','',item.label),mk('strong','',`${pct}%`));
      const track=mk('div','bar-track');track.setAttribute('role','meter');track.setAttribute('aria-label',item.label);track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.setAttribute('aria-valuenow',String(pct));
      const fill=mk('div','bar-fill');fill.style.setProperty('--bar-width',`${pct}%`);track.append(fill);row.append(heading,track);bars.append(row);
    });
    observer(el=>el.classList.add('chart-visible')).observe(bars);
  }
  const ring=qs('#premiumRing');
  if(ring && c.ring){const value=Math.max(0,Math.min(100,Number(c.ring.value)||0));ring.style.setProperty('--ring-value',`${value}%`);ring.setAttribute('aria-valuenow',String(value));const n=ring.querySelector('[data-ring-number]');if(n)n.textContent=`${value}%`;const t=qs('#ringLabel');if(t)t.textContent=c.ring.label||'Illustrative data';observer(el=>{const start=performance.now();const duration=1100;const animate=now=>{const t=reduced?1:Math.min(1,(now-start)/duration);const n=Math.round(value*(1-Math.pow(1-t,3)));el.style.setProperty('--ring-live',`${n}%`);el.style.background=`conic-gradient(#0dafa0 0 ${n}%, #dcefed ${n}% 100%)`;if(t<1)requestAnimationFrame(animate);};requestAnimationFrame(animate);}).observe(ring);}

  // Service selection changes an actual content panel and can preselect the chatbot or quote wizard.
  const explorer=qs('#serviceExplorer');
  if(explorer && services.length) {
    const nav=qs('#serviceOptions');const content=qs('#servicePanel');
    const select=(index)=>{
      nav.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});
      const s=services[index]; content.replaceChildren();
      const kicker=mk('span','kicker','EXPLORE OUR SERVICES');const h=mk('h3','',s.name);const p=mk('p','',s.detail);
      const ul=mk('ul','service-benefits');(s.points||[]).forEach(pt=>ul.append(mk('li','',pt)));
      const actions=mk('div','explorer-actions');const chat=mk('button','btn','Ask about this service ↗');chat.type='button';chat.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('ultramax:service',{detail:{service:s.name}})));
      const quote=mk('button','btn btn-secondary','Request a quote');quote.type='button';quote.addEventListener('click',()=>openQuote(s.name));actions.append(chat,quote);
      content.append(kicker,h,p,ul,actions);
    };
    services.forEach((s,i)=>{const b=mk('button','service-tab',s.name);b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-controls','servicePanel');b.addEventListener('click',()=>select(i));b.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const next=(i+(e.key==='ArrowUp'||e.key==='ArrowLeft'?-1:1)+services.length)%services.length;select(next);nav.children[next].focus();}});nav.append(b);});
    select(0);
  }

  // Timeline driven by editable data.
  const timeline=qs('#premiumTimeline');
  if(timeline && Array.isArray(c.timeline)){
    c.timeline.forEach((step,i)=>{const li=mk('li','timeline-item reveal slide-up');li.append(mk('div','timeline-index',String(i+1).padStart(2,'0')),mk('h3','',step.title),mk('p','',step.text));timeline.append(li);});
  }

  // Accessible before/after comparison using a real range input and two local SVG samples.
  const compare=qs('#beforeAfter');
  if(compare && c.beforeAfter){
    const before=qs('#beforeImage'),after=qs('#afterImage'), slider=qs('#compareRange'),value=qs('#compareValue');
    if(before && after && slider){before.src=safeImage(c.beforeAfter.before);after.src=safeImage(c.beforeAfter.after);before.alt='Wood-grain caskets';after.alt='Satin-lined caskets';
      const update=()=>{const pct=Math.max(0,Math.min(100,Number(slider.value)));compare.style.setProperty('--compare',`${pct}%`);if(value)value.textContent=`${pct}% first style`;};slider.addEventListener('input',update);update();}
    const title=qs('#compareTitle');if(title)title.textContent=c.beforeAfter.title||'Before and after';
    const caption=qs('#compareCaption');if(caption)caption.textContent=c.beforeAfter.caption||'';
  }

  // Filterable portfolio with genuine focus-managed <dialog> lightbox.
  const projectList=qs('#projectList');
  const projects=Array.isArray(c.projects)?c.projects.filter(x=>x && x.title && safeImage(x.image)):[];
  if(projectList){
    const filterBar=qs('#projectFilters');const categories=['All',...new Set(projects.map(p=>p.category || 'Other'))];
    const dialog=qs('#projectDialog');const photo=qs('#projectFullImage');const heading=qs('#projectDialogTitle');const details=qs('#projectDialogDescription');let current=0;
    const displayModal=i=>{current=i;const p=projects[i];photo.src=safeImage(p.image);photo.alt=p.title;heading.textContent=p.title;details.textContent=p.description||'';if(c.demoMode)details.textContent+=' · Demo image, not completed client work.';};
    const show=i=>{displayModal(i);if(dialog?.showModal)dialog.showModal();};
    const render=category=>{
      projectList.replaceChildren();projects.forEach((p,i)=>{
        if(category!=='All' && p.category!==category)return;
        const b=mk('button','project-card reveal slide-up');b.type='button';b.setAttribute('aria-label',`Open ${p.title} project preview`);
        const image=mk('img','');image.src=safeImage(p.image);image.alt='';image.loading='lazy';image.width=600;image.height=400;
        const overlay=mk('div','project-caption');overlay.append(mk('span','',p.category||'Project'),mk('strong','',p.title),mk('small','', 'View details ↗'));
        b.append(image,overlay);b.addEventListener('click',()=>show(i));projectList.append(b);
      });
      const reveal=observer(el=>el.classList.add('visible'));projectList.querySelectorAll('.reveal').forEach(el=>{el.classList.add('ready');reveal.observe(el);});
    };
    categories.forEach((category,i)=>{const b=mk('button','filter-btn'+(i===0?' active':''),category);b.type='button';b.setAttribute('aria-pressed',String(i===0));b.addEventListener('click',()=>{filterBar.querySelectorAll('button').forEach(btn=>{btn.classList.toggle('active',btn===b);btn.setAttribute('aria-pressed',String(btn===b));});render(category);});filterBar.append(b);});
    qs('#projectDialogClose')?.addEventListener('click',()=>dialog.close());
    qs('#projectPrev')?.addEventListener('click',()=>displayModal((current-1+projects.length)%projects.length));
    qs('#projectNext')?.addEventListener('click',()=>displayModal((current+1)%projects.length));
    dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
    dialog?.addEventListener('keydown',e=>{if(e.key==='ArrowRight')displayModal((current+1)%projects.length);if(e.key==='ArrowLeft')displayModal((current-1+projects.length)%projects.length);});
    render('All');
  }

  const trust=qs('#trustGrid');
  if(trust){(c.trustItems||[]).forEach((v,i)=>{const div=mk('article','trust-card reveal slide-up');div.append(mk('span','trust-symbol',['✧','◇','✓'][i%3]),mk('strong','',v));trust.append(div);});}
  const reviews=qs('#premiumReviews');
  if(reviews){const list=(c.testimonials||[]).filter(x=>x.quote && x.name);if(!list.length){reviews.append(mk('p','review-placeholder','Client-approved family testimonials can be added here. We do not publish invented reviews.'));}
    else list.forEach(x=>{const card=mk('blockquote','verified-review');card.append(mk('p','',`“${x.quote}”`),mk('footer','',`${x.name}${x.context?' — '+x.context:''}`));reviews.append(card);});}

  // Pointer-only 3D hover, short travel, and no disabled-motion penalties.
  if(!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches){qsa('.effect-tile,.info-card,.project-card').forEach(card=>{
    card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;card.style.setProperty('--tiltX',`${(-y*2.8).toFixed(2)}deg`);card.style.setProperty('--tiltY',`${(x*3.4).toFixed(2)}deg`);});
    card.addEventListener('pointerleave',()=>{card.style.removeProperty('--tiltX');card.style.removeProperty('--tiltY');});
  });}
  // Reveal cards created from configuration after the original page script has run.
  const dynamicReveals=qsa('.reveal:not(.ready)');
  const revealObserver=observer(node=>node.classList.add('visible'));
  dynamicReveals.forEach(node=>{node.classList.add('ready');revealObserver.observe(node);});
  // Scroll progress indicator; passive and one frame per paint.
  const progress=qs('#scrollProgress');
  if(progress){let busy=false;const paint=()=>{const range=Math.max(1,document.documentElement.scrollHeight-innerHeight);progress.style.transform=`scaleX(${Math.min(1,scrollY/range)})`;busy=false;};addEventListener('scroll',()=>{if(!busy){busy=true;requestAnimationFrame(paint);}}, {passive:true});paint();}
  // Genuine cross-page CSS View Transitions when supported; graceful CSS-only fallback.
  document.documentElement.classList.add('premium-ready');

  // Quote wizard: memory-only fields, editable steps, validation and WhatsApp confirmation.
  let quoteDialog=null,quoteStep=0;
  const quote={service:'',budget:'',location:'',description:'',name:'',phone:''};
  const quoteSteps=['Service','What support do you need?','Contact','Review'];
  const bNumber=()=>String(c.whatsappNumber||'').replace(/\D/g,'');
  const qFormat=()=>[
    `Hello ${c.companyName||'team'},`,'','I would like to enquire about Siyakholwa funeral services through your website.',
    `Name: ${quote.name}`,`Phone: ${quote.phone}`,`Service: ${quote.service}`,`Budget: ${quote.budget||'Not specified'}`,
    `Location: ${quote.location}`,`Requirements: ${quote.description}`,'','Please contact me about the next steps. Thank you.'
  ].join('\n');
  const makeField=(label,key,tag,opts={})=>{
    const wrap=mk('label','quote-field');wrap.append(mk('span','',label));
    const field=mk(tag,'quote-input');field.name=key;field.required=opts.required!==false;
    if(tag==='select'){ const placeholder=mk('option','','Choose an option…');placeholder.value='';field.append(placeholder);(opts.choices||[]).forEach(v=>{const o=mk('option','',v);o.value=v;field.append(o);}); }
    if(tag==='textarea'){field.rows=4;field.maxLength=1000;}
    if(tag==='input'){field.type=opts.type||'text';field.maxLength=opts.maxLength||100;}
    field.value=quote[key]||'';wrap.append(field);return wrap;
  };
  const errorFor=(key,value)=>{
    if(key==='service'&&!services.some(s=>s.name===value))return 'Please select a valid service.';
    if(key==='description' && value.length<8)return 'Please describe the work (at least 8 characters).';
    if(key==='location' && value.length<2)return 'Please enter your project location.';
    if(key==='name'&&value.length<2)return 'Please enter your name.';
    if(key==='phone'&&!/^\+?[0-9\s()\-]{7,24}$/.test(value))return 'Please enter a valid phone number.';
    if(key==='phone'&&(value.replace(/\D/g,'').length<7||value.replace(/\D/g,'').length>15))return 'Use a phone number with 7–15 digits.';
    return '';
  };
  const qRender=()=>{
    if(!quoteDialog)return;
    const body=quoteDialog.querySelector('#quoteContent');body.replaceChildren();
    quoteDialog.querySelector('#quoteProgress').textContent=`${quoteSteps[quoteStep]} · ${quoteStep+1} of 4`;
    const form=mk('form','quote-form');form.noValidate=true;
    let keys=[];
    if(quoteStep===0){body.append(mk('h3','','Choose a service'));form.append(makeField('Service required','service','select',{choices:services.map(s=>s.name)}));keys=['service'];}
    if(quoteStep===1){body.append(mk('h3','','Tell us what you need'));form.append(makeField('Optional funeral budget','budget','select',{required:false,choices:['Under R5,000','R5,000 – R15,000','R15,000 – R30,000','Above R30,000','Not sure yet']}),makeField('Town / area','location','input'),makeField('What support do you need?','description','textarea'));keys=['budget','location','description'];}
    if(quoteStep===2){body.append(mk('h3','','Your contact details'));form.append(makeField('Full name','name','input'),makeField('Contact number','phone','input',{type:'tel',maxLength:24}));keys=['name','phone'];}
    if(quoteStep===3){body.append(mk('h3','','Review your quotation request'));const summary=mk('dl','quote-summary');Object.entries(quote).forEach(([key,value])=>{summary.append(mk('dt','',key.charAt(0).toUpperCase()+key.slice(1)),mk('dd','',value||'Not specified'));});body.append(summary);const label=mk('label','quote-field');label.append(mk('span','','Prepared WhatsApp message'));const preview=mk('textarea','quote-input');preview.readOnly=true;preview.rows=7;preview.value=qFormat();label.append(preview);body.append(label);}
    const error=mk('p','quote-error');error.setAttribute('role','alert');const actions=mk('div','quote-actions');
    const back=mk('button','btn btn-secondary','← Back');back.type='button';back.disabled=quoteStep===0;back.addEventListener('click',()=>{quoteStep--;qRender();});actions.append(back);
    const forward=mk('button','btn',quoteStep===3?'Open WhatsApp ↗':'Next →');forward.type='submit';forward.disabled=quoteStep===3&&!/^\d{8,15}$/.test(bNumber());actions.append(forward);
    form.addEventListener('submit',e=>{e.preventDefault();
      if(quoteStep===3){const link=`https://wa.me/${bNumber()}?text=${encodeURIComponent(qFormat())}`;const a=mk('a','quote-direct-link','Continue to WhatsApp');a.href=link;a.target='_blank';a.rel='noopener noreferrer';body.querySelector('.quote-direct-link')?.remove();body.append(a);window.open(link,'_blank','noopener,noreferrer');error.textContent='WhatsApp opens with your message. You still need to press Send in WhatsApp.';return;}
      for(const key of keys){const field=form.elements.namedItem(key);if(!field)continue;const value=field.value.trim().replace(/[\u0000-\u001F\u007F]/g,' ');const problem=errorFor(key,value);if(problem){error.textContent=problem;field.focus();return;}quote[key]=value;}
      quoteStep++;qRender();
    });
    if(quoteStep===3){const copy=mk('button','btn btn-secondary','Copy request');copy.type='button';copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(qFormat());error.textContent='Request copied. You can paste it into WhatsApp.';}catch{const el=body.querySelector('textarea');el.focus();el.select();error.textContent='Copy the highlighted message and paste it into WhatsApp.';}});actions.append(copy);if(forward.disabled)error.textContent='Demo mode: add the verified client WhatsApp number in site-config.js. Copy is available.';}
    form.append(actions,error);body.append(form);if(quoteStep<3){form.querySelector('input,select,textarea')?.focus({preventScroll:true});}
  };
  const openQuote=(selected='')=>{
    if(!quoteDialog)return;
    if(selected && services.some(s=>s.name===selected))quote.service=selected;
    quoteStep=quote.service?1:0;qRender();quoteDialog.showModal();
  };
  quoteDialog=qs('#quoteDialog');
  if(!quoteDialog){quoteDialog=mk('dialog','quote-dialog');quoteDialog.id='quoteDialog';quoteDialog.setAttribute('aria-labelledby','quoteDialogTitle');
    const head=mk('div','quote-head');head.append(mk('span','','SIYAKHOLWA ENQUIRY'),mk('h2','',`Tell ${c.companyName||'us'} what you need`));head.querySelector('h2').id='quoteDialogTitle';
    const close=mk('button','quote-close','×');close.type='button';close.setAttribute('aria-label','Close quotation form');close.addEventListener('click',()=>quoteDialog.close());head.append(close);
    const prog=mk('p','quote-step');prog.id='quoteProgress';const body=mk('div','');body.id='quoteContent';quoteDialog.append(head,prog,body);document.body.append(quoteDialog);
    quoteDialog.addEventListener('click',e=>{if(e.target===quoteDialog)quoteDialog.close();});
  }
  qsa('[data-open-quote]').forEach(button=>button.addEventListener('click',()=>openQuote()));
  window.addEventListener('ultramax:quote',e=>openQuote(e.detail?.service||''));
})();
