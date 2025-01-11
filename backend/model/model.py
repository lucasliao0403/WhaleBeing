import pandas as pd
import statsmodels.api as sm
from sklearn.ensemble import GradientBoostingClassifier

# 1. Load and prep data
# Tracking data provided is a subset of 10 randomly selected individuals
# Response variable name is 'presabs' for Presence-Absence
tracks = pd.read_csv("input.csv")
tracks['ptt'] = tracks['ptt'].astype('category')
tracks['month'] = pd.to_datetime(tracks['dt']).dt.month
tracks = tracks.dropna()

# 2. Fit candidate GAMMs
# Using Generalized Linear Models (GLM) as an approximation for GAMMs

# Model 1: sst, z, z_sd, ssh_sd, ild, eke
formula = 'presabs ~ sst + z + z_sd + ssh_sd + ild + EKE + C(ptt)'
gam_mod1 = sm.GLM.from_formula(
    formula, data=tracks, family=sm.families.Binomial()).fit()

# Model 2: sst, z, z_sd, ssh_sd, ild, eke, lon, lat
formula = 'presabs ~ sst + z + z_sd + ssh_sd + ild + EKE + lon + lat + C(ptt)'
gam_mod2 = sm.GLM.from_formula(
    formula, data=tracks, family=sm.families.Binomial()).fit()

# Add more models as needed...

# 3. Fit BRT
# Includes all covariates:
# sst, sst_sd, ssh, ssh_sd, z, z_sd, ild, eke, curl, bv, slope, aspect
features = ["curl", "ild", "ssh", "sst", "sst_sd",
            "ssh_sd", "z", "z_sd", "EKE", "slope", "aspect", "BV"]
X = tracks[features]
y = tracks['presabs']

brt = GradientBoostingClassifier(
    n_estimators=1000, learning_rate=0.05, max_depth=3, random_state=0)
brt.fit(X, y)

# 4. Predict values using gam_mod1
tracks['predicted'] = gam_mod1.predict(tracks)

# 5. Export to CSV
output = tracks[['lat', 'lon',  'predicted']]
output.to_csv("output.csv", index=False)
