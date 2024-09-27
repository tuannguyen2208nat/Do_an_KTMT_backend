#ifndef RELAYSTATUS_H
#define RELAYSTATUS_H

#include <Arduino.h>

// Relay ON command template
const uint8_t relay_ON[][8] = {
    {6, 5, 0, 1, 255, 0, 140, 58},  // Relay 1 ON
    {6, 5, 0, 2, 255, 0, 221, 250}, // Relay 2 ON
    {6, 5, 0, 3, 255, 0, 45, 250},  // Relay 3 ON
    {6, 5, 0, 4, 255, 0, 124, 58},  // Relay 4 ON
    {6, 5, 0, 5, 255, 0, 205, 251}, // Relay 5 ON
    {6, 5, 0, 6, 255, 0, 156, 59},  // Relay 6 ON

    {6, 5, 0, 255, 255, 0, 189, 189} // Relay ALL ON
};

// Relay OFF command template
const uint8_t relay_OFF[][8] = {
    {6, 5, 0, 1, 0, 0, 205, 202}, // Relay 1 OFF
    {6, 5, 0, 2, 0, 0, 156, 10},  // Relay 2 OFF
    {6, 5, 0, 3, 0, 0, 108, 10},  // Relay 3 OFF
    {6, 5, 0, 4, 0, 0, 61, 202},  // Relay 4 OFF
    {6, 5, 0, 5, 0, 0, 140, 11},  // Relay 5 OFF
    {6, 5, 0, 6, 0, 0, 221, 203}, // Relay 6 OFF

    {6, 5, 0, 255, 0, 0, 252, 77} // Relay ALL OFF
};

// Relay FLIP command template
const uint8_t relay_FLIP[][8] = {
    {1, 5, 0, 0, 55, 0, 242, 154},  // Relay 0 FLIP
    {1, 5, 0, 1, 55, 0, 163, 90},   // Relay 1 FLIP
    {1, 5, 0, 2, 55, 0, 53, 90},    // Relay 2 FLIP
    {1, 5, 0, 3, 55, 0, 2, 154},    // Relay 3 FLIP
    {1, 5, 0, 255, 55, 0, 194, 170} // Relay ALL FLIP
};

#endif // RELAYSTATUS_H