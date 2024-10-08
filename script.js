require("dotenv").config();
const cheerio = require("cheerio");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const advancedFormat = require("dayjs/plugin/advancedFormat");
const weekday = require("dayjs/plugin/weekday");

const createClient = require("@supabase/supabase-js").createClient;

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);

const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);

const TESTING = false;

const supabase = createClient(
  "https://fytqwdvsuzeaikzhkoij.supabase.co",
  process.env.SUPABASE_KEY
);

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const testLocation = {
  name: "Test",
  url: "https://lego.isscatering.dk/kantine-oestergade/en/weekmenu",
  channel_id: process.env.TEST_CHANNEL_ID,
};

let locations = [
  {
    name: "Kantine Oestergade",
    url: "https://lego.isscatering.dk/kantine-oestergade/en/weekmenu",
    channel_id: process.env.KANTINE_OESTERGADE_CHANNEL_ID,
  },
  {
    name: "Campus Åstvej",
    url: "https://lego.isscatering.dk/aastvej/en/weekmenu",
    channel_id: process.env.CAMPUS_AASTVEJ_CHANNEL_ID,
  },
  {
    name: "Midtown",
    url: "https://lego.isscatering.dk/midtown/en/weekmenu",
    channel_id: process.env.MIDTOWN_CHANNEL_ID,
  },
];

if (TESTING) {
  locations = [testLocation];
}

const getFromPhysicalMenu = async (location) => {
  const today = dayjs().format("YYYY-MM-DD");
  const { data, error } = await supabase
    .from("menu")
    .select()
    .eq("date", today)
    .eq("location", location);

  if (error) {
    console.error("getFromPhysicalMenu,", error);
    return false;
  } else {
    return data[0];
  }
};

const postToTeams = async (menu, location) => {
  const cardTemplate = {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.4", // Downgrading to 1.4 is required to make it work with teams: https://github.com/microsoft/AdaptiveCards/issues/7676
    body: [
      {
        type: "TextBlock",
        text: `${menu.date}`,
        wrap: true,
        style: "heading",
        weight: "Bolder",
      },
      {
        type: "FactSet",
        facts: [
          {
            title: "Meat",
            value: `${menu.meat}`,
          },
          {
            title: "Vegetarian",
            value: `${menu.veggie}`,
          },
        ],
        separator: true,
      },
    ],
    selectAction: {
      type: "Action.OpenUrl",
      url: location.url,
    },
  };
  if (menu.salad) {
    cardTemplate.body[1].facts.push({
      title: "Salad",
      value: `${menu.salad}`,
    });
  }

  const payload = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: cardTemplate,
        channel_id: location.channel_id,
        test: TESTING,
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

locations.forEach((location) => {
  fetch(location.url)
    .then((response) => response.text())
    .then(async (html) => {
      const $ = cheerio.load(html);

      const weekMenu = [];

      $(".week-container .day").map((_, el) => {
        const weekday = $(el).find(".menu-row:first h2").text();
        const dayNumberInWeek = daysOfWeek.indexOf(weekday);

        const meat = $(el).find(".menu-row:eq(1) .row .description").text();
        const veggie = $(el).find(".menu-row:eq(2) .row .description").text();
        const salad = $(el).find(".menu-row:eq(3) .row .description").text();

        if (weekday) {
          weekMenu.push({
            date: capitalize(
              dayjs().day(dayNumberInWeek).format("dddd Do [of] MMMM YYYY")
            ),
            location: location.name,
            meat,
            veggie,
            salad,
          });
        }
      });

      const todaysDay = dayjs().format("dddd");
      let todaysMenu = weekMenu.find((day) => day.date.includes(todaysDay));

      if (
        !todaysMenu ||
        todaysMenu.meat === "Please find the menu in the Canteen"
      ) {
        const physicalMenu = await getFromPhysicalMenu(location.name);

        if (physicalMenu) {
          todaysMenu = {
            date: dayjs().format("dddd Do [of] MMMM YYYY"),
            location: location.name,
            meat: physicalMenu.meat,
            veggie: physicalMenu.veggie,
          };

          if (physicalMenu.salad) {
            todaysMenu.salad = physicalMenu.salad;
          }
        }
      }

      await postToTeams(todaysMenu, location);
    })
    .catch((error) => console.error("forEach,", error));
});
