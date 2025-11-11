import React from "react";

interface ForecastCardsProps {
  forecast?: {
    short_term_sales?: string;
    monthly_sales?: string;
    customer_growth?: string;
    customer_growth_overall?: string;
    inventory_demand?: string;
  };
}


const ForecastCards: React.FC<ForecastCardsProps> = ({ forecast = {} }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 flex flex-col h-full shadow-sm">
        <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
          Short-term Sales Forecast
        </h4>
        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
          {forecast.short_term_sales || "$0 (next 7 days)"}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          {forecast.monthly_sales || "$0 (next month)"}
        </p>
      </div>

      <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 flex flex-col h-full shadow-sm">
        <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
          Customer Growth Prediction
        </h4>
        <p className="text-lg font-bold text-green-900 dark:text-green-100">
          {forecast.customer_growth || "+0.0% (next month)"}
        </p>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
          {forecast.customer_growth_overall
            ? `Overall growth: ${forecast.customer_growth_overall}`
            : "Based on recent trends"}
        </p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 flex flex-col h-full shadow-sm">
        <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-1">
          Inventory Demand Projection
        </h4>
        <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
          {forecast.inventory_demand || "0 units (next 30 days)"}
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
          Helps with planning stock levels
        </p>
      </div>
    </div>
  );
};

export default ForecastCards;
