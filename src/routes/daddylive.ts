import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { get247 } from "../providers/daddylive";
import { daddyliveReferrer, daddyliveStreamBaseUrl, daddyliveTrailingUrl, daddyliveUserAgent } from "../constants/api_constants";

const routes = async (fastify: FastifyInstance) => {
    fastify.get("/", async (_, rp) => {
        
        rp.status(200).send({
            intro: "Welcome to the daddylive provider",
            routes: "/live",
        });
    });

    fastify.get("/live", async (_, rp) => {
        const channels = await get247();
        rp.status(200).send({base_url: daddyliveStreamBaseUrl, trailing_url: daddyliveTrailingUrl, referrer: daddyliveReferrer, user_agent: daddyliveUserAgent, channels: channels});
    });
};

export default routes;
