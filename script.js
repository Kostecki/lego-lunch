require("dotenv").config();
const dayjs = require("dayjs");
const advancedFormat = require("dayjs/plugin/advancedFormat");
const weekday = require("dayjs/plugin/weekday");
const weekOfYear = require("dayjs/plugin/weekOfYear");

dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(weekOfYear);

const TESTING = false;

let locations = [
  {
    name: "Kantine Oestergade",
    restaurantId: 1242,
    otherId: 675510,
    channelId: process.env.KANTINE_OESTERGADE_CHANNEL_ID,
  },
  {
    name: "Campus Åstvej",
    restaurantId: 1235,
    otherId: 674210,
    channelId: process.env.CAMPUS_AASTVEJ_CHANNEL_ID,
  },
  {
    name: "Midtown",
    restaurantId: 1241,
    otherId: 675110,
    channelId: process.env.MIDTOWN_CHANNEL_ID,
  },
  {
    name: "Kantine Løvstræde",
    restaurantId: 1243,
    otherId: 675610,
    channelId: process.env.KANTINE_LOVSTRAEDE_ID,
  },
];

if (TESTING) {
  const { name, restaurantId, otherId } = locations[1];
  const testLocation = {
    name: `Test (${name})`,
    restaurantId,
    otherId,
    channelId: process.env.TEST_CHANNEL_ID,
  };

  locations = [testLocation];
}

const postToTeams = async ({ location, today }) => {
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
    const response = await fetch(process.env.WEBHOOK_URL, {
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
      restaurantId: location.restaurantId,
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
