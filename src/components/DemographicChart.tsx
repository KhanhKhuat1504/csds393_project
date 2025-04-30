import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';

// Register the required chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Props interface for the DemographicChart component
 * 
 * @interface DemographicChartProps
 * @property {Object} data - Key-value pairs where keys are demographic categories and values are counts
 * @property {string} title - Title displayed above the chart
 * @property {'gender' | 'position' | 'year'} type - Type of demographic data being displayed
 * @property {boolean} isEnoughData - Whether there is sufficient data to render the chart
 */
interface DemographicChartProps {
  data: { [key: string]: number };
  title: string;
  type: 'gender' | 'position' | 'year';
  isEnoughData: boolean;
}

/**
 * Color schemes for different demographic types
 * Each type has matching background and border colors for chart segments
 * 
 * @constant
 * @type {Object}
 */
const colorSchemes = {
  gender: {
    backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)']
  },
  position: {
    backgroundColor: [
      'rgba(75, 192, 192, 0.6)', 
      'rgba(153, 102, 255, 0.6)', 
      'rgba(255, 159, 64, 0.6)',
      'rgba(199, 199, 199, 0.6)',
      'rgba(83, 102, 255, 0.6)',
      'rgba(255, 99, 132, 0.6)'
    ],
    borderColor: [
      'rgba(75, 192, 192, 1)', 
      'rgba(153, 102, 255, 1)', 
      'rgba(255, 159, 64, 1)',
      'rgba(199, 199, 199, 1)',
      'rgba(83, 102, 255, 1)',
      'rgba(255, 99, 132, 1)'
    ]
  },
  year: {
    backgroundColor: [
      'rgba(54, 162, 235, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(255, 206, 86, 0.6)'
    ],
    borderColor: [
      'rgba(54, 162, 235, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(255, 206, 86, 1)'
    ]
  }
};

/**
 * DemographicChart component for displaying demographic data in a pie chart.
 * Renders different visualizations for gender, position (academic level), and age distributions.
 * Shows a placeholder message when not enough data is available.
 * 
 * @component
 * @param {DemographicChartProps} props - Component props
 * @returns {JSX.Element} Pie chart visualization or fallback message when data is insufficient
 */
const DemographicChart: React.FC<DemographicChartProps> = ({ data, title, type, isEnoughData }) => {
  if (!isEnoughData) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">Not enough data</p>
      </div>
    );
  }

  // Convert data to ChartJS format
  const chartData: ChartData<'pie'> = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: colorSchemes[type].backgroundColor,
        borderColor: colorSchemes[type].borderColor,
        borderWidth: 1,
      },
    ],
  };

  /**
   * Chart configuration options
   * Customizes appearance, legend position, tooltip formatting, etc.
   */
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        callbacks: {
          /**
           * Custom tooltip label formatter
           * Displays percentage and count for each demographic category
           * 
           * @param {Object} context - Chart context containing label and value data
           * @returns {string} Formatted tooltip label with percentage and count
           */
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}% (${value})`;
          }
        }
      }
    },
  };

  return (
    <div className="flex flex-col items-center bg-white rounded-lg p-4 shadow-sm h-56">
      <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="h-44 w-full">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DemographicChart; 