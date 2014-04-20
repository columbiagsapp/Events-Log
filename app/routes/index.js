
var parser = require('../controller/parser');

/*
 * GET home page.
 */

exports.index = function(req, res){
	parser.parse(req, res);
};