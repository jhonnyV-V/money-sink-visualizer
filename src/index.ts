import { AgCharts, type AgChartOptions } from "ag-charts-community";
import dataExample from "./data.ts";
//https://www.ag-grid.com/charts/javascript/create-a-basic-chart/
//https://www.ag-grid.com/charts/javascript/ts-generics/
//https://www.ag-grid.com/charts/javascript/donut-series/
//https://www.ag-grid.com/charts/javascript/combination-series/

type myDataType = {
  month: string;
  avgTemp: number;
  iceCreamSales: number;
};

const options: AgChartOptions<myDataType> = {
  // Container: HTML Element to hold the chart
  container: document.getElementById("exampleChart")!,
  // Data: Data to be displayed in the chart
  data: [
    { month: "Jan", avgTemp: 2.3, iceCreamSales: 162000 },
    { month: "Mar", avgTemp: 6.3, iceCreamSales: 302000 },
    { month: "May", avgTemp: 16.2, iceCreamSales: 800000 },
    { month: "Jul", avgTemp: 22.8, iceCreamSales: 1254000 },
    { month: "Sep", avgTemp: 14.5, iceCreamSales: 950000 },
    { month: "Nov", avgTemp: 8.9, iceCreamSales: 200000 },
  ],
  // Series: Defines which chart type and data to use
  series: [{ type: "bar", xKey: "month", yKey: "iceCreamSales" }],
};

AgCharts.create(options);

type basicDataChart = {
  amount: number;
  category: string;
  date: string;
  // comment?: string;
  // tags?: string[];
};

const basicData: basicDataChart[] = [];

for (let i = 0; i < dataExample.length; i++) {
  const rawDataPoint = dataExample[i]!;

  let category = "";
  if (!rawDataPoint.category?.length) {
    category = "unknown";
  } else {
    category = rawDataPoint.category[0]!;
  }

  const dataPoint: basicDataChart = {
    amount: Math.abs(rawDataPoint.amount),
    date: rawDataPoint.date,
    category: category,
  };
  basicData.push(dataPoint);
}

const options2: AgChartOptions<basicDataChart> = {
  // Container: HTML Element to hold the chart
  container: document.getElementById("basicChart")!,
  // Data: Data to be displayed in the chart
  data: basicData,
  // Series: Defines which chart type and data to use
  series: [{ type: "bar", xKey: "category", yKey: "amount" }],
};

AgCharts.create(options2);
