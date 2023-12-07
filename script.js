require("dotenv").config();
const cheerio = require("cheerio");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const advancedFormat = require("dayjs/plugin/advancedFormat");

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

const regex = /(\d{1,2}\.\s\w+)/g;
const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);

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
            value: `${menu.veg}`
          }
        ],
        separator: true,
      },
    ],
    selectAction: {
      type: "Action.OpenUrl",
      url: "https://lego.isscatering.dk/kantine-oestergade/en/weekmenu",
    },
  };

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
      console.log(`statusCode: ${res.status}`);
      
      if (res.status !== 200) {
        console.log(res);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

fetch("https://lego.isscatering.dk/kantine-oestergade/en/weekmenu")
  .then((response) => response.text())
  .then((html) => {
    const $ = cheerio.load(html);

    const week = $(".header-week").text().match(regex);
    const dayOfWeek = dayjs().day() - 1;
    const firstDate = dayjs(week[0], "D. MMMM");

    const weekMenu = [];

    $(".week-container .day").map((index, el) => {
      const weekday = $(el).find(".menu-row:first h2").text();

      const hot = $(el).find(".menu-row:eq(1) .row .description").text();
      const veg = $(el).find(".menu-row:eq(2) .row .description").text();

      if (weekday) {
        weekMenu.push({
          date: capitalize(
            dayjs(firstDate).add(index, "day").format("dddd Do [of] MMMM YYYY")
          ),
          hot,
          veg,
        });
      }
    });

    postToTeams(weekMenu[dayOfWeek]);
  })
  .catch((error) => console.log(error));
