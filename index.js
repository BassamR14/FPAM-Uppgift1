//to clear LS or SS: LS/SS.clear()

//All Global Variables
const registerBtn = document.querySelector("#register-btn");
const signInBtn = document.querySelector("#signIn-btn");
const signInDiv = document.querySelector(".signIn-div");
const actionBtnsDiv = document.querySelector(".action-btns");
const dmToggleBtn = document.querySelector(".dm-toggle");

let h3 = document.createElement("h3");
signInDiv.append(h3);

let users = [];
let currentTodoDiv = null;
let todos = [];
let sharedMessages = [];

//Register User
function register() {
  const registerUserInput = document.querySelector("#register-user");
  const registerPasswordInput = document.querySelector("#register-password");

  let user = {
    username: registerUserInput.value,
    password: registerPasswordInput.value,
    //Date.now writes the date since 1 jan 1970 in milliseconds
    id: Date.now(),
  };

  //check if there is anything in LS, if there is, just push it into the array in LS, if not then create a new array
  if (localStorage.getItem("users")) {
    users = JSON.parse(localStorage.getItem("users"));
    users.push(user);
  } else {
    users = [user];
  }

  localStorage.setItem("users", JSON.stringify(users));

  //Changed register div to form instead, so that i can reset the input values this way since it is scalable and i don't have to empty each and every one
  document.querySelector(".register-div").reset();
}

registerBtn.addEventListener("click", register);

//Sign in with User
function signIn() {
  const signInUserInput = document.querySelector("#signIn-user");
  const signInPasswordInput = document.querySelector("#signIn-password");

  h3.innerText = "";

  //Parse string back to array/object, added empty array in case no user array exists
  let savedUsers = JSON.parse(localStorage.getItem("users")) || [];

  //   Check if any of inputs are saved in LS, .some can also be used
  const foundUser = savedUsers.find(
    (user) =>
      user.username === signInUserInput.value &&
      user.password === signInPasswordInput.value,
  );

  // console.log(isTrue);

  //check if button exists
  const existingLogoutBtn = document.querySelector("#logout-btn");

  if (foundUser) {
    h3.innerText = "Signed In as " + signInUserInput.value;
    h3.style.color = "green";

    // Store logged-in user
    sessionStorage.setItem("loggedInUser", JSON.stringify(foundUser));

    //Create logout button, render to do list, check if dark mode is saved
    createLogoutButton();
    todoList();
    applyUserSettings();
  } else {
    h3.innerText = "Try Again";
    h3.style.color = "red";

    // Remove the session if login failed
    sessionStorage.removeItem("loggedInUser");

    //to remove logout button
    if (existingLogoutBtn) {
      existingLogoutBtn.remove();
    }
  }

  signInDiv.reset();
}

signInBtn.addEventListener("click", signIn);

//Check if a user is signed in
function checkSignedIn() {
  const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

  if (loggedInUser) {
    h3.innerText = `Currently signed in as ${loggedInUser.username}`;
    createLogoutButton();
    todoList();
    applyUserSettings();
  }
}

checkSignedIn();

//Create log out button
function createLogoutButton() {
  //If there is already logout button, do nothing
  if (document.querySelector("#logout-btn")) return;

  const logoutBtn = document.createElement("button");
  logoutBtn.id = "logout-btn";
  logoutBtn.innerText = "Log Out";
  actionBtnsDiv.append(logoutBtn);

  logoutBtn.addEventListener("click", logout);
}

//Function for logging out
function logout() {
  //To erase to do render
  if (currentTodoDiv) {
    currentTodoDiv.remove();
    currentTodoDiv = null;
  }

  // Reset dark mode to default
  const body = document.body;
  body.classList.remove("DM");
  dmToggleBtn.innerText = "Dark Mode";

  sessionStorage.removeItem("loggedInUser");
  document.querySelector("#logout-btn")?.remove();
  h3.innerText = "";
}

//To-do creation + rendering
function todoList() {
  if (currentTodoDiv) return currentTodoDiv;

  //to-dos container
  const todoDiv = document.createElement("div");
  todoDiv.classList.add("todo-div");

  //to-do input container
  const todoInputDiv = document.createElement("form");
  const checkboxLabel = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkboxLabel.appendChild(checkbox);
  checkboxLabel.append(" Completed");
  const todoInputLabel = document.createElement("label");
  todoInputLabel.textContent = "To do: ";
  const todoInput = document.createElement("input");
  todoInputLabel.appendChild(todoInput);
  const saveBtn = document.createElement("button");
  saveBtn.setAttribute("type", "button");
  saveBtn.innerText = "Save";
  saveBtn.classList.add("save-btn");
  const inputHeading = document.createElement("h3");
  inputHeading.innerText = "Create To-dos";

  todoInputDiv.append(inputHeading, checkboxLabel, todoInputLabel, saveBtn);
  todoDiv.append(todoInputDiv);
  document.querySelector("body").append(todoDiv);

  //set currenttododiv as the created todo-div
  currentTodoDiv = todoDiv;

  //Show each users todo-list
  const todoListDiv = document.createElement("div");
  todoInputDiv.classList.add("create-todo");
  todoListDiv.classList.add("render-todos");
  todoDiv.append(todoListDiv);

  const sharedContainer = document.createElement("div");
  sharedContainer.classList.add("shared-container");
  todoDiv.append(sharedContainer);

  //Take input values and save in LS with user ID
  function createListItem() {
    const loggedUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

    let todo = {
      userId: loggedUser.id,
      id: Date.now(),
      completed: checkbox.checked,
      todo: todoInput.value,
    };

    if (localStorage.getItem("todos")) {
      todos = JSON.parse(localStorage.getItem("todos"));
      todos.push(todo);
    } else {
      todos = [todo];
    }

    localStorage.setItem("todos", JSON.stringify(todos));

    todoInputDiv.reset();
    renderList();
  }

  saveBtn.addEventListener("click", createListItem);

  //Render todo list, made into function to keep code dry
  function renderList() {
    todoListDiv.innerHTML = "";

    const completedList = document.createElement("ul");
    const incompletedList = document.createElement("ul");

    //get all todos, get current user, get their todos, split into completed and incompleted.
    const allTodos = JSON.parse(localStorage.getItem("todos")) || [];
    const loggedUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
    const userTodos = allTodos.filter((todo) => todo.userId === loggedUser.id);
    const completedTodos = userTodos.filter((todo) => todo.completed);
    const incompletedTodos = userTodos.filter((todo) => !todo.completed);

    //function to create the li item
    function renderListItem(todo) {
      let li = document.createElement("li");
      let listItem = document.createElement("div");
      listItem.classList.add("list-item");
      let span = document.createElement("span");
      span.innerText = todo.todo;
      let editBtn = document.createElement("button");
      editBtn.classList.add("edit-btn");
      editBtn.innerText = "Edit";

      //We already have todo, but now we need to extend it to editFn, so wrap the event in arrow function. The arrow function “remembers” that specific todo
      editBtn.addEventListener("click", () => {
        editFn(todo);
      });

      listItem.append(span, editBtn);
      li.append(listItem);
      return li;
    }

    function editFn(todo) {
      // console.log(todo.id);
      const todoListEditDiv = document.createElement("div");
      todoListEditDiv.classList.add("edit-modal");
      const todoInputEditDiv = document.createElement("form");
      const checkboxEditLabel = document.createElement("label");
      const checkboxEdit = document.createElement("input");
      checkboxEdit.type = "checkbox";
      checkboxEditLabel.appendChild(checkboxEdit);
      checkboxEditLabel.append(" Completed");
      const todoInputEditLabel = document.createElement("label");
      todoInputEditLabel.textContent = "To do: ";
      const todoInputEdit = document.createElement("input");
      todoInputEditLabel.appendChild(todoInputEdit);
      const saveEditBtn = document.createElement("button");
      saveEditBtn.setAttribute("type", "button");
      saveEditBtn.innerText = "Edit";
      const closeBtn = document.createElement("button");
      closeBtn.setAttribute("type", "button");
      closeBtn.innerText = "Close";
      closeBtn.classList.add("close-btn");
      const inputEditHeading = document.createElement("h3");
      inputEditHeading.innerText = "Edit To-do";

      //To get the old value before editing
      checkboxEdit.checked = todo.completed;
      todoInputEdit.value = todo.todo;

      todoInputEditDiv.append(
        inputEditHeading,
        checkboxEditLabel,
        todoInputEditLabel,
        saveEditBtn,
        closeBtn,
      );
      todoListEditDiv.append(todoInputEditDiv);
      document.body.append(todoListEditDiv);

      function updateListItem(todoId) {
        //Better to read from local storage
        const lsTodos = JSON.parse(localStorage.getItem("todos"));
        const currentTodo = lsTodos.find((todo) => todo.id === todoId);
        if (!currentTodo) return;

        currentTodo.completed = checkboxEdit.checked;
        currentTodo.todo = todoInputEdit.value;

        // Save the updated array back to localStorage
        localStorage.setItem("todos", JSON.stringify(lsTodos));

        // Close the edit modal
        todoListEditDiv.remove();

        renderList();
      }

      saveEditBtn.addEventListener("click", () => {
        updateListItem(todo.id);
      });

      closeBtn.addEventListener("click", () => {
        todoListEditDiv.remove();
      });
    }

    completedTodos.forEach((todo) => {
      let li = renderListItem(todo);
      completedList.append(li);
    });

    incompletedTodos.forEach((todo) => {
      let li = renderListItem(todo);
      incompletedList.append(li);
    });

    const incompleteHeading = document.createElement("h4");
    incompleteHeading.innerText = "Incomplete";

    const completeHeading = document.createElement("h4");
    completeHeading.innerText = "Completed";

    const listHeading = document.createElement("h3");
    listHeading.innerText = `${loggedUser.username}'s To-Do List`;

    todoListDiv.append(
      listHeading,
      incompleteHeading,
      incompletedList,
      completeHeading,
      completedList,
    );
  }

  renderList();

  //To allow a user to give antoher user access to their to-dos
  function share() {
    //Need to know logged in user + all users
    const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
    const allUsers = JSON.parse(localStorage.getItem("users"));

    //div to store inputs + other user's list
    const shareListDiv = document.createElement("div");
    shareListDiv.classList.add("share-div");
    // document.body.append(shareListDiv);
    currentTodoDiv.append(shareListDiv);

    //div that contains inputs
    const shareListInputDiv = document.createElement("div");
    const userDropdown = document.createElement("select");

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.innerText = "";
    userDropdown.append(emptyOption);

    allUsers.forEach((user) => {
      if (user.id === loggedInUser.id) {
        return;
      } else {
        const userIdOption = document.createElement("option");
        userIdOption.value = user.id;
        userIdOption.innerText = `${user.username}(${user.id})`;

        userDropdown.append(userIdOption);
      }
    });

    const shareListBtn = document.createElement("button");
    shareListBtn.classList.add("share-btn");
    shareListBtn.innerText = "Share List!";

    //function that gives chosen user access to my todos
    function shareList() {
      // Get all my todos
      const allTodos = JSON.parse(localStorage.getItem("todos")) || [];
      const userTodos = allTodos.filter(
        (todo) => todo.userId === loggedInUser.id,
      );

      let shareMessage = {
        senderId: loggedInUser.id,
        senderName: loggedInUser.username,
        recipientId: userDropdown.value,
        userTodos,
      };

      let sharedMessages =
        JSON.parse(localStorage.getItem("sharedMessages")) || [];

      const existingMessage = sharedMessages.find(
        (msg) =>
          msg.senderId === shareMessage.senderId &&
          msg.recipientId === shareMessage.recipientId,
      );

      if (existingMessage) {
        // overwrite existing share
        existingMessage.userTodos = shareMessage.userTodos;
      } else {
        // create new share
        sharedMessages.push(shareMessage);
      }

      localStorage.setItem("sharedMessages", JSON.stringify(sharedMessages));
    }

    shareListBtn.addEventListener("click", shareList);

    shareListInputDiv.append(userDropdown, shareListBtn);
    shareListDiv.append(shareListInputDiv);
  }

  share();

  function checkReceivedMessages() {
    const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
    const sharedMessages = JSON.parse(localStorage.getItem("sharedMessages"));

    if (!sharedMessages) return;

    //loggedinuser.id is ia number, while recipeient id comes from input.value which is a string. Changed to filter if i want to show messages from multiple users to the same user.
    const sharedMessage = sharedMessages.filter(
      (msg) => Number(msg.recipientId) === loggedInUser.id,
    );

    //this is for when i only rendered 1 recieved message
    // let userTodos = sharedMessage.userTodos;

    sharedMessage.forEach((message) => {
      let userTodos = message.userTodos;
      renderReceivedMessage(message, userTodos);
    });

    function renderReceivedMessage(message, userTodos) {
      const sharedTodos = document.createElement("div");
      sharedTodos.classList.add("shared-todos");

      const completedList = document.createElement("ul");
      const incompletedList = document.createElement("ul");

      const completedTodos = userTodos.filter((todo) => todo.completed);
      const incompletedTodos = userTodos.filter((todo) => !todo.completed);

      completedTodos.forEach((todo) => {
        let li = document.createElement("li");
        li.innerText = todo.todo;

        completedList.append(li);
      });

      incompletedTodos.forEach((todo) => {
        let li = document.createElement("li");
        li.innerText = todo.todo;
        incompletedList.append(li);
      });

      const incompleteHeading = document.createElement("h4");
      incompleteHeading.innerText = "Incomplete";

      const completeHeading = document.createElement("h4");
      completeHeading.innerText = "Completed";

      const listHeading = document.createElement("h3");
      listHeading.innerText = `${message.senderName}'s To-Do List`;

      sharedTodos.append(
        listHeading,
        incompleteHeading,
        incompletedList,
        completeHeading,
        completedList,
      );
      sharedContainer.append(sharedTodos);
    }

    // renderReceivedMessage();
  }
  checkReceivedMessages();
}

//Dark mode toggle
function dmToggle() {
  const body = document.body;
  body.classList.toggle("DM");

  const loggedUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (!loggedUser) return; // nothing to save if no user

  // get all user settings
  let userSettings = JSON.parse(localStorage.getItem("userSettings")) || {};

  // save the darkMode for this user
  userSettings[loggedUser.id] = body.classList.contains("DM");

  localStorage.setItem("userSettings", JSON.stringify(userSettings));

  // update the button text
  dmToggleBtn.innerText = body.classList.contains("DM")
    ? "Light Mode"
    : "Dark Mode";
}

dmToggleBtn.addEventListener("click", dmToggle);

//Check whether dark mode is saved or not
function applyUserSettings() {
  const loggedUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (!loggedUser) return;

  const userSettings = JSON.parse(localStorage.getItem("userSettings")) || {};
  const darkMode = userSettings[loggedUser.id]; // true or false

  if (darkMode) {
    document.body.classList.add("DM");
    dmToggleBtn.innerText = "Light Mode";
  } else {
    document.body.classList.remove("DM");
    dmToggleBtn.innerText = "Dark Mode";
  }
}
