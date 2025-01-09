const authControllers = require("../controllers/authController");
const router = require("express").Router();

router.get("/login", authControllers.getUserLogin);
router.post("/login", authControllers.postUserLogin);
router.get("/logout", authControllers.logout);
router.get("/register", authControllers.register);
router.post("/register", authControllers.postRegister);

module.exports = router;
