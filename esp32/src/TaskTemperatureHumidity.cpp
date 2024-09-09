#include "TaskTemperatureHumidity.h"

DHT20 dht20;

void TaskTemperatureHumidity(void *pvParameters)
{
    Wire.begin(SDA, SCL);
    Wire.setClock(100000);
    dht20.begin();

    while (1)
    {
        if (WiFi.status() != WL_CONNECTED || !client.connected())
        {
            vTaskDelay(delay_connect / portTICK_PERIOD_MS);
            continue;
        }
        dht20.read();
        float temperature = dht20.getTemperature();
        float humidity = dht20.getHumidity();
        String temperatureStr = String(temperature, 2);
        String humidityStr = String(humidity, 2);
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
