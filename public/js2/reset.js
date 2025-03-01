document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document
      .getElementById("confirmPassword")
      .value.trim();
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.textContent = "";

    if (newPassword !== confirmPassword) {
      errorMessage.textContent = "Passwords do not match.";
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");

    if (!email) {
      errorMessage.textContent = "Invalid or missing email parameter.";
      return;
    }

    // Send the reset request to the server
    try {
      const response = await fetch("/user/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword, confirmPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          data.message ||
            "Password reset successful! Please log in with your new password."
        );
        window.location.href = "/login.html"; // Redirect to login page
      } else {
        const error = await response.json();
        errorMessage.textContent = error.message || "Failed to reset password.";
      }
    } catch (error) {
      console.error("Error:", error);
      errorMessage.textContent = "An error occurred. Please try again.";
    }
  });
});
