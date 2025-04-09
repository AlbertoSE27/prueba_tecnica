export default {
    routes: [
    {
    method: 'GET',
    path: '/platos/populares',
    handler: 'daily-menu.moreSales',
    config: {
    policies: [],
    middlewares: [],
    },
    },


 
      {
        method: 'GET',
        path: '/menus/Alergenos',
        handler: 'daily-menu.getMenusWithoutAllergens',
        config: {
            policies: [],
            middlewares: [],
            },
      },
    ]
}