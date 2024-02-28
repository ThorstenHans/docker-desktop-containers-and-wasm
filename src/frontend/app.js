
((window, document, undefined) => {
    
    const targetSelector = "all-items";
    const root = "http://localhost:8081";

    const load_items = () => {
        fetch(`${root}/items`)
        .then(res => res.json())
        .then(items => {
            render_items(items);
            register_delete_handlers();
        });
    };

    const delete_item = (address) => {
        fetch(`${root}${address}`, { method: "DELETE"})
        .then(()=> load_items());
    }
    const register_delete_handlers = () => {
        let buttons = document.querySelectorAll('.delete-item');       
        buttons.forEach(button => {
            button.addEventListener("click", (e)=>{
                let address = e.target.getAttribute("data-target");
                delete_item(address);
            }, false);
        });
    }
    const render_items = (items) => {
        let target = document.getElementById(targetSelector);
        target.innerHTML = "";
        items.forEach(item => {
            let itemAsHtml = `<li class="list-group-item" data-item-id="${item.id}">${item.value}
    <button type="button" data-target="/items/${item.id}" class="btn-close float-end delete-item" aria-label="Close"></button>
</li>`
            let child = new DOMParser().parseFromString(itemAsHtml, "text/html").body.firstElementChild;
            target.appendChild(child)
        });
    };

    const add_new_item = (target) => {
        let payload = {
            value: target.value
        };
        fetch(`${root}/items`, {
            method: "POST", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload)
        })
        .then(() => {
            target.value = '';
            load_items();
        });
    };

    document.addEventListener("DOMContentLoaded", ()=>{
        let addNewItemButton = document.getElementById('addNewItem');
        let newItemValue = document.getElementById("newItem");
        
        newItemValue.addEventListener("keydown", function (e) {
            if (e.code === "Enter") {
                add_new_item(e.target);
            }
        });
        addNewItemButton.addEventListener("click", (e)=> {
            add_new_item(newItemValue);
            e.preventDefault();
            return false;
        });

        load_items();
    }, false);

})(window, document);

