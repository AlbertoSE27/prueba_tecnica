export default {
  routes: [
    {
      method: "GET",
      path: "/daily-menu/dessert",
      handler: "custom.getDessert",
      config: { auth: false, policies: [] },
    },
    {
      method: "GET",
      path: "/daily-menu/pricerange",
      handler: "custom.filterMenuPrice",
      config: { auth: false, policies: [] },
    },
    {
      method: "GET",
      path: "/daily-menu/withoutallergens",
      handler: "custom.filterMenuWithoutAllergens",
      config: { auth: false, policies: [] },
    },
    {
      method: "GET",
      path: "/daily-menu/populardishes",
      handler: "custom.getPopularDishes",
      config: { auth: false, policies: [] },
    },
  ],
};
