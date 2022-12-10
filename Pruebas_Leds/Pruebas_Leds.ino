//Pin de datos
#define PIN 2
//Cantidad de pixeles de la led
#define cantPixeles 60
#include "Adafruit_NeoPixel.h"
//Para definir un color
//uint32_t magenta = pixels.Color(255,0,255);

//alternativa a dar color
//pixels.setPixelColor(n, color);

Adafruit_NeoPixel tira1 = Adafruit_NeoPixel(cantPixeles, PIN, NEO_GRB + NEO_KHZ800);
uint32_t rojo = tira1.Color(255, 0, 0);
uint32_t verde = tira1.Color(0, 255, 0);
uint32_t otroColor = tira1.Color(75, 12, 110);
uint32_t negro = tira1.Color(0, 0, 0);

int largo3 = 41;
int* lugar3 = new int[largo3];

void setup() {
  // inicializamos tira1
  tira1.begin();
  for (int i = 0; i < largo3; i++) {
    lugar3[i] = i;
  }
}

void prender(int* lugar, int largo, int numTira, uint32_t color) {
  if (numTira == 1) {
    for (int i = 0; i < largo; i++) {
      tira1.setPixelColor(lugar[i], color);
    }
    tira1.show();
  } else {
    //con tira2
  }
}

void loop() {
  prender(lugar3, largo3, 1, rojo);
  delay(3000);
  //prenderDesdeHasta(5, 15, otroColor);
  delay(3000);
}
