type menu = {
  type: string;
  menu: string;
  friendlyUrl: string | null;
  image: string | null;
};

export type Today = {
  dayOfWeek: string;
  date: string;
  menus: menu[];
};

export type Location = {
  name: string;
  restaurantId: number;
  otherId: number;
  channelId: string;
};
