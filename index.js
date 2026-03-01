// ============================
// Helper Functions
// ============================

// Create DOM elements easily
function createElement(type, props = {}, children = []) {
  const el = document.createElement(type);
  for (const key in props) {
    if (key === "class") el.className = props[key];
    else if (key === "text") el.innerText = props[key];
    else if (key === "value") el.value = props[key];
    else if (key === "checked") el.checked = props[key];
    else el.setAttribute(key, props[key]);
  }
  children.forEach((child) => el.append(child));
  return el;
}

// Show feedback messages
function showMessage(message, color = "black") {
  h3.innerText = message;
  h3.style.color = color;
}

// Get current logged-in user
function getLoggedInUser() {
  return JSON.parse(sessionStorage.getItem("loggedInUser"));
}

// Save per-user settings
function saveUserSetting(userId, key, value) {
  let settings = JSON.parse(localStorage.getItem("userSettings")) || {};
  settings[userId] = settings[userId] || {};
  settings[userId][key] = value;
  localStorage.setItem("userSettings", JSON.stringify(settings));
}

// Get per-user settings
function getUserSettings(userId) {
  const settings = JSON.parse(localStorage.getItem("userSettings")) || {};
  return settings[userId] || {};
}

// ============================
// Global Variables
// ============================

const registerBtn = document.querySelector("#register-btn");
const signInBtn = document.querySelector("#signIn-btn");
const signInDiv = document.querySelector(".signIn-div");
const actionBtnsDiv = document.querySelector(".action-btns");
const dmToggleBtn = document.querySelector(".dm-toggle");

let h3 = createElement("h3");
signInDiv.append(h3);

let currentTodoDiv = null;

// ============================
// User Registration
// ============================

function register() {
  const usernameInput = document.querySelector("#register-user");
  const passwordInput = document.querySelector("#register-password");

  if (!usernameInput.value || !passwordInput.value) {
    showMessage("Please enter username & password", "red");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.some((u) => u.username === usernameInput.value)) {
    showMessage("Username already exists", "red");
    return;
  }

  const user = {
    username: usernameInput.value,
    password: passwordInput.value,
    id: Date.now(),
  };
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));

  document.querySelector(".register-div").reset();
  showMessage("User registered!", "green");
}

registerBtn.addEventListener("click", register);

// ============================
// Sign-In & Logout
// ============================

function signIn() {
  const usernameInput = document.querySelector("#signIn-user");
  const passwordInput = document.querySelector("#signIn-password");

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const foundUser = users.find(
    (u) =>
      u.username === usernameInput.value && u.password === passwordInput.value,
  );

  document.querySelector("#logout-btn")?.remove();

  if (foundUser) {
    sessionStorage.setItem("loggedInUser", JSON.stringify(foundUser));
    showMessage(`Signed in as ${foundUser.username}`, "green");
    createLogoutButton();
    todoList();
    applyUserSettings();
  } else {
    sessionStorage.removeItem("loggedInUser");
    showMessage("Try Again", "red");
  }

  signInDiv.reset();
}

signInBtn.addEventListener("click", signIn);

function createLogoutButton() {
  if (document.querySelector("#logout-btn")) return;

  const logoutBtn = createElement("button", {
    id: "logout-btn",
    text: "Log Out",
  });
  actionBtnsDiv.append(logoutBtn);
  logoutBtn.addEventListener("click", logout);
}

function logout() {
  currentTodoDiv?.remove();
  currentTodoDiv = null;

  document.body.classList.remove("DM");
  dmToggleBtn.innerText = "Dark Mode";

  sessionStorage.removeItem("loggedInUser");
  document.querySelector("#logout-btn")?.remove();
  h3.innerText = "";
}

function checkSignedIn() {
  const user = getLoggedInUser();
  if (user) {
    showMessage(`Currently signed in as ${user.username}`, "green");
    createLogoutButton();
    todoList();
    applyUserSettings();
  }
}

checkSignedIn();

// ============================
// Dark Mode
// ============================

function dmToggle() {
  const body = document.body;
  body.classList.toggle("DM");

  const user = getLoggedInUser();
  if (user) saveUserSetting(user.id, "darkMode", body.classList.contains("DM"));

  dmToggleBtn.innerText = body.classList.contains("DM")
    ? "Light Mode"
    : "Dark Mode";
}

dmToggleBtn.addEventListener("click", dmToggle);

function applyUserSettings() {
  const user = getLoggedInUser();
  if (!user) return;

  const settings = getUserSettings(user.id);
  if (settings.darkMode) {
    document.body.classList.add("DM");
    dmToggleBtn.innerText = "Light Mode";
  } else {
    document.body.classList.remove("DM");
    dmToggleBtn.innerText = "Dark Mode";
  }
}

// ============================
// To-Do List
// ============================

function todoList() {
  if (currentTodoDiv) return currentTodoDiv;

  const todoDiv = createElement("div", { class: "todo-div" });
  const todoInputDiv = createElement("form");
  const checkbox = createElement("input", { type: "checkbox" });
  const checkboxLabel = createElement("label", { text: " Completed" }, [
    checkbox,
  ]);
  const todoInput = createElement("input");
  const todoInputLabel = createElement("label", { text: "To do: " }, [
    todoInput,
  ]);
  const saveBtn = createElement("button", {
    type: "button",
    text: "Save",
    class: "save-btn",
  });
  const inputHeading = createElement("h3", { text: "Create To-dos" });

  todoInputDiv.append(inputHeading, checkboxLabel, todoInputLabel, saveBtn);
  todoDiv.append(todoInputDiv);
  document.body.append(todoDiv);

  currentTodoDiv = todoDiv;

  const todoListDiv = createElement("div");
  todoDiv.append(todoListDiv);

  // Create todo item
  function createListItem() {
    const loggedUser = getLoggedInUser();
    if (!loggedUser || !todoInput.value.trim()) return;

    const allTodos = JSON.parse(localStorage.getItem("todos")) || [];
    allTodos.push({
      userId: loggedUser.id,
      id: Date.now(),
      completed: checkbox.checked,
      todo: todoInput.value,
    });

    localStorage.setItem("todos", JSON.stringify(allTodos));
    todoInputDiv.reset();
    renderList();
  }

  saveBtn.addEventListener("click", createListItem);

  // Render todo list
  function renderList() {
    todoListDiv.innerHTML = "";

    const loggedUser = getLoggedInUser();
    if (!loggedUser) return;

    const allTodos = JSON.parse(localStorage.getItem("todos")) || [];
    const userTodos = allTodos.filter((todo) => todo.userId === loggedUser.id);
    const completedTodos = userTodos.filter((t) => t.completed);
    const incompletedTodos = userTodos.filter((t) => !t.completed);

    function renderListItem(todo) {
      const span = createElement("span", { text: todo.todo });
      const editBtn = createElement("button", {
        text: "Edit",
        class: "edit-btn",
      });
      editBtn.addEventListener("click", () => editFn(todo));
      const listItem = createElement("div", { class: "list-item" }, [
        span,
        editBtn,
      ]);
      return createElement("li", {}, [listItem]);
    }

    const incompleteHeading = createElement("h4", { text: "Incomplete" });
    const completeHeading = createElement("h4", { text: "Completed" });
    const listHeading = createElement("h3", {
      text: `${loggedUser.username}'s To-Do List`,
    });

    const incompletedList = createElement("ul");
    incompletedTodos.forEach((todo) =>
      incompletedList.append(renderListItem(todo)),
    );

    const completedList = createElement("ul");
    completedTodos.forEach((todo) =>
      completedList.append(renderListItem(todo)),
    );

    todoListDiv.append(
      listHeading,
      incompleteHeading,
      incompletedList,
      completeHeading,
      completedList,
    );
  }

  renderList();

  // Edit To-Do
  function editFn(todo) {
    const checkboxEdit = createElement("input", {
      type: "checkbox",
      checked: todo.completed,
    });
    const checkboxEditLabel = createElement("label", { text: " Completed" }, [
      checkboxEdit,
    ]);
    const todoInputEdit = createElement("input", { value: todo.todo });
    const todoInputEditLabel = createElement("label", { text: "To do: " }, [
      todoInputEdit,
    ]);
    const saveEditBtn = createElement("button", {
      type: "button",
      text: "Edit",
    });
    const closeBtn = createElement("button", {
      type: "button",
      text: "Close",
      class: "close-btn",
    });
    const inputEditHeading = createElement("h3", { text: "Edit To-do" });

    const todoInputEditDiv = createElement("form", {}, [
      inputEditHeading,
      checkboxEditLabel,
      todoInputEditLabel,
      saveEditBtn,
      closeBtn,
    ]);

    const todoListEditDiv = createElement("div", { class: "edit-modal" }, [
      todoInputEditDiv,
    ]);
    document.body.append(todoListEditDiv);

    saveEditBtn.addEventListener("click", () => {
      const allTodos = JSON.parse(localStorage.getItem("todos")) || [];
      const currentTodo = allTodos.find((t) => t.id === todo.id);
      if (!currentTodo) return;

      currentTodo.todo = todoInputEdit.value;
      currentTodo.completed = checkboxEdit.checked;
      localStorage.setItem("todos", JSON.stringify(allTodos));

      todoListEditDiv.remove();
      renderList();
    });

    closeBtn.addEventListener("click", () => todoListEditDiv.remove());
  }
}
