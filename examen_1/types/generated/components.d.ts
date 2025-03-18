import type { Schema, Struct } from '@strapi/strapi';

export interface AllergensAllergens extends Struct.ComponentSchema {
  collectionName: 'components_allergens_allergens';
  info: {
    description: '';
    displayName: 'allergen';
    icon: 'alien';
  };
  attributes: {
    allergenDescription: Schema.Attribute.String;
    allergenIcon: Schema.Attribute.Media<'images'>;
    allergenName: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'allergens.allergens': AllergensAllergens;
    }
  }
}
