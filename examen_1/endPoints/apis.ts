const { createCoreController } = require("@strapi/strapi").factories;
module.exports = createCoreController(
  "api:daily-menu.daily-menu",
  ({ strapi }) => ({
    async dessertName(ctx) {
      const { dessert } = ctx.request.query;
      const dessertDate = await strapi.documents("api::dish.dish").findMany({
        filters: { typeOfDish: "Dessert" },
      });
    },
  })
);
module.exports = createCoreController(
  "api:daily-menu.daily-menu",
  ({ strapi }) => ({
    async menuPrice(ctx) {
      const { fixedPriceMenu } = ctx.request.query;
      const menuDate = await strapi
        .documents("api::daily-menu-daily-menu")
        .findMany({
          filters: { fixedPriceMenu: { $ite: 10, $gte: 20 } },
        });
    },
  })
);
