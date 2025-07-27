// Check if token exists
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login.html";
}
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

let currentPage = 1;
let transactionsPerPage = 7;
let allIncomeData = [];
let userCurrency = localStorage.getItem("currency") || "USD";

function formatCurrency(amount, currency = userCurrency) {
  const symbols = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹', 'CAD': 'C$', 'AUD': 'A$'
  };
  return `${symbols[currency] || '$'}${amount}`;
}

async function fetchAllIncomeData(sortBy = "date-desc") {
  try {
    const response = await axios.get("/api/income");
    let incomes = response.data;
    switch (sortBy) {
      case "date-desc":
        incomes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "date-asc":
        incomes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "amount-desc":
        incomes.sort((a, b) => b.Amount - a.Amount);
        break;
      case "amount-asc":
        incomes.sort((a, b) => a.Amount - b.Amount);
        break;
    }
    return incomes;
  } catch (error) {
    console.error("Error fetching income:", error);
    return [];
  }
}

async function loadAllIncome(sortBy = "date-desc", page = 1) {
  allIncomeData = await fetchAllIncomeData(sortBy);
  currentPage = page;
  displayIncomePage(currentPage);
  renderPaginationControls();
}

function displayIncomePage(page) {
  const startIndex = (page - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const paginatedIncome = allIncomeData.slice(startIndex, endIndex);
  const incomeList = document.getElementById("income-list");
  incomeList.innerHTML = "";
  if (allIncomeData.length === 0) {
    const noIncomeEl = document.createElement("div");
    noIncomeEl.className = "item-card";
    noIncomeEl.textContent = "No income found";
    incomeList.appendChild(noIncomeEl);
    return;
  }
  paginatedIncome.forEach((income) => {
    const date = new Date(income.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const amount = income.Amount;
    const category = income.Category;
    const description = income.Description || "";
    const incomeElement = document.createElement("div");
    incomeElement.className = `item-card income`;
    incomeElement.innerHTML = `💰 ${category} - ${formatCurrency(amount)} <small>${date}</small><br><span>${description}</span>`;
    incomeList.appendChild(incomeElement);
  });
}

function renderPaginationControls() {
  let paginationContainer = document.getElementById("pagination-container");
  if (!paginationContainer) {
    paginationContainer = document.createElement("div");
    paginationContainer.id = "pagination-container";
    paginationContainer.className = "pagination";
    const incomeList = document.getElementById("income-list");
    incomeList.parentNode.insertBefore(paginationContainer, incomeList.nextSibling);
  }
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(allIncomeData.length / transactionsPerPage);
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
      displayIncomePage(currentPage - 1);
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
      displayIncomePage(currentPage + 1);
      currentPage++;
      renderPaginationControls();
    }
  });
  paginationContainer.appendChild(nextButton);
}

async function loadIncomeSummary() {
  try {
    const response = await axios.get("/api/summary");
    const { totalIncome } = response.data;
    document.getElementById("income-summary").textContent = formatCurrency(totalIncome);
  } catch (error) {
    console.error("Error loading income summary:", error);
  }
}

async function addIncome(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("income-amount").value);
  const category = document.getElementById("income-category").value;
  const description = document.getElementById("income-description").value;
  try {
    await axios.post("/api/income", { Amount: amount, Category: category, Description: description });
    document.getElementById("add-income-modal").style.display = "none";
    loadAllIncome();
    loadIncomeSummary();
  } catch (error) {
    alert("Failed to add income");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadAllIncome();
  loadIncomeSummary();
  document.getElementById("sort-income").addEventListener("change", (e) => {
    loadAllIncome(e.target.value, 1);
  });
  document.getElementById("add-income-btn").addEventListener("click", () => {
    document.getElementById("add-income-modal").style.display = "block";
  });
  document.getElementById("close-income-modal").addEventListener("click", () => {
    document.getElementById("add-income-modal").style.display = "none";
  });
  document.getElementById("add-income-form").addEventListener("submit", addIncome);
  document.querySelector(".logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  });
}); 