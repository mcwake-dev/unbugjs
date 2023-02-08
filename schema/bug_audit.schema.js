const Joi = require("joi");

const bugAuditIdSchema = {
    bug_audit_id: Joi.number().positive().required()
};

const bugAuditSchema = {
    notes: Joi.string().required()
}

module.exports = {
    bugAuditIdSchema,
    bugAuditSchema
}