import { useEffect, useRef } from 'react';
import { rows, fingerForKey } from './engine.mjs';
type Key = {label:string; x:number; y:number; width:number};
export const keys: Key[] = [];
rows.forEach((row: string[], r: number) => {
  let x = 22;
  row.forEach((label: string, i: number) => {
    const width = label === 'space' ? 232 : r === 4 ? 48 : i === 0 ? [43,57,65,84][r] : label === 'enter' ? 65 : label === 'shift' ? 74 : 37;
    keys.push({label,x,y:20+r*36,width}); x += width+5;
  });
});
function Hand({side, pressed, reduced}: {side:number;pressed:string;reduced:boolean}) {
 const group = useRef<SVGGElement>(null);
 const target = useRef(pressed);
 useEffect(() => {target.current=pressed;},[pressed]);
 useEffect(() => {
   let frame = 0;
   const nodes = Array.from(group.current!.querySelectorAll('circle'));
   const paths = Array.from(group.current!.querySelectorAll('polyline'));
   const bases = side === 0 ? [99,144,187,233,283] : [559,514,471,425,375];
   const tips = [107,83,70,85,156];
   const wrist = [side === 0 ? 216 : 442, 270];
   const points = Array.from({length:21}, () => [...wrist]);
   let last=0;
   const draw = (time:number) => {
     const dt = last ? Math.min(40,time-last) : 16; last=time;
     const [hand,finger] = fingerForKey(target.current);
     const key = keys.find(k => k.label === target.current);
     const goals:number[][] = [[...wrist]];
     for(let f=0;f<5;f++) {
       const active = key && hand===side && finger===f && target.current;
       const tx = active ? key.x+key.width/2 : bases[f];
       const ty = active ? key.y+14 : tips[f];
       const bx = side===0 ? 170+f*19 : 488-f*19;
       for(let j=0;j<4;j++) {
         const t=(j+1)/4;
         goals.push([bx+(tx-bx)*t,235+(ty-235)*t]);
       }
     }
     points.forEach((p,i) => {
       const ease = reduced ? 1 : 1-Math.exp(-dt/40);
       p[0]+=(goals[i][0]-p[0])*ease; p[1]+=(goals[i][1]-p[1])*ease;
       nodes[i]?.setAttribute('cx',String(p[0])); nodes[i]?.setAttribute('cy',String(p[1]));
     });
     for(let f=0;f<5;f++) paths[f].setAttribute('points',[points[0],...points.slice(1+f*4,5+f*4)].map(p=>p.join(',')).join(' '));
     paths[5].setAttribute('points',[points[1],points[5],points[9],points[13],points[17],points[0]].map(p=>p.join(',')).join(' '));
     if (!reduced) frame=requestAnimationFrame(draw);
   };
   const visible=()=>{cancelAnimationFrame(frame);if(!document.hidden)frame=requestAnimationFrame(draw);};
   document.addEventListener('visibilitychange',visible); draw(0);
   return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visible);};
 },[side,reduced]);
 return <g ref={group} className="hand">{Array.from({length:6},(_,i)=><polyline key={i} fill="none"/>)}{Array.from({length:21},(_,i)=><circle key={i} r={i===0?3:2}/>)}<rect className="tracking-box" x={side===0?76:356} y="56" width="225" height="228"/><text x={side===0?78:358} y="48">{side===0?'L':'R'}_HAND / 21 landmarks</text><text x={side===0?78:358} y="302">{side===0?'00':'01'} · synthetic tracking</text></g>;
}
export default function KeyboardVisualizer({pressed,reduced}:{pressed:string;reduced:boolean}) {
 return <div className="keyboard-wrap"><svg className="keyboard" viewBox="0 0 660 320" role="img" aria-label="Virtual keyboard with two skeletal hands synchronized to the code animation">
 {keys.map((key,i)=><g key={i} className={`key ${key.label===pressed?'pressed':''}`}><rect x={key.x} y={key.y} width={key.width} height="29" rx="3"/><text x={key.x+key.width/2} y={key.y+18} textAnchor="middle">{key.label==='space'?'':key.label}</text></g>)}
 <Hand side={0} pressed={pressed} reduced={reduced}/><Hand side={1} pressed={pressed} reduced={reduced}/>
 </svg><span className="tracking-caption"><i/> input → key → landmark · synchronized</span></div>;
}
