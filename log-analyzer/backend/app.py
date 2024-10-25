#!/usr/bin/env python3
"""app.py -- entry point"""

from flask import Flask, request, jsonify
from sklearn.ensemble import IsolationForest
from flask_cors import CORS
from openai import OpenAI
import pandas as pd
from os import getenv

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure OpenAI API Key
client = OpenAI(
    api_key=getenv("OPENAI_API_KEY"),
)

# Function to handle file conversion to DataFrame for various log types
def convert_to_dataframe(file, filename):
    if filename.endswith('.csv'):
        return pd.read_csv(file)
    else:
        # Read as text and attempt to parse based on common log formats
        file_content = file.read().decode('utf-8')
        lines = file_content.strip().split("\n")
        log_list = []
        for line in lines:
            if " " in line:
                parts = line.split(" ")
                if len(parts) >= 3:
                    try:
                        log_list.append({
                            "timestamp": parts[0], 
                            "event_type": parts[1], 
                            "count": int(parts[2])
                        })
                    except ValueError:
                        continue  # Skip lines that don't have the right format
            else:
                log_list.append({"log": line})
        return pd.DataFrame(log_list)

# Simple Anomaly Detection using Isolation Forest
def detect_anomalies(log_df):
    # Assuming 'count' column is available for numerical analysis
    if 'count' in log_df.columns:
        model = IsolationForest(contamination=0.1)
        log_df['anomaly'] = model.fit_predict(log_df[['count']])
        anomalies = log_df[log_df['anomaly'] == -1]
        return anomalies.to_dict(orient='records')
    return []

"""
# Helps to summarize logs to fit expected format for processing and OPENAI
def summarize_logs(logs):
    # Example of simple pre-processing to extract key events from logs
    summary = []
    for log in logs:
        # Extract only important fields like timestamp, error type, and key metrics
        summary.append(f"{log['timestamp']}: {log['event_type']} ({log['count']} occurrences)")
    return "\n".join(summary)
"""

# Using OpenAI for Log Analysis and Recommendations
def analyze_logs_with_openai(logs):
    """Pre-process logs to extract key points (reduce input size)"""
   # processed_logs = summarize_logs(logs)  # Assume you have a function to summarize
    prompt = f"Analyze the following logs and provide insights:\n{logs}"

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Use a compatible model
            messages=[
                {"role": "system", "content": "You are an assistant that analyzes logs and provides insights."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100,
            n=1,
            temperature=0.7,
        )

        # Extract the response text
        return response.choices[0].message['content'].strip()
    
    #except openai.error.RateLimitError:
       #print("OpenAI API request failed: Rate limit exceeded. Please check your plan and quota.")
        #return "Failed to analyze logs: Rate limit exceeded. Please upgrade your plan or check your quota."

    except Exception as e:
        print(f"OpenAI API request failed: {e}")
        return "Failed to analyze logs with OpenAI."


@app.route('/upload_logs', methods=['POST'])
def upload_logs():
    try:
        log_file = request.files['file']
        if not log_file:
            return jsonify({"error": "No file uploaded"}), 400

        filename = log_file.filename
        logs = convert_to_dataframe(log_file, filename)
        
        # Perform anomaly detection
        anomalies = detect_anomalies(logs)
        
        # Use OpenAI for detailed analysis
        insights = analyze_logs_with_openai(logs.to_dict(orient='records'))
        
        # Return results
        return jsonify({
            "anomalies": anomalies,
            "insights": insights
        })
    
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Failed to process file"}), 500

if __name__ == "__main__":
    app.run(debug=True)
