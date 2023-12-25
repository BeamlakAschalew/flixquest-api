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
            intro: "Welcome to the superstream provider",
            routes: ["/watch-movie", "/watch-tv"],
        });
    });

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

            let superstreamSources: ResolutionStream[] = [];
            let superstreamSubs: SubData[] = [];

            try {
                const outputSuperStream = await providers.runAll({
                    media: media,
                    embedOrder: ["showbox"],
                });

                if (outputSuperStream?.stream?.type === "file") {
                    if (outputSuperStream.stream.qualities["4k"] != undefined) {
                        superstreamSources.push({
                            quality: "4K",
                            url: outputSuperStream.stream.qualities["4k"].url,
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
                            lang: langConverter(
                                outputSuperStream.stream.captions[i].language,
                            ),
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

            let superstreamSources: ResolutionStream[] = [];
            let superstreamSubs: SubData[] = [];

            try {
                const outputSuperStream = await providers.runAll({
                    media: media,
                    embedOrder: ["showbox"],
                });

                if (outputSuperStream?.stream?.type === "file") {
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
                            lang: langConverter(
                                outputSuperStream.stream.captions[i].language,
                            ),
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
                    error: err,
                });
            }
        },
    );
};

export default routes;
