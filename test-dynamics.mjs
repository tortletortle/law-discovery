import assert from 'node:assert/strict';
import {discoverDynamics,predictDynamics} from './src/dynamics.mjs';
const Z=[0,0,0,0],L=[0,1,0,0],LT=[0,1,-1,0],ACC=[0,1,-2,0],T2=[0,0,-2,0],T1=[0,0,-1,0],VOLT=[1,2,-3,-1],VDOT=[1,2,-4,-1];
const cases=[
 {name:'damped oscillator',dims:[L,LT],target:ACC,expected:['x0','x1'],coeff:[-4,-.3],units:[[0,0,-2,0],[0,0,-1,0]],f:([x,v])=>-4*x-.3*v},
 {name:'nonlinear pendulum',dims:[Z,T1],target:T2,expected:['sin(x0)','x1'],coeff:[-9.81/1.2,-.15],units:[[0,0,-2,0],[0,0,-1,0]],f:([x,v])=>-(9.81/1.2)*Math.sin(x)-.15*v},
 {name:'Duffing oscillator',dims:[L,LT],target:ACC,expected:['x0','x0^3','x1'],coeff:[-2,-.8,-.4],units:[[0,0,-2,0],[0,-2,-2,0],[0,0,-1,0]],f:([x,v])=>-2*x-.8*x**3-.4*v},
 {name:'RC decay',dims:[VOLT],target:VDOT,expected:['x0'],coeff:[-.5],units:[[0,0,-1,0]],f:([v])=>-.5*v}
];
function rng(seed){let s=seed>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
for(let j=0;j<cases.length;j++){
 const c=cases[j],rand=rng(17+j),make=n=>Array.from({length:n},()=>{const x=c.name==='nonlinear pendulum'?[rand()*2.6-1.3,rand()*6-3]:c.name==='RC decay'?[.2+rand()*4]:[rand()*4-2,rand()*6-3];return [...x,c.f(x)];});
 const train=make(300),hold=make(120),m=discoverDynamics(train,c.dims,c.target,{validationRows:hold,threshold:.015});
 const byName=new Map(m.terms.map(t=>[t.expression,t]));
 assert.deepEqual([...byName.keys()].sort(),c.expected.slice().sort(),c.name+' expression recovery');
 for(let i=0;i<c.expected.length;i++){const t=byName.get(c.expected[i]);assert.ok(Math.abs(t.coefficient-c.coeff[i])<1e-6,c.name+' coefficient');assert.deepEqual(t.coefficientDimension,c.units[i],c.name+' coefficient dimensions');}
 assert.ok(m.trainMSE<1e-15&&m.validationMSE<1e-15,c.name+' prediction');
 assert.ok(Math.abs(predictDynamics(m,train[0].slice(0,-1))-train[0].at(-1))<1e-6);
}
assert.throws(()=>discoverDynamics([[1,2],[2,3]],[L],ACC),/at least 3/);
assert.throws(()=>discoverDynamics([[1,2],[2,3],[3,4]],[[0,1,0]],ACC),/Invalid dimensions/);
console.log('4 physical-law recovery tests and 2 input-validation tests passed');
