import {evolve,predict} from './src/selection.mjs';
export function benchmark(){
 const D=[0,0,0,0], targets=[['sin(sum)',x=>Math.sin(x[0]+x[1])],['product',x=>x[0]*x[1]*x[2]],['exp(diff)',x=>Math.exp(x[0]-x[1])],['sum*third',x=>(x[0]+x[1])*x[2]],['cos(product)',x=>Math.cos(x[0]*x[1])],['ratio',x=>x[0]/(x[1]+x[2])]];
 const rng=seed=>{let s=seed>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);};
 const configs=[{name:'unpenalized',mode:'fixed',penalty:0},{name:'fixed',mode:'fixed',penalty:1e-5},{name:'anneal',mode:'anneal',penalty:1e-5},{name:'pareto',mode:'pareto',penalty:1e-5}];
 const runs=[];
 function nmse(c,rows){if(!c)return null;let e=0,n=0;for(const r of rows){const p=predict(c,r.slice(0,-1));if(!Number.isFinite(p))return null;e+=(p-r.at(-1))**2;n+=r.at(-1)**2;}const v=e/Math.max(n,1e-30);return Number.isFinite(v)?v:null;}
 for(const [idx,[name,f]] of targets.entries())for(let seed=11;seed<=20;seed++){
  const rand=rng(seed+1009*idx), perturb=rng(seed+900001+1009*idx);
  const make=(count,lo,hi)=>Array.from({length:count},()=>{const x=Array.from({length:3},()=>lo+rand()*(hi-lo));return [...x,f(x)];});
  const clean=make(25,.3,1.8), hold=make(40,.3,1.8), extra=make(40,1.8,2.5);
  const rms=Math.sqrt(clean.reduce((s,r)=>s+r[3]**2,0)/clean.length), eps=clean.map(()=>Math.sqrt(12)*(perturb()-.5));
  for(const noise of [0,.05]){
   const rows=clean.map((r,i)=>[...r.slice(0,3),r[3]+noise*rms*eps[i]]);
   for(const config of configs){
    const {best,validCount}=evolve(rows,[D,D,D],D,{...config,seed:seed+51001+idx*1009,budget:2000});
    runs.push({name,seed,noise,mode:config.name,hold:nmse(best,hold),extra:nmse(best,extra),nodes:best?.nodes??null,validCount});
   }
  }
 }
 const summary=[];
 const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
 const median=a=>{if(!a.length)return null;const s=a.slice().sort((x,y)=>x-y),k=Math.floor(s.length/2);return s.length%2?s[k]:(s[k-1]+s[k])/2;};
 for(const noise of [0,.05])for(const {name:mode} of configs){
   const a=runs.filter(r=>r.noise===noise&&r.mode===mode),hit=k=>a.filter(r=>r[k]!==null&&r[k]<.01).length, m=k=>a.map(r=>r[k]).filter(v=>v!==null);
   summary.push({noise,mode,n:a.length,holdHits:hit('hold'),extraHits:hit('extra'),finiteHold:m('hold').length,finiteExtra:m('extra').length,medianHold:median(m('hold')),medianExtra:median(m('extra')),meanNodes:mean(m('nodes'))});
 }
 return {summary,runs};
}
console.log(JSON.stringify(benchmark(),null,2));
