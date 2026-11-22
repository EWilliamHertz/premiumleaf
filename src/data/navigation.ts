export interface MainCategoryGroup {
  id: string;
  label: string;
  href: string;
  description: string;
  subcategorySlugs: string[];
}

export const MAIN_CATEGORIES: MainCategoryGroup[] = [
  {
    id: 'humidors-care',
    label: 'Humidors & Care',
    href: '/collections/humidors',
    description:
      'Desktop cedar humidors, travel humidors, hygrometers, two-way humidity packs, and storage tubes.',
    subcategorySlugs: ['humidors', 'humidity-storage'],
  },
  {
    id: 'cases',
    label: 'Cases',
    href: '/collections/cigar-cases',
    description:
      'Full-grain leather folios, carbon-fibre slide cases, and stainless travel tubes.',
    subcategorySlugs: ['cigar-cases'],
  },
  {
    id: 'cutters-tools',
    label: 'Cutters & Tools',
    href: '/collections/cutters-accessories',
    description:
      'Precision V-cutters, double-blade guillotines, direct-jet lighters, gift sets, and specialty tools.',
    subcategorySlugs: ['cutters-accessories', 'other-accessories'],
  },
  {
    id: 'ashtrays-lounge',
    label: 'Ashtrays & Lounge',
    href: '/collections/cigar-ashtrays',
    description:
      'Wooden and ceramic cigar ashtrays, sculpted cigar rests, lounge decor, and reserve collector editions.',
    subcategorySlugs: [
      'cigar-ashtrays',
      'cigar-rests',
      'decor-gifts',
      'signature-collection',
    ],
  },
  {
    id: 'cabinets',
    label: 'Cabinets',
    href: '/collections/cigar-cabinets',
    description:
      'Architectural climate-controlled display cabinets and dual-door cedar showcases (inquiry approval).',
    subcategorySlugs: ['cigar-cabinets'],
  },
];

export function getMainCategoryForCollection(
  collectionSlug: string
): MainCategoryGroup | undefined {
  return MAIN_CATEGORIES.find((cat) =>
    cat.subcategorySlugs.includes(collectionSlug)
  );
}
