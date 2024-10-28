// Simulate date-time
// document.getElementById("date-time").innerText = new Date().toLocaleString();

function updateDateTime() {
  const dateTimeElement = document.getElementById("date-time");
  const now = new Date();

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";

  const formattedTime = `${String(hours % 12 || 12).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")} ${ampm}`;
  const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`;

  dateTimeElement.textContent = `${formattedTime}, ${formattedDate}`;
}

// Cập nhật thời gian mỗi giây
setInterval(updateDateTime, 1000);

// Gọi hàm ngay lập tức khi trang tải
updateDateTime();

// WebSocket setup for receiving real-time temperature and turbidity data
let socket = new WebSocket(`ws://${window.location.hostname}/ws`);
const quaNhiet = document.getElementById("quaNhiet");
const highTurbidity = document.getElementById("highTurbidity");

socket.onopen = function () {
  console.log("WebSocket kết nối thành công!");
};

socket.onmessage = function (event) {
  let data = JSON.parse(event.data);

  // Hiển thị nhiệt độ
  if (data.temperature !== undefined) {
    document.getElementById("temperature").innerText =
      data.temperature.toFixed(2);

    if (data.temperature >= 25.0 || data.temperature <= 10.0) {
      quaNhiet.style.display = "block";
    } else {
      quaNhiet.style.display = "none";
    }
  }

  // Hiển thị độ đục
  if (data.turbidity !== undefined) {
    document.getElementById("turbidity").innerText = data.turbidity;
    // console.log("Cam bien do duc da duoc gui");
    if (data.turbidity < 1600) {
      highTurbidity.style.display = "block";
    } else {
      highTurbidity.style.display = "none";
    }
  }
  // Hiển thị trạng thái relay
  if (data.relayStatus !== undefined) {
    document.getElementById("relayStatus").innerText = data.relayStatus;
  }
};

socket.onclose = function () {
  console.log("WebSocket đã đóng kết nối.");
};

socket.onerror = function (error) {
  console.log("Lỗi WebSocket: " + error.message);
};

// Thêm sự kiện click để thay đổi trạng thái relay
document.getElementById("relayStatus").onclick = function () {
  let currentStatus = document.getElementById("relayStatus").innerText;

  // Chuyển đổi trạng thái relay
  let newStatus = currentStatus === "OFF" ? "ON" : "OFF";
  document.getElementById("relayStatus").innerText = newStatus;

  // Gửi trạng thái mới qua WebSocket để cập nhật máy chủ (nếu cần)
  socket.send(JSON.stringify({ relayStatus: newStatus }));
};
