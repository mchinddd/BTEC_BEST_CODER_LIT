//element formConfirmUser
const formConfirmUser = document.getElementById("formConfirmUser");
const emailF = document.getElementById("email");

//
const userLocal = JSON.parse(localStorage.getItem("users")) || [];
goToStage(1);
formConfirmUser.addEventListener("submit", function (e) {
  e.preventDefault();
  //
  const findUser = userLocal.find((user) => user.email === emailF.value);

  if (!findUser) {
    goToStage(1);
    showTooltip("tooltip-email");
  } else {
    //lưu user hiện tại
    currentUserEmail = findUser.email;
    //
    showNewPasswordForm();
  }
});

//element formSetPass
const formSetPass = document.getElementById("formSetPass");
const newPasswordF = document.getElementById("newPassword");
const confirmPasswordF = document.getElementById("confirmPassword");

// email của người dùng tìm thấy
let currentUserEmail = "";

//
function showNewPasswordForm() {
  formSetPass.style.display = "block";
  formConfirmUser.style.display = "none";
  goToStage(2);
  formSetPass.addEventListener("submit", function (e) {
    e.preventDefault();
    if (newPasswordF.value === confirmPasswordF.value) {
      // tìm người dùng hiện tại trong userLocal
      const findUserIndex = userLocal.findIndex(
        (user) => user.email === currentUserEmail
      );

      if (findUserIndex !== -1) {
        // cập nhật mật khẩu mới cho người dùng
        userLocal[findUserIndex].password = newPasswordF.value;

        // lưu lại dữ liệu vào localStorage
        localStorage.setItem("users", JSON.stringify(userLocal));
      }
      window.location.href = "login.html";
    } else {
      showTooltip("tooltip-password");
    }
  });
}

function goToStage(stepNumber) {
  // Xóa màu xanh của tất cả các bước
  document.querySelectorAll(".stage").forEach(function (stage) {
    stage.classList.remove("active");
  });

  // Đặt màu xanh cho bước hiện tại
  document.getElementById("stage-" + stepNumber).classList.add("active");
}

// tooltip
function showTooltip(tooltipId) {
  var tooltip = document.getElementById(tooltipId);
  tooltip.classList.add("show");

  // ẩn sau 2 giây
  setTimeout(function () {
    tooltip.classList.remove("show");
  }, 2000);
}

// function hideTooltip() {
//   var tooltip = document.getElementById("tooltip");
//   tooltip.classList.remove("show");
// }

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
