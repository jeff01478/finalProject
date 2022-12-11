#include <WiFi.h>
#include <MySQL_Connection.h>
#include <MySQL_Cursor.h>
#include <Wire.h>
#include <Adafruit_MLX90614.h>

Adafruit_MLX90614 mlx = Adafruit_MLX90614();

const char ssid[]     = "LiZhengHao";// change to your WIFI SSID
const char password[] = "qwertyuiop123";// change to your WIFI Password
IPAddress server_addr(172,20,10,14);// change to you server ip, note its form split by "," not "."
int MYSQLPort =3306;   //mysql port default is 3306
char user[] = "jeff01478";// Your MySQL user login username(default is root),and note to change MYSQL user root can access from local to internet(%)
char pass[] = "123456";// Your MYSQL password
#define BUTTONPIN 5
float temper = 0;

WiFiClient client;            
MySQL_Connection conn((Client *)&client);

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
  
  
  delay(2000);  
}

void loop() {
  //try to connect to mysql server
  if (conn.connect(server_addr, 3306, user, pass)) {
     delay(1000);
  }
  else{
    Serial.println("Connection failed.");
  }
  int button = digitalRead(BUTTONPIN);
  while(button == LOW){
    Serial.print("溫度 = ");
    Serial.print(mlx.readObjectTempC());  //被偵測物體溫度，OLED只顯示這個數值
    Serial.println(" *C");
    temper = mlx.readObjectTempC();
    delay(2500);
    button = digitalRead(BUTTONPIN);
  }
  
  //insert, change database name and values by string and char[]
  delay(1000);
  String INSERT_SQL = "INSERT INTO access_test.esp_test (member,temp) VALUES ('John','" + String(temper) + "')";//傳入的值
  MySQL_Cursor *cur_mem = new MySQL_Cursor(&conn);  
  cur_mem->execute(INSERT_SQL.c_str());//execute SQL
  delete cur_mem;
  Serial.println("Data Saved.");
  conn.close();
  delay(5000);
  button = digitalRead(BUTTONPIN);
}
