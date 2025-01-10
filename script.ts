import "dotenv/config";
import invariant from "tiny-invariant";

import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import weekday from "dayjs/plugin/weekday.js";
import weekOfYear from "dayjs/plugin/weekOfYear.js";

import type { Location, Today } from "./types";

dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(weekOfYear);

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

const TESTING = true;
if (TESTING) {
  invariant(TEST_CHANNEL_ID, "TEST_CHANNEL_ID is required");
}

let locations: Location[] = [
  {
    name: "Kantine Oestergade",
    restaurantId: 1242,
    otherId: 675510,
    channelId: OESTERGADE_CHANNEL_ID,
  },
  {
    name: "Campus Åstvej",
    restaurantId: 1235,
    otherId: 674210,
    channelId: CAMPUS_CHANNEL_ID,
  },
  {
    name: "Midtown",
    restaurantId: 1241,
    otherId: 675110,
    channelId: MIDTOWN_CHANNEL_ID,
  },
  {
    name: "Kantine Løvstræde",
    restaurantId: 1243,
    otherId: 675610,
    channelId: LOVSTRAEDE_ID,
  },
];

if (TESTING && TEST_CHANNEL_ID) {
  const { name, restaurantId, otherId } = locations[1];
  const testLocation: Location = {
    name: `Test (${name})`,
    restaurantId,
    otherId,
    channelId: TEST_CHANNEL_ID,
  };

  locations = [testLocation];
}

const postToTeams = async ({
  location,
  today,
}: {
  location: Location;
  today: Today;
}) => {
  const cardTemplate = {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.4", // Downgrading to 1.4 is required to make it work with teams: https://github.com/microsoft/AdaptiveCards/issues/7676
    body: [
      {
        type: "TextBlock",
        text: dayjs(today.date).format("dddd Do [of] MMMM YYYY"),
        wrap: true,
        style: "heading",
        weight: "Bolder",
      },
      {
        type: "FactSet",
        facts: today.menus.map((menu) => ({
          title: menu.type,
          value: menu.menu,
        })),
        separator: true,
      },
    ],
    selectAction: {
      type: "Action.OpenUrl",
      url: `https://shop.foodandco.dk/${location.otherId}/weeklymenulist-en`,
    },
  };

  const payload = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: cardTemplate,
        channel_id: location.channelId,
        test: TESTING,
        location: location.name,
      },
    ],
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        "postToTeams, !ok,",
        `${response.status}: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("postToTeams, error,", error);
  }
};

const main = () => {
  const date = dayjs().format("YYYY-MM-DD");
  const dayInWeekIndex = dayjs().weekday() - 1;
  const weekNumber = dayjs().week();

  locations.forEach((location) => {
    const params = new URLSearchParams({
      restaurantId: String(location.restaurantId),
      languageCode: "en-GB",
      date,
    });
    const url = `https://shop.foodandco.dk/api/WeeklyMenu?${params}`;

    fetch(url)
      .then((response) => response.json())
      .then(async (data) => {
        const weekNumberFromMenu = data.weekNumber;
        const today = data.days[dayInWeekIndex];

        if (!today) {
          console.error(`No data for location "${location.name}" on "${date}"`);
          return;
        }

        if (weekNumber !== weekNumberFromMenu) {
          console.error(
            `Week number mismatch for locaion "${location.name}". Is ${weekNumberFromMenu}, but should be ${weekNumber}`
          );
          return;
        }

        const payload = {
          location,
          today,
        };

        await postToTeams(payload);
      });
  });
};

main();
