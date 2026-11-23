// V0.6: sparse discovery of multi-term dynamical laws with inferred coefficient dimensions.
const ZERO=[0,0,0,0];
const validDim=d=>Array.isArray(d)&&d.length===4&&d.every(Number.isInteger);
const sameDim=(a,b)=>a.every((v,i)=>v===b[i]);
const subDim=(a,b)=>a.map((v,i)=>v-b[i]);
const addDim=(a,b)=>a.map((v,i)=>v+b[i]);
function validateRows(rows,n,name){
 if(!Array.isArray(rows)||rows.length<3||rows.some(r=>!Array.isArray(r)||r.length!==n+1||!r.every(Number.isFinite)))throw Error(name+" must contain at least 3 finite rows with "+(n+1)+" columns");
}
function makeLibrary(rows,dims,maxDegree,includeTrig){
 const n=dims.length, powers=[];
 function compositions(pos,left,a){
  if(pos===n-1){a[pos]=left;powers.push(a.slice());return;}
  for(let k=0;k<=left;k++){a[pos]=k;compositions(pos+1,left-k,a);}
 }
 for(let degree=1;degree<=maxDegree;degree++)compositions(0,degree,Array(n).fill(0));
 const features=[{kind:"monomial",powers:Array(n).fill(0),expression:"1",dimension:ZERO.slice()}];
 for(const p of powers){
  let d=ZERO.slice(),expression="";
  for(let i=0;i<n;i++)if(p[i]){d=addDim(d,dims[i].map(v=>v*p[i]));expression+=(expression?"*":"")+"x"+i+(p[i]===1?"":"^"+p[i]);}
  features.push({kind:"monomial",powers:p,expression,dimension:d});
 }
 if(includeTrig)for(let i=0;i<n;i++)if(sameDim(dims[i],ZERO)){
  features.push({kind:"sin",index:i,expression:"sin(x"+i+")",dimension:ZERO.slice()});
  features.push({kind:"cos",index:i,expression:"cos(x"+i+")",dimension:ZERO.slice()});
 }
 return features.map(f=>({...f,values:rows.map(r=>evalFeature(f,r))}));
}
function evalFeature(f,x){
 if(f.kind==="sin")return Math.sin(x[f.index]);
 if(f.kind==="cos")return Math.cos(x[f.index]);
 let v=1;for(let i=0;i<f.powers.length;i++)if(f.powers[i])v*=x[i]**f.powers[i];return v;
}
function solveLinear(A,b,ridge){
 const n=b.length,m=A.map((row,i)=>[...row.map((v,j)=>v+(i===j?ridge:0)),b[i]]);
 for(let col=0;col<n;col++){
  let pivot=col;for(let r=col+1;r<n;r++)if(Math.abs(m[r][col])>Math.abs(m[pivot][col]))pivot=r;
  if(Math.abs(m[pivot][col])<1e-14)return null;
  [m[col],m[pivot]]=[m[pivot],m[col]];
  const z=m[col][col];for(let j=col;j<=n;j++)m[col][j]/=z;
  for(let r=0;r<n;r++)if(r!==col){const q=m[r][col];for(let j=col;j<=n;j++)m[r][j]-=q*m[col][j];}
 }
 return m.map(r=>r[n]);
}
function fitColumns(columns,y,active,ridge){
 const k=active.length,gram=Array.from({length:k},()=>Array(k).fill(0)),rhs=Array(k).fill(0);
 for(let i=0;i<k;i++){const a=columns[active[i]];for(let r=0;r<y.length;r++)rhs[i]+=a[r]*y[r];for(let j=0;j<k;j++){const b=columns[active[j]];for(let r=0;r<y.length;r++)gram[i][j]+=a[r]*b[r];}}
 return solveLinear(gram,rhs,ridge);
}
export function discoverDynamics(rows,variableDimensions,targetDimension,{maxDegree=3,threshold=0.01,ridge=1e-10,maxIterations=12,includeTrig=true,validationRows=null}={}){
 const dims=variableDimensions;
 if(!Array.isArray(dims)||!dims.length||!dims.every(validDim)||!validDim(targetDimension))throw Error("Invalid dimensions");
 validateRows(rows,dims.length,"rows");if(validationRows!==null)validateRows(validationRows,dims.length,"validationRows");
 if(!Number.isInteger(maxDegree)||maxDegree<1||maxDegree>5||!Number.isFinite(threshold)||threshold<0||threshold>=1||!Number.isFinite(ridge)||ridge<=0||!Number.isInteger(maxIterations)||maxIterations<1||maxIterations>50)throw Error("Invalid search settings");
 const raw=makeLibrary(rows,dims,maxDegree,includeTrig),usable=[];
 for(const f of raw){if(!f.values.every(Number.isFinite))continue;const norm=Math.sqrt(f.values.reduce((s,v)=>s+v*v,0)/rows.length);if(norm<1e-14)continue;usable.push({...f,norm,column:f.values.map(v=>v/norm)});}
 const y=rows.map(r=>r.at(-1)),yScale=Math.sqrt(y.reduce((s,v)=>s+v*v,0)/y.length);
 if(yScale<1e-30)return {terms:[],trainMSE:0,validationMSE:validationRows?validationRows.reduce((s,r)=>s+r.at(-1)**2,0)/validationRows.length:null,librarySize:usable.length,iterations:0,targetDimension:targetDimension.slice()};
 const yn=y.map(v=>v/yScale),columns=usable.map(f=>f.column);
 let active=usable.map((_,i)=>i),beta=null,iterations=0;
 for(;iterations<maxIterations;iterations++){
  beta=fitColumns(columns,yn,active,ridge);if(!beta)throw Error("Singular regression system");
  const max=Math.max(...beta.map(Math.abs));if(max<1e-14)break;
  const keep=active.filter((_,i)=>Math.abs(beta[i])>=threshold*max);
  if(keep.length===active.length)break;
  if(!keep.length)keep=[active[beta.reduce((best,v,i)=>Math.abs(v)>Math.abs(beta[best])?i:best,0)]];
  active=keep;
 }
 beta=fitColumns(columns,yn,active,ridge);if(!beta)throw Error("Final regression failed");
 const terms=active.map((idx,i)=>{const f=usable[idx],coefficient=beta[i]*yScale/f.norm;return {expression:f.expression,kind:f.kind,powers:f.powers??null,index:f.index??null,coefficient,termDimension:f.dimension.slice(),coefficientDimension:subDim(targetDimension,f.dimension)};}).filter(t=>Number.isFinite(t.coefficient));
 const predictRow=x=>terms.reduce((s,t)=>s+t.coefficient*evalFeature(t,x),0);
 const mse=data=>data.reduce((s,r)=>s+(predictRow(r)-r.at(-1))**2,0)/data.length;
 return {terms,trainMSE:mse(rows),validationMSE:validationRows?mse(validationRows):null,librarySize:usable.length,iterations:iterations+1,targetDimension:targetDimension.slice()};
}
export function predictDynamics(model,inputs){
 if(!model||!Array.isArray(model.terms)||!Array.isArray(inputs))throw Error("Invalid model or inputs");
 return model.terms.reduce((s,t)=>s+t.coefficient*evalFeature(t,inputs),0);
}
