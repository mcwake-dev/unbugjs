const Joi = require("joi");

const appIdSchema = {
    app_id: Joi.number().positive().required()
};

const appNameSchema = {
    app_name: Joi.string().required().min(1)
};

module.exports = {
    appIdSchema,
    appNameSchema
}