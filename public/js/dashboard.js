// Check if token exists
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login.html";
}

axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Global variables for pagination
let currentPage = 1;
let transactionsPerPage = 7;
let allTransactionsData = []; // Store all transactions data
let userCurrency = localStorage.getItem("currency") || "USD";

// Function to format amount with currency symbol
function formatCurrency(amount, currency = userCurrency) {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'INR': '₹',
    'CAD': 'C$',
    'AUD': 'A$'
  };
  return `${symbols[currency] || '$'}${amount}`;
}

// Function to update all currency displays on the dashboard
function updateCurrencyDisplay(newCurrency) {
  userCurrency = newCurrency;
  
  // Update summary cards
  const totalBalance = document.querySelector(".card:nth-child(1) .summary-text");
  const totalIncome = document.querySelector(".card:nth-child(2) .summary-text");
  const totalExpense = document.querySelector(".card:nth-child(3) .summary-text");
  
  if (totalBalance) {
    const amount = totalBalance.textContent.replace(/[^0-9.-]+/g, "");
    totalBalance.textContent = formatCurrency(amount);
  }
  if (totalIncome) {
    const amount = totalIncome.textContent.replace(/[^0-9.-]+/g, "");
    totalIncome.textContent = formatCurrency(amount);
  }
  if (totalExpense) {
    const amount = totalExpense.textContent.replace(/[^0-9.-]+/g, "");
    totalExpense.textContent = formatCurrency(amount);
  }
  
  // Refresh transactions to update their currency display
  loadRecentTransactions();
  loadAllTransactions(document.getElementById("sort-transactions").value);
}

// Function to load summary data
async function loadSummaryData() {
  try {
    const response = await axios.get("/api/summary");
    const { totalIncome, totalExpense, totalbalance } = response.data;

    document.querySelector(".card:nth-child(1) .summary-text").textContent = formatCurrency(totalbalance);
    document.querySelector(".card:nth-child(2) .summary-text").textContent = formatCurrency(totalIncome);
    document.querySelector(".card:nth-child(3) .summary-text").textContent = formatCurrency(totalExpense);
  } catch (error) {
    console.error("Error loading summary data:", error);
  }
}

async function fetchAllTransactionsData(sortBy = "date-desc") {
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

      case "type":
        transactions.sort((a, b) => a.type.localeCompare(b.type));
        break;
    }

    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

async function loadAllTransactions(sortBy = "date-desc", page = 1) {
  try {
    allTransactionsData = await fetchAllTransactionsData(sortBy);
    currentPage = page;
    displayTransactionsPage(currentPage);
    renderPaginationControls();
    addTransactionCardListeners();
  } catch (error) {
    console.error("Error loading transactions:", error);
  }
}

function displayTransactionsPage(page) {
  const startIndex = (page - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const paginatedTransactions = allTransactionsData.slice(startIndex, endIndex);
  const allTransactionsContainer = document.querySelector(
    ".all-expenses .item-cards"
  );
  allTransactionsContainer.innerHTML = "";

  // If no transactions, show message
  if (allTransactionsData.length === 0) {
    const noTransactionsEl = document.createElement("div");
    noTransactionsEl.className = "item-card";
    noTransactionsEl.textContent = "No transactions found";
    allTransactionsContainer.appendChild(noTransactionsEl);
    return;
  }

  paginatedTransactions.forEach((transaction) => {
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
      )} ${category} - ${formatCurrency(amount)} <small>${date}</small>
    `;

    allTransactionsContainer.appendChild(transactionElement);
  });

  // Add transaction card listeners after updating the content
  addTransactionCardListeners();
}

function renderPaginationControls() {
  // Check if pagination container exists, if not create it
  let paginationContainer = document.getElementById("pagination-container");
  if (!paginationContainer) {
    paginationContainer = document.createElement("div");
    paginationContainer.id = "pagination-container";
    paginationContainer.className = "pagination";

    // Insert after the item-cards div
    const itemCardsContainer = document.querySelector(
      ".all-expenses .item-cards"
    );
    itemCardsContainer.parentNode.insertBefore(
      paginationContainer,
      itemCardsContainer.nextSibling
    );
  }

  // Clear existing pagination controls
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(
    allTransactionsData.length / transactionsPerPage
  );

  if (totalPages <= 1) {
    // No need for pagination if there's only one page or no data
    paginationContainer.style.display = "none";
    return;
  } else {
    paginationContainer.style.display = "flex";
  }

  // Previous button
  const prevButton = document.createElement("button");
  prevButton.className = "pagination-btn prev";
  prevButton.textContent = "Previous";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      displayTransactionsPage(currentPage - 1);
      currentPage--;
      renderPaginationControls();
    }
  });
  paginationContainer.appendChild(prevButton);

  // Page information
  const pageInfo = document.createElement("div");
  pageInfo.className = "pagination-info";
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  paginationContainer.appendChild(pageInfo);

  // Next button
  const nextButton = document.createElement("button");
  nextButton.className = "pagination-btn next";
  nextButton.textContent = "Next";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      displayTransactionsPage(currentPage + 1);
      currentPage++;
      renderPaginationControls();
    }
  });
  paginationContainer.appendChild(nextButton);
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
          ${getCategoryEmoji(category)} ${category} - ${formatCurrency(amount)} <small>${date}</small>
        `;

        recentTransactionsContainer.appendChild(transactionElement);
      });
    }

    loadAllTransactions(document.getElementById("sort-transactions").value);
    addTransactionCardListeners();
  } catch (error) {
    console.error("Error loading recent transactions:", error);
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

    const transactions = [
      ...expenses.map((e) => ({ ...e, type: "expense" })),
      ...incomes.map((i) => ({ ...i, type: "income" })),
    ];

    transactions.forEach((transaction) => {
      cat = transaction.Category;
      categoriesSum[cat] += transaction.Amount;
    });

    //sort
    const sorted = Object.entries(categoriesSum).sort((a, b) => b[1] - a[1]);

    const topCategory = sorted.slice(0, 3);
    const topCategoriesContainer = document.querySelector(
      ".card:nth-child(2) #top-category"
    );
    
    // Clear existing content before adding new categories
    topCategoriesContainer.innerHTML = "";
  
    topCategory.forEach(([category, amount]) => {
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
              ${getCategoryEmoji(category)} ${category} - ${formatCurrency(amount)}
            `;
      topCategoriesContainer.appendChild(categoryElement);
    });
  } catch(error) {
    const topCategoriesContainer = document.querySelector(
      ".card:nth-child(2) #top-category"
    );
    console.error("Error loading top categories:", error);
    topCategoriesContainer.innerHTML = "";
    const noDataElement = document.createElement("div");
    noDataElement.className = "item-card";
    noDataElement.textContent = "No Transaction Available";
    topCategoriesContainer.appendChild(noDataElement);
  }
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

let currentTransaction = null;

// Function to show transaction details
function showTransactionDetails(transaction) {
  currentTransaction = transaction;

  // Populate the modal with transaction details
  document.getElementById("detail-type").textContent =
    transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
  document.getElementById("detail-amount").textContent = formatCurrency(transaction.Amount);
  document.getElementById("detail-category").textContent = `${getCategoryEmoji(
    transaction.Category
  )} ${transaction.Category}`;
  document.getElementById("detail-description").textContent =
    transaction.Description || "No description";

  const date = new Date(transaction.createdAt);
  const formattedDate = date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById("detail-date").textContent = formattedDate;

  // Style based on transaction type
  const detailType = document.getElementById("detail-type");
  if (transaction.type === "income") {
    detailType.style.color = "#4CAF50";
  } else {
    detailType.style.color = "#d32f2f";
  }

  // Show the modal
  const modal = document.getElementById("transaction-details-modal");
  modal.style.display = "block";
}

// Add click event listeners to transaction cards
function addTransactionCardListeners() {
  // Get all transaction cards
  const allTransactionCards = document.querySelectorAll(
    ".all-expenses .item-card"
  );
  const recentTransactionCards = document.querySelectorAll(
    "#recent-transaction .item-card"
  );

  // Add click event to recent transactions
  recentTransactionCards.forEach((card, index) => {
    card.addEventListener("click", () => {
      const sortedTransactions = [...allTransactionsData].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      if (
        sortedTransactions.length > 0 &&
        index < Math.min(sortedTransactions.length, 5)
      ) {
        showTransactionDetails(sortedTransactions[index]);
      }
    });
  });

  // Add click event to all transactions
  allTransactionCards.forEach((card, index) => {
    card.addEventListener("click", () => {
      const startIndex = (currentPage - 1) * transactionsPerPage;
      const transactionIndex = startIndex + index;

      if (transactionIndex < allTransactionsData.length) {
        showTransactionDetails(allTransactionsData[transactionIndex]);
      }
    });
  });
}

// Function to delete transaction
async function deleteTransaction() {
  if (!currentTransaction) return;

  try {
    let endpoint;
    if (currentTransaction.type === "income") {
      endpoint = `/api/income/${currentTransaction._id}`;
    } else {
      endpoint = `/api/expenses/${currentTransaction._id}`;
    }

    await axios.delete(endpoint);


    document.getElementById("transaction-details-modal").style.display = "none";

    loadSummaryData();
    loadRecentTransactions();
    loadTopCategories();

    alert("Transaction deleted successfully");
  } catch (error) {
    console.error("Error deleting transaction:", error);
    alert("Failed to delete transaction");
  }
}


function setupTransactionDetailsModal() {
  const modal = document.getElementById("transaction-details-modal");
  const closeBtn = document.getElementById("close-transaction-details");
  const deleteBtn = document.getElementById("delete-transaction");

  // Close the modal when clicking the X
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close the modal when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.style.display === "block") {
      modal.style.display = "none";
    }
  });
  deleteBtn.addEventListener("click", deleteTransaction);
}

// Fetch user's currency when page loads
async function fetchUserCurrency() {
  try {
    const response = await axios.get("/api/currency");
    const { currency } = response.data;
    userCurrency = currency;
    localStorage.setItem("currency", currency);
    
    // Update currency display with fetched currency
    updateCurrencyDisplay(currency);
  } catch (error) {
    console.error("Error fetching user currency:", error);
  }
}

// Initialize dashboard
async function initializeDashboard() {
  await fetchUserCurrency();
  await loadSummaryData();
  await loadRecentTransactions();
}

// Call initialize function when page loads
document.addEventListener("DOMContentLoaded", initializeDashboard);

// Load data when page loads
window.addEventListener("DOMContentLoaded", () => {
  loadSummaryData();
  loadRecentTransactions();
  loadTopCategories();
  displayTransactionsPage();

  document
    .getElementById("sort-transactions")
    .addEventListener("change", (e) => {
      loadAllTransactions(e.target.value, 1); // Reset to first page when sorting
    });
  setupTransactionDetailsModal();

  // logout
  document.querySelector(".logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  });
});
