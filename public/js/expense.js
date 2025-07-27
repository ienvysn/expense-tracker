// Check if token exists
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login.html";
}
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

let currentPage = 1;
let transactionsPerPage = 7;
let allExpenseData = [];
let userCurrency = localStorage.getItem("currency") || "USD";

function formatCurrency(amount, currency = userCurrency) {
  const symbols = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹', 'CAD': 'C$', 'AUD': 'A$'
  };
  return `${symbols[currency] || '$'}${amount}`;
}

async function fetchAllExpenseData(sortBy = "date-desc") {
  try {
    const response = await axios.get("/api/expenses");
    let expenses = response.data;
    switch (sortBy) {
      case "date-desc":
        expenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "date-asc":
        expenses.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "amount-desc":
        expenses.sort((a, b) => b.Amount - a.Amount);
        break;
      case "amount-asc":
        expenses.sort((a, b) => a.Amount - b.Amount);
        break;
    }
    return expenses;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
}

async function loadAllExpense(sortBy = "date-desc", page = 1) {
  allExpenseData = await fetchAllExpenseData(sortBy);
  currentPage = page;
  displayExpensePage(currentPage);
  renderPaginationControls();
}

function displayExpensePage(page) {
  const startIndex = (page - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const paginatedExpense = allExpenseData.slice(startIndex, endIndex);
  const expenseList = document.getElementById("expense-list");
  expenseList.innerHTML = "";
  if (allExpenseData.length === 0) {
    const noExpenseEl = document.createElement("div");
    noExpenseEl.className = "item-card";
    noExpenseEl.textContent = "No expense found";
    expenseList.appendChild(noExpenseEl);
    return;
  }
  paginatedExpense.forEach((expense) => {
    const date = new Date(expense.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const amount = expense.Amount;
    const category = expense.Category;
    const description = expense.Description || "";
    const expenseElement = document.createElement("div");
    expenseElement.className = `item-card expense`;
    expenseElement.innerHTML = `💸 ${category} - ${formatCurrency(amount)} <small>${date}</small><br><span>${description}</span>`;
    expenseList.appendChild(expenseElement);
  });
}

function renderPaginationControls() {
  let paginationContainer = document.getElementById("pagination-container");
  if (!paginationContainer) {
    paginationContainer = document.createElement("div");
    paginationContainer.id = "pagination-container";
    paginationContainer.className = "pagination";
    const expenseList = document.getElementById("expense-list");
    expenseList.parentNode.insertBefore(paginationContainer, expenseList.nextSibling);
  }
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(allExpenseData.length / transactionsPerPage);
  if (totalPages <= 1) {
    paginationContainer.style.display = "none";
    return;
  } else {
    paginationContainer.style.display = "flex";
  }
  const prevButton = document.createElement("button");
  prevButton.className = "pagination-btn prev";
  prevButton.textContent = "Previous";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      displayExpensePage(currentPage - 1);
      currentPage--;
      renderPaginationControls();
    }
  });
  paginationContainer.appendChild(prevButton);
  const pageInfo = document.createElement("div");
  pageInfo.className = "pagination-info";
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  paginationContainer.appendChild(pageInfo);
  const nextButton = document.createElement("button");
  nextButton.className = "pagination-btn next";
  nextButton.textContent = "Next";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      displayExpensePage(currentPage + 1);
      currentPage++;
      renderPaginationControls();
    }
  });
  paginationContainer.appendChild(nextButton);
}

async function loadExpenseSummary() {
  try {
    const response = await axios.get("/api/summary");
    const { totalExpense } = response.data;
    document.getElementById("expense-summary").textContent = formatCurrency(totalExpense);
  } catch (error) {
    console.error("Error loading expense summary:", error);
  }
}

async function addExpense(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const category = document.getElementById("expense-category").value;
  const description = document.getElementById("expense-description").value;
  try {
    await axios.post("/api/expenses", { Amount: amount, Category: category, Description: description });
    document.getElementById("add-expense-modal").style.display = "none";
    loadAllExpense();
    loadExpenseSummary();
  } catch (error) {
    alert("Failed to add expense");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadAllExpense();
  loadExpenseSummary();
  document.getElementById("sort-expense").addEventListener("change", (e) => {
    loadAllExpense(e.target.value, 1);
  });
  document.getElementById("add-expense-btn").addEventListener("click", () => {
    document.getElementById("add-expense-modal").style.display = "block";
  });
  document.getElementById("close-expense-modal").addEventListener("click", () => {
    document.getElementById("add-expense-modal").style.display = "none";
  });
  document.getElementById("add-expense-form").addEventListener("submit", addExpense);
  document.querySelector(".logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  });
}); 