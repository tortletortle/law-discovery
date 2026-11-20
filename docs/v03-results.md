# V0.3 preliminary comparison
Six synthetic targets: sin(x0+x1), x0*x1*x2, exp(x0-x1), (x0+x1)*x2, cos(x0*x1), x0/(x1+x2). All inputs dimensionless. LCG seeds 1–5, x in [0.3,1.8), 25 train and 20 holdout rows, depth 2, holdout MSE < 1e-16 as predictive recovery criterion (not proof of symbolic equality). Canonical toggle in src/canonical.mjs.

|Pool cap|Canonical|Recovery|Duplicate attempts|Truncated runs|
|---|---|---|---|---|
|1000|off|5/30|2040|30|
|1000|on|5/30|2040|30|
|5000|off|30/30|2040|30|
|5000|on|30/30|2520|30|

No recovery benefit demonstrated. Pool cap is not a fixed operation count or wall-time budget. No timing, noise, real data, external baseline or formal equivalence validation. Canonical keys only merge associative/commutative addition and multiplication; floating-point reassociation can differ. Retain baseline.
