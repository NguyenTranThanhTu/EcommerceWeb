const express = require("express");
const cartItemsController = require("../controllers/cart-items.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/v1/cartItems", router);
  
  router.get("/", cartItemsController.getCartItemsByFilter);

  router.post("/", authenticateToken, cartItemsController.createCartItem);

  router.delete("/", authenticateToken, cartItemsController.deleteMultiCartItems);

  router.get("/:id", cartItemsController.getCartItem);

  router.put("/:id", authenticateToken, cartItemsController.updateCartItem);

  router.delete("/:id", authenticateToken, cartItemsController.deleteCartItem);
};
