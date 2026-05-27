import type { TripSeed } from "../types/trip";

const MORRO_GEAR: TripSeed["gear_checklist"] = [
  { name: "Dinner", items: ["Burgers/tacos", "Chips + salsa", "S'mores"] },
  { name: "Breakfast", items: ["Instant coffee", "Eggs/bacon", "Breakfast burritos"] },
  { name: "Snacks", items: ["Trail mix", "Fruit", "Jerky", "Granola bars"] },
  {
    name: "Shelter",
    items: [
      "Tent",
      "Stakes + mallet",
      "Sleeping bag",
      "Sleeping pad/air mattress",
      "Tarp",
    ],
  },
  {
    name: "Camp Kitchen",
    items: [
      "Camp stove",
      "Fuel",
      "Lighter/matches",
      "Cooler + ice",
      "Water jug",
      "Plates/utensils",
      "Trash bags",
    ],
  },
  {
    name: "Clothing",
    items: ["Warm layers", "Beanie", "Windbreaker", "Hiking shoes", "Extra socks"],
  },
  {
    name: "Essentials",
    items: [
      "Flashlights/headlamps",
      "Portable charger",
      "Sunscreen",
      "First aid kit",
      "Camp chairs",
      "Firewood (buy locally)",
    ],
  },
];

const BEGINNER_ATTIRE = [
  "Hiking shoes",
  "Long sleeve (optional)",
  "Shirt",
  "Flexible pants",
];

export const SEED_TRIPS: TripSeed[] = [
  {
    slug: "morro-bay-camping",
    title: "Morro Bay State Beach camping weekend",
    tagline: "Beginner-friendly camping + short hikes — low friction, social, shareable.",
    location: "Morro Bay State Beach camping",
    route: "SLO → Hwy 1 to Morro Bay",
    difficulty: "beginner",
    description: `A low-friction weekend for people new to camping and coastal hikes. Carpool from SLO, set up camp Friday evening, and keep Saturday and Sunday simple.

## Saturday
- **Morning hike** at Serenity Swings (beginner)
- **Start:** Poly Canyon Trail
- **Estimated time:** ~2 hours
- Afternoon: beach time, camp chores, group dinner

## Sunday
- Easy pack-up and optional short walk on the sand before heading home

Perfect for testing whether you enjoy camping with friends before committing to bigger trips.`,
    hero_image_url:
      "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=1200&q=80",
    attire: BEGINNER_ATTIRE,
    gear_checklist: MORRO_GEAR,
    necessities_note: "See gear checklist above.",
    map_links: [
      {
        label: "Morro Bay State Beach",
        url: "https://www.google.com/maps/search/?api=1&query=Morro+Bay+State+Beach+Campground",
      },
      {
        label: "Poly Canyon Trailhead",
        url: "https://www.google.com/maps/search/?api=1&query=Poly+Canyon+Trailhead+San+Luis+Obispo+CA",
      },
      {
        label: "Serenity Swings area",
        url: "https://www.google.com/maps/search/?api=1&query=Serenity+Swings+San+Luis+Obispo+CA",
      },
    ],
    estimated_cost: "$35–55/person (gas split + shared food + campsite)",
    time_required: "Weekend (Fri eve – Sun)",
    is_featured: true,
    is_current_week: true,
    is_published: true,
  },
  {
    slug: "serenity-swings-hike",
    title: "Serenity Swings morning hike",
    tagline:
      "Ultra-low-commitment 2-hour beginner hike — perfect for “can I do this?” and inviting a friend.",
    location: "Poly Canyon → Serenity Swings",
    route: "Start at Poly Canyon Trail",
    difficulty: "beginner",
    description: `No overnight gear. Meet at the trailhead, hike to Serenity Swings, snap a photo, head back.

**Route:** Poly Canyon Trail → Serenity Swings (beginner)
**Time:** ~2 hours round trip

Great weekly drop for testing whether curated trips beat searching random blogs.`,
    hero_image_url:
      "https://images.unsplash.com/photo-1551632811-ec551c64179c?w=1200&q=80",
    attire: BEGINNER_ATTIRE,
    gear_checklist: [
      {
        name: "Pack light",
        items: ["Water", "Snacks", "Hiking shoes", "Layers", "Sunscreen"],
      },
    ],
    necessities_note: "Water, snacks, and sun protection are enough.",
    map_links: [
      {
        label: "Poly Canyon Trailhead",
        url: "https://www.google.com/maps/search/?api=1&query=Poly+Canyon+Trailhead+San+Luis+Obispo+CA",
      },
      {
        label: "Serenity Swings area",
        url: "https://www.google.com/maps/search/?api=1&query=Serenity+Swings+San+Luis+Obispo+CA",
      },
    ],
    estimated_cost: "$5–15/person (gas + snacks)",
    time_required: "~2 hours (morning)",
    is_featured: true,
    is_current_week: false,
    is_published: true,
  },
  {
    slug: "pismo-kayak-fishing",
    title: "Kayak Fishing at Pismo Beach",
    tagline:
      "Beginner-friendly half-day on calm water — social, shareable, no expert gear required.",
    location: "Pismo Beach, CA",
    route: "San Luis Obispo → US-101 S → Pismo Beach (~20–30 min)",
    difficulty: "beginner",
    description: `Try kayak fishing from shore or a protected bay — calm water, easy to invite a friend, and no overnight commitment.

**What you'll do:** Rent a sit-on-top kayak (or bring your own), paddle a short distance from the launch, and fish with simple rod-and-reel tackle. Great for answering "Can I realistically do this and bring someone?"

**Why Pismo:** Beginner-friendly launches, nearby bait shops, and a classic Central Coast beach day if fishing is slow.

**Tip:** Buy a California sport fishing license and check whether a report card is required before you go — both are easy online for first-timers.`,
    hero_image_url:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
    attire: [
      "Quick-dry shirt and shorts or flexible pants",
      "Water shoes or sandals that can get wet",
      "Light windbreaker (coastal breeze)",
      "Hat and sunglasses",
    ],
    gear_checklist: [
      {
        name: "Kayak & safety",
        items: [
          "Kayak + paddle (rent locally if needed)",
          "Coast Guard–approved life jacket (PFD)",
          "Whistle on PFD",
        ],
      },
      {
        name: "Fishing",
        items: [
          "Rod and reel (medium-light spin combo is fine)",
          "Basic tackle: hooks, weights, swivels",
          "Bait (live sand crabs, squid, or ask the bait shop)",
          "Pliers / line cutters",
          "Small cooler with ice (optional keepers)",
        ],
      },
      {
        name: "Licenses (California)",
        items: [
          "CA sport fishing license (1-day or annual)",
          "Ocean report card if required for your target species — check CDFW for beginners",
        ],
      },
      {
        name: "Sun & hydration",
        items: ["Sunscreen (reef-safe)", "1–2 L water per person", "Snacks"],
      },
      {
        name: "Stay dry & comfortable",
        items: ["Dry bag for keys/wallet", "Change of clothes for the car", "Towel"],
      },
      {
        name: "Tech",
        items: ["Phone in waterproof case or dry bag"],
      },
    ],
    necessities_note:
      "Rent kayaks near the beach if you do not own one; license and report card rules are on wildlife.ca.gov.",
    map_links: [
      {
        label: "Pismo Beach",
        url: "https://www.google.com/maps/search/?api=1&query=Pismo+Beach+CA",
      },
      {
        label: "Pismo Beach kayak rentals (area)",
        url: "https://www.google.com/maps/search/?api=1&query=kayak+rental+Pismo+Beach+CA",
      },
      {
        label: "Port San Luis / Avila launch (calm bay option)",
        url: "https://www.google.com/maps/search/?api=1&query=Port+San+Luis+Harbor+CA",
      },
    ],
    estimated_cost:
      "$45–85/person (kayak rental ~$35–55, CA license ~$15–20, bait ~$10, gas from SLO ~$5–10)",
    time_required: "Morning half-day (4–5 hours)",
    is_featured: true,
    is_current_week: false,
    is_published: true,
  },
];

export function tripPath(slug: string): string {
  return `/trips/${slug}`;
}
