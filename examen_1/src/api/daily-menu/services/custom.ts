const { createCoreService } = require("@strapi/strapi").factories;
module.exports = createCoreService(
  "api::daily-menu.daily-menu",
  ({ strapi }) => ({
    async calculateMenuPrice() {
      try {
        const dishDate = await strapi.documents("api::dish.dish").findMany({
          fields: ["nameOfDish", "priceOfDish"],
        });
        if (!dishDate || dishDate.length === 0) {
          return { message: "No existe el plato o no tiene precio" };
        }
        const menuDate = await strapi
          .documents("api::daily-menu.daily.menu")
          .findMany({
            fields: ["menuDay", "fixedPriceMenu", "sumPrice"],
          });
        if (!menuDate || menuDate.length === 0) {
          return { message: "No se encontró el menú o no tiene precio" };
        }
        const taxRate = 0.21;
        const updateSumPrice = menuDate[0].sumPrice * (1 + taxRate);
        const updatefixedPriceMenu = menuDate[0].fixedPriceMenu * (1 + taxRate);
        await strapi.documents("api::daily-menu.daily-menu").update({
          documentId: menuDate[0].id,
          data: {
            fixedPriceMenu: updatefixedPriceMenu,
            sumPrice: updateSumPrice.toString,
          },
        });
        return { dishDate, updateSumPrice, updatefixedPriceMenu };
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
