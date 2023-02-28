const cors = require("@fastify/cors");
const fastify = require('fastify')({ logger: true })

fastify.register(cors, {});

fastify.register(require('@fastify/postgres'), {
    connectionString: 'postgres://postgres@localhost/bugs'
});

fastify.register(require("./routes/app.routes"));
fastify.register(require("./routes/bug.routes"));
fastify.register(require("./routes/bug_audit.routes"));

const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();