import type { Location } from "./types";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export const PUSHOVER_APP_TOKEN = requireEnv("PUSHOVER_APP_TOKEN");
export const PUSHOVER_USER_KEY = requireEnv("PUSHOVER_USER_KEY");
export const WEBHOOK_URL = requireEnv("WEBHOOK_URL");
export const TEST_CHANNEL_ID = process.env.TEST_CHANNEL_ID;

const CAMPUS_CHANNEL_ID = requireEnv("CAMPUS_CHANNEL_ID");
const MIDTOWN_CHANNEL_ID = requireEnv("MIDTOWN_CHANNEL_ID");
const OESTERGADE_CHANNEL_ID = requireEnv("OESTERGADE_CHANNEL_ID");
const LOVSTRAEDE_CHANNEL_ID = requireEnv("LOVSTRAEDE_CHANNEL_ID");

export const CHANNEL_IDS = {
  CAMPUS_CHANNEL_ID,
  MIDTOWN_CHANNEL_ID,
  OESTERGADE_CHANNEL_ID,
  LOVSTRAEDE_CHANNEL_ID,
};

export const getLocations = (
  channelIds: Record<string, string> = CHANNEL_IDS,
): Location[] => [
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
    channelId: channelIds.LOVSTRAEDE_CHANNEL_ID,
  },
];
