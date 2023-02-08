const Joi = require("joi");

const bugIdSchema = {
    bug_id: Joi.number().positive().required()
};

const bugSchema = {
    attempted: Joi.string().required(),
    expected: Joi.string().required(),
    actual: Joi.string().required(),
}

module.exports = {
    bugIdSchema,
    bugSchema
}