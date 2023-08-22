import {ServiceBroker} from "moleculer";
import ApiService from "moleculer-web"
import natsConfig from "./config/nats"

const broker = new ServiceBroker({
    nodeID: "gateway-service",
    transporter: `nats://${natsConfig.user}:${natsConfig.password}@${natsConfig.host}:${natsConfig.port}`,
    registry:{
        discoverer: "local"
    }
});

// Load API Gateway
broker.createService({
    mixins: [ApiService],
    settings: {
        routes: [
            {
                name: "auth",
                aliases: {
                    "POST login": "auth.login",
                    "POST users": "auth.createUser"
                }
            },
            {
                name: "game",
                authentication: true,
                aliases: {
                    "GET games": "game.all",
                    "POST games/:gameId": "game.add"
                }
            }
        ]
    },
    methods: {
        authenticate(ctx, route, req) {
            let token = req.headers["authorization"];
            if (token && token.startsWith("Bearer")) {
                token = token.slice(7);
                return ctx.call("auth.verify", {token})
            } else {
                return Promise.resolve(null);
            }
        }

    }
})

// Start server
broker.start();