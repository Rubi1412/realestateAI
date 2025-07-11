from flask import Flask, request, jsonify, render_template
import util

app = Flask(__name__)

# Homepage
@app.route('/')
def index():
    return render_template('index.html')

# Prediction page
@app.route('/predict')
def predict():
    return render_template('predict.html')

# Comparison page
@app.route('/compare')
def compare():
    return render_template('compare.html')

# API: Get location list
@app.route('/get_location_names', methods=['GET'])
def get_location_names():
    response = jsonify({
        'locations': util.get_location_names()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

# API: Predict property price
@app.route('/predict_home_price', methods=['POST'])
def predict_home_price():
    try:
        total_sqft = float(request.form['total_sqft'])
        location = request.form['location']
        bhk = int(request.form['bhk'])
        bath = int(request.form['bath'])

        estimated_price = util.get_estimated_price(location, total_sqft, bhk, bath)

        response = jsonify({
            'estimated_price': estimated_price
        })
    except Exception as e:
        response = jsonify({
            'error': f"Prediction failed: {str(e)}"
        })

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

# Load model and run app
if __name__ == '__main__':
    print("🚀 Starting Flask server for Real Estate Price Prediction...")
    util.load_saved_artifacts()
    app.run(debug=True)
