//LIFECYRCLE CON EL SERVICIO

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    try {
      const existingDishes = await strapi.documents("api::dish.dish").findMany({
        filters: {
          $or: [
            {
              nameOfDish: data.nameOfDish,
              typeOfDish: { $ne: "First Course" },
            },
            {
              nameOfDish: data.nameOfDish,
              typeOfDish: { $ne: "Second Course" },
            },
            {
              nameOfDish: data.nameOfDish,
              typeOfDish: { $ne: "Dessert" },
            },
          ],
        },
      });
      if (existingDishes.length > 0) {
        return {
          message: `El plato ${existingDishes[0].nameOfDish} ya existe en otra categoría.`,
        };
      }
    } catch (error) {
      strapi.log.error("Error interno del servidor", error);
    }
  },
  async afterCreate(event) {
    const { result } = event;
    try {
      const priceInfo = await strapi
        .service("api::daily-menu.daily-menu")
        .calculateMenuPrice();
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
          $or: [
            {
              nameOfDish: data.firstCourse.nameOfDish,
              typeOfDish: { $ne: "First Course" },
            },
            {
              nameOfDish: data.secondCourse.nameOfDish,
              typeOfDish: { $ne: "Second Course" },
            },
            {
              nameOfDish: data.dessert.nameOfDish,
              typeOfDish: { $ne: "Dessert" },
            },
          ],
        },
      });
      if (existingDishes.length > 0) {
        return {
          message: `El plato ${existingDishes[0].nameOfDish} ya existe en otra categoría.`,
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
        filters: {
          nameOfDish: result.nameOfDish,
          priceOfDish: result.priceOfDish,
        },
      });
      const totalPrice = dishesDate.reduce((sum, dish) => {
        {
          return sum + dish.priceOfDish;
        }
      }, 0);
      await strapi.documents("api::daily-menu.daily-menu").update({
        documentId: result.id,
        data: { sumPrice: totalPrice.toString() },
      });
    } catch (error) {
      strapi.log.error("Error interno del servidor", error);
    }
  },
};*/
