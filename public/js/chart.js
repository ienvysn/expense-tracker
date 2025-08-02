// A global variable to hold our chart instance so we can access it later
let incomeExpenseChart = null;

// This is the function you will call from your other scripts to update the chart
async function renderOrUpdateChart() {
  const token = localStorage.getItem("token");
  if (!token) return;

  // A helper function to format currency
  function formatCurrency(amount) {
    const currency = localStorage.getItem("currency") || "USD";
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      INR: "₹",
      CAD: "C$",
      AUD: "A$",
    };
    return `${symbols[currency] || "$"}${(amount || 0).toFixed(2)}`;
  }

  // A custom plugin to draw text in the center of the doughnut chart
  const centerTextPlugin = {
    id: "centerText",
    afterDraw: (chart) => {
      if (
        chart.config.type !== "doughnut" ||
        !chart.options.plugins.centerText.display
      ) {
        return;
      }
      const ctx = chart.ctx;
      const { top, left, width, height } = chart.chartArea;
      const text = chart.options.plugins.centerText.text;
      const subText = chart.options.plugins.centerText.subText;
      ctx.save();
      ctx.font = `bold ${width / 10}px Poppins`;
      ctx.fillStyle = "#f3f3f3";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, left + width / 2, top + height / 2.2);
      ctx.font = `normal ${width / 20}px Poppins`;
      ctx.fillStyle = "#aaa";
      ctx.fillText(subText, left + width / 2, top + height / 1.7);
      ctx.restore();
    },
  };

  try {
    const response = await axios.get("/api/chart/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { totalIncome, totalExpense, balance } = response.data;

    const ctx = document
      .getElementById("incomeVsExpenseChart")
      .getContext("2d");

    // If a chart instance already exists, destroy it before creating a new one
    if (incomeExpenseChart) {
      incomeExpenseChart.destroy();
    }

    // Create the new chart using your latest configuration
    incomeExpenseChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Income", "Expense"],
        datasets: [
          {
            data: [totalIncome, totalExpense],
            backgroundColor: ["#4caf50", "#f87171"],
            borderWidth: 3,
            hoverOffset: 15,
            borderColor: ["#4caf50", "#f87171"], // I've kept your borderless setting
          },
        ],
      },
      plugins: [centerTextPlugin],
      options: {
        responsive: true,
        cutout: "65%",
        plugins: {
          centerText: {
            display: true,
            text: formatCurrency(balance),
            subText: "Current Balance",
          },
          legend: {
            position: "bottom",
            labels: {
              color: "var(--bg)",
              padding: 20,
              font: {
                size: 14,
                weight: "500",
              },
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => formatCurrency(context.parsed),
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching or rendering chart:", error);
    const chartContainer = document.querySelector(".chart-container");
    if (chartContainer) {
      chartContainer.innerHTML =
        '<p style="color: #aaa;">Could not load chart data.</p>';
    }
  }
}

window.renderOrUpdateChart = renderOrUpdateChart;

document.addEventListener("DOMContentLoaded", renderOrUpdateChart);
