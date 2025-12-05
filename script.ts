import "dotenv/config";

import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import weekday from "dayjs/plugin/weekday.js";
import weekOfYear from "dayjs/plugin/weekOfYear.js";
import invariant from "tiny-invariant";
import "dayjs/locale/da.js";

import {
  getChannelIds,
  getLocations,
  getTestChannelId,
  getWebhookUrl,
} from "./config.ts";

import type { Location, Today } from "./types";

dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(weekOfYear);

const WEBHOOK_URL = getWebhookUrl();
const TEST_CHANNEL_ID = getTestChannelId();
const CHANNEL_IDS = getChannelIds();

const TESTING = false;
if (TESTING) {
  invariant(TEST_CHANNEL_ID, "TEST_CHANNEL_ID is required");
}

let locations = getLocations(CHANNEL_IDS);

if (TESTING && TEST_CHANNEL_ID) {
  const { name, restaurantId, otherId } = locations[0];
  const testLocation: Location = {
    name: `${name} (TEST)`,
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
  let date = dayjs(today.date).format("dddd, Do [of] MMMM YYYY");
  if (TESTING) {
    date = `${date} (${location.name})`;
  }

  const cardTemplate = {
    type: "AdaptiveCard",
    $schema: "https://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body: [
      {
        type: "Container",
        items: [
          {
            type: "TextBlock",
            text: date,
            wrap: true,
            style: "heading",
            weight: "Bolder",
          },
          {
            type: "FactSet",
            facts: today.menus
              .filter((menu) => menu.type !== null && menu.menu !== null)
              .map((menu) => ({
                title: menu.type,
                value: menu.menu,
              })),
            separator: true,
          },
        ],
        selectAction: {
          type: "Action.OpenUrl",
          title: "Go to menu",
          url: `https://shop.foodandco.dk/${location.otherId}/weeklymenulist-en`,
        },
      },
    ],
  };

  const payload = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: cardTemplate,
        channel_id: location.channelId,
        test: TESTING,
        location: location.name,
      },
    ],
  };

  try {
    console.log(`Publishing for location "${location.name}"`);
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
  const dayInWeekIndex = dayjs().locale("da").weekday();
  const weekNumber = dayjs().week();

  // Skip weekends
  if (dayInWeekIndex > 4) {
    return;
  }

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
        const today = data.days.find((menu: Today) => {
          const menuDate = menu.date.split("T")[0];
          return menuDate === date;
        });

        if (!today) {
          console.error(`No data for location "${location.name}" on "${date}"`);
          return;
        }

        if (weekNumber !== weekNumberFromMenu) {
          console.error(
            `Week number mismatch for location "${location.name}". Is ${weekNumberFromMenu}, but should be ${weekNumber}`
          );
          return;
        }

        const payload = {
          location,
          today,
        };

        await postToTeams(payload);
      })
      .catch((error) => {
        fetch("https://ntfy.israndom.win", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: "Random",
            title: `Error fetching data for location "${location.name}"`,
            message: error,
          }),
        });
      });
  });
};

main();
