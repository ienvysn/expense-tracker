// Check if token exists
const token = localStorage.getItem("token");
if (!token) {
  console.log("o tokeonnnn ");
  window.location.href = "/login.html";
}

axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Global variables for pagination
let currentPage = 1;
let transactionsPerPage = 7;
let allTransactionsData = []; // Store all transactions data

// Function to load summary data
async function loadSummaryData() {
  try {
    const response = await axios.get("/api/summary");
    console.log(response);
    const { totalIncome, totalExpense, totalbalance } = response.data;
    console.log(totalIncome, totalExpense);

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
  console.log();
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
      )} ${category} - $${amount} <small>${date}</small>
    `;

    allTransactionsContainer.appendChild(transactionElement);
  });
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
          ${getCategoryEmoji(
            category
          )} ${category} - $${amount} <small>${date}</small>
        `;

        recentTransactionsContainer.appendChild(transactionElement);
      });
    }

    loadAllTransactions("date-desc");
    addTransactionCardListeners();
  } catch (error) {
    console.error("Error loading transactions:", error);

    const recentTransactionsContainer = document.querySelector(
      "#recent-transaction"
    );
    recentTransactionsContainer.innerHTML = "";

    const errorEl = document.createElement("div");
    errorEl.className = "item-card";
    errorEl.textContent = "No Transaction Available";
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
  } catch {
    const topCategoriesContainer = document.querySelector(
      ".card:nth-child(2) #top-category"
    );
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
  document.getElementById(
    "detail-amount"
  ).textContent = `$${transaction.Amount}`;
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

    // Close the modal
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

// Setup modal close and delete button functionality
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

  // Handle delete button click
  deleteBtn.addEventListener("click", deleteTransaction);
}
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
