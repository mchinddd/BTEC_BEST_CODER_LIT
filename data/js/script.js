// lấy elements
const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");
// tạo và thêm sự kiện click
signUpButton.addEventListener("click", () => {
  container.classList.add("right-panel-active");
  // Ẩn các thông báo lỗi từ form đăng nhập
  emailErrorL.style.visibility = "hidden";
  passErrorL.style.visibility = "hidden";
});
signInButton.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
  // Ẩn các thông báo lỗi từ form đăng ký
  emailErrorR.style.visibility = "hidden";
  passErrorR.style.visibility = "hidden";
  rePassErrorR.style.visibility = "hidden";
});

// lấy elements từ formRegister
const formRegister = document.getElementById("formRegister");
const emailR = document.getElementById("e-R");
const passwordR = document.getElementById("pass-R");
const rePasswordR = document.getElementById("rePass-R");
// lấy elements lỗi từ formRegister
const emailErrorR = document.getElementById("eError-R");
const passErrorR = document.getElementById("passError-R");
const rePassErrorR = document.getElementById("rePassError-R");

//lấy dữ liệu từ localStorage
const userLocal = JSON.parse(localStorage.getItem("users")) || [];

//lắng nghe sự kiên submit form đăng kí
formRegister.addEventListener("submit", function (e) {
  //năng chặn load trang
  e.preventDefault();

  //validate dữ liệu
  if (!emailR.value) {
    emailErrorR.style.visibility = "visible";
  } else {
    emailErrorR.style.visibility = "hidden";
  }
  if (!passwordR.value) {
    passErrorR.style.visibility = "visible";
  } else {
    passErrorR.style.visibility = "hidden";
  }
  if (!rePasswordR.value) {
    rePassErrorR.style.visibility = "visible";
  } else {
    rePassErrorR.style.visibility = "hidden";
  }

  if (rePasswordR.value !== passwordR.value) {
    rePassErrorR.style.visibility = "visible";
    rePassErrorR.innerHTML = "Mật khẩu không khớp";
  }
  const emailExists = userLocal.some((user) => user.email === emailR.value);

  if (emailExists) {
    emailErrorR.style.visibility = "visible";
    emailErrorR.innerHTML = "Email đã được đăng ký";
  } else {
    //gửi dữ liệu từ form lên localStorage
    if (
      emailR.value &&
      passwordR.value &&
      rePasswordR.value &&
      passwordR.value === rePasswordR.value
    ) {
      // tạo UUID cho userId
      const userId = generateUUID();
      const user = {
        // Định nghĩa biến user
        userId: userId,
        email: emailR.value,
        password: passwordR.value,
      };

      // localStorage.removeItem("users");

      //push user vào mảng userLocal
      userLocal.push(user);

      //Lưu user vào localStorage
      localStorage.setItem("users", JSON.stringify(userLocal));

      //chuyển hướng trang web
      window.location.href = "login.html";
    }
  }
});
// lấy elements từ formLogin
const formLogin = document.getElementById("formLogin");
const emailL = document.getElementById("e-L");
const passwordL = document.getElementById("pass-L");

// lấy elements lỗi từ formLogin
const emailErrorL = document.getElementById("eError-L");
const passErrorL = document.getElementById("passError-L");

//lắng nghe sự kiên submit form đăng nhập
formLogin.addEventListener("submit", function (e) {
  //năng chặn load trang
  e.preventDefault();

  //validate dữ liệu
  if (!emailL.value) {
    emailErrorL.style.visibility = "visible";
  } else {
    emailErrorL.style.visibility = "hidden";
  }

  const findUser = userLocal.find(
    (user) => user.email === emailL.value && user.password === passwordL.value
  );

  if (!passwordL.value) {
    passErrorL.style.visibility = "visible";
    passErrorL.innerHTML = "Password không được để trống";
  } else {
    // passErrorL.style.visibility = "hidden";
    if (!findUser) {
      passErrorL.style.visibility = "visible";
      passErrorL.innerHTML = "Email hoặc Password sai";
    } else {
      window.location.href = "index.html";
    }
  }
});

function togglePassword(inputId, iconElement) {
  const input = document.getElementById(inputId);
  const icon = iconElement;

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

//tạo uuid
function generateUUID() {
  let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      let r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );
  return uuid;
}
