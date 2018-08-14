
// function getTemplates(func[]){
// 	var templates;
// 	var len=func.length;
// 	var i;
// 	for (i=0;i<len;i++){
// 		templates[i]=func[i]();
// 	}
// 	return templates;
// }
var hbs=require('./handlebars.amd.js');

var addRecipeComponentBox = function(){
	return (hbs.compile('<select name="componentID" value="componentID">' +
		'{{#each context.nothing}}<option value={{ItemID}}>{{ItemName}}' +
		'</option>{{/each}}{{#each context.items}}<option value={{ItemID}}>' +
		'{{ItemName}}</option>{{/each}}</select>)')(context);
};