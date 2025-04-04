export default {
  routes: [
    {
      method: "GET",
      path: "/daily-menus/dessert",
      handler: "custom.getDessert",
      config: { auth: false, policies: [] },
    },
    {
      method: "GET",
      path: "/daily-menus/pricerange",
      handler: "custom.filterMenuPrice",
      config: { auth: false, policies: [] },
    },
    {
      method: "GET",
      path: "/daily-menus/withoutallergens",
      handler: "custom.filterMenuWithoutAllergens",
      config: { auth: false, policies: [] },
    },
    {
      method: "GET",
      path: "/daily-menus/populardishes",
      handler: "custom.getPopularDishes",
      config: { auth: false, policies: [] },
    },
  ],
};
