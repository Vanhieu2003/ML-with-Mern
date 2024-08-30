from flask import Flask, request, jsonify
import pandas as pd
from joblib import load
from flask_cors import CORS

# Load the trained modelsơ
random_forest_model = load('random_forest_model_SMOTE.joblib')
logistic_model = load('logistics_regression_model_SMOTE.joblib')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Hoặc thay "*" bằng URL cụ thể

def preprocess_data(data):
    # Convert to DataFrame
    df = pd.DataFrame([data])
    
    # Preprocessing steps
    df['term'] = df['term'].astype(str).map(lambda x: x.lstrip(' ').rstrip(' months')).astype('int64')
    
    df['emp_length'] = pd.to_numeric(df['emp_length'].astype(str).apply(lambda x: 0 if "<" in x else (x.split('+')[0] if "+" in x else x.split()[0])))
    
    df['grade'] = df['grade'].map({'A': 0, 'B': 1,'C': 2,'D': 3,'E': 4,'F': 5,'G': 6})

    df = pd.get_dummies(df, columns=['home_ownership', 'verification_status', 'purpose'])
    
    return df

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        preprocessed_data = preprocess_data(data)

        # Ensure all required columns are present
        required_columns = random_forest_model.feature_names_in_
        for col in required_columns:
            if col not in preprocessed_data.columns:
                preprocessed_data[col] = 0

        preprocessed_data = preprocessed_data[required_columns]
        
        # Get predictions from both models
        rf_prediction = random_forest_model.predict(preprocessed_data)
        rf_prediction_proba = random_forest_model.predict_proba(preprocessed_data)

        logistic_prediction = logistic_model.predict(preprocessed_data)
        logistic_prediction_proba = logistic_model.predict_proba(preprocessed_data)

        return jsonify({
            'random_forest': {
                'prediction': rf_prediction.tolist(),
                'prediction_proba': rf_prediction_proba.tolist()
            },
            'logistic_regression': {
                'prediction': logistic_prediction.tolist(),
                'prediction_proba': logistic_prediction_proba.tolist()
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
