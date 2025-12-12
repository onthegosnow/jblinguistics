export type TripPricingSheet = {
  slug: string;
  title: string;
  dates: string;
  duration: string;
  singleRoom: string;
  sharedRoom?: string;
  note?: string;
};

export const tripPricingSheets: TripPricingSheet[] = [
  {
    slug: "florida-immersion-winter",
    title: "Frankfurt → Tampa Intensive",
    dates: "Aug 14 – 22, 2025",
    duration: "2 weeks",
    singleRoom: "€3,650",
    sharedRoom: "€3,275",
    note: "Flights, lodging, excursions, and facilitation for up to 8 learners.",
  },
  {
    slug: "florida-bermuda",
    title: "Florida + Bahamas Extension",
    dates: "Aug 22 – Sep 4, 2025",
    duration: "2 weeks",
    singleRoom: "€4,580",
    sharedRoom: "€3,905",
    note: "Includes FRA→TPA and TPA→NAS flights plus dual-country housing.",
  },
  {
    slug: "florida-nyc",
    title: "Frankfurt → JFK + Tampa",
    dates: "Sep 4 – 19, 2025",
    duration: "2 weeks",
    singleRoom: "€4,500",
    sharedRoom: "€3,605",
  },
  {
    slug: "florida-immersion-autumn",
    title: "Florida Immersion (Autumn)",
    dates: "Sep 19 – Oct 3, 2025",
    duration: "2 weeks",
    singleRoom: "€3,650",
    sharedRoom: "€3,275",
  },
  {
    slug: "florida-immersion-winter",
    title: "Florida Mini Intensive",
    dates: "Oct 3 – 11, 2025",
    duration: "1 week",
    singleRoom: "€2,145",
    sharedRoom: "€1,960",
  },
  {
    slug: "long-beach-ca",
    title: "Long Beach California Residency",
    dates: "Feb 6 – 21, 2026",
    duration: "2 weeks",
    singleRoom: "€4,090",
    sharedRoom: "€3,230",
  },
  {
    slug: "long-beach-hawaii",
    title: "Long Beach + Kauai Extension",
    dates: "Feb 21 – Mar 7, 2026",
    duration: "2 weeks",
    singleRoom: "€6,040",
    sharedRoom: "€4,520",
  },
  {
    slug: "florida-grand-cayman",
    title: "Florida + Grand Cayman",
    dates: "Rolling departures · 2025–2026",
    duration: "2 weeks",
    singleRoom: "€4,520",
    sharedRoom: "€3,950",
    note: "Includes Tampa base week plus Grand Cayman reef immersion. Flights include FRA→TPA and TPA→GCM legs.",
  },
  {
    slug: "custom-tailored",
    title: "Custom English Team Building (7–21 days)",
    dates: "Built to your calendar",
    duration: "Varies",
    singleRoom: "Starting near €5,000",
    sharedRoom: "Starting near €4,200",
    note: "Final pricing depends on destinations, compliance requirements, and cohort size.",
  },
  {
    slug: "dublin-heritage",
    title: "Dublin Heritage Immersion",
    dates: "Mar 14 – 21, 2026 and weekly through Apr 4",
    duration: "1 week",
    singleRoom: "€1,810",
    note: "Single-occupancy standard; inquire for shared townhouse options.",
  },
  {
    slug: "dublin-business",
    title: "Dublin Business & Tech",
    dates: "Weekly departures · Mar 14 – Apr 4, 2026",
    duration: "1 week",
    singleRoom: "€1,810",
    note: "Single-occupancy standard; inquire for shared townhouse options.",
  },
  {
    slug: "dublin-startup",
    title: "Dublin Startup Sprint",
    dates: "Weekly departures · Mar 14 – Apr 4, 2026",
    duration: "1 week",
    singleRoom: "€1,810",
    note: "Single-occupancy standard; inquire for shared townhouse options.",
  },
  {
    slug: "dublin-heritage",
    title: "Dublin Two-Week Session A",
    dates: "Mar 14 – 28, 2026",
    duration: "2 weeks",
    singleRoom: "€3,330",
    note: "Single-occupancy standard; inquire for shared townhouse options.",
  },
  {
    slug: "dublin-business",
    title: "Dublin Two-Week Session B",
    dates: "Mar 21 – Apr 4, 2026",
    duration: "2 weeks",
    singleRoom: "€3,330",
    note: "Single-occupancy standard; inquire for shared townhouse options.",
  },
];

export function getTripPricingSheets(slug: string) {
  return tripPricingSheets.filter((sheet) => sheet.slug === slug);
}
