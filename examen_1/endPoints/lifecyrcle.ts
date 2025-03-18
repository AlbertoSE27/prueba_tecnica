module.exports = {
  async afterCreate(event) {
    const { result } = event;
    const dishesDate = await strapi.documents("api::dish.dish").findMany({
      fields: ["nameOfDish", "priceOfDish"],
    });
    const totalPrice = dishesDate.reduce(
      (sum, dish) => sum + dish.priceOfDish,
      0
    );
    await strapi.documents("api::daily-menu.daily-menu").update({
      documentId: result.id,
      data: { sumPrice: "totalPrice" },
    });
  },
};
