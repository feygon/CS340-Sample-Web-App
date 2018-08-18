/*jslint node:true */
/*jslint undef: true*/

module.exports = (function () {

    var express = require('express'),
        router = express.Router();

    // var templates = require('./templates.js');

    // function addRecipeComponentBox(){
    //     return Handlebars.compile('<select name="componentID" value="componentID">{{#each context.nothing}}<option value={{ItemID}}>{{ItemName}}</option>{{/each}}{{#each context.items}}<option value={{ItemID}}>{{ItemName}}</option>{{/each}}</select>)');
    // };

    function getItems(res, mysql, context, complete, by) {
        var sql;
        switch (by) {
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
        mysql.pool.query(sql, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }

            switch (by) {
            case "noRecipe":
                context.noRecipeItems = results;
                break;
            case "nothing":
                context.nothing = results;
                break;
            case undefined:
                context.items = results;
                break;
            }
            complete();
        });
    }

    function getRecipes(res, mysql, context, complete, by) {
        var sql = "";
        switch (by) {
        case "Manufactured":
            sql += 'SELECT rec.recipe_id AS RecipeID, it.item_name as ItemName,'
                + ' COUNT(cmp.component_ID) AS QtyCmp, it.type as Type, it.category as Category,'
                + ' it.refinement as TechLevel, hourly_prodpp, hourly_growth '
                + ' FROM EvE_Recipes AS rec JOIN EvE_Items AS it ON rec.product=it.item_id '
                + ' JOIN EvE_Comp_Amt AS cmp ON cmp.CL_recipe_ID=rec.recipe_id '
                + ' JOIN EvE_Items as ingredient ON cmp.component_ID=ingredient.item_id '
                + ' WHERE it.type="manufactured" AND ingredient.item_name != "Nothing" '
                + ' GROUP BY rec.product '
                + ' UNION (SELECT '
                + '        rec.recipe_id as RecipeID, '
                + '        prod.item_name as ItemName, '
                + '        0, '
                + '        prod.type as Type, '
                + '        prod.category as Category, '
                + '        prod.refinement as TechLevel, '
                + '        hourly_prodpp, hourly_growth '
                + '        FROM EvE_Recipes AS rec '
                + '        JOIN EvE_Items AS prod ON rec.product=prod.item_id '
                + '        JOIN EvE_Comp_Amt as cmp ON cmp.CL_recipe_ID=rec.recipe_id '
                + '        JOIN EvE_Items as ingredient ON cmp.component_ID=ingredient.item_id '
                + '        WHERE prod.type="farm" AND ingredient.item_name="Nothing" '
                + '        GROUP BY rec.product) '
                + ' ORDER BY ItemName';
            break;
        case "Farm":
            sql += 'SELECT rec.recipe_id AS RecipeID, it.item_name as ItemName,'
                + ' COUNT(cmp.component_ID) AS QtyCmp, it.type as Type, it.category as Category,'
                + ' it.refinement as TechLevel, hourly_prodpp, hourly_growth '
                + ' FROM EvE_Recipes AS rec JOIN EvE_Items AS it ON rec.product=it.item_id '
                + ' JOIN EvE_Comp_Amt AS cmp ON cmp.CL_recipe_ID=rec.recipe_id '
                + ' JOIN EvE_Items as ingredient ON cmp.component_ID=ingredient.item_id '
                + ' WHERE it.type="farm" AND ingredient.item_name != "Nothing"'
                + 'GROUP BY rec.product '
                + ' UNION (SELECT rec.recipe_id as RecipeID, prod.item_name as ItemName, '
                + '        0, '
                + '        prod.type as Type, '
                + '        prod.category as Category, '
                + '        prod.refinement as TechLevel, '
                + '        hourly_prodpp, hourly_growth '
                + '        FROM EvE_Recipes AS rec '
                + '        JOIN EvE_Items AS prod ON rec.product=prod.item_id '
                + '        JOIN EvE_Comp_Amt as cmp ON cmp.CL_recipe_ID=rec.recipe_id '
                + '        JOIN EvE_Items as ingredient ON cmp.component_ID=ingredient.item_id '
                + '        WHERE prod.type="farm" AND ingredient.item_name="Nothing" '
                + '        GROUP BY rec.product) '
                + ' ORDER BY TechLevel, ItemName';
            break;
        case undefined:
            sql += 'SELECT rec.recipe_id AS RecipeID, it.item_name as ItemName,'
                + ' COUNT(cmp.component_ID) AS QtyCmp, it.type as Type, it.category as Category,'
                + ' it.refinement as TechLevel, hourly_prodpp, hourly_growth '
                + ' FROM EvE_Recipes AS rec '
                + ' JOIN EvE_Items AS it ON rec.product=it.item_id '
                + ' JOIN EvE_Comp_Amt AS cmp ON cmp.CL_recipe_ID=rec.recipe_id '
                + ' JOIN EvE_Items as ingredient ON cmp.component_ID=ingredient.item_id'
                + ' WHERE ingredient.item_name != "Nothing"'
                + ' GROUP BY rec.product'
                + ' UNION (SELECT rec.recipe_id as RecipeID, prod.item_name as ItemName, '
                + '        0, '
                + '        prod.type as Type, '
                + '        prod.category as Category, '
                + '        prod.refinement as TechLevel, '
                + '        hourly_prodpp, hourly_growth '
                + '        FROM EvE_Recipes AS rec '
                + '        JOIN EvE_Items AS prod ON rec.product=prod.item_id '
                + '        JOIN EvE_Comp_Amt as cmp ON cmp.CL_recipe_ID=rec.recipe_id '
                + '        JOIN EvE_Items as ingredient ON cmp.component_ID=ingredient.item_id '
                + '        WHERE prod.type="farm" AND ingredient.item_name="Nothing" '
                + '        GROUP BY rec.product) '
                + ' ORDER BY ItemName';
            break;
        }
        mysql.pool.query(sql, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            var J_results = JSON.stringify(results);
            switch (by) {
            case "Farm":
                context.recipes = results;
                context.J_recipes = J_results;
                break;
            case "Manufactured":
                context.recipes = results;
                context.J_recipes = J_results;
                break;
            case undefined:
                context.recipes = results;
                context.J_recipes = J_results;
                break;
            }
            complete();
        });
    }

    function getComponentLists(res, mysql, context, complete, by) {
        var sql = "";
        switch (by) {
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
                ' FROM EvE_Comp_Amt as cmp ' +
                ' JOIN EvE_Recipes as rec ON cmp.CL_recipe_ID=rec.recipe_id ' +
                ' JOIN EvE_Items as prod ON rec.product=prod.item_id ' +
                ' JOIN EvE_Items as it ON cmp.component_ID=it.item_id ' +
                ' ORDER BY prod.item_name, it.item_name';
            break;
        }

        mysql.pool.query(sql, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            var J_results = JSON.stringify(results);
            switch (by) {
            case "x":
                context.x = results;
                break;
            case "y":
                context.y = results;
                break;
            case undefined:
                context.components = results;
                context.J_components = J_results;
                break;
            }
            complete();
        });
    }

    function getBPs(res, mysql, context, complete, by, id) {
        var sql = "";
        switch (by) {
        case "BPC":
            sql += ' SELECT BPs.BP_id, '
                + '     prod.item_id as prod_id, '
                + '     prod.item_name as item_name, '
                + '     limitedqq'
                + '     runs_left, '
                + '     rec.hourly_prodpp, '
                + '     BPs.recipe '
                + '     FROM EvE_Blueprints as BPs '
                + '     JOIN EvE_Recipes as rec ON BPs.recipe=rec.recipe_id '
                + '     JOIN EvE_Items as prod ON rec.product=prod.item_id '
                + '     WHERE limitedqq="1" ';
            if (id !== undefined) {       // accommodate id parameter
                sql += 'AND BP_ID = "' + id + '"';
            }
            sql += '    ORDER BY limitedqq, item_name ';
            break;

        case "BPCsearch":
            sql += ' SELECT BPs.BP_id, '
                + '         prod.item_id as prod_id, '
                + '         prod.item_name as item_name, '
                + '         limitedqq, '
                + '         runs_left, '
                + '         rec.hourly_prodpp, '
                + '         BPs.recipe '
                + '     FROM EvE_Blueprints as BPs '
                + '     JOIN EvE_Recipes as rec ON BPs.recipe=rec.recipe_id '
                + '     JOIN EvE_Items as prod ON rec.product=prod.item_id '
                + '     WHERE limitedqq="1" ';
            if (id !== undefined) {       // accommodate item_name parameter
                sql += 'AND item_name LIKE "%' + id + '%"';
            }
            sql += '    ORDER BY limitedqq, item_name ';
            break;

        case "BPO":
            sql += ' SELECT BPs.BP_id, '
                + '     prod.item_id as prod_id, '
                + '     prod.item_name as item_name, '
                + '     limitedqq, '
                + '     runs_left, '
                + '     rec.hourly_prodpp, '
                + '     BPs.recipe '
                + '     FROM EvE_Blueprints as BPs '
                + '     JOIN EvE_Recipes as rec ON BPs.recipe=rec.recipe_id '
                + '     JOIN EvE_Items as prod ON rec.product=prod.item_id '
                + '     WHERE limitedqq = "0" ';
            if (id !== undefined) {       // accommodate id parameter
                sql += 'AND BP_ID = "' + id + '"';
            }
            sql += '    ORDER BY limitedqq, item_name ';
            break;

        case undefined:
            sql += ' SELECT BPs.BP_id, '
                + '         prod.item_id as prod_id, '
                + '         prod.item_name as item_name, '
                + '         limitedqq, '
                + '         runs_left, '
                + '         rec.hourly_prodpp, '
                + '         BPs.recipe '
                + '     FROM EvE_Blueprints as BPs '
                + '     JOIN EvE_Recipes as rec ON BPs.recipe=rec.recipe_id '
                + '     JOIN EvE_Items as prod ON rec.product=prod.item_id '
                + '     ORDER BY limitedqq, item_name ';
            break;
        }

        mysql.pool.query(sql, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            var J_results = JSON.stringify(results); // client-side resources
            switch (by) {
            case "BPC":
                context.BPC = results;
                context.J_BPC = J_results;
                break;
            case "BPO":
                context.BPO = results;
                context.J_BPO = J_results;
                break;
            case undefined:
                context.BP = results;
                context.J_BP = J_results;
                break;
            }
            complete();
        });
    }

    function getFactories(res, mysql, context, complete, by) {
        var sql = "";

        switch (by) {
        case "executes":
            sql += 'SELECT'
                + '     Job_id, '
                + '     exec.blueprint as BP, '
                + '     exec.factory as factory, '
                + '     it.item_name as product, '
                + '     fac.factory_name '
                + '     FROM EvE_Factory_Executes_BP as exec '
                + '     JOIN EvE_Factories as fac ON fac.factory_id=exec.factory '
                + '     JOIN EvE_Blueprints as BPs on BPs.BP_id=exec.blueprint '
                + '     JOIN EvE_Recipes as rec on rec.recipe_id=BPs.recipe '
                + '     JOIN EvE_Items as it on it.item_id=rec.product '
                + '     ORDER BY factory, product;';
            break;
        case undefined:
            sql += ' SELECT '
                + '     fac.factory_id as facID, '
                + '     fac.factory_name as facName, '
                + '     capacity, '
                + '     delay '
                + '     FROM EvE_Factories as fac;';
            break;
        }

        mysql.pool.query(sql, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            var J_results = JSON.stringify(results); // client-side resources
            switch (by) {
            case "executes":
            // console.log("Executes results: " + J_results);
                context.executes = results;
                context.J_executes = J_results;
                break;
            case undefined:
            // console.log("Factories results: " + J_results);
                context.Factories = results;
                context.J_Factories = J_results;
                break;
            }
            complete();
        });
    }

    /*Display all items. Requires web based javascript to delete users with AJAX*/
    /*or write an intro screen.*/
    router.get('/', function (req, res) {
        var callbackCount = 0,
            context = {},
            mysql = req.app.get('mysql');
        //context.jsscripts = ["deleteperson.js"];
        getItems(res, mysql, context, complete);
        function complete() {
            callbackCount += 1;
            if (callbackCount >= 1) {
                res.render('Items', context);
            }
        }
    });

    router.get('/factory/', function (req, res) {
        callbackCount = 0;
        var context = {},
            mysql = req.app.get('mysql');
        context.jsscripts = ["recipes.js", "helpers.js"];
        getFactories(res, mysql, context, complete);
        getFactories(res, mysql, context, complete, "executes");
        getBPs(res, mysql, context, complete, "BPC");
        function complete() {
            callbackCount += 1;
            if (callbackCount >= 3) {
                res.render('Factories', context);
            }
        }
    });
   
    router.get('/item/:by', function (req, res) {
        callbackCount = 0;
        var context = {},
            mysql = req.app.get('mysql');
        //context.jsscripts = ["selectedplanet.js", "updateperson.js"];
        getItems(res, mysql, context, complete, req.params.by);
        function complete() {
            callbackCount += 1;
            if (callbackCount >= 1) {
                res.render('Items', context);
            }
        }
    });

    // in case they just delete the suffix to return to items
    router.get('/item/', function (req, res) {
        res.redirect('/serenity');
    });

    router.get('/recipe/', function (req, res) {
        callbackCount = 0;
        var context = {},
            mysql = req.app.get('mysql');
        context.jsscripts = ["recipes.js", "helpers.js"];
//      context.hb=handlebars;
        getRecipes(res, mysql, context, complete);
        getItems(res, mysql, context, complete, "noRecipe");
        getItems(res, mysql, context, complete);
        getItems(res, mysql, context, complete, "nothing");
        getComponentLists(res, mysql, context, complete);
        function complete() {
            callbackCount += 1;
            if (callbackCount >= 5) {
//              console.log(context);
                res.render('Recipes', context);
            }
        }
    });

    router.get('/recipe/:by', function (req, res) {
        callbackCount = 0;
        var context = {},
            mysql = req.app.get('mysql');
        context.jsscripts = ["recipes.js", "helpers.js"];

        getRecipes(res, mysql, context, complete, req.params.by);
        getItems(res, mysql, context, complete, "noRecipe");
        getItems(res, mysql, context, complete);
        getItems(res, mysql, context, complete, "nothing");
        getComponentLists(res, mysql, context, complete);
        function complete() {
            callbackCount += 1;
            if (callbackCount >= 5) {
                res.render('Recipes', context);
            }
        }
    });

    router.get('/BP/', function (req, res) {
        callbackCount = 0;
        var context = {},
            mysql = req.app.get('mysql');
        context.jsscripts = ["recipes.js", "helpers.js"];

        getBPs(res, mysql, context, complete);
        getBPs(res, mysql, context, complete, "BPO");
        // getRecipes(res, mysql, context, complete);
        // getItems(res, mysql, context, complete, "noRecipe");
        // getItems(res, mysql, context, complete)
        // getItems(res, mysql, context, complete, "nothing");
        // getComponentLists(res, mysql, context, complete);

        function complete() {
            callbackCount += 1;
            if (callbackCount >= 2) {
//              console.log(context);
                res.render('blueprints', context);
            }
        }
    });

    router.get('/BP/:update', function (req, res) {
        callbackCount = 0;
        var context = {},
            mysql = req.app.get('mysql');
        context.jsscripts = ["helpers.js"];
        getBPs(res, mysql, context, complete, "BPC", req.params.update);
        function complete() {
            callbackCount += 1;
            if (callbackCount >= 1) {
                res.render('update-BPC', context);
            }
        }
    });

    router.post('/addItem/', function (req, res) {
        console.log(req.body);
        var mysql = req.app.get('mysql'),
            sql = 'INSERT INTO EvE_Items (item_name, type, category, vol, refinement) VALUES '
                + '                      (?,         ?,    ?,        ?,   ?) ',
        //INSERT INTO `EvE_Items`  (item_name, type, category, vol, refinement)
        //  VALUES ("Aqueous Liquids", "farm", "Unprocessed", 0.01, 0);
            inserts = [req.body.itemName,
                        req.body.itemType,
                        req.body.category,
                        req.body.itemVol,
                        req.body.itemRefinement];

        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/Serenity/');
            }
        });
    });

    router.post('/updateBPC/:id', function (req, res) {
        var mysql = req.app.get('mysql'),
            sql = "UPDATE EvE_Blueprints SET runs_left=? WHERE BP_id=?",
            inserts = [req.body.new_runs_left, req.params.id];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/Serenity/BP');
            }
        });
    });

    /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */

    router.get('/BPO-Copy/:id', function (req, res) {
        callbackCount = 0;
        var context = {},
            mysql = req.app.get('mysql');
        context.jsscripts = ["helpers.js"];
        getBPs(res, mysql, context, complete, "BPO", req.params.id);
        function complete() {
            callbackCount += 1;
            if (callbackCount >= 1) {
                res.render('BPO-Copy', context);
            }
        }
    });

    router.get('/SearchBPC/', function (req, res) {
        callbackCount = 0;
        var context = {},
            mysql = req.app.get('mysql');
        context.jsscripts = ["recipes.js", "helpers.js"];
        getBPs(res, mysql, context, complete, "BPCsearch", req.query.q);
        function complete() {
            callbackCount += 1;
            if (callbackCount >= 1) {
                res.render('blueprints', context);
            }
        }
    });

    router.post('/MakeCopy/:recipe', function (req, res) {

        var mysql = req.app.get('mysql'),
            sql = ' INSERT INTO EvE_Blueprints (recipe, limitedqq, runs_left)'
                + '     VALUES (?, ?, ?)',
            inserts = [req.params.recipe, "1", req.body.new_runs_left];

        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/Serenity/BP');
            }
        });
    });

    router.post('/StopJob/', function (req, res) {
        var mysql = req.app.get('mysql'),
            sql = 'DELETE FROM EvE_Factory_Executes_BP WHERE Job_id=?;',
            inserts = [req.body.jobID];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {

                console.log(sql);
                console.log("-------------------");
                console.log(error);
                console.log("-------------------");
                console.log("Error 1.");

                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/Serenity/Factory');
            }
        });
    });

    router.post('/addFactory/', function (req, res) {
        var mysql = req.app.get('mysql'),
            sql = 'INSERT INTO EvE_Factories(factory_name, capacity, delay) '
                + '     VALUES (?, ?, ?);',
            inserts = [req.body.factoryName,
                       req.body.factoryCapacity,
                       req.body.factoryDelayPP];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {

                console.log(sql);
                console.log("-------------------");
                console.log(error);
                console.log("-------------------");
                console.log("Error 1.");

                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/Serenity/Factory');
            }
        });
    });

    router.post('/addJob/', function (req, res) {
        var mysql = req.app.get('mysql'),
            sql = 'INSERT INTO EvE_Factory_Executes_BP(blueprint,factory) '
                + '     VALUES (?,?);',
            inserts = [req.body.whichBPC, req.body.whichFactory];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {

                console.log(sql);
                console.log("-------------------");
                console.log(error);
                console.log("-------------------");
                console.log("Error 1.");

                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/Serenity/Factory');
            }
        });
    });

    router.post('/addRecipe/', function (req, res) {

        var done = 0,
            mysql = req.app.get('mysql'),
            i,

            sql = ' INSERT INTO EvE_Recipes (product, hourly_prodpp, hourly_growth) VALUES '
                + '                         (?,       ?,             ?); ',
            inserts = [req.body.productID, req.body.hourly_prodpp, req.body.hourly_growth];

        if (req.body.addedRows === 0) {
            sql += 'INSERT INTO EvE_Comp_Amt (CL_recipe_ID, component_ID, qty) VALUES ( '
                +  '    (SELECT recipe_id FROM EvE_Recipes'
                +  '        WHERE product = "' + req.body.productID + '"), '
                +  '            (SELECT item_id FROM EvE_Items '
                +  '                WHERE item_name =            "Nothing "),  "0"); ';
        }
        for (i = 0; i < req.body.addedRows; i++) {
            sql += 'INSERT INTO EvE_Comp_Amt (CL_recipe_ID, component_ID, qty) VALUES ('
                +  '        (SELECT recipe_id FROM EvE_Recipes as rec '
                +  '            WHERE rec.product=\'' + req.body.productID +  '\''
                +  '                          ),             ?,            ?); ';
        }

        for (i = 0; i < req.body.addedRows; i++) {
            inserts.push(req.body['selectComponentRow' + i]);
            inserts.push(req.body['qtyRow' + i]);
        }

        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {

                console.log(sql);
                console.log("-------------------");
                console.log(error);

                console.log("-------------------");
                console.log("Error 1.");

                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/Serenity/Recipe');
            }
        });

    });

    return router;
}());
