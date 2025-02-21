const express = require("express");
const wishlistController = require("../controllers/wishlistcontroller");
const router = express.Router();

router.post("/add", wishlistController.addItemToWishlist);
router.get("/user", wishlistController.getUserWishlist);
router.delete("/remove", wishlistController.removeItemFromWishlist);
router.post("/moveToCart", wishlistController.moveItemToCart);

module.exports = router;
