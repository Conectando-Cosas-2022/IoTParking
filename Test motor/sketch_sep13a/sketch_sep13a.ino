#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <Servo.h>
/* Set these to your desired credentials. */
const char *ssid = "HUAWEI-IoT"; //Enter your WIFI ssid
const char *password = "ORTWiFiIoT"; //Enter your WIFI password

Servo myservo;
int angulo;

ESP8266WebServer server(80);
void handleRoot() {
 server.send(200, "text/html", "<form action=\"/LED_BUILTIN_on\" method=\"get\" id=\"form1\"></form><button type=\"submit\" form=\"form1\" value=\"On\">On</button><form action=\"/LED_BUILTIN_off\" method=\"get\" id=\"form2\"></form><button type=\"submit\" form=\"form2\" value=\"Off\">Off</button>");
}


void handleSave() {
 if (server.arg("pass") != "") {
   Serial.println(server.arg("pass"));
 }
}
void setup() {
 pinMode(LED_BUILTIN, OUTPUT);
 myservo.attach(16);
 delay(3000);
 Serial.begin(9600);
 Serial.println();
 Serial.print("Configuring access point...");
 WiFi.begin(ssid, password);
 while (WiFi.status() != WL_CONNECTED) {
   delay(500);
   Serial.print(".");
 }

 
 Serial.println("");
 Serial.println("WiFi connected");
 Serial.println("IP address: ");
 Serial.println(WiFi.localIP());
 server.on ( "/", handleRoot );
 server.on ("/save", handleSave);
 server.begin();
 Serial.println ( "HTTP server started" );

 server.on("/LED_BUILTIN_on", []() {
   digitalWrite(LED_BUILTIN, 1);
   angulo= 0;
  myservo.write(angulo);
  Serial.print("ángulo:  ");
  Serial.println(angulo);
  delay(2000);
   handleRoot();
 });
 
 server.on("/LED_BUILTIN_off", []() {
   digitalWrite(LED_BUILTIN, 0);
   Serial.println("off");
   angulo= 180;
  myservo.write(angulo);
  Serial.print("ángulo:  ");
  Serial.println(angulo);
  delay(2000);
   handleRoot();
 });
}


void loop() {
 
server.handleClient();
  
} 
