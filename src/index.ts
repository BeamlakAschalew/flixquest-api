import Fastify from "fastify";
import showbox from "./routes/showbox";
import flixhq from "./routes/flixhq";
import zoe from "./routes/zoe";
import remotestream from "./routes/remotestream";
import smashystream from "./routes/smashystream";
import gomovies from "./routes/gomovies";
import vidsrc from "./routes/vidsrc";
import chalk from "chalk";
import FastifyCors from "@fastify/cors";
import dotenv from "dotenv";
import { providers } from "./models/functions";
dotenv.config();

export const workers_url = process.env.WORKERS_URL && process.env.WORKERS_URL;
export const tmdbKey = process.env.TMDB_KEY && process.env.TMDB_KEY;

(async () => {
    const PORT = Number(process.env.PORT) || 3000;

    console.log(chalk.green(`Starting server on port ${PORT}... 🚀`));
    if (!process.env.WORKERS_URL)
        console.warn(chalk.yellowBright("Workers url not found"));

    if (!process.env.TMDB_KEY)
        console.warn(chalk.yellowBright("TMDB key not found"));

    const fastify = Fastify({
        maxParamLength: 1000,
        logger: true,
    });
    await fastify.register(FastifyCors, {
        origin: "*",
        methods: "GET",
    });

    await fastify.register(showbox, { prefix: "/superstream" });
    await fastify.register(showbox, { prefix: "/showbox" });
    await fastify.register(flixhq, { prefix: "/flixhq" });
    await fastify.register(zoe, { prefix: "/zoe" });
    await fastify.register(remotestream, { prefix: "/remotestream" });
    await fastify.register(smashystream, { prefix: "/smashystream" });
    await fastify.register(gomovies, { prefix: "/gomovies" });
    await fastify.register(vidsrc, { prefix: "/vidsrc" });

    try {
        fastify.get("/", async (_, rp) => {
            console.log(
                providers.listSources().forEach((e) => {
                    console.log(e.id);
                }),
            );
            rp.status(200).send("Welcome to FlixQuest API! 🎉");
        });
        fastify.get("*", (request, reply) => {
            reply.status(404).send({
                message: "",
                error: "page not found",
            });
        });

        fastify.listen({ port: PORT, host: "0.0.0.0" }, (e, address) => {
            if (e) throw e;
            console.log(`server listening on ${address}`);
        });
    } catch (err: any) {
        fastify.log.error(err);
        process.exit(1);
    }
})();
