import {
  AgCharts,
  type AgCartesianChartOptions,
  type AgChartInstance,
  type AgChartOptions,
} from "ag-charts-community";
import dayjs from "dayjs";
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

type basicCombinationDataChart = {
  date: string;
  [key: string]: string | number;
};

type combinationDataChart = {
  date: string;
  expenses: number;
  income: number;
  rest: number;
};

let fileData: rawData[] | undefined = undefined;
const dateToCombinationChart = new Map<string, combinationDataChart>();
const dateToBasicCombinationChart = new Map<
  string,
  basicCombinationDataChart
>();

let basicChart:
  | AgChartInstance<AgCartesianChartOptions<basicCombinationDataChart, unknown>>
  | undefined;
let combinationChart:
  | AgChartInstance<AgCartesianChartOptions<combinationDataChart, unknown>>
  | undefined;
let detailedCombinationChart:
  | AgChartInstance<AgCartesianChartOptions<basicCombinationDataChart, unknown>>
  | undefined;

function getDate(rawDate: string) {
  const date = dayjs(rawDate);
  if (!date.isValid()) {
    console.log("invalid raw date", rawDate);
    return "";
  }

  if (date.get("day") >= 21) {
    return `${date.get("month") + 1}-${date.get("year")}`;
  }

  return `${date.get("month")}-${date.get("year")}`;
}

function startFileListening() {
  const fileInput: HTMLInputElement = document.getElementById(
    "inputFile",
  ) as HTMLInputElement;

  if (!fileInput) {
    console.log("no file input");
    return;
  }

  fileInput.addEventListener("change", async () => {
    if (fileInput?.files?.length != 1) {
      return;
    }

    const file = await fileInput?.files[0]?.text();
    fileData = JSON.parse(file!);
    renderCharts(fileData!);
  });
}

function renderCharts(rawFileData: rawData[]) {
  const catregories = new Set<string>();
  for (let i = 0; i < rawFileData.length; i++) {
    const rawDataPoint = rawFileData[i]!;
    const amount = Math.abs(rawDataPoint.amount);

    let category = "";
    if (!rawDataPoint.category?.length) {
      category = "unknown";
      console.log("unknown data point", rawDataPoint);
    } else {
      category = rawDataPoint.category[0]!;
      category = category.toLowerCase();
    }

    catregories.add(category);

    const rawDate = rawDataPoint.date;
    const date = getDate(rawDate);

    let combination = dateToCombinationChart.get(date);
    if (!combination) {
      combination = {
        expenses: 0,
        income: 0,
        date: date,
        rest: 0,
      };
    }

    if (category?.includes("work")) {
      combination.income += amount;
    } else {
      combination.expenses += amount;
    }

    dateToCombinationChart.set(date, combination);

    let simple = dateToBasicCombinationChart.get(date);
    if (!simple) {
      simple = {
        date: date,
      };
    }
    if (!simple[category]) {
      simple[category] = 0;
    }
    simple[category] = (simple[category] as number) + amount;

    dateToBasicCombinationChart.set(date, simple);
  }

  const combinationData: combinationDataChart[] = [];

  for (const combination of dateToCombinationChart.values()) {
    combinationData.push({
      date: combination.date,
      expenses: combination.expenses,
      income: combination.income,
      rest: Math.abs(combination.income - combination.expenses),
    });
  }

  const combinationChartOptions: AgChartOptions<combinationDataChart> = {
    container: document.getElementById("combinationChart")!,
    title: {
      text: "Income vs Expenses",
    },
    data: combinationData,
    series: [
      {
        type: "bar",
        xKey: "date",
        yKey: "income",
        yName: "Income",
        grouped: true,
      },
      {
        type: "bar",
        xKey: "date",
        yKey: "expenses",
        yName: "Expenses",
        grouped: true,
      },
      { type: "bar", xKey: "date", yKey: "rest", yName: "Rest", grouped: true },
    ],
  };

  if (combinationChart) {
    combinationChart.destroy();
  }
  combinationChart = AgCharts.create(combinationChartOptions);

  const detailedData: basicCombinationDataChart[] = [];

  for (const combination of dateToBasicCombinationChart.values()) {
    detailedData.push(combination);
  }

  const detailedSeries: {
    type: "bar";
    xKey: "date";
    yKey: string;
    yName: string;
    grouped: true;
  }[] = [];

  const template = {
    type: "bar",
    xKey: "date",
    grouped: true,
  } as const;

  for (const key of catregories.values()) {
    detailedSeries.push({
      ...template,
      yKey: key,
      yName: `${key[0]?.toUpperCase()}${key.slice(1)}`,
    });
  }

  const basicChartOption: AgCartesianChartOptions = {
    container: document.getElementById("basicChart")!,
    title: {
      text: "All by Date",
    },
    data: detailedData,
    series: detailedSeries,
  };

  if (basicChart) {
    basicChart.destroy();
  }
  basicChart = AgCharts.create(basicChartOption);

  const detailedCombinationChartOption: AgCartesianChartOptions = {
    container: document.getElementById("detailedCombinationChart")!,
    title: {
      text: "Only Expenses by Date",
    },
    data: detailedData.map((combination) => {
      const expense = {
        ...combination,
      };

      if (expense["work"]) {
        delete expense["work"];
      }

      return expense;
    }),
    series: detailedSeries.filter((serie) => serie.yKey != "work"),
  };

  if (detailedCombinationChart) {
    detailedCombinationChart.destroy();
  }
  detailedCombinationChart = AgCharts.create(detailedCombinationChartOption);
}

document.addEventListener("DOMContentLoaded", () => {
  startFileListening();
});
