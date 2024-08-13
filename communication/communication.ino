#include <AdafruitIO.h>
#include <AdafruitIO_WiFi.h>
#include "RelayStatus.h"
#include <DHT20.h>
#include "authentic.h"

DHT20 dht20;

#define LED_PIN 2
#define TXD 8
#define RXD 9
#define BAUD_RATE 9600

AdafruitIO_WiFi io(IO_USERNAME, IO_KEY, WIFI_SSID, WIFI_PASS);
AdafruitIO_Feed *status = io.feed("status");
AdafruitIO_Feed *temp = io.feed("temperature");
AdafruitIO_Feed *humi = io.feed("humidity");

void sendModbusCommand(const uint8_t command[], size_t length)
{
    for (size_t i = 0; i < length; i++)
    {
        Serial2.write(command[i]);
    }
}

void setup()
{
    pinMode(LED_PIN, OUTPUT);
    Serial.begin(115200);
    Serial2.begin(BAUD_RATE, SERIAL_8N1, TXD, RXD);

    // Initialize the relay to OFF state
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

    if (!dht20.begin())
    {
        Serial.println("Failed to initialize DHT20 sensor!");
    }

    xTaskCreate(TaskTemperatureHumidity, "TaskTemperatureHumidity", 2048, NULL, 2, NULL);
    Serial.println();
    Serial.println(io.statusText());
    status->get();
}

void loop()
{
    io.run();
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
        vTaskDelay(30000 / portTICK_PERIOD_MS);
    }
}
