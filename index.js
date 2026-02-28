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

    //so that only 1 button is created
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
  if (document.querySelector("#logout-btn")) return;

  const logoutBtn = document.createElement("button");
  logoutBtn.id = "logout-btn";
  logoutBtn.innerText = "Log Out";
  actionBtnsDiv.append(logoutBtn);

  logoutBtn.addEventListener("click", logout);
}

//Function for logging out
function logout() {
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
  //Create To-do div + todo inputs + todo list

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
  todoDiv.append(todoListDiv);

  //Take input values and save in LS with user ID
  saveBtn.addEventListener("click", () => {
    const loggedUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

    let todo = {
      userId: loggedUser.id,
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
  });

  function renderList() {
    todoListDiv.innerHTML = "";

    const completedList = document.createElement("ul");
    const incompletedList = document.createElement("ul");

    const allTodos = JSON.parse(localStorage.getItem("todos")) || [];
    const loggedUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
    const userTodos = allTodos.filter((todo) => todo.userId === loggedUser.id);
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
}

//Dark mode toggle
function dmToggle() {
  const body = document.body;
  body.classList.toggle("DM");

  const loggedUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (!loggedUser) return; // nothing to save if no user

  // get all user settings or start fresh
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
