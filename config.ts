import invariant from "tiny-invariant";

import type { Location } from "./types";

const PUSHOVER_APP_TOKEN = process.env.PUSHOVER_APP_TOKEN;
const PUSHOVER_USER_KEY = process.env.PUSHOVER_USER_KEY;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const CAMPUS_CHANNEL_ID = process.env.CAMPUS_CHANNEL_ID;
const MIDTOWN_CHANNEL_ID = process.env.MIDTOWN_CHANNEL_ID;
const OESTERGADE_CHANNEL_ID = process.env.OESTERGADE_CHANNEL_ID;
const LOVSTRAEDE_ID = process.env.LOVSTRAEDE_ID;
const TEST_CHANNEL_ID = process.env.TEST_CHANNEL_ID;
invariant(PUSHOVER_APP_TOKEN, "PUSHOVER_APP_TOKEN is required");
invariant(PUSHOVER_USER_KEY, "PUSHOVER_USER_KEY is required");
invariant(WEBHOOK_URL, "WEBHOOK_URL is required");
invariant(CAMPUS_CHANNEL_ID, "CAMPUS_CHANNEL_ID is required");
invariant(MIDTOWN_CHANNEL_ID, "MIDTOWN_CHANNEL_ID is required");
invariant(OESTERGADE_CHANNEL_ID, "OESTERGADE_CHANNEL_ID is required");
invariant(LOVSTRAEDE_ID, "LOVSTRAEDE_ID is required");

const getPushOverAppToken = () => PUSHOVER_APP_TOKEN;
const getPushOverUserKey = () => PUSHOVER_USER_KEY;
const getWebhookUrl = () => WEBHOOK_URL;
const getTestChannelId = () => TEST_CHANNEL_ID;
const getChannelIds = () => ({
  CAMPUS_CHANNEL_ID,
  MIDTOWN_CHANNEL_ID,
  OESTERGADE_CHANNEL_ID,
  LOVSTRAEDE_ID,
});

const getLocations = (channelIds: Record<string, string>): Location[] => [
  {
    name: "Campus Åstvej",
    restaurantId: 1235,
    otherId: 674210,
    channelId: channelIds.CAMPUS_CHANNEL_ID,
  },
  {
    name: "Midtown",
    restaurantId: 1241,
    otherId: 675110,
    channelId: channelIds.MIDTOWN_CHANNEL_ID,
  },
  {
    name: "Kantine Oestergade",
    restaurantId: 1242,
    otherId: 675510,
    channelId: channelIds.OESTERGADE_CHANNEL_ID,
  },
  {
    name: "Kantine Løvstræde",
    restaurantId: 1243,
    otherId: 675610,
    channelId: channelIds.LOVSTRAEDE_ID,
  },
];

export {
  getPushOverAppToken,
  getPushOverUserKey,
  getWebhookUrl,
  getTestChannelId,
  getChannelIds,
  getLocations,
};
