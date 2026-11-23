# Formula Alchemist — 科学定律发现引擎

> Private research repository. Current milestone: V0.7 time-series derivative extraction + sparse dimensional dynamics discovery.

## Project goal

从实验观测中搜索可解释的显式数学关系与动力学方程，并通过量纲、独立留出数据和可复现实验验证候选规律。严格区分**预测拟合**与**真实公式恢复**：低预测误差不等于唯一识别出真实物理定律。

## Current capabilities

- `src/baseline.mjs` — 单变量、单基函数仿射符号回归基线。
- `src/dimensional.mjs` — 有界表达式枚举与表达式量纲推导。
- `src/canonical.mjs` — 加法/乘法结合律与交换律的有限规范化去重。
- `src/evolution.mjs` — 带量纲检查的随机表达式树进化搜索。
- `src/selection.mjs` — 固定惩罚、动态惩罚与局部 Pareto 种群筛选。
- `src/dynamics.mjs` — 多项式/三角候选库、STLSQ 稀疏回归，以及未知系数的量纲推断。
- `src/derivatives.mjs` — 对均匀或非均匀时间序列进行局部多项式导数估计，并生成动力学回归数据。

## Verified synthetic milestones

- V0.6: four synthetic physical systems, 160 target-noise runs; exact support/coefficient recovery 40/40 at 0% noise, 31/40 at 1%, 12/40 at 5%, and 5/40 at 10%. A separate 240-run pendulum excitation study found broader angle coverage improved structural recovery in this synthetic setup.
- V0.7: polynomial derivative tests on uniform and irregular timestamps, plus an end-to-end damped oscillator recovery from a sampled trajectory. A 100-run measurement-noise/window study shows the window-size/noise trade-off.
- Reports and raw data: `docs/v06-results.md`, `docs/v07-results.md`, and `results/`.

## Run

Requires Node.js with ES module support; current core has no third-party runtime dependency:

```bash
node test-dynamics.mjs
node test-derivatives.mjs
node benchmark-dynamics.mjs
node benchmark-pendulum-excitation.mjs
node benchmark-timeseries-derivatives.mjs
```

## Important limitations

- No video tracking / OpenCV extraction yet; the derivative module starts from already measured numeric state time series.
- V0.6 noise benchmarks perturb target values only; V0.7 adds scalar position measurement noise, but not multichannel sensor noise, outliers or timestamp jitter.
- All results are synthetic. No real physical experiment, real sensor dataset, or PySR/SINDy baseline comparison has been completed.
- Prediction accuracy must not be presented as proof of unique law discovery.
- Dimension vectors use SI base exponents `[M, L, T, I]`; coefficient dimensions are inferred as target dimension minus basis-term dimension.

## Engineering policy

1. Keep the repository private during research.
2. Preserve existing Git history; do not force-push over prior work.
3. Every milestone must include source, reproducible tests, raw results, and limitations.
4. Mark only verified behavior as complete.