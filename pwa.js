/* Install + update experience. Service worker needs HTTPS or localhost. */
(() => {
  'use strict';
  let deferred=null;
  const dialog=document.getElementById('installDialog');
  const status=document.getElementById('installStatus');
  const installNow=document.getElementById('installNow');
  const close=document.getElementById('closeDialog');
  const showMsg=message=>{if(status)status.textContent=message;};
  const installed=()=>window.matchMedia('(display-mode: standalone)').matches || navigator.standalone===true;
  const isiOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
  const updateGuidance=()=>{
    if(installed()){showMsg('This website is already installed.');if(installNow)installNow.hidden=true;}
    else if(deferred){showMsg('Ready to install. Choose Install app below.');if(installNow)installNow.hidden=false;}
    else if(isiOS()){showMsg('In Safari, tap Share then Add to Home Screen. iPhone does not show the standard install prompt.');if(installNow)installNow.hidden=true;}
    else {showMsg('Open the browser menu and choose Install app or Add to Home Screen where supported.');if(installNow)installNow.hidden=true;}
  };
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;updateGuidance();});
  window.addEventListener('appinstalled',()=>{deferred=null;updateGuidance();dialog?.close();});
  document.querySelectorAll('#installHelp,[data-install]').forEach(btn=>btn.addEventListener('click',()=>{updateGuidance();if(dialog?.showModal)dialog.showModal();}));
  close?.addEventListener('click',()=>dialog?.close());
  installNow?.addEventListener('click',async()=>{if(!deferred)return;const prompt=deferred;deferred=null;try{await prompt.prompt();const choice=await prompt.userChoice;showMsg(choice.outcome==='accepted'?'Installation accepted. Check your app list.':'You can install later from the browser menu.');}catch{showMsg('Use your browser menu to install if supported.');}updateGuidance();});
  if(!('serviceWorker' in navigator))return;
  if(!window.isSecureContext){showMsg('PWA offline features require HTTPS or localhost.');return;}
  addEventListener('load',async()=>{
    try{
      const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
      registration.addEventListener('updatefound',()=>{
        const worker=registration.installing;
        if(!worker)return;
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed' && navigator.serviceWorker.controller){
            const banner=document.createElement('div');banner.className='update-banner';banner.setAttribute('role','status');
            const text=document.createElement('span');text.textContent='A new website version is ready.';
            const btn=document.createElement('button');btn.type='button';btn.textContent='Update now';
            btn.addEventListener('click',()=>worker.postMessage({type:'SKIP_WAITING'}));banner.append(text,btn);document.body.append(banner);
          }
        });
      });
      let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!reloading){reloading=true;location.reload();}});
    }catch(err){console.warn('PWA registration unavailable:',err);}
  });
})();
