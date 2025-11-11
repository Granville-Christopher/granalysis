import React from "react";

interface TablePreviewProps {
  data?: any[];
  loading?: boolean;
}

const TablePreview: React.FC<TablePreviewProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Data Preview</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">Loading data...</p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Data Preview</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Select a file to view data preview
        </p>
      </div>
    );
  } 

  const columns = Object.keys(data[0]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Data Preview</h3>
      <div className="overflow-x-auto overflow-y-auto max-h-[900px]">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, i) => (
              <tr key={i} className="text-sm">
                {columns.map((col, j) => (
                  <td key={j} className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                    {typeof row[col] === 'object' ? JSON.stringify(row[col]) : row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TablePreview;
