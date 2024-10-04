#include "TaskTemperatureHumidity.h"

float temperature = 0, humidity = 0;
String temperatureStr = "0", humidityStr = "0";
HardwareSerial RS485Serial(1);

void sendRS485Command(byte *command, int commandSize, byte *response, int responseSize)
{
    RS485Serial.write(command, commandSize);
    RS485Serial.flush();
    delay(100);
    if (RS485Serial.available() >= responseSize)
    {
        RS485Serial.readBytes(response, responseSize);
    }
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
        temperature /= 10.0;
    }

    delay(100);

    memset(response, 0, sizeof(response));

    sendRS485Command(humidityRequest, sizeof(humidityRequest), response, sizeof(response));
    if (response[1] == 0x03)
    {
        humidity = (response[3] << 8) | response[4];
        humidity /= 10.0;
    }
}

void TaskTemperatureHumidity(void *pvParameters)
{
    RS485Serial.begin(9600, SERIAL_8N1, SCL, SDA);
    while (1)
    {
        if (WiFi.status() != WL_CONNECTED || !client.connected())
        {
            vTaskDelay(delay_connect / portTICK_PERIOD_MS);
            continue;
        }
        ES35_sensor();
        temperatureStr = String(temperature);
        humidityStr = String(humidity);
        Serial.print("Temperature: ");
        Serial.print(temperatureStr);
        Serial.print("Humidity: ");
        Serial.print(humidityStr);
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
