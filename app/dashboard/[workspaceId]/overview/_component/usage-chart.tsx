'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  Chart,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartDataPoint } from '@/lib/stores/dashboard/dashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UsageChartProps {
  data: ChartDataPoint[];
  isLoading: boolean;
}

export function UsageChart({ data, isLoading }: UsageChartProps) {
 const chartRef = useRef<Chart<"line"> | null>(null);

  useEffect(() => {
    // Cleanup chart on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-80 rounded-lg border animate-pulse" style={{ backgroundColor: '#F5F5F5', borderColor: '#E5E5E5' }} />
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-80 rounded-lg border flex items-center justify-center" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
        <p style={{ color: '#999999' }}>No data available for this period</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'SMS',
        data: data.map(d => d.sms),
        borderColor: '#DC143C',
        backgroundColor: 'rgba(220, 20, 60, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#DC143C',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'Email',
        data: data.map(d => d.email),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'OTP',
        data: data.map(d => d.otp),
        borderColor: '#FF9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#FF9800',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#666666',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#1A1A1A',
        bodyColor: '#666666',
        borderColor: '#E5E5E5',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#999999',
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#E5E5E5',
          drawBorder: false,
        },
        ticks: {
          color: '#999999',
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}