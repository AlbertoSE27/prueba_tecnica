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
          return ctx.badRequest("El menú no tiene postre");
        }
        return ctx.send(menuDessert);
      } catch (error) {
        return ctx.throw(500, "Error interno del servidor");
      }
    },
    async filterMenuPrice(ctx) {
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
    async filterMenuWithoutAllergens(ctx) {
      try {
        const { withoutAllergens } = ctx.request.query;
        if (!withoutAllergens) {
          return ctx.badRequest("No existen alérgenos");
        }
        const menuAllergens = await strapi
          .documents("api::daily-menu.daily-menu")
          .findMany({
            fields: ["menuDay"],
            populate: {
              firstCourse: { populate: { allergen: true } },
              secondCourse: { populate: { allergen: true } },
              dessert: { populate: { allergen: true } },
            },
          });
        if (menuAllergens.length === 0) {
          return ctx.badRequest("No existen menús con alérgenos");
        }
        const filteredMenus = menuAllergens.filter((menu) => {
          const hasAllergen = (dish: {
            allergen?: { allergenName?: string }[];
          }) =>
            dish?.allergen?.some((allergen: { allergenName?: string }) =>
              (String(ctx.request.query.withoutAllergens) || "")
                .split(",")
                .map((a: string) => a.trim().toLowerCase())
                .includes(allergen.allergenName?.toLowerCase())
            );
          return (
            !hasAllergen(menu.firstCourse) &&
            !hasAllergen(menu.secondCourse) &&
            !hasAllergen(menu.dessert)
          );
        });
        if (filteredMenus.length === 0) {
          return ctx.badRequest(
            "No existen menús sin los alérgenos especificados"
          );
        }
        return ctx.send(filteredMenus);
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
          .slice(0, 3);
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
