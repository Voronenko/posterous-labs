---
layout: post
category : mongodb
tagline: "Storing Tree like Hierarchy Structures With MongoDB, Part 2"
tags : [algorythms, mongodb, nosql, tree]
---

#Introduction


In a real life almost any project deals with the tree structures. Different kinds of taxonomies, site structures etc require modelling of hierarchy relations. In this article I will illustrate using last two of five typical approaches of operating with hierarchy data on example of the MongoDB database. Please refer to fist article from the series to read about first three ones.  Those approaches are:

-Model Tree Structures with Child References

-Model Tree Structures with Parent References

-Model Tree Structures with an Array of Ancestors

-Model Tree Structures with Materialized Paths

-Model Tree Structures with Nested Sets

Note: article is inspired by another article 'Model Tree Structures in MongoDB' by 10gen, but does not copy it, but provides additional examples on typical operations with tree management. Please refer for 10gen's article to get more solid understanding of the approach.



#Background
As a demo dataset I use some fake eshop goods taxonomy.



##Challenges to address
In a typical site scenario, we should be able to

Operate with tree (insert new node under specific parent, update/remove existing node, move node across the tree)
Get path to node (for example, in order to be build the breadcrumb section)
Get all node descendants (in order to be able, for example, to select goods from more general category, like 'Cell Phones and Accessories' which should include goods from all subcategories.
On each of the examples below we:

Add new node called 'LG' under electronics
Move 'LG' node under Cell_Phones_And_Smartphones node
Remove 'LG' node from the tree
Get child nodes of Electronics node
Get path to 'Nokia' node
Get all descendants of the 'Cell_Phones_and_Accessories' node


Please refer to image above for visual representation.

#Tree structure using Materialized Path
For each node we store (ID, PathToNode)



Approach looks similar to storing array of ancestors, but we store a path in form of string instead. In example above I intentionally use comma(,) as a path elements divider in order to keep regular expression simpler.

##Adding new node
New node  insertion is done with one select and one insert operation

<pre><code class="javascript">
var ancestorpath = db.categoriesMP.findOne({_id:'Electronics'}).path;
ancestorpath += 'Electronics,'
db.categoriesMP.insert({_id:'LG', path:ancestorpath});
//{ "_id" : "LG", "path" : "Electronics," }
</code></pre>





##Updating/moving the node
Node can be moved using one select and one update operation

<pre><code class="javascript">
ancestorpath = db.categoriesMP.findOne({_id:'Cell_Phones_and_Smartphones'}).path;
ancestorpath +='Cell_Phones_and_Smartphones,'
db.categoriesMP.update({_id:'LG'},{$set:{path:ancestorpath}});
//{ "_id" : "LG", "path" : "Electronics,Cell_Phones_and_Accessories,Cell_Phones_and_Smartphones," }
 </code></pre>

##Node removal
Node can be removed using single database query
<pre><code class="javascript">
db.categoriesMP.remove({_id:'LG'});
 </code></pre>

##Getting node children, unordered
  Note unless you introduce the order field, it is impossible to get ordered list of node children. You should consider another approach if you need order.

<pre><code class="javascript">
db.categoriesMP.find({$query:{path:'Electronics,'}})
//{ "_id" : "Cameras_and_Photography", "path" : "Electronics," }
//{ "_id" : "Shop_Top_Products", "path" : "Electronics," }
//{ "_id" : "Cell_Phones_and_Accessories", "path" : "Electronics," }
</code></pre>

##Getting all node descendants
Single select, regexp starts with ^ which allows using the index for matching

<pre><code class="javascript">
var descendants=[]
var item = db.categoriesMP.findOne({_id:"Cell_Phones_and_Accessories"});
var criteria = '^'+item.path+item._id+',';
var children = db.categoriesMP.find({path: { $regex: criteria, $options: 'i' }});
while(true === children.hasNext()) {
  var child = children.next();
  descendants.push(child._id);
}

descendants.join(",")
//Cell_Phones_and_Smartphones,Headsets,Batteries,Cables_And_Adapters,Nokia,Samsung,Apple,HTC,Vyacheslav
 </code></pre>

##Getting path to node
We can obtain path directly from node without issuing additional selects.

<pre><code class="javascript">
var path=[]
var item = db.categoriesMP.findOne({_id:"Nokia"})
print (item.path)
//Electronics,Cell_Phones_and_Accessories,Cell_Phones_and_Smartphones,
  </code></pre>

##Indexes
Recommended index is putting index on path

<pre><code class="javascript">
db.categoriesAAO.ensureIndex( { path: 1 } )
</code></pre>

#Tree structure using Nested Sets
For each node we store (ID, left, right).



Left field also can be treated as an order field

##Adding new node
 Please refer to image above. Assume, we want to insert LG node after shop_top_products(14,23).
New node would have left value of 24, affecting all remaining left values according to traversal rules, and will have right value of 25, affecting all remaining right values including root one.

Steps:
 take next node in traversal tree
 new node will have left value of the following sibling and right value - incremented by two following sibling's left one
 now we have to create the place for the new node. Update affects right values of all ancestor nodes and also affects all nodes that remain for traversal
 Only after creating place new node can be inserted


<pre><code class="javascript">
var followingsibling = db.categoriesNSO.findOne({_id:"Cell_Phones_and_Accessories"});
var newnode = {_id:'LG', left:followingsibling.left,right:followingsibling.left+1}

db.categoriesNSO.update({right:{$gt:followingsibling.right}},{$inc:{right:2}}, false, true)

db.categoriesNSO.update({left:{$gte:followingsibling.left}, right:{$lte:followingsibling.right}},{$inc:{left:2, right:2}}, false, true)
db.categoriesNSO.insert(newnode)
</code></pre>

Let's check the result:

<pre>
  +-Electronics (1,46)
     +---Cameras_and_Photography (2,13)
           +------Digital_Cameras (3,4)
           +------Camcorders (5,6)
           +------Lenses_and_Filters (7,8)
           +------Tripods_and_supports (9,10)
           +------Lighting_and_studio (11,12)
       +----Shop_Top_Products (14,23)
           +------IPad (15,16)
           +------IPhone (17,18)
           +------IPod (19,20)
           +------Blackberry (21,22)
       +----LG (24,25)
       +----Cell_Phones_and_Accessories (26,45)
           +------Cell_Phones_and_Smartphones (27,38)
                 +---------Nokia (28,29)
                 +---------Samsung (30,31)
                 +---------Apple (32,33)
                 +---------HTC (34,35)
                 +---------Vyacheslav (36,37)
             +-------Headsets (39,40)
             +-------Batteries (41,42)
             +-------Cables_And_Adapters (43,44)
</pre>

##Node removal
 While potentially rearranging node order within same parent is identical to exchanging node's left and right values,the formal way of moving the node is first removing node from the tree and later inserting it to new location. Node: node removal without removing it's childs is out of scope for this article. For now, we assume, that node to remove has no children, i.e. right-left=1

 Steps are identical to adding the node - i.e. we adjusting the space by decreasing affected left/right values,
and removing original node.

<pre><code class="javascript">
var nodetoremove = db.categoriesNSO.findOne({_id:"LG"});

if((nodetoremove.right-nodetoremove.left-1)>0.001) {
    print("Only node without childs can be removed")
    exit
}

var followingsibling = db.categoriesNSO.findOne({_id:"Cell_Phones_and_Accessories"});

//update all remaining nodes
db.categoriesNSO.update({right:{$gt:nodetoremove.right}},{$inc:{right:-2}}, false, true)
db.categoriesNSO.update({left:{$gt:nodetoremove.right}},{$inc:{left:-2}}, false, true)
db.categoriesNSO.remove({_id:"LG"});
</code></pre>

Let's check result:

<pre>
  +-Electronics (1,44)
   +--Cameras_and_Photography (2,13)
         +-----Digital_Cameras (3,4)
         +-----Camcorders (5,6)
         +-----Lenses_and_Filters (7,8)
         +-----Tripods_and_supports (9,10)
         +-----Lighting_and_studio (11,12)
     +---Shop_Top_Products (14,23)
         +-----IPad (15,16)
         +-----IPhone (17,18)
         +-----IPod (19,20)
         +-----Blackberry (21,22)
     +---Cell_Phones_and_Accessories (24,43)
         +-----Cell_Phones_and_Smartphones (25,36)
               +--------Nokia (26,27)
               +--------Samsung (28,29)
               +--------Apple (30,31)
               +--------HTC (32,33)
               +--------Vyacheslav (34,35)
         +------Headsets (37,38)
         +------Batteries (39,40)
         +------Cables_And_Adapters (41,42)
</pre>

##Updating/moving the single node
 Moving the node can be within same parent, or to another parent. If the same parent, and nodes are without childs, than you need just to exchange nodes (left,right) pairs.

 Formal way is to remove node and insert to new destination, thus the same restriction apply - only node without children can be moved. If you need to move subtree, consider creating mirror of the existing parent under new location, and move nodes under the new parent one by one. Once all nodes moved, remove obsolete old parent.

 As an example, lets move LG node from the insertion example under the Cell_Phones_and_Smartphones node, as a last sibling (i.e. you do not have following sibling node as in the insertion example)

Steps
  to remove LG node from tree using node removal procedure described above
  to take right value of the new parent.New node will have left value of the parent's right value and right value - incremented by one parent's right one. Now we have to create the place for the new node: update affects right values of all nodes on a further traversal path

<pre><code class="javascript">
var newparent = db.categoriesNSO.findOne({_id:"Cell_Phones_and_Smartphones"});
var nodetomove = {_id:'LG', left:newparent.right,right:newparent.right+1}


//3th and 4th parameters: false stands for upsert=false and true stands for multi=true
db.categoriesNSO.update({right:{$gte:newparent.right}},{$inc:{right:2}}, false, true)
db.categoriesNSO.update({left:{$gte:newparent.right}},{$inc:{left:2}}, false, true)
db.categoriesNSO.insert(nodetomove)
</code></pre>

Let's check result:

</pre>
  +-Electronics (1,46)
   +--Cameras_and_Photography (2,13)
         +-----Digital_Cameras (3,4)
         +-----Camcorders (5,6)
         +-----Lenses_and_Filters (7,8)
         +-----Tripods_and_supports (9,10)
         +-----Lighting_and_studio (11,12)
     +---Shop_Top_Products (14,23)
         +-----IPad (15,16)
         +-----IPhone (17,18)
         +-----IPod (19,20)
         +-----Blackberry (21,22)
     +---Cell_Phones_and_Accessories (24,45)
         +-----Cell_Phones_and_Smartphones (25,38)
                 +---------Nokia (26,27)
                 +---------Samsung (28,29)
                 +---------Apple (30,31)
                 +---------HTC (32,33)
                 +---------Vyacheslav (34,35)
                 +---------LG (36,37)
             +-------Headsets (39,40)
             +-------Batteries (41,42)
             +-------Cables_And_Adapters (43,44)
</pre>

##Getting all node descendants
 This is core stength of this approach - all descendants retrieved using one select to DB. Moreover,by sorting by node left - the dataset is ready for traversal in a correct order

<pre><code class="javascript">
var descendants=[]
var item = db.categoriesNSO.findOne({_id:"Cell_Phones_and_Accessories"});
print ('('+item.left+','+item.right+')')
var children = db.categoriesNSO.find({left:{$gt:item.left}, right:{$lt:item.right}}).sort(left:1);
while(true === children.hasNext()) {
  var child = children.next();
  descendants.push(child._id);
}


descendants.join(",")
//Cell_Phones_and_Smartphones,Headsets,Batteries,Cables_And_Adapters,Nokia,Samsung,Apple,HTC,Vyacheslav
</code></pre>

##Getting path to node
Retrieving path to node is also elegant and can be done using single query to database

 Retrieving path to node is also elegant and can be done using single query to database

<pre><code class="javascript">
var path=[]
var item = db.categoriesNSO.findOne({_id:"Nokia"})

var ancestors = db.categoriesNSO.find({left:{$lt:item.left}, right:{$gt:item.right}}).sort({left:1})
while(true === ancestors.hasNext()) {
  var child = ancestors.next();
  path.push(child._id);
}

path.join('/')
// Electronics/Cell_Phones_and_Accessories/Cell_Phones_and_Smartphones
</code></pre>

##Indexes
Recommended index is putting index on left and right values:

<pre><code class="javascript">
db.categoriesAAO.ensureIndex( { left: 1, right:1 } )
</code></pre>

And, in case if you were so patient to read the article till this section, bonus:

#Tree structure using combination of Nested Sets and classic Parent reference with order approach
  For each node we store (ID, Parent, Order,left, right).



 Left field also is treated as an order field, so we could omit order field. But from other hand
we can leave it, so we can use Parent Reference with order data to reconstruct left/right values in case of accidental corruption, or, for example during initial import.

##Adding new node
Adding new node can be adopted from Nested Sets in this manner:

<pre><code class="javascript">
var followingsibling = db.categoriesNSO.findOne({_id:"Cell_Phones_and_Accessories"});
var previoussignling = db.categoriesNSO.findOne({_id:"Shop_Top_Products"});
var neworder = parseInt((followingsibling.order + previoussignling.order)/2);
var newnode = {_id:'LG', left:followingsibling.left,right:followingsibling.left+1, parent:followingsibling.parent, order:neworder};
db.categoriesNSO.update({right:{$gt:followingsibling.right}},{$inc:{right:2}}, false, true)
db.categoriesNSO.update({left:{$gte:followingsibling.left}, right:{$lte:followingsibling.right}},{$inc:{left:2, right:2}}, false, true)
db.categoriesNSO.insert(newnode)
</code></pre>

Before insertion

<pre>
 +----Cameras_and_Photography (2,13)  ord.[10]
 +-----Shop_Top_Products (14,23)  ord.[20]
 +-----Cell_Phones_and_Accessories (26,45)  ord.[30]
</pre>

After insertion:
<pre>
    +--Electronics (1,46)
           +----Cameras_and_Photography (2,13)  ord.[10]
                       +-------Digital_Cameras (3,4)  ord.[10]
                       +-------Camcorders (5,6)  ord.[20]
                       +-------Lenses_and_Filters (7,8)  ord.[30]
                       +-------Tripods_and_supports (9,10)  ord.[40]
                       +-------Lighting_and_studio (11,12)  ord.[50]
           +-----Shop_Top_Products (14,23)  ord.[20]
                       +-------IPad (15,16)  ord.[10]
                       +-------IPhone (17,18)  ord.[20]
                       +-------IPod (19,20)  ord.[30]
                       +-------Blackberry (21,22)  ord.[40]
           +-----LG (24,25)  ord.[25]
           +-----Cell_Phones_and_Accessories (26,45)  ord.[30]
                       +-------Cell_Phones_and_Smartphones (27,38)  ord.[10]
                                   +----------Nokia (28,29)  ord.[10]
                                   +----------Samsung (30,31)  ord.[20]
                                   +----------Apple (32,33)  ord.[30]
                                   +----------HTC (34,35)  ord.[40]
                                   +----------Vyacheslav (36,37)  ord.[50]
                       +--------Headsets (39,40)  ord.[20]
                       +--------Batteries (41,42)  ord.[30]
                       +--------Cables_And_Adapters (43,44)  ord.[40]
</pre>

##Updating/moving the single node
  Identical to insertion approach

##Node removal
Approach from Nested Sets is used.

##Getting node children, ordered
Now is possible by using (Parent,Order) pair

<pre><code class="javascript">
 db.categoriesNSO.find({parent:"Electronics"}).sort({order:1});
/*

{ "_id" : "Cameras_and_Photography", "parent" : "Electronics", "order" : 10, "left" : 2, "right" : 13 }
{ "_id" : "Shop_Top_Products", "parent" : "Electronics", "order" : 20, "left" : 14, "right" : 23 }
{ "_id" : "LG", "left" : 24, "right" : 25, "parent" : "Electronics", "order" : 25 }
{ "_id" : "Cell_Phones_and_Accessories", "parent" : "Electronics", "order" : 30, "left" : 26, "right" : 45 }
*/
</code></pre>

##Getting all node descendants
Approach from Nested Sets is used.

##Getting path to node
Approach from nested sets is used

#Code in action
Code can be downloaded from repository  https://github.com/Voronenko/Storing_TreeView_Structures_WithMongoDB

All files are packaged according to the following naming convention:

MODELReference.js - initialization file with tree data for MODEL approach

MODELReference_operating.js - add/update/move/remove/get children examples

MODELReference_pathtonode.js - code illustrating how to obtain path to node

MODELReference_nodedescendants.js - code illustrating how to retrieve all the descendands of the node

All files are ready to use in mongo shell. You can run examples by invoking mongo < file_to_execute, or, if you want, interactively in the shell or with RockMongo web shell.  History

Keep a running update of any changes or improvements you've
made here.

