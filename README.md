
# Little Sisters of Serenity Database

# Based on architecture of CS340-Server-Side-Examples

Website Feature requirements:

Add entries to each entity table
	Items, a form at the top.
	Recipes, a form at the top.
	Blueprints, by way of the copy link on originals
	Factories, a form at the top

Select on each table
	Items table (filterable by type)
	Recipes table (filterable by type)
	Blueprints table
	Factories table

Search w/ text
	Blueprints -- search by any substring of a product name

Delete an entity record
	Recipes -- delete button
	Blueprints -- delete button on blueprint copies (not originals)

Update an entity record
	Blueprints -- update link leads to form where you can change the number of runs left

Add and remove things to/from a many-to-many relationship
	Recipes -- Add only: When creating a new recipe, you can add components
						  This adds to the partial CONSUMES M-to-N relationship
		* Incidentally, just for fun, I didn't add a constraint to creating a recipe for the dummy item "Nothing". You can create a recipe that will manufacture "Nothing", if you really want to destroy the universe.
.
	Factories -- Add:		Second form at the top
	Factories -- Remove:	After expanding 'Executing' tab, click on 'Stop This Job'
							 This removes the M-to-N relationship between the BPC and Factory.

Add things to all relationships
	As above