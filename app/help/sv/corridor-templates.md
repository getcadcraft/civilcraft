---
title: Korridormallar och terrängmallar
summary: Gör små återanvändbara mallar (kantsten och rännsten, gångbana, mur, dike), bygg en korridor av dem per station med vänster och höger åtskilda, dela en linjeföring i flera korridorer och lägg lagrade material över en terräng.
keywords: mall, mallar, mallbibliotek, mallskapande, typisk tvärsektion, sammansättning, delsammansättning, komponenter, punktkoder, slutvillkor, släntkrön, dike, stödmur, kantsten, rännsten, gångbana, regioner, stationsintervall, flera korridorer, vänster och höger, terrängmall, matjord, beläggning, bas, drapera, material, kvantiteter
from: ce70e58b
---

En **mall** är en liten tvärsektion du ritar en gång och återanvänder: punkter med förskjutningar, lutningar och punktkoder, samt komponenter med material. En korridor kan byggas av mallar per station, där varje sida har egna beläggningsmallar och eget slutvillkor, och samma mallar kan läggas över en terräng.

:::warning
Exempelmallarna är platshållare att börja från. Deras värden är inte hämtade från någon standard eller myndighet. En ingenjör måste kontrollera varje mall och varje värde du ger den innan den används i en projektering.
:::

## Öppna mallarna

Öppna {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Korridormallar…}} (eller skriv {{cmd:TEMPLATES}}). Fönstret har tre listor:

- **I det här projektet**: de mallar som projektets korridorer och terrängmallar använder. De sparas i projektfilen.
- **Mitt bibliotek**: mallar som finns kvar i den här webbläsaren och erbjuds i varje projekt. Använd {{ui:Spara i Mitt bibliotek}} på en projektmall för att behålla den.
- **Exempel**: två körfält med lager, kantsten och rännsten, gångbana, släntkrön, dike, stödmur, matjord under terrängen och beläggning på terrängen. Var och en är märkt ”För kontroll av en ingenjör”.

{{ui:Använd i det här projektet}} kopierar en biblioteks- eller exempelmall in i projektet. {{ui:Exportera projektets mallar}} sparar dem som en `.cctemplates.json`-fil, och {{ui:Importera en fil}} läser in en sådan i projektet och i Mitt bibliotek. Använd filen för att dela mallar eller flytta dem till en annan dator.

## Gör en mall

{{ui:Ny mall}} (eller {{ui:Redigera}} på en projektmall) öppnar mallredigeraren. Rita den högra sidan, utåt från mallens 0,0-punkt; den vänstra sidan använder samma mall utåt till vänster.

1. Ge den ett namn och en typ: **Beläggning** (nästa mall fäster i dess slut), **Slutvillkor** (den möter marken) eller **Terrängmall**.
2. Lägg till **värden**: namngivna tal som en bredd `w` eller en lutning `s`. En sifferruta var som helst i mallen tar ett tal eller ett värdes namn; `-t` är värdet `t` gjort negativt. En korridor kan ge varje användning av mallen egna värden, så att en kantstensmall kan användas för varje kanthöjd.
3. Lägg till **punkter** i ordning. Var och en placeras från en tidigare punkt (eller 0,0-punkten) enligt sitt villkor:

| Villkor | Placerar punkten |
|---|---|
| Förskjutning i lutning | En förskjutning utåt och en lutning (stigning per sträcka; −0.02 faller 2 %) |
| Förskjutning och höjning | En förskjutning och en höjning |
| Rakt upp eller ned | Endast en höjning |
| Sidoslänt ner till marken | Ut från sin punkt till marken, med skärningsförhållandet där marken är över och fyllningsförhållandet där den är under |
| Till marken | En förskjutning, sedan rakt upp eller ned till marken |
| Stödmur | En mur med den tjocklek du anger: i skärning möter dess överkant marken vid vägkanten, i fyllning går vägen över den och dess yttre sida faller ner till marken |

   Bocka för **Topp** för de punkter som den färdiga terrängytan går genom. Den sista toppunkten är där nästa mall på den sidan börjar. Ett **Mål** låter en korridor flytta punkten: dess förskjutning eller höjd kommer från en linje.
4. Lägg till **komponenter**: slutna former genom punktkoder (`0` är 0,0-punkten), var och en med ett namn, ett material och en typ. Deras areor ger volymerna.

Ritningen följer varje ändring i sann skala, och listan under den säger vad som är fel (en punkt som möter marken före slutet, ett värde som mallen inte har, en komponent utan area). {{ui:Lägg till i projektet}} eller {{ui:Spara}} behåller den, som ett enda ångra-steg.

## Bygg en korridor av mallar

Välj en linjeföring med en korridor och slå på {{ui:Bygg från mallar per station}} i dess egenskaper. Korridoren börjar med exemplen två körfält och släntkrön på båda sidor.

- **Regioner.** Varje region börjar vid en station och går till nästa regions. {{ui:Lägg till en region}} lägger till en; ändra dess startstation i dess ruta.
- **Vänster och höger åtskilda.** Varje sida av varje region har sin egen lista **Beläggning**, från mitten av vägen utåt, och sitt eget **Slutvillkor**: släntkrön, dike, mur eller en valfri mall som möter marken. Utan slutvillkor får sidan släntkrön vid korridorens skärnings- och fyllningslutningar. {{ui:Kopiera vänster till höger}} kopierar en sida.
- **Värden och mål.** Under varje mall på en sida finns en ruta per värde (tom = mallens eget värde) och, för en punkt som tar ett mål, den funktionslinje eller den andra korridorens linje som flyttar den.
- **Från och Till** begränsar korridoren till en del av linjeföringen.

Tvärsektionerna, planlinjerna för varje punktkod, den planerade terrängmodellen, utsättningen och jordarbetet följer alla med. Egenskaper listar varje komponents volym per sida och region (medelvärde av ändarea längs mittlinjen). Överhöjning och korridorens kantmål används inte medan korridoren byggs av mallar.

## Flera korridorer på en linjeföring

Under **Korridorer på den här linjeföringen** lägger {{ui:Lägg till en korridor}} till en korridor på resten av linjeföringen: den första korridoren får en slutstation i mitten (eller behåller sin egen), och den nya börjar där med den första korridorens sista region av mallar. Varje korridor har sitt eget namn, stationsintervall, mallar och jordarbete. Stäng av en med dess {{ui:På}}-ruta. Där två intervall överlappar planeras den senare korridoren över den tidigare.

## Terrängmallar

En terrängmall lägger mallens lager över en terräng från dess 0,0-punkt: ett lager under 0,0-punkten går ner i marken (matjord som ska avlägsnas), ett lager över den ligger på marken (bas och beläggning på en parkering). Bredder och lutningar spelar ingen roll, bara varje komponents djup över eller under 0,0-punkten.

Öppna {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Terrängmallar…}} (eller skriv {{cmd:TERRAINTEMPLATES}}); blocket finns också i projektets egenskaper. {{ui:Lägg till en terrängmall}} lägger till en med matjordsexemplet. För var och en väljer du:

- **mallen** (dess värden kan ändras för just denna),
- **terrängen**: den befintliga marken eller den planerade terrängmodellen,
- **formen** som klipper den: hela terrängen, en fastighet, en byggplatta eller en sluten funktionslinje. Flera terrängmallar kan använda olika former på samma terräng.

Varje lager visar sin tjocklek, plan area och volym. Volymen är plan area gånger tjockleken, där tjockleken mäts rakt nedåt; arean mäts på ett rutnät, och den dragna (lutande) arean anges också. Formerna ritas på planen på lagret C-TOPO-TMPL. Terrängmallar ändrar inte den planerade terrängmodellen.

## Material och kvantiteter

Projektets jordarbetsblock listar **Material från mallar**: varje korridorkomponent och varje terrängmallslager med sin volym. {{ui:Skicka till TakeoffCraft}} skriver dem till kvantitetsfilen efter skärning och fyllning, ett objekt var, i kubikyard (projekt i fot) eller kubikmeter.

## Filer

Mallar, regioner, de extra korridorerna och terrängmallarna sparas i projektfilen. Ett projekt som inte använder något av dem sparas precis som förut, och äldre CivilCraft-versioner öppnar ett projekt som använder dem (de ignorerar mallarna och bygger korridorens egna tvärsnitt).
