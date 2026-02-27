//Register User
const registerBtn = document.querySelector("#register-btn");
let users = [];
let currentTodoDiv = null;

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

//to clear LS: LS.clear()

//Sign in with User

const signInBtn = document.querySelector("#signIn-btn");

const signInDiv = document.querySelector(".signIn-div");
let h3 = document.createElement("h3");
signInDiv.append(h3);

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
    if (!document.querySelector("#logout-btn")) {
      const logoutBtn = document.createElement("button");
      logoutBtn.id = "logout-btn";
      logoutBtn.innerText = "Log Out";
      signInDiv.append(logoutBtn);

      logoutBtn.addEventListener("click", () => {
        if (currentTodoDiv) {
          currentTodoDiv.remove();
          currentTodoDiv = null;
        }
        sessionStorage.removeItem("loggedInUser");
        // sessionStorage.clear();
        logoutBtn.remove();
        h3.innerText = "";
      });
    }

    todoList();
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

  document.querySelector(".signIn-div").reset();
}

signInBtn.addEventListener("click", signIn);

function checkSignedIn() {
  const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

  if (loggedInUser) {
    h3.innerText = `Currently signed in as ${loggedInUser.username}`;

    if (!document.querySelector("#logout-btn")) {
      const logoutBtn = document.createElement("button");
      logoutBtn.id = "logout-btn";
      logoutBtn.innerText = "Log Out";
      signInDiv.append(logoutBtn);

      logoutBtn.addEventListener("click", () => {
        if (currentTodoDiv) {
          currentTodoDiv.remove();
          currentTodoDiv = null;
        }
        sessionStorage.removeItem("loggedInUser");
        logoutBtn.remove();
        h3.innerText = "";
      });
    }

    todoList();
  }
}

checkSignedIn();

//Need to store my todo Div
let todos = [];

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

  todoInputDiv.append(checkboxLabel, todoInputLabel, saveBtn);
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

    todoListDiv.innerHTML = "";

    const completedList = document.createElement("ul");
    const incompletedList = document.createElement("ul");

    const allTodos = JSON.parse(localStorage.getItem("todos")) || [];
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

    todoListDiv.append(
      incompleteHeading,
      incompletedList,
      completeHeading,
      completedList,
    );
  });

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

  todoListDiv.append(
    incompleteHeading,
    incompletedList,
    completeHeading,
    completedList,
  );
}
