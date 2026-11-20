// V0.2 bounded expression enumeration with dimensional typing.
// Dimensions are integer exponent vectors [mass,length,time,current].
export function search(rows, dims, target, {depth=2, cap=5000}={}) {
  const valid=d=>Array.isArray(d)&&d.length===4&&d.every(Number.isInteger);
  if(!Array.isArray(dims)||!dims.length||!dims.every(valid)||!valid(target)||!Array.isArray(rows)||rows.length<3||rows.some(r=>!Array.isArray(r)||r.length!==dims.length+1||!r.every(Number.isFinite)))throw Error("Invalid input");
  if(!Number.isInteger(depth)||depth<0||depth>3||!Number.isInteger(cap)||cap<dims.length+1||cap>20000)throw Error("Invalid budget");
  const zero=[0,0,0,0], eq=(a,b)=>a.every((v,i)=>v===b[i]);
  const pool=[], seen=new Set();
  let truncated=false, rejected=0;
  function add(s,d,v){if(seen.has(s))return;if(pool.length>=cap){truncated=true;return;}if(!v.every(Number.isFinite))return;seen.add(s);pool.push({s,d,v});}
  const n=rows.length,y=rows.map(r=>r.at(-1));
  dims.forEach((d,i)=>add("x"+i,d,rows.map(r=>r[i])));
  add("1",zero,rows.map(()=>1));
  for(let k=0;k<depth&&!truncated;k++){
    const old=pool.slice();
    for(const a of old){if(truncated)break;
      if(eq(a.d,zero))for(const [name,fn] of [["sin",Math.sin],["cos",Math.cos],["exp",Math.exp],["log",Math.log]])add(name+"("+a.s+")",zero,a.v.map(fn));
      for(const b of old){if(truncated)break;
        for(const op of ["+","-","*","/"]){
          if((op==="+"||op==="*")&&a.s>b.s)continue;
          if((op==="+"||op==="-")&&!eq(a.d,b.d)){rejected++;continue;}
          const d=op==="+"||op==="-"?a.d:a.d.map((v,i)=>v+(op==="*"?1:-1)*b.d[i]);
          add("("+a.s+op+b.s+")",d,a.v.map((v,i)=>op==="+"?v+b.v[i]:op==="-"?v-b.v[i]:op==="*"?v*b.v[i]:v/b.v[i]));
        }
      }
    }
  }
  const candidates=[];
  for(const a of pool){if(!eq(a.d,target))continue;
    const q=a.v.reduce((s,v)=>s+v*v,0);if(!Number.isFinite(q)||q===0)continue;
    const scale=a.v.reduce((s,v,i)=>s+v*y[i],0)/q;
    const mse=a.v.reduce((s,v,i)=>s+(scale*v-y[i])**2,0)/n;
    if(Number.isFinite(mse))candidates.push({expression:a.s,scale,mse});
  }
  candidates.sort((a,b)=>a.mse-b.mse||a.expression.length-b.expression.length);
  return {candidates,generated:pool.length,rejected,truncated};
}
