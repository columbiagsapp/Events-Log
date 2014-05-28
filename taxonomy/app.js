var request = require('request');
var fs = require('fs');
var csv = require('fast-csv');

//npm install sleep
var sleep = require('sleep');

var output = [];
var taxDictionary = {};


prepTaxonomy(getYearData);

function getYearData() {
	request( 'http://events.gsapp.org/eventlog-with-speakers-by-year/2013', function (error, response, body) {

		//console.log('request response:');
		if (!error && response.statusCode == 200) {

			//console.log('body:');
			//console.log(body);			
			
			fromJSONtoCSV(body, writeToCSV)
		}

		
		
	});
}





function prepTaxonomy (callback) {
	// brings in taxonomy csv, converts to dictionary. 
	
	csv
	 .fromPath("C:/Users/ebberly/Desktop/Google Drive/05 Cloud TA/01 Studio-X Book/09 data/140528_Taxonomy.csv")
	 .on("record", function(data){
	 	taxDictionary[data[0]]= data[1];
   				
			
	 })
	 .on("end", function(data){

	     console.log(taxDictionary);

	     console.log("done");
	     callback();
	     
	 });

	

	

}


function fromJSONtoCSV(data, callback){

	console.log('fromJSONtoCSV called.');
	//remove the parens that Drupal wraps the JSON response with
	var data_clean = data.substring(1, data.length - 1);

	//parse the data into an object
	var nodes = JSON.parse( data_clean ).nodes;

	//loop through all nodes and add them as comma separated fields 
	for(var n = 0; n < nodes.length; n++){
	//for(var n = 0; n < 3; n++){	
		(function(n) {
			//temporary binding to make this simpler
			var node = nodes[n].node;

			//clone of the node that will be clean
			var node_clone = {};

			node_clone.title = node.title;
			//node_clone.fieldeventpeoplevalue = node.field_event_people_value;
			node_clone.fieldeventpeoplevalue = taxDictionary[node.field_event_people_value]
			node_clone.eventID = node.nid;
			//node_clone.speaker = taxDictionary[nid];


			console.log('speaker: '+ node_clone.speaker);
			console.log('title: '+ node_clone.title);



			//console.log('field: '+ node.field_event_people_value);
			//console.log(node.name);


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
		.writeToPath("C:/Users/ebberly/Desktop/Google Drive/05 Cloud TA/01 Studio-X Book/09 data/02 output/eventspeople2013.csv", output, {headers: true})
		.on("finish", function(){
		console.log("done!");
	});


}


