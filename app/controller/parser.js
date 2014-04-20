var request = require('request');
var jsdom = require('jsdom');
var fs = require('fs');
var csv = require('fast-csv');

var weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

var month=new Array();
month[0]="January";
month[1]="February";
month[2]="March";
month[3]="April";
month[4]="May";
month[5]="June";
month[6]="July";
month[7]="August";
month[8]="September";
month[9]="October";
month[10]="November";
month[11]="December";


var output = [];

exports.parse = function(req, res){

	console.log('parsing');

	request( 'http://events.gsapp.org/eventlog-by-year/2014', function (error, response, body) {
		console.log('request response:');
		if (!error && response.statusCode == 200) {

			fromJSONtoCSV(body, res, writeToCSV);

			
		}
	});

};


function fromJSONtoCSV(data, res, callback){

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

			//create a Date object from the date field
			var date = new Date(node.field_event_date_value);

			node_clone.day = weekday[date.getDay()];
			node_clone.date = date.getDate();
			node_clone.month = month[date.getMonth()];
			node_clone.year = date.getFullYear();


			node_clone.event_type = node.field_event_taxonomy_type_value; //eg. "debate"
			node_clone.series = node.field_event_calendar_type_value; //eg. "Core Series", "CURE", etc.

			node_clone.body = node.body;

			//◊


			//parse the city and venue out of the HTML of the location field
			var city = '',
				venue = '';

			jsdom.env(
				node.field_event_location_value,
				["http://code.jquery.com/jquery.js"],
				function (err, window) {
					if(err){
						console.log('Error: trying to use jQuery with jsdom to extract city and location');
					}else{
						console.log("contents of .lineage-item-level-0:", window.$(".lineage-item-level-0").text());
						city = window.$(".lineage-item-level-0").text();
						venue = window.$(".lineage-item-level-1").text()
					}

					node_clone.city = city;
					node_clone.venue = venue;

					console.log('\n\n\nn: ' + n);
					console.dir(node_clone);

					output.push( node_clone );

					if(n == (nodes.length-1) ){
						callback(res);
					}
				}
			);
		})(n);

	}

};



function writeToCSV(res){
	
	console.log('entered writeToCSV()');

	

	csv
		.writeToPath("/var/www/log.events.gsapp.org/public_html/app/csv/events2014.csv", output, {headers: true})
		.on("finish", function(){
		console.log("done!");
	});


	res.send(output);
}








