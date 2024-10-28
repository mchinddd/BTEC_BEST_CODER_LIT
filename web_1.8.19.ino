// Bao gồm các thư viện cần thiết
#include <OneWire.h>
#include <DallasTemperature.h>
#include <AsyncEventSource.h>
#include <AsyncJson.h>
#include <AsyncWebSocket.h>
#include <ESPAsyncWebServer.h>
#include <WebAuthentication.h>
#include <WebHandlerImpl.h>
#include <WebResponseImpl.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <SPIFFS.h>

// Khai báo chân relay
const int relayPin = 16; // Chân GPIO16

// Cấu hình cảm biến độ đục (kết nối với chân D4)
const int TURBIDITY_PIN = 34;

// Cấu hình cảm biến DS18B20
const int ONE_WIRE_BUS = 5;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Khai báo trạng thái relay
bool relayStatus = LOW;

// Cấu hình WiFi và WebSocket
const char* ssid = "OPPO A31";
const char* password = "12345678";
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

void setup() {
  Serial.begin(115200);
  
  pinMode(TURBIDITY_PIN, INPUT);

    pinMode(relayPin, OUTPUT);  // Cấu hình relay là OUTPUT
    
  // Khởi động cảm biến
  sensors.begin();

  // Khởi tạo SPIFFS và WiFi
  if (!SPIFFS.begin(true)) {
    Serial.println("Không thể khởi tạo SPIFFS");
    return;
  }
  Serial.println("SPIFFS khởi tạo thành công");
  
  initWiFi();
  Serial.println("Kết nối WiFi thành công!");
  Serial.print("Địa chỉ IP: ");
  Serial.println(WiFi.localIP());

  initWebSocket();
  
  // Cấu hình các endpoint cho các trang web
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("Đang phục vụ login.html");
    request->send(SPIFFS, "/pages/login.html", "text/html");
  });
  
  server.on("/login.html", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("Đang phục vụ login.html");
    request->send(SPIFFS, "/pages/login.html", "text/html");
  });

  server.on("/index.html", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("Đang phục vụ index.html");
    request->send(SPIFFS, "/pages/index.html", "text/html");
  });

  server.on("/forgotPass.html", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("Đang phục vụ forgotPass.html");
    request->send(SPIFFS, "/pages/forgotPass.html", "text/html");
  });

  server.on("/css/style.css", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/css/style.css", "text/css");
  });

  server.on("/css/forgotPass.css", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/css/forgotPass.css", "text/css");
  });
  
  server.on("/css/index.css", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/css/index.css", "text/css");
  });

  server.on("/js/index.js", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/js/index.js", "application/javascript");
  });

  server.on("/js/forgotPass.js", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/js/forgotPass.js", "application/javascript");
  });

  server.on("/js/script.js", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/js/script.js", "application/javascript");
  });

  server.on("/ico/favicon.ico", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/ico/favicon.ico", "image/x-icon");
  });

  server.on("/img/backgroundNight.jpg", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/img/backgroundNight.jpg", "image/jpg");
  });

  server.on("/img/canhDep.jpg", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/img/canhDep.jpg", "image/jpg");
  });

  server.begin();
}

void sendTemperatureAndTurbidity() {

   // Đọc giá trị analog từ cảm biến độ đục
  
}

void initWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Đang kết nối WiFi...");
  
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(1000);
  }
  
  Serial.println(WiFi.localIP());
}

void notifyClients(const char* message) {
  ws.textAll(message);
}



void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;

  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    String message = String((char*)data);
    message.remove(len);  // Đảm bảo chuỗi chỉ chứa tin nhắn

    // Kiểm tra tin nhắn có phải là yêu cầu đổi trạng thái relay
    if (message == "{\"relayStatus\":\"ON\"}") {
      relayStatus = HIGH;  // Bật relay
    } else if (message == "{\"relayStatus\":\"OFF\"}") {
      relayStatus = LOW;   // Tắt relay
    }

    // Cập nhật trạng thái relay
    digitalWrite(relayPin, relayStatus);

    // Gửi lại trạng thái mới của relay đến các client để cập nhật giao diện
    String json = "{\"relayStatus\": \"" + String(relayStatus == HIGH ? "ON" : "OFF") + "\"}";
    notifyClients(json.c_str());
  }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.printf("Client #%u đã kết nối\n", client->id());
      break;
    case WS_EVT_DISCONNECT:
      Serial.printf("Client #%u đã ngắt kết nối\n", client->id());
      break;
    case WS_EVT_DATA:
      handleWebSocketMessage(arg, data, len);
      break;
    case WS_EVT_ERROR:  // Thêm xử lý lỗi WebSocket
      Serial.printf("WebSocket error #%u\n", client->id());
      break;
  }
}

void initWebSocket() {
  ws.onEvent(onEvent);
  server.addHandler(&ws);
}


void loop() {
  ws.cleanupClients();
//  sendTemperatureAndTurbidity();
int sensorValue = analogRead(TURBIDITY_PIN);

    // Chuyển đổi giá trị sang điện áp
 // float voltage = sensorValue * (3.3 / 4095.0);  Độ phân giải 12-bit (0 - 4095) trên ESP32
  
  // Đọc nhiệt độ từ cảm biến DS18B20
  sensors.requestTemperatures();
  float temperatureC = sensors.getTempCByIndex(0);

// Kiểm tra nhiệt độ để bật/tắt relay
  bool relayTemperature = (temperatureC >= 10.0 && temperatureC <= 25.0) ? HIGH : LOW ;
  digitalWrite(relayPin, relayTemperature);

  // Kiểm tra độ đục để bật/tắt relay
  bool relayTurbidity = (sensorValue < 1600) ? HIGH : LOW;
  digitalWrite(relayPin, relayTurbidity);
  
//   Tạo chuỗi JSON để gửi nhiệt độ và độ đục qua WebSocket

  String json = "{\"temperature\": ";
json += temperatureC;
json += ", \"turbidity\": ";
json += sensorValue;
json += ", \"relayStatus\": \"";
json += (relayTemperature == LOW || relayTurbidity == HIGH) ? "ON" : "OFF";
json += "\"}";
  
  notifyClients(json.c_str());
  delay(5000);  // Đợi 5 giây trước khi đọc và gửi lại dữ liệu
}
