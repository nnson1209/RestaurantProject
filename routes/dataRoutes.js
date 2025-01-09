const router = require("express").Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const mainController = require("../controllers/mainController");

router.get(
  "/",
  authMiddleware(["customer", "staff"]),
  mainController.loadMainPage
);
router.post("/search", authMiddleware(["customer"]), mainController.search);
router.get(
  "/search-result",
  authMiddleware(["customer"]),
  mainController.searchResult
);
router.get(
  "/profile/:id",
  authMiddleware(["customer", "staff"]),
  mainController.loadProfile
);

module.exports = router;
