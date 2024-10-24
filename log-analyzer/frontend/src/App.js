// frontend/src/App.tsx

import React, { useState } from "react";
import axios from "axios";
import { Button, Container, Form, Row, Col, Alert } from "react-bootstrap";
import ChartComponent from "./ChartComponent";


const App = () => {
  const [file, setFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState("bar"); // Default chart type

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadAndAnalyzeLogs = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/upload_logs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Set analysis result and chart data
      setAnalysisResult(response.data.insights);

      // Assuming the response contains data for the chart
      const formattedData = {
        labels: response.data.anomalies.map(item => item.event_type || item.timestamp),
        datasets: [
          {
            label: "Anomaly Count",
            data: response.data.anomalies.map(item => item.count),
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      };
      setChartData(formattedData);

    } catch (error) {
      console.error("Error uploading and analyzing logs:", error);
      setAnalysisResult("Failed to analyze logs.");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="text-center mb-4">Log Analyzer</h1>

          <Form.Group controlId="logFile">
            <Form.Label>Select a log file:</Form.Label>
            <Form.Control type="file" onChange={handleFileChange} />
          </Form.Group>

          <div className="text-center mt-4">
            <Button variant="primary" onClick={uploadAndAnalyzeLogs}>
              Upload & Analyze Logs
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

          {chartData && (
            <div className="mt-5" style={{ height: "400px" }}>
              <ChartComponent data={chartData} type={chartType} />
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default App;
