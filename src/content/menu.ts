// The menu, from the owner's PDFs (September 2024 food and drinks menus on marrakech-riads.com).
// Where the French and English PDFs describe a dish differently, each language keeps its own
// wording. Obvious typos are fixed ("Patilla", "septes", "accompagner"). Prices in MAD.
import type { Localized } from '@/lib/i18n';

export type Dish = {
  name: Localized;
  desc?: Localized;
  price: number;
  /** e.g. a vegetarian option at another price. */
  note?: Localized;
};

export type SetMenu = {
  name: Localized;
  price: number;
  courses: {
    course: 'starter' | 'main' | 'dessert';
    intro?: Localized;
    options: Localized[];
    after?: Localized;
  }[];
};

export type Drink = { name: Localized; desc: Localized; price?: number };

const same = (text: string): Localized => ({ fr: text, en: text });

export const SIGNATURES: (Dish & { forTwo?: boolean })[] = [
  {
    name: {
      fr: 'Le fameux méchoui de Dar Zellij',
      en: 'The famous Dar Zellij mechoui',
    },
    desc: {
      fr: 'Épaule d’agneau cuite en douceur, légumes de saison au four infusés au thym et aux herbes de nos jardins',
      en: 'Gently braised lamb shoulder, baked seasonal vegetables infused with thyme and herbs from our gardens',
    },
    price: 850,
    forTwo: true,
  },
  {
    name: same('Trid'),
    desc: {
      fr: 'Fines crêpes marocaines maison, poulet façon fassi, amandes douces, œufs de caille et grains de nigelle',
      en: 'Thin homemade Moroccan pancakes, chicken the Fassi way, sweet roasted almonds, quail eggs and nigella seeds',
    },
    price: 320,
  },
];

export const STARTERS: Dish[] = [
  {
    name: { fr: 'Chhiouattes de Dar Zellij', en: 'Dar Zellij chhiouattes' },
    desc: {
      fr: 'Dégustation de six fines salades marocaines de saison',
      en: 'A tasting of six fine seasonal Moroccan salads',
    },
    price: 140,
  },
  {
    name: { fr: 'Mosaïque de briouates', en: 'Briouates' },
    desc: {
      fr: 'Cinq sortes : bœuf, poulet, légumes, poisson, fromage du pays',
      en: 'Five kinds: beef, chicken, vegetables, fish, local cheese',
    },
    price: 160,
  },
  {
    name: same('Harira hamda'),
    desc: {
      fr: 'Soupe traditionnelle, accompagnée de dattes, d’un œuf de caille dur et de chebakia',
      en: 'Traditional soup with dates, a hard-boiled quail egg and chebakia',
    },
    price: 120,
  },
  {
    name: { fr: 'Pastilla au poulet', en: 'Chicken pastilla' },
    desc: {
      fr: 'Feuilles de brick farcies au poulet et aux amandes',
      en: 'Thin filo pastry with a traditional almond and chicken filling',
    },
    price: 210,
  },
  {
    name: {
      fr: 'Pastilla Dar Zellij au pigeon',
      en: 'Dar Zellij pigeon pastilla',
    },
    desc: {
      fr: 'Feuilles de brick farcies au pigeon',
      en: 'Thin filo pastry with a traditional almond and pigeon filling',
    },
    price: 280,
  },
  {
    name: { fr: 'Pastilla aux légumes', en: 'Vegetarian pastilla' },
    desc: {
      fr: 'Feuilles de brick farcies aux légumes de saison',
      en: 'Thin filo pastry with chermoula-marinated vegetables',
    },
    price: 190,
  },
  {
    name: { fr: 'Pastilla aux fruits de mer', en: 'Seafood pastilla' },
    desc: {
      fr: 'Feuilles de brick farcies aux crevettes et au poisson blanc à la chermoula',
      en: 'Thin filo pastry with seafood and vermicelli',
    },
    price: 260,
  },
];

export const MAINS: Dish[] = [
  {
    name: { fr: 'Couscous royal', en: 'Royal couscous' },
    desc: {
      fr: 'Aux sept légumes, bœuf, poulet et merguez',
      en: 'With seven vegetables, beef, chicken and merguez',
    },
    price: 350,
  },
  {
    name: { fr: 'Couscous bœuf tfaya', en: 'Beef couscous tfaya' },
    price: 240,
  },
  {
    name: {
      fr: 'Couscous agneau aux sept légumes',
      en: 'Lamb couscous with seven seasonal vegetables',
    },
    price: 250,
  },
  { name: { fr: 'Couscous au poulet', en: 'Chicken couscous' }, price: 220 },
  {
    name: { fr: 'Couscous végétarien', en: 'Vegetarian couscous' },
    price: 190,
  },
  {
    name: same('Seffa medfouna'),
    desc: {
      fr: 'Plat sucré-salé de vermicelles cuits à la vapeur, poulet façon beldi, cannelle, abricots et amandes',
      en: 'A subtle sweet dish of steamed vermicelli, beldi-style chicken, cinnamon, apricots and almonds',
    },
    price: 240,
    note: { fr: 'Option végétarienne 190', en: 'Vegetarian option 190' },
  },
  {
    name: { fr: 'Tagine de poulet', en: 'Chicken tagine' },
    desc: {
      fr: 'Olives m’slala au citron confit',
      en: 'M’slala olives with candied lemon',
    },
    price: 230,
  },
  {
    name: { fr: 'Tagine de bœuf', en: 'Beef tagine' },
    desc: {
      fr: 'Abricots, pruneaux et amandes',
      en: 'Apricots, prunes and almonds',
    },
    price: 260,
  },
  {
    name: { fr: 'Tagine d’agneau de saison', en: 'Seasonal lamb tagine' },
    price: 270,
  },
  {
    name: same('Tangia marrakchia'),
    desc: {
      fr: 'Jarret de bœuf au safran de Taliouine',
      en: 'A Marrakech staple: beef shank with Taliouine saffron',
    },
    price: 290,
  },
  {
    name: { fr: 'Tagine de poisson', en: 'Fish tagine' },
    desc: {
      fr: 'Lotte m’chermel au poivron du bled',
      en: 'Marinated monkfish and countryside bell peppers',
    },
    price: 280,
  },
  {
    name: { fr: 'Tagine de légumes', en: 'Vegetable tagine' },
    desc: {
      fr: 'Infusé aux herbes du jardin et à l’huile d’olive de l’Atlas',
      en: 'Infused with organic herbs and Atlas olive oil',
    },
    price: 190,
  },
];

export const DESSERTS: Dish[] = [
  {
    name: { fr: 'Orange à la cannelle', en: 'Cinnamon orange' },
    desc: {
      fr: 'Suprêmes d’orange, cannelle et sorbet à la fleur d’oranger',
      en: 'Orange slices, cinnamon and orange blossom ice cream',
    },
    price: 110,
  },
  {
    name: { fr: 'Pâtisseries marocaines', en: 'Moroccan pastries' },
    desc: {
      fr: 'Cinq sortes de pâtisseries maison',
      en: 'Five kinds of homemade pastries',
    },
    price: 120,
  },
  {
    name: { fr: 'Tarte Tatin à l’orientale', en: 'Oriental tarte Tatin' },
    desc: {
      fr: 'Tarte Tatin aux épices ras el hanout, boule de glace maison',
      en: 'Apple tart caramelised with ras el hanout spices, with a scoop of homemade ice cream',
    },
    price: 120,
  },
  {
    name: { fr: 'Jawhara au lait ou aux fruits', en: 'Jawhara, milk or fruit' },
    desc: {
      fr: 'Fines crêpes croustillantes, crème au lait et amandes torréfiées',
      en: 'Thin crispy crepes, orange blossom milk cream or fruits, roasted almonds',
    },
    price: 130,
  },
  {
    name: {
      fr: 'Thé ou café marocain et ses mignardises',
      en: 'Moroccan tea or coffee with petits fours',
    },
    price: 140,
  },
  {
    name: same('Crème brûlée'),
    desc: {
      fr: 'Au safran de Taliouine',
      en: 'Infused with Taliouine saffron',
    },
    price: 140,
  },
];

export const SET_MENUS: SetMenu[] = [
  {
    name: { fr: 'Menu Découverte', en: 'Discovery menu' },
    price: 490,
    courses: [
      {
        course: 'starter',
        options: [
          {
            fr: 'Chhiouattes de Dar Zellij, dégustation de fines salades marocaines',
            en: 'Dar Zellij chhiouattes',
          },
          { fr: 'Mosaïque de briouates', en: 'Briouates' },
        ],
      },
      {
        course: 'main',
        options: [
          {
            fr: 'Tagine de bœuf aux pruneaux et amandes',
            en: 'Beef tagine with prunes and almonds',
          },
          {
            fr: 'Tagine d’agneau aux légumes de saison',
            en: 'Seasonal lamb tagine',
          },
          {
            fr: 'Tagine de poulet au citron',
            en: 'Chicken tagine with preserved lemons',
          },
          { fr: 'Pastilla au poulet', en: 'Chicken pastilla' },
          { fr: 'Couscous bœuf ou poulet', en: 'Beef or chicken couscous' },
        ],
      },
      {
        course: 'dessert',
        options: [
          { fr: 'Orange à la cannelle', en: 'Cinnamon orange' },
          {
            fr: 'Jawhara au lait infusé à la fleur d’oranger',
            en: 'Jawhara with orange blossom cream and almonds',
          },
          { fr: 'Jawhara aux fruits', en: 'Jawhara with fruits' },
          {
            fr: 'Thé ou café gourmand et ses mignardises',
            en: 'Gourmet tea or coffee and Moroccan pastries',
          },
        ],
      },
    ],
  },
  {
    name: { fr: 'Menu Végétarien', en: 'Vegetarian menu' },
    price: 390,
    courses: [
      {
        course: 'starter',
        options: [
          {
            fr: 'Chhiouattes de Dar Zellij, dégustation de fines salades marocaines',
            en: 'Dar Zellij chhiouattes, a tasting of fine Moroccan salads',
          },
          { fr: 'Soupe harira hamda', en: 'Harira hamda soup' },
        ],
      },
      {
        course: 'main',
        options: [
          { fr: 'Couscous végétarien', en: 'Vegetarian couscous' },
          {
            fr: 'Tagine de légumes de saison à l’huile d’olive de l’Atlas et aux herbes du jardin',
            en: 'Seasonal vegetable tagine with Atlas olive oil and aromatic herbs from the garden',
          },
          { fr: 'Seffa beldi végétarienne', en: 'Vegetarian seffa beldi' },
          { fr: 'Pastilla aux légumes', en: 'Vegetable pastilla' },
        ],
      },
      {
        course: 'dessert',
        options: [
          { fr: 'Orange à la cannelle', en: 'Orange with cinnamon' },
          {
            fr: 'Jawhara au lait, fleur d’oranger et amandes',
            en: 'Jawhara with milk, orange blossom and almonds',
          },
          { fr: 'Jawhara aux fruits', en: 'Jawhara with fruits' },
          {
            fr: 'Thé ou café gourmand et mignardises',
            en: 'Gourmet tea or coffee and treats',
          },
        ],
      },
    ],
  },
  {
    name: { fr: 'Menu Dégustation', en: 'Tasting menu' },
    price: 760,
    courses: [
      {
        course: 'starter',
        intro: {
          fr: 'Sélection de salades marocaines, puis',
          en: 'A selection of Moroccan salads, then',
        },
        options: [
          { fr: 'Pastilla au poulet', en: 'Chicken pastilla' },
          { fr: 'Pastilla aux fruits de mer', en: 'Seafood pastilla' },
          { fr: '', en: 'Pigeon pastilla' },
        ],
      },
      {
        course: 'main',
        options: [
          {
            fr: 'Tagine de bœuf aux pruneaux et amandes',
            en: 'Beef tagine with apricots, prunes and almonds',
          },
          {
            fr: 'Tagine d’agneau aux légumes de saison',
            en: 'Lamb tagine with seasonal vegetables',
          },
          {
            fr: 'Tagine de poisson, lotte m’chermel et poivron du bled',
            en: 'Monkfish m’chermel tagine with local peppers',
          },
          {
            fr: 'Tangia marrakchia, jarret de bœuf au safran de Taliouine',
            en: 'Tangia marrakchia, beef shank with Taliouine saffron',
          },
          { fr: 'Couscous royal', en: 'Royal couscous' },
        ],
      },
      {
        course: 'dessert',
        options: [
          { fr: 'Crème brûlée au safran', en: 'Saffron crème brûlée' },
          { fr: 'Jawhara aux fruits', en: 'Jawhara with fruits' },
          { fr: 'Jawhara au lait infusé à la fleur d’oranger', en: '' },
          { fr: 'Tarte Tatin à l’orientale', en: 'Oriental tarte Tatin' },
        ],
        after: {
          fr: 'Et thé ou café gourmand et ses mignardises',
          en: 'And gourmet tea or coffee with Moroccan pastries',
        },
      },
    ],
  },
];

export const SIGNATURE_COCKTAIL_PRICE = 180;
export const CLASSIC_COCKTAIL_PRICE = 140;

export const SIGNATURE_COCKTAILS: Drink[] = [
  {
    name: same('Dar Zellij Fizz'),
    desc: {
      fr: 'Gin Bombay Dry, miel, jus de citron, safran de Taliouine, vermouth blanc sec, eau gazeuse',
      en: 'Bombay Dry gin, honey, lemon juice, Taliouine saffron, dry white vermouth, soda water',
    },
  },
  {
    name: same('Layali Marrakech'),
    desc: {
      fr: 'Compote de figue, whiskey, sirop de vanille, bitter à l’orange',
      en: 'Fig compote, whiskey, vanilla syrup, orange bitters',
    },
  },
  {
    name: same('Berbère'),
    desc: {
      fr: 'Vodka Grey Goose, romarin frais, lavande séchée, jus d’agrumes, eau de fleur d’oranger, tonic',
      en: 'Grey Goose vodka, fresh rosemary, dried lavender, citrus juice, orange blossom water, tonic',
    },
  },
  {
    name: same('Dates Lovers'),
    desc: {
      fr: 'Vodka, purée de dattes maison, lait de coco, cardamome, cannelle, extrait de vanille',
      en: 'Vodka, homemade date purée, coconut milk, cardamom, cinnamon, vanilla extract',
    },
  },
  {
    name: same('Moroccan Saffron Long Island Iced Tea'),
    desc: {
      fr: 'Triple sec, vodka, gin, tequila, citron vert, thé glacé maison, pistils de safran',
      en: 'Triple sec, vodka, gin, tequila, lime juice, homemade iced tea, saffron threads',
    },
  },
  {
    name: same('Garden Party'),
    desc: {
      fr: 'Gin Hendrick’s, jus de concombre, jus de citron, sirop de sucre de canne',
      en: 'Hendrick’s gin, cucumber juice, lemon juice, cane sugar syrup',
    },
  },
  {
    name: same('Qahwa Martini'),
    desc: {
      fr: 'Vodka Absolut Elyx, liqueur de café Kahlúa, espresso, sirop de sucre de canne',
      en: 'Absolut Elyx vodka, Kahlúa coffee liqueur, espresso, cane sugar syrup',
    },
  },
  {
    name: same('Negroni Splash'),
    desc: {
      fr: 'Aperol, gin Gordon’s, vermouth rouge fumé',
      en: 'Aperol, Gordon’s gin, smoked red vermouth',
    },
  },
  {
    name: { fr: 'Margarita à la sauge', en: 'Sage margarita' },
    desc: {
      fr: 'Tequila, triple sec, jus de citron vert, feuille de sauge',
      en: 'Tequila, triple sec, lime juice, sage leaf',
    },
  },
];

export const CLASSIC_COCKTAILS: Drink[] = [
  {
    name: same('Aperol Spritz'),
    desc: {
      fr: 'Aperol, prosecco, eau gazeuse',
      en: 'Aperol, prosecco, soda water',
    },
  },
  {
    name: same('Mojito'),
    desc: {
      fr: 'Rhum Bacardi, citron vert, menthe fraîche, sucre de canne, eau gazeuse',
      en: 'Bacardi rum, lime, fresh mint, cane sugar, soda water',
    },
  },
  {
    name: same('Americano'),
    desc: {
      fr: 'Campari, vermouth rouge, eau gazeuse',
      en: 'Campari, red vermouth, soda water',
    },
  },
  {
    name: same('Bellini'),
    desc: { fr: 'Prosecco, purée de pêche', en: 'Prosecco, peach purée' },
  },
  {
    name: same('Caipirinha'),
    desc: {
      fr: 'Cachaça, citron vert, sucre roux',
      en: 'Cachaça, lime, brown sugar',
    },
  },
  {
    name: same('Daiquiri'),
    desc: {
      fr: 'Havana Club, citron vert, sirop de sucre de canne',
      en: 'Havana Club, lime juice, cane sugar syrup',
    },
  },
  {
    name: same('Cosmopolitan'),
    desc: {
      fr: 'Vodka Absolut Elyx, triple sec, cranberry, citron vert',
      en: 'Absolut Elyx vodka, triple sec, cranberry, lime',
    },
  },
  {
    name: same('Morocco Mule'),
    desc: {
      fr: 'Vodka, sirop de gingembre, citron vert',
      en: 'Vodka, ginger syrup, lime juice',
    },
  },
  {
    name: same('Mighty Ginger'),
    desc: {
      fr: 'Gin Hendrick’s, gingembre, menthe fraîche, romarin, sucre de canne, eau gazeuse',
      en: 'Hendrick’s gin, ginger, fresh mint, rosemary, cane sugar, soda water',
    },
  },
];

export const MOCKTAILS: Drink[] = [
  {
    name: same('Virgin Mojito'),
    desc: {
      fr: 'Citron vert, menthe fraîche, sucre de canne, eau gazeuse',
      en: 'Lime, fresh mint, cane sugar, soda water',
    },
    price: 90,
  },
  {
    name: same('Soleil Levant'),
    desc: { fr: 'Orange, carotte, gingembre', en: 'Orange, carrot, ginger' },
    price: 95,
  },
  {
    name: same('Color of Marrakech'),
    desc: {
      fr: 'Pamplemousse, Sprite, anis étoilé',
      en: 'Grapefruit, Sprite, star anise',
    },
    price: 90,
  },
  {
    name: same('Cocktail Dar Zellij'),
    desc: {
      fr: 'Jus d’orange, fruit de saison',
      en: 'Orange juice, seasonal fruit',
    },
    price: 95,
  },
  {
    name: same('Fraîcheur'),
    desc: {
      fr: 'Concombre, menthe fraîche, citron, gingembre',
      en: 'Cucumber, fresh mint, lemon, ginger',
    },
    price: 95,
  },
  {
    name: same('Red Sky'),
    desc: {
      fr: 'Fruits rouges, sucre vanillé, lait d’amande',
      en: 'Red berries, vanilla sugar, almond milk',
    },
    price: 120,
  },
];
