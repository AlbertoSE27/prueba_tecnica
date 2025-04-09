import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::daily-menu.daily-menu",
  ({ strapi }) => ({
    async calculateSumPrecio(data) {
      let valor1 = 0,
        valor2 = 0,
        valor3 = 0; // Parte ineccesaria.

      const extractId = (relation) => {
        return (
          relation?.connect?.[0]?.id ||
          relation?.id ||
          (typeof relation === "number" ? relation : null)
        );
      };
      const firstDishId = extractId(data.first_dish);
      const secondDishId = extractId(data.second_dish);
      const dessertDishId = extractId(data.dessert_dish);
      /* Esta función y constantes realizadas para extraer el id de los platos es innecesaria, habría hecho una consulta diractamente a la base de datos para 
        obtener dicha información*/

      const getDishPrice = async (dishId) => {
        if (!dishId)
          return 0; /* Esta función para extraer el precio de los platos asociados al id, al igual que la anterior es inecesaria, 
          haría una consulta directamente a la base de datos.*/

        try {
          // Bien hecho para el manejo de errores.

          const dish = await strapi.db.query("api::dishe.dishe").findOne({
            where: { id: dishId },
            select: ["price"],
          });
          return dish.price || 0;
        } catch (error) {
          /*La consulta en la base de datos la haría sobre la colección "api::daily-menu.daily-menu", ya que es la que contiene los platos asociados al menú cuyo
          precio se quiere calcular, además haría uso de strapi.documents según la documentación de strapi 5*/

          console.error(`Error al obtener plato con id ${dishId}:`, error);
          return 0;
        } /*Bien para el manejo de errores, sin embargo, lo haría al final del servicio y sin el console.log*/
      };

      valor1 = await getDishPrice(firstDishId);
      valor2 = await getDishPrice(secondDishId);
      valor3 = await getDishPrice(dessertDishId);
      const total = valor1 + valor2 + valor3;
      /* Estas variables "valor" y "total" las juntaría para calcular la suma de los precios de los platos del menú en una sola variable 
        y las pondría dentro del bloque "try"*/
      return total;
    },
  })
);

/*REFACTORIZADO/CORREGIDO Y AÑADIENDO EL OTRO SERVICIO:
   
  import { factories } from '@strapi/strapi';
  
  export default factories.createCoreService('api::daily-menu.daily-menu', ({ strapi }) => ({
  
  async calculateSumPrecio(data) {
  
  try {
    const dish = await strapi.documents("api::daily-menu.daily-menu").findOne({
    documentId: data.documentId,
    populate: {
      first_dish: {
        fields: ["price"],
      },
      second_dish: {
        fields: ["price"],
      },
      dessert_dish: {
        fields: ["price"],
      },
    },
    });
    
    const total = dish.first_dish.price + dish.second_dish.price + dish.dessert_dish.price;
    
    const iva = 0.21;
    const totalWithIva = total * (1 + iva);
    
    return {total, totalWithIva};
    
    } catch (error) {
     strapi.log.error("Error", error);
     throw new error("Error")}
}
}));
*/
