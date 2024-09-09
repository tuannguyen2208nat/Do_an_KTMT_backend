#include "TaskSchedule.h"

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, ntpServer, utcOffsetInSeconds);

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
    if (ws.count() > 0)
    {
        ws.textAll(data);
        sendSchedules();
    }
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
                sendValue(schedules[i].actions[a].relayId, schedules[i].actions[a].action);
            }
        }
    }
}

void TaskSchedule(void *pvParameters)
{
    while (true)
    {
        if (WiFi.status() != WL_CONNECTED || !client.connected())
        {
            vTaskDelay(100 / portTICK_PERIOD_MS);
            continue;
        }
        checkSchedules();
        vTaskDelay(delay_minute / portTICK_PERIOD_MS);
    }
}