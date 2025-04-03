import { factories } from "@strapi/strapi";
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
          throw new Error("No se encontró el menú ni su precio");
        }
        const sumPriceDishes =
          (menuDishesPrice.firstCourse?.priceOfDish ?? 0) +
          (menuDishesPrice.secondCourse?.priceOfDish ?? 0) +
          (menuDishesPrice.dessert?.priceOfDish ?? 0);
        const taxRate = 0.21;
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
