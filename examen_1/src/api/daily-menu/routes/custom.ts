module.exports = {
  routes: [
    {
      method: "GET",
      path: "/menu/dessert",
      handler: "find-dessert.getDessert",
      config: { auth: false, policies: [] },
    },
  ],
};

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/menu?min_price=10&max_price=20",
      handler: "filter-menu-price.getMenuPrice",
      config: { auth: false, policies: [] },
    },
  ],
};

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/menu?without_allergens=gluten,lactosa",
      handler: "filter-menu-allergens.getMenuWithoutAllergens",
      config: { auth: false, policies: [] },
    },
  ],
};

/*module.exports={
    routes:[{
        method: "GET",
        path: "/dishes/poppulate",
        handler: "find-dishes.getPoppularDishes",
        config: {auth:false, policies:[]}
    }]
};*/
