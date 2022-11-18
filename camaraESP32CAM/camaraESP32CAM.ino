/*Codido para ESP-32*/
#include <WiFi.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include "img_converters.h"
#include "esp_camera.h"
#include "Base64.h"
#include <HTTPClient.h>

#include <sstream> 
using namespace std;
const char* ssid = "Aloha";
const char* password = "carlitos2304";

String serverName = "192.168.94.194";

String serverPath = "/uploads";     // The default serverPath

const int serverPort = 80;

WiFiClient client;

const int timerInterval = 30000;    // time between each HTTP POST image
unsigned long previousMillis = 0;   // last time image was sent
#define CAMERA_MODEL_AI_THINKER

#include "camera_pins.h"



void setup() {
  Serial.begin(115200);

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
  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG; // for streaming
  //config.pixel_format = PIXFORMAT_RGB565; // for face detection/recognition
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  // init with high specs to pre-allocate larger buffers
  if(psramFound()){
      config.jpeg_quality = 80;
      config.fb_count = 2;
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

}


String sendPhoto() {
  HTTPClient http;
  String getAll;

  camera_fb_t * fb = NULL;
  fb = esp_camera_fb_get();
  if(!fb) {
    Serial.println("Camera capture failed");
    delay(1000);
    ESP.restart();
  }
  
  Serial.println("Connecting to server: " + serverName);
  http.begin("http://192.168.94.194/uploads");
  
    Serial.println("Connection successful!");    
    String tail = "\r\n--RandomNerdTutorials--\r\n";
    uint32_t imageLen = fb->len;

    uint8_t *fbBuf = fb->buf;
    size_t fbLen = fb->len;
    // unsigned char* pointer = (unsigned char*)fbBuf;
    // std::stringstream ss;
    // for(int i = 0; i < fbLen;i++)
    // {
      
    //   ss << std::hex << (int)pointer[i];
    // }
    // std::string mystr = ss.str();
    // const char *cstr = mystr.c_str();
    char *input = (char *)fb->buf;
    char output[base64_enc_len(3)];
    String imageFile = "data:image/jpeg;base64,";
    for (int i=0;i<fb->len;i++) {
      base64_encode(output, (input++), 3);
    if (i%3==0) imageFile += String(output);
    }

    Serial.println(imageFile);
    http.begin("http://192.168.94.194/uploads");
    http.addHeader("Content-Type","text/plain");
    //application/x-www-form-urlencoded
    String enviar = imageFile;  
    Serial.println("hola");
    int res = http.POST(enviar); 
    String body = http.getString();
    esp_camera_fb_return(fb);
    Serial.println("El resultado del servidor es");
    Serial.println(res);
    Serial.println(body);
  
  return body;
}

void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= timerInterval) {
    sendPhoto();
    previousMillis = currentMillis;
  }
}
