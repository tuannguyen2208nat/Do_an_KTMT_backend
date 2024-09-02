#include <WiFi.h>
#include <DHT20.h>
#include "LittleFS.h"
#include <AsyncTCP.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <ESPAsyncWebServer.h>
#include "config.h"
#include "RelayStatus.h"

#include <WiFiUdp.h>
#include <NTPClient.h>

const long utcOffsetInSeconds = 25200;

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, ntpServer, utcOffsetInSeconds);

DHT20 dht20;
WiFiClient espClient;
PubSubClient client(espClient);

AsyncWebServer server(httpPort);
AsyncWebSocket ws("/ws");

int relayPins[4] = {1, 2, 3, 4};

typedef struct
{
    int id;
    bool state;
    String days[MAX_DAYS];
    String time;
    struct
    {
        int relayId;
        String action;
    } actions[MAX_ACTIONS];
    int actionCount;
} Schedule;

Schedule schedules[MAX_SCHEDULES];
int scheduleCount = 0;

void sendModbusCommand(const uint8_t command[], size_t length)
{
    for (size_t i = 0; i < length; i++)
    {
        Serial2.write(command[i]);
    }
}

void sendValue(int index, String state)
{
    if (index >= 1 && index <= 32)
    {
        if (state == "ON")
        {
            sendModbusCommand(relay_ON[index], sizeof(relay_ON[index]));
        }
        else
        {
            sendModbusCommand(relay_OFF[index], sizeof(relay_OFF[index]));
        }
    }
    String response = "{\"index\":" + String(index) + ",\"state\":\"" + state + "\"}";
    String sendData = String(index) + '-' + state;
    Serial.println(sendData);
    client.publish("tuannguyen2208nat/feeds/relay", sendData.c_str());
    if (ws.count() > 0)
    {
        ws.textAll(response);
    }
}

void callback(char *topic, byte *payload, unsigned int length)
{
    String message;
    for (unsigned int i = 0; i < length; i++)
    {
        message += (char)payload[i];
    }
    if (strcmp(topic, "tuannguyen2208nat/feeds/relay") == 0)
    {
        parseJson(message);
    }
    else if (strcmp(topic, "tuannguyen2208nat/feeds/schedule") == 0)
    {
        parseJson(message);
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
        String message((char *)data, len);
        parseJson(message);
    }
}

void TaskTemperatureHumidity(void *pvParameters)
{
    while (1)
    {
        dht20.read();
        float temperature = dht20.getTemperature();
        float humidity = dht20.getHumidity();
        String temperatureStr = String(temperature, 2);
        String humidityStr = String(humidity, 2);
        client.publish("tuannguyen2208nat/feeds/temperature", temperatureStr.c_str());
        client.publish("tuannguyen2208nat/feeds/humidity", humidityStr.c_str());
        if (ws.count() > 0)
        {
            String data = "{\"temperature\":" + temperatureStr + ",\"humidity\":" + humidityStr + "}";
            ws.textAll(data);
        }
        sendSchedules();
        vTaskDelay(delay_temp / portTICK_PERIOD_MS);
    }
}

void connectMQTT()
{
    while (!client.connected())
    {
        Serial.print("Connecting to MQTT...");
        String clientId = "ESP32Client" + String(random(0, 1000));
        if (client.connect(clientId.c_str(), IO_USERNAME, IO_KEY))
        {
            Serial.println("connected");
            client.subscribe("tuannguyen2208nat/feeds/relay");
            client.subscribe("tuannguyen2208nat/feeds/schedule");
            String sendData = WiFi.localIP().toString();
            client.publish("tuannguyen2208nat/feeds/ip", sendData.c_str());
            Serial.println(sendData);
            Serial.println("Start");
        }
        else
        {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            delay(5000);
        }
    }
}

String getDayOfWeek(unsigned long epochTime)
{
    time_t rawTime = epochTime;
    struct tm *timeInfo = localtime(&rawTime);
    String days[] = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
    return days[timeInfo->tm_wday];
}

void checkSchedules()
{
    timeClient.update();
    unsigned long epochTime = timeClient.getEpochTime();
    String currentDay = getDayOfWeek(epochTime);
    String currentTime = timeClient.getFormattedTime().substring(0, 5);
    String current = currentDay + " " + currentTime;
    String data = "{\"current\":\"" + current + "\"}";
    ws.textAll(data);
    for (int i = 0; i < scheduleCount; i++)
    {
        if (!schedules[i].state)
        {
            continue;
        }
        bool dayMatch = false;
        for (int d = 0; d < MAX_DAYS; d++)
        {
            if (schedules[i].days[d] == currentDay)
            {
                dayMatch = true;
                break;
            }
        }
        if (dayMatch && (schedules[i].time == currentTime))
        {
            for (int a = 0; a < schedules[i].actionCount; a++)
            {
                if (schedules[i].actions[a].action == "ON")
                {
                    digitalWrite(schedules[i].actions[a].relayId, HIGH);
                }
                else if (schedules[i].actions[a].action == "OFF")
                {
                    digitalWrite(schedules[i].actions[a].relayId, LOW);
                }
                String sendData = String(schedules[i].actions[a].relayId) + "-" + String(schedules[i].actions[a].action);
                Serial.println(sendData);
                client.publish("tuannguyen2208nat/feeds/relay", sendData.c_str());
            }
        }
    }
}

void TaskSchedules(void *pvParameters)
{
    while (true)
    {
        checkSchedules();
        vTaskDelay(pdMS_TO_TICKS(60000));
    }
}

void deleteScheduleById(int id)
{
    for (int i = 0; i < scheduleCount; i++)
    {
        if (schedules[i].id == id)
        {
            for (int j = i; j < scheduleCount - 1; j++)
            {
                schedules[j] = schedules[j + 1];
            }
            scheduleCount--;
            saveSchedulesToFile();
            break;
        }
    }
}

void parseJson(String message)
{
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, message);
    if (error)
    {
        return;
    }
    String mode = doc["mode"].as<String>();
    if (mode == "Manual")
    {
        int index = doc["index"];
        String state = doc["state"].as<String>();
        sendValue(index, state);
    }

    else if (mode == "Schedule")
    {
        int id = doc["id"];
        if (doc.containsKey("delete") && strcmp(doc["delete"], "true") == 0)
        {
            deleteScheduleById(id);
            return;
        }
        const char *state_str = doc["state"];
        bool state = false;
        if (strcmp(state_str, "true") == 0)
        {
            state = true;
        }
        else if (strcmp(state_str, "false") == 0)
        {
            state = false;
        }
        String time = doc["time"];
        JsonArray days = doc["days"];
        JsonArray actions = doc["actions"];

        bool found = false;
        for (int i = 0; i < scheduleCount; i++)
        {
            if (schedules[i].id == id)
            {
                schedules[i].state = state;
                schedules[i].time = time;

                String uniqueDays[MAX_DAYS];
                int dayIndex = 0;

                for (size_t j = 0; j < days.size(); j++)
                {
                    String day = days[j].as<String>();
                    bool isUnique = true;
                    for (int k = 0; k < dayIndex; k++)
                    {
                        if (uniqueDays[k] == day)
                        {
                            isUnique = false;
                            break;
                        }
                    }
                    if (isUnique)
                    {
                        if (dayIndex < MAX_DAYS)
                        {
                            uniqueDays[dayIndex++] = day;
                        }
                    }
                }

                for (int j = 0; j < dayIndex; j++)
                {
                    schedules[i].days[j] = uniqueDays[j];
                }

                for (int j = dayIndex; j < MAX_DAYS; j++)
                {
                    schedules[i].days[j] = "";
                }

                schedules[i].actionCount = actions.size();
                for (size_t j = 0; j < actions.size(); j++)
                {
                    schedules[i].actions[j].relayId = actions[j]["relayId"];
                    schedules[i].actions[j].action = actions[j]["action"].as<String>();
                }

                found = true;
                break;
            }
        }

        if (!found && scheduleCount < MAX_SCHEDULES)
        {

            schedules[scheduleCount].id = id;
            schedules[scheduleCount].state = state;
            schedules[scheduleCount].time = time;

            int dayIndex = 0;
            for (size_t j = 0; j < days.size(); j++)
            {
                String day = days[j].as<String>();
                bool isUnique = true;
                for (int k = 0; k < dayIndex; k++)
                {
                    if (schedules[scheduleCount].days[k] == day)
                    {
                        isUnique = false;
                        break;
                    }
                }
                if (isUnique)
                {
                    if (dayIndex < MAX_DAYS)
                    {
                        schedules[scheduleCount].days[dayIndex++] = day;
                    }
                }
            }

            for (int j = dayIndex; j < MAX_DAYS; j++)
            {
                schedules[scheduleCount].days[j] = "";
            }

            schedules[scheduleCount].actionCount = actions.size();
            for (size_t j = 0; j < actions.size(); j++)
            {
                schedules[scheduleCount].actions[j].relayId = actions[j]["relayId"];
                schedules[scheduleCount].actions[j].action = actions[j]["action"].as<String>();
            }
            scheduleCount++;
        }
        saveSchedulesToFile();
    }
}

String scheduleToJson(const Schedule &schedule)
{
    DynamicJsonDocument doc(1024);
    doc["id"] = schedule.id;
    doc["state"] = schedule.state;
    JsonArray daysArray = doc.createNestedArray("days");
    for (int i = 0; i < MAX_DAYS; i++)
    {
        if (!schedule.days[i].isEmpty())
        {
            daysArray.add(schedule.days[i]);
        }
    }

    doc["time"] = schedule.time;
    JsonArray actionsArray = doc.createNestedArray("actions");
    for (int i = 0; i < schedule.actionCount; i++)
    {
        JsonObject actionObj = actionsArray.createNestedObject();
        actionObj["relayId"] = schedule.actions[i].relayId;
        actionObj["action"] = schedule.actions[i].action;
    }
    String jsonString;
    serializeJson(doc, jsonString);
    return jsonString;
}

void sendSchedules()
{
    DynamicJsonDocument doc(2048);
    JsonArray scheduleArray = doc.createNestedArray("schedule");
    bool hasSchedules = false;
    for (int i = 0; i < MAX_SCHEDULES; i++)
    {
        if (schedules[i].id == 0)
        {
            continue;
        }
        hasSchedules = true;
        String scheduleJson = scheduleToJson(schedules[i]);
        DynamicJsonDocument scheduleDoc(1024);
        deserializeJson(scheduleDoc, scheduleJson);
        scheduleArray.add(scheduleDoc.as<JsonObject>());
    }
    String result;
    serializeJson(doc, result);
    if (!hasSchedules)
    {
        result = "[]";
    }

    ws.textAll(result);
}

void loadSchedulesFromFile()
{
    File file = LittleFS.open("/schedules.dat", "r");
    if (!file)
    {
        Serial.println("Failed to open file for reading");
        return;
    }

    file.read((uint8_t *)schedules, sizeof(schedules));
    file.read((uint8_t *)&scheduleCount, sizeof(scheduleCount));
    file.close();
}

void saveSchedulesToFile()
{
    File file = LittleFS.open("/schedules.dat", "w");
    if (!file)
    {
        Serial.println("Failed to open file for writing");
        return;
    }

    file.write((uint8_t *)schedules, sizeof(schedules));
    file.write((uint8_t *)&scheduleCount, sizeof(scheduleCount));
    file.close();
}

void taskLoadSchedules(void *pvParameters)
{
    loadSchedulesFromFile();
    vTaskDelete(NULL);
}

void setup()
{
    Serial.begin(115200);
    Serial2.begin(BAUD_RATE_2, SERIAL_8N1, TXD_RELAY, RXD_RELAY);
    dht20.begin();
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    Serial.print("Connecting to ");
    Serial.println(WIFI_SSID);

    if (!LittleFS.begin())
    {
        Serial.println("An Error has occurred while mounting LittleFS");
        return;
    }

    for (int i = 0; i < 4; i++)
    {
        pinMode(relayPins[i], OUTPUT);
    }

    Serial.println("Connected to Wi-Fi");

    ws.onEvent(onEvent);
    server.addHandler(&ws);
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send(LittleFS, "/index.html", "text/html"); });
    server.on("/script.js", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send(LittleFS, "/script.js", "application/javascript"); });
    server.on("/styles.css", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send(LittleFS, "/styles.css", "text/css"); });
    server.begin();

    timeClient.begin();
    timeClient.update();

    client.setServer(MQTT_SERVER, MQTT_PORT);
    client.setCallback(callback);
    connectMQTT();
    xTaskCreate(TaskTemperatureHumidity, "TaskTemperatureHumidity", 4096, NULL, 1, NULL);
    xTaskCreate(TaskSchedules, "Schedule Task", 4096, NULL, 1, NULL);
    xTaskCreatePinnedToCore(taskLoadSchedules, "Load Schedules", 4096, NULL, 1, NULL, 1);
}

void loop()
{
    if (!client.connected())
    {
        connectMQTT();
    }
    client.loop();
}