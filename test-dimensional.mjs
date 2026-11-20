import assert from 'node:assert/strict';
import {search} from './src/dimensional.mjs';
const D=[0,0,0,0], L=[0,1,0,0], T=[0,0,1,0], V=[0,1,-1,0];
for(const [dims,target,f] of [[[L,T],V,(x,t)=>3*x/t],[[L,L],[0,2,0,0],(x,t)=>2*x*t],[[D,D],D,(x,t)=>2*Math.sin(x+t)]]){
 const rows=Array.from({length:40},(_,i)=>{const x=.3+i*.03,t=.4+((i*17)%41)*.04;return [x,t,f(x,t)]});
 const r=search(rows,dims,target);
 assert.ok(r.candidates[0]?.mse<1e-20);
 console.log(r.candidates[0],r.generated,r.truncated);
}
