import Fastify from "fastify";
import superstream from "./routes/superstream";
import flixhq from "./routes/flixhq";
import chalk from "chalk";
import FastifyCors from "@fastify/cors";
import dotenv from "dotenv";
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

    await fastify.register(superstream, { prefix: "/superstream" });
    await fastify.register(flixhq, { prefix: "/flixhq" });

    try {
        fastify.get("/", (_, rp) => {
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
