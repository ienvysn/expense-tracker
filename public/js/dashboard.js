// Check if token exists
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login.html";
}

// Setup axios with authorization header
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Function to load summary data
async function loadSummaryData() {
  try {
    const response = await axios.get("/api/summary");
    console.log(response);
    const { totalIncome, totalExpense, totalbalance } = response.data;
    console.log(totalIncome, totalExpense);
    // Update the UI
    document.querySelector(
      ".card:nth-child(1) .summary-text"
    ).textContent = `$${totalbalance}`;
    document.querySelector(
      ".card:nth-child(2) .summary-text"
    ).textContent = `$${totalIncome}`;
    document.querySelector(
      ".card:nth-child(3) .summary-text"
    ).textContent = `$${totalExpense}`;
  } catch (error) {
    console.error("Error loading summary data:", error);
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/login.html";
    }
  }
}

async function loadAllTransactions(sortBy = "date-desc") {
  try {
    // Get expenses
    const expensesResponse = await axios.get("/api/expenses");
    const expenses = expensesResponse.data;

    // Get income
    const incomeResponse = await axios.get("/api/income");
    const incomes = incomeResponse.data;

    // Combine transactions
    let transactions = [
      ...expenses.map((e) => ({ ...e, type: "expense" })),
      ...incomes.map((i) => ({ ...i, type: "income" })),
    ];

    // Sort based on selected option
    switch (sortBy) {
      case "date-desc":
        transactions.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "date-asc":
        transactions.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "amount-desc":
        transactions.sort((a, b) => b.Amount - a.Amount);
        break;
      case "amount-asc":
        transactions.sort((a, b) => a.Amount - b.Amount);
        break;
      case "category":
        transactions.sort((a, b) => a.Category.localeCompare(b.Category));
        break;
      case "type":
        transactions.sort((a, b) => a.type.localeCompare(b.type));
        break;
    }

    // Get the all transactions container
    const allTransactionsContainer = document.querySelector(
      ".all-expenses .item-cards"
    );
    allTransactionsContainer.innerHTML = ""; // Clear existing content

    // If no transactions, show message
    if (transactions.length === 0) {
      const noTransactionsEl = document.createElement("div");
      noTransactionsEl.className = "item-card";
      noTransactionsEl.textContent = "No transactions found";
      allTransactionsContainer.appendChild(noTransactionsEl);
      return;
    }

    // Display all transactions with the applied sorting
    transactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const amount = transaction.Amount;
      const category = transaction.Category;
      const type = transaction.type;

      // Create and add the transaction element
      const transactionElement = document.createElement("div");
      transactionElement.className = `item-card ${type}`;
      transactionElement.innerHTML = `
        ${getCategoryEmoji(
          category
        )} ${category} - $${amount} <small>${date}</small>
      `;

      allTransactionsContainer.appendChild(transactionElement);
    });
  } catch (error) {
    console.error("Error loading transactions:", error);
  }
}

// Function to load recent transactions
async function loadRecentTransactions() {
  try {
    const expensesResponse = await axios.get("/api/expenses");
    const expenses = expensesResponse.data;

    const incomeResponse = await axios.get("/api/income");
    const incomes = incomeResponse.data;

    // Combine and sort by date (newest first)
    const transactions = [
      ...expenses.map((e) => ({ ...e, type: "expense" })),
      ...incomes.map((i) => ({ ...i, type: "income" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const recentTransactionsContainer = document.querySelector(
      ".card:nth-child(1) #recent-transaction"
    );
    recentTransactionsContainer.innerHTML = "";

    // Display recent transactions (limit to 5)
    const recentTransactions = transactions.slice(0, 5);
    if (recentTransactions.length === 0) {
      const noTransactionsEl = document.createElement("div");
      noTransactionsEl.className = "item-card";
      noTransactionsEl.textContent = "No recent transactions";
      recentTransactionsContainer.appendChild(noTransactionsEl);
    } else {
      recentTransactions.forEach((transaction) => {
        const date = new Date(transaction.createdAt).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric" }
        );
        const amount = transaction.Amount;
        const category = transaction.Category;
        const type = transaction.type;

        const transactionElement = document.createElement("div");
        transactionElement.className = `item-card ${type}`;
        transactionElement.innerHTML = `
          ${getCategoryEmoji(
            category
          )} ${category} - $${amount} <small>${date}</small>
        `;

        recentTransactionsContainer.appendChild(transactionElement);
      });
    }

    loadAllTransactions("date-desc");
  } catch (error) {
    console.error("Error loading transactions:", error);

    // Display error message in the container
    const recentTransactionsContainer = document.querySelector(
      "#recent-transaction"
    );
    recentTransactionsContainer.innerHTML = "";

    const errorEl = document.createElement("div");
    errorEl.className = "item-card";
    errorEl.textContent = "Error loading transactions";
    recentTransactionsContainer.appendChild(errorEl);
  }
}

async function loadTopCategories() {
  const categories = [
    "Food",
    "Transportation",
    "Health",
    "Entertainment",
    "Shopping",
    "Insurance",
    "Misc",
    "Personal",
    "Salary",
    "Business",
    "Gifts",
    "Interest",
    "Allowance",
    "Other",
  ];
  const categoriesSum = {
    // Expense categories
    Food: 0,
    Transportation: 0,
    Health: 0,
    Entertainment: 0,
    Shopping: 0,
    Insurance: 0,
    Misc: 0,
    Personal: 0,

    // Income categories
    Salary: 0,
    Business: 0,
    Gifts: 0,
    Interest: 0,
    Allowance: 0,
    Other: 0,
  };
  try {
    const expensesResponse = await axios.get("/api/expenses");
    const expenses = expensesResponse.data;

    // Get income
    const incomeResponse = await axios.get("/api/income");
    const incomes = incomeResponse.data;

    // console.log(expenses);
    const transactions = [
      ...expenses.map((e) => ({ ...e, type: "expense" })),
      ...incomes.map((i) => ({ ...i, type: "income" })),
    ];

    transactions.forEach((transaction) => {
      cat = transaction.Category;

      // console.log(categoriesSum.Category);
      categoriesSum[cat] += transaction.Amount;
    });

    //sort
    console.log(categoriesSum);
    const sorted = Object.entries(categoriesSum).sort((a, b) => b[1] - a[1]);
    console.log(sorted);

    const topCategory = sorted.slice(0, 3);
    console.log(topCategory);
    const topCategoriesContainer = document.querySelector(
      ".card:nth-child(2) #top-category"
    );
    topCategoriesContainer.innerHTML = ""; // Clear existing content

    topCategory.forEach(([category, amount]) => {
      // Skip categories with zero amount
      if (amount <= 0) return;

      const type = [
        "Salary",
        "Business",
        "Gifts",
        "Interest",
        "Allowance",
        "Other",
      ].includes(category)
        ? "income"
        : "expense";

      const categoryElement = document.createElement("div");
      categoryElement.className = `item-card ${type}`;
      categoryElement.innerHTML = `
              ${getCategoryEmoji(category)} ${category} - $${amount}
            `;

      topCategoriesContainer.appendChild(categoryElement);
    });

    if (topCategoriesContainer.children.length === 0) {
      const noDataElement = document.createElement("div");
      noDataElement.className = "item-card";
      noDataElement.textContent = "No transaction data available";
      topCategoriesContainer.appendChild(noDataElement);
    }
  } catch {}
}

// Helper function to get emoji for category
function getCategoryEmoji(category) {
  const emojis = {
    // Expense categories
    Food: "🍕",
    Transportation: "🚌",
    Health: "💊",
    Entertainment: "🎮",
    Shopping: "🛍️",
    Insurance: "📝",
    Misc: "📦",
    Personal: "👤",

    // Income categories
    Salary: "💰",
    Business: "💼",
    Gifts: "🎁",
    Interest: "💹",
    Allowance: "💵",
    Other: "🔄",
  };

  return emojis[category] || "📊";
}

// Load data when page loads
window.addEventListener("DOMContentLoaded", () => {
  loadSummaryData();
  loadRecentTransactions();
  loadTopCategories();

  // Add listener for sorting dropdown
  document
    .getElementById("sort-transactions")
    .addEventListener("change", (e) => {
      loadAllTransactions(e.target.value);
    });

  // Add logout functionality
  document.querySelector(".user-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  });
});
