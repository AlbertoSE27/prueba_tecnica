import dailyMenu from "../src/api/daily-menu/controllers/daily-menu";
const { createCoreService } = require("@strapi/strapi").factories;
module.exports = createCoreService(
  "api::daily-menu.daily-menu",
  ({ strapi }) => ({
    async calculateMenuPrice(menuDayId) {
      try {
        const dishDate = await strapi.documents("api::dish.dish").findMany({
          fields: ["nameOfDish", "priceOfDish"],
        });
        const menuDate = await strapi
          .documents("api::daily-menu.daily.menu")
          .findMany({
            fields: ["menuName", "fixedPriceMenu"],
          });
        const updateMenusPrice = fixedPriceMenu * 0.21;
        await strapi.documents("api::daily-menu.daily-menu").update({
          documentId: menuDayId,
          data: { fixedPriceMenu: updateMenusPrice },
        });
      } catch (error) {
        strapi.log.error("Error al calcular el precio del menu", error);
        throw new error("Error al calcular el precio del menu");
      }
    },
  })
);
