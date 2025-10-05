import { AgCharts, type AgChartOptions } from "ag-charts-community";
//https://www.ag-grid.com/charts/javascript/create-a-basic-chart/
//https://www.ag-grid.com/charts/javascript/ts-generics/
//https://www.ag-grid.com/charts/javascript/donut-series/

//income again expenses
//https://www.ag-grid.com/charts/javascript/combination-series/

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

type combinationDataChart = {
  date: string,
  expenses: number,
  income: number,
  rest: number
}

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
  const basicData: basicDataChart[] = [];
  const combinationData: combinationDataChart = {
    date: new Date().toDateString(),
    expenses: 0,
    income: 0,
    rest: 0
  }

  for (let i = 0; i < rawFileData.length; i++) {
    const rawDataPoint = rawFileData[i]!;
    const amount = Math.abs(rawDataPoint.amount)

    let category = "";
    if (!rawDataPoint.category?.length) {
      category = "unknown";
      combinationData.expenses += amount
      console.log("unknown data point", rawDataPoint)
    } else {
      if(rawDataPoint.category[0]?.includes("work")) {
        combinationData.income += amount
      } else {
        combinationData.expenses += amount
      }
      category = rawDataPoint.category[0]!;
    }

    const dataPoint: basicDataChart = {
      amount: amount,
      date: rawDataPoint.date,
      category: category,
    };
    basicData.push(dataPoint);
  }

  const basicChartOptions: AgChartOptions<basicDataChart> = {
    container: document.getElementById("basicChart")!,
    title: {
      text: "All data"
    },
    data: basicData,
    series: [{ type: "bar", xKey: "category", yKey: "amount" }],
  };

  AgCharts.create(basicChartOptions);

  const onlyExpensesOptions: AgChartOptions<basicDataChart> = {
    container: document.getElementById("onlyExpenses")!,
    title: {
      text: "Only Expenses"
    },
    data: basicData.filter((dataPoint) => !dataPoint.category.includes("work")),
    series: [{ type: "bar", xKey: "category", yKey: "amount" }],
  };

  AgCharts.create(onlyExpensesOptions);

  combinationData.rest = combinationData.income - combinationData.expenses

  const combinationChartOptions: AgChartOptions<combinationDataChart> = {
    container: document.getElementById("combinationChart")!,
    title: {
      text: "Income vs Expenses"
    },
    data: [combinationData],
    series: [
      {type: "bar", xKey: "date", yKey: "income", yName: "Income", grouped: true},
      {type: "bar", xKey: "date", yKey: "expenses", yName: "Expenses", grouped: true},
      {type: "bar", xKey: "date", yKey: "rest", yName: "Rest", grouped: true},
    ]
  }

  AgCharts.create(combinationChartOptions)
}

document.addEventListener('DOMContentLoaded', () => {
  startFileListening()
})

