// Seeded tree evolution; score budget counts attempted trees, including invalid ones.
export function evolve(rows,dims,target,{seed=1,budget=2000,population=40,penalty=1e-5,maxNodes=15}={}){
 const valid=d=>Array.isArray(d)&&d.length===4&&d.every(Number.isInteger);
 if(!dims.length||!dims.every(valid)||!valid(target)||rows.length<3||rows.some(r=>r.length!==dims.length+1||!r.every(Number.isFinite))||!Number.isInteger(budget)||budget<1||!Number.isInteger(population)||population<2||!Number.isInteger(maxNodes)||maxNodes<1||!Number.isFinite(penalty)||penalty<0)throw Error("Invalid input");
 let state=seed>>>0;const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296),pick=a=>a[Math.floor(rand()*a.length)];
 const zero=[0,0,0,0],eq=(a,b)=>a.every((v,i)=>v===b[i]),ops=['+','-','*','/','sin','cos','exp','log'];
 const leaf=()=>({i:Math.floor(rand()*(dims.length+1))});
 function random(d){if(d<=0||rand()<.35)return leaf();const op=pick(ops);return {op,a:random(d-1),...(op.length===1?{b:random(d-1)}:{})};}
 const size=t=>t.op?1+size(t.a)+(t.b?size(t.b):0):1;
 function paths(t,p=[]){return [p,...(t.op?paths(t.a,[...p,'a']):[]),...(t.b?paths(t.b,[...p,'b']):[])];}
 const get=(t,p)=>p.reduce((a,k)=>a[k],t);
 function replace(t,p,r){return p.length?{...t,[p[0]]:replace(t[p[0]],p.slice(1),r)}:r;}
 function dimension(t){if(!t.op)return dims[t.i]??zero;const a=dimension(t.a);if(!a)return null;if(!t.b)return eq(a,zero)?zero:null;const b=dimension(t.b);if(!b)return null;return ['+','-'].includes(t.op)?(eq(a,b)?a:null):a.map((v,i)=>v+(t.op==='*'?1:-1)*b[i]);}
 function evalTree(t,r){if(!t.op)return t.i===dims.length?1:r[t.i];const a=evalTree(t.a,r);if(!t.b)return Math[t.op](a);const b=evalTree(t.b,r);return t.op==='+'?a+b:t.op==='-'?a-b:t.op==='*'?a*b:a/b;}
 function format(t){return !t.op?(t.i===dims.length?'1':'x'+t.i):t.b?'('+format(t.a)+t.op+format(t.b)+')':t.op+'('+format(t.a)+')';}
 const y=rows.map(r=>r.at(-1)), norm=Math.max(1e-30,y.reduce((s,v)=>s+v*v,0)/y.length);
 let pool=[],best=null,validCount=0;
 for(let i=0;i<budget;i++){
   let t;
   if(i<dims.length+1)t={i};else if(!pool.length||rand()<.25)t=random(3);else {const a=pick(pool).tree;const p=pick(paths(a));const b=pick(pool).tree;t=replace(a,p,rand()<.5?random(2):get(b,pick(paths(b))));}
   const n=size(t),d=dimension(t);if(n>maxNodes||!d||!eq(d,target))continue;
   const v=rows.map(r=>evalTree(t,r));if(!v.every(Number.isFinite))continue;
   const q=v.reduce((s,x)=>s+x*x,0);if(!Number.isFinite(q)||q===0)continue;
   const scale=v.reduce((s,x,j)=>s+x*y[j],0)/q,mse=v.reduce((s,x,j)=>s+(scale*x-y[j])**2,0)/v.length,score=mse/norm+penalty*n;
   if(!Number.isFinite(score))continue;validCount++;
   const expression=format(t), c={tree:t,expression,scale,mse,score,nodes:n};
   if(!best||score<best.score)best=c;
   if(!pool.some(x=>x.expression===expression)){pool.push(c);pool.sort((a,b)=>a.score-b.score);if(pool.length>population)pool.pop();}
 }
 return {best,attempts:budget,validCount};
}
