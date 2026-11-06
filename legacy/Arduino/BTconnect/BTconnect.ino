#include <SoftwareSerial.h>

#include <Wire.h>

#define MAX_BTCMDLEN 128

SoftwareSerial BTSerial(10,11);

 

byte cmd[MAX_BTCMDLEN];
int len = 0;

void setup() {
    Serial.begin(9600);
    BTSerial.begin(9600);
}

void loop() {
    char str[MAX_BTCMDLEN];
    int insize, ii;  
    int tick=0;
    while ( tick<MAX_BTCMDLEN ) {
        if ( (insize=(BTSerial.available()))>0 ){ // 讀取藍牙訊息
            for ( ii=0; ii<insize; ii++ ){
                cmd[(len++)%MAX_BTCMDLEN]=char(BTSerial.read());
            }
        } else {
            tick++;
        }
    }
    if ( len ) { // 顯示從Android手機傳過來的訊息
        sprintf(str,"%s",cmd);
        Serial.println(str);
        cmd[0] = '\0';

    }

    len = 0;

}
