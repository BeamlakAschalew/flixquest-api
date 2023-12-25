import {
    MovieMedia,
    ScrapeMedia,
    ShowMedia,
    SourcererOutput,
} from "@movie-web/providers";
import {
    FastifyRequest,
    FastifyReply,
    FastifyInstance,
    RegisterOptions,
} from "fastify";
import {
    fetchM3U8Content,
    fetchMovieData,
    fetchTVData,
    langConverter,
    providers,
} from "../models/functions";
import { ResolutionStream, SubData } from "../models/types";
import chalk from "chalk";

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
    fastify.get("/", (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the smashystream provider",
            routes: "/watch-movie " + "/watch-tv",
        });
    });

    // media from TMDB

    fastify.get(
        "/watch-movie",
        async (request: FastifyRequest, reply: FastifyReply) => {
            const tmdbId = (request.query as { tmdbId: string }).tmdbId;
            let releaseYear: string = "";
            let title: string = "";

            if (typeof tmdbId === "undefined")
                return reply
                    .status(400)
                    .send({ message: "tmdb id is required" });

            await fetchMovieData(tmdbId).then((data) => {
                if (data) {
                    releaseYear = data?.year.toString();
                    title = data?.title;
                }
            });

            const media: MovieMedia = {
                type: "movie",
                title: title,
                releaseYear: parseInt(releaseYear),
                tmdbId: tmdbId,
            };

            let smashystreamSources: ResolutionStream[] = [];
            let smashystreamSubs: SubData[] = [];

            try {
                const outputsmashystreamEmbed =
                    await providers.runSourceScraper({
                        media: media,
                        id: "smashystream",
                    });

                const outputsmashystream = await providers.runEmbedScraper({
                    id: outputsmashystreamEmbed.embeds[0].embedId,
                    url: outputsmashystreamEmbed.embeds[0].url,
                });

                if (outputsmashystream?.stream?.type === "hls") {
                    for (
                        let i = 0;
                        i < outputsmashystream.stream.captions.length;
                        i++
                    ) {
                        smashystreamSubs.push({
                            lang: langConverter(
                                outputsmashystream.stream.captions[i].language,
                            ),
                            url: outputsmashystream.stream.captions[i].url,
                        });
                    }
                    smashystreamSources.push({
                        quality: "auto",
                        url: outputsmashystream?.stream.playlist,
                        isM3U8: true,
                    });
                    async function parseM3U8ContentFromUrl(url: string) {
                        try {
                            const m3u8Content = await fetchM3U8Content(url);
                            const regex =
                                /RESOLUTION=\d+x(\d+)[\s\S]*?(https:\/\/[^\s]+)/g;
                            const matches: {
                                resolution: string;
                                url: string;
                            }[] = [];
                            let match;

                            while ((match = regex.exec(m3u8Content)) !== null) {
                                const resolution = match[1];
                                const url = match[2];
                                matches.push({ resolution, url });
                                smashystreamSources.push({
                                    quality: resolution,
                                    url: url,
                                    isM3U8: true,
                                });
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }

                    const m3u8Url = outputsmashystream.stream.playlist; // Replace with your actual M3U8 URL
                    await parseM3U8ContentFromUrl(m3u8Url);
                }

                reply.status(200).send({
                    sources: smashystreamSources,
                    subtitles: smashystreamSubs,
                });
            } catch (err) {
                console.log(err);
                reply.status(500).send({
                    message: "Something went wrong. Please try again later.",
                    error: err,
                });
            }
        },
    );

    fastify.get(
        "/watch-tv",
        async (request: FastifyRequest, reply: FastifyReply) => {
            const tmdbId = (request.query as { tmdbId: string }).tmdbId;
            const episode = (request.query as { episode: string }).episode;
            const season = (request.query as { season: string }).season;

            let title: string = "";
            let episodeId: string = "";
            let seasonId: string = "";
            let releaseYear: string = "";
            let numberOfSeasons: string = "";

            if (typeof tmdbId === "undefined")
                return reply
                    .status(400)
                    .send({ message: "tmdb id is required" });
            if (typeof episode === "undefined")
                return reply
                    .status(400)
                    .send({ message: "episode is required" });
            if (typeof season === "undefined")
                return reply.status(400).send({
                    message: "season is required",
                });

            await fetchTVData(tmdbId, season, episode).then((data) => {
                if (data) {
                    title = data?.title;
                    episodeId = data?.episodeId.toString();
                    seasonId = data?.seasonId.toString();
                    releaseYear = data?.year.toString();
                    numberOfSeasons = data?.numberOfSeasons.toString();
                }
            });

            const media: ShowMedia = {
                type: "show",
                title: title,
                episode: {
                    number: parseInt(episode),
                    tmdbId: episodeId,
                },
                season: {
                    number: parseInt(season),
                    tmdbId: seasonId,
                },
                releaseYear: parseInt(releaseYear),
                tmdbId: tmdbId,
                numberOfSeasons: parseInt(numberOfSeasons),
            };

            let smashystreamSources: ResolutionStream[] = [];
            let smashystreamSubs: SubData[] = [];

            try {
                const outputsmashystreamEmbed =
                    await providers.runSourceScraper({
                        media: media,
                        id: "smashystream",
                    });

                const outputsmashystream = await providers.runEmbedScraper({
                    id: outputsmashystreamEmbed.embeds[0].embedId,
                    url: outputsmashystreamEmbed.embeds[0].url,
                });

                if (outputsmashystream?.stream?.type === "hls") {
                    for (
                        let i = 0;
                        i < outputsmashystream.stream.captions.length;
                        i++
                    ) {
                        smashystreamSubs.push({
                            lang: langConverter(
                                outputsmashystream.stream.captions[i].language,
                            ),
                            url: outputsmashystream.stream.captions[i].url,
                        });
                    }
                    smashystreamSources.push({
                        quality: "auto",
                        url: outputsmashystream?.stream.playlist,
                        isM3U8: true,
                    });
                    async function parseM3U8ContentFromUrl(url: string) {
                        try {
                            const m3u8Content = await fetchM3U8Content(url);
                            const regex =
                                /RESOLUTION=\d+x(\d+)[\s\S]*?(https:\/\/[^\s]+)/g;
                            const matches: {
                                resolution: string;
                                url: string;
                            }[] = [];
                            let match;

                            while ((match = regex.exec(m3u8Content)) !== null) {
                                const resolution = match[1];
                                const url = match[2];
                                matches.push({ resolution, url });
                                smashystreamSources.push({
                                    quality: resolution,
                                    url: url,
                                    isM3U8: true,
                                });
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }

                    const m3u8Url = outputsmashystream.stream.playlist; // Replace with your actual M3U8 URL
                    await parseM3U8ContentFromUrl(m3u8Url);
                }

                reply.status(200).send({
                    sources: smashystreamSources,
                    subtitles: smashystreamSubs,
                });
            } catch (err) {
                console.log(err);
                reply.status(500).send({
                    message: "Something went wrong. Please try again later.",
                    error: err,
                });
            }
        },
    );
};

export default routes;
