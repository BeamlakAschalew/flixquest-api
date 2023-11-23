import {
    makeProviders,
    makeStandardFetcher,
    makeSimpleProxyFetcher,
    targets,
} from "@movie-web/providers";
import axios, { AxiosError } from "axios";
import { workers_url } from "..";
import dotenv from "dotenv";
dotenv.config();

const proxyUrl = process.env.WORKERS_URL;
export const providers = makeProviders({
    fetcher: makeStandardFetcher(fetch),
    proxiedFetcher: makeSimpleProxyFetcher(proxyUrl || proxyUrl || "", fetch),
    target: targets.BROWSER,
});

export async function fetchM3U8Content(url: string): Promise<string> {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                `Error fetching M3U8 content: ${(error as AxiosError).message}`,
            );
        } else {
            throw new Error(`Error fetching M3U8 content: ${error}`);
        }
    }
}
