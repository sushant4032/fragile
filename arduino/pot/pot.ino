int pot = A0;
int led = 13;
int value = 0;
int period = 20;
int ontime = 0;

void setup() {
  pinMode(led, OUTPUT);
  pinMode(pot, INPUT);
  Serial.begin(9600);
}

void loop() {
  value = analogRead(pot);
  Serial.print (value);
  ontime = period * value / 1024;
  digitalWrite(led, HIGH);
  delay(ontime);
  digitalWrite(led, LOW);
  delay(period - ontime);
}
