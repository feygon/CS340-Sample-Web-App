function expandFactory(index, id){
    var j;
    var expansionCounter=0;
    for (j=0; j<expanded.length; j++){
        if (index > expanded[j]){
            expansionCounter++;
        }
    }

    var outerTable=document.getElementById('factoryTableX');
    newIndex = index + 1 + expansionCounter;

    // make new row beneath expand button.
    var row = document.getElementById('factoryTableXBody').insertRow(newIndex);
    row.class="nestedRow";
    row.id="nestedRow" + index;
    row.hidden=false;

    var i;
    var jobs=0;
    var productStr = "";
    var stopJobStr = "";

    $.each(J_Fac, function(i, job){
        if (job.factory==id){
            productStr += '<tr><td class=nested>' + job.product + '</td></tr>';

        /*untested*/
            stopJobStr += '<tr><td class=nested>'
            + ' <form id="stopJob"' + index + ' action="/Serenity/StopJob" method="post"> '
            + ' <div> <input type="number" hidden="true" name="jobID"'
            + ' value="' + job.Job_id + '">'
            + ' <input type="submit" value="Stop This Job"> </div></form>'

            jobs++;
        }
    })
    if (jobs==0){productStr += '<tr><td class=nested>Nothing</td></tr>'}

    // product cell
    var prodNameBox = row.insertCell(0);
    var stopJobBox = row.insertCell(1);
    prodNameBox.innerHTML = '<table><th>Jobs</th>' + productStr + '</table>';
    stopJobBox.innerHTML = '<table><th>Foreman</th>' + stopJobStr + '</table>';

    var buttons       = document.getElementById("expandButtonR" + index);
    buttons.outerHTML = '<button id="hideButtonR' + index + '"'
    + ' onclick="hideFactory(' + index + ', ' + id + ')">Hide</button>';
    //transform to hide button

    expanded.push(index);
}

function hideFactory(index, id){

    var j;
    var expansionCounter=0;
    for (j=0; j<expanded.length; j++){
        if (index > expanded[j]){
            expansionCounter++;
        }
    }

    var outerTableBody=document.getElementById('factoryTableXBody');
    outerTableBody.removeChild(document.getElementById('nestedRow' + index));

    var button=document.getElementById("hideButtonR" + index);
    var buttonParent=button.parentNode;
    buttonParent.removeChild(button);
    var newButton = document.createElement("button");
    // buttonParent.appendChild(newButton);
    buttonParent.innerHTML =
        '<button id="expandButtonR' + index + '" type="button"'
        + ' onclick="expandFactory(' + index + ', ' + id + ')">Executing</button>';

    var i;
    for (i=0; i<expanded.length; i++){
        if (expanded[i] == index){  // index matches expanded row.
            if (i + 1 < expanded.length){
            expanded.splice(i, i+1)     // splice out of expansion record.
            } else { expanded.pop();    // pop from expansion record.
            }
        }   // or ignore.
    } //end scan
}

function stopJob(index, jobID){

    /*sql delete call to many-to-many table*/
    /*refresh the table and alert 'Stopping!'*/
}

function addRecipeComponent(){
	var table = document.getElementById("componentTable");

// make the row and 3 cells at the end of the table
    var row = table.insertRow(-1);
    var componentBox = row.insertCell(0);
    var quantityBox = row.insertCell(1);
    var deleteButtonBox = row.insertCell(2);
    row.hidden=false;

// id the row by auto-incrementing index
    row.id='inputRow' + addedRowCount;
// increment the counter input



    var scrp = "";
    // component input box
    //name = componentRow##count## -- needed in 'post'
    scrp += '<select name="selectComponentRow' + addedRowCount + '">';
    // brute-force populate the options for the above select input
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
// quantity input box
    quantityBox.innerHTML = '<input type="number" min="0" name="qtyRow'
                          + addedRowCount
                          + '">';   // name = componentQty### -- needed in 'post'
    deleteButtonBox.innerHTML='<input type="button" value="Delete"'
        + ' onclick="deleteRow(this)">';

    addedRowCount++;
    document.getElementById("counterInput").value = addedRowCount;
}

function deleteRow(that){

    var i;

    var btn = that;
    var row=btn.parentNode.parentNode;
    var rowparent=document.getElementById('componentBody');
    row.parentNode.removeChild(row);
    addedRowCount--;

    var tempRow;
    var tempElem;
    for (i=0; i<addedRowCount; i++){
        if (i==0){
            tempRow = rowparent.parentNode.firstElementChild;
            tempID = tempRow.id;
            tempRow.name='inputRow' + i;
            tempElem = tempRow.firstElementChild;
            tempElem.name='selectComponentRow' + i;
            tempElem.nextSibling.name='qtyRow' + i;

        } else {
            tempRow = tempRow.nextSibling;
            tempRow.name='inputRow' + i;
            tempElem = tempRow.firstElementChild;
            tempElem.name='selectComponentRow' + i;
            tempElem.nextSibling.name='qtyRow' + i;
        }
    }
}

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

