const cors = require("@fastify/cors");
const fastify = require('fastify')({ logger: true })

fastify.register(cors, {});

fastify.register(require('@fastify/postgres'), {
    connectionString: 'postgres://postgres@localhost/bugs'
});

fastify.get('/api/apps', async (request, reply) => {
    const client = await fastify.pg.connect();

    try {
        const { rows } = await client.query('SELECT app_id, app_name FROM app ORDER BY app_name');

        return rows;
    } finally {
        client.release();
    }
});

fastify.post('/api/apps', async (request, reply) => {
    const client = await fastify.pg.connect();
    const { app_name } = request.body;

    try {
        const { rows } = await client.query('INSERT INTO app (app_name) VALUES($1) RETURNING app_id, app_name', [app_name]);

        return reply.status(201).send(rows[0]);
    } finally {
        client.release();
    }
});

fastify.get('/api/apps/:app_id', async (request, reply) => {
    const client = await fastify.pg.connect();
    const { app_id } = request.params;

    try {
        const { rows } = await client.query('SELECT app_id, app_name FROM app WHERE app_id = $1', [app_id]);

        if (rows.length === 0) {
            reply.status(404);
        }

        return rows[0];
    } finally {
        client.release();
    }
});

fastify.put('/api/apps/:app_id', async (request, reply) => {
    const client = await fastify.pg.connect();
    const { app_id } = request.params;
    const { app_name } = request.body;

    try {
        const { rows } = await client.query("UPDATE app SET app_name=$1 WHERE app_id=$2 RETURNING app_id, app_name", [app_name, app_id]);

        if (rows.length === 0) {
            reply.status(404);
        }

        return rows[0];
    } finally {
        client.release();
    }
});

fastify.delete('/api/apps/:app_id', async (request, reply) => {
    const client = await fastify.pg.connect();
    const { app_id } = request.params;

    try {
        const { rows } = await client.query("DELETE FROM app WHERE app_id=$1 RETURNING *", [app_id]);

        if (rows.length === 0) {
            reply.status(404);
        } else {
            reply.status(204);
        }
    } finally {
        client.release();
    }
});

// Run the server!
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();