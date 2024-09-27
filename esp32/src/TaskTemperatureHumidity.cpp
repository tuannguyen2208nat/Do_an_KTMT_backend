#include "TaskTemperatureHumidity.h"

float temperature, humidity;
String temperatureStr, humidityStr;
HardwareSerial RS485Serial(1);
DHT20 dht20;

// void DHT20_sensor()
// {
//     Wire.begin(SDA, SCL);
//     Wire.setClock(100000);
//     dht20.begin();
//     dht20.read();
//     temperature = dht20.getTemperature();
//     humidity = dht20.getHumidity();
//     temperatureStr = String(temperature, 2);
//     humidityStr = String(humidity, 2);
// }

void sendRS485Command(byte *command, int commandSize, byte *response, int responseSize)
{
    RS485Serial.write(command, commandSize);
    RS485Serial.flush();
    delay(100);
}

void ES35_sensor()
{
    byte temperatureRequest[] = {0x01, 0x03, 0x00, 0x00, 0x00, 0x01, 0x84, 0x0A};
    byte humidityRequest[] = {0x01, 0x03, 0x00, 0x01, 0x00, 0x01, 0xD5, 0xCA};
    byte response[7];

    sendRS485Command(temperatureRequest, sizeof(temperatureRequest), response, sizeof(response));
    if (response[1] == 0x03)
    {
        temperature = (response[3] << 8) | response[4];
        temperature = temperature / 10;
        temperatureStr = String(temperature, 2);
        Serial.println(temperatureStr);
    }
    delay(100);
    memset(response, 0, sizeof(response));
    sendRS485Command(humidityRequest, sizeof(humidityRequest), response, sizeof(response));
    if (response[1] == 0x03)
    {
        humidity = (response[3] << 8) | response[4];
        humidity = humidity / 10;
        humidityStr = String(humidity, 2);
        Serial.println(humidityStr);
    }
}

void TaskTemperatureHumidity(void *pvParameters)
{
    RS485Serial.begin(9600, SERIAL_8N1, SDA, SCL);
    while (1)
    {
        if (WiFi.status() != WL_CONNECTED || !client.connected())
        {
            vTaskDelay(delay_connect / portTICK_PERIOD_MS);
            continue;
        }
        ES35_sensor();
        publishData("temperature", temperatureStr);
        publishData("humidity", humidityStr);
        if (ws.count() > 0)
        {
            String data = "{\"temperature\":" + temperatureStr + ",\"humidity\":" + humidityStr + "}";
            ws.textAll(data);
        }

        vTaskDelay(delay_temp / portTICK_PERIOD_MS);
    }
}
