import pandas as pd
import pickle
import json
from sklearn.linear_model import LinearRegression

# Load your training data (replace this with actual CSV or database)
df = pd.read_csv("C:/Users/DINESH K/OneDrive/Desktop/Ruby/pricest/Bengaluru_House_Data.csv")  # must have sqft, bath, bhk, location, price

# One-hot encode the location
dummies = pd.get_dummies(df.location)
df = pd.concat([df, dummies], axis=1)
df.drop('location', axis=1, inplace=True)

X = df.drop('price', axis=1)
y = df.price

# Train model
model = LinearRegression()
model.fit(X, y)

# Save model
with open("price_model.pkl", "wb") as f:
    pickle.dump(model, f)

# Save columns.json (only if needed again)
data_columns = {"data_columns": list(X.columns)}
with open("columns.json", "w") as f:
    json.dump(data_columns, f)
