#include <Wire.h>
#include <Adafruit_MLX90614.h>

Adafruit_MLX90614 mlx = Adafruit_MLX90614();

void setup() {
  Serial.begin(9600);

  //起始MLX90615
  Serial.println("MLX90614 infra-red temperature sensor test");
  mlx.begin();
}

void loop() {
  //Serial.print("Ambient = ");
  //Serial.print(mlx.readAmbientTempC()); //環境溫度
  Serial.print("物體溫度 = ");
  Serial.print(mlx.readObjectTempC());  //被偵測物體溫度，OLED只顯示這個數值
  Serial.println(" *C");
  delay(1000);
}
