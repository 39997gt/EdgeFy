const Handlebars = require("handlebars");
// const template = Handlebars.compile("Name: {{name}}");
// console.log(template({ name: "Nils" }))
Handlebars.registerHelper('escape', function(variable) {
  return variable.replace(/([/\\/])/g, '\\$1');
});
var fs = require('fs');


console.log(process.argv)
const source_edge = fs.readFileSync('./src/templates/edge_template.hbs', {encoding:'utf8', flag:'r'});
var view_edge =require("../../results/edge_data.json");
var template = Handlebars.compile(source_edge);
var edge_replica = template(view_edge);
console.log(edge_replica);

const source_cloud = fs.readFileSync('./src/templates/cloud_template.hbs', {encoding:'utf8', flag:'r'});

var view_cloud =require("../../results/cloud_data.json");
var template_cloud = Handlebars.compile(source_cloud);
var cloud = template_cloud(view_cloud);
console.log(cloud);

var beautify = require('js-beautify').js;



fs.writeFileSync("results/edge/edge_replica.js",
    beautify(edge_replica, { indent_size: 2, space_in_empty_paren: true })
    );
fs.writeFileSync(
    "results/cloud/server/enhanced_norm_property-service.js",
    beautify(cloud, { indent_size: 2, space_in_empty_paren: true })
    );

