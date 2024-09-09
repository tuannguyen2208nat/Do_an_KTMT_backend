#include "globals.h"

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
        int relay_id = index - 1;
        if (state == "ON")
        {
            sendModbusCommand(relay_ON[relay_id], sizeof(relay_ON[relay_id]));
        }
        else
        {
            sendModbusCommand(relay_OFF[relay_id], sizeof(relay_OFF[relay_id]));
        }
    }
    String response = "{\"index\":" + String(index) + ",\"state\":\"" + state + "\"}";
    String sendData = String(index) + '-' + state;
    Serial.println(sendData);
    if (client.connected())
    {
        publishData("relay", sendData);
    }
    else
    {
        Serial.println("Not connected to MQTT");
    }
    if (ws.count() > 0)
    {
        ws.textAll(response);
    }
}

void sendSchedules()
{
    DynamicJsonDocument doc(2048);
    JsonArray scheduleArray = doc.createNestedArray("schedule");
    for (int i = 0; i < scheduleCount; i++)
    {
        String scheduleJson = scheduleToJson(schedules[i]);
        DynamicJsonDocument scheduleDoc(1024);
        deserializeJson(scheduleDoc, scheduleJson);
        scheduleArray.add(scheduleDoc.as<JsonObject>());
    }
    String result;
    if (scheduleCount <= 0)
    {
        result = "[]";
    }
    else
    {
        serializeJson(doc, result);
    }
    ws.textAll(result);
}

String scheduleToJson(const Schedule &schedule)
{
    JsonDocument doc;
    doc["id"] = schedule.id;
    doc["state"] = schedule.state;
    JsonArray daysArray = doc["days"].to<JsonArray>();
    for (int i = 0; i < MAX_DAYS; i++)
    {
        if (!schedule.days[i].isEmpty())
        {
            daysArray.add(schedule.days[i]);
        }
    }

    doc["time"] = schedule.time;
    JsonArray actionsArray = doc["actions"].to<JsonArray>();
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

void parseJson(String message)
{
    JsonDocument doc;
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
