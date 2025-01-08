import * as dotenv from "dotenv";
dotenv.config();

export const config = {
    bot: {
        token: process.env.BOT_TOKEN,
        username: process.env.BOT_USERNAME,
        mode: process.env.BOT_MODE,
    },
    asana: {
        token: process.env.ASANA_TOKEN,
        project: process.env.ASANA_PROJECT,
    },
};
