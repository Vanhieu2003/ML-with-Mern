from flask import Flask, request, jsonify
import pandas as pd
from joblib import load
from flask_cors import CORS

# Load the trained Random Forest model
model = load('random_forest_model_ROS.joblib')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Hoặc thay "*" bằng URL cụ thể

def preprocess_data(data):
    # Convert to DataFrame
    df = pd.DataFrame([data])
    
    # Preprocessing steps
    df['term'] = df['term'].astype(str).map(lambda x: x.lstrip(' ').rstrip(' months')).astype('int64')
    
    df['emp_length'] = pd.to_numeric(df['emp_length'].astype(str).apply(lambda x: 0 if "<" in x else (x.split('+')[0] if "+" in x else x.split()[0])))
    
    df['grade']= df['grade'].map({'A': 0, 'B': 1,'C': 2,'D': 3,'E': 4,'F': 5,'G': 6})

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
