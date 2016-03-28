    function createNewChild() {
        var list = document.getElementById("list");
        var item = document.createElement("li");
        item.innerHTML = "NEW ITEM ";
        list.appendChild(item);
    }
     function removeFirstChild() {
            var list = document.getElementById("list");
            var item = list.children[0];

            if (item != null) {
                list.removeChild(item);
            }
     }

