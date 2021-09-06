//This javascript class handles events for every button clicked on the browser
function itemTemplate(item){
    return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
    <span class="item-text">${item.text}</span>
    <div>
      <button data-id = "${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
      <button data-id = "${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
  </li>`
}

//Initial Page load render
let myHTML = items.map(function(item){
    return itemTemplate(item)
}).join("")

document.getElementById("item-list").insertAdjacentHTML("beforeend", myHTML)


//Create Feature
let createField = document.getElementById("create-field") //line 46 in server.js

document.getElementById("create-form").addEventListener("submit", function(e){
    e.preventDefault() //Prevents any default behaviour of the web browser
    axios.post('/create-item', {text: createField.value}).then(function(response){
        //create html for a new item
        document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(response.data))
        createField.value = ""
        createField.focus()
    }).catch(function(){
        console.log("Please try again later")
    })
})

document.addEventListener("click", function(e){
    //Delete Feature (Server to browser)
    if(e.target.classList.contains("delete-me")){
        if(confirm("Are you sure you want to delete this item?")){ //confirm() is a web browser environment method
            axios.post("/delete-item", {id: e.target.getAttribute("data-id")}).then(function(){
                //In the html template where these buttons are found, the 1st parent element is divider <div>  (check line 56)
                //Second parent element is list item <li> (check line 54 in server.js)
                e.target.parentElement.parentElement.remove()
            }).catch(function(){
                console.log("Please try again later")
            })
        }
    }
    
    //Update Feature (Server to browser)
    if(e.target.classList.contains("edit-me")){//Looks for (targets) html elements with the class edit-me
        let input = prompt("Enter your desired new text", e.target.parentElement.parentElement.querySelector(".item-text").innerHTML) //The prompt() method displays a dialog box that prompts the visitor for input
        if(input){
            axios.post("/update-item", {text: input, id: e.target.getAttribute("data-id")}).then(function(){
                e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = input
            }).catch(function(){
                console.log("Please try again later")
            })
        }
    } 
})