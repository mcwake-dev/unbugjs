// validatorCompiler.util.js

/**
 * Set up custom validator compiler for Fastify
 * @param {Object} options Fastify validator options 
 * @returns {function} validate Function to run custom validator on provided data
 */
const validatorCompiler = ({ schema, method, url, httpPart }) => data => schema.validate(data);

module.exports = { validatorCompiler }