# V0.7 — time-series derivative extraction

## Implemented

- `src/derivatives.mjs` accepts sampled rows `[time, state_0, ...]`, including nonuniform timestamps.
- Uses a centered/scaled local polynomial model and Householder QR least squares to estimate first and higher derivatives.
- Marks one-sided boundary estimates with `edge`; `toDynamicsRows(..., {excludeEdges:true})` can omit them.
- Converts state and derivative estimates into the row layout expected by `discoverDynamics`.

## Numerical checks

`test-derivatives.mjs` covers exact polynomial differentiation on uniform and irregular timestamps, input validation, and an end-to-end damped oscillator pipeline.

| Check | Maximum absolute error |
|---|---:|
| Quadratic first derivative | 3.46e-15 |
| Quadratic second derivative | 2.82e-14 |
| Irregular cubic first derivative | 5.69e-14 |
| Irregular cubic second derivative | 4.07e-13 |

End-to-end synthetic trajectory: `x(t)=exp(-0.15t)cos(sqrt(4-0.15^2)t)`, 1001 samples at 0.02 s. With window 15 and polynomial degree 5, the pipeline recovered `x'' ≈ -3.99997x - 0.299992x'` after excluding edge estimates.

## Measurement-noise / window-size benchmark

`benchmark-timeseries-derivatives.mjs` and `results/v07-derivative-noise.json` contain 100 runs: four odd window sizes (9, 15, 21, 31), five measurement-noise levels (0%, 0.1%, 0.5%, 1%, 2% of position RMS), and five seeds per condition. The signal is a synthetic damped oscillator; noise is added to measured position before differentiation. Exact recovery criterion: both expected terms present, with coefficient tolerances 0.2 for `-4` and 0.03 for `-0.3`.

| Position noise | Window 9 | Window 15 | Window 21 | Window 31 |
|---:|---:|---:|---:|---:|
| 0% | 5/5 | 5/5 | 5/5 | 5/5 |
| 0.1% | 5/5 | 5/5 | 5/5 | 5/5 |
| 0.5% | 1/5 | 4/5 | 5/5 | 5/5 |
| 1% | 0/5 | 3/5 | 4/5 | 5/5 |
| 2% | 0/5 | 1/5 | 3/5 | 5/5 |

On this signal and sampling interval, wider windows suppress measurement-noise amplification. Wider windows can also smooth away fast dynamics, so this is not a universal recommendation; the result is limited to one synthetic oscillator, one sampling interval, polynomial degree 5, and five seeds per condition.

## CI status

`.github/workflows/tests.yml` was added for Node.js 22 and runs the dynamics and derivative test scripts on pushes and pull requests. The latest commit currently has no reported status checks, so remote CI execution is not yet confirmed.

## Reproduction

```bash
node test-derivatives.mjs
node benchmark-timeseries-derivatives.mjs
```

## Limitations

- This is a numerical derivative estimator, not a video tracker; image-to-state extraction is not implemented.
- Measurement noise is added only to one scalar position signal. Multi-sensor noise, outliers, quantization and timestamp jitter need testing.
- Derivatives are sensitive to window size, polynomial degree, sampling rate and signal bandwidth.
- Boundary estimates use one-sided windows and should generally be excluded or separately validated.
- The downstream sparse dynamics regression still uses ridge-regularized normal equations; QR/SVD regression and uncertainty quantification remain future work.
- Results are synthetic and do not establish performance on real pendulum or circuit measurements.