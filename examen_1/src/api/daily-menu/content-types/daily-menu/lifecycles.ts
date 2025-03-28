import { errors } from "@strapi/utils";
const { ApplicationError } = errors;
export default {
  afterCreate: async (event) => {
    const { data } = event.params;
    try {
      const existingDishes = await strapi
        .documents("api::daily-menu.daily-menu")
        .findMany({
          filters: { menuDay: data.menuDay },
          populate: {
            firstCourse: { fields: ["nameOfDish"] },
            secondCourse: { fields: ["nameOfDish"] },
            dessert: { fields: ["nameOfDish"] },
          },
        });
      if (existingDishes.length > 0) {
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
  beforeCreate: async (event) => {
    const ctx = strapi.requestContext.get();
    const { params } = ctx;
    const { id } = params;
    const { data } = event.params;
    try {
      const menuDishesPrice = await strapi
        .documents("api::daily-menu.daily-menu")
        .findOne({
          documentId: id,
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
      data.sumPrice = totalPriceMenu;
      const service = await strapi
        .service("api::daily-menu.custom")
        .calculateMenuPrice(menuDishesPrice);
      data.fixedPriceMenu = service.updatefixedPriceMenu;
      data.sumPrice = service.updateSumPrice;
    } catch (error) {
      strapi.log.error("Error interno del servidor", error);
    }
  },
};
