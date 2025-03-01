document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgot");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = form.email.value;

    try {
      const response = await fetch("/user/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "Password reset email sent.");
        window.location.href = "/login.html"; // Redirect to login page
      } else {
        const error = await response.json();
        alert(error.message || "Failed to send password reset email.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  });
});
