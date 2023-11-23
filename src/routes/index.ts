import {
    FastifyRequest,
    FastifyReply,
    FastifyInstance,
    RegisterOptions,
} from "fastify";

import movies_tv from "./index";
const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
    await fastify.register(movies_tv, { prefix: "/movies-tv" });
    fastify.get("/", async (request: any, reply: any) => {
        reply.status(200).send("Welcome to FlixQuest movies/TV api");
    });
};

export default routes;
