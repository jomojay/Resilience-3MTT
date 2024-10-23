// frontend/src/App.tsx
import React, { useState } from "react";
import axios from "axios";
import { Button, Container, Form, Row, Col, Alert } from "react-bootstrap";
import ChartComponent from "./ChartComponent"; // Ensure you have the correct path

const App = () => {
  const [logData, setLogData] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [chartData, setChartData] = useState(null);

  const handleLogDataChange = (e) => {
    setLogData(e.target.value);
  };

  const analyzeLogs = async () => {
    try {
      const response = await axios.post("http://localhost:5000/analyze", {
        logs: logData,
      });
      setAnalysisResult(response.data.analysis);

      // Assuming the analysis result contains data for the chart
      // You need to format this data to be compatible with Chart.js
      const formattedData = {
        labels: response.data.chartLabels, // Adjust as per your API response
        datasets: [
          {
            label: "Analysis Result",
            data: response.data.chartData, // Adjust as per your API response
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      };
      setChartData(formattedData); // Set the formatted chart data
    } catch (error) {
      console.error("Error analyzing logs:", error);
      setAnalysisResult("Failed to analyze logs.");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="text-center mb-4">Resilience-3MTT Log Analyzer</h1>
          <Form.Group controlId="logData">
            <Form.Label>Paste your log data here:</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              value={logData}
              onChange={handleLogDataChange}
              placeholder="Enter log data..."
            />
          </Form.Group>

          <div className="text-center mt-4">
            <Button variant="primary" onClick={analyzeLogs}>
              Analyze Logs
            </Button>
          </div>

          <div className="mt-4">
            <h2>Analysis Result:</h2>
            {analysisResult ? (
              <Alert variant="info">{analysisResult}</Alert>
            ) : (
              <p>No analysis available yet.</p>
            )}
          </div>

          {/* Render the chart only if chartData is available */}
          {chartData && (
            <div className="mt-5">
              <ChartComponent data={chartData} />
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default App;
