import pandas as pd
import statsmodels.api as sm
from sklearn.ensemble import GradientBoostingClassifier
from patsy import dmatrix

# 1. Load and prep data
# Tracking data provided is a subset of 10 randomly selected individuals
# Response variable name is 'presabs' for Presence-Absence
tracks = pd.read_csv("input.csv")
tracks['ptt'] = tracks['ptt'].astype('category')
tracks['month'] = pd.to_datetime(tracks['dt']).dt.month
tracks = tracks.dropna()

# 2. Fit candidate GAMMs
# Using Generalized Linear Models (GLM) as an approximation for GAMMs

# Create spline basis for month
spline_month = dmatrix("bs(month, df=5)", data=tracks, return_type='dataframe')
tracks = pd.concat([tracks, spline_month], axis=1)

# Model 1: sst, z, z_sd, ssh_sd, ild, eke, spline_month
formula = 'presabs ~ sst + z + z_sd + ssh_sd + ild + EKE + C(ptt) + bs(month, df=5)'
gam_mod1 = sm.GLM.from_formula(
    formula, data=tracks, family=sm.families.Binomial()).fit()

# Model 2: sst, z, z_sd, ssh_sd, ild, eke, lon, lat, spline_month
formula = 'presabs ~ sst + z + z_sd + ssh_sd + ild + EKE + lon + lat + C(ptt) + bs(month, df=5)'
gam_mod2 = sm.GLM.from_formula(
    formula, data=tracks, family=sm.families.Binomial()).fit()

# Add more models as needed...

# 3. Fit BRT
# Includes all covariates: sst, sst_sd, ssh, ssh_sd, z, z_sd, ild, eke, curl, bv, slope, aspect, month
features = ["curl", "ild", "ssh", "sst", "sst_sd", "ssh_sd",
            "z", "z_sd", "EKE", "slope", "aspect", "BV", "month"]
X = tracks[features]
y = tracks['presabs']

brt = GradientBoostingClassifier(
    n_estimators=1000, learning_rate=0.05, max_depth=3, random_state=0)
brt.fit(X, y)

# Check feature importance
importances = brt.feature_importances_
feature_importance_df = pd.DataFrame(
    {'feature': features, 'importance': importances})
print(feature_importance_df.sort_values(by='importance', ascending=False))

# 4. Generate predictions for all 12 months and aggregate results
all_predictions = []

for month in range(1, 13):
    prediction_data = tracks.copy()
    prediction_data['month'] = month

    # Create spline basis for the desired month
    spline_month_pred = dmatrix(
        "bs(month, df=5)", data=prediction_data, return_type='dataframe')
    prediction_data = pd.concat([prediction_data, spline_month_pred], axis=1)

    # Predict values using gam_mod1
    prediction_data['predicted'] = gam_mod1.predict(prediction_data)
    all_predictions.append(
        prediction_data[['lon', 'lat', 'month', 'predicted']])

# Concatenate all predictions into a single DataFrame
all_predictions_df = pd.concat(all_predictions)

# 5. Export to CSV
all_predictions_df.to_csv("output.csv", index=False)
