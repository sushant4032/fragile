#include <LiquidCrystal.h>
#include <NewPing.h>

#define TRIG  2
#define ECHO  3
#define TOP 100
#define BOTTOM 800
#define FULL BOTTOM-TOP

uint8_t block[8]  = {0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F};

int repeat = 50;
int count=0;
int wtg = 100;
int del = 100;
int band = 2;
int ctr = 0;

float d, d_accum, d_probe,  h, h_;

int perc, ltrs, blocks;

unsigned short btn;
float s1 = 0;
LiquidCrystal lcd(8, 9, 4, 5, 6, 7);



void setup() {
  Serial.begin(115200);

  lcd.begin(16, 2);
  lcd.createChar(3, block);
  lcd.home();
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);

  d_accum=0;

}

void loop() {
  d_probe=probe();
  d_accum+=d_probe;
  count++;
  if(count==repeat){
    d=d_accum/repeat;
    d_accum=0;
    count=0; 
    h = BOTTOM - d;
    perc = map(h, 0, FULL, 0, 100);
    blocks = map(perc, 0, 100, 0, 16);
    ltrs = round(h) * 2;
    lcdOut();
    plot();
  }
  
  if (d > (BOTTOM + 50) || d < 50 ) {
    lcd.print("ERROR!");
  }
  

  //  getButton();
  delay(del);
}

void plot() {

  //Serial.println(d_probe);
  //  Serial.println(d_last);

  h_ = BOTTOM - d;
  Serial.print(h_);
  Serial.print(",");
  Serial.println(h);


  //  Serial.println(diff);


}

float measure() {
 
}

float probe() {
  digitalWrite(TRIG, LOW);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(12);
  digitalWrite(TRIG, LOW);
  float d =  0.175 * pulseIn(ECHO, HIGH);
  return d;
}

void lcdOut() {
  lcd.clear();
  for (int i = 0; i <= blocks; i++)
    lcd.write(3);
  lcd.setCursor(0, 1);
  lcd.print(perc);
  lcd.print(" %   ");
  lcd.print(ltrs);
  lcd.print(" ltr");
  //  lcd.print(round(h));
  //  lcd.print("mm ");
}


void getButton(void)
{
  int x = analogRead(A0);
  if (x > 700) btn = 0;
  else if (x > 475) btn = 5;
  else if (x > 325) btn = 4;
  else if (x > 175) btn = 3;
  else if (x > 50) btn = 2;
  else btn = 1;
  if (btn) {
    buttonAction();
  }
}
void buttonAction() {
  switch (btn) {
    case 1:
      {
        lcd.clear();
        lcd.print("Designed By:");
        lcd.setCursor(0, 1);
        lcd.print("Sushant Tiwary");
        break;
      }
  }

}
