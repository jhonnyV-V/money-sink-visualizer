import { AgCharts, type AgChartOptions } from "ag-charts-community";
//https://www.ag-grid.com/charts/javascript/create-a-basic-chart/
//https://www.ag-grid.com/charts/javascript/ts-generics/
//https://www.ag-grid.com/charts/javascript/donut-series/
//https://www.ag-grid.com/charts/javascript/combination-series/

type myDataType = {
  month: string;
  avgTemp: number;
  iceCreamSales: number;
};

export type rawData = {
  amount: number;
  category?: string[];
  date: string;
  comment?: string;
  tags?: string[];
};

type basicDataChart = {
  amount: number;
  category: string;
  date: string;
  // comment?: string;
  // tags?: string[];
};

let fileData: rawData[] | undefined = undefined

function startFileListening() {
  const fileInput: HTMLInputElement = document.getElementById("inputFile") as HTMLInputElement

  if (!fileInput) {
    console.log("no file input")
    return
  }

  fileInput.addEventListener("change", async () => {
    if (fileInput?.files?.length != 1) {
      return
    }

    const file = await fileInput?.files[0]?.text()
    fileData = JSON.parse(file!)
    renderCharts(fileData!)
  })
}

function renderCharts(rawFileData: rawData[]) {
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

const basicData: basicDataChart[] = [];

for (let i = 0; i < rawFileData.length; i++) {
  const rawDataPoint = rawFileData[i]!;

  let category = "";
  if (!rawDataPoint.category?.length) {
    category = "unknown";
    console.log("unknown data point", rawDataPoint)
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
}

document.addEventListener('DOMContentLoaded', () => {
  startFileListening()
})

