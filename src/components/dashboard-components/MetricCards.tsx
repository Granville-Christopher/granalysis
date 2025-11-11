import React from "react";
import { Card } from "../ui/card";


interface MetricCardsProps {
  data: {
    totalSales: number;
    totalOrders: number;
    topProduct: string;
    total_profit: number;
    salesGrowth: number;
    forecast: number;
    text: string;
    alerts: string[];
    aiRecommendations: string[];
    salesTrend: any[];
    forecastTrend: any[];
  };
}

const MetricCards: React.FC<MetricCardsProps> = ({ data }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-lg rounded-2xl bg-white p-4">
        <h3>Total Sales</h3>
        <p>{data.totalSales}</p>
      </Card>
      <Card className="shadow-lg rounded-2xl bg-white p-4">
        <h3>Total Orders</h3>
        <p>{data.totalOrders}</p>
      </Card>
      <Card className="shadow-lg roundee-2xl bg-white p-4">
        <h3>Total Profit</h3>
        <p>{data.total_profit}</p>
      </Card>
      <Card className="shadow-lg rounded-2xl bg-white p-4">
        <h3>Top Product</h3>
        <p>{data.topProduct}</p>
      </Card>
      <Card className="shadow-lg rounded-2xl bg-white p-4">
        <h3>Sales Growth</h3>
        <p>{data.salesGrowth}%</p>
      </Card>
    </div>
  );
};

export default MetricCards;
