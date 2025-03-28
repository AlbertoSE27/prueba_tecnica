import { factories } from "@strapi/strapi";
import { error } from "console";
export default factories.createCoreService(
  "api::daily-menu.daily-menu",
  ({ strapi }) => ({
    async calculateMenuPrice(menu) {
      try {
        const menuDishesPrice = await strapi
          .documents("api::daily-menu.daily-menu")
          .findOne({
            documentId: menu.documentId,
            populate: {
              firstCourse: {
                fields: ["priceOfDish"],
              },
              secondCourse: {
                fields: ["priceOfDish"],
              },
              dessert: {
                fields: ["priceOfDish"],
              },
            },
            fields: ["fixedPriceMenu", "sumPrice"],
          });
        if (!menuDishesPrice) {
          throw new error("No se encontró el menú");
        }
        const taxRate = 0.21;
        const sumPriceDishes =
          menuDishesPrice.firstCourse.priceOfDish +
          menuDishesPrice.secondCourse.priceOfDish +
          menuDishesPrice.dessert.priceOfDish;
        const updateSumPrice = sumPriceDishes * (1 + taxRate);
        const updatefixedPriceMenu =
          menuDishesPrice.fixedPriceMenu * (1 + taxRate);
        return { menuDishesPrice, updateSumPrice, updatefixedPriceMenu };
      } catch (error) {
        strapi.log.error(
          "Error al calcular el precio del plato con impuestos",
          error
        );
        throw new error("Error interno del servidor");
      }
    },
  })
);
