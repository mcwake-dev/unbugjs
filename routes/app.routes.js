// app.routes.js

const Joi = require("joi");

const { validatorCompiler } = require("../utils/validatorCompiler.util");
const { appIdSchema, appNameSchema } = require("../schema/app.schema");
/**
 * Encapsulates App routes
 * @param {FastifyInstance} fastify Fastify Instance
 * @param {Object} options Plugin options 
 */
async function routes(fastify, options) {
    fastify.get('/api/apps', async (_request, _reply) => {
        const client = await fastify.pg.connect();

        try {
            const { rows } = await client.query('SELECT app_id, app_name FROM app ORDER BY app_name');

            return rows;
        } finally {
            client.release();
        }
    });

    fastify.post('/api/apps', { schema: { body: Joi.object().keys({ ...appNameSchema }).required() }, validatorCompiler }, async (request, reply) => {
        const client = await fastify.pg.connect();
        const { app_name } = request.body;

        try {
            const { rows } = await client.query('INSERT INTO app (app_name) VALUES($1) RETURNING app_id, app_name', [app_name]);

            return reply.status(201).send(rows[0]);
        } finally {
            client.release();
        }
    });

    fastify.get('/api/apps/:app_id', { schema: { params: Joi.object().keys({ ...appIdSchema }) }, validatorCompiler }, async (request, reply) => {
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

    fastify.put('/api/apps/:app_id', {
        schema: {
            params: Joi.object().keys({ ...appIdSchema }).required(),
            body: Joi.object().keys({ ...appNameSchema }).required()
        },
        validatorCompiler
    },
        async (request, reply) => {
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

    fastify.delete('/api/apps/:app_id', {
        schema: {
            params: Joi.object().keys({ ...appIdSchema }).required()
        }, validatorCompiler
    },
        async (request, reply) => {
            const client = await fastify.pg.connect();
            const { app_id } = request.params;

            try {
                const { rows } = await client.query("DELETE FROM app WHERE app_id=$1 RETURNING app_id, app_name;", [app_id]);

                if (rows.length === 0) {
                    reply.status(404);
                } else {
                    reply.status(204);
                }
            } finally {
                client.release();
            }
        });
}

module.exports = routes;