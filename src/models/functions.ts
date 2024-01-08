import {
    makeProviders,
    makeStandardFetcher,
    makeSimpleProxyFetcher,
    targets,
} from "@movie-web/providers";
import axios, { AxiosError } from "axios";
import { workers_url } from "..";
import dotenv from "dotenv";
import { tmdbBaseUrl, tmdbKey } from "../constants/api_constants";
import { supportedLanguages } from "./types";
import { FastifyReply } from "fastify";
dotenv.config();

const proxyUrl = process.env.WORKERS_URL;
export const providers = makeProviders({
    fetcher: makeStandardFetcher(fetch),
    proxiedFetcher: makeSimpleProxyFetcher(proxyUrl || proxyUrl || "", fetch),
    target: targets.BROWSER,
});

export const showBoxProviders = makeProviders({
    fetcher: makeStandardFetcher(fetch),
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

export async function parseM3U8ContentFromUrl(
    url: string,
    reply: FastifyReply,
) {
    try {
        const m3u8Content = await fetchM3U8Content(url);
        const regex = /RESOLUTION=\d+x(\d+)[\s\S]*?(https:\/\/[^\s]+)/g;
        const matches: {
            resolution: string;
            url: string;
            isM3U8: boolean;
        }[] = [];
        let match;

        while ((match = regex.exec(m3u8Content)) !== null) {
            const resolution = match[1];
            const url = match[2];
            const isM3U8 = true;
            matches.push({ resolution, url, isM3U8 });
        }

        return matches;
    } catch (error) {
        console.log(error);
        reply.status(500).send({
            message: "Something went wrong. Please try again later.",
            error: error,
        });
    }
}

export async function fetchMovieData(id: string): Promise<{
    title: string;
    year: number;
} | null> {
    try {
        const apiUrl = `${tmdbBaseUrl}/3/movie/${id}?language=en-US&api_key=${tmdbKey}`;
        const response = await axios.get(apiUrl);
        const releaseDate = response.data.release_date;
        const title = response.data.title;
        const year: number = parseInt(releaseDate.split("-")[0]);
        return { title, year };
    } catch (error) {
        throw new Error("Error fetching TMDB data:," + error);
    }
}

export async function fetchTVData(
    id: string,
    seasonNum: string,
    episodeNum: string,
): Promise<{
    title: string;
    episodeId: number;
    seasonId: number;
    year: number;
    numberOfSeasons: number;
} | null> {
    try {
        const apiUrlSeason = `${tmdbBaseUrl}/3/tv/${id}/season/${seasonNum}?language=en-US&api_key=${tmdbKey}`;
        const apiUrlGeneral = `${tmdbBaseUrl}/3/tv/${id}?language=en-US&api_key=${tmdbKey}`;

        const response = await axios.get(apiUrlSeason);
        const resposneGeneral = await axios.get(apiUrlGeneral);

        const episodes = response.data.episodes;
        const seasonId = response.data.id;
        const title = resposneGeneral.data.name;
        const year = parseInt(
            resposneGeneral.data.first_air_date.split("-")[0],
        );
        const numberOfSeasons = resposneGeneral.data.number_of_seasons;
        const episodeIndex = parseInt(episodeNum) - 1;

        if (episodeIndex >= 0 && episodeIndex < episodes.length) {
            const { id: episodeId } = episodes[episodeIndex];
            return { title, episodeId, seasonId, year, numberOfSeasons };
        } else {
            throw new Error("Invalid episode number");
        }
    } catch (error) {
        throw new Error("Error fetching TMDB data:," + error);
    }
}

export function langConverter(short: string) {
    for (let i = 0; i < supportedLanguages.length; i++) {
        if (short === supportedLanguages[i].shortCode) {
            return supportedLanguages[i].longName;
        }
    }

    return short;
}
