import {discoverDynamics} from './src/dynamics.mjs';
// Synthetic state-space excitation study for a damped nonlinear pendulum.
function rng(seed){let s=seed>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
const Z=[0,0,0,0],T1=[0,0,-1,0],T2=[0,0,-2,0],runs=[];
for(const angleMax of [1.3,2,2.6,3])for(const noise of [.01,.05,.1])for(let seed=1;seed<=20;seed++){
 const r=rng(seed+71),nr=rng(seed+100071),make=n=>Array.from({length:n},()=>{const x=r()*2*angleMax-angleMax,w=r()*6-3;return [x,w,-(9.81/1.2)*Math.sin(x)-.15*w];});
 const clean=make(300),hold=make(120),rms=Math.sqrt(clean.reduce((s,a)=>s+a[2]**2,0)/300),train=clean.map(a=>[a[0],a[1],a[2]+noise*rms*Math.sqrt(12)*(nr()-.5)]);
 const m=discoverDynamics(train,[Z,T1],T2,{validationRows:hold,threshold:.03}),map=new Map(m.terms.map(t=>[t.expression,t.coefficient]));
 const exact=map.size===2&&map.has('sin(x0)')&&map.has('x1')&&Math.abs(map.get('sin(x0)')+9.81/1.2)<.15&&Math.abs(map.get('x1')+.15)<.03;
 runs.push({angleMax,noise,seed,exact,terms:m.terms.map(t=>({expression:t.expression,coefficient:t.coefficient})),validationNMSE:m.validationMSE/hold.reduce((s,a)=>s+a[2]**2,0)*120});
}
const summary=[];for(const angleMax of [1.3,2,2.6,3])for(const noise of [.01,.05,.1]){const a=runs.filter(r=>r.angleMax===angleMax&&r.noise===noise);summary.push({angleMax,noise,n:a.length,exactRecoveries:a.filter(r=>r.exact).length,meanValidationNMSE:a.reduce((s,r)=>s+r.validationNMSE,0)/a.length});}
console.log(JSON.stringify({summary,runs},null,2));
