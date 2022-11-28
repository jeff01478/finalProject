#include <WiFi.h>
#include <MySQL_Connection.h>
#include <MySQL_Cursor.h>
#include <Wire.h>
#include <Adafruit_MLX90614.h>
#include "time.h"

Adafruit_MLX90614 mlx = Adafruit_MLX90614();

const char ssid[]     = "CHT5892";// change to your WIFI SSID
const char password[] = "12345678";// change to your WIFI Password
IPAddress server_addr(192,168,1,190);// change to you server ip, note its form split by "," not "."
int MYSQLPort =3306;   //mysql port default is 3306
char user[] = "a108510358";// Your MySQL user login username(default is root),and note to change MYSQL user root can access from local to internet(%)
char pass[] = "10385267";// Your MYSQL password
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 28800;
const int   daylightOffset_sec = 3600;
#define BUTTONPIN 23
float temper = 0;

WiFiClient client;            
MySQL_Connection conn((Client *)&client);

void printLocalTime(){
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    Serial.println("Failed to obtain time");
    return;
  }
}
void setup() {
  pinMode(BUTTONPIN, INPUT);
  Serial.begin(115200);
  delay(10);

  //起始MLX90615
  Serial.println("MLX90614 infra-red temperature sensor test");
  mlx.begin();
  // We start by connecting to a WiFi network
  
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);  
  //try to connect to WIFI 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");  
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // Init and get the time
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  printLocalTime();
  
  //try to connect to mysql server
  if (conn.connect(server_addr, 3306, user, pass)) {
     delay(1000);
  }
  else{
    Serial.println("Connection failed.");
  }
  delay(2000);  
}

void loop() {
  int button = digitalRead(BUTTONPIN);
  while(button == LOW){
    Serial.print("溫度 = ");
    Serial.print(mlx.readObjectTempC());  //被偵測物體溫度，OLED只顯示這個數值
    Serial.println(" *C");
    temper = mlx.readObjectTempC();
    delay(2500);
    button = digitalRead(BUTTONPIN);
  }
  printLocalTime();
  char temptime[3];
  struct tm timeinfo;
  printLocalTime();
  strftime(temptime,3, "%A, %B %d %Y %H:%M:%S",&timeinfo);
  Serial.println(temptime);
  String A = String(temptime);
  //insert, change database name and values by string and char[]
  String INSERT_SQL = "INSERT INTO test.member (member,temp,time) VALUES ('John','" + String(temper) + "','" + A + "')";//傳入的值
  MySQL_Cursor *cur_mem = new MySQL_Cursor(&conn);  
  cur_mem->execute(INSERT_SQL.c_str());//execute SQL
  delete cur_mem;
  conn.close();                  // close the connection
  Serial.println("Data Saved.");
  delay(5000);
}
