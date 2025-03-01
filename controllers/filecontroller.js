// fileController.js
const path = require("path");

const sendShop = (req, res) => {
  const filePath = path.join(__dirname, "..", "public", "html", "shop.html");

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err.message);
      res.status(500).json({ error: "Error sending file" });
    }
  });
};

const sendShopSub = (req, res) => {
  const filePath = path.join(__dirname, "..", "public", "html", "shopsub.html");

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err.message);
      res.status(500).json({ error: "Error sending file" });
    }
  });
};

module.exports = { sendShop, sendShopSub };
