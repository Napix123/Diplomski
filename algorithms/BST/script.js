// structure of node
// {
//     nodeId: number <--- unique id for each node. it will be also used as id for html element of node.
//     value: character <-- this will store value of current node.
//     children: [] <--- this array will store left and right of node
// }

// Tree will be stored as object.
let data = { value: null, children: [] };
// Current available id for the node. We will give each node a unique id and put this as their html element "id".
let curId = 1;

const width = Math.max(100, window.innerWidth - 50);
const height = Math.max(100, window.innerHeight - 100);
const nodeRadius = 20;
const LinkStroke = 4;
const animationDuration = 750;
const padding = 22;

const insertButton = document.getElementById("InsertButton");
const deleteButton = document.getElementById("DeleteButton");

d3.select(".Canvas").append("svg").append("g");

// During insertion or deletion visualization process disbale the buttons
const freezeButtons = () => {
  insertButton.disabled = true;
  deleteButton.disabled = true;
};
const unfreezeButtons = () => {
  insertButton.disabled = false;
  deleteButton.disabled = false;
};

// To put delay between visualization.
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const update = (oldData, newData, parentValue, childValue) => {
  // childValue is the node we want to insert/delete and parentValue is the parent of node we want to insert/delete.

  /*
    Small description of "update" function.
     -> Find the coordinates of old tree.
     -> Find the coordinates of new updated tree.
     -> Put tree on old coordinates.
     -> Animate nodes and links to the new co-ordinates.
  */

  // Create the old and new updated tree.
  const treemap = d3.tree().size([width, height]);
  const oldTree = treemap(d3.hierarchy(data, (d) => d.children));
  const newTree = treemap(d3.hierarchy(newData, (d) => d.children));

  // Convert both tres from objects to array.
  const oldTreeArray = oldTree.descendants();
  const newTreeArray = newTree.descendants();
  // Putting old and new coordinates of nodes in the same array.
  for (let i = 0; i < newTreeArray.length; i++) {
    let oldPosition = {};
    // Traverse the old tree and find the old coordinates.
    for (let j = 0; j < oldTreeArray.length; j++) {
      if (newTreeArray[i].data.value == childValue) {
        // Node which we are going to insert, there is no old coordinates available
        // So we are going to use the coordinates of parent node.
        if (oldTreeArray[j].data.value == parentValue) {
          oldPosition = oldTreeArray[j];
        }
      } else {
        if (oldTreeArray[j].data.value == newTreeArray[i].data.value) {
          oldPosition = oldTreeArray[j];
        }
      }
    }
    newTreeArray[i].oldX = oldPosition.x || 0;
    newTreeArray[i].oldY = (oldPosition.y || 0) + padding;
    newTreeArray[i].y += padding;
  }

  // Remove the old tree from canvas. we will draw new one.
  d3.select(".Canvas > svg g").remove();
  d3.select(".Canvas > svg").append("g");

  // Create all the edges and put them in new array.
  let allLinks = [];
  for (let i = 0; i < newTreeArray.length; i++) {
    for (let j = 0; j < 2; j++) {
      if (
        newTreeArray[i].data.value != null &&
        newTreeArray[i].children[j].data.value != null
      ) {
        allLinks.push({
          parent: newTreeArray[i],
          child: newTreeArray[i].children[j],
        });
      }
    }
  }

  // We will draw edge(links) 2 times
  // When we traverse the BST, it will be easy to show animation of searching. we will paint top edge with some color while searching node.
  for (let i = 0; i < 2; i++) {
    const lineId = i == 0 ? "Under" : "";

    // Drawing edges on canvas with some styles and coordinates.
    const links = d3
      .select(".Canvas > svg g")
      .selectAll("g.link")
      .data(allLinks)
      .enter()
      .append("g")
      .append("line")
      .attr(
        "id",
        (d) =>
          `${lineId}link_Source_${d.parent.data.nodeId}_Dest_${d.child.data.nodeId}`
      )
      .attr("stroke-width", LinkStroke)
      .attr("stroke", "black")
      .attr("x1", (d) => d.parent.oldX)
      .attr("y1", (d) => d.parent.oldY)
      .attr("x2", (d) => d.child.oldX)
      .attr("y2", (d) => d.child.oldY);
    // Transition from old tree to new tree. move old edges to new edges using co-ordinates.
    links
      .transition()
      .duration(animationDuration)
      .attr("x1", (d) => d.parent.x)
      .attr("y1", (d) => d.parent.y)
      .attr("x2", (d) => d.child.x)
      .attr("y2", (d) => d.child.y);
  }

  // Draw nodes and their value on screen using old tree coordinates.
  const nodes = d3
    .select(".Canvas > svg g")
    .selectAll("g.node")
    .data(newTree)
    .enter()
    .append("g")
    .attr("id", (d) => `node${d.data.nodeId}`)
    .attr("class", (d) => (d.data.value != null ? "node" : "null-node"));
  nodes
    .append("circle")
    .attr("id", (d) => `circle${d.data.nodeId}`)
    .attr("r", nodeRadius)
    .attr("cx", (d) => d.oldX)
    .attr("cy", (d) => d.oldY)
    .attr("value", (d) => d.data.value);
  nodes
    .append("text")
    .attr("dx", (d) => d.oldX)
    .attr("dy", (d) => d.oldY)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .text((d) => d.data.value);

  // Move nodes from old co-ordinate to new coordinates.
  nodes
    .transition()
    .duration(animationDuration)
    .attr("transform", (d) => {
      if (d.data.value != null)
        return `translate(${parseInt(d.x - d.oldX)}, ${parseInt(
          d.y - d.oldY
        )})`;
      else return "translate(0,0)";
    });

  data = newData;
};

const addNode = async () => {
  // Get the node value from input field and verify its value/type.
  let val = document.getElementById("InsertNodeField").value;
  if (val == "") {
    return;
  }
  if (isNaN(val)) {
    alert("Only integers are allowed");
    return;
  }
  val = parseInt(val);
  document.getElementById("InsertNodeField").value = "";

  // Freeze(disable) insert and delete buttons.
  freezeButtons();

  // Copying object without reference in a dirty way. Might make proper function to copy object later.
  let oldData = JSON.parse(JSON.stringify(data));
  let newData = JSON.parse(JSON.stringify(data));
  let node = newData;
  let parent = null;

  while (true) {
    if (node.value == null) {
      // If node value is null then that means we already reached leaf node. Insert new node here.
      await sleep(400);

      // Create a node with given valule.
      const newChild = {
        nodeId: curId,
        value: val,
        children: [{ value: null }, { value: null }],
      };

      if (parent) {
        // If tree is not empty then "parent" will not be null. Now link newly created node with it parent node.
        if (parent.value < val) parent.children[1] = newChild;
        else parent.children[0] = newChild;
      } else {
        // If tree is empty then this newly created node will act as tree.
        newData = newChild;
      }

      update(oldData, newData, parent ? parent.value : -1, parent ? val : -1);
      curId++;
      await sleep(300);
      break;
    }

    const nodeElement = document.getElementById(`node${node.nodeId}`);
    if (nodeElement) nodeElement.className.baseVal = "highlightedNode";

    if (node.value == val) {
      // If a value user is trying to insert already exists, then show the message
      alert("Value already exists in tree");
      update(oldData, oldData, -1, -1);
      break;
    }

    parent = node;
    // Go to left or right subtree depending on node values.
    if (node.value > val) {
      node = node.children[0];
    } else {
      node = node.children[1];
    }

    // Show the edge traversing animation.
    const linkElement = document.getElementById(
      `link_Source_${parent.nodeId}_Dest_${node.nodeId}`
    );
    if (linkElement) {
      linkElement.className.baseVal = "LinkAnimation";
      await sleep(750);
    }
  }
  unfreezeButtons();
};

// Delete the given node and return updated tree.
const deleteNodeRecur = (newData, val) => {
  if (newData.value == null) {
    return newData;
  }

  if (val < newData.value) {
    // Find the node in left subtree and return updated subtree.
    newData.children[0] = deleteNodeRecur(newData.children[0], val);
  } else if (val > newData.value) {
    // Find the node in right subtree and return updated subtree.
    newData.children[1] = deleteNodeRecur(newData.children[1], val);
  } else {
    // Found the node which we want to delete.
    if (newData.children[0].value == null) {
      // There is no left children
      return newData.children[1];
    } else if (newData.children[1].value == null) {
      // There is no right children
      return newData.children[0];
    }

    // Both children Exists
    // In this case we will find inorder successor of node and replace it with current node.
    let successorParent = newData;
    let successor = newData.children[1];
    while (successor.children[0].value != null) {
      successorParent = successor;
      successor = successor.children[0];
    }
    if (successorParent.value != newData.value)
      successorParent.children[0] = successor.children[1];
    else successorParent.children[1] = successor.children[1];
    newData.value = successor.value;
    return newData;
  }
  return newData;
};

const deleteNode = async () => {
  // Get the node value from input field and verify it's type.
  let val = document.getElementById("DeleteNodeField").value;
  if (val == "") return;
  if (isNaN(val)) {
    alert("Only integers are allowed");
    return;
  }
  val = parseInt(val);
  document.getElementById("DeleteNodeField").value = "";
  freezeButtons();

  // Copying object without reference in a dirty way. Might make proper function to copy object later.
  let oldData = JSON.parse(JSON.stringify(data));
  let newData = JSON.parse(JSON.stringify(data));
  let node = newData;
  let parent = null;

  while (true) {
    if (node.value == null) {
      alert("Value is not present in tree");
      update(oldData, newData, -1, -1);
      break;
    }

    const nodeEle = document.getElementById(`node${node.nodeId}`);
    if (nodeEle) nodeEle.className.baseVal = "highlightedNode";

    parent = node;

    if (node.value == val) {
      // Found the node which we want to delete. We just create updated tree with some other function and display it.
      // More better way will be, if there are 2 childs to this node then show animation to find inorder successor.
      await sleep(500);
      newData = deleteNodeRecur(newData, val);
      update(oldData, newData, -1, -1);
      break;
    } else {
      // Go to left or right subtree depending on the value we want to delete.
      if (node.value > val) {
        node = node.children[0];
      } else {
        node = node.children[1];
      }
      // Show the edge aniamtion.
      const linkElement = document.getElementById(
        `link_Source_${parent.nodeId}_Dest_${node.nodeId}`
      );
      if (linkElement) linkElement.className.baseVal = "LinkAnimation";
    }
    await sleep(750);
  }
  unfreezeButtons();
};

insertButton.addEventListener("click", addNode);
deleteButton.addEventListener("click", deleteNode);

// User can press enter when writing in both fields
document
  .getElementById("InsertNodeField")
  .addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
      insertButton.click();
    }
  });
document
  .getElementById("DeleteNodeField")
  .addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
      deleteButton.click();
    }
  });
