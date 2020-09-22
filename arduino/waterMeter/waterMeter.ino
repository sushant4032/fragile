#include <LiquidCrystal.h>
#include <NewPing.h>

#define TRIG  2
#define ECHO  3
#define TOP 20
#define BOTTOM 72

uint8_t block[8]  = {0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F};

int d;
int perc, blocks;
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

}

void loop() {
  digitalWrite(TRIG, LOW);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(12);
  digitalWrite(TRIG, LOW);
  d = 0.0175 * pulseIn(ECHO, HIGH);
  perc = map(d, TOP, BOTTOM, 100, 0);
  blocks = map(perc, 0, 100, 0, 16);
  lcd.clear();
  for (int i = 0; i <= blocks; i++)
    lcd.write(3);
  lcd.setCursor(0, 1);
  lcd.print("Water: ");
  lcd.print(perc);
  lcd.print(" %");
  getButton();
  if (btn) buttonAction();
  delay(1000);
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
}
void buttonAction() {
  switch (btn) {
    case 1:
      {
        lcd.clear();
        lcd.print("Distance:");
        lcd.setCursor(0,1);
        lcd.print(d);
        break;
      }
    case 2:
      {
        lcd.clear();
        lcd.print("Distance:");
        lcd.setCursor(0,1);
        lcd.print(d);
        break;
      }
    case 3:
      {
        lcd.clear();
        lcd.print("Distance:");
        lcd.setCursor(0,1);
        lcd.print(d);
        break;
      }
    case 4:
      {
        lcd.clear();
        lcd.print("Designed By:");
        lcd.setCursor(0,1);
        lcd.print("Sushant Tiwary");
        break;
      }
    case 5:
      {
        lcd.clear();
        lcd.print("Designed By:");
        lcd.setCursor(0,1);
        lcd.print("Sushant Tiwary");
        break;
      }
  }

}
