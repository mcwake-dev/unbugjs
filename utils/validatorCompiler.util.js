const validatorCompiler = ({ schema, method, url, httpPart }) => data => schema.validate(data);

module.exports = { validatorCompiler }