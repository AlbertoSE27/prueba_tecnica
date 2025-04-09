import { factories } from "@strapi/strapi";

const UIDMODEL = "api::daily-menu.daily-menu"; // Bien realizado para no añadir las cadenas de texto en el código.

export default factories.createCoreController(UIDMODEL, ({ strapi }) => ({
  async moreSales(ctx) {
    try {
      // Bien para el manejo de errores.
      const collections = await strapi.documents(UIDMODEL).findMany({
        // Bien para la busqueda en la base de datos especificando solo los campos necesarios, el nombre de los platos.
        populate: {
          first_dish: {
            fields: ["name"],
          },
          second_dish: {
            fields: ["name"],
          },
          dessert_dish: {
            fields: ["name"],
          },
        },
      });

      const dishCountMap =
        new Map(); /*Bien para almacenar la cantidad de veces que se repite un plato, el uso de map permite un mejor manejo de las claves y valores.*/

      for (let i = 0; i < collections.length; i++) {
        const menu = collections[i];
        if (menu.first_dish && menu.first_dish.name) {
          const dishName = menu.first_dish.name;
          dishCountMap.set(dishName, (dishCountMap.get(dishName) || 0) + 1);
        }

        if (menu.second_dish && menu.second_dish.name) {
          const dishName = menu.second_dish.name;
          dishCountMap.set(dishName, (dishCountMap.get(dishName) || 0) + 1);
        }

        if (menu.dessert_dish && menu.dessert_dish.name) {
          const dishName = menu.dessert_dish.name;
          dishCountMap.set(dishName, (dishCountMap.get(dishName) || 0) + 1);
        }
      }
      /*Para recorrer los menus y los platos dentro de los menus , ubise usado el forEach, ya que reduce la complejidad y extensión del codigo 
      además de su legililidad, en dicha iteración hubisese comprobado la existencia de los platos y su nombre para el conteo
      
        collections.forEach((menu) => {
          [menu.first_dish, menu.second_dish, menu.dessert_dish].forEach(
            (dish) => {
              if (dish && dish.name) {
                const dishName = dish.name;
                dishCountMap.set(
                  dishName,
                  (dishCountMap.get(dishName) || 0) + 1
                );
              }
            }
          );
        });*/
      const sortedDishes = Array.from(dishCountMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));
      // Bien la conversión de los platos a un array de objetos con el nombre y la cantidad de veces que se repite y su odedenación.
      return { popularDishes: sortedDishes }; // No veo necesario el uso de popularDishes, ya que el uso de sortedDishes es suficiente.
    } catch (error) {
      ctx.throw("Not found Dishes :", error); // Bien para el manejo de errores.
    }
  },

  async getMenusWithoutAllergens(ctx) {
    const api = "api::daily-menu.daily-menu"; // Innecesario, ya que se ha definido previamente en UIMODEL.
    try {
      // Bien para el manejo de errores.
      const { allergens } = ctx.request.query; // Bien para luego filtrar los alergenos en la consulta de la URL, requiriendo el uso del parmetro allergens.
      console.log(allergens); // Bien para comprobar pero no para luego mantenerlo en procicción.
      if (!allergens) {
        return ctx.badRequest("Se requieren alérgenos");
      } // Bien para comprobar si no se han pasado alérgenos y devolver un error en caso de que no se hayan pasado.
      const allergensArray = Array.isArray(allergens) ? allergens : [allergens];

      const menus = await strapi.documents(api).findMany({
        populate: {
          first_dish: {
            fields: ["name", "price"],
            populate: {
              allergens: {
                fields: ["name"],
              },
            },
          },
          second_dish: {
            fields: ["name", "price"],
            populate: {
              allergens: {
                fields: ["name"],
              },
            },
          },
          dessert_dish: {
            fields: ["name", "price"],
            populate: {
              allergens: {
                fields: ["name"],
              },
            },
          },
        },
      });
      /* Busqueda en la base de datos con datos innecesarios como el campo precio, además del uso de api no es necesario, ya que se ha definido previamente 
      en UIMODEL*/

      const hasProhibitedAllergens = (dish) => {
        if (!dish || !dish.allergens || dish.allergens.length === 0)
          return false;

        return dish.allergens.some((allergen) =>
          allergensArray.includes(allergen.name)
        );
      };
      // Bien para comprobar si un plato tiene alérgenos excluidos.
      const filteredMenus = menus.filter((menu) => {
        const firstDishHasAllergen = hasProhibitedAllergens(menu.first_dish);
        const secondDishHasAllergen = hasProhibitedAllergens(menu.second_dish);
        const dessertDishHasAllergen = hasProhibitedAllergens(
          menu.dessert_dish
        );
        return (
          !firstDishHasAllergen &&
          !secondDishHasAllergen &&
          !dessertDishHasAllergen
        );
      });
      /* No es necesaria la creación de las variables intermedias de los platos con alergenos, para filtar los menús con los alérgenos, 
      ya que se puede realizar la comprobación directamente con la función hasProhibitedAllergens
      
      const filteredMenus = menus.filter((menu) => {
        return !hasProhibitedAllergens(menu.first_dish) &&
               !hasProhibitedAllergens(menu.second_dish) &&
               !hasProhibitedAllergens(menu.dessert_dish);
      });*/

      return { data: filteredMenus }; // No es necesario el uso de data, ya que el uso de filteresMenus es suficiente.
    } catch (error) {
      return ctx.badRequest("Error al procesar la solicitud: " + error.message); //Bien para el manejo de errores.
    }
  },
}));
