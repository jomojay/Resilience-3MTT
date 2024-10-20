// ChartComponent.js
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

const ChartComponent = ({ data }) => {
  const chartRef = useRef();

  useEffect(() => {
    Chart.register(...registerables);

    const ctx = chartRef.current.getContext('2d');
    const chartInstance = new Chart(ctx, {
      type: 'bar', // or 'line', 'pie', etc.
      data: data,
      options: {
        // your chart options
      },
    });

    // Cleanup function to destroy the chart instance
    return () => {
      chartInstance.destroy();
    };
  }, [data]); // Re-run the effect if `data` changes

  return <canvas ref={chartRef} />;
};

export default ChartComponent;
