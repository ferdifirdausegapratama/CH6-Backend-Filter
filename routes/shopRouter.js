const router = require("express").Router();

const { shopController } = require("../controllers");
const authenticate = require("../middlewares/authenticate");

router.post("", authenticate, shopController.createShop);
router.get("", authenticate, shopController.getAllShop);
router.get("/:id", authenticate, shopController.getShopById);
router.patch("/:id", shopController.updateShop);
router.delete("/:id", shopController.deleteShop);

module.exports = router;
