import assert from 'node:assert/strict';
import {discoverDynamics} from './src/dynamics.mjs';
const Z=[0,0,0,0],L=[0,1,0,0],LT=[0,1,-1,0],T2=[0,0,-2,0],T1=[0,0,-1,0];
const cases=[{dims:[L,LT],target:T2,f:([x,v])=>-4*x-.3*v},{dims:[Z,T1],target:T2,f:([x,v])=>-(9.81/1.2)*Math.sin(x)-.15*v},{dims:[L,LT],target:T2,f:([x,v])=>-2*x-.8*x**3-.4*v}];
for(let j=0;j<cases.length;j++){let s=17+j;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);const c=cases[j],rows=Array.from({length:300},()=>{const x=[rand()*2.6-1.3,rand()*6-3];return [...x,c.f(x)]});const m=discoverDynamics(rows,c.dims,c.target,{threshold:.015});assert.ok(m.terms.length>0);assert.ok(Number.isFinite(m.trainMSE));}
console.log('3 dynamic-law regression cases passed');
