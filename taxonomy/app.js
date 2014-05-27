var request = require('request');
var fs = require('fs');
var csv = require('fast-csv');



request( 'http://events.gsapp.org/eventlog-with-speakers-by-year/2014', function (error, response, body) {
	console.log('request response:');
	if (!error && response.statusCode == 200) {

		console.log('body:');
		console.log(body);

		//fromJSONtoCSV(body, writeToCSV);
	}
});


function fromJSONtoCSV(data, callback){

	//remove the parens that Drupal wraps the JSON response with
	var data_clean = data.substring(1, data.length - 1);

	//parse the data into an object
	var nodes = JSON.parse( data_clean ).nodes;

	//loop through all nodes and add them as comma separated fields 
	for(var n = 0; n < nodes.length; n++){

		(function(n) {
			//temporary binding to make this simpler
			var node = nodes[n].node;

			//clone of the node that will be clean
			var node_clone = {};

			node_clone.title = node.title;

			node_clone.speaker = node.field_event_people_value;

			

			output.push( node_clone );

			if(n == (nodes.length-1) ){
				callback();
			}
		})(n);

	}

};



function writeToCSV(){
	
	console.log('entered writeToCSV()');

	

	csv
		.writeToPath("/Users/troytherrien/Desktop/deleteme/taxonomy/eventspeople2014.csv", output, {headers: true})
		.on("finish", function(){
		console.log("done!");
	});


}

