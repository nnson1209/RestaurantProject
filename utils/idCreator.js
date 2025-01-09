const { v4: uuidv4 } = require('uuid');

module.exports.createId = () => {
    return uuidv4();
};