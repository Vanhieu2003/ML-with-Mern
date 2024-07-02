from flask import Flask, request, jsonify
import pandas as pd
from joblib import load
from flask_cors import CORS

# Load the trained Random Forest model
model = load('random_forest_model.joblib')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Hoặc thay "*" bằng URL cụ thể

def preprocess_data(data):
    # Convert to DataFrame
    df = pd.DataFrame([data])
    
    # Preprocessing steps
    df['term'] = df['term'].astype(str).map(lambda x: x.lstrip(' ').rstrip(' months')).astype('int64')
    
    df['emp_length'] = pd.to_numeric(df['emp_length'].astype(str).apply(lambda x: 0 if "<" in x else (x.split('+')[0] if "+" in x else x.split()[0])))
    
    df['sub_grade'] = df['sub_grade'].astype(str).map({
        'A1': 0, 'A2': 1, 'A3': 2, 'A4': 3, 'A5': 4, 
        'B1': 5, 'B2': 6, 'B3': 7, 'B4': 8, 'B5': 9, 
        'C1': 10, 'C2': 11, 'C3': 12, 'C4': 13, 'C5': 14, 
        'D1': 15, 'D2': 16, 'D3': 17, 'D4': 18, 'D5': 19, 
        'E1': 20, 'E2': 21, 'E3': 22, 'E4': 23, 'E5': 24, 
        'F1': 25, 'F2': 26, 'F3': 27, 'F4': 28, 'F5': 29, 
        'G1': 30, 'G2': 31, 'G3': 32, 'G4': 33, 'G5': 34
    })

    df = pd.get_dummies(df, columns=['home_ownership', 'verification_status', 'purpose'])
    
    return df

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        preprocessed_data = preprocess_data(data)

        required_columns = model.feature_names_in_
        for col in required_columns:
            if col not in preprocessed_data.columns:
                preprocessed_data[col] = 0

        preprocessed_data = preprocessed_data[required_columns]
        prediction = model.predict(preprocessed_data)
        prediction_proba = model.predict_proba(preprocessed_data)

        return jsonify({
            'prediction': prediction.tolist(),
            'prediction_proba': prediction_proba.tolist()
        })
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
