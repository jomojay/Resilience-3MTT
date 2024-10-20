// frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import ChartComponent from './ChartComponent'; // Ensure you have the correct path

function App() {
  const [logData, setLogData] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [chartData, setChartData] = useState(null); // State to hold chart data

  const handleLogDataChange = (e) => {
    setLogData(e.target.value);
  };

  const analyzeLogs = async () => {
    try {
      const response = await axios.post('http://localhost:5000/analyze', { logs: logData });
      setAnalysisResult(response.data.analysis);
      
      // Assuming the analysis result contains data for the chart
      // You need to format this data to be compatible with Chart.js
      const formattedData = {
        labels: response.data.chartLabels, // Adjust as per your API response
        datasets: [
          {
            label: 'Analysis Result',
            data: response.data.chartData, // Adjust as per your API response
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
      setChartData(formattedData); // Set the formatted chart data

    } catch (error) {
      console.error('Error analyzing logs:', error);
      setAnalysisResult('Failed to analyze logs.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Log Analyzer</h1>
        <textarea
          placeholder="Paste your log data here..."
          value={logData}
          onChange={handleLogDataChange}
          rows="10"
          cols="50"
        />
        <br />
        <button onClick={analyzeLogs}>Analyze Logs</button>
        <div className="analysis-result">
          <h2>Analysis Result:</h2>
          <p>{analysisResult}</p>
        </div>
        {/* Render the chart only if chartData is available */}
        {chartData && <ChartComponent data={chartData} />}
      </header>
    </div>
  );
}

export default App;
