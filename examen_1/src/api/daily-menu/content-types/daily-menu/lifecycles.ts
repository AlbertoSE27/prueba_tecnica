//LIFECYCLE CON EL SERVICIO

/*export default {
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
};*/

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
};*/

// LICECYCLES SIN EL SERVICIO

import { errors } from "@strapi/utils";
const { ApplicationError } = errors;
export default {
  afterCreate: async (event) => {
    const { result } = event;
    try {
      const menuDishesPrice = await strapi
        .documents("api::daily-menu.daily-menu")
        .findMany({
          populate: {
            firstCourse: { fields: ["priceOfDish"] },
            secondCourse: { fields: ["priceOfDish"] },
            dessert: { fields: ["priceOfDish"] },
          },
        });
      const { firstCourse, secondCourse, dessert } = menuDishesPrice[0];
      const totalPriceMenu =
        (firstCourse?.priceOfDish ?? 0) +
        (secondCourse?.priceOfDish ?? 0) +
        (dessert.priceOfDish ?? 0);
      event.result.sumPrice = totalPriceMenu;
    } catch (error) {
      strapi.log.error("Error interno del servidor", error);
    }
    const { date } = event.params;
    try {
      const existingDishes = await strapi
        .documents("api::daily-menu.daily-menu")
        .findMany({
          filters: {
            menuDay: event.params.data.menuDay,
          },
          populate: {
            firstCourse: { fields: ["nameOfDish"] },
            secondCourse: { fields: ["nameOfDish"] },
            dessert: { fields: ["nameOfDish"] },
          },
        });
      if (
        existingDishes[0].firstCourse.nameOfDish ===
          existingDishes[0].secondCourse.nameOfDish ||
        existingDishes[0].firstCourse.nameOfDish ===
          existingDishes[0].dessert.nameOfDish ||
        existingDishes[0].secondCourse.nameOfDish ===
          existingDishes[0].dessert.nameOfDish
      ) {
        throw new ApplicationError("El plato ya existe en otra categoría");
      } else {
        console.log("FUNCIONA");
      }
    } catch (error) {
      strapi.log.error("Error interno del servidor", error);
    }
  },
};
