const int sensor = 5;

void setup() {
  pinMode(16,OUTPUT);
  pinMode(sensor,INPUT);

  Serial.begin(9600);
  Serial.println("Serial iniciado");
  digitalWrite(16,LOW);
}

void loop() {
  
  int readSensor = digitalRead(sensor);

  Serial.println(readSensor);
  if(readSensor == LOW){
    Serial.println("Detecto");
  }else{
    Serial.println("No detectado!");
  }
  delay(1000);
  
}
