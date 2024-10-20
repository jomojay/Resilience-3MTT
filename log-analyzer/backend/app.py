#!/usr/bin/env python3
"""app.py -- entry point"""

from flask import Flask, request, jsonify
from sklearn.ensemble import IsolationForest
from flask_cors import CORS
import openai
import pandas as pd

app = Flask(__name__)
CORS(app)

# Configure OpenAI API Key
openai.api_key = 'YOUR_OPENAI_API_KEY'

# Dummy Data for Anomaly Detection (normally, you would parse real logs)
log_data = [
    {"timestamp": "2024-10-18 12:00:00", "event_type": "login_failure", "count": 3},
    {"timestamp": "2024-10-18 12:01:00", "event_type": "login_failure", "count": 7},
    {"timestamp": "2024-10-18 12:02:00", "event_type": "login_success", "count": 1},
    {"timestamp": "2024-10-18 12:05:00", "event_type": "login_failure", "count": 12},
]

# Convert log data to DataFrame for model processing
df = pd.DataFrame(log_data)

# Simple Anomaly Detection using Isolation Forest
def detect_anomalies(log_df):
    model = IsolationForest(contamination=0.1)
    log_df['anomaly'] = model.fit_predict(log_df[['count']])
    anomalies = log_df[log_df['anomaly'] == -1]
    return anomalies.to_dict(orient='records')

# Using OpenAI for Log Analysis and Recommendations
def analyze_logs_with_openai(logs):
    prompt = "Analyze the following logs and provide insights:\n" + str(logs)
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=100,
        n=1,
        stop=None,
        temperature=0.7,
    )
    return response.choices[0].text.strip()

@app.route('/upload_logs', methods=['POST'])
def upload_logs():
    log_file = request.files['file']
    logs = pd.read_csv(log_file)
    
    # Perform anomaly detection
    anomalies = detect_anomalies(logs)
    
    # Use OpenAI for detailed analysis
    insights = analyze_logs_with_openai(logs.to_dict(orient='records'))
    
    # Return results
    return jsonify({
        "anomalies": anomalies,
        "insights": insights
    })

if __name__ == "__main__":
    app.run(debug=True)
