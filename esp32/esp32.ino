#include <DHT20.h>
#include <TinyGPS++.h>
#include <AdafruitIO.h>
#include <AdafruitIO_WiFi.h>
#include <SoftwareSerial.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include <ArduinoJson.h>
#include "config.h"
#include "RelayStatus.h"

DHT20 dht20;
float X, Y;
TinyGPSPlus gps;
SoftwareSerial ss(TXD_GPS, RXD_GPS);

AdafruitIO_WiFi io(IO_USERNAME, IO_KEY, WIFI_SSID, WIFI_PASS);
AdafruitIO_Feed *status = io.feed("relay");
AdafruitIO_Feed *temp = io.feed("temperature");
AdafruitIO_Feed *humi = io.feed("humidity");
AdafruitIO_Feed *location = io.feed("location");

AsyncWebServer server(httpPort);
AsyncWebSocket ws("/ws");

void sendModbusCommand(const uint8_t command[], size_t length)
{
    for (size_t i = 0; i < length; i++)
    {
        Serial2.write(command[i]);
    }
}

void TaskTemperatureHumidity(void *pvParameters)
{
    while (1)
    {
        dht20.read();
        float temperature = dht20.getTemperature();
        float humidity = dht20.getHumidity();
        temp->save(String(temperature));
        humi->save(String(humidity));

        if (ws.count() > 0)
        {
            String data = "{\"temperature\":" + String(temperature) + ",\"humidity\":" + String(humidity) + "}";
            ws.textAll(data);
        }
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
            sendModbusCommand(relay_ON[index], sizeof(relay_ON[index]));
        }
        else if (statusStr == "OFF" && index < (sizeof(relay_OFF) / sizeof(relay_OFF[0])))
        {
            sendModbusCommand(relay_OFF[index], sizeof(relay_OFF[index]));
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

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len)
{
    if (type == WS_EVT_CONNECT)
    {
        Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
    }
    else if (type == WS_EVT_DISCONNECT)
    {
        Serial.printf("WebSocket client #%u disconnected\n", client->id());
    }
    else if (type == WS_EVT_DATA)
    {
        String message = String((char *)data);
        DynamicJsonDocument doc(1024);
        DeserializationError error = deserializeJson(doc, message);

        if (error)
        {
            Serial.println("Failed to parse JSON");
            return;
        }

        int index = doc["index"];
        String state = doc["state"].as<String>();
        String newState = (state == "ON") ? "OFF" : "ON";

        if (index >= 1 && index <= 32)
        {
            if (newState == "ON")
            {
                sendModbusCommand(relay_ON[index], sizeof(relay_ON[index]));
            }
            else
            {
                sendModbusCommand(relay_OFF[index], sizeof(relay_OFF[index]));
            }
        }
        String response = "{\"relay_id\":" + String(index) + ",\"state\":\"" + newState + "\"}";
        ws.textAll(response);
    }
}

void setup()
{
    Serial.begin(115200);
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

    if (!LittleFS.begin())
    {
        Serial.println("An Error has occurred while mounting LittleFS");
        return;
    }

    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }

    Serial.println("Connected to WiFi");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    ws.onEvent(onEvent);
    server.addHandler(&ws);

    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send(LittleFS, "/index.html", "text/html"); });
    server.on("/script.js", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send(LittleFS, "/script.js", "application/javascript"); });
    server.on("/styles.css", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send(LittleFS, "/styles.css", "text/css"); });

    server.begin();
}

void loop()
{
    io.run();
    ws.cleanupClients();
    while (ss.available())
    {
        gps.encode(ss.read());
    }
}
