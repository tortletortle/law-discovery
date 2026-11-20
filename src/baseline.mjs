// Initial baseline: exhaustive single-feature affine symbolic regression.
export function discover(rows) {
  if (!Array.isArray(rows) || rows.length < 3 || rows.some(r => !Array.isArray(r) || r.length !== 2 || !r.every(Number.isFinite))) throw new Error("Expected at least three finite [x,y] rows");
  const features = [["x",x=>x],["x^2",x=>x*x],["x^3",x=>x*x*x],["sin(x)",Math.sin],["exp(x)",Math.exp],["log(x)",Math.log],["1/x",x=>1/x]];
  const mean = a => a.reduce((s,v)=>s+v,0)/a.length;
  const y=rows.map(r=>r[1]), m=mean(y);
  const mse=p=>mean(p.map((v,i)=>(v-y[i])**2));
  const candidates=[{feature:"constant",a:0,b:m,mse:mse(y.map(()=>m))}];
  for(const [feature,fn] of features){
    const z=rows.map(r=>fn(r[0]));
    if(!z.every(Number.isFinite))continue;
    const q=mean(z), v=mean(z.map(t=>(t-q)**2));
    if(!Number.isFinite(v)||v<=0)continue;
    const a=mean(z.map((t,i)=>(t-q)*(y[i]-m)))/v,b=m-a*q;
    const error=mse(z.map(t=>a*t+b));
    if([a,b,error].every(Number.isFinite)) candidates.push({feature,a,b,mse:error});
  }
  return candidates.sort((a,b)=>a.mse-b.mse);
}
