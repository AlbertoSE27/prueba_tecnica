//LIFECYCLE CON EL SERVICIO

export default {
  beforeCreate: async (event) => {
    const { data } = event.params;
    try {
      const existingDishes = await strapi
        .documents("api::daily-menu.daily-menu")
        .findMany({
          filters: {
            menuDay: data.menuDay,
          },
          populate: {
            firstCourse: data.firstCourse.nameOfDish,
            secondCourse: data.secondCourse.nameOfDish,
            dessert: data.dessert.nameOfDish,
          },
        });
      if (
        data.firstCourse.nameOfDish === data.secondCourse.nameOfDish ||
        data.firstCourse.nameOfDish === data.dessert.nameOfDish ||
        data.secondCourse.nameOfDish === data.dessert.nameOfDish
      )
        return {
          message: "El plato ya existe en otra categoría.",
        };
      return { existingDishes };
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

// LIFECYCLES CON EL SERVICIO

/*export default {
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
      return { existingDishes };
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

// LICECYCLES SIN EL SERVICIO

export default {
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
