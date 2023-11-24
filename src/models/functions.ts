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

export async function fetchMovieData(id: string): Promise<{
    title: string;
    year: number;
} | null> {
    try {
        const apiUrl = `${tmdbBaseUrl}/3/movie/${id}?language=en-US&api_key=${tmdbKey}`;
        const response = await axios.get(apiUrl);
        const { title, release_date: releaseDate } = response.data;

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
} | null> {
    try {
        const apiUrlSeason = `${tmdbBaseUrl}/3/tv/${id}/season/${seasonNum}?language=en-US&api_key=${tmdbKey}`;
        const apiUrlGeneral = `${tmdbBaseUrl}/3/tv/${id}?language=en-US&api_key=${tmdbKey}`;

        const response = await axios.get(apiUrlSeason);
        const resposneGeneral = await axios.get(apiUrlGeneral);

        const episodes = response.data.episodes;
        const seasonId = response.data.id;
        const title = resposneGeneral.data.original_name;
        const year = parseInt(
            resposneGeneral.data.first_air_date.split("-")[0],
        );
        const episodeIndex = parseInt(episodeNum) - 1;

        if (episodeIndex >= 0 && episodeIndex < episodes.length) {
            const { id: episodeId } = episodes[episodeIndex];
            return { title, episodeId, seasonId, year };
        } else {
            throw new Error("Invalid episode number");
        }
    } catch (error) {
        throw new Error("Error fetching TMDB data:," + error);
    }
}
