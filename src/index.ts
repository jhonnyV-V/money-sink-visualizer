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

let startDate: dayjs.Dayjs | undefined = undefined;
let endDate: dayjs.Dayjs | undefined = undefined;
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

function getDate(rawDate: string): string {
  const date = dayjs(rawDate, "m/d/yyyy");
  if (!date.isValid()) {
    console.log("invalid raw date", rawDate);
    return "";
  }

  if (date.toDate().getDate() >= 21) {
    return date.add(1, "month").format("MM-YYYY");
  }

  return date.format("MM-YYYY");
}

function isDateInRange(rawDate: string): boolean {
  const date = dayjs(rawDate, "m/d/yyyy");
  if (!date.isValid()) {
    return true;
  }

  if (date.isBefore(startDate, "day")) {
    return false;
  }

  if (endDate && date.isAfter(endDate, "day")) {
    return false;
  }

  return true;
}

function clearHandler() {
  const button = document.getElementById("clearButton")!;
  if (!button) {
    console.log("no clear button");
    return;
  }

  button.addEventListener("click", () => {
    const fileInput: HTMLInputElement = document.getElementById(
      "inputFile",
    ) as HTMLInputElement;
    fileInput.value = "";

    const startDateInput = document.getElementById(
      "startDate",
    ) as HTMLInputElement;
    if (startDateInput) {
      startDateInput.value = "";
      startDate = undefined;
    }

    const endDateInput = document.getElementById("endDate") as HTMLInputElement;
    if (endDateInput) {
      endDateInput.value = "";
      endDate = undefined;
    }

    if (detailedCombinationChart) {
      detailedCombinationChart.destroy();
    }

    if (basicChart) {
      basicChart.destroy();
    }

    if (combinationChart) {
      combinationChart.destroy();
    }

    dateToCombinationChart.clear()
    dateToBasicCombinationChart.clear()
  });
}

function inputDateHandler() {
  const startDateInput = document.getElementById(
    "startDate",
  ) as HTMLInputElement;
  if (!startDateInput) {
    console.log("no startDate input");
    return;
  }

  const endDateInput = document.getElementById("endDate") as HTMLInputElement;
  if (!endDateInput) {
    console.log("no endDate input");
    return;
  }

  startDateInput.addEventListener("change", () => {
    if (startDateInput.value) {
      startDate = dayjs(startDateInput.value, "YYYY-MM-DD");
    }
  });

  endDateInput.addEventListener("change", () => {
    if (endDateInput.value) {
      endDate = dayjs(endDateInput.value, "YYYY-MM-DD");
    }
  });
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
    let fileData: any = JSON.parse(file!);
    if (fileData?.transactions) {
      fileData = fileData.transactions
    }
    renderCharts(fileData!);
  });
}

function renderCharts(rawFileData: rawData[]) {
  const catregories = new Set<string>();
  for (let i = 0; i < rawFileData.length; i++) {
    const rawDataPoint = rawFileData[i]!;
    const amount = Math.abs(rawDataPoint.amount);
    const date = getDate(rawDataPoint.date);

    if (startDate) {
      const isValid = isDateInRange(rawDataPoint.date);
      if (!isValid) {
        continue;
      }
    }

    let category = "";
    if (!rawDataPoint.category?.length) {
      category = "unknown";
      console.log("unknown data point", rawDataPoint);
    } else {
      category = rawDataPoint.category[0]!;
      category = category.toLowerCase();
    }

    catregories.add(category);

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
  clearHandler();
  inputDateHandler();
  startFileListening();
});
