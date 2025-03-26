import { factories } from "@strapi/strapi";
export default factories.createCoreController(
  "api::daily-menu.daily-menu",
  ({ strapi }) => ({
    async getDessert(ctx) {
      try {
        const menuDessert = await strapi
          .documents("api::daily-menu.daily-menu")
          .findMany({
            populate: {
              dessert: {
                fields: ["nameOfDish"],
              },
            },
          });
        if (!menuDessert) {
          return ctx.badRequest("El postre no existe en el menú");
        }
        return ctx.send(menuDessert);
      } catch (error) {
        return ctx.throw(500, "Error interno del servidor");
      }
    },
    async getMenuPrice(ctx) {
      try {
        const { minPrice, maxPrice } = ctx.request.query;
        if (!minPrice && !maxPrice) {
          return ctx.badRequest("El menú no tiene rango de precio");
        }
        const rangeMenuPrice = await strapi
          .documents("api::daily-menu.daily-menu")
          .findMany({
            filters: {
              fixedPriceMenu: {
                $gte: Number(minPrice),
                $lte: Number(maxPrice),
              },
            },
          });
        if (rangeMenuPrice.length === 0) {
          return ctx.badRequest(
            "No se encuentran menús con rango de precio establecido"
          );
        }
        return ctx.send(rangeMenuPrice);
      } catch (error) {
        return ctx.throw(500, "Error interno del servidor");
      }
    },
    async getMenuWithoutAllergens(ctx) {
      try {
        const { withoutAllergens } = ctx.request.query;
        if (!withoutAllergens) {
          return ctx.badRequest("El menú no tiene alérgenos");
        }
        const menuAllergens = await strapi
          .documents("api::daily-menu.daily-menu")
          .findMany({
            fields: ["menuDay"],
            populate: {
              firstCourse: {
                populate: {
                  allergen: {
                    filters: {
                      allergenName: { $notIn: [String(withoutAllergens)] },
                    },
                  },
                },
              },
              secondCourse: {
                populate: {
                  allergen: {
                    filters: {
                      allergenName: { $notIn: [String(withoutAllergens)] },
                    },
                  },
                },
              },
              dessert: {
                populate: {
                  allergen: {
                    filters: {
                      allergenName: { $notIn: [String(withoutAllergens)] },
                    },
                  },
                },
              },
            },
          });
        if (menuAllergens.length === 0) {
          return ctx.badRequest(
            "No existen menús sin los alérgenos especificados"
          );
        }
        return ctx.send(menuAllergens);
      } catch (error) {
        return ctx.throw(500, "Error interno del servidor");
      }
    },
    async getPopularDishes(ctx) {
      try {
        const menuDishes = await strapi
          .documents("api::daily-menu.daily-menu")
          .findMany({
            fields: ["menuDay"],
            populate: {
              firstCourse: {
                fields: ["nameOfDish"],
              },
              secondCourse: {
                fields: ["nameOfDish"],
              },
              dessert: {
                fields: ["nameOfDish"],
              },
            },
          });
        const dishCount = {};
        menuDishes.forEach((menu) => {
          [menu.firstCourse, menu.secondCourse, menu.dessert].forEach(
            (dish) => {
              if (dish && dish.nameOfDish) {
                if (dishCount[dish.nameOfDish]) {
                  dishCount[dish.nameOfDish]++;
                } else {
                  dishCount[dish.nameOfDish] = 1;
                }
              }
            }
          );
        });
        const popularDishes = Object.keys(dishCount)
          .sort((a, b) => dishCount[b] - dishCount[a])
          .slice(0, 2);
        if (popularDishes.length === 0) {
          return ctx.badRequest("No se han encontrado platos populares");
        }
        return popularDishes;
      } catch (error) {
        return ctx.throw(500, "Error interno del servidor");
      }
    },
  })
);
