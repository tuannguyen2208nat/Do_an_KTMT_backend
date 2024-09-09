#include "TaskLed.h"

Adafruit_NeoPixel led_rgb(NUM_PIXELS, LED, NEO_GRB + NEO_KHZ800);

void TaskLed(void *pvParameters)
{
    led_rgb.begin();
    led_rgb.show();
    bool ledState = false;

    while (true)
    {
        if (WiFi.status() == WL_CONNECTED && client.connected())
        {
            if (ledState)
            {
                led_rgb.setPixelColor(0, led_rgb.Color(0, 255, 0));
            }
            else
            {
                led_rgb.setPixelColor(0, led_rgb.Color(0, 0, 0));
            }
            led_rgb.show();
            ledState = !ledState;
        }
        vTaskDelay(delay_led / portTICK_PERIOD_MS);
    }
}
