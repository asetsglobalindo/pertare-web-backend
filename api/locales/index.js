const i18n_module = require('i18n-nodejs');

const DEFAULT_LANGUANGE = 'en';
const config_path = {
    general: __dirname + '/general/locale.json',
    footer: __dirname + '/general/footer.json',
}
const i18n = (message, attributes, language, path) => {
    const i18n = new i18n_module(language ?? DEFAULT_LANGUANGE, config_path[path]);
    return i18n.__(message, attributes)
}

const default_lang = (headers) => {
    return headers['accept-language'] ?? DEFAULT_LANGUANGE
}
module.exports = {
    i18n, default_lang
}