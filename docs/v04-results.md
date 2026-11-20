# V0.4 pilot
Six V0.3 targets; seeds 1–5; 25 training rows and 20 clean holdout rows; dimensionless inputs sampled in [0.3,1.8); LCG; uniform additive training noise with nominal RMS fraction 0 or 0.05. 2000 attempted trees per run, population 40, max nodes 15. Hit: holdout sum squared errors / sum squared targets < 0.01.

|Noise|Penalty|Hits/30|Mean normalized MSE|Mean nodes|
|---|---|---|---|---|
|0|0|26|0.00663335|8.1667|
|0|1e-5|21|0.01011088|8.2|
|0.05|0|26|0.00740609|8.8667|
|0.05|1e-5|23|0.01939100|8.4|

Pilot only. No equal-operation or timing comparison with enumeration yet. Noise and clean conditions consume the same PRNG draws for perturbations; data and search seeds share numerical seeds. Predictive accuracy is not symbolic identity. No dimensional-target empirical tests in this pilot. Penalty effects are exploratory; expand seeds and sweep values before concluding. No real sensor data or external baseline.
