//LIFECYRCLE CON EL SERVICIO

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    try {
      const existingDishes = await strapi.documents("api::dish.dish").findMany({
        filters: {
          nameOfDish: data.nameOfDish,
          typeOfDish: { $ne: data.typeOfDish },
        },
      });
      if (existingDishes) {
        return {
          message: `El plato ${data.nameOfDish} ya existe como ${existingDishes[0].typeOfDish}`,
        };
      }
    } catch (error) {
      strapi.log.error("Error interno del servidor", error);
    }
  },
  async afterCreate(event) {
    const { result } = event;
    try {
      const priceInfo = await strapi.service("api::dish.dish").getPriceOfDish();
      return priceInfo;
    } catch (error) {
      strapi.log.error("Error interno del servidor", error);
    }
  },
};

//LICECYRCLE SIN EL SERVICIO
/*module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    try {
      const existingDishes = await strapi.documents("api::dish.dish").findMany({
        filters: {
          nameOfDish: data.nameOfDish,
          typeOfDish: { $ne: data.typeOfDish },
        },
      });
      if (existingDishes) {
        return {
          message: `El plato ${data.nameOfDish} ya existe como ${existingDishes[0].typeOfDish}`,
        };
      }
    } catch (error) {
      strapi.log.error("Error interno del servidor", error);
    }
  },
  async afterCreate(event) {
    const { result } = event;
    try {
      const dishesDate = await strapi.documents("api::dish.dish").findMany({
        fields: ["nameOfDish", "priceOfDish"],
      });
      const totalPrice = dishesDate.reduce(
        (sum, dish) => sum + dish.priceOfDish,
        0
      );
      await strapi.documents("api::daily-menu.daily-menu").update({
        documentId: result.documentIdid,
        data: { sumPrice: "totalPrice" },
      });
    } catch (error) {
      strapi.log.error("Error interno del servidor", error);
    }
  },
};*/
