import { useState } from "react";
import { BarChart3, PieChart, TrendingUp, Download, Share2 } from "lucide-react";

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface DataVisualizationProps {
  data: DataPoint[];
  title: string;
  type: 'bar' | 'pie' | 'line';
  onExport?: () => void;
  onShare?: () => void;
}

const DataVisualization = ({ data, title, type, onExport, onShare }: DataVisualizationProps) => {
  const [selectedData, setSelectedData] = useState<DataPoint | null>(null);

  const maxValue = Math.max(...data.map(d => d.value));
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];

  const getColor = (index: number) => data[index]?.color || colors[index % colors.length];

  const renderBarChart = () => (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
            <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-500 hover:opacity-80 cursor-pointer"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: getColor(index)
              }}
              onClick={() => setSelectedData(item)}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            currentAngle += angle;

            return (
              <path
                key={index}
                d={pathData}
                fill={getColor(index)}
                className="hover:opacity-80 cursor-pointer transition-opacity"
                onClick={() => setSelectedData(item)}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
          </div>
        </div>
      </div>
    );
  };

  const renderLineChart = () => (
    <div className="space-y-4">
      <div className="h-32 flex items-end justify-between gap-1">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center space-y-1"
          >
            <div
              className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: getColor(index),
                minHeight: '4px'
              }}
              onClick={() => setSelectedData(item)}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'line':
        return renderLineChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {type === 'bar' && <BarChart3 className="h-5 w-5 text-blue-500" />}
          {type === 'pie' && <PieChart className="h-5 w-5 text-green-500" />}
          {type === 'line' && <TrendingUp className="h-5 w-5 text-purple-500" />}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Export data"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Share chart"
            >
              <Share2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-4">
        {renderChart()}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getColor(index) }}
            />
            <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
            <span className="ml-auto font-medium text-gray-900 dark:text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Selected Data Details */}
      {selectedData && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            {selectedData.label}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Value: {selectedData.value} ({((selectedData.value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)
          </p>
        </div>
      )}
    </div>
  );
};

export default DataVisualization;

