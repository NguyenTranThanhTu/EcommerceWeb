const express = require("express");
const ordersController = require("../controllers/orders.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/v1/orders", router);
  
  router.get("/", ordersController.getOrdersByFilter);

  router.post("/", authenticateToken, ordersController.createOrder);

  router.delete("/", authenticateToken, ordersController.deleteMultiOrders);

  router.get("/:id", ordersController.getOrder);

  router.put("/:id", authenticateToken, ordersController.updateOrder);

  router.delete("/:id", authenticateToken, ordersController.deleteOrder);
};
