#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <Servo.h>
//D5 Y D6 Motores
// compute the required size
const size_t CAPACITY = JSON_ARRAY_SIZE(10);

Servo myservo1;
Servo myservo2;
HTTPClient http;
  WiFiClient client;
int angulo;
String serverName = "192.168.1.42";
const int sensor1 = 5;
const int sensor2 = 4;

const char* ssid = "juaniypia1B";
const char* password = "1110scaffo";
int previousState = LOW;
int currentState = LOW;
// allocate the memory for the document
StaticJsonDocument<CAPACITY> doc;

void setup(){
   myservo1.attach(14);
   myservo2.attach(12);
   pinMode(sensor1,INPUT);
   pinMode(sensor2,INPUT);
  Serial.begin(9600);
  Serial.println("Serial iniciado");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) 
      delay(500);

  Serial.println("Conectado");
}

void subirBarrera(int barrera){
  if(barrera == 3){
    angulo= 180;
    myservo1.write(angulo);
    Serial.println("Barrera 1 tratando de subir!");
    Serial.println(angulo);
    actionComplete(barrera);
  }else if(barrera == 4){
    angulo= 180;
    myservo2.write(angulo);
    actionComplete(barrera);
  }
}

void actionComplete(int spot){
  Serial.println("Completando lugar"+String(spot));
  String req = "{\"spot\":"+String(spot)+"}";
  http.begin(client,"http://"+serverName+"/actionComplete");
  http.addHeader("Content-Type", "application/json");
  http.POST(req);
}

void bajarBarrera(int barrera){
  if(barrera == 3){
    angulo= 0;
    myservo1.write(angulo);
    actionComplete(barrera);
  }else if(barrera == 4){
    angulo= 0;
    myservo2.write(angulo);
    actionComplete(barrera);
  }
}

void pollingDataAction(){
  Serial.println("pollingData");
  
  Serial.println("http://"+serverName+"/esp8266pollingdata");
  http.begin(client,"http://"+serverName+"/esp8266pollingdata");
  http.GET();
  String result = http.getString();
  Serial.println(result);
  deserializeJson(doc, result);
  Serial.println(result);
  JsonArray array = doc.as<JsonArray>();
  for(JsonObject v : array) {
    
    bool value = v["arriba"];
    int lugar = v["lugar"];
    Serial.println(value);
    Serial.println("Lugar:");
    Serial.println(lugar);
     if(value == true){
       subirBarrera(lugar);
     }else{
       bajarBarrera(lugar);
     }     
   
  }
}

void checkSensorState(int sensor){
  int readSensor = digitalRead(sensor);
  if(readSensor == HIGH && previousState == LOW){
    previousState = HIGH;
  }else if(readSensor == LOW && previousState == HIGH){
    removeActivePlate(sensor);
  }
}

void removeActivePlate(int sensor){
  int spot = -1;
  if(sensor == sensor1){
    spot = 3;
  }else{
    spot = 4;
  }

  String req = "{\"spot\":"+String(spot)+"}";
  http.begin(client,"http://"+serverName+"/actionComplete");
  http.addHeader("Content-Type", "application/json");
  http.POST(req);

  Serial.println("La nueva lista de activePlates");s
  String str = http.getString();
  Serial.println(str);
}
  



void loop(){
  delay(1000);
 pollingDataAction();

}

