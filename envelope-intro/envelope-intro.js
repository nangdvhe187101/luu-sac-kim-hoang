(function(){
  var cs=document.currentScript, base=cs&&cs.src?cs.src.replace(/[^\/]*$/,''):'/envelope-intro/';
  var once=cs&&cs.dataset.once==='session', KEY='ei-seen';
  var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mount(){
    if(document.querySelector('.ei-root'))return;
    try{if(once&&sessionStorage.getItem(KEY))return;}catch(e){}
    var A=base+'assets/';
    var root=document.createElement('div');root.className='ei-root';root.setAttribute('role','dialog');root.setAttribute('aria-label','Thiệp mời Lưu Sắc Kim Hoàng');
    root.innerHTML=
     '<div class="ei-brand">'+
      '<img src="/assets/logo-typography.png" alt="Logo Lưu Sắc Kim Hoàng" class="ei-brand-logo">'+
      '<div class="ei-brand-text">'+
       '<span class="ei-brand-title">Lưu Sắc Kim Hoàng</span>'+
       '<span class="ei-brand-subtitle">Tranh Dân Gian Việt Nam</span>'+
      '</div>'+
     '</div>'+
     '<img src="/assets/pptx-extracted/ppt/media/image49.png" alt="" aria-hidden="true" class="ei-cloud ei-cloud--top">'+
     '<img src="/assets/pptx-extracted/ppt/media/image49.png" alt="" aria-hidden="true" class="ei-cloud ei-cloud--bottom">'+
     '<div class="ei-stage">'+
      '<p class="ei-pretitle">Thiệp Mời Trực Tuyến • Tranh Dân Gian Việt Nam</p>'+
      '<div class="ei-env">'+
       '<div class="ei-liner"></div>'+
       '<div class="ei-card"><p><b>Hành Trình Sắc Đỏ</b></p><img src="'+A+'invitation-logo.jpg" alt="Lưu Sắc Kim Hoàng"></div>'+
       '<img class="ei-body" src="'+A+'envelope-body.webp" alt="" draggable="false">'+
       '<div class="ei-flap"><div class="ei-face"><img src="'+A+'envelope-flap.webp" alt="" draggable="false"></div><div class="ei-face ei-k"></div></div>'+
       '<button class="ei-seal" type="button" aria-label="Mở thiệp / Open invitation"><img src="'+A+'envelope-seal.webp" alt="Dấu triện Lưu Sắc Kim Hoàng" draggable="false"></button>'+
      '</div>'+
      '<p class="ei-hint">Nhấn vào ấn triện để mở thiệp</p>'+
     '</div>';
    document.body.appendChild(root);
    var de=document.documentElement,prev=de.style.overflow;de.style.overflow='hidden';
    var env=root.querySelector('.ei-env'),flap=root.querySelector('.ei-flap'),seal=root.querySelector('.ei-seal'),stage=root.querySelector('.ei-stage');
    var state='idle';
    function enter(){
      if(state==='gone')return;state='gone';
      try{if(once)sessionStorage.setItem(KEY,'1');}catch(e){}
      de.style.overflow=prev;
      document.body.classList.remove('cover-locked');
      window.scrollTo(0,0);
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          root.classList.add('ei-leave');
          setTimeout(function(){
            root.remove();
            setTimeout(function(){
              try{window.dispatchEvent(new CustomEvent('invitation:opened'));}catch(e){}
              if(typeof window.onInvitationOpened==='function')window.onInvitationOpened();
            },180);
          },reduce?40:780);
        });
      });
    }
    function burst(){
      var s=seal.getBoundingClientRect(),e=env.getBoundingClientRect();
      for(var i=0;i<22;i++){var d=document.createElement('i');d.className='ei-sp';
        d.style.left=(s.left+s.width/2-e.left)+'px';d.style.top=(s.top+s.height/2-e.top)+'px';env.appendChild(d);
        var a=i/22*6.283+Math.random()*.4,r=70+Math.random()*120;
        (function(d){d.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+Math.cos(a)*r+'px,'+Math.sin(a)*r+'px) scale(0)',opacity:0}],
          {duration:650+Math.random()*350,easing:'cubic-bezier(.2,.7,.3,1)'}).onfinish=function(){d.remove()};})(d);}
    }
    async function open(){
      if(state!=='idle')return;state='opening';
      if(reduce){root.classList.add('ei-opened');return enter();}
      burst();var T='translate(-50%,-50%) ';
      await seal.animate([{transform:T+'scale(1)',opacity:1},{transform:T+'scale(1.18) rotate(-7deg)',opacity:1,offset:.35},{transform:T+'scale(.2) rotate(28deg)',opacity:0}],{duration:520,fill:'forwards'}).finished;
      seal.style.visibility='hidden';root.classList.add('ei-opened');
      flap.classList.add('ei-open');await sleep(430);flap.classList.add('ei-behind');await sleep(520);
      env.classList.add('ei-up');await sleep(950);
      state='opened';
      await sleep(1100);
      if(state==='opened')enter();
    }
    seal.addEventListener('click',open);
    root.addEventListener('click',function(e){if(state==='opened')enter();});
    document.addEventListener('keydown',function onk(e){if(!document.body.contains(root)){document.removeEventListener('keydown',onk);return;}
      if(e.key==='Escape')enter();});
  }
  window.showEnvelopeIntro=mount;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
