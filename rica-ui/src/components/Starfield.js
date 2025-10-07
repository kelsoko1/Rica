import React, {useRef, useEffect} from 'react';

export default function Starfield({children}){
  const canvasRef = useRef();
  useEffect(()=>{
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w=canvas.width = canvas.clientWidth;
    let h=canvas.height = canvas.clientHeight;
    let stars = [];
    const STAR_COUNT = Math.max(80, Math.floor((w*h)/10000));
    for(let i=0;i<STAR_COUNT;i++){
      stars.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: Math.random()*1.2 + 0.2,
        vx: (Math.random()-0.5)*0.02,
        vy: (Math.random()-0.5)*0.02,
        alpha: Math.random()*0.6 + 0.2,
      });
    }
    let raf;
    function draw(){
      w=canvas.width = canvas.clientWidth;
      h=canvas.height = canvas.clientHeight;
      ctx.clearRect(0,0,w,h);
      // subtle grid
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      for(let gx=0;gx<w;gx+=60){
        ctx.moveTo(gx,0); ctx.lineTo(gx,h);
      }
      for(let gy=0;gy<h;gy+=60){
        ctx.moveTo(0,gy); ctx.lineTo(w,gy);
      }
      ctx.stroke();

      // stars
      for(let s of stars){
        s.x += s.vx; s.y += s.vy;
        if(s.x<0) s.x = w;
        if(s.x>w) s.x = 0;
        if(s.y<0) s.y = 0;
        if(s.y>h) s.y = 0;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(173,216,230,'+s.alpha+')';
        ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return ()=> cancelAnimationFrame(raf);
  },[]);
  return (
    <div className="starfield-wrap">
      <canvas ref={canvasRef} className="starfield-canvas" />
      <div className="starfield-content">
        {children}
      </div>
    </div>
  );
}
