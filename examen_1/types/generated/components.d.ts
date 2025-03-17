import type { Schema, Struct } from '@strapi/strapi';

export interface AllergensAllergens extends Struct.ComponentSchema {
  collectionName: 'components_allergens_allergens';
  info: {
    displayName: 'allergens';
  };
  attributes: {
    description: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    name: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'allergens.allergens': AllergensAllergens;
    }
  }
}
