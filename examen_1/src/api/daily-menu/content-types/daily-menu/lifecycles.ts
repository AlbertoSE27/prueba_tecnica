import { errors } from "@strapi/utils";
const { ApplicationError } = errors;
export default {
  afterCreate: async (event) => {
    const { result } = event;
    try {
      const existingDishes = await strapi
        .documents("api::daily-menu.daily-menu")
        .findOne({
          documentId: result.documentId,
          populate: {
            firstCourse: { fields: ["nameOfDish"] },
            secondCourse: { fields: ["nameOfDish"] },
            dessert: { fields: ["nameOfDish"] },
          },
        });
      if (!existingDishes) {
        throw new Error("Menú o nombre platos no encontrados.");
      }
      const { firstCourse, secondCourse, dessert } = existingDishes;
      if (
        (firstCourse?.nameOfDish ?? 0) === (secondCourse?.nameOfDish ?? 0) ||
        (firstCourse?.nameOfDish ?? 0) === (dessert?.nameOfDish ?? 0) ||
        (secondCourse?.nameOfDish ?? 0) === (dessert?.nameOfDish ?? 0) ||
        !firstCourse.nameOfDish ||
        !secondCourse.nameOfDish ||
        !dessert.nameOfDish
      ) {
        throw new Error("El plato no existe o no tiene nombre");
      }
    } catch (error) {
      throw new ApplicationError(
        "El plato ya existe en otra categoría o no hay un plato asignado"
      );
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
      if (
        menuDishesPrice?.firstCourse &&
        menuDishesPrice?.secondCourse &&
        menuDishesPrice?.dessert
      ) {
        const { firstCourse, secondCourse, dessert } = menuDishesPrice;
        const totalPriceMenu =
          (firstCourse?.priceOfDish ?? 0) +
          (secondCourse?.priceOfDish ?? 0) +
          (dessert?.priceOfDish ?? 0);
        data.sumPrice = totalPriceMenu;
        const service = await strapi
          .service("api::daily-menu.custom")
          .calculateMenuPrice(menuDishesPrice);
        data.fixedPriceMenu = service.updatefixedPriceMenu;
        data.sumPrice = service.updateSumPrice;
      }
    } catch (error) {
      strapi.log.error("Error interno del servidor", error);
    }
  },
};
