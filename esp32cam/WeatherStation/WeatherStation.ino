#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Camera pins for AI Thinker ESP32-CAM
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server details
const char* serverUrl = "YOUR_SERVER_URL";
const char* apiKey = "YOUR_API_KEY";

// Serial communication
String inputBuffer = "";
bool newData = false;

void setup() {
  Serial.begin(115200);
  
  // Initialize camera
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // Initialize with high specs to pre-allocate larger buffers
  if(psramFound()){
    config.frame_size = FRAMESIZE_UXGA;
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

void loop() {
  // Check for incoming serial data from Arduino
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      processSerialData();
      inputBuffer = "";
    } else {
      inputBuffer += c;
    }
  }

  // Check for server commands
  checkServerCommands();
  
  delay(100);
}

void processSerialData() {
  if (inputBuffer.startsWith("DATA:")) {
    String data = inputBuffer.substring(5);
    sendWeatherData(data);
  }
}

void sendWeatherData(String data) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(String(serverUrl) + "/api/weather");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", apiKey);

  // Parse CSV data into JSON
  StaticJsonDocument<512> doc;
  String values[10];
  int valueIndex = 0;
  int startPos = 0;
  
  for (int i = 0; i < data.length(); i++) {
    if (data[i] == ',' || i == data.length() - 1) {
      values[valueIndex++] = data.substring(startPos, i);
      startPos = i + 1;
    }
  }

  doc["temperature"] = values[0].toFloat();
  doc["humidity"] = values[1].toFloat();
  doc["pressure"] = values[2].toFloat();
  doc["rainDetection"] = values[3] == "1";
  doc["lightIntensity"] = values[4].toFloat();
  doc["uvIndex"] = values[5].toFloat();
  doc["windSpeed"] = values[6].toFloat();
  doc["windDirection"] = values[7];
  doc["noiseLevel"] = values[8].toFloat();
  doc["airQuality"] = values[9].toInt();

  String jsonString;
  serializeJson(doc, jsonString);

  int httpResponseCode = http.POST(jsonString);
  http.end();
}

void captureAndSendImage() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverUrl) + "/api/camera");
    http.addHeader("Content-Type", "image/jpeg");
    http.addHeader("X-API-Key", apiKey);
    
    int httpResponseCode = http.POST(fb->buf, fb->len);
    http.end();
  }

  esp_camera_fb_return(fb);
}

void checkServerCommands() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(String(serverUrl) + "/api/commands");
  http.addHeader("X-API-Key", apiKey);
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String payload = http.getString();
    StaticJsonDocument<200> doc;
    deserializeJson(doc, payload);
    
    const char* command = doc["command"];
    if (strcmp(command, "CAPTURE_IMAGE") == 0) {
      captureAndSendImage();
    } else if (strcmp(command, "GET_WEATHER") == 0) {
      Serial.println("GET_DATA");
    }
  }
  
  http.end();
}