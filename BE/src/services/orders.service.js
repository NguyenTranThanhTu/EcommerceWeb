const knex = require("../database/knex");
const Paginator = require("./paginator");

function orderRepository() {
  return knex("orders");
}

function readOrder(payload) {
  return {
    UserID: payload.UserID,
    Status: payload.Status,
    TotalAmount: payload.TotalAmount,
    PhoneNumber: payload.PhoneNumber,
    Address: payload.Address,
    RecipientName: payload.RecipientName,
    CreatedBy: payload.CreatedBy,
    UpdatedAt: new Date(),
    UpdatedBy: payload.UpdatedBy,
    IsDeleted: payload.IsDeleted,
  };
}

async function createOrder(payload) {
  const order = readOrder(payload);
  const [OrderID] = await orderRepository().insert(order);
  return { OrderID, ...order };
}

async function getManyOrders(query) {
  const { page = 1, limit = 5 } = query;
  const paginator = new Paginator(page, limit);
  let results = await orderRepository()
    .where("IsDeleted", false)
    .select(
      knex.raw("count(OrderID) OVER() AS recordCount"),
      "UserID",
      "Status",
      "TotalAmount",
      "PhoneNumber",
      "Address",
      "RecipientName",
      "CreatedAt",
      "CreatedBy",
      "UpdatedAt",
      "UpdatedBy"
    )
    .limit(paginator.limit)
    .offset(paginator.offset);

  let totalRecords = 0;
  results = results.map((result) => {
    totalRecords = result.recordCount;
    delete result.recordCount;
    return result;
  });

  return {
    orders: results,
    metadata: paginator.getMetadata(totalRecords),
  };
}

async function getOrderById(OrderID) {
  return orderRepository()
    .where("OrderID", OrderID)
    .andWhere("IsDeleted", false)
    .select("*")
    .first();
}

async function updateOrder(OrderID, payload) {
  const updatedOrder = await orderRepository()
    .where("OrderID", OrderID)
    .andWhere("IsDeleted", false)
    .select("*")
    .first();

  if (!updatedOrder) {
    return null;
  }

  const update = readOrder(payload);
  await orderRepository().where("OrderID", OrderID).update(update);

  return { ...updatedOrder, ...update };
}

async function deleteOrder(OrderID, UserID) {
  const deletedOrder = await orderRepository()
    .where("OrderID", OrderID)
    .first();

  if (!deletedOrder) {
    return null;
  }

  await orderRepository()
    .where("OrderID", OrderID)
    .update({ IsDeleted: true, UpdatedAt: UserID });

  return deletedOrder;
}

async function deleteOrdersByIds(orderIds, UserID) {
  await orderRepository()
    .whereIn("OrderID", orderIds)
    .update({ IsDeleted: true, UpdatedAt: UserID });
}

module.exports = {
  getManyOrders,
  deleteOrdersByIds,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
