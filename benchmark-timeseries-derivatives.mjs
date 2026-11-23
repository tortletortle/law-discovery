import {estimateDerivatives,toDynamicsRows} from './src/derivatives.mjs';
import {discoverDynamics} from './src/dynamics.mjs';
function rng(seed){let s=seed>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
const wd=Math.sqrt(4-.15*.15),L=[0,1,0,0],LT=[0,1,-1,0],ACC=[0,1,-2,0],runs=[];
for(const window of [9,15,21,31])for(const noise of [0,.001,.005,.01,.02])for(let seed=1;seed<=5;seed++){
 const rand=rng(seed+window*101+Math.round(noise*1e6)),clean=Array.from({length:501},(_,i)=>{const t=i*.02;return [t,Math.exp(-.15*t)*Math.cos(wd*t)];});
 const rms=Math.sqrt(clean.reduce((s,r)=>s+r[1]**2,0)/clean.length),measured=clean.map(r=>[r[0],r[1]+noise*rms*Math.sqrt(12)*(rand()-.5)]);
 const estimates=estimateDerivatives(measured,{window,degree:5,maxDerivative:2}),rows=toDynamicsRows(estimates,{targetState:0,derivativeOrder:2,excludeEdges:true});
 const model=discoverDynamics(rows,[L,LT],ACC,{threshold:.02}),map=new Map(model.terms.map(t=>[t.expression,t.coefficient]));
 const exact=map.size===2&&map.has('x0')&&map.has('x1')&&Math.abs(map.get('x0')+4)<.2&&Math.abs(map.get('x1')+.3)<.03;
 const coefficientAbsError=map.has('x0')&&map.has('x1')?Math.max(Math.abs(map.get('x0')+4),Math.abs(map.get('x1')+.3)):null;\n runs.push({window,noise,seed,exact,coefficientAbsError,terms:model.terms.map(t=>({expression:t.expression,coefficient:t.coefficient})),fitMSE:model.trainMSE});
}
const summary=[];for(const window of [9,15,21,31])for(const noise of [0,.001,.005,.01,.02]){const a=runs.filter(r=>r.window===window&&r.noise===noise);summary.push({window,noise,n:a.length,exactRecoveries:a.filter(r=>r.exact).length,validCoefficientRuns:a.filter(r=>r.coefficientAbsError!==null).length,meanCoefficientAbsError:a.filter(r=>r.coefficientAbsError!==null).reduce((s,r)=>s+r.coefficientAbsError,0)/Math.max(1,a.filter(r=>r.coefficientAbsError!==null).length),meanFitMSE:a.reduce((s,r)=>s+r.fitMSE,0)/a.length});}
console.log(JSON.stringify({summary,runs},null,2));
