#include <WiFi.h>
#include <HTTPClient.h>

const char WIFI_SSID[] = "CHT5892";
const char WIFI_PASSWORD[] = "12345678";

String HOST_NAME = 

String HOST_NAME = 
String HOST_NAME = String HOST_NAME = tring HOST_NAME = ring HOST_NAME = ing HOST_NAME = ng HOST_NAME = g HOST_NAME =  HOST_NAME = HOST_NAME = OST_NAME = ST_NAME = T_NAME = _NAME = NAME = AME = "ME = "hE = "ht = "htt= "http "http://192.168.0.19"; // change to your PC's IP address
String PATH_NAME   = "/insert_temp.php";
String queryString = "?temp=36.5";

void setup() {
  Serial.begin(9600); 

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Connecting");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
  
  HTTPClient http;

  http.begin(HOST_NAME + PATH_NAME + queryString); //HTTP
  int httpCode = http.GET();

  // httpCode will be negative on error
  if(httpCode > 0) {
    // file found at server
    if(httpCode == HTTP_CODE_OK) {
      String payload = http.getString();
      Serial.println(payload);
    } else {
      // HTTP header has been send and Server response header has been handled
      Serial.printf("[HTTP] GET... code: %d\n", httpCode);
    }
  } else {
    Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void loop() {

}
