# V0.6 — sparse dimensional dynamics discovery

## Implemented

- `src/dynamics.mjs`: generates a candidate library containing a constant, monomials up to degree 3 by default, and sine/cosine terms for dimensionless state variables.
- Uses sequential thresholded least squares (STLSQ) over RMS-normalized columns with a small ridge term.
- Reports each basis term's dimension and infers the coefficient dimension as `targetDimension - termDimension`.
- Supports separate validation rows and prediction through `predictDynamics`.
- Dimension vector order is SI base exponents `[M, L, T, I]`; numeric coefficient values use the units supplied by the caller.

## Exact synthetic recovery

`test-dynamics.mjs` covers four laws with 300 training rows and 120 holdout rows:
1. Damped oscillator: `x'' = -4x - 0.3v`
2. Nonlinear pendulum: `theta'' = -(9.81/1.2)sin(theta) - 0.15 omega`
3. Duffing oscillator: `x'' = -2x - 0.8x^3 - 0.4v`
4. RC decay: `V' = -0.5V`

The seeded exact-data run recovered the expected support, coefficients and coefficient dimensions for all four cases. This is synthetic verification, not real-world experimental validation.

## Noise benchmark

`benchmark-dynamics.mjs` and `results/v06-dynamics.json` record 160 runs: four systems, ten seeds, and target-noise levels 0%, 1%, 5%, 10%. Inputs are noise-free; additive uniform noise is applied only to the target. Exact recovery requires the expected basis and coefficients within 15%; prediction quality is reported separately.

| Target noise | Exact support + coefficient recovery | Mean validation NMSE |
|---:|---:|---:|
| 0% | 40/40 | 9.15e-26 |
| 1% | 31/40 | 8.00e-7 |
| 5% | 12/40 | 1.59e-4 |
| 10% | 5/40 | 4.89e-4 |

At higher noise, sparse support recovery degrades even when validation prediction error remains small. A good predictive approximation is not proof that the original physical law was recovered.

## Experiment design study

`benchmark-pendulum-excitation.mjs` and `results/v06-pendulum-excitation.json` compare state-space angle coverage for a nonlinear pendulum (20 seeds per condition, fixed threshold 0.03). Exact structural recovery across 20 seeds per condition was:

| Angle range | 1% noise | 5% noise | 10% noise |
|---|---:|---:|---:|
| ±1.3 rad | 8/20 | 0/20 | 0/20 |
| ±2.0 rad | 18/20 | 1/20 | 0/20 |
| ±2.6 rad | 19/20 | 7/20 | 0/20 |
| ±3.0 rad | 20/20 | 12/20 | 3/20 |

This is a synthetic state-space sampling study; it suggests broader excitation can help distinguish `sin(theta)` from low-order polynomial approximations, but physical feasibility and safe experimental design must be checked before applying it to a real pendulum.

## Reproduction

Run with Node.js supporting ES modules:

```bash
node test-dynamics.mjs
node benchmark-dynamics.mjs
node benchmark-pendulum-excitation.mjs
```

## Limitations / next work

- The current API expects the derivative/target column to be supplied. It does not yet estimate derivatives from raw time series.
- Noise is applied to the target only; state/measurement noise is not tested.
- The benchmark uses synthetic systems only. No PySR/SINDy baseline, wall-clock comparison, or real sensor dataset has been evaluated.
- Candidate library is limited to polynomial monomials and sine/cosine of dimensionless variables.
- Regression uses ridge-regularized normal equations; QR/SVD and uncertainty estimates remain future work.
- Unit consistency is represented by inferred coefficient dimensions, not external priors or dimensional-constant databases.