var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.development.dbUrl);

var userSchema = new mongoose.Schema({
	fbId: String,
	name: String,
	email: {
		type: String,
		lowercae: true
	}
});	

module.exports = mongoose.model('User', userSchema);