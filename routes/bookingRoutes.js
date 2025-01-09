const router = require("express").Router();
const bookingController = require("../controllers/bookingController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.get(
  "/table",
  authMiddleware(["customer"]),
  bookingController.getTableBooking
);
router.post(
  "/table",
  authMiddleware(["customer"]),
  bookingController.tableBooking
);
router.get(
  "/food/:page",
  authMiddleware(["customer"]),
  bookingController.getFoodBooking
);
router.post(
  "/cart/add",
  authMiddleware(["customer"]),
  bookingController.cartAdding
);
router.post(
  "/cart/update",
  authMiddleware(["customer"]),
  bookingController.cartUpdate
);
router.post(
  "/cart/remove",
  authMiddleware(["customer"]),
  bookingController.cartRemove
);
router.post(
  "/cart/checkout",
  authMiddleware(["customer"]),
  bookingController.cartCheckout
);
router.get(
  "/cart/:id",
  authMiddleware(["customer"]),
  bookingController.getCart
);
router.get(
  "/dish-info/:id",
  authMiddleware(["customer"]),
  bookingController.getDishInfo
);

module.exports = router;
