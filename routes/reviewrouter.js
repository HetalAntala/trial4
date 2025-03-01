const express = require("express");
const reviewController = require("../controllers/reviewcontroller");
const router = express.Router();

router.post("/add", reviewController.addFeedback);
router.get("/:productId", reviewController.getProductFeedback);
router.delete("/delete", reviewController.deleteFeedback);
router.get("/",reviewController.feedbacks);

module.exports = router;
