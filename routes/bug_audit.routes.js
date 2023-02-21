// bug_audit.routes.js

const Joi = require("joi");

const { validatorCompiler } = require("../utils/validatorCompiler.util");
const { appIdSchema } = require("../schema/app.schema");
const { appVersionIdSchema } = require("../schema/app_version.schema");
const { bugIdSchema } = require("../schema/bug.schema");
const { bugAuditIdSchema, bugAuditSchema } = require("../schema/bug_audit.schema");

/**
 * Encapsulates Bug Audit routes
 * @param {FastifyInstance} fastify Fastify instance
 * @param {Object} options Plugin options
 */
async function routes(fastify, options) {
    fastify.get("/api/apps/:app_id/versions/:app_version_id/bugs/:bug_id/audits", {
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
            const { rows } = await client.query("SELECT bug_audit_id, bug_id, created, notes FROM bug_audit WHERE bug_id = $1 ORDER BY created;", [bug_id]);

            return rows;
        } finally {
            client.release();
        }
    });

    fastify.post("/api/apps/:app_id/versions/:app_version_id/bugs/:bug_id/audits", {
        schema: {
            params: Joi.object().keys({ ...appIdSchema, ...appVersionIdSchema, ...bugIdSchema }),
            body: Joi.object().keys({ ...bugAuditSchema })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = await fastify.pg.connect();
        const { bug_id } = request.params;
        const { notes } = request.body;

        try {
            const { rows } = await client.query("INSERT INTO bug_audit(bug_id, notes) VALUES ($1, $2) RETURNING bug_id, bug_audit_id, created, notes;", [bug_id, notes]);

            if (rows.length === 0) {
                reply.status(404);
            }

            reply.status(201).send(rows[0])
        } finally {
            client.release();
        }
    });

    fastify.get("/api/apps/:app_id/versions/:app_version_id/bugs/:bug_id/audits/:bug_audit_id", {
        schema: {
            params: Joi.object().keys({
                ...appIdSchema,
                ...appVersionIdSchema,
                ...bugIdSchema,
                ...bugAuditIdSchema
            })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = await fastify.pg.connect();
        const { bug_audit_id } = request.params;

        try {
            const { rows } = await client.query("SELECT bug_audit_id, bug_id, created, notes FROM bug_audit WHERE bug_audit_id=$1;", [bug_audit_id]);

            if (rows.length === 0) {
                reply.status(404);
            }

            return rows[0];
        } finally {
            client.release();
        }
    });

    fastify.put("/api/apps/:app_id/versions/:app_version_id/bugs/:bug_id/audits/:bug_audit_id", {
        schema: {
            params: Joi.object().keys({
                ...appIdSchema,
                ...appVersionIdSchema,
                ...bugIdSchema,
                ...bugAuditIdSchema
            }),
            body: Joi.object().keys({
                ...bugAuditSchema
            })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = await fastify.pg.connect();
        const { bug_audit_id } = request.params;
        const { notes } = request.body;
        try {
            const { rows } = await client.query("UPDATE bug_audit SET notes=$1 WHERE bug_audit_id=$2 RETURNING bug_audit_id, bug_id, created, notes;", [notes, bug_audit_id]);

            if (rows.length === 0) {
                reply.status(404);
            }

            return rows[0];
        } finally {
            client.release();
        }
    });

    fastify.delete("/api/apps/:app_id/versions/:app_version_id/bugs/:bug_id/audits/:bug_audit_id", {
        schema: {
            params: Joi.object().keys({
                ...appIdSchema,
                ...appVersionIdSchema,
                ...bugIdSchema,
                ...bugAuditIdSchema
            })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = await fastify.pg.connect();
        const { bug_audit_id } = request.params;

        try {
            const { rows } = await client.query("DELETE FROM bug_audit WHERE bug_audit_id = $1 RETURNING bug_audit_id, bug_id, created, notes;", [bug_audit_id]);

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