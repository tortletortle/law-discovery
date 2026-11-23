import {discoverDynamics} from './src/dynamics.mjs';
// Reproducible synthetic benchmark: 4 laws x 10 seeds x 4 training-noise levels.
// Exact recovery requires the expected basis and coefficients within 15%; validation NMSE is reported separately.
function rng(seed){let s=seed>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
const Z=[0,0,0,0],L=[0,1,0,0],LT=[0,1,-1,0],ACC=[0,1,-2,0],T2=[0,0,-2,0],T1=[0,0,-1,0],VOLT=[1,2,-3,-1],VDOT=[1,2,-4,-1];
const cases=[
{name:'damped oscillator',dims:[L,LT],target:ACC,expected:[['x0',-4],['x1',-.3]],f:([x,v])=>-4*x-.3*v},
{name:'nonlinear pendulum',dims:[Z,T1],target:T2,expected:[['sin(x0)',-9.81/1.2],['x1',-.15]],f:([x,v])=>-(9.81/1.2)*Math.sin(x)-.15*v},
{name:'Duffing oscillator',dims:[L,LT],target:ACC,expected:[['x0',-2],['x0^3',-.8],['x1',-.4]],f:([x,v])=>-2*x-.8*x**3-.4*v},
{name:'RC decay',dims:[VOLT],target:VDOT,expected:[['x0',-.5]],f:([v])=>-.5*v}];
const runs=[];
for(let ci=0;ci<cases.length;ci++){const c=cases[ci];for(let seed=1;seed<=10;seed++){const r=rng(seed+ci*1009),noiseR=rng(seed+ci*1009+100000);const draw=()=>c.name==='nonlinear pendulum'?[r()*2.6-1.3,r()*6-3]:c.name==='RC decay'?[.2+r()*4]:[r()*4-2,r()*6-3];const make=n=>Array.from({length:n},()=>{const x=draw();return [...x,c.f(x)]});const train0=make(300),hold=make(120),rms=Math.sqrt(train0.reduce((s,row)=>s+row.at(-1)**2,0)/train0.length);for(const noise of [0,.01,.05,.1]){const train=train0.map(row=>[...row.slice(0,-1),row.at(-1)+noise*rms*Math.sqrt(12)*(noiseR()-.5)]);const m=discoverDynamics(train,c.dims,c.target,{validationRows:hold,threshold:.015});const actual=new Map(m.terms.map(t=>[t.expression,t.coefficient]));const exact=actual.size===c.expected.length&&c.expected.every(([name,val])=>actual.has(name)&&Math.abs(actual.get(name)-val)<=Math.max(1e-5,Math.abs(val)*.15));const nmse=m.validationMSE/Math.max(1e-30,hold.reduce((s,row)=>s+row.at(-1)**2,0)/hold.length);runs.push({system:c.name,seed,noise,exact,termCount:m.terms.length,trainMSE:m.trainMSE,validationMSE:m.validationMSE,validationNMSE:nmse,terms:m.terms.map(t=>({expression:t.expression,coefficient:t.coefficient,coefficientDimension:t.coefficientDimension}))});}}}
const summary=[];for(const system of cases.map(c=>c.name))for(const noise of [0,.01,.05,.1]){const a=runs.filter(r=>r.system===system&&r.noise===noise);summary.push({system,noise,n:a.length,exactRecoveries:a.filter(r=>r.exact).length,meanValidationNMSE:a.reduce((s,r)=>s+r.validationNMSE,0)/a.length});}
console.log(JSON.stringify({summary,runs},null,2));
