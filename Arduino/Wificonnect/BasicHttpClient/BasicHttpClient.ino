#include <WiFi.h>
#include <MySQL_Connection.h>
#include <MySQL_Cursor.h>
#include <MySQL_Encrypt_Sha1.h>
#include <MySQL_Packet.h>

const char ssid[]     = "CHT5892";// change to your WIFI SSID
const char password[] = "12345678";// change to your WIFI Password
IPAddress server_addr(192,168,1,105);// change to you server ip, note its form split by "," not "."
int MYSQLPort =3306;   //mysql port default is 3306
char user[] = "root";// Your MySQL user login username(default is root),and note to change MYSQL user root can access from local to internet(%)
char pass[] = "";// Your MYSQL password

WiFiClient client;            
MySQL_Connection conn((Client *)&client);

void setup() {
  Serial.begin(115200);
  delay(10);
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
  
  //try to connect to mysql server
  if (conn.connect(server_addr, 3306, user, pass)) {
     delay(1000);
  }
  else{
    Serial.println("Connection failed.");
  }
  delay(2000);  
  //insert, change database name and values by string and char[]
  char INSERT_SQL[] = "INSERT INTO epiz_31426033_db_esp32.member_1 (name,gender,temp) VALUES ('張嘉航','male','36')";//傳入的值固定為溫度,濕度為35,60
  MySQL_Cursor *cur_mem = new MySQL_Cursor(&conn);  
  cur_mem->execute(INSERT_SQL);//execute SQL
  delete cur_mem;
  conn.close();                  // close the connection
  Serial.println("Data Saved.");
}

void loop() {
//do nothing
}
