import React from "react";

interface KpiCardsProps {
  totalProfit: number | string | undefined;
  totalSales: number | string | undefined;
  totalCustomerCount: number | string | undefined;
  mostSoldProduct: string | undefined;
  growthRate: number | string | undefined;
}

// Utility: safely parse numbers (handles strings like "10,159" too)
const parseNumber = (val: number | string | undefined): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
};

const KpiCards: React.FC<KpiCardsProps> = ({
  totalProfit,
  totalSales,
  totalCustomerCount,
  mostSoldProduct,
  growthRate,
}) => {
  const totalProfitNum = parseNumber(totalProfit);
  const totalSalesNum = parseNumber(totalSales);
  const totalCustomerNum = parseNumber(totalCustomerCount);
  const growthRateNum = parseNumber(growthRate);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
      <div className="bg-blue-500 text-white p-3 rounded-lg shadow-lg relative">
        <h3 className="text-sm font-medium opacity-80">Total Sales</h3>
        <p className="text-2xl font-bold mt-1">
          ${totalSalesNum.toLocaleString()}
        </p>
      </div>

      <div className="bg-purple-500 text-white p-3 rounded-lg shadow-lg relative">
        <h3 className="text-sm font-medium opacity-80">Total Profit</h3>
        <p className="text-2xl font-bold mt-1">
          ${totalProfitNum.toLocaleString()}
        </p>
      </div>

      <div className="bg-green-500 text-white p-3 rounded-lg shadow-lg relative">
        <h3 className="text-sm font-medium opacity-80">Customer Count</h3>
        <p className="text-2xl font-bold mt-1">
          {totalCustomerNum.toLocaleString()}
        </p>
      </div>

      <div className="bg-yellow-500 text-white p-3 rounded-lg shadow-lg relative">
        <h3 className="text-sm font-medium opacity-80">Most Sold Product</h3>
        <p className="text-xl font-bold mt-1">{mostSoldProduct ?? "N/A"}</p>
      </div>

      <div className="bg-red-500 text-white p-3 rounded-lg shadow-lg relative">
        <h3 className="text-sm font-medium opacity-80">Sales Growth Rate</h3>
        <p className="text-2xl font-bold mt-1">{growthRateNum.toFixed(2)}%</p>
      </div>
    </div>
  );
};


export default KpiCards;
