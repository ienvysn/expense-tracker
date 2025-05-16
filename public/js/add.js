const addTransactionBtn = document.querySelector(".add-transaction-btn");
const addTransactionModal = document.getElementById("add-transaction-modal");
const closeTransactionModalBtn = document.getElementById(
  "close-transaction-modal"
);
const transactionTabButtons = document.querySelectorAll(
  "#add-transaction-modal .tab-btn"
);
const transactionTabContents = document.querySelectorAll(
  "#add-transaction-modal .tab-content"
);
const addIncomeForm = document.getElementById("add-income-form");
const addExpenseForm = document.getElementById("add-expense-form");

addTransactionBtn.addEventListener("click", () => {
  addTransactionModal.style.display = "block";
});

closeTransactionModalBtn.addEventListener("click", () => {
  addTransactionModal.style.display = "none";
});

// Close transaction modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === addTransactionModal) {
    addTransactionModal.style.display = "none";
  }
});

// Tab switching functionality for transaction modal
transactionTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    transactionTabButtons.forEach((btn) => btn.classList.remove("active"));
    transactionTabContents.forEach((content) =>
      content.classList.remove("active")
    );
    button.classList.add("active");
    const tabId = button.dataset.tab;
    document.getElementById(tabId).classList.add("active");
  });
});

addIncomeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const amount = Number(document.getElementById("income-amount").value);
  const category = document.getElementById("income-category").value;
  const description = document.getElementById("income-description").value;
  console.log(typeof category);
  try {
    const res = await axios
      .post("/api/income", {
        Amount: amount,
        Category: category,
        Description: description,
      })
      .then((response) => {
        addIncomeForm.reset();
        addTransactionModal.style.display = "none";
        loadSummaryData();
        loadRecentTransactions();
        loadTopCategories();
        loadAllTransactions("date-desc");
        showNotification("Income added successfully!");
      });
  } catch (error) {
    console.error("Error adding income:", error);
    showNotification("Failed to add income", "error");
  }
});

addExpenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const amount = document.getElementById("expense-amount").value;
  const category = document.getElementById("expense-category").value;
  const description = document.getElementById("expense-description").value;

  try {
    const res = await axios
      .post("/api/expenses", {
        Amount: amount,
        Category: category,
        Description: description,
      })
      .then((response) => {
        addIncomeForm.reset();
        addTransactionModal.style.display = "none";
        loadSummaryData();
        loadRecentTransactions();
        loadTopCategories();
        loadAllTransactions("date-desc");
      });

    showNotification("Expense added successfully!");
  } catch (error) {
    console.error("Error adding expense:", error);
    showNotification("Failed to add expense", "error");
  }
});
