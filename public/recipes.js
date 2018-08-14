function addRecipeComponent(){

	var table = document.getElementById("componentTable");
    var row = table.insertRow(-1);

    var componentBox = row.insertCell(0);
    var quantityBox = row.insertCell(1);
    var deleteButtonBox = row.insertCell(2);
    row.hidden=false;
    var scrp = "";

    scrp += '<select name="componentID" value="componentID">';
    var i;
    for (i=0; i<List__nothing.nothingIDs.length; i++){
        scrp += '<option value=' + List__nothing.nothingIDs[i] + '>' 
        + List__nothing.nothingNames[i] + '</option>';
    }
    for (i=0;i<List__items.itemIDs.length; i++){
        scrp += '<option value=' + List__items.itemIDs[i] + '>' 
        + List__items.itemNames[i] + '</option>';
    }
    scrp += '</select>';

    componentBox.innerHTML = scrp;
    quantityBox.innerHTML = '<input type="number" min="0" name="componentQty">';
    deleteButtonBox.innerHTML='<input type="button" value="Delete" onclick="deleteRow(this)">';
}

// function basicExpand(that, index, id){
//         var outerTable=document.getElementById('recipeTableX');
//     newIndex = index+1;
//     // make new row beneath expand button.
//     var row = document.getElementById('recipeTableXBody').insertRow(newIndex);
//     var cell = row.insertCell(0);
//     cell.innerHTML = "Hi!";
// }

function expandRecipe(that, index, id){

    var j;
    var expansionCounter=0;
    for (j=0; j<expanded.length; j++){
        if (index > expanded[j]){
            expansionCounter++;
        }
    }
    

    var outerTable=document.getElementById('recipeTableX');
    newIndex = index + 1 + expansionCounter;
    // make new row beneath expand button.
    var row = document.getElementById('recipeTableXBody').insertRow(newIndex);
    row.class="nestedRow";
    row.id="nestedRow" + newIndex;
    row.hidden=false;

    var i;
    var ingredientStr = "";
    var quantityStr = "";
    var techLvlStr = "";
    var catStr="";
    var typeStr="";
    for (i=0; i<=List__components.cmpName.length; i++){
        if (List__components.cmpRecipeID[i] == id){
            ingredientStr += '<tr><td class=nested>' + List__components.cmpName[i] + '</td></tr>';
            quantityStr += '<tr><td class=nested>' + List__components.cmpQty[i] + '</td></tr>';
            techLvlStr += '<tr><td class=nested>' + List__components.cmpTechLvl[i] + '</td></tr>';
            catStr += '<tr><td class=nested>' + List__components.cmpCat[i] + '</td></tr>';
            typeStr += '<tr><td class=nested>' + List__components.cmpType[i] + '</td></tr>';
        }
    }

// these are the cell elements (<td>)
    // intro cell
    var prodNameBox     = row.insertCell(0);
    // document.getElementById('recipeR' + newIndex + 'C0');
    prodNameBox.innerHTML = '<table id="nestedTable"><th></th><td>Ingredients used per cycle:</td></table>'

    // Ingredient name cell
    var prodTypeBox     = row.insertCell(1);
    // document.getElementById('recipeR' + newIndex + 'C1');
    prodTypeBox.innerHTML = '<table><th>Ingredients</th>' + ingredientStr + '</table>'

    // Ingredient Quantity Cell
    var prodCmpQty      = row.insertCell(2);
    //document.getElementById('recipeR' + newIndex + 'C2');
    prodCmpQty.innerHTML = '<table><th>Quantity</th>' + quantityStr + '</table>';

    // Ingredient TechLvl Cell
    var prodTechLvlBox  = row.insertCell(3);
    //document.getElementById('recipeR' + newIndex + 'C3');
    prodTechLvlBox.innerHTML = '<table><th>Tech Level</th>' + techLvlStr + '</table>';

    // Ingredient category cell
    var prodCatBox      = row.insertCell(4);
    //document.getElementById('recipeR' + newIndex + 'C4');
    prodCatBox.innerHTML = '<table><th>Category</th>' + catStr + '</table>';

    // Ingredient Type cell
    var prodHrlyPPBox   = row.insertCell(5);
    //document.getElementById('recipeR' + newIndex + 'C5');
    prodHrlyPPBox.innerHTML = '<table><th>Type</th>' + typeStr + '</table>';

    var buttons         = document.getElementById('recipeR' + index + 'C7');
    buttons.innerHTML = 
    '<button id="HideButton' + index + '" onclick="hideRecipe(this, ' + index + ', ' + id + ')">Hide</button>';
    //transform to hide button

    // blank
     //change expand button to hide, and replicate delete button.
    expanded.push(index);
}

function hideRecipe(that, index, id){

    var j;
    var expansionCounter=0;
    for (j=0; j<expanded.length; j++){
        if (index > expanded[j]){
            expansionCounter++;
        }
    }
    var newIndex=index+expansionCounter+2;

    var outerTable=document.getElementById('recipeTableX');
    var buttons= document.getElementById('recipeR' + index + 'C7');

    buttons.innerHTML += 
        '<button onclick="expandRecipe(this, ' + index + ', ' + id + ')">Expand</button>' + 
        '<button onclick="deleteRecipe(this, ' + id + ')">Delete</button>';

    outerTable.deleteRow(newIndex);

    var i;
    for (i=0; i<expanded.length; i++){
        if (expanded[i] == index){  // index matches expanded row.
            if (i + 1 < expanded.length){
            expanded.splice(i, i+1)     // splice out of expansion record.
            } else { expanded.pop();    // pop from expansion record.
            }
        }   // or ignore.
    } //end scan
    hideButton = document.getElementById('HideButton' + index);
    hideButton.parentNode.removeChild(hideButton);    
}

