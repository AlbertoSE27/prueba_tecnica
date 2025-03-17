/* module.exports = {
  async afterCreate(event) {
    const { result } = event;
    const dishes = strapi.documents("api::plate.plate").findMany({
      fields: ["nameOfDish", "priceOfDish"],
    });
    const sumPrice = (dishes) => {
      let total = 0;
      for (let i = 0; i < dishes.length; i++) {
        const price = parseFloat(dishes[i].priceOfDish) || 0;
        total += price;
      }
      return total;
    };
    await strapi.documents("api::daily-menu.daily-menu").update({
      data: { sumPrice: total},
    });
  },
}; 
*/
