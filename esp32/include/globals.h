#ifndef GLOBALS_H
#define GLOBALS_H

// include libraries
#include <Wire.h>
#include <WiFi.h>
#include <DHT20.h>
#include "LittleFS.h"
#include <AsyncTCP.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <ESPAsyncWebServer.h>
#include <WiFiUdp.h>
#include <NTPClient.h>
#include <SoftwareSerial.h>
#include <TinyGPS++.h>
#include <Adafruit_NeoPixel.h>
#include <HardwareSerial.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

// include config files
#include "../config/project_config.h"
#include "../config/RelayStatus.h"

// include Task files
#include "TaskLoadSchedule.h"
#include "TaskMQTT.h"
#include "TaskSchedule.h"
#include "TaskServer.h"
#include "TaskTemperatureHumidity.h"
#include "TaskWifi.h"
#include "TaskGps.h"
#include "TaskLed.h"

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

extern Schedule schedules[MAX_SCHEDULES];
extern int scheduleCount;

void saveSchedulesToFile();
void loadSchedulesFromFile();
String scheduleToJson(const Schedule &schedule);
void sendSchedules();
void parseJson(String message);
void sendValue(int index, String state);

#endif