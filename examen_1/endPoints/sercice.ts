import dailyMenu from "../src/api/daily-menu/controllers/daily-menu";
const { createCoreService } = require("@strapi/strapi").factories;
module.exports = createCoreService("api::dish.dish", ({ strapi }) => ({
  async getPriceOfDish(priceOfDish) {
    try {
      const dishDate = await strapi.documents("api::dish.dish").findMany({
        fields: ["nameOfDish", "priceOfDish"],
      });
      if (!dishDate) {
        return { message: "No existe el plato o no tiene precio" };
      }
      const menuDate = await strapi
        .documents("api::daily-menu.daily.menu")
        .findMany({
          fields: ["menuDay", "fixedPriceMenu"],
        });
      if (!menuDate) {
        return { message: "No se encontró el menú o no tiene precio" };
      }
      const taxRate = 0.21;
      const updateMenuPrice = menuDate[0].fixedPriceMenu * (1 + taxRate);
      await strapi.documents("api::daily-menu.daily-menu").update({
        documentId: menuDate.menuDay,
        data: { fixedPriceMenu: updateMenuPrice },
      });
      return { dishDate, updateMenuPrice };
    } catch (error) {
      strapi.log.error(
        "Error al calcular el precio del plato con impuestos",
        error
      );
      throw new Error("Error interno del servidor");
    }
  },
}));
