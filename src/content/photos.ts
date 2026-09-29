import type { Localized } from '@/lib/i18n';
import type { PhotoName } from '@/lib/photos';

/** What each photo shows, for screen readers and the gallery captions. */
export const PHOTO_ALT: Record<PhotoName, Localized> = {
  courtyard: {
    fr: 'Le patio de Dar Zellij le soir : colonnes, arbres et tables dressées devant l’alcôve aux rideaux rouges',
    en: 'The patio of Dar Zellij in the evening: columns, trees and laid tables before the red-curtained alcove',
  },
  'courtyard-portrait': {
    fr: 'L’alcôve aux rideaux rouges au fond du patio, entre les arbres',
    en: 'The red-curtained alcove at the end of the patio, between the trees',
  },
  patio: {
    fr: 'Le patio en journée, un serveur en djellaba blanche entre les colonnes et les tables dressées',
    en: 'The patio by day, a waiter in a white djellaba among the columns and laid tables',
  },
  'rooftop-view': {
    fr: 'La terrasse sur le toit, face aux toits de la médina de Marrakech',
    en: 'The rooftop terrace, facing the rooftops of the Marrakech medina',
  },
  'salon-fireplace': {
    fr: 'Un salon aux rideaux rouges avec sa cheminée, ses lustres et ses tables aux bougies',
    en: 'A salon with red curtains, a fireplace, chandeliers and candlelit tables',
  },
  'rooftop-dusk': {
    fr: 'Les toits de Dar Zellij à la tombée de la nuit, éclairés par des lanternes',
    en: 'The roofs of Dar Zellij at dusk, lit by lanterns',
  },
  'rooftop-tent': {
    fr: 'Le salon sous la tente de la terrasse, banquettes et tables éclairées à la lanterne',
    en: 'The tented salon on the rooftop, banquettes and lantern-lit tables',
  },
  curtains: {
    fr: 'Des rideaux orangés ouverts sur une table ronde parsemée de pétales de rose',
    en: 'Orange curtains parting onto a round table scattered with rose petals',
  },
  'carved-door': {
    fr: 'Une porte en bois sculpté et une alcôve éclairée à la bougie',
    en: 'A carved wooden door and a candlelit alcove',
  },
  'patio-red': {
    fr: 'Le patio sous une lumière rouge, tables dressées entre les colonnes',
    en: 'The patio in red light, tables laid between the columns',
  },
  'rooftop-waiter': {
    fr: 'Un serveur en djellaba blanche et tarbouche rouge sur le toit, au crépuscule',
    en: 'A waiter in a white djellaba and red fez on the roof at dusk',
  },
  'dar-cherifa': {
    fr: 'Le patio de Dar Cherifa, ses colonnes sculptées et ses tables',
    en: 'The patio of Dar Cherifa, with its carved columns and tables',
  },
  'dar-bensouda': {
    fr: 'Le patio de Dar Bensouda à Fès, zellij et bois sculpté',
    en: 'The patio of Dar Bensouda in Fes, zellij and carved wood',
  },
  'alcove-table': {
    fr: 'Une table dressée dans une alcôve, sous un arc sculpté et un plafond peint',
    en: 'A table laid in an alcove, beneath a carved arch and a painted ceiling',
  },
  'tea-pour': {
    fr: 'Un serveur verse le thé de très haut dans les verres, sur la terrasse',
    en: 'A waiter pours tea from high above the glasses on the rooftop',
  },
  'wine-petals': {
    fr: 'Une bouteille de vin rouge marocain sur une nappe blanche parsemée de pétales',
    en: 'A bottle of Moroccan red wine on a white tablecloth scattered with petals',
  },
  'waiter-tray': {
    fr: 'Un serveur présente un plateau de cocktails devant un mur ocre',
    en: 'A waiter presents a tray of cocktails against an ochre wall',
  },
  'couscous-tfaya': {
    fr: 'Un couscous aux légumes nappé d’oignons caramélisés',
    en: 'A vegetable couscous topped with caramelised onions',
  },
  'alcove-service': {
    fr: 'Un serveur dépose une assiette sur une table de l’alcôve',
    en: 'A waiter sets down a plate at a table in the alcove',
  },
  'terrace-cactus': {
    fr: 'Des cactus en pots de terre cuite le long d’un mur ocre, sur la terrasse',
    en: 'Cacti in terracotta pots along an ochre wall on the rooftop',
  },
  'tagine-prunes': {
    fr: 'Un tagine aux pruneaux, abricots et amandes, et un couscous',
    en: 'A tagine with prunes, apricots and almonds, and a couscous',
  },
  'alcove-salads': {
    fr: 'Une table de l’alcôve couverte de salades marocaines',
    en: 'An alcove table covered with Moroccan salads',
  },
  'rose-wine': {
    fr: 'Une bouteille de rosé marocain dans un seau à glace',
    en: 'A bottle of Moroccan rosé in an ice bucket',
  },
  salads: {
    fr: 'Les petites assiettes de salades marocaines, autour d’une bougie',
    en: 'Small plates of Moroccan salads around a candle',
  },
  'painted-ceiling': {
    fr: 'Détail d’un plafond peint : étoiles et entrelacs en rouge, or et bleu',
    en: 'Detail of a painted ceiling: stars and interlacing in red, gold and blue',
  },
  'tagine-reveal': {
    fr: 'Un serveur soulève le couvercle d’un tagine aux pruneaux',
    en: 'A waiter lifts the lid of a tagine with prunes',
  },
  mojito: {
    fr: 'Un cocktail à la menthe sur le zellij, entouré de pétales de rose',
    en: 'A mint cocktail on the zellij floor, surrounded by rose petals',
  },
  'red-salon': {
    fr: 'Le salon rouge : lustre, bois sculpté et table ronde parsemée de pétales',
    en: 'The red salon: a chandelier, carved wood and a round table scattered with petals',
  },
  'waiter-plating': {
    fr: 'Un serveur dresse une assiette devant l’alcôve aux rideaux bleus',
    en: 'A waiter sets a plate before the blue-curtained alcove',
  },
};
