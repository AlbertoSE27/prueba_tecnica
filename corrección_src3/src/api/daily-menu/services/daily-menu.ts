import { factories } from "@strapi/strapi";
export default factories.createCoreService(
  "api::daily-menu.daily-menu",
  ({ strapi }) => ({
    async pricePlusIva(resultado: number) {
      const iva = 0.21;
      const ivaAmount = resultado * iva; // Esta parte la habría quitado y juntado con la posterior.
      const totalWithIva = resultado + ivaAmount; //Esta parte la habría combinado con la anterior para simplificar el código
      return totalWithIva;
    },
  })
);
/*Todo este servicio lo considero innecesario, ya que se podría juntar con el otro servicio que suma los precios de los platos 
y retornar ambos valores en un solo servicio, con iva y sin iva*/
