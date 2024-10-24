// ChartComponent.js

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

const ChartComponent = ({ data, type = 'bar' }) => {
  const chartRef = useRef();

  useEffect(() => {
    Chart.register(...registerables);

    const ctx = chartRef.current.getContext('2d');
    const chartInstance = new Chart(ctx, {
      type: type, // Use the type passed as a prop, defaults to 'bar'
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Event Type / Timestamp'
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              // Customize the tooltip to display additional info
              label: (tooltipItem) => {
                return `${tooltipItem.dataset.label}: ${tooltipItem.parsed.y}`;
              }
            }
          }
        }
      },
    });

    // Cleanup function to destroy the chart instance
    return () => {
      chartInstance.destroy();
    };
  }, [data, type]); // Re-run the effect if `data` or `type` changes

  return <canvas ref={chartRef} />;
};

export default ChartComponent;
