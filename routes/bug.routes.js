// bug.routes.js

const Joi = require("joi");

const { validatorCompiler } = require("../utils/validatorCompiler.util");
const { appIdSchema } = require("../schema/app.schema");
const { appVersionIdSchema } = require("../schema/app_version.schema");
const { bugIdSchema, bugSchema } = require("../schema/bug.schema");

/**
 * Encapsulates Bug routes
 * @param {FastifyInstance} fastify Fastify instance
 * @param {Object} options Plugin options
 */
async function routes(fastify, options) {
    fastify.get("/api/apps/:app_id/versions/:app_version_id/bugs", {
        schema: {
            params: Joi.object().keys({
                ...appIdSchema,
                ...appVersionIdSchema
            })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = await fastify.pg.connect();
        const { app_version_id } = request.params;
        try {
            const { rows } = await client.query("SELECT bug_id, app_version_id, attempted, expected, actual, created FROM bug WHERE app_version_id=$1 ORDER BY created ASC;", [app_version_id]);

            if (rows.length === 0) {
                reply.status(404);
            }

            return rows;
        } finally {
            client.release();
        }
    });

    fastify.post("/api/apps/:app_id/versions/:app_version_id/bugs", {
        schema: {
            params: Joi.object().keys({ ...appIdSchema, ...appVersionIdSchema }),
            body: Joi.object().keys({ ...bugSchema })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = await fastify.pg.connect();
        const { app_version_id } = request.params;
        const { attempted, expected, actual } = request.body;

        try {
            const { rows } = await client.query("INSERT INTO bug(app_version_id, attempted, expected, actual) VALUES ($1, $2, $3, $4) RETURNING bug_id, attempted, expected, actual, created;", [app_version_id, attempted, expected, actual]);

            if (rows.length === 0) {
                reply.status(404);
            }

            reply.status(201).send(rows[0])
        } finally {
            client.release();
        }
    });

    fastify.get("/api/apps/:app_id/versions/:app_version_id/bugs/:bug_id", {
        schema: {
            params: Joi.object().keys({
                ...appIdSchema,
                ...appVersionIdSchema,
                ...bugIdSchema
            })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = await fastify.pg.connect();
        const { bug_id } = request.params;

        try {
            const { rows } = await client.query("SELECT bug_id, app_version_id, attempted, expected, actual, created FROM bug WHERE bug_id=$1;", [bug_id]);

            if (rows.length === 0) {
                reply.status(404);
            }

            return rows[0];
        } finally {
            client.release();
        }
    });

    fastify.put("/api/apps/:app_id/versions/:app_version_id/bugs/:bug_id", {
        schema: {
            params: Joi.object().keys({
                ...appIdSchema,
                ...appVersionIdSchema,
                ...bugIdSchema
            }),
            body: Joi.object().keys({
                ...bugSchema
            })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = await fastify.pg.connect();
        const { bug_id, app_version_id } = request.params;
        const { attempted, expected, actual } = request.body;
        try {
            const { rows } = await client.query("UPDATE bug SET app_version_id=$1, attempted=$2, expected=$3, actual=$4 WHERE bug_id=$5 RETURNING bug_id, app_version_id, attempted, expected, actual, created;", [app_version_id, attempted, expected, actual, bug_id]);

            if (rows.length === 0) {
                reply.status(404);
            }

            return rows[0];
        } finally {
            client.release();
        }
    });

    fastify.delete("/api/apps/:app_id/versions/:app_version_id/bugs/:bug_id", {
        schema: {
            params: Joi.object().keys({
                ...appIdSchema,
                ...appVersionIdSchema,
                ...bugIdSchema
            })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = await fastify.pg.connect();
        const { bug_id } = request.params;

        try {
            const { rows } = await client.query("DELETE FROM bug WHERE bug_id = $1 RETURNING bug_id, app_version_id, attempted, expected, actual, created;", [bug_id]);

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