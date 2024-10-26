const ordersService = require("../services/orders.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");

async function createOrder(req, res, next) {
  try {
    const order = await ordersService.createOrder({
      ...req.body,
      CreatedBy: req.user.UserID
    });
    
    return res
      .status(201)
      .set({
        Location: `${req.baseUrl}/${order.id}`,
      })
      .json(JSend.success({ order }));
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while creating the order")
    );
  }
}

async function getOrdersByFilter(req, res, next) {
  let result = {
    orders: [],
    metadata: {
      totalRecords: 0,
      firstPage: 1,
      lastPage: 1,
      page: 1,
      limit: 5,
    },
  };

  try {
    result = await ordersService.getManyOrders(req.query);
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while retrieving orders")
    );
  }
  return res.json(
    JSend.success({
      orders: result.orders,
      metadata: result.metadata,
    })
  );
}

async function getOrder(req, res, next) {
  const { id } = req.params;

  try {
    const order = await ordersService.getOrderById(id);
    if (!order) {
      return next(new ApiError(404, "Order not found"));
    }
    return res.json(JSend.success({ order }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error retrieving order with id=${id}`));
  }
}

async function updateOrder(req, res, next) {
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  const { id } = req.params;

  try {
    const updated = await ordersService.updateOrder(id, {
      ...req.body,
      UpdatedBy: req.user.UserID
    });
    if (!updated) {
      return next(new ApiError(404, "Order not found"));
    }
    return res.json(
      JSend.success({
        order: updated,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error updating order with id=${id}`));
  }
}

async function deleteOrder(req, res, next) {
  const { id } = req.params;

  try {
    const deleted = await ordersService.deleteOrder(id, req.user.UserID);
    if (!deleted) {
      return next(new ApiError(404, "Order not found"));
    }
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Could not delete order with id=${id}`));
  }
}

async function deleteMultiOrders(req, res, next) {
  const { orderIds } = req.body;

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return next(new ApiError(400, "Invalid order IDs"));
  }

  try {
    await deleteOrdersByIds(orderIds, req.user.UserID);
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while removing orders")
    );
  }
}

module.exports = {
  getOrdersByFilter,
  deleteMultiOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
};
