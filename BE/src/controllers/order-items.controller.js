const orderItemsService = require("../services/order-items.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");

async function createOrderItem(req, res, next) {
  if (!req.body?.orderItem_name || typeof req.body.orderItem_name !== "string") {
    return next(new ApiError(400, "Name should be a non-empty string"));
  }

  try {
    const orderItem = await orderItemsService.createOrderItem({
      ...req.body,
    });

    return res
      .status(201)
      .set({
        Location: `${req.baseUrl}/${orderItem.id}`,
      })
      .json(JSend.success({ orderItem }));
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while creating the orderItem")
    );
  }
}

async function getOrderItemsByFilter(req, res, next) {
  let result = {
    orderItems: [],
    metadata: {
      totalRecords: 0,
      firstPage: 1,
      lastPage: 1,
      page: 1,
      limit: 5,
    },
  };

  try {
    result = await orderItemsService.getManyOrderItems(req.query);
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while retrieving orderItems")
    );
  }
  return res.json(
    JSend.success({
      orderItems: result.orderItems,
      metadata: result.metadata,
    })
  );
}

async function getOrderItem(req, res, next) {
  const { id } = req.params;

  try {
    const orderItem = await orderItemsService.getOrderItemById(id);
    if (!orderItem) {
      return next(new ApiError(404, "OrderItem not found"));
    }
    return res.json(JSend.success({ orderItem }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error retrieving orderItem with id=${id}`));
  }
}

async function updateOrderItem(req, res, next) {
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  const { id } = req.params;

  try {
    const updated = await orderItemsService.updateOrderItem(id, {
      ...req.body,
    });
    if (!updated) {
      return next(new ApiError(404, "OrderItem not found"));
    }
    return res.json(
      JSend.success({
        orderItem: updated,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error updating orderItem with id=${id}`));
  }
}

async function deleteOrderItem(req, res, next) {
  const { id } = req.params;

  try {
    const deleted = await orderItemsService.deleteOrderItem(id);
    if (!deleted) {
      return next(new ApiError(404, "OrderItem not found"));
    }
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Could not delete orderItem with id=${id}`));
  }
}

async function deleteMultiOrderItems(req, res, next) {
  const { orderItemIds } = req.body;

  if (!Array.isArray(orderItemIds) || orderItemIds.length === 0) {
    return next(new ApiError(400, "Invalid orderItem IDs"));
  }

  try {
    await orderItemsService.deleteOrderItemsByIds(orderItemIds);
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while removing orderItems")
    );
  }
}

module.exports = {
  getOrderItemsByFilter,
  deleteMultiOrderItems,
  getOrderItem,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
};
