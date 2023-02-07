const cors = require("@fastify/cors");
const fastify = require('fastify')({ logger: true })
const Joi = require("joi");

fastify.register(cors, {});

fastify.register(require('@fastify/postgres'), {
    connectionString: 'postgres://postgres@localhost/bugs'
});

const validatorCompiler = ({ schema, method, url, httpPart }) => data => schema.validate(data);

const appIdSchema = {
    app_id: Joi.number().positive().required()
};

const appNameSchema = {
    app_name: Joi.string().required().min(1)
};

const appVersionSchema = {
    major_version: Joi.number().positive().required(),
    minor_version: Joi.number().positive().required(),
    patch_version: Joi.number().positive().required()
};

const appVersionIdSchema = {
    app_version_id: Joi.number().positive().required()
};

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

fastify.get("/api/apps/:app_id/versions", {
    schema: {
        params: Joi.object().keys({ ...appIdSchema }).required()
    }, validatorCompiler
}, async (request, reply) => {
    const client = await fastify.pg.connect();
    const { app_id } = request.params;

    try {
        const { rows } = await client.query("SELECT app_version_id, major_version, minor_version, patch_version FROM app_version WHERE app_id=$1 ORDER BY major_version DESC, minor_version DESC, patch_version DESC", [app_id]);

        if (rows.length === 0) {
            reply.status(404);
        }

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

const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();