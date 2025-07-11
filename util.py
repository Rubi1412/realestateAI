import json
import pickle
import numpy as np

__locations = None
__data_columns = None
__model = None

def load_saved_artifacts():
    """Load column names and trained model from disk."""
    print("📦 Loading saved artifacts...")

    global __data_columns
    global __locations
    global __model

    with open("columns.json", "r") as f:
        __data_columns = json.load(f)['data_columns']
        __locations = [col.title() for col in __data_columns[3:]]  # Format locations

    with open("price_model.pkl", "rb") as f:
        __model = pickle.load(f)

    print("✅ Artifacts loaded successfully.")

def get_location_names():
    """Return list of location names for dropdown."""
    return __locations

def get_estimated_price(location, sqft, bhk, bath):
    """Predict property price using ML model."""
    try:
        loc_index = __data_columns.index(location.lower())
    except ValueError:
        loc_index = -1

    x = np.zeros(len(__data_columns))
    x[0] = sqft
    x[1] = bath
    x[2] = bhk

    if loc_index >= 0:
        x[loc_index] = 1

    return round(__model.predict([x])[0], 2)
