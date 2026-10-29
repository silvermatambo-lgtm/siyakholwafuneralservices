/* ULTRA MAX 7 PRO PREMIUM — 24/7 guided intake, not a live human or AI.
   Client-side only; no form submissions, sessionStorage, backend or silent send. */
(() => {
  'use strict';
  const c=window.ULTRAMAX_SITE||{};
  const company=String(c.companyName||'Our company').slice(0,100);
  const phone=String(c.whatsappNumber||'').replace(/\D/g,'');
  const items=window.ULTRAMAX_SERVICES||[];
  const serviceNames=[...new Set((Array.isArray(c.serviceOptions)&&c.serviceOptions.length?c.serviceOptions:items.map(s=>s.name)).filter(Boolean))];
  if(!serviceNames.length)serviceNames.push('Request a quotation','General enquiry','Other enquiry');
  const $=id=>document.getElementById(id);
  const launcher=$('chatLauncher'),panel=$('chatPanel'),close=$('chatClose'),history=$('chatTranscript'),controls=$('chatControls'),progress=$('chatProgress'),status=$('chatStatus'),companyLabel=$('chatCompany');
  if(![launcher,panel,close,history,controls,progress,status,companyLabel].every(Boolean))return;
  companyLabel.textContent=company;
  const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
  const button=(text,cls,handler,disabled=false)=>{const e=el('button',`chat-btn ${cls}`,text);e.type='button';e.disabled=disabled;e.addEventListener('click',handler);return e;};
  const answers={name:'',phone:'',service:'',location:'',followup:'',message:''};
  const steps=[
    {key:'name',label:'Your name',question:'What name should we use?',kind:'text'},
    {key:'phone',label:'Contact number',question:'Thank you. What phone number can the team reach you on?',kind:'tel'},
    {key:'service',label:'Choose a service',question:'Which service do you need?',kind:'select'},
    {key:'location',label:'Your town or area',question:'Where will the project or service take place?',kind:'text'},
    {key:'followup',label:'About your selected service',question:'Please tell us a little more about this service.',kind:'textarea'},
    {key:'message',label:'Additional requirements',question:'Anything else our team should know?',kind:'textarea'}
  ];
  let step=0, priorFocus=null;
  const detailQuestion=()=>items.find(s=>s.name===answers.service)?.question||'What is the most important detail about the service you need?';
  const formatted=()=>[`Hello ${company},`,'','I would like to make an enquiry through your website.',`Name: ${answers.name}`,`Phone: ${answers.phone}`,`Service: ${answers.service}`,`Location: ${answers.location}`,`Service details: ${answers.followup}`,`Additional details: ${answers.message||'None provided'}`,'','Please get back to me. Thank you.'].join('\n');
  const notice=message=>{status.textContent=message;status.hidden=!message;};
  const bubble=(kind,text)=>history.append(el('div',`chat-bubble ${kind}`,text));
  const renderHistory=()=>{
    history.replaceChildren();
    bubble('bot',`Hello! 👋 Welcome to ${company}. I'm your 24/7 automated enquiry assistant. I can prepare an enquiry for our team on WhatsApp.`);
    if(step===0){bubble('bot',answers.service?`I can help with ${answers.service}. Ready to begin?`:'May I ask you a few quick questions?');return;}
    for(let i=0;i<Math.min(step-1,steps.length);i++){const s=steps[i];bubble('bot',s.key==='followup'?detailQuestion():s.question);bubble('visitor',answers[s.key]||'Not specified');}
    if(step<=steps.length)bubble('bot',steps[step-1].key==='followup'?detailQuestion():steps[step-1].question);
    if(step===steps.length+1)bubble('bot','All done. Please review your information before opening WhatsApp.');
  };
  const validate=(key,value)=>{
    if(key==='name'&&(value.length<2||value.length>80))return 'Please enter your name (2–80 characters).';
    if(key==='phone'&&(!/^\+?[\d\s()\-]{7,24}$/.test(value)||value.replace(/\D/g,'').length<7||value.replace(/\D/g,'').length>15))return 'Enter a contact number containing 7–15 digits.';
    if(key==='service'&&!serviceNames.includes(value))return 'Please select a service from the dropdown.';
    if(key==='location'&&(value.length<2||value.length>120))return 'Please provide your town or service area.';
    if(key==='followup'&&value.length<5)return 'Please provide a short description (at least 5 characters).';
    if(key==='message'&&value.length>1000)return 'Please limit additional details to 1,000 characters.';
    return '';
  };
  const makeInput=s=>{
    const wrapper=el('div','chat-field');const label=el('label','',s.label);const id=`chatInput-${s.key}`;label.htmlFor=id;wrapper.append(label);
    let input;
    if(s.kind==='select'){
      input=el('select','chat-input');const init=el('option','','Select a service…');init.value='';input.append(init);serviceNames.forEach(n=>{const op=el('option','',n);op.value=n;input.append(op);});
    }else if(s.kind==='textarea'){
      input=el('textarea','chat-input');input.rows=3;input.maxLength=1000;input.placeholder=s.key==='followup'?detailQuestion():'Optional additional notes';
    }else{input=el('input','chat-input');input.type=s.kind;input.maxLength=s.key==='phone'?24:120;input.autocomplete=s.key==='phone'?'tel':s.key==='name'?'name':'off';input.placeholder=s.key==='phone'?'+27 ...':s.key==='location'?'e.g. Soweto, Johannesburg':'Your full name';}
    input.id=id;input.name=s.key;input.value=answers[s.key];
    const error=el('p','chat-error');error.id=`chatError-${s.key}`;error.setAttribute('role','alert');input.setAttribute('aria-describedby',error.id);
    input.addEventListener('input',()=>{error.textContent='';notice('');});wrapper.append(input,error);return {wrapper,input,error};
  };
  const next=(key,input,error)=>{
    const value=input.value.trim().replace(/[\u0000-\u001F\u007F]/g,' ');
    const problem=validate(key,value);if(problem){error.textContent=problem;input.focus();return;}
    if(key==='service'&&value!==answers.service){answers.followup='';}
    answers[key]=value;step++;render();
  };
  const buttons=(...arr)=>{const row=el('div','chat-actions');arr.forEach(a=>row.append(a));return row;};
  const back=()=>{if(step>0){step--;render();}};
  const restart=()=>{Object.keys(answers).forEach(k=>answers[k]='');step=0;render();};
  const copy=async()=>{try{await navigator.clipboard.writeText(formatted());notice('Enquiry copied. Paste it into WhatsApp to send.');}catch{const box=controls.querySelector('textarea.chat-message-preview');if(box){box.focus();box.select();}notice('Select and copy the enquiry above to paste it into WhatsApp.');}};
  const send=()=>{
    if(!/^\d{8,15}$/.test(phone)){notice('Configure the approved client WhatsApp number in site-config.js first.');return;}
    if(!navigator.onLine){notice('You are offline. Copy your enquiry and send it when connected.');return;}
    const href=`https://wa.me/${phone}?text=${encodeURIComponent(formatted())}`;
    const link=el('a','chat-fallback-link','Continue to WhatsApp');link.href=href;link.target='_blank';link.rel='noopener noreferrer';
    controls.querySelector('.chat-fallback-link')?.remove();controls.append(link);
    window.open(href,'_blank','noopener,noreferrer');notice('Review your message and press Send in WhatsApp to deliver it. If nothing opened, use the link below.');
  };
  const render=()=>{
    notice('');renderHistory();controls.replaceChildren();
    progress.textContent=step===0?'Welcome':step===steps.length+1?'Review enquiry':`Question ${step} of ${steps.length}`;
    if(step===0){controls.append(button('Start my enquiry →','primary',()=>{step=1;render();}));}
    else if(step<=steps.length){
      const s=steps[step-1];const {wrapper,input,error}=makeInput(s);
      if(s.key==='message')wrapper.querySelector('label').textContent='Additional requirements (optional)';
      const form=el('form','chat-step-form');form.noValidate=true;
      form.addEventListener('submit',e=>{e.preventDefault();next(s.key,input,error);});
      const b=button('Next →','primary',()=>next(s.key,input,error));const r=buttons(button('← Back','subtle',back),b);
      form.append(wrapper,r);controls.append(form);input.focus({preventScroll:true});
    } else {
      const review=el('div','chat-review');[['Name',answers.name],['Phone',answers.phone],['Service',answers.service],['Location',answers.location],['Service details',answers.followup],['Notes',answers.message||'None']].forEach(([k,v])=>{const row=el('div','chat-review-line');row.append(el('strong','',k),el('span','',v));review.append(row);});
      const preview=el('textarea','chat-message-preview');preview.readOnly=true;preview.rows=6;preview.value=formatted();preview.setAttribute('aria-label','Preview of WhatsApp message');
      controls.append(review,el('label','chat-preview-label','Prepared WhatsApp message'),preview,buttons(button('← Edit','subtle',back),button('Open WhatsApp ↗','primary',send,!/^\d{8,15}$/.test(phone))),buttons(button('Copy enquiry','secondary',copy),button('Start over','subtle',restart)));
      if(!/^\d{8,15}$/.test(phone))notice('Demo mode: WhatsApp destination is unconfigured. Copy enquiry works; sending is disabled.');
    }
    history.scrollTop=history.scrollHeight;
  };
  const open=()=>{priorFocus=document.activeElement;panel.hidden=false;launcher.setAttribute('aria-expanded','true');document.body.classList.add('chat-open');render();close.focus({preventScroll:true});};
  const hide=()=>{panel.hidden=true;launcher.setAttribute('aria-expanded','false');document.body.classList.remove('chat-open');if(priorFocus?.isConnected)priorFocus.focus({preventScroll:true});else launcher.focus({preventScroll:true});};
  launcher.addEventListener('click',()=>panel.hidden?open():hide());close.addEventListener('click',hide);
  document.querySelectorAll('[data-open-chat]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();open();}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();hide();}});
  window.addEventListener('ultramax:service',e=>{const selection=e.detail?.service;if(serviceNames.includes(selection)){answers.service=selection;answers.followup='';}open();});
  render();
})();
