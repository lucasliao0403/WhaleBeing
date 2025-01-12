import pandas as pd
import numpy as np
import statsmodels.api as sm
from sklearn.ensemble import GradientBoostingClassifier
from patsy import dmatrix

# 1. Load and prep data
# Tracking data provided is a subset of 10 randomly selected individuals
# Response variable name is 'presabs' for Presence-Absence
tracks = pd.read_csv("input.csv")
tracks['ptt'] = tracks['ptt'].astype('category')
tracks['date'] = pd.to_datetime(tracks['dt'])
tracks['month'] = tracks['date'].dt.month
tracks['day_of_year'] = tracks['date'].dt.dayofyear
tracks = tracks.dropna()

# Create cyclic features for day of the year
tracks['sin_day_of_year'] = np.sin(2 * np.pi * tracks['day_of_year'] / 365.25)
tracks['cos_day_of_year'] = np.cos(2 * np.pi * tracks['day_of_year'] / 365.25)

# 2. Fit candidate GAMMs
# Using Generalized Linear Models (GLM) as an approximation for GAMMs

# Create spline basis for day of the year
spline_day_of_year = dmatrix(
    "bs(day_of_year, df=5)", data=tracks, return_type='dataframe')
tracks = pd.concat([tracks, spline_day_of_year], axis=1)

# Model 1: sst, z, z_sd, ssh_sd, ild, eke, spline_day_of_year
formula = 'presabs ~ sst + z + z_sd + ssh_sd + ild + EKE + C(ptt) + bs(day_of_year, df=5)'
gam_mod1 = sm.GLM.from_formula(
    formula, data=tracks, family=sm.families.Binomial()).fit()

# Model 2: sst, z, z_sd, ssh_sd, ild, eke, lon, lat, spline_day_of_year
formula = 'presabs ~ sst + z + z_sd + ssh_sd + ild + EKE + lon + lat + C(ptt) + bs(day_of_year, df=5)'
gam_mod2 = sm.GLM.from_formula(
    formula, data=tracks, family=sm.families.Binomial()).fit()

# Add more models as needed...

# 3. Fit BRT
# Includes all covariates: sst, sst_sd, ssh, ssh_sd, z, z_sd, ild, eke, curl, bv, slope, aspect, sin_day_of_year, cos_day_of_year
features = ["curl", "ild", "ssh", "sst", "sst_sd", "ssh_sd", "z", "z_sd",
            "EKE", "slope", "aspect", "BV", "sin_day_of_year", "cos_day_of_year"]
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

# 4. Generate predictions for specific dates and aggregate results
all_predictions = []

for month in range(1, 13):
    for day in range(1, 29):  # Example: Predict for the first 28 days of each month
        prediction_data = tracks.copy()
        prediction_date = pd.to_datetime(f'2023-{month:02d}-{day:02d}')
        prediction_data['date'] = prediction_date
        prediction_data['day_of_year'] = prediction_date.dayofyear
        prediction_data['sin_day_of_year'] = np.sin(
            2 * np.pi * prediction_data['day_of_year'] / 365.25)
        prediction_data['cos_day_of_year'] = np.cos(
            2 * np.pi * prediction_data['day_of_year'] / 365.25)

        # Create spline basis for the desired day of the year
        spline_day_of_year_pred = dmatrix(
            "bs(day_of_year, df=5)", data=prediction_data, return_type='dataframe')
        prediction_data = pd.concat(
            [prediction_data, spline_day_of_year_pred], axis=1)

        # Predict values using gam_mod1
        prediction_data['predicted'] = gam_mod1.predict(prediction_data)
        all_predictions.append(
            prediction_data[['lon', 'lat', 'date', 'predicted']])

# Concatenate all predictions into a single DataFrame
all_predictions_df = pd.concat(all_predictions)

# 5. Export to CSV
all_predictions_df.to_csv("output.csv", index=False)
