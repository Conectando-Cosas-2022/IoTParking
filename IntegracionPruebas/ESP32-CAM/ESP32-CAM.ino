
#include <WiFi.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include "img_converters.h"
#include "esp_camera.h"
#include "Base64.h"
#include <HTTPClient.h>
#include "ESP32_FTPClient.h"
#include <sstream> 
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <pwmWrite.h>

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels
Pwm pwm = Pwm();
// Declaration for SSD1306 display connected using software SPI (default case):
#define OLED_MOSI   12
#define OLED_RESET 13
#define OLED_CS    15
#define OLED_CLK   14
#define OLED_DC    4

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT,
  OLED_MOSI, OLED_CLK, OLED_DC, OLED_RESET, OLED_CS);
using namespace std;
#define PIN 2
#define pin2 0
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
int largo1 = 6;
int* lugar1 = new int[largo1];

int largo2 = 12;
int* lugar2 = new int[largo2];

int largo3 = 41;
int* lugar3 = new int[largo3];

int largo4 = 48;
int* lugar4 = new int[largo4];
const int sensor = 16;

const char* ssid = "Aloha";
const char* password = "carlitos2304";


char ftp_server[] = "192.168.2.192";
char ftp_user[] = "iotparking";
char ftp_pass[] = "iotparkingftp";
char ftp_path[] = "/foto/";

ESP32_FTPClient ftp(ftp_server,ftp_user,ftp_pass, 5000, 2);

String serverName = "172.20.10.2";


const int serverPort = 80;
HTTPClient http;
WiFiClient client;

const int timerInterval = 20000;    // time between each HTTP POST image
unsigned long previousMillis = 0;   // last time image was sent
#define CAMERA_MODEL_AI_THINKER

#include "camera_pins.h"



void setup() {
  Serial.begin(115200);
  pinMode(sensor,INPUT);
  // inicializamos tira1 y tira2

   if(!display.begin(SSD1306_SWITCHCAPVCC)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); // Don't proceed, loop forever
  }

  display.display();
  delay(2000); // Pause for 2 seconds

  // Clear the buffer
  display.clearDisplay();



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

  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  WiFi.mode(WIFI_STA);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);  
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("ESP32-CAM IP Address: ");
  Serial.println(WiFi.localIP());

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_QHD;
  config.pixel_format = PIXFORMAT_JPEG; // for streaming
  //config.pixel_format = PIXFORMAT_RGB565; // for face detection/recognition
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;
  ftp.OpenConnection();
  // init with high specs to pre-allocate larger buffers
  if(psramFound()){
      config.jpeg_quality = 5;
      config.fb_count = 3;
      config.grab_mode = CAMERA_GRAB_LATEST;
    } else {
      // Limit the frame size when PSRAM is not available
      config.frame_size = FRAMESIZE_SVGA;
      config.fb_location = CAMERA_FB_IN_DRAM;
    }
  
  // camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    delay(1000);
    ESP.restart();
  }

  sensor_t * s = esp_camera_sensor_get();
  s->set_brightness(s, 2);

}

void testdrawchar(char a) {
  display.clearDisplay();

  display.setTextSize(1);      // Normal 1:1 pixel scale
  display.setTextColor(SSD1306_WHITE); // Draw white text
  display.setCursor(0, 0);     // Start at top-left corner
  display.cp437(true);         // Use full 256 char 'Code Page 437' font

  display.write(a);

  display.display();
}

void sendPhotoFTP() {
  String getAll;

  camera_fb_t * fb = NULL;
  fb = esp_camera_fb_get();
  if(!fb) {
    Serial.println("Camera capture failed");
    delay(1000);
    ESP.restart();
  }
    uint32_t imageLen = fb->len;

    uint8_t *fbBuf = fb->buf;
    size_t fbLen = fb->len;

    ftp.ChangeWorkDir(ftp_path);
    ftp.InitFile("Type I");
    String fileName = "a.jpg";
    int str_len = fileName.length() + 1; 
    char char_array[str_len];
    fileName.toCharArray(char_array, str_len);

     ftp.NewFile(char_array);
    ftp.WriteData( fb->buf, fb->len );
    ftp.CloseFile();

  
    esp_camera_fb_return(fb);
    Serial.println("El resultado del servidor es");

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

int getAvailableSpot(){

  http.begin("http://"+serverName + "/photoUploaded");
  http.GET();
  int lugar = http.getString().toInt();
  Serial.println("Lugar obtenido fue");
  Serial.println(lugar);
  return lugar;
}



void openMainBarrier(){
  int angulo = 180;
  pwm.writeServo(16, angulo);
  
}

void closeMainBarrier(){
  int angulo = 0;
  pwm.writeServo(16, angulo);
  
}

void upBarrierRequest(int spot){
  String req = "{\"spot\":" + String(spot) + "}";
  Serial.println("http://" + serverName + "/subirBarrera");
  http.begin(client, "http://" + serverName + "/subirBarrera");
  http.addHeader("Content-Type", "application/json");
  http.POST(req);

}



void loop() {
  
  if(digitalRead(sensor) == LOW){
    
    sendPhotoFTP();
    int avSpot = getAvailableSpot();
    upBarrierRequest(avSpot);
    int numTira = 1;
    if(avSpot == 1){
      numTira = 2;
      prender(lugar1, largo1, numTira, otroColor);
        testdrawchar('1');
      openMainBarrier();
    }else if(avSpot == 2){
      numTira = 2;
      prender(lugar2, largo2, numTira, verde);
      testdrawchar('2');
      openMainBarrier();
    }else if(avSpot == 3){
      prender(lugar3, largo3, numTira, rojo);
      testdrawchar('3');
      openMainBarrier();
    }else if(avSpot == 4){
      prender(lugar4, largo4, numTira, verde);
      testdrawchar('4');
      openMainBarrier();
    }

    //prenderDisp(avSpot);
    delay(15000);
    closeMainBarrier();
    }
}
