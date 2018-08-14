module.exports = function() {

    var express = require('express');
    var router = express.Router();

    // var templates = require('./templates.js');

    // function addRecipeComponentBox(){
    //     return Handlebars.compile('<select name="componentID" value="componentID">{{#each context.nothing}}<option value={{ItemID}}>{{ItemName}}</option>{{/each}}{{#each context.items}}<option value={{ItemID}}>{{ItemName}}</option>{{/each}}</select>)');
    // };

    function getItems(res, mysql, context, complete, by){
        var sql;
        switch(by){
            case undefined:
                sql = "SELECT it.item_id as ItemID, it.item_name as ItemName, it.type as Type, it.category as Category, it.vol as Volume, it.refinement as TechLevel FROM EvE_Items as it WHERE it.item_name <> \"Nothing\" ORDER BY ItemName";
                break;
            case "Type":
                sql = "SELECT it.item_id as ItemID, it.item_name as ItemName, it.type as Type, it.category as Category, it.vol as Volume, it.refinement as TechLevel FROM EvE_Items as it WHERE it.item_name <> \"Nothing\" ORDER BY Type, Refinement, ItemName";
                break;
            case "Blueprint":
                sql = "SELECT it.item_id as ItemID, it.item_name as ItemName, it.type as Type, it.category as Category, it.vol as Volume, it.refinement as TechLevel FROM EvE_Items as it WHERE Type = \"Manufactured\" ORDER BY Refinement DESC, ItemName";
                break;
            case "Farm":
                sql = "SELECT it.item_id as ItemID, it.item_name as ItemName, it.type as Type, it.category as Category, it.vol as Volume, it.refinement as TechLevel FROM EvE_Items as it WHERE Type = \"Farm\" AND  it.item_name <> \"Nothing\" ORDER BY Refinement, ItemName";
                break;
            case "noRecipe":
                sql = "SELECT it.item_id as ItemID, it.item_name as ItemName, rec.recipe_id as hasRecipe FROM EvE_Items as it LEFT JOIN EvE_Recipes as rec ON rec.product=it.item_id WHERE recipe_id IS NULL AND (it.type=\"farm\" OR it.type=\"manufactured\") ORDER BY ItemName";
                break;
            case "nothing":
                sql = "SELECT it.item_id as ItemID, it.item_name as ItemName FROM EvE_Items as it WHERE item_name=\"Nothing\"";
                break;
        }
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }

            switch(by){
                case "noRecipe":
                    context.noRecipeItems=results;
                    break;
                case "nothing":
                    context.nothing=results;
                    break;
                default:
                case undefined:
                    context.items = results;
                    break;
            }
            complete();
        });
    }

    function getRecipes(res, mysql, context, complete, by){
        var sql = "";
        switch(by){
            case "Manufactured":
                sql += 'SELECT rec.recipe_id AS RecipeID, it.item_name as ItemName,'
                    + ' COUNT(cmp.component_ID) AS QtyCmp, it.type as Type, it.category as Category,'
                    + ' it.refinement as TechLevel, hourly_prodpp, hourly_growth '
                    + ' FROM EvE_Recipes AS rec JOIN EvE_Items AS it ON rec.product=it.item_id '
                    + ' JOIN EvE_Comp_Amt AS cmp ON cmp.CL_recipe_ID=rec.recipe_id '
                    + 'WHERE it.type="manufactured" '
                    + 'GROUP BY rec.product '
                    + 'ORDER BY it.item_name';
                break;
            case "Farm":
                sql += 'SELECT rec.recipe_id AS RecipeID, it.item_name as ItemName,'
                    + ' COUNT(cmp.component_ID) AS QtyCmp, it.type as Type, it.category as Category,'
                    + ' it.refinement as TechLevel, hourly_prodpp, hourly_growth '
                    + ' FROM EvE_Recipes AS rec JOIN EvE_Items AS it ON rec.product=it.item_id '
                    + ' JOIN EvE_Comp_Amt AS cmp ON cmp.CL_recipe_ID=rec.recipe_id '
                    + 'WHERE it.type="farm" '
                    + 'GROUP BY rec.product '
                    + 'ORDER BY it.item_name';
                break;
            default:
            case undefined:
                sql += "SELECT rec.recipe_id AS RecipeID, it.item_name as ItemName,"
                    + " COUNT(cmp.component_ID) AS QtyCmp, it.type as Type, it.category as Category,"
                    + " it.refinement as TechLevel, hourly_prodpp, hourly_growth "
                    + " FROM EvE_Recipes AS rec JOIN EvE_Items AS it ON rec.product=it.item_id "
                    + " JOIN EvE_Comp_Amt AS cmp ON cmp.CL_recipe_ID=rec.recipe_id " 
                    + " GROUP BY rec.product"
                    + " ORDER BY it.item_name";
                break;
        }
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            var J_results = JSON.stringify(results);
            switch(by){
                case "Farm":
                    context.recipes = results;
                    context.J_recipes = J_results;
                    break;
                case "Manufactured":
                    context.recipes = results;
                    context.J_recipes = J_results;
                    break;
                default:
                case undefined:
                    context.recipes = results;
                    context.J_recipes = J_results;
                    break;
            }
            complete();
        });
    }

    // function getBPs(res, mysql, context, complete, by){
    //     var sql = "";            
    //     switch(by){
    //         default:
    //         case undefined:
    //             sql += /*query*/;
    //             break;
    //     }

    //     mysql.pool.query(sql, function(error, results, fields){
    //         if(error){
    //             res.write(JSON.stringify(error));
    //             res.end();
    //         }
    //         var J_results = JSON.stringify(results);
    //         switch(by){
    //             case "x":
    //                 context.x = results;
    //                 break;
    //             case "y":
    //                 context.y = results;
    //                 break;
    //             default:
    //             case undefined:
    //                 context.components = results;
    //                 context.J_components = J_results;
    //                 break;
    //         }
    //         complete();
    //     });
    // }


    function getComponentLists(res, mysql, context, complete, by){
        var sql = "";            
        switch(by){
            default:
            case undefined:
                sql += 'SELECT ' + 
                    ' prod.item_id as productID,' +
                    ' rec.recipe_id as recipeID,' +
                    ' prod.item_name as productName,' + 
                    ' cmp.qty as cmpQty,' +
                    ' it.item_id as cmpID,' +
                    ' it.item_name as cmpName,' +
                    ' it.type as cmpType,' +
                    ' it.category as cmpCategory,' +
                    ' it.vol as cmpVol,' +
                    ' it.refinement as cmpTechLevel ' +
                    'FROM EvE_Comp_Amt as cmp ' +
                    'JOIN EvE_Recipes as rec ON cmp.CL_recipe_ID=rec.recipe_id ' +
                    'JOIN EvE_Items as prod ON rec.product=prod.item_id ' +
                    'JOIN EvE_Items as it ON cmp.component_ID=it.item_id ' +
                    'ORDER BY prod.item_name, it.item_name';
                break;
        }

        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            var J_results = JSON.stringify(results);
            switch(by){
                case "x":
                    context.x = results;
                    break;
                case "y":
                    context.y = results;
                    break;
                default:
                case undefined:
                    context.components = results;
                    context.J_components = J_results;
                    break;
            }
            complete();
        });
    }


    /*Display all items. Requires web based javascript to delete users with AJAX*/
    /*or write an intro screen.*/
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        //context.jsscripts = ["deleteperson.js"];
        var mysql = req.app.get('mysql');
        getItems(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('Items', context);
            }
        }
    });

   
    router.get('/item/:by', function(req, res){
        callbackCount = 0;
        var context = {};
        //context.jsscripts = ["selectedplanet.js", "updateperson.js"];
        var mysql = req.app.get('mysql');
        getItems(res, mysql, context, complete, req.params.by);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('Items', context);
            }
        }
    });

    // in case they just delete the suffix to return to items
    router.get('/item/', function(req,res){
        res.redirect('/serenity');
    });

    router.get('/recipe/',function(req,res){
        callbackCount=0;
        var context={};
        context.jsscripts = ["recipes.js", "helpers.js"];
//      context.hb=handlebars;
        var mysql=req.app.get('mysql');
        getRecipes(res, mysql, context, complete);
        getItems(res, mysql, context, complete, "noRecipe");
        getItems(res, mysql, context, complete)
        getItems(res, mysql, context, complete, "nothing");
        getComponentLists(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if (callbackCount >= 5){
//              console.log(context);
                res.render('Recipes', context);
            }
        }
    });

    router.get('/recipe/:by',function(req,res){
        callbackCount=0;
        var context={};
        context.jsscripts = ["recipes.js", "helpers.js"];
        var mysql=req.app.get('mysql');

        getRecipes(res, mysql, context, complete, req.params.by);
        getItems(res, mysql, context, complete, "noRecipe");
        getItems(res, mysql, context, complete)
        getItems(res, mysql, context, complete, "nothing");
        getComponentLists(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if (callbackCount >= 5){
                res.render('Recipes', context);
            }
        }
    });

    //     router.get('/factory/',function(req,res){
    //         callbackCount=0;
    //         var context={};
    //         context.jsscripts = ["recipes.js", "helpers.js"];
    //         var mysql=req.app.get('mysql');
    //         getRecipes(res, mysql, context, complete);
    //         getItems(res, mysql, context, complete, "noRecipe");
    //         getItems(res, mysql, context, complete)
    //         getItems(res, mysql, context, complete, "nothing");
    //         function complete(){
    //             callbackCount++;
    //             if (callbackCount >= 4){
    //                 res.render('Recipes', context);
    //             }
    //         }
    // });

    /* Display one person for the specific purpose of updating people */

    /* Adds a person, redirects to the people page after adding */

    // router.post('/', function(req, res){
    //     var mysql = req.app.get('mysql');
    //     var sql = "INSERT INTO bsg_people (fname, lname, homeworld, age) VALUES (?,?,?,?)";
    //     var inserts = [req.body.fname, req.body.lname, req.body.homeworld, req.body.age];
    //     sql = mysql.pool.query(sql,inserts,function(error, results, fields){
    //         if(error){
    //             res.write(JSON.stringify(error));
    //             res.end();
    //         }else{
    //             res.redirect('/serenity');
    //         }
    //     });
    // });

    /* The URI that update data is sent to in order to update a person */

    // router.put('/:id', function(req, res){
    //     var mysql = req.app.get('mysql');
    //     var sql = "UPDATE bsg_people SET fname=?, lname=?, homeworld=?, age=? WHERE id=?";
    //     var inserts = [req.body.fname, req.body.lname, req.body.homeworld, req.body.age, req.params.id];
    //     sql = mysql.pool.query(sql,inserts,function(error, results, fields){
    //         if(error){
    //             res.write(JSON.stringify(error));
    //             res.end();
    //         }else{
    //             res.status(200);
    //             res.end();
    //         }
    //     });
    // });

    /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */

    // router.delete('/:id', function(req, res){
    //     var mysql = req.app.get('mysql');
    //     var sql = "DELETE FROM bsg_people WHERE id = ?";
    //     var inserts = [req.params.id];
    //     sql = mysql.pool.query(sql, inserts, function(error, results, fields){
    //         if(error){
    //             res.write(JSON.stringify(error));
    //             res.status(400);
    //             res.end();
    //         }else{
    //             res.status(202).end();
    //         }
    //     })
    // })
    return router;
}();