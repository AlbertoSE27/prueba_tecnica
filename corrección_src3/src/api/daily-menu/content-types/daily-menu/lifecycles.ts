const { errors } = require("@strapi/utils");
const { ApplicationError } = errors; // Bien por importar el error de strapi para que salga en el programa.

const apiURL = "api::daily-menu.daily-menu"; // Bien para no introducir una cadena de texto en el codigo y repetirla en varios lugares.

module.exports = {
  // Seria mejor el empleo de "export default {}", ya que es un documento de type script.

  async afterCreate(event) {
    //Bien
    if (event.state?.isCalculatedUpdate) return; // ¿?

    const { result } = event; // Bien

    const menu = await strapi.entityService.findOne(apiURL, result.id, {
      // Mal ya que es Strapi 5 no se hace uso de strapi.entityService sino de strapi.documents
      populate: [
        "first_dish",
        "second_dish",
        "dessert_dish",
      ] /* Obtiene todos los datos del campo en cada uno de los platos, 
      lo cual es innecesario ya que solo se necesita el precio de los mismos y el id del plato, haría lo siguiente:
      const menu= = await strapi.documents(apiURL).findOne({
          documentId: result.documentId,
          fields: ["sumPrice, sumPriceIva"],
          populate: {
            first_dish: { fields: ["price"] },
            secondCo_dish: { fields: ["price"] },
            dessert_dish: { fields: ["price"] },
          },
        });*/,
    });
    const { sumPrice, sumPriceIva } = menu; // Innecesario, hubiese obtenido los precios en la consulta de la base de datos.

    const calculatedPrice = await strapi
      .service("api::daily-menu.calculate-price")
      .calculateSumPrecio(
        menu
      ); /* Bien la implementación del servicio para calcular el precio del menú, 
    sin embargo, no se esta utilizando la variable creada "apiURL" para la llamada del servicio, además no se está retornando el precio calculado, haría lo siguiente:
    const calculatedPrice = await strapi.service(apiURL).calculateSumpPrecio(menu);
    menu.sumPrice = calculatedPrice.total;
    menu.sumPriceIva = calculatedPrice.totalWithIva;
    */

    const calculatedIva = await strapi
      .service(apiURL)
      .pricePlusIva(calculatedPrice); // Este servicio lo quitaría y lo juntaría con el anterior.

    const currentPrice = sumPrice ?? 0;
    const currentIva =
      typeof sumPriceIva === "number"
        ? sumPriceIva
        : parseFloat(sumPriceIva) || 0;
    if (currentPrice !== calculatedPrice) {
      await strapi.entityService.update(apiURL, result.id, {
        data: { sumPrice: calculatedPrice },
      }); /* No haría falta el uso de actualizar los datos de la base de datos, ya que los actualizaría en el retorno del servicio anterior y evitaría que se pudiaram generar 
      bucles.*/
    }

    if (currentIva !== calculatedIva) {
      await strapi.entityService.update(apiURL, result.id, {
        data: { sumPriceIva: calculatedIva },
      }); /* No haría falta el uso de actualizar los datos de la base de datos, ya que los actualizaría en el retorno del servicio anterior y evitaría que se pudiaram generar 
      bucles.*/
    }
  },

  async afterUpdate(event) {
    /* Bien por el uso de afterUpdate además de afterCreate, 
    ya que se puede recalcular el precio no solo al crear el menú, sino también al actualizarlo.
    sin embargo, al repetirse la lógica de la función anterior, se podría crear una función que contenga la lógica y llamarla en ambos métodos 
    (como se ha hecho con el before.)
    */
    if (event.state?.isCalculatedUpdate) return;
    const { result } = event;
    const menu = await strapi.entityService.findOne(apiURL, result.id, {
      populate: ["first_dish", "second_dish", "dessert_dish"],
    });
    const { sumPrice, sumPriceIva } = menu;
    const calculatedPrice = await strapi
      .service("api::daily-menu.calculate-price")
      .calculateSumPrecio(menu);
    const calculatedIva = await strapi
      .service(apiURL)
      .pricePlusIva(calculatedPrice);
    const currentPrice = sumPrice ?? 0;
    const currentIva =
      typeof sumPriceIva === "number"
        ? sumPriceIva
        : parseFloat(sumPriceIva) || 0;
    if (currentPrice !== calculatedPrice) {
      await strapi.entityService.update(apiURL, result.id, {
        data: { sumPrice: calculatedPrice },
      });
    }
    if (currentIva !== calculatedIva) {
      await strapi.entityService.update(apiURL, result.id, {
        data: { sumPriceIva: calculatedIva },
      });
    }
  } /* Todo esto anterior lo quitaría como he mencionado (al ser la misma lógica que el afterCreate) y juntaría ambos tal que así:
  
  async afterCreate(event){
  return await calculateDishesPrice(event.result)}
  
  async afterUpdate(event){
  return await calculateDishesPrice(event.result)}

  async function calculateDishesPrice(result){
  
  const {result} = event;
  
  const menu= = await strapi.documents(apiURL).findOne({
  documentId: result.documentId,
  fields: ["sumPrice, sumPriceIva"],
  populate: {
  first_dish: { fields: ["price"] },
  secondCo_dish: { fields: ["price"] },
  dessert_dish: { fields: ["price"] },
  },
  });

  const calculatedPrice = await strapi.service(apiURL).calculateSumpPrecio(menu);
  
  menu.sumPrice = calculatedPrice.total;
  menu.sumPriceIva = calculatedPrice.totalWithIva;
  }
  */,

  async beforeCreate(event) {
    await validateNoDuplicateDishes(event.params.data); // Bien
  },

  async beforeUpdate(event) {
    await validateNoDuplicateDishes(event.params.data); // Bien
  },
};

async function validateNoDuplicateDishes(data) {
  const dishIds = [];
  const extractId = (relation) => {
    if (!relation) return null;

    if (relation.connect && relation.connect[0] && relation.connect[0].id) {
      return relation.connect[0].id;
    }
    if (relation.id) {
      return relation.id;
    }
    if (typeof relation === "number") {
      return relation;
    }
    if (typeof relation === "object" && relation !== null) {
      return relation.id;
    }
    return null;
  };
  const firstDishId = extractId(data.first_dish);
  const secondDishId = extractId(data.second_dish);
  const dessertDishId = extractId(data.dessert_dish);
  if (firstDishId) dishIds.push(firstDishId);
  if (secondDishId) dishIds.push(secondDishId);
  if (dessertDishId) dishIds.push(dessertDishId);
  const uniqueDishIds = [...new Set(dishIds)];
  if (uniqueDishIds.length !== dishIds.length) {
    throw new ApplicationError(
      "No se puede repetir el mismo plato en diferentes categorías",
      {
        field: "dishes",
        validation: "duplicate",
      }
    );
  }
  return { firstDishId, secondDishId, dessertDishId };
}
