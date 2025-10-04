import { AgCharts, type AgChartOptions } from "ag-charts-community";
//https://www.ag-grid.com/charts/javascript/create-a-basic-chart/
//https://www.ag-grid.com/charts/javascript/ts-generics/

type myDataType = {
  month: string,
  avgTemp: number,
  iceCreamSales: number
}

const options: AgChartOptions<myDataType> = {
    // Container: HTML Element to hold the chart
    container: document.getElementById('myChart')!,
    // Data: Data to be displayed in the chart
    data: [
        { month: 'Jan', avgTemp: 2.3, iceCreamSales: 162000 },
        { month: 'Mar', avgTemp: 6.3, iceCreamSales: 302000 },
        { month: 'May', avgTemp: 16.2, iceCreamSales: 800000 },
        { month: 'Jul', avgTemp: 22.8, iceCreamSales: 1254000 },
        { month: 'Sep', avgTemp: 14.5, iceCreamSales: 950000 },
        { month: 'Nov', avgTemp: 8.9, iceCreamSales: 200000 },
    ],
    // Series: Defines which chart type and data to use
    series: [{ type: 'bar', xKey: 'month', yKey: 'iceCreamSales' }],
};

AgCharts.create(options)
