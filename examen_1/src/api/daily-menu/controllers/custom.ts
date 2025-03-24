const { createCoreController } = require("@strapi/strapi").factories;
export default createCoreController(
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
        return ctx.throw(500, "Error interno del servidor");
      }
    },
    async getPoppularDishes(ctx) {
      try {
        const dailyMenus = await strapi
          .documents("api::daily-menu.daily-menu")
          .findMany({
            populate: {
              firstCourse: true,
              secondCourse: true,
              dessert: true,
            },
          });
        const dishCounts = {};
        dailyMenus.forEach(
          (menu: {
            firstCourse: { nameOfDish: string }[];
            secondCourse: { nameOfDish: string }[];
            dessert: { nameOfDish: string }[];
          }) => {
            menu.firstCourse.forEach((firstCourse: { nameOfDish: string }) => {
              if (dishCounts[firstCourse.nameOfDish]) {
                dishCounts[firstCourse.nameOfDish]++;
              } else {
                dishCounts[firstCourse.nameOfDish] = 1;
              }
            });
          }
        );
        dailyMenus.forEach(
          (menu: {
            firstCourse: { nameOfDish: string }[];
            secondCourse: { nameOfDish: string }[];
            dessert: { nameOfDish: string }[];
          }) => {
            menu.secondCourse.forEach(
              (secondCourse: { nameOfDish: string }) => {
                if (dishCounts[secondCourse.nameOfDish]) {
                  dishCounts[secondCourse.nameOfDish]++;
                } else {
                  dishCounts[secondCourse.nameOfDish] = 1;
                }
              }
            );
          }
        );
        dailyMenus.forEach(
          (menu: {
            firstCourse: { nameOfDish: string }[];
            secondCourse: { nameOfDish: string }[];
            dessert: { nameOfDish: string }[];
          }) => {
            menu.dessert.forEach((dessert: { nameOfDish: string }) => {
              if (dishCounts[dessert.nameOfDish]) {
                dishCounts[dessert.nameOfDish]++;
              } else {
                dishCounts[dessert.nameOfDish] = 1;
              }
            });
          }
        );
        const dishes = Object.entries(dishCounts)
          .map(([nameOfDish, count]) => ({ nameOfDish, count }))
          .sort((a, b) => Number(b.count) - Number(a.count))
          .map(({ nameOfDish }) => nameOfDish);
        const popularDishes = await strapi
          .documents("api::dish.dish")
          .findMany({
            filters: {
              nameOfDish: {
                $in: dishes,
              },
            },
            limit: 1,
          });
        if (!popularDishes || popularDishes.length === 0) {
          return ctx.badRequest("No se encontraron platos populares");
        }
        return ctx.send(popularDishes);
      } catch (error) {
        return ctx.throw(500, "Error interno del servidor");
      }
    },
  })
);
