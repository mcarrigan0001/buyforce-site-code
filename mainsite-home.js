/* BuyForce main/home page scripts */

/* 1) Hero dot-grid canvas effect */
(function(){
  var cv=document.querySelector('.hero-fx'); if(!cv) return;
  var ctx=cv.getContext('2d');
  var hover=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var W=0,H=0,dpr=1,mx=0.5,my=0.32,raf=0;
  function draw(){
    if(!W||!H) return;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
    var gap=26,R=150,cx=mx*W,cy=my*H;
    for(var y=gap/2;y<H;y+=gap){ for(var x=gap/2;x<W;x+=gap){
      var d=Math.hypot(x-cx,y-cy),f=Math.max(0,1-d/R),r=1+f*1.8;
      ctx.beginPath(); ctx.arc(x,y,r,0,7);
      ctx.fillStyle=f>0.02?'rgba(76,184,38,'+(0.2+0.62*f).toFixed(3)+')':'rgba(150,150,150,0.22)';
      ctx.fill();
    }}
  }
  function size(){
    var r=cv.getBoundingClientRect(); if(!r.width||!r.height) return;
    dpr=Math.min(2,window.devicePixelRatio||1); W=r.width; H=r.height;
    cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); draw();
  }
  if(hover && !reduce){
    var host=cv.parentElement;
    host.addEventListener('pointermove',function(e){
      var r=cv.getBoundingClientRect();
      mx=(e.clientX-r.left)/r.width; my=(e.clientY-r.top)/r.height;
      if(!raf) raf=requestAnimationFrame(function(){raf=0;draw();});
    });
    host.addEventListener('pointerleave',function(){
      mx=0.5; my=0.32;
      if(!raf) raf=requestAnimationFrame(function(){raf=0;draw();});
    });
  }
  window.addEventListener('resize',size);
  if(window.ResizeObserver) new ResizeObserver(size).observe(cv.parentElement);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(size);
  if(document.readyState!=='loading') size(); else document.addEventListener('DOMContentLoaded',size);
})();

/* 2) Messenger mock responsive zoom-to-fit */
(function(){
  var DESIGN_W = 680;
  var supportsZoom = (function(){ try { return CSS.supports('zoom','1'); } catch(e){ return false; } })();
  function fit(){
    var wrap = document.querySelector('.messenger-mock');
    if(!wrap) return;
    var inner = wrap.firstElementChild;
    if(!inner) return;
    if(window.matchMedia('(max-width:880px)').matches){
      var s = wrap.clientWidth / DESIGN_W;
      if(supportsZoom){
        inner.style.transform = '';
        wrap.style.height = '';
        inner.style.zoom = String(s);
      } else {
        inner.style.zoom = '';
        inner.style.transform = 'scale(' + s + ')';
        wrap.style.height = (inner.offsetHeight * s) + 'px';
      }
    } else {
      inner.style.zoom = '';
      inner.style.transform = '';
      wrap.style.height = '';
    }
  }
  ['resize','orientationchange','load'].forEach(function(ev){ window.addEventListener(ev, fit); });
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(fit); }
  if(document.readyState !== 'loading'){ fit(); } else { document.addEventListener('DOMContentLoaded', fit); }
})();
