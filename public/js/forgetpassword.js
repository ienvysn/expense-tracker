// public/js/modal.js

document.addEventListener("DOMContentLoaded", () => {
  // Get references to the modal elements
  const forgotPasswordLink = document.getElementById("forgot-password");
  const forgotPasswordModal = document.getElementById("forgotPasswordModal");
  const closeButton = forgotPasswordModal.querySelector(".close-button");
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const modalMessage = document.getElementById("modalMessage");

  // Function to open the modal
  const openModal = () => {
    forgotPasswordModal.classList.add("visible");

    modalMessage.textContent = "";
    modalMessage.className = "modal-message";
    forgotPasswordForm.reset();
  };

  // Function to close the modal
  const closeModal = () => {
    forgotPasswordModal.classList.remove("visible");
  };

  // Event listener to open the modal when "Forgot Password?" link is clicked
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      console.log("click");
      e.preventDefault(); // Prevent default link behavior
      openModal();
    });
  }

  // Event listener to close the modal when the close button is clicked
  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
  }

  // Event listener to close the modal when clicking outside the modal content
  if (forgotPasswordModal) {
    forgotPasswordModal.addEventListener("click", (e) => {
      // If the click target is the backdrop itself (not a child of modal-content)
      if (e.target === forgotPasswordModal) {
        closeModal();
      }
    });
  }

  // Handle Forgot Password Form Submission
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Prevent default form submission

      const email = document.getElementById("resetEmail").value;
      modalMessage.textContent = "Sending reset link...";
      modalMessage.className = "modal-message"; // Reset class

      try {
        // IMPORTANT: Replace '/api/forgot-password' with your actual backend endpoint
        // You will need to create this endpoint in your Node.js server
        const response = await fetch("/api/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          modalMessage.textContent =
            data.message || "Password reset link sent to your email!";
          modalMessage.classList.add("success");
          // Optionally close modal after a short delay or on user action
          // setTimeout(closeModal, 3000);
        } else {
          modalMessage.textContent =
            data.error || "Failed to send reset link. Please try again.";
          modalMessage.classList.add("error");
        }
      } catch (error) {
        console.error("Error sending password reset request:", error);
        modalMessage.textContent = "An error occurred. Please try again later.";
        modalMessage.classList.add("error");
      }
    });
  }
});
