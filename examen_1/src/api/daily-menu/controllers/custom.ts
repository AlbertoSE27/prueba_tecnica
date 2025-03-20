const { createCoreController } = require("@strapi/strapi").factories;
module.exports = createCoreController(
  "api::daily-menu.daily-menu",
  ({ strapi }) => ({
    async getDessert(ctx) {
      try {
        const { dessert } = ctx.request.query;
        if (!dessert) {
          return ctx.badRequest("El postre no existe en el menú");
        }
        const dessertName = await strapi.documents("api::dish.dish").findMany({
          filters: { typeOfDish: "dessert" },
        });
        if (!dessertName) {
          return ctx.badRequest("El postre no existe en el menú");
        }
        return ctx.send(dessertName);
      } catch (error) {
        return ctx.throw(500, "Error interno del servidor");
      }
    },
    async getMenuPrice(ctx) {
      try {
        const { fixedPriceMenu } = ctx.request.query;
        if (!fixedPriceMenu) {
          return ctx.badRequest("El menú no tiene precio");
        }
        const rangeMenuPrice = await strapi
          .documents("api::daily-menu.daily-menu")
          .findMany({
            filters: { fixedPriceMenu: { $gte: 10, $lte: 20 } },
          });
        if (rangeMenuPrice.length === 0) {
          return ctx.badRequest(
            "No se encuentran menús con rando de precio entre 10 y 20"
          );
        }
        return ctx.send(rangeMenuPrice);
      } catch (error) {
        return ctx.throw(500, "Error interno del servidor");
      }
    },
    async getMenuWithoutAllergens(ctx) {
      try {
        const { menuDay } = ctx.request.query;

        if (!menuDay) {
          return ctx.badRequest("No se ha especificado el día del menú");
        }
        const menuWithoutAllergens = await strapi
          .documents("api::daily-menu.daily-menu")
          .findMany({
            filters: {
              menuDay: menuDay,
            },
            populate: {
              firstCourse: {
                populate: {
                  allergen: true,
                },
              },
              secondCourse: {
                populate: {
                  allergen: true,
                },
              },
              dessert: {
                populate: {
                  allergen: true,
                },
              },
            },
          });
        const filterMenus = menuWithoutAllergens.filter((menuName) => {
          const allMenuDishes = [
            menuName.firstCourse,
            menuName.secondCourse,
            menuName.dessert,
          ];
          const dishesExcludedAllergens = allMenuDishes.some((nameOfDish) => {
            if (nameOfDish.allergen) {
              return nameOfDish.allergen.some((allergen) =>
                ["gluten", "lactosa"].includes(allergen.allergenName)
              );
            }
            return false;
          });
          return !dishesExcludedAllergens;
        });
        if (filterMenus.length === 0) {
          return ctx.badRequest("No existen menús sin gluten o sin lactosa");
        }
        return ctx.send(filterMenus);
      } catch (error) {
        strapi.log.error("Error al obtener los menús", error);
        return ctx.throw(500, "Error interno del servidor");
      }
    },
    /*async getPoppularDishes(ctx) {
      try {
        const { nameOfDish, dishId } = ctx.request.query;
        if (!nameOfDish || !dishId) {
          return ctx.badRequest("No existe el nombre ni el id del plato");
        }
        const poppularDishes = await strapi
          .documents("api::dish.dish")
          .findMany({
            filters: { nameOfDish: "*" },
          });
        if (!poppularDishes) {
          return ctx.badRequest("No existen platos mas vendidos o populares");
        }
        return ctx.send(poppularDishes);
      } catch (error) {
        return ctx.throw(500, "Error interno del servidor");
      }
    },*/
  })
);
