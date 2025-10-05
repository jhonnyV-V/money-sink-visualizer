import { AgCharts, type AgCartesianChartOptions, type AgChartInstance, type AgChartOptions } from "ag-charts-community";
import dayjs from 'dayjs'
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
const dateToCombinationChart = new Map<string,combinationDataChart>()

let basicChart: AgChartInstance<AgCartesianChartOptions<basicDataChart, unknown>> | undefined
let onlyExpensesChart: AgChartInstance<AgCartesianChartOptions<basicDataChart, unknown>> | undefined
let combinationChart: AgChartInstance<AgCartesianChartOptions<combinationDataChart, unknown>> | undefined

function getDate(rawDate:string) {
  const date = dayjs(rawDate) 
  if (!date.isValid()) {
    console.log("invalid raw date", rawDate)
    return ''
  }

  if (date.get('day') >= 21) {
    return `${date.get('month') + 1}-${date.get('year')}`
  }
  
  return `${date.get('month')}-${date.get('year')}`
}

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

  for (let i = 0; i < rawFileData.length; i++) {
    const rawDataPoint = rawFileData[i]!;
    const amount = Math.abs(rawDataPoint.amount)

    let category = "";
    if (!rawDataPoint.category?.length) {
      category = "unknown";
      console.log("unknown data point", rawDataPoint)
    } else {
      category = rawDataPoint.category[0]!;
    }

    const rawDate = rawDataPoint.date
    const date = getDate(rawDate)

    let combination = dateToCombinationChart.get(date)
    if (!combination) {
      combination = {
        expenses: 0,
        income: 0,
        date: date,
        rest: 0
      }
    }

    if(category?.includes("work")) {
      combination.income += amount
    } else {
      combination.expenses += amount
    }

    dateToCombinationChart.set(date, combination)

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

  if (basicChart) {
    basicChart.destroy()
  }
  basicChart = AgCharts.create(basicChartOptions);

  const onlyExpensesOptions: AgChartOptions<basicDataChart> = {
    container: document.getElementById("onlyExpenses")!,
    title: {
      text: "Only Expenses"
    },
    data: basicData.filter((dataPoint) => !dataPoint.category.includes("work")),
    series: [{ type: "bar", xKey: "category", yKey: "amount" }],
  };

  if (onlyExpensesChart){
    onlyExpensesChart.destroy()
  }
  onlyExpensesChart = AgCharts.create(onlyExpensesOptions);

  const combinationData: combinationDataChart[] = []
  dateToCombinationChart.forEach((combination) => {
    combinationData.push({
      date: combination.date,
      expenses: combination.expenses,
      income: combination.income,
      rest: Math.abs(combination.income - combination.expenses)
    })
  })

  const combinationChartOptions: AgChartOptions<combinationDataChart> = {
    container: document.getElementById("combinationChart")!,
    title: {
      text: "Income vs Expenses"
    },
    data: combinationData,
    series: [
      {type: "bar", xKey: "date", yKey: "income", yName: "Income", grouped: true},
      {type: "bar", xKey: "date", yKey: "expenses", yName: "Expenses", grouped: true},
      {type: "bar", xKey: "date", yKey: "rest", yName: "Rest", grouped: true},
    ]
  }
  
  if (combinationChart){
    combinationChart.destroy()
  }
  combinationChart = AgCharts.create(combinationChartOptions)
}

document.addEventListener('DOMContentLoaded', () => {
  startFileListening()
})

