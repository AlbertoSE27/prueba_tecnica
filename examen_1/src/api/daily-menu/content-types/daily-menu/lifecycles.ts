import { data } from "@remix-run/router";
import { errors } from "@strapi/utils";
const { ApplicationError } = errors;
export default {
  beforeCreate: async (event) => {
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
        existingDishes &&
        existingDishes.length > 0 &&
        existingDishes[0].firstCourse &&
        existingDishes[0].secondCourse &&
        existingDishes[0].dessert
      ) {
        const { firstCourse, secondCourse, dessert } = existingDishes[0];
        if (
          firstCourse.nameOfDish === secondCourse.nameOfDish ||
          firstCourse.nameOfDish === dessert.nameOfDish ||
          secondCourse.nameOfDish === dessert.nameOfDish
        ) {
          throw new ApplicationError("El plato ya existe en otra categoría");
        }
      }
    } catch (error) {
      throw error;
    }
  },
  afterCreate: async (event) => {
    const { result } = event;
    try {
      const menuDishesPrice = await strapi
        .documents("api::daily-menu.daily-menu")
        .findOne({
          documentId: result.documentId,
          populate: {
            firstCourse: { fields: ["priceOfDish"] },
            secondCourse: { fields: ["priceOfDish"] },
            dessert: { fields: ["priceOfDish"] },
          },
        });
      const { firstCourse, secondCourse, dessert } = menuDishesPrice;
      const totalPriceMenu =
        (firstCourse?.priceOfDish ?? 0) +
        (secondCourse?.priceOfDish ?? 0) +
        (dessert.priceOfDish ?? 0);
      await strapi.documents("api::daily-menu.daily-menu").update({
        documentId: event.result.documentId,
        data: { sumPrice: totalPriceMenu },
      });
      const service = await strapi
        .service("api::daily-menu.custom")
        .calculateMenuPrice(menuDishesPrice);
      return service;
    } catch (error) {
      strapi.log.error("Error interno del servidor", error);
    }
  },
};
