const express = require("express");
const orderItemsController = require("../controllers/order-items.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/v1/orderItems", router);
  
  router.get("/", orderItemsController.getOrderItemsByFilter);

  router.post("/", authenticateToken, orderItemsController.createOrderItem);

  router.delete("/", authenticateToken, orderItemsController.deleteMultiOrderItems);

  router.get("/:id", orderItemsController.getOrderItem);

  router.put("/:id", authenticateToken, orderItemsController.updateOrderItem);

  router.delete("/:id", authenticateToken, orderItemsController.deleteOrderItem);
};
