//Pin de datos (pin 2 para tira1 y pin 4 para tira2)
#define PIN 2
#define pin2 4
//Cantidad de pixeles de la led
#define cantPixeles 60
#include "Adafruit_NeoPixel.h"
//Para definir un color
//uint32_t magenta = pixels.Color(255,0,255);

//alternativa a dar color
//pixels.setPixelColor(n, color);

Adafruit_NeoPixel tira1 = Adafruit_NeoPixel(cantPixeles, PIN, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel tira2 = Adafruit_NeoPixel(cantPixeles, pin2, NEO_GRB + NEO_KHZ800);

uint32_t rojo = tira1.Color(255, 0, 0);
uint32_t verde = tira1.Color(0, 255, 0);
uint32_t otroColor = tira1.Color(75, 12, 110);
//uint32_t negro = tira1.Color(0, 0, 0);

//Definimos los largos que indican hasta que led debe encenderce para señalar el lugar asignado
int largo1 = 9;
int* lugar1 = new int[largo1];

int largo2 = 15;
int* lugar2 = new int[largo2];

int largo3 = 41;
int* lugar3 = new int[largo3];

int largo4 = 48;
int* lugar4 = new int[largo4];

void setup() {
  // inicializamos tira1 y tira2
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
}

void prender(int* lugar, int largo, int numTira, uint32_t color) {
  if (numTira == 1) {
    tira1.clear();
    for (int i = 0; i < largo; i++) {
      tira1.setPixelColor(lugar[i], color);
    }
    tira1.show();
  } else {
    tira2.clear();
    for (int i = 0; i < largo; i++) {
      tira2.setPixelColor(lugar[i], color);
    }
    tira2.show();
  }
}

void loop() {
  int numTira = 1;
  prender(lugar3, largo3, numTira, rojo);
  delay(1000);
  prender(lugar4, largo4, numTira, verde);
  delay(1000);
  numTira = 2;
  prender(lugar1, largo1, numTira, otroColor);
  delay(1000);
  prender(lugar2, largo2, numTira, verde);
  delay(1000);
}
