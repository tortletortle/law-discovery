# Formula Alchemist — 科学定律发现引擎

> Repository: private research development. Current milestone: V0.6 sparse dimensional dynamics discovery.

## Project goal

从实验观测中搜索可解释的显式数学关系与动力学方程，并通过量纲、独立留出数据和可复现实验验证候选规律。项目区分**预测拟合**与**真实公式恢复**：低预测误差不等于唯一识别出真实物理定律。

## Current capabilities

- `src/baseline.mjs` — 单变量、单基函数仿射符号回归基线。
- `src/dimensional.mjs` — 有界表达式枚举与表达式量纲推导。
- `src/canonical.mjs` — 加法/乘法结合律与交换律的有限规范化去重。
- `src/evolution.mjs` — 带量纲检查的随机表达式树进化搜索。
- `src/selection.mjs` — 固定惩罚、动态惩罚与局部 Pareto 种群筛选。
- `src/dynamics.mjs` — 多项式/三角候选库、稀疏多项式回归，以及未知系数的量纲推断。

## V0.6 experiment

Four synthetic systems (damped oscillator, nonlinear pendulum, Duffing oscillator, RC decay) were tested with 10 seeds and 0%, 1%, 5%, 10% target noise. Exact support and coefficient recovery: 40/40, 31/40, 12/40, 5/40 respectively. A separate pendulum excitation study found that wider angle coverage improved recovery in this synthetic setup. Details and raw data are in `docs/v06-results.md` and `results/`.

## Run

Requires Node.js with ES module support. No third-party package is required for the current core:

```bash
node test-dynamics.mjs
node benchmark-dynamics.mjs
node benchmark-pendulum-excitation.mjs
```

## Important limitations

- Current dynamics discovery expects a supplied derivative/target column; raw time-series derivative estimation is not implemented.
- Current noise tests perturb the target only, not measured state variables.
- All V0.6 results are synthetic. No physical experiment, real sensor dataset, or PySR/SINDy comparison has been completed.
- Prediction accuracy must not be presented as proof of unique law discovery.
- The dimensional vector convention is SI base exponents `[M, L, T, I]`; coefficient dimensions are inferred as target dimension minus basis-term dimension.

## Engineering policy

1. Keep the repository private during research.
2. Preserve existing Git history; do not force-push over prior work.
3. Every milestone must include source, reproducible tests, raw results, and a report of limitations.
4. Mark only verified behavior as complete.