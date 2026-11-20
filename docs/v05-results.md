# V0.5 Selection experiment

Selection source: src/selection.mjs. Fixed, staged (0/0.1/1 times penalty at 0/50/80% of attempts), and local Pareto-preserving population selection. All final output choices use their configured fixed scalar penalty; the Pareto mode preserves nondominated members of the current population, not a global archive. No symbolic simplification implemented.

Benchmark: node benchmark-selection.mjs. Six existing dimensionless synthetic formula families; ten new seeds 11–20 per target. Independent PRNG streams for data, perturbation and search; 25 train rows, 40 in-domain holdout and 40 extrapolation rows. Uniform additive training perturbation at nominal RMS 0 or 5%. 2000 attempted trees per run, 480 runs. Success: clean evaluation NMSE < 0.01; nonfinite counted as failure. Raw results in results/v05-selection.json.

[
  {
    "noise": 0,
    "mode": "unpenalized",
    "n": 60,
    "holdHits": 49,
    "extraHits": 37,
    "finiteHold": 59,
    "finiteExtra": 59,
    "medianHold": 3.119962228817508e-33,
    "medianExtra": 1.1795797382199079e-32,
    "meanNodes": 8.483333333333333
  },
  {
    "noise": 0,
    "mode": "fixed",
    "n": 60,
    "holdHits": 48,
    "extraHits": 40,
    "finiteHold": 60,
    "finiteExtra": 60,
    "medianHold": 8.959362343810929e-33,
    "medianExtra": 1.2181077880908441e-32,
    "meanNodes": 8.033333333333333
  },
  {
    "noise": 0,
    "mode": "anneal",
    "n": 60,
    "holdHits": 50,
    "extraHits": 42,
    "finiteHold": 60,
    "finiteExtra": 60,
    "medianHold": 2.2832631709208876e-32,
    "medianExtra": 3.7122877076648264e-32,
    "meanNodes": 7.716666666666667
  },
  {
    "noise": 0,
    "mode": "pareto",
    "n": 60,
    "holdHits": 51,
    "extraHits": 47,
    "finiteHold": 60,
    "finiteExtra": 60,
    "medianHold": 0,
    "medianExtra": 0,
    "meanNodes": 6.7
  },
  {
    "noise": 0.05,
    "mode": "unpenalized",
    "n": 60,
    "holdHits": 47,
    "extraHits": 38,
    "finiteHold": 60,
    "finiteExtra": 60,
    "medianHold": 0.000873299963033414,
    "medianExtra": 0.0006478432177891226,
    "meanNodes": 10.066666666666666
  },
  {
    "noise": 0.05,
    "mode": "fixed",
    "n": 60,
    "holdHits": 50,
    "extraHits": 42,
    "finiteHold": 60,
    "finiteExtra": 60,
    "medianHold": 0.00016921667776855049,
    "medianExtra": 0.0001594987572506896,
    "meanNodes": 7.633333333333334
  },
  {
    "noise": 0.05,
    "mode": "anneal",
    "n": 60,
    "holdHits": 50,
    "extraHits": 38,
    "finiteHold": 60,
    "finiteExtra": 60,
    "medianHold": 0.0006219750642863955,
    "medianExtra": 0.0005791617821196623,
    "meanNodes": 8.55
  },
  {
    "noise": 0.05,
    "mode": "pareto",
    "n": 60,
    "holdHits": 48,
    "extraHits": 39,
    "finiteHold": 60,
    "finiteExtra": 60,
    "medianHold": 0.000248852401905129,
    "medianExtra": 0.00017764840614635074,
    "meanNodes": 7.516666666666667
  }
]

Paired Pareto versus fixed penalty hit status (win/loss/tie): [{"noise":0,"metric":"hold","win":9,"loss":6,"tie":45},{"noise":0,"metric":"extra","win":14,"loss":7,"tie":39},{"noise":0.05,"metric":"hold","win":4,"loss":6,"tie":50},{"noise":0.05,"metric":"extra","win":8,"loss":11,"tie":41}].

No robust overall winner; clean extrapolation suggests a benefit but noisy cases do not replicate it. Families were used in earlier pilots, not novel targets; predictive scores are not proof of symbolic equivalence. Equal attempted trees is not equal CPU time; no timing or external algorithm baseline. No independent hardware or sensor data. Do not make Pareto default based on this pilot. Next: dimensioned parameter fitting and independently chosen targets; compare noise levels, domain coverage and robust loss.
