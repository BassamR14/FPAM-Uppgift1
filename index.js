//Register User
const registerBtn = document.querySelector("#register-btn");
let users = [];

function register() {
  const registerUserInput = document.querySelector("#register-user");
  const registerPasswordInput = document.querySelector("#register-password");

  let user = {
    username: registerUserInput.value,
    password: registerPasswordInput.value,
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

  //   Check if any of inputs are saved in LS
  const isTrue = savedUsers.some(
    (user) =>
      user.username === signInUserInput.value &&
      user.password === signInPasswordInput.value,
  );

  console.log(isTrue);

  //check if button exists
  const existingLogoutBtn = document.querySelector("#logout-btn");

  if (isTrue) {
    h3.innerText = "Signed In as " + signInUserInput.value;
    h3.style.color = "green";

    // Store logged-in user
    sessionStorage.setItem("loggedInUser", signInUserInput.value);

    //so that only 1 button is created
    if (!document.querySelector("#logout-btn")) {
      const logoutBtn = document.createElement("button");
      logoutBtn.id = "logout-btn";
      logoutBtn.innerText = "Log Out";
      signInDiv.append(logoutBtn);

      logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("loggedInUser");
        logoutBtn.remove();
        h3.innerText = "";
      });
    }
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
  const loggedInUser = sessionStorage.getItem("loggedInUser");

  if (loggedInUser) {
    h3.innerText = `Currently signed in as ${loggedInUser}`;

    if (!document.querySelector("#logout-btn")) {
      const logoutBtn = document.createElement("button");
      logoutBtn.id = "logout-btn";
      logoutBtn.innerText = "Log Out";
      signInDiv.append(logoutBtn);

      logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("loggedInUser");
        logoutBtn.remove();
        h3.innerText = "";
      });
    }
  }
}

checkSignedIn();
