---
layout: post
category : mongodb
tagline: "Storing Tree like Hierarchy Structures With MongoDB"
tags : [algorythms, mongodb, nosql, tree]
---
#Introduction
In a real life almost any project deals with the tree structures. Different kinds of taxonomies, site structures etc require modelling of hierarhy relations. In this article I will illustrate using first three of five typical approaches of operateting with hierarchy data on example of the MongoDB database. Those approaches are:





- Model Tree Structures with Child References
- Model Tree Structures with Parent References
- Model Tree Structures with an Array of Ancestors
- Model Tree Structures with Materialized Paths
- Model Tree Structures with Nested Sets




Note: article is inspired by another article 'Model Tree Structures in MongoDB' by 10gen, but does not copy it, but provides additional examples on typical operations with tree management. Please refer for 10gen's article to get more solid understanding of the approach.

#Background
As a demo dataset I use some fake eshop goods taxonomy.
![Tree](https://raw.github.com/Voronenko/Storing_TreeView_Structures_WithMongoDB/master/images/categories_small.png)


#Challenges to address
In a typical site scenario, we should be able



- Operate with tree (insert new node under specific parent, update/remove existing node, move node across the tree)
- Get path to node (for example, in order to be build the breadcrumb section)
- Get all node descendants (in order to be able, for example, to select goods from more general category, like 'Cell Phones and Accessories' which should include goods from all

On each of the examples below we:



- Add new node called 'LG' under electronics
- Move 'LG' node under Cell_Phones_And_Smartphones node
- Remove 'LG' node from the tree
- Get child nodes of Electronics node
- Get path to 'Nokia' node
- Get all descendants of the 'Cell_Phones_and_Accessories' node


Please refer to image above for visual representation.

#Tree structure with parent reference
This is most commonly used approach. For each node we store (ID, ParentReference, Order)
![](https://raw.github.com/Voronenko/Storing_TreeView_Structures_WithMongoDB/master/images/ParentReference.jpg)


##Operating with tree
 Pretty simple, but changing the position of the node withing siblings will require additional calculations.
You might want to set high numbers like item position * 10^6 for order in order to be able to set new node order as trunc (lower sibling order - higher sibling order)/2 - this will give you enough operations, until you will need to traverse whole the tree and set the order defaults to big numbers again

 ##Adding new node
Good points: requires only one insert operation  to introduce the node.

<pre><code class="javascript">
var existingelemscount = db.categoriesPCO.find({parent:'Electronics'}).count();
var neworder = (existingelemscount+1)*10;
db.categoriesPCO.insert({_id:'LG', parent:'Electronics', someadditionalattr:'test', order:neworder})
//{ "_id" : "LG", "parent" : "Electronics", "someadditionalattr" : "test", "order" : 40 }
</code></pre>


##Updating/moving the node
Good points: as during insert -  requires only one update operation to amend the node

<pre><code class="javascript">
existingelemscount = db.categoriesPCO.find({parent:'Cell_Phones_and_Smartphones'}).count();
neworder = (existingelemscount+1)*10;
db.categoriesPCO.update({_id:'LG'},{$set:{parent:'Cell_Phones_and_Smartphones', order:neworder}});
//{ "_id" : "LG", "order" : 60, "parent" : "Cell_Phones_and_Smartphones", "someadditionalattr" : "test" }
</code></pre>

##Node removal
Good points:  requires single operation to remove the node from tree

<pre><code class="javascript">
db.categoriesPCO.remove({_id:'LG'});
</code></pre>

##Getting node children, ordered
Good points: all childs can be retrieved from database and ordered using single call.

<pre><code class="javascript">
 db.categoriesPCO.find({$query:{parent:'Electronics'}, $orderby:{order:1}})
//{ "_id" : "Cameras_and_Photography", "parent" : "Electronics", "order" : 10 }
//{ "_id" : "Shop_Top_Products", "parent" : "Electronics", "order" : 20 }
//{ "_id" : "Cell_Phones_and_Accessories", "parent" : "Electronics", "order" : 30 }
</code></pre>

##Getting all node descendants
Bad points: unfortunately, requires recursive calls to database.

<pre><code class="javascript">
var descendants=[]
var stack=[];
var item = db.categoriesPCO.findOne({_id:"Cell_Phones_and_Accessories"});
stack.push(item);
while (stack.length>0){
    var currentnode = stack.pop();
    var children = db.categoriesPCO.find({parent:currentnode._id});
    while(true === children.hasNext()) {
        var child = children.next();
        descendants.push(child._id);
        stack.push(child);
    }
}


descendants.join(",")
//Cell_Phones_and_Smartphones,Headsets,Batteries,Cables_And_Adapters,Nokia,Samsung,Apple,HTC,Vyacheslav
</code></pre>

##Getting path to node
Bad points: unfortunately also require recursive operations to get the path.

<pre><code class="javascript">
var path=[]
var item = db.categoriesPCO.findOne({_id:"Nokia"})
while (item.parent !== null) {
    item=db.categoriesPCO.findOne({_id:item.parent});
    path.push(item._id);
}

path.reverse().join(' / ');
//Electronics / Cell_Phones_and_Accessories / Cell_Phones_and_Smartphones
</code></pre>

##Indexes
Recommended index is on fields parent and order

<pre><code class="javascript">
db.categoriesPCO.ensureIndex( { parent: 1, order:1 } )
</code></pre>

#Tree structure with childs reference
For each node we store (ID, ChildReferences).
![](https://raw.github.com/Voronenko/Storing_TreeView_Structures_WithMongoDB/master/images/ChildReference.jpg)


Please note, that in this case we do not need order field, because Childs collection
already provides this information. Most of languages respect the array order. If this is not in case for your language, you might consider additional coding to preserve order, however this will make things more complicated

##Adding new node
Note: requires one insert operation and one update operation to insert the node.

<pre><code class="javascript">
db.categoriesCRO.insert({_id:'LG', childs:[]});
db.categoriesCRO.update({_id:'Electronics'},{  $addToSet:{childs:'LG'}});
//{ "_id" : "Electronics", "childs" : [     "Cameras_and_Photography",     "Shop_Top_Products",     "Cell_Phones_and_Accessories",     "LG" ] }
</code></pre>

##Updating/moving the node
Requires single update operation to change node order within same parent, requires two update operations, if node is moved under another parent.

rearranging order under the same parent
<pre><code class="javascript">
db.categoriesCRO.update({_id:'Electronics'},{$set:{"childs.1":'LG',"childs.3":'Shop_Top_Products'}});
//{ "_id" : "Electronics", "childs" : [     "Cameras_and_Photography",     "LG",     "Cell_Phones_and_Accessories",     "Shop_Top_Products" ] }
moving the node

db.categoriesCRO.update({_id:'Cell_Phones_and_Smartphones'},{  $addToSet:{childs:'LG'}});
db.categoriesCRO.update({_id:'Electronics'},{$pull:{childs:'LG'}});
//{ "_id" : "Cell_Phones_and_Smartphones", "childs" : [ "Nokia", "Samsung", "Apple", "HTC", "Vyacheslav", "LG" ] }
</code></pre>

##Node removal
Node removal also requires two operations: one update and one remove.

<pre><code class="javascript">
db.categoriesCRO.update({_id:'Cell_Phones_and_Smartphones'},{$pull:{childs:'LG'}})
db.categoriesCRO.remove({_id:'LG'});
</code></pre>

##Getting node children, ordered
Bad points: requires additional client side sorting by parent array sequence. Depending on result set, it may affect speed of your code.

<pre><code class="javascript">
var parent = db.categoriesCRO.findOne({_id:'Electronics'})
db.categoriesCRO.find({_id:{$in:parent.childs}})
</code></pre>

Result set:

<pre><code class="javascript">
 { "_id" : "Cameras_and_Photography", "childs" : [     "Digital_Cameras",     "Camcorders",     "Lenses_and_Filters",     "Tripods_and_supports",     "Lighting_and_studio" ] }
{ "_id" : "Cell_Phones_and_Accessories", "childs" : [     "Cell_Phones_and_Smartphones",     "Headsets",     "Batteries",     "Cables_And_Adapters" ] }
{ "_id" : "Shop_Top_Products", "childs" : [ "IPad", "IPhone", "IPod", "Blackberry" ] }

//parent:
{
    "_id" : "Electronics",
    "childs" : [
        "Cameras_and_Photography",
        "Cell_Phones_and_Accessories",
        "Shop_Top_Products"
    ]
}
</code></pre>

As you see, we have ordered array childs, which can be used to sort the result set on a client

##Getting all node descendants
Note: also recursive operations, but we need less selects to databases comparing to previous approach

<pre><code class="javascript">
var descendants=[]
var stack=[];
var item = db.categoriesCRO.findOne({_id:"Cell_Phones_and_Accessories"});
stack.push(item);
while (stack.length>0){
    var currentnode = stack.pop();
    var children = db.categoriesCRO.find({_id:{$in:currentnode.childs}});

    while(true === children.hasNext()) {
        var child = children.next();
        descendants.push(child._id);
        if(child.childs.length>0){
          stack.push(child);
        }
    }
}

//Batteries,Cables_And_Adapters,Cell_Phones_and_Smartphones,Headsets,Apple,HTC,Nokia,Samsung
descendants.join(",")
</code></pre>

##Getting path to node
Path is calculated recursively, so we need to issue number of sequential calls to database.

<pre><code class="javascript">
var path=[]
var item = db.categoriesCRO.findOne({_id:"Nokia"})
while ((item=db.categoriesCRO.findOne({childs:item._id}))) {
    path.push(item._id);
}

path.reverse().join(' / ');
//Electronics / Cell_Phones_and_Accessories / Cell_Phones_and_Smartphones
</code></pre>

##Indexes
Recommended index is putting index on childs:

<pre><code class="javascript">
db.categoriesCRO.ensureIndex( { childs: 1 } )
</code></pre>

#Tree structure using an Array of Ancestors
For each node we store (ID, ParentReference, AncestorReferences)
![](https://raw.github.com/Voronenko/Storing_TreeView_Structures_WithMongoDB/master/images/AncestorReference.jpg)


##Adding new node
You need one insert operation to introduce new node, however you need to invoke select to prepare the data for insert

<pre><code class="javascript">
var ancestorpath = db.categoriesAAO.findOne({_id:'Electronics'}).ancestors;
ancestorpath.push('Electronics')
db.categoriesAAO.insert({_id:'LG', parent:'Electronics',ancestors:ancestorpath});
//{ "_id" : "LG", "parent" : "Electronics", "ancestors" : [ "Electronics" ] }
Updating/moving the node
moving the node requires one select and one update operation

ancestorpath = db.categoriesAAO.findOne({_id:'Cell_Phones_and_Smartphones'}).ancestors;
ancestorpath.push('Cell_Phones_and_Smartphones')
db.categoriesAAO.update({_id:'LG'},{$set:{parent:'Cell_Phones_and_Smartphones', ancestors:ancestorpath}});
//{ "_id" : "LG", "ancestors" : [     "Electronics",     "Cell_Phones_and_Accessories",     "Cell_Phones_and_Smartphones" ], "parent" : "Cell_Phones_and_Smartphones" }
</code></pre>

##Node removal
is done with single operation

<pre><code class="javascript">
db.categoriesAAO.remove({_id:'LG'});
</code></pre>

##Getting node children, unordered
 Note unless you introduce the order field, it is impossible to get ordered list of node children. You should consider another approach if you need order.

<pre><code class="javascript">
db.categoriesAAO.find({$query:{parent:'Electronics'}})
Getting all node descendants
there are two options to get all node descendants. One is classic through recursion:

var ancestors = db.categoriesAAO.find({ancestors:"Cell_Phones_and_Accessories"},{_id:1});
while(true === ancestors.hasNext()) {
       var elem = ancestors.next();
       descendants.push(elem._id);
   }
descendants.join(",")
//Cell_Phones_and_Smartphones,Headsets,Batteries,Cables_And_Adapters,Nokia,Samsung,Apple,HTC,Vyacheslav
</code></pre>

second is using aggregation framework introduced in MongoDB 2.2:

<pre><code class="javascript">
 var aggrancestors = db.categoriesAAO.aggregate([
    {$match:{ancestors:"Cell_Phones_and_Accessories"}},
    {$project:{_id:1}},
    {$group:{_id:{},ancestors:{$addToSet:"$_id"}}}
])

descendants = aggrancestors.result[0].ancestors
descendants.join(",")
//Vyacheslav,HTC,Samsung,Cables_And_Adapters,Batteries,Headsets,Apple,Nokia,Cell_Phones_and_Smartphones
</code></pre>

##Getting path to node
This operation is done with single call to database, which is advantage of this approach.

<pre><code class="javascript">
var path=[]
var item = db.categoriesAAO.findOne({_id:"Nokia"})
item
path=item.ancestors;
path.join(' / ');
//Electronics / Cell_Phones_and_Accessories / Cell_Phones_and_Smartphones
</code></pre>

##Indexes
Recommended index is putting index on ancestors

<pre><code class="javascript">
db.categoriesAAO.ensureIndex( { ancestors: 1 } )
</code></pre>

#Code in action
Code can be downloaded from repository  https://github.com/Voronenko/Storing_TreeView_Structures_WithMongoDB

All files are packaged according to the following naming convention:

MODELReference.js - initialization file with tree data for MODEL approach
MODELReference_operating.js - add/update/move/remove/get children examples
MODELReference_pathtonode.js - code illustrating how to obtain path to node
MODELReference_nodedescendants.js - code illustrating how to retrieve all the descendands of the node
All files are ready to use in mongo shell. You can run examples by invoking mongo < file_to_execute, or, if you want, interactively in the shell or with RockMongo web shell.

Points of Interest
 Please note, that MongoDB does not provide ACID transactions. This means, that for update operations splitted into separate update commands, your application should implement additional code to support your code specific transactions.

Formal advise from 10gen is following:

 The Parent Reference pattern provides a simple solution to tree storage, but requires multiple queries to retrieve subtrees
 The Child References pattern provides a suitable solution to tree storage as long as no operations on subtrees are necessary. This pattern may also provide a suitable solution for storing graphs where a node may have multiple parents.
 The Array of Ancestors pattern  - no specific advantages unless you constantly need to get path to the node
You are free to mix patterns (by introducing order field, etc) to match the data operations required to your application.