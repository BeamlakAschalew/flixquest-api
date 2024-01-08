import { MovieMedia, ShowMedia } from "@movie-web/providers";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import {
    fetchM3U8Content,
    fetchMovieData,
    fetchTVData,
    langConverter,
    parseM3U8ContentFromUrl,
    providers,
} from "../models/functions";
import { ResolutionStream, SubData } from "../models/types";

const routes = async (fastify: FastifyInstance) => {
    fastify.get("/", (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the remotestream provider",
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

            let remotestreamSources: ResolutionStream[] = [];
            let remotestreamSubs: SubData[] = [];

            try {
                const outputremotestreamEmbed =
                    await providers.runSourceScraper({
                        media: media,
                        id: "remotestream",
                    });

                const outputremotestream = await providers.runEmbedScraper({
                    id: outputremotestreamEmbed.embeds[0].embedId,
                    url: outputremotestreamEmbed.embeds[0].url,
                });

                if (outputremotestream?.stream[0].type === "hls") {
                    for (
                        let i = 0;
                        i < outputremotestream.stream[0].captions.length;
                        i++
                    ) {
                        remotestreamSubs.push({
                            lang: langConverter(
                                outputremotestream.stream[0].captions[i]
                                    .language,
                            ),
                            url: outputremotestream.stream[0].captions[i].url,
                        });
                    }
                    remotestreamSources.push({
                        quality: "auto",
                        url: outputremotestream?.stream[0].playlist,
                        isM3U8: true,
                    });

                    const m3u8Url = outputremotestream.stream[0].playlist;
                    await parseM3U8ContentFromUrl(m3u8Url, reply).then((v) => {
                        v?.forEach((r) => {
                            remotestreamSources.push({
                                quality: r.resolution,
                                url: r.url,
                                isM3U8: r.isM3U8,
                            });
                        });
                    });
                }

                reply.status(200).send({
                    sources: remotestreamSources,
                    subtitles: remotestreamSubs,
                });
            } catch (err) {
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

            let remotestreamSources: ResolutionStream[] = [];
            let remotestreamSubs: SubData[] = [];

            try {
                const outputremotestreamEmbed =
                    await providers.runSourceScraper({
                        media: media,
                        id: "remotestream",
                    });

                const outputremotestream = await providers.runEmbedScraper({
                    id: outputremotestreamEmbed.embeds[0].embedId,
                    url: outputremotestreamEmbed.embeds[0].url,
                });

                if (outputremotestream?.stream[0].type === "hls") {
                    for (
                        let i = 0;
                        i < outputremotestream.stream[0].captions.length;
                        i++
                    ) {
                        remotestreamSubs.push({
                            lang: langConverter(
                                outputremotestream.stream[0].captions[i]
                                    .language,
                            ),
                            url: outputremotestream.stream[0].captions[i].url,
                        });
                    }
                    remotestreamSources.push({
                        quality: "auto",
                        url: outputremotestream?.stream[0].playlist,
                        isM3U8: true,
                    });

                    const m3u8Url = outputremotestream.stream[0].playlist;
                    await parseM3U8ContentFromUrl(m3u8Url, reply).then((v) => {
                        v?.forEach((r) => {
                            remotestreamSources.push({
                                quality: r.resolution,
                                url: r.url,
                                isM3U8: r.isM3U8,
                            });
                        });
                    });
                }

                reply.status(200).send({
                    sources: remotestreamSources,
                    subtitles: remotestreamSubs,
                });
            } catch (err) {
                reply.status(500).send({
                    message: "Something went wrong. Please try again later.",
                    error: err,
                });
            }
        },
    );
};

export default routes;
