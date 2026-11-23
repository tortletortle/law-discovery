import assert from 'node:assert/strict';
import {estimateDerivatives,toDynamicsRows} from './src/derivatives.mjs';
import {discoverDynamics} from './src/dynamics.mjs';
const uniform=Array.from({length:51},(_,i)=>{const t=i*.1;return [t,3+2*t-.5*t*t];});
const q=estimateDerivatives(uniform,{window:9,degree:2,maxDerivative:2});
for(const r of q){assert.ok(Math.abs(r.derivatives[0][0]-(2-r.time))<1e-9);assert.ok(Math.abs(r.derivatives[1][0]+1)<1e-9);}
const irregular=Array.from({length:101},(_,i)=>{const t=i*.1+.003*Math.sin(i*1.7);return [t,1+2*t-.5*t*t+.1*t**3];}).sort((a,b)=>a[0]-b[0]);
const c=estimateDerivatives(irregular,{window:9,degree:3,maxDerivative:2});
for(const r of c){assert.ok(Math.abs(r.derivatives[0][0]-(2-r.time+.3*r.time*r.time))<1e-8);assert.ok(Math.abs(r.derivatives[1][0]-(-1+.6*r.time))<1e-8);}
const wd=Math.sqrt(4-.15*.15),series=Array.from({length:1001},(_,i)=>{const t=i*.02;return [t,Math.exp(-.15*t)*Math.cos(wd*t)];});
const estimates=estimateDerivatives(series,{window:15,degree:5,maxDerivative:2});
const rows=toDynamicsRows(estimates,{targetState:0,derivativeOrder:2,excludeEdges:true});
assert.equal(rows.length,series.length-14);
const L=[0,1,0,0],LT=[0,1,-1,0],ACC=[0,1,-2,0];
const model=discoverDynamics(rows,[L,LT],ACC,{threshold:.02});
const terms=new Map(model.terms.map(t=>[t.expression,t.coefficient]));
assert.equal(terms.size,2);
assert.ok(Math.abs(terms.get('x0')+4)<1e-3);
assert.ok(Math.abs(terms.get('x1')+.3)<1e-3);
assert.throws(()=>estimateDerivatives([[0,1],[0,2],[1,3]]),/strictly increasing/);
console.log('Derivative tests passed: uniform polynomial, irregular cubic, and end-to-end damped oscillator.');
