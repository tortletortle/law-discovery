// V0.7: local polynomial derivatives for sampled, possibly irregular time series.
function validateSeries(rows){
 if(!Array.isArray(rows)||rows.length<3||!Array.isArray(rows[0])||rows[0].length<2)throw Error("Series must contain at least 3 rows [time, state...]");
 const width=rows[0].length;
 for(let i=0;i<rows.length;i++){
  if(!Array.isArray(rows[i])||rows[i].length!==width||!rows[i].every(Number.isFinite))throw Error("Series rows must be finite and rectangular");
  if(i&&rows[i][0]<=rows[i-1][0])throw Error("Time values must be strictly increasing");
 }
 return width-1;
}
function leastSquaresQR(A,b){
 const m=A.length,n=A[0].length,R=A.map(r=>r.slice()),q=b.slice();
 for(let k=0;k<n;k++){
  let norm=0;for(let i=k;i<m;i++)norm=Math.hypot(norm,R[i][k]);
  if(norm<1e-14)throw Error("Local polynomial design is rank deficient");
  const alpha=R[k][k]>=0?-norm:norm,v=Array(m-k);
  for(let i=k;i<m;i++)v[i-k]=R[i][k];
  v[0]-=alpha;let vv=0;for(const x of v)vv+=x*x;
  if(vv<1e-28)throw Error("Local polynomial reflector is singular");
  const factor=2/vv;
  for(let j=k;j<n;j++){let dot=0;for(let i=k;i<m;i++)dot+=v[i-k]*R[i][j];dot*=factor;for(let i=k;i<m;i++)R[i][j]-=dot*v[i-k];}
  let dot=0;for(let i=k;i<m;i++)dot+=v[i-k]*q[i];dot*=factor;for(let i=k;i<m;i++)q[i]-=dot*v[i-k];
  R[k][k]=alpha;for(let i=k+1;i<m;i++)R[i][k]=0;
 }
 const x=Array(n).fill(0);
 for(let i=n-1;i>=0;i--){let s=q[i];for(let j=i+1;j<n;j++)s-=R[i][j]*x[j];x[i]=s/R[i][i];}
 return x;
}
function factorial(n){let v=1;for(let i=2;i<=n;i++)v*=i;return v;}
export function estimateDerivatives(series,{window=9,degree=3,maxDerivative=2}={}){
 const stateCount=validateSeries(series),n=series.length;
 if(!Number.isInteger(window)||window<3||window%2===0||window>n||!Number.isInteger(degree)||degree<1||degree>=window||degree>6||!Number.isInteger(maxDerivative)||maxDerivative<1||maxDerivative>degree)throw Error("Require odd window <= samples, degree < window, and 1 <= maxDerivative <= degree");
 const half=Math.floor(window/2),out=[];
 for(let i=0;i<n;i++){
  const start=Math.max(0,Math.min(i-half,n-window)),slice=series.slice(start,start+window),center=series[i][0];
  let scale=0;for(const r of slice)scale=Math.max(scale,Math.abs(r[0]-center));
  if(!(scale>0))throw Error("Degenerate time window");
  const A=slice.map(r=>{const u=(r[0]-center)/scale,row=[1];for(let p=1;p<=degree;p++)row.push(row[p-1]*u);return row;});
  const derivatives=Array.from({length:maxDerivative},()=>Array(stateCount));
  for(let s=0;s<stateCount;s++){
   const coeff=leastSquaresQR(A,slice.map(r=>r[s+1]));
   for(let order=1;order<=maxDerivative;order++)derivatives[order-1][s]=factorial(order)*coeff[order]/scale**order;
  }
  out.push({time:center,state:series[i].slice(1),derivatives,edge:i<half||i>=n-half});
 }
 return out;
}
export function toDynamicsRows(estimates,{targetState=0,derivativeOrder=1,excludeEdges=false}={}){
 if(!Array.isArray(estimates)||!estimates.length||!Number.isInteger(targetState)||!Number.isInteger(derivativeOrder)||derivativeOrder<1||typeof excludeEdges!=="boolean")throw Error("Invalid derivative records or target selection");
 const selected=excludeEdges?estimates.filter(r=>!r.edge):estimates;
 if(selected.length<3)throw Error("At least 3 usable derivative rows are required");
 return selected.map(r=>{
  if(!Array.isArray(r.state)||!Array.isArray(r.derivatives)||targetState>=r.state.length||derivativeOrder>r.derivatives.length)throw Error("Requested derivative is unavailable");
  const variables=[...r.state];for(let k=0;k<derivativeOrder-1;k++)variables.push(...r.derivatives[k]);
  const target=r.derivatives[derivativeOrder-1][targetState];
  if(!variables.every(Number.isFinite)||!Number.isFinite(target))throw Error("Non-finite dynamics row");
  return [...variables,target];
 });
}
