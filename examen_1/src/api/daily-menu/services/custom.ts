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
          });
        const menuDate = await strapi
          .documents("api::daily-menu.daily-menu")
          .findMany({
            fields: ["fixedPriceMenu", "sumPrice"],
          });
        const taxRate = 0.21;
        const updateSumPrice = menuDate[0].sumPrice * (1 + taxRate);
        const updatefixedPriceMenu = menuDate[0].fixedPriceMenu * (1 + taxRate);
        await strapi.documents("api::daily-menu.daily-menu").update({
          documentId: menuDate[0].documentId,
          data: {
            fixedPriceMenu: updatefixedPriceMenu,
            sumPrice: updateSumPrice,
          },
        });
        return { menuDishesPrice, updateSumPrice, updatefixedPriceMenu };
      } catch (error) {
        strapi.log.error(
          "Error al calcular el precio del plato con impuestos",
          error
        );
        throw new Error("Error interno del servidor");
      }
    },
  })
);
