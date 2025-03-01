const express = require("express");
const cartController = require("../controllers/cartcontroller");
const router = express.Router();

router.post("/add", cartController.addItemToCart);
router.get("/user", cartController.getUserCart);
router.put("/update", cartController.updateCartItem);
router.delete("/remove", cartController.removeItemFromCart);
router.post("/addFromProduct", cartController.addItemToCartFromProduct);
router.get("/cartCount", cartController.getCartCount);

module.exports = router;
