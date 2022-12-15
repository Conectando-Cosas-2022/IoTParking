#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <Servo.h>

//Pin de datos (pin 2 para tira1 y pin 4 para tira2)
#define PIN 0
#define pin2 2
//Cantidad de pixeles de la led
#define cantPixeles 60
#include "Adafruit_NeoPixel.h"


//D5 Y D6 Motores
// compute the required size
const size_t CAPACITY = JSON_ARRAY_SIZE(10);

Servo myservo1;
Servo myservo2;
HTTPClient http;
WiFiClient client;
int angulo;
String serverName = "192.168.245.61";
const int sensor1 = 5;
const int sensor2 = 4;
//NodeMCU barrera 1 y 2
int BARRERA1 = 1;
int BARRERA2 = 2;

int SPOT1 = 3;
int SPOT2 = 4;

const char* ssid = "Aloha";
const char* password = "carlitos2304";
int previousState1 = LOW;
int currentState1 = LOW;
int previousState2 = LOW;
int currentState2 = LOW;
// allocate the memory for the document
StaticJsonDocument<CAPACITY> doc;

Adafruit_NeoPixel tira1 = Adafruit_NeoPixel(cantPixeles, PIN, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel tira2 = Adafruit_NeoPixel(cantPixeles, pin2, NEO_GRB + NEO_KHZ800);

uint32_t rojo = tira1.Color(255, 0, 0);
uint32_t verde = tira1.Color(0, 255, 0);
uint32_t otroColor = tira1.Color(75, 12, 110);

int largo1 = 9;
int* lugar1 = new int[largo1];

int largo2 = 15;
int* lugar2 = new int[largo2];

int largo3 = 41;
int* lugar3 = new int[largo3];

int largo4 = 48;
int* lugar4 = new int[largo4];

void setup() {

  tira1.begin();
  tira2.begin();

  //Rellenamos los vectores de las led que deben ir encendidas
  for (int i = 0; i < largo1; i++) {
    lugar1[i] = i;
  }
  for (int i = 0; i < largo2; i++) {
    lugar2[i] = i;
  }
  for (int i = 0; i < largo3; i++) {
    lugar3[i] = i;
  }
  for (int i = 0; i < largo4; i++) {
    lugar4[i] = i;
  }

  //Para cable corto NodeMCU
  //14 y 12
  //Largo
  //13 y 15
  myservo1.attach(14);
  myservo2.attach(12);
  pinMode(sensor1, INPUT);
  pinMode(sensor2, INPUT);
  Serial.begin(9600);
  Serial.println("Serial iniciado");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
    delay(500);

  Serial.println("Conectado");
}

void subirBarrera(int barrera) {
  if (barrera == BARRERA1) {
    angulo = 180;
    myservo1.write(angulo);
    Serial.println("Barrera 1 tratando de subir!");
    Serial.println(angulo);
    actionComplete(barrera,false);
  } else if (barrera == BARRERA2) {
    angulo = 180;
    myservo2.write(angulo);
    actionComplete(barrera,false);
  }
}

void actionComplete(int spot,bool led) {
  Serial.println("Completando lugar" + String(spot));
  if(!led){
  String req = "{\"spot\":" + String(spot) +","+ "\"led\":false"+"}";
  http.begin(client, "http://" + serverName + "/actionComplete");
  http.addHeader("Content-Type", "application/json");
  http.POST(req);
  }else{
    String req = "{\"ledlugar\":" + String(spot) +","+ "\"led\":true"+"}";
  http.begin(client, "http://" + serverName + "/actionComplete");
  http.addHeader("Content-Type", "application/json");
  http.POST(req);
  }
}

void prender(int* lugar, int largo, int numTira, uint32_t color) {
  tira1.clear();
  tira1.show();
  tira2.clear();
  tira2.show();
  if (numTira == 1) {
    for (int i = 0; i < largo; i++) {
      tira1.setPixelColor(lugar[i], color);
    }
    tira1.show();
  } else {
    for (int i = 0; i < largo; i++) {
      tira2.setPixelColor(lugar[i], color);
    }
    tira2.show();
  }
}


void bajarBarrera(int barrera) {
  if (barrera == BARRERA1) {
    angulo = 0;
    myservo1.write(angulo);
    actionComplete(barrera,false);
  } else if (barrera == BARRERA2) {
    angulo = 0;
    myservo2.write(angulo);
    actionComplete(barrera,false);
  }
}

void pollingDataAction() {
  Serial.println("pollingData");

  Serial.println("http://" + serverName + "/esp8266pollingdata");
  http.begin(client, "http://" + serverName + "/esp8266pollingdata");
  http.GET();
  String result = http.getString();
  Serial.println(result);
  deserializeJson(doc, result);
  Serial.println(result);
  JsonArray array = doc.as<JsonArray>();
  for (JsonObject v : array) {

    bool value = v["arriba"];
    bool led = v["led"];
    int lugar = v["lugar"];
    Serial.println(value);
    Serial.println("Lugar:");
    Serial.println(lugar);
    Serial.println("lED ES:");
    Serial.println(led);
    if(!led){
    if (value == true) {
      subirBarrera(lugar);
    } else {
      bajarBarrera(lugar);
    }
    }else{
      int ledlug = v["ledlugar"];
      Serial.println("Led lugar es:");
      Serial.println(ledlug);
      int numTira = 0;
      if(ledlug == 1){
        numTira = 2;
        prender(lugar1, largo1, numTira, otroColor);
        actionComplete(ledlug,true);
      }else if(ledlug == 2){
        numTira = 2;
        prender(lugar2, largo2, numTira, verde);
        actionComplete(ledlug,true);
      }else if(ledlug == 3){
        numTira = 1;
        prender(lugar3, largo3, numTira, rojo);
        actionComplete(ledlug,true);
      }else{
        numTira = 1;
       prender(lugar4, largo4, numTira, verde);
       actionComplete(ledlug,true);
      }
    }
  }
}

void checkSensorState() {
  int readSensor1 = digitalRead(sensor1);
  int readSensor2 = digitalRead(sensor2);
    if (readSensor1 == HIGH && previousState1 == LOW) {
      previousState1 = HIGH;
    } else if (readSensor1 == LOW && previousState1 == HIGH) {
      removeActivePlate(sensor1);
    }

    if (readSensor2 == HIGH && previousState2 == LOW) {
      previousState2 = HIGH;
    } else if (readSensor2 == LOW && previousState2 == HIGH) {
      removeActivePlate(sensor2);
    }    
  
}

void removeActivePlate(int sensor) {
  int spot = -1;
  if (sensor == sensor1) {
    spot = SPOT1;
  } else if(sensor == sensor2){
    spot = SPOT2;
  }

  String req = "{\"spot\":" + String(spot) + "}";
  Serial.println("http://" + serverName + "/removeActivePlate");
  http.begin(client, "http://" + serverName + "/removeActivePlate");
  http.addHeader("Content-Type", "application/json");
  http.POST(req);

  Serial.println("La nueva lista de activePlates");
    String str = http.getString();
  Serial.println(str);
}




void loop() {
  delay(1000);
  pollingDataAction();
}
