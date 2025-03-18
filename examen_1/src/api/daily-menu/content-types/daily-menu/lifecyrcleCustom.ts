/*module.exports = {
  async afterCreate(event) {
    const { result } = event;
    const plate = await strapi.documents("api::plate.plate").findMany({
      fields: ["nameOfDish","priceOfDish"]
    });
    const totalPrice = plate.reduce((sum, plate) => sum + plate.priceOfDish,0);
    await strapi.documents("api::daily-menu.daily-menu").update({
        documentId: result.id,
        data: {sumPrice: totalPrice}
    });
  },
};
*/
