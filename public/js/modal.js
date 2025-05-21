const profileNavLink = document.querySelector(".nav-link:nth-child(5)"); // Profile nav link
const profileModal = document.getElementById("profile-modal");
const closeModalBtn = document.querySelector(".close-modal");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const profileForm = document.getElementById("profile-form");
const passwordForm = document.getElementById("password-form");
const settingsForm = document.getElementById("settings-form");
const deleteAccountBtn = document.getElementById("delete-account");

// Open modal when profile link is clicked
profileNavLink.addEventListener("click", () => {
  profileModal.style.display = "block";
});

// Close modal when X is clicked
closeModalBtn.addEventListener("click", () => {
  profileModal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === profileModal) {
    profileModal.style.display = "none";
  }
});

// Tab switching
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));
    button.classList.add("active");
    const tabId = button.dataset.tab;
    document.getElementById(tabId).classList.add("active");
  });
});

// Profile form submission
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("profile-username").value;

  try {
    const responseUsername = await axios.post("/api/profile/username", {
      username,
    });

    showNotification("Profile updated successfully!");
  } catch (error) {
    console.error("Error updating profile:", error);
    showNotification("Failed to update profile", "error");
  }
});

passwordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (newPassword !== confirmPassword) {
    showNotification("New passwords do not match", "error");
    return;
  }
  console.log(typeof confirmPassword);
  try {
    const response = await axios.post("/api/profile/password", {
      confirmPassword,
    });
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";
    showNotification("Password changed successfully!");
  } catch (error) {
    console.error("Error changing password:", error);
    showNotification("Failed to change password", "error");
  }
});

settingsForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const currency = document.getElementById("currency").value;

  try {
    // Update currency via API
    const response = await axios.post("/api/currency", { currency });

    // Update local storage
    localStorage.setItem("currency", currency);

    // Update currency display across the dashboard
    updateCurrencyDisplay(currency);
    showNotification("Settings updated successfully!");
  } catch (error) {
    console.error("Error updating settings:", error);
    showNotification("Failed to update settings", "error");
  }
});
deleteAccountBtn.addEventListener("click", () => {
  const confirmModal = document.createElement("div");
  confirmModal.className = "confirm-modal";
  confirmModal.innerHTML = `
    <div class="confirm-content">
      <h3>Delete Account</h3>
      <p>Are you sure you want to delete your account? This action cannot be undone.</p>
      <div class="confirm-buttons">
        <button class="cancel-btn">Cancel</button>
        <button class="confirm-delete-btn">Delete Account</button>
      </div>
    </div>
  `;

  document.body.appendChild(confirmModal);
  confirmModal.style.display = "block";

  // Cancel button
  confirmModal.querySelector(".cancel-btn").addEventListener("click", () => {
    document.body.removeChild(confirmModal);
  });

  // Confirm delete button
  confirmModal
    .querySelector(".confirm-delete-btn")
    .addEventListener("click", async () => {
      try {
        localStorage.removeItem("token");
        window.location.href = "/login.html";
      } catch (error) {
        console.error("Error deleting account:", error);
        showNotification("Failed to delete account", "error");
        document.body.removeChild(confirmModal);
      }
    });
});

function showNotification(message, type = "success") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = message;

  // Add notification to page
  document.body.appendChild(notification);

  // Position it
  notification.style.position = "fixed";
  notification.style.bottom = "20px";
  notification.style.right = "20px";
  notification.style.padding = "15px 20px";
  notification.style.borderRadius = "5px";
  notification.style.color = "#fff";
  notification.style.zIndex = "2000";
  notification.style.animation = "fadeIn 0.3s";

  // Color based on type
  if (type === "success") {
    notification.style.backgroundColor = "#4caf50";
  } else if (type === "error") {
    notification.style.backgroundColor = "#f44336";
  }

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "fadeOut 0.3s";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

const style = document.createElement("style");
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);
