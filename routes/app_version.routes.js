// app_version.routes.js

const Joi = require("joi");

const { validatorCompiler } = require("../utils/validatorCompiler.util");
const { appVersionIdSchema, appVersionSchema } = require("../schema/app_version.schema");
const { appIdSchema } = require("../schema/app.schema");
/**
 * Encapsulates App Version routes
 * @param {FastifyInstance} fastify Fastify Instance
 * @param {Object} options Plugin options
 */
async function routes(fastify, options) {
    fastify.get("/api/apps/:app_id/versions", {
        schema: {
            params: Joi.object().keys({ ...appIdSchema }).required()
        }, validatorCompiler
    }, async (request, reply) => {
        const client = await fastify.pg.connect();
        const { app_id } = request.params;

        try {
            const { rows } = await client.query("SELECT app_version_id, major_version, minor_version, patch_version FROM app_version WHERE app_id=$1 ORDER BY major_version DESC, minor_version DESC, patch_version DESC", [app_id]);

            return rows;
        } finally {
            client.release();
        }
    });

    fastify.post("/api/apps/:app_id/versions", {
        schema: {
            params: Joi.object().keys({ ...appIdSchema }).required(),
            body: Joi.object().keys({ ...appVersionSchema }).required()
        }, validatorCompiler
    }, async (request, reply) => {
        const client = await fastify.pg.connect();
        const { app_id } = request.params;
        const { major_version, minor_version, patch_version } = request.body;
        try {
            const { rows } = await client.query("INSERT INTO app_version(app_id, major_version, minor_version, patch_version) VALUES ($1, $2, $3, $4) RETURNING app_id, major_version, minor_version, patch_version;", [app_id, major_version, minor_version, patch_version]);

            reply.status(201).send(rows[0]);
        } finally {
            client.release();
        }
    });

    fastify.get("/api/apps/:app_id/versions/:app_version_id", {
        schema: {
            params: Joi.object().keys({ ...appIdSchema, ...appVersionIdSchema }).required()
        }, validatorCompiler
    }, async (request, reply) => {
        const client = await fastify.pg.connect();
        const { app_version_id } = request.params;

        try {
            const { rows } = await client.query("SELECT major_version, minor_version, patch_version FROM app_version WHERE app_version_id = $1", [app_version_id]);

            if (rows.length === 0) {
                reply.status(404);
            }

            return rows[0];
        } finally {
            client.release();
        }
    });

    fastify.put("/api/apps/:app_id/versions/:app_version_id", {
        schema: {
            params: Joi.object().keys({ ...appIdSchema, ...appVersionIdSchema }).required(),
            body: Joi.object().keys({ ...appVersionSchema }).required()
        }, validatorCompiler
    }, async (request, reply) => {
        const client = await fastify.pg.connect();
        const { app_version_id } = request.params;
        const { major_version, minor_version, patch_version } = request.body;

        try {
            const { rows } = await client.query("UPDATE app_version SET major_version = $1, minor_version = $2, patch_version = $3 WHERE app_version_id = $4 RETURNING app_version_id, major_version, minor_version, patch_version;", [major_version, minor_version, patch_version, app_version_id]);

            if (rows.length === 0) {
                reply.status(404);
            }

            return rows[0];
        } finally {
            client.release();
        }
    });

    fastify.delete('/api/apps/:app_id/versions/:app_version_id', {
        schema: {
            params: Joi.object().keys({ ...appIdSchema, ...appVersionIdSchema }).required()
        }, validatorCompiler
    },
        async (request, reply) => {
            const client = await fastify.pg.connect();
            const { app_version_id } = request.params;

            try {
                const { rows } = await client.query("DELETE FROM app_version WHERE app_version_id=$1 RETURNING app_version_id, major_version, minor_version, patch_version;", [app_version_id]);

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