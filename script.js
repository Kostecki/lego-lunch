require("dotenv").config();
const cheerio = require("cheerio");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const advancedFormat = require("dayjs/plugin/advancedFormat");
const weekday = require("dayjs/plugin/weekday");

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);

const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);

const menuUrl = "https://lego.isscatering.dk/kantine-oestergade/en/weekmenu";
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const postToTeams = (menu) => {
  const cardTemplate = {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
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
            title: "Hot",
            value: `${menu.hot}`,
          },
          {
            title: "Vegetarian",
            value: `${menu.veg}`,
          },
        ],
        separator: true,
      },
    ],
    selectAction: {
      type: "Action.OpenUrl",
      url: menuUrl,
    },
  };

  if (menu.salad) {
    cardTemplate.body[1].facts.push({
      title: "Salad",
      value: `${menu.salad}`,
    });
  }

  fetch(`${process.env.TEAMS_WEBHOOK}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          contentUrl: null,
          content: cardTemplate,
        },
      ],
    }),
  })
    .then((res) => {
      if (res.status !== 200) {
        console.error(res);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

fetch(menuUrl)
  .then((response) => response.text())
  .then((html) => {
    const $ = cheerio.load(html);

    const weekMenu = [];

    $(".week-container .day").map((_, el) => {
      const weekday = $(el).find(".menu-row:first h2").text();
      const dayNumberInWeek = daysOfWeek.indexOf(weekday);

      const hot = $(el).find(".menu-row:eq(1) .row .description").text();
      const veg = $(el).find(".menu-row:eq(2) .row .description").text();
      const salad = $(el).find(".menu-row:eq(3) .row .description").text();

      if (weekday) {
        weekMenu.push({
          date: capitalize(
            dayjs().day(dayNumberInWeek).format("dddd Do [of] MMMM YYYY")
          ),
          hot,
          veg,
          salad,
        });
      }
    });

    const todaysDay = dayjs().format("dddd");
    const todaysMenu = weekMenu.find((day) => day.date.includes(todaysDay));

    postToTeams(todaysMenu);
  })
  .catch((error) => console.error(error));
