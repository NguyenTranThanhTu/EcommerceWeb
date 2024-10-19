const knex = require("../database/knex");
const Paginator = require("./paginator");

function orderItemRepository() {
  return knex("orderItems");
}

function readOrderItem(payload) {
  return {
    OrderID: payload.OrderID,
    ProductID: payload.ProductID,
    Quantity: payload.Quantity,
    Price: payload.Price,
  };
}

async function createOrderItem(payload) {
  const orderItem = readOrderItem(payload);
  const [OrderItemID] = await orderItemRepository().insert(orderItem);
  return { OrderItemID, ...orderItem };
}

async function getManyOrderItems(query) {
  const { page = 1, limit = 5 } = query;
  const paginator = new Paginator(page, limit);
  let results = await orderItemRepository()
    .from("orderitems as o")
    .select(
      knex.raw("count(OrderItemID) OVER() AS recordCount"),
      "o.OrderID",
      "o.ProductID",
      "p.ProductName",
      "o.Quantity",
      "o.Price",
      "o.CreatedAt",
      "o.CreatedBy",
      "o.UpdatedAt",
      "o.UpdatedBy"
    )
    .leftJoin("products as p", "o.ProductID", "p.ProductID")
    .limit(paginator.limit)
    .offset(paginator.offset);

  let totalRecords = 0;
  results = results.map((result) => {
    totalRecords = result.recordCount;
    delete result.recordCount;
    return result;
  });

  return {
    orderItems: results,
    metadata: paginator.getMetadata(totalRecords),
  };
}

async function getOrderItemById(OrderItemID) {
  return orderItemRepository()
    .where("OrderItemID", OrderItemID)
    .select("*")
    .first();
}

async function updateOrderItem(OrderItemID, payload) {
  const updatedOrderItem = await orderItemRepository()
    .where("OrderItemID", OrderItemID)
    .select("*")
    .first();

  if (!updatedOrderItem) {
    return null;
  }

  const update = readOrderItem(payload);
  await orderItemRepository().where("OrderItemID", OrderItemID).update(update);

  return { ...updatedOrderItem, ...update };
}

async function deleteOrderItem(OrderItemID) {
  const deletedOrderItem = await orderItemRepository()
    .where("OrderItemID", OrderItemID)
    .first();

  if (!deletedOrderItem) {
    return null;
  }

  await orderItemRepository().where("OrderItemID", OrderItemID).del();

  return deletedOrderItem;
}

async function deleteOrderItemsByIds(orderItemIds) {
  await orderItemRepository().whereIn("OrderItemID", orderItemIds).del();
}

module.exports = {
  getManyOrderItems,
  deleteOrderItemsByIds,
  getOrderItemById,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
};
