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
import { fetchM3U8Content, providers } from "../models/functions";
import { ResolutionStream, SubData } from "../models/types";
import chalk from "chalk";

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
    fastify.get("/", (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the flixhq provider",
            routes: ["/watch-movie", "/watch-tv"],
        });
    });

    // media from TMDB

    fastify.get(
        "/watch-movie",
        async (request: FastifyRequest, reply: FastifyReply) => {
            const title = (request.query as { title: string }).title;
            const releaseYear = (request.query as { releaseYear: string })
                .releaseYear;
            const tmdbId = (request.query as { tmdbId: string }).tmdbId;

            console.log(title);
            console.log(releaseYear);
            console.log(tmdbId);

            const media: MovieMedia = {
                type: "movie",
                title: title,
                releaseYear: parseInt(releaseYear),
                tmdbId: tmdbId,
            };

            if (typeof title === "undefined")
                return reply.status(400).send({ message: "title is required" });
            if (typeof releaseYear === "undefined")
                return reply
                    .status(400)
                    .send({ message: "release year is required" });
            if (typeof tmdbId === "undefined")
                return reply
                    .status(400)
                    .send({ message: "imdb id is required" });
            let flixhqSources: ResolutionStream[] = [];
            let flixhqSubs: SubData[] = [];

            try {
                const outputFlixhqEmbed = await providers.runSourceScraper({
                    media: media,
                    id: "flixhq",
                });

                const outputFlixhq = await providers.runEmbedScraper({
                    id: outputFlixhqEmbed.embeds[0].embedId,
                    url: outputFlixhqEmbed.embeds[0].url,
                });

                if (outputFlixhq?.stream?.type === "hls") {
                    console.warn(chalk.magenta("reached here"));
                    for (
                        let i = 0;
                        i < outputFlixhq.stream.captions.length;
                        i++
                    ) {
                        flixhqSubs.push({
                            lang: outputFlixhq.stream.captions[i].language,
                            url: outputFlixhq.stream.captions[i].url,
                        });
                    }
                    flixhqSources.push({
                        quality: "auto",
                        url: outputFlixhq?.stream.playlist,
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
                                flixhqSources.push({
                                    quality: resolution,
                                    url: url,
                                    isM3U8: true,
                                });
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }

                    const m3u8Url = outputFlixhq.stream.playlist; // Replace with your actual M3U8 URL
                    await parseM3U8ContentFromUrl(m3u8Url);
                }

                reply.status(200).send({
                    sources: flixhqSources,
                    subtitles: flixhqSubs,
                });
            } catch (err) {
                console.log(err);
                reply.status(500).send({
                    message: "Something went wrong. Please try again later.",
                    err: err,
                });
            }
        },
    );

    fastify.get(
        "/watch-tv",
        async (request: FastifyRequest, reply: FastifyReply) => {
            const title = (request.query as { title: string }).title;
            const releaseYear = (request.query as { releaseYear: string })
                .releaseYear;
            const tmdbId = (request.query as { tmdbId: string }).tmdbId;
            const episode = (request.query as { episode: string }).episode;
            const season = (request.query as { season: string }).season;
            const episodeId = (request.query as { episodeId: string })
                .episodeId;
            const seasonId = (request.query as { seasonId: string }).seasonId;

            console.log(title);
            console.log(releaseYear);
            console.log(tmdbId);

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
            };

            if (typeof title === "undefined")
                return reply.status(400).send({ message: "title is required" });
            if (typeof releaseYear === "undefined")
                return reply
                    .status(400)
                    .send({ message: "release year is required" });
            if (typeof tmdbId === "undefined")
                return reply
                    .status(400)
                    .send({ message: "imdb id is required" });
            if (typeof episode === "undefined")
                return reply
                    .status(400)
                    .send({ message: "episode is required" });
            if (typeof episodeId === "undefined")
                return reply
                    .status(400)
                    .send({ message: "episode id is required" });
            if (typeof season === "undefined")
                return reply.status(400).send({
                    message: "season is required",
                });
            if (typeof seasonId === "undefined")
                return reply.status(400).send({
                    message: "season id is required",
                });

            let flixhqSources: ResolutionStream[] = [];
            let flixhqSubs: SubData[] = [];

            try {
                const outputSuperStream = await providers.runAll({
                    media: media,
                    embedOrder: ["flixhq", "superstream"],
                });

                const outputFlixhqEmbed = await providers.runSourceScraper({
                    media: media,
                    id: "flixhq",
                });

                console.warn(chalk.cyanBright(!outputSuperStream));

                const outputFlixhq = await providers.runEmbedScraper({
                    id: outputFlixhqEmbed.embeds[0].embedId,
                    url: outputFlixhqEmbed.embeds[0].url,
                });

                if (outputFlixhq?.stream?.type === "hls") {
                    console.warn(chalk.magenta("reached here"));
                    for (
                        let i = 0;
                        i < outputFlixhq.stream.captions.length;
                        i++
                    ) {
                        flixhqSubs.push({
                            lang: outputFlixhq.stream.captions[i].language,
                            url: outputFlixhq.stream.captions[i].url,
                        });
                    }
                    flixhqSources.push({
                        quality: "auto",
                        url: outputFlixhq?.stream.playlist,
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
                                flixhqSources.push({
                                    quality: resolution,
                                    url: url,
                                    isM3U8: true,
                                });
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }

                    const m3u8Url = outputFlixhq.stream.playlist; // Replace with your actual M3U8 URL
                    await parseM3U8ContentFromUrl(m3u8Url);
                }

                reply.status(200).send({
                    sources: flixhqSources,
                    subtitles: flixhqSubs,
                });
            } catch (err) {
                console.log(err);
                reply.status(500).send({
                    message: "Something went wrong. Please try again later.",
                    err: err,
                });
            }
        },
    );
};

export default routes;
