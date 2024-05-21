"use stric";

const tableBodyElement = document.getElementById("t-body");
const pageElements = document.getElementsByClassName("page");
const chartElement = document.getElementById("chart");
const dialogElement = document.getElementById("dialog");
const exitChartElement = document.getElementById("exit");

const API_URL = "https://openapiv1.coinstats.app";
const apiKey = "NelcY3Ho1LwzFNY1Y+clT6llPVVtCDFu54Ecz1NeXgk=";

let chartWidth;

const handleChartWidth = () => {
  if (screen.availWidth > 720) {
    chartWidth = 540;
  } else if (screen.availWidth < 720 && screen.availWidth > 522) {
    chartWidth = 350;
  } else if (screen.availWidth < 522) {
    chartWidth = 300;
  }

  return chartWidth;
};

handleChartWidth();

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    "X-API-KEY": apiKey,
  },
};

const optionChart = {
  chart: {
    type: "area",
    stacked: false,
    height: 450,
    width: chartWidth,
    zoom: {
      type: "x",
      enabled: true,
      autoScaleYaxis: true,
    },
    toolbar: {
      autoSelected: "zoom",
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 0,
  },
  title: {
    text: "Price Movement",
    align: "left",
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      inverseColors: false,
      opacityFrom: 0.5,
      opacityTo: 0,
      stops: [0, 90, 100],
    },
  },
  yaxis: {
    labels: {
      formatter: (val) => {
        return val.toFixed(2);
      },
    },
    title: {
      text: "Price",
    },
  },
  xaxis: {
    type: "datetime",
    tickAmount: 13,
    labels: {
      formatter: (val) => {
        const date = new Date(val);
        const hours = date.getHours();
        const minutes = date.getMinutes();

        if (minutes < 30) {
          return `${hours}`.padStart(2, "0");
        } else {
          return `${hours + 1}`.padStart(2, "0");
        }
      },
    },
  },
  tooltip: {
    shared: false,
    y: {
      formatter: function (val) {
        return val;
      },
    },
  },
};

console.log(chartWidth);

async function fetchCoinChart(coinId) {
  const response = await fetch(
    `${API_URL}/coins/${coinId}/charts?period=24h`,
    options
  );
  const finalResponse = await response.json();
  const prices = finalResponse.map((item) => {
    return [new Date(item[0] * 1000), item[1]];
  });

  const newOptionChart = {
    ...optionChart,
    series: [{ name: `${coinId} Price`, data: prices }],
  };

  chartElement.innerHTML = "";

  const chart = new ApexCharts(chartElement, newOptionChart);
  chart.render();
}

async function fetchCoinsPage(pageNumber) {
  let url = `${API_URL}/coins?page=${pageNumber}`;

  const response = await fetch(url, options);

  const finalResponse = await response.json();
  const coins = finalResponse.result;

  coins.forEach((coin) => {
    const tableRowElement = document.createElement("tr");
    const rankTdElement = document.createElement("td");
    const iconTdElement = document.createElement("td");
    const symbolTdElement = document.createElement("td");
    const nameTdElement = document.createElement("td");
    const priceTdElement = document.createElement("td");
    const dayliChangeTdElement = document.createElement("td");
    const buttonsTdElement = document.createElement("td");
    const iconImage = document.createElement("img");
    const buttonsElement = document.createElement("button");

    tableRowElement.classList.add("row-td");
    rankTdElement.classList.add("rank-td");
    iconTdElement.classList.add("icon-td");
    symbolTdElement.classList.add("symbol-td");
    nameTdElement.classList.add("name-td");
    priceTdElement.classList.add("price-td");
    dayliChangeTdElement.classList.add("changePrice-td");
    buttonsTdElement.classList.add("button-td");
    iconImage.classList.add("iconImg");
    buttonsElement.classList.add("chartBtn");

    rankTdElement.textContent = coin.rank;
    iconImage.src = coin.icon;
    symbolTdElement.textContent = coin.symbol;
    nameTdElement.textContent = coin.name;
    priceTdElement.textContent = Number(coin.price).toFixed(2);
    dayliChangeTdElement.textContent = coin.priceChange1d;
    buttonsElement.textContent = "Chart";

    buttonsElement.addEventListener("click", () => {
      fetchCoinChart(coin.id);
      dialogElement.style.display = "block";
    });

    if (dayliChangeTdElement.textContent.startsWith("-")) {
      dayliChangeTdElement.style.color = "red";
    } else {
      dayliChangeTdElement.style.color = "#3da509";
    }

    symbolTdElement.classList.add("symbol");

    iconTdElement.appendChild(iconImage);
    buttonsTdElement.appendChild(buttonsElement);

    allTds = [
      rankTdElement,
      iconTdElement,
      symbolTdElement,
      nameTdElement,
      priceTdElement,
      dayliChangeTdElement,
      buttonsTdElement,
    ];

    allTds.forEach((td) => {
      tableRowElement.appendChild(td);
    });

    tableBodyElement.appendChild(tableRowElement);
  });
}

fetchCoinsPage(1);

function clearTable() {
  tableBodyElement.innerHTML = "";
}

[...pageElements].forEach((pageElement) => {
  pageElement.addEventListener("click", () => {
    let text = pageElement.textContent;

    clearTable();
    fetchCoinsPage(text);
  });
});

exitChartElement.addEventListener("click", () => {
  dialogElement.style.display = "none";
});
