
#include <DHT20.h>
#include "config.h"
#include <TinyGPS++.h>
#include <AdafruitIO.h>
#include "RelayStatus.h"
#include <AdafruitIO_WiFi.h>
#include <SoftwareSerial.h>

DHT20 dht20;
float X, Y;

TinyGPSPlus gps;
SoftwareSerial ss(TXD_GPS, RXD_GPS);

AdafruitIO_WiFi io(IO_USERNAME, IO_KEY, WIFI_SSID, WIFI_PASS);
AdafruitIO_Feed *status = io.feed("status");
AdafruitIO_Feed *temp = io.feed("temperature");
AdafruitIO_Feed *humi = io.feed("humidity");
AdafruitIO_Feed *location = io.feed("location");

void sendModbusCommand(const uint8_t command[], size_t length)
{
  for (size_t i = 0; i < length; i++)
  {
    Serial2.write(command[i]);
  }
}

void setup()
{
  Serial.begin(BAUD_RATE_1);
  Serial2.begin(BAUD_RATE_2, SERIAL_8N1, TXD_RELAY, RXD_RELAY);
  ss.begin(BAUD_RATE_2);

  sendModbusCommand(relay_OFF[0], sizeof(relay_OFF[0]));

  while (!Serial)
    ;

  io.connect();
  status->onMessage(handleMessage);

  while (io.status() < AIO_CONNECTED)
  {
    Serial.println("Connecting to Adafruit IO");
    delay(500);
  }
  dht20.begin();
  xTaskCreate(TaskTemperatureHumidity, "TaskTemperatureHumidity", 4096, NULL, 2, NULL);
  xTaskCreate(TaskGPS, "TaskGPS", 4096, NULL, 2, NULL);
  status->get();
  Serial.println("Start");
}

void loop()
{
  io.run();
  while (ss.available())
    gps.encode(ss.read());
}

void handleMessage(AdafruitIO_Data *data)
{
  String message = data->value();

  if (message.startsWith("!RELAY") && message.endsWith("#"))
  {
    int indexStart = message.indexOf('!') + 6;
    int indexEnd = message.indexOf(':');
    String indexStr = message.substring(indexStart, indexEnd);
    int index = indexStr.toInt();

    int statusStart = indexEnd + 1;
    int statusEnd = message.indexOf('#');
    String statusStr = message.substring(statusStart, statusEnd);

    if (statusStr == "ON" && index < (sizeof(relay_ON) / sizeof(relay_ON[0])))
    {
      sendModbusCommand(relay_ON[index], sizeof(relay_ON[0]));
    }
    else if (statusStr == "OFF" && index < (sizeof(relay_OFF) / sizeof(relay_OFF[0])))
    {
      sendModbusCommand(relay_OFF[index], sizeof(relay_OFF[0]));
    }
    else
    {
      Serial.println("Invalid command");
    }

    String sendData = String(index) + '-' + statusStr;
    status->save(sendData);
    Serial.println("Data sent to Adafruit IO: " + sendData);
  }
}

void TaskTemperatureHumidity(void *pvParameters)
{
  while (1)
  {
    dht20.read();
    Serial.println("Temperature: " + String(dht20.getTemperature()) + " - Humidity: " + String(dht20.getHumidity()));
    temp->save(String(dht20.getTemperature()));
    humi->save(String(dht20.getHumidity()));
    vTaskDelay(delay_temp / portTICK_PERIOD_MS);
  }
}

void TaskGPS(void *pvParameters)
{
  while (1)
  {
    X = gps.location.lat();
    Y = gps.location.lng();
    String xStr = String(X, 7);
    String yStr = String(Y, 7);

    Serial.print("X: ");
    Serial.print(xStr);
    Serial.print(" Y: ");
    Serial.println(yStr);

    Serial.println();

    if (gps.location.isValid())
    {
      location->save(xStr + "-" + yStr);
    }

    if (millis() > 5000 && gps.charsProcessed() < 10)
    {
      Serial.println(F("No GPS data received: check wiring"));
    }
    vTaskDelay(delay_gps / portTICK_PERIOD_MS);
  }
}