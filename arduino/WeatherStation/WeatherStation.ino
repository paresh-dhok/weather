#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <BH1750.h>
#include <SoftwareSerial.h>

// Pin Definitions
#define RAIN_PIN 2
#define WIND_RX 3
#define WIND_TX 4
#define WIND_DE 5
#define MQ135_PIN A0
#define UV_PIN A1
#define SOUND_PIN A2

// Constants
#define SEALEVELPRESSURE_HPA (1013.25)
#define WIND_SENSOR_ADDR 0x01

// Object Initialization
Adafruit_BME280 bme;
BH1750 lightMeter;
SoftwareSerial windSerial(WIND_RX, WIND_TX);

// Global Variables
unsigned long lastReadTime = 0;
const unsigned long READ_INTERVAL = 10000; // 10 seconds

struct WeatherData {
  float temperature;
  float humidity;
  float pressure;
  bool rainDetected;
  float lightIntensity;
  float uvIndex;
  float windSpeed;
  String windDirection;
  float noiseLevel;
  int airQuality;
};

WeatherData currentData;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  
  // Initialize BME280
  if (!bme.begin(0x76)) {
    Serial.println("BME280 not found!");
    while (1);
  }

  // Initialize BH1750
  if (!lightMeter.begin()) {
    Serial.println("BH1750 not found!");
    while (1);
  }

  // Initialize Wind Sensor
  pinMode(WIND_DE, OUTPUT);
  windSerial.begin(9600);

  // Initialize other pins
  pinMode(RAIN_PIN, INPUT);
  pinMode(MQ135_PIN, INPUT);
  pinMode(UV_PIN, INPUT);
  pinMode(SOUND_PIN, INPUT);

  Serial.println("Weather Station Initialized");
}

void loop() {
  if (millis() - lastReadTime >= READ_INTERVAL) {
    readSensors();
    sendDataToESP32();
    lastReadTime = millis();
  }

  // Check for commands from ESP32
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    handleCommand(command);
  }
}

void readSensors() {
  // BME280 readings
  currentData.temperature = bme.readTemperature();
  currentData.humidity = bme.readHumidity();
  currentData.pressure = bme.readPressure() / 100.0F;

  // Rain detection
  currentData.rainDetected = !digitalRead(RAIN_PIN);

  // Light intensity
  currentData.lightIntensity = lightMeter.readLightLevel();

  // UV Index
  float uvVoltage = analogRead(UV_PIN) * (5.0 / 1023.0);
  currentData.uvIndex = mapUVIndexValue(uvVoltage);

  // Wind data
  readWindSensor();

  // Noise level
  currentData.noiseLevel = readNoiseLevel();

  // Air quality
  currentData.airQuality = readAirQuality();
}

void readWindSensor() {
  digitalWrite(WIND_DE, HIGH);
  delay(10);
  
  byte command[] = {WIND_SENSOR_ADDR, 0x03, 0x00, 0x00, 0x00, 0x02};
  for (byte b : command) {
    windSerial.write(b);
  }
  
  digitalWrite(WIND_DE, LOW);
  delay(100);

  if (windSerial.available() >= 7) {
    byte response[7];
    windSerial.readBytes(response, 7);
    
    // Parse wind speed and direction
    currentData.windSpeed = ((response[3] << 8) | response[4]) / 10.0;
    int direction = (response[5] << 8) | response[6];
    currentData.windDirection = getWindDirection(direction);
  }
}

float readNoiseLevel() {
  const int samples = 100;
  long sum = 0;
  
  for(int i = 0; i < samples; i++) {
    sum += analogRead(SOUND_PIN);
    delay(1);
  }
  
  float average = sum / samples;
  return map(average, 0, 1023, 30, 130); // Map to dB scale
}

int readAirQuality() {
  int reading = analogRead(MQ135_PIN);
  return map(reading, 0, 1023, 0, 500); // Map to AQI scale
}

float mapUVIndexValue(float voltage) {
  // UV Index mapping based on GUVA-S12SD characteristics
  if (voltage < 0.050) return 0.0;
  if (voltage < 0.227) return voltage / 0.045;
  if (voltage < 0.318) return 3.0;
  if (voltage < 0.408) return 4.0;
  if (voltage < 0.503) return 5.0;
  if (voltage < 0.606) return 6.0;
  if (voltage < 0.696) return 7.0;
  if (voltage < 0.795) return 8.0;
  if (voltage < 0.881) return 9.0;
  if (voltage < 0.976) return 10.0;
  return 11.0;
}

String getWindDirection(int degrees) {
  const char* directions[] = {"N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                            "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"};
  int index = ((degrees + 11.25) / 22.5);
  return directions[index % 16];
}

void sendDataToESP32() {
  // Format: temp,humidity,pressure,rain,light,uv,windspeed,winddir,noise,aqi
  String data = String(currentData.temperature) + "," +
                String(currentData.humidity) + "," +
                String(currentData.pressure) + "," +
                String(currentData.rainDetected) + "," +
                String(currentData.lightIntensity) + "," +
                String(currentData.uvIndex) + "," +
                String(currentData.windSpeed) + "," +
                currentData.windDirection + "," +
                String(currentData.noiseLevel) + "," +
                String(currentData.airQuality);
                
  Serial.println("DATA:" + data);
}

void handleCommand(String command) {
  if (command == "GET_DATA") {
    readSensors();
    sendDataToESP32();
  }
}