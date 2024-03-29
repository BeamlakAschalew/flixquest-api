import axios from "axios";
import { load } from "cheerio";
import { ChannelEntry } from "../utils/types";
import { daddylive247Url } from "../constants/api_constants";

export async function get247() : Promise<ChannelEntry[] | null> {
    const channels = await axios.get(daddylive247Url);
    const $ = load(channels.data);
    const firstGridContainer = $('.grid-container').first();
    const gridItems = firstGridContainer.find('.grid-item').toArray();

    const parsedChannels: ChannelEntry[] = [];
    gridItems.forEach((element) => {
        const isChannelIdValid = extractChannelId($(element).find('a').attr('href')!);
        if (typeof isChannelIdValid !== "boolean" && !$(element).find('strong').text().startsWith("18+")) {
            parsedChannels.push({id: isChannelIdValid, channel_name: $(element).find('strong').text()});
        }
    });
    
    
    return parsedChannels;
}

function extractChannelId(text: string) : number | boolean {
    const regex = /(\d+)/;
    const match = text.match(regex);

    if (match) {
        return Number.parseInt(match[0]);
    } else {
        return false;
    }
}