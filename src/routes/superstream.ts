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
            intro: "Welcome to the superstream provider",
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

            let superstreamSources: ResolutionStream[] = [];
            let superstreamSubs: SubData[] = [];

            try {
                const outputSuperStream = await providers.runAll({
                    media: media,
                    embedOrder: ["superstream"],
                });

                /*
                 embedOrder: [
                        "superstream",
                        "flixhq",
                        "show_box",
                        "remotestream",
                        "zoechip",
                        "gomovies",
                    ],
                */

                if (outputSuperStream?.stream?.type === "file") {
                    if (outputSuperStream.stream.qualities["4K"] != undefined) {
                        superstreamSources.push({
                            quality: "4",
                            url: outputSuperStream.stream.qualities["4K"].url,
                            isM3U8: false,
                        });
                    }
                    if (outputSuperStream.stream.qualities[1080] != undefined) {
                        superstreamSources.push({
                            quality: "1080",
                            url: outputSuperStream.stream.qualities[1080].url,
                            isM3U8: false,
                        });
                    }
                    if (outputSuperStream.stream.qualities[720] != undefined) {
                        superstreamSources.push({
                            quality: "720",
                            url: outputSuperStream.stream.qualities[720].url,
                            isM3U8: false,
                        });
                    }
                    if (outputSuperStream.stream.qualities[480] != undefined) {
                        superstreamSources.push({
                            quality: "480",
                            url: outputSuperStream.stream.qualities[480].url,
                            isM3U8: false,
                        });
                    }
                    if (outputSuperStream.stream.qualities[360] != undefined) {
                        superstreamSources.push({
                            quality: "360",
                            url: outputSuperStream.stream.qualities[360].url,
                            isM3U8: false,
                        });
                    }

                    for (
                        let i = 0;
                        i < outputSuperStream.stream.captions.length;
                        i++
                    ) {
                        superstreamSubs.push({
                            lang: outputSuperStream.stream.captions[i].language,
                            url: outputSuperStream.stream.captions[i].url,
                        });
                    }
                }

                reply.status(200).send({
                    sources: superstreamSources,
                    subtitles: superstreamSubs,
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

            let superstreamSources: ResolutionStream[] = [];
            let superstreamSubs: SubData[] = [];

            try {
                const outputSuperStream = await providers.runAll({
                    media: media,
                    embedOrder: ["flixhq", "superstream"],
                });

                let outputFlixhqEmbed;
                let outputFlixhq;

                try {
                    outputFlixhqEmbed = await providers.runSourceScraper({
                        media: media,
                        id: "flixhq",
                    });

                    console.warn(chalk.cyanBright(!outputSuperStream));

                    outputFlixhq = await providers.runEmbedScraper({
                        id: outputFlixhqEmbed.embeds[0].embedId,
                        url: outputFlixhqEmbed.embeds[0].url,
                    });
                } catch (e) {}

                /*
                 embedOrder: [
                        "superstream",
                        "flixhq",
                        "show_box",
                        "remotestream",
                        "zoechip",
                        "gomovies",
                    ],
                */

                console.warn(
                    chalk.magentaBright(outputSuperStream?.stream.type),
                );
                if (outputSuperStream?.stream?.type === "file") {
                    if (outputSuperStream.stream.qualities["4K"] != undefined) {
                        superstreamSources.push({
                            quality: "4",
                            url: outputSuperStream.stream.qualities["4K"].url,
                            isM3U8: false,
                        });
                    }
                    if (outputSuperStream.stream.qualities[1080] != undefined) {
                        superstreamSources.push({
                            quality: "1080",
                            url: outputSuperStream.stream.qualities[1080].url,
                            isM3U8: false,
                        });
                    }
                    if (outputSuperStream.stream.qualities[720] != undefined) {
                        superstreamSources.push({
                            quality: "720",
                            url: outputSuperStream.stream.qualities[720].url,
                            isM3U8: false,
                        });
                    }
                    if (outputSuperStream.stream.qualities[480] != undefined) {
                        superstreamSources.push({
                            quality: "480",
                            url: outputSuperStream.stream.qualities[480].url,
                            isM3U8: false,
                        });
                    }
                    if (outputSuperStream.stream.qualities[360] != undefined) {
                        superstreamSources.push({
                            quality: "360",
                            url: outputSuperStream.stream.qualities[360].url,
                            isM3U8: false,
                        });
                    }

                    for (
                        let i = 0;
                        i < outputSuperStream.stream.captions.length;
                        i++
                    ) {
                        superstreamSubs.push({
                            lang: outputSuperStream.stream.captions[i].language,
                            url: outputSuperStream.stream.captions[i].url,
                        });
                    }
                }

                reply.status(200).send({
                    sources: superstreamSources,
                    subtitles: superstreamSubs,
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
