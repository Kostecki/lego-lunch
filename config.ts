import type { Location } from "./types";

const getLocations = (channelIds: Record<string, string>): Location[] => [
  {
    name: "Kantine Oestergade",
    restaurantId: 1242,
    otherId: 675510,
    channelId: channelIds["OESTERGADE_CHANNEL_ID"],
  },
  {
    name: "Campus Åstvej",
    restaurantId: 1235,
    otherId: 674210,
    channelId: channelIds["CAMPUS_CHANNEL_ID"],
  },
  {
    name: "Midtown",
    restaurantId: 1241,
    otherId: 675110,
    channelId: channelIds["MIDTOWN_CHANNEL_ID"],
  },
  {
    name: "Kantine Løvstræde",
    restaurantId: 1243,
    otherId: 675610,
    channelId: channelIds["LOVSTRAEDE_ID"],
  },
];

export default getLocations;
