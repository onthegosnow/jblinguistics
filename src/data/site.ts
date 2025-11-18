export const brandName = "Fuyu Ramen";

export const heroContent = {
  eyebrow: "Aurora, Colorado",
  title: "Fuyu Ramen & Izakaya",
  description:
    "Daily ramen, izakaya plates, and Japanese whiskies crafted with patience and a devotion to comfort. Every bowl starts with clear Colorado water, regional bones, and produce from growers we know by name.",
};

export const orderLinks = {
  order: "https://pos.chowbus.com/online-ordering/store/Fuyu-Ramen/22377",
  reserve: "https://www.toasttab.com/catering/bambinas-pizza-pasta-1610-r-st-1610-r-street-130",
  catering: "/aurora-fuyu-ramen-catering",
  parties: "/aurora-fuyu-ramen-party",
};

export const heroActions = [
  { label: "Order pickup + delivery", href: orderLinks.order, emphasis: true },
  { label: "Reserve a table", href: orderLinks.reserve },
  { label: "Our menus", href: "#menu" },
];

export const featureTiles = [
  {
    eyebrow: "18-hour broths",
    metric: "18 hrs",
    title: "Brimming with umami",
    description:
      "We simmer tonkotsu and miso broths overnight, layering garlic oil, roasted veggies, and kombu for a finish that clings lovingly to every noodle.",
  },
  {
    eyebrow: "Local sourcing",
    metric: "9 farms",
    title: "Colorado ingredients",
    description:
      "Front Range pork, Boulder mushrooms, and freshly milled noodles let us honor Japanese tradition while celebrating our Colorado neighbors.",
  },
  {
    eyebrow: "Izakaya evenings",
    metric: "6 pm",
    title: "Bites, whisky, vinyl",
    description:
      "House-fermented pickles, karaage dusted with sansho pepper, and an ever-growing list of Japanese whisky flights set the mood nightly.",
  },
];

type MenuItem = {
  name: string;
  description: string;
  price: string;
  badge?: string;
};

type MenuSection = {
  title: string;
  summary: string;
  items: MenuItem[];
};

export const menuSections: MenuSection[] = [
  {
    title: "Signature Bowls",
    summary: "Broths built over 18 hours, tare balanced to the gram, and noodles portioned to order.",
    items: [
      {
        name: "Black Garlic Tonkotsu",
        description: "Pork bone broth, soy tare, kikurage, sesame, ajitama egg, nori cloud, and our signature black garlic mayu.",
        price: "$17",
        badge: "Chef favorite",
      },
      {
        name: "Red Miso Paitan",
        description: "Chicken + pork blend with Sendai miso, chili crunch, sweet corn, charred cabbage, and garlic chive oil.",
        price: "$18",
      },
      {
        name: "Shoyu Glow",
        description: "Clear broth layered with shoyu, yuzu zest, bamboo shoots, menma, and flame-seared chashu.",
        price: "$16",
      },
    ],
  },
  {
    title: "Izakaya Plates",
    summary: "Shareable snacks that pair with Sapporo pours and late-night laughter.",
    items: [
      {
        name: "Twice-Fried Karaage",
        description: "Buttermilk brined chicken, sansho dust, pickled daikon, citrus kewpie.",
        price: "$12",
        badge: "New",
      },
      {
        name: "Miso Glazed Brussels",
        description: "Charred sprouts tossed with red miso caramel, bonito flakes, and toasted hazelnut.",
        price: "$10",
      },
      {
        name: "Gyoza Flight",
        description: "Seared dumplings stuffed three ways—ginger pork, shiitake tofu, and chili prawn.",
        price: "$14",
      },
    ],
  },
  {
    title: "Bar Program",
    summary: "Curated Japanese whisky, craft cocktails, and zero-proof pairings.",
    items: [
      {
        name: "Kyoto Highball",
        description: "Mars Iwai whisky, yuzu bitters, Kyoto soda, hand-cut ice spear.",
        price: "$14",
      },
      {
        name: "Matcha Paloma (NA)",
        description: "Ceremonial matcha, grapefruit, sudachi, Topo Chico sparkle.",
        price: "$9",
      },
      {
        name: "Plum Blossom",
        description: "Joto ume, jasmine tea, shiso simple, sparkling sake float.",
        price: "$13",
      },
    ],
  },
];

export const experienceHighlights = [
  {
    title: "Open kitchen, open hearts",
    description:
      "Sit at the noodle bar to watch our chefs torch chashu, pull fresh noodles, and plate izakaya bites to vinyl grooves.",
    bullets: [
      "Daily omakase ramen toppings after 8 PM",
      "Chef’s counter limited to 10 seats — call ahead",
      "Gluten-free broth and noodle options available",
    ],
    image: "/images/noodle-bar.jpg",
  },
  {
    title: "Community-first programming",
    description:
      "We host brewery collaborations, whisky classes, and anime brunches that keep Aurora’s ramen community buzzing.",
    bullets: [
      "Monthly collabs with local breweries & roasters",
      "Private dining for up to 35 with custom tasting menus",
      "Fundraisers that power local mutual-aid partners",
    ],
    image: "/images/izakaya.jpg",
  },
];

export const galleryImages = [
  {
    src: "/images/hero-ramen.jpg",
    alt: "Steam rising from a miso ramen bowl",
    label: "Winter miso special",
  },
  {
    src: "/images/signature-tonkotsu.jpg",
    alt: "Tonkotsu ramen with chashu and egg",
    label: "Black garlic tonkotsu",
  },
  {
    src: "/images/noodle-bar.jpg",
    alt: "Guests dining at the ramen bar",
    label: "Noodle bar seating",
  },
];

export const announcements = [
  {
    title: "Sapporo collab nights",
    detail: "Limited-run lager brewed with local hops taps every Thursday at 6 PM with paired karaage bites.",
  },
  {
    title: "Winter Omakase Series",
    detail: "Seven-course ramen and izakaya tasting with whisky pairings. Email us to reserve one of 12 seats.",
  },
  {
    title: "Community Mondays",
    detail: "10% of ramen sales support Aurora community fridges + mutual-aid partners every first Monday.",
  },
];

export const contactInfo = {
  addressLine1: "6180 South Gun Club Road L1",
  cityStateZip: "Aurora, CO 80016",
  phone: "(303) 993-5986",
  email: "fuyuramen88@gmail.com",
  mapLink:
    "https://www.google.com/maps/place/6180+South+Gun+Club+Road+L1,+Aurora,+CO+80016",
  instagram: "https://www.instagram.com/fuyu_ramen_aurora88",
  google:
    "https://www.google.com/search?q=Fuyu+Ramen+6180+South+Gun+Club+Road+L1",
  hours: "Daily · 11:00 AM – 9:00 PM",
};

export const ctaContent = {
  title: "Host your next gathering at Fuyu",
  body: "Custom menus, sake or whisky pairings, and a dedicated event captain make celebrations effortless.",
  primary: { label: "Plan a party", href: orderLinks.parties },
  secondary: { label: "Book catering", href: orderLinks.catering },
};
