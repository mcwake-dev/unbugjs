const Joi = require("joi");

const appVersionSchema = {
    major_version: Joi.number().positive().required(),
    minor_version: Joi.number().positive().required(),
    patch_version: Joi.number().positive().required()
};

const appVersionIdSchema = {
    app_version_id: Joi.number().positive().required()
};

module.exports = {
    appVersionSchema,
    appVersionIdSchema
}