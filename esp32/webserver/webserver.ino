#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include <Wire.h>
#include <DHT20.h>
#include "config.h"
#include <ArduinoJson.h>
#include "RelayStatus.h"

DHT20 dht20;

AsyncWebServer server(httpPort);
AsyncWebSocket ws("/ws");

void TaskTemperatureHumidity(void *pvParameters);

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

    if (!LittleFS.begin())
    {
        Serial.println("An Error has occurred while mounting LittleFS");
        return;
    }
    // if (!WiFi.config(local_IP, gateway, subnet))
    // {
    //     Serial.println("STA Failed to configure");
    // }

    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }

    Serial.println("Connected to WiFi");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    dht20.begin();

    ws.onEvent(onEvent);
    server.addHandler(&ws);

    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send(LittleFS, "/index.html", "text/html"); });
    server.on("/script.js", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send(LittleFS, "/script.js", "application/javascript"); });
    server.on("/styles.css", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send(LittleFS, "/styles.css", "text/css"); });

    server.begin();

    xTaskCreate(TaskTemperatureHumidity, "TaskTemperatureHumidity", 2048, NULL, 2, NULL);
    Serial.println("Task started");
}

void loop()
{
    ws.cleanupClients();
}

void TaskTemperatureHumidity(void *pvParameters)
{
    while (1)
    {
        dht20.read();
        float temperature = dht20.getTemperature();
        float humidity = dht20.getHumidity();
        if (ws.count() > 0)
        {
            String data = "{\"temperature\":" + String(temperature) + ",\"humidity\":" + String(humidity) + "}";
            ws.textAll(data);
        }
        vTaskDelay(delay_temp / portTICK_PERIOD_MS);
    }
}

void sendModbusCommand(const uint8_t command[], size_t length)
{
    for (size_t i = 0; i < length; i++)
    {
        Serial2.write(command[i]);
    }
}