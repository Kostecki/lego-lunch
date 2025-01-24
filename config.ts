import invariant from "tiny-invariant";

import type { Location } from "./types";

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const OESTERGADE_CHANNEL_ID = process.env.OESTERGADE_CHANNEL_ID;
const CAMPUS_CHANNEL_ID = process.env.CAMPUS_CHANNEL_ID;
const MIDTOWN_CHANNEL_ID = process.env.MIDTOWN_CHANNEL_ID;
const LOVSTRAEDE_ID = process.env.LOVSTRAEDE_ID;
const TEST_CHANNEL_ID = process.env.TEST_CHANNEL_ID;
invariant(WEBHOOK_URL, "WEBHOOK_URL is required");
invariant(OESTERGADE_CHANNEL_ID, "OESTERGADE_CHANNEL_ID is required");
invariant(CAMPUS_CHANNEL_ID, "CAMPUS_CHANNEL_ID is required");
invariant(MIDTOWN_CHANNEL_ID, "MIDTOWN_CHANNEL_ID is required");
invariant(LOVSTRAEDE_ID, "LOVSTRAEDE_ID is required");

const getWebhookUrl = () => WEBHOOK_URL;
const getTestChannelId = () => TEST_CHANNEL_ID;
const getChannelIds = () => ({
  OESTERGADE_CHANNEL_ID,
  CAMPUS_CHANNEL_ID,
  MIDTOWN_CHANNEL_ID,
  LOVSTRAEDE_ID,
});

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

export { getWebhookUrl, getTestChannelId, getChannelIds, getLocations };
