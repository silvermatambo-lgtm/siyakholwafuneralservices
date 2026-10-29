/* Siyakholwa client-specific enhancements. All images are supplied by the client. */
document.addEventListener('DOMContentLoaded',()=>{
 const nav=document.getElementById('primaryNav');
 document.querySelectorAll('a[href^="tel:"],a[href^="mailto:"]').forEach(a=>a.setAttribute('rel','noopener'));
 document.querySelectorAll('.service-photo-card button').forEach(btn=>btn.addEventListener('click',()=>document.querySelector('[data-open-chat]')?.click()));
 const p=document.querySelector('.chat-top .chat-avatar');if(p){p.textContent='✚';p.style.color='#d4af37';}
 // Strong focus treatment on medical/emergency content and confirmation before WhatsApp hand-off.
});