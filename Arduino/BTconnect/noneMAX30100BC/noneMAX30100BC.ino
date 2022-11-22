#include <SoftwareSerial.h>
#include <Wire.h>
//#include "MAX30100_PulseOximeter.h"

#define REPORTING_PERIOD_MS     1000
//PulseOximeter pox;
const int TX   = 10;
const int RX   = 11;

const int delay_time = 1000;

SoftwareSerial BT(RX, TX); 
uint32_t tsLastReport = 0;

// Callback (registered below) fired when a pulse is detected
void onBeatDetected()
{
    Serial.println("Beat!");
}

void setup() {
  Serial.begin(9600);
  BT.begin(9600);
  Serial.println("Start!!!");
  /*
  Serial.begin(115200);
    Serial.print("Initializing pulse oximeter..");
    if (!pox.begin()) {
        Serial.println("FAILED");
        for(;;);
    } else {
        Serial.println("SUCCESS");
    }
    pox.setOnBeatDetectedCallback(onBeatDetected);
    */
}

void loop() {
  /*
  pox.update();
  if (millis() - tsLastReport > REPORTING_PERIOD_MS) {
      Serial.print("Heart rate:");
      Serial.print(pox.getHeartRate());
      Serial.print("bpm / SpO2:");
      Serial.print(pox.getSpO2());
      Serial.println("%");
      tsLastReport = millis();
      }
*/
  byte BT_Data[3];
  BT_Data[0] = 97; //key send to phone
  BT_Data[1] = 100 / 256; //將 HeartRate() 分成兩個 1 Byte的數據包
  BT_Data[2] = 100 % 256;
  
  if(BT.available() > 0) //check BT is succeed
    if(BT.read() == 97) //check recieve key from phone
    {
      Serial.println("成功連結!");
      for(int i = 0; i < 3; i++) 
        BT.write(BT_Data[i]); //send packet to phone
    }
}
