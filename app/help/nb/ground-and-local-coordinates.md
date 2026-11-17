---
title: Terreng- og lokale koordinater
summary: Arbeid i terreng- (overflate-) koordinater skalert fra rutenettet med en kombinert skalafaktor du skriver inn eller beregner i et punkt, eller i et antatt områdenett knyttet til systemet med to kontrollpunkter.
keywords: terrengkoordinater, overflatekoordinater, rutenett til terreng, kombinert skalafaktor, csf, kombinert faktor, rutenettfaktor, høydefaktor, havnivåfaktor, konvergens, avbildningsvinkel, skalafaktor, antatte koordinater, lokale koordinater, områdenett, 5000 5000, kontrollpunkter, lokalisering, kalibrering, to punkter, lukkefeil
from: 3d7453de
---

State plane- og UTM-koordinater er **rutenett**-koordinater: en kartprojeksjon strekker eller krymper avstander litt (titalls deler per million, ppm), og jo høyere tomta er, jo mer skiller en målt terrengavstand seg fra rutenettavstanden. Mange oppmålinger leverer derfor **terreng**-koordinater, skalert slik at planavstander er like avstander målt på bakken, eller et **antatt** områdenett (5000, 5000 i et kontrollpunkt). CivilCraft beholder tallene dine som de er og registrerer hvordan de forholder seg til rutenettet, slik at breddegrad og lengdegrad, GIS-filer og kartlag fortsatt havner riktig.

Åpne {{ui:Koordinater}} i {{ui:GIS}}-gruppen, velg (eller behold) systemet, og velg under **Rutenett-, terreng- eller lokale koordinater**:

| Valg | Koordinatene dine er | Slik forholder de seg til rutenettet |
|---|---|---|
| {{ui:Rutenett}} | Systemets egne (utgangspunktet) | De samme tallene |
| {{ui:Bakke}} | Skalert til terrengavstander | grid = base + combined factor × (ground − base) |
| {{ui:Lokal}} | Et antatt områdenett | Flyttet, dreiet og skalert til rutenettet ved to kontrollpunkter |

Det du velger, lagres med prosjektet og er ett steg som kan angres; ingenting flyttes.

## Terrengkoordinater

1. Velg {{ui:Bakke}}.
2. Skriv inn **Kombinert skalafaktor** fra oppmålingen (for eksempel `0.99987`), eller beregn den:
   1. Under **Beregn faktoren i et punkt** starter punktet midt i prosjektet. Velg {{ui:Velg et punkt på planen}} og klikk stedet (et klikk nær et oppmålingspunkt tar det punktet), eller skriv inn Ø og N.
   2. Høyden kommer fra overflaten der; skriv inn en annen hvis du trenger det.
   3. Velg {{ui:Beregn}}. CivilCraft viser:
      - **Rutenettets skalafaktor k**: hvor mye kartprojeksjonen strekker avstander der.
      - **Høydefaktor**: hvor mye kortere avstander er på ellipsoiden enn i den høyden.
      - **Kombinert faktor** = k × høydefaktor: rutenettavstand = terrengavstand × dette.
      - **Konvergens**: vinkelen fra rutenettets nord til sann nord der (geodetisk asimut = rutenettasimut + konvergens).
   4. Velg knappen {{ui:Bruk}} under tallene for å sette den kombinerte faktoren i boksen.
3. Sett **Basispunkt**, der terreng- og rutenettkoordinater er like. Det starter på 0, 0: de fleste myndigheter som publiserer terrengkoordinater skalerer om origo, så terrengkoordinatene forblir tydelig nær rutenettets. Noen oppmålinger skalerer om prosjektets kontrollpunkt i stedet: bruk det oppmålingen sier.
4. Velg {{ui:Bruk}}.

:::warning
Høyden tas som høyde over ellipsoiden. CivilCraft har ingen geoidmodell, så der geoiden ligger 30 m (100 ft) under eller over ellipsoiden, er høydefaktoren av med omtrent 5 ppm. Når oppmålingen oppgir sin kombinerte faktor, skriv inn den.
:::

## Lokale (antatte) koordinater

1. Velg {{ui:Lokal}}.
2. For **Kontrollpunkt 1**, skriv inn oppmålingspunktets nummer (eller velg {{ui:Velg}} og klikk det på planen). Dets lokale koordinater vises ved siden av.
3. Skriv inn rutenettets Ø og N for det, eller dets breddegrad og lengdegrad i den tredje boksen (for eksempel `30.2672, -97.7431`).
4. Gjør det samme for **Kontrollpunkt 2**, så langt fra det første som mulig.
5. CivilCraft viser **Skala** og **Rotasjon** som er funnet, og minner deg om: **To punkter passer alltid nøyaktig — kontroller et tredje.**
6. Gi et **Sjekkpunkt** på samme måte. CivilCraft viser hvor langt tilpasningen plasserer det fra rutenettkoordinatene du skrev (lukkefeilen, i prosjektenheter og ppm). En stor lukkefeil betyr et feil punkt, en skrivefeil, eller koordinater i en annen enhet.
7. Velg {{ui:Bruk}}.

En skala langt fra 1 (utenfor 0,5 til 2) avvises: kontroller punktene og deres enheter.

## Hva som er kontrollert

- Skalafaktoren og konvergensen stemmer med PROJ (pyproj 3.7.1 med PROJ 9.5.1), koordinatbiblioteket de fleste GIS-programmer bruker, til 1 del i en milliard på over 300 systemer med konforme projeksjoner (state plane, UTM, tverrmerkator, Lambert konform konisk), og i nettleseren i et punkt valgt på planen.
- Terreng- og lokale steg konverterer frem og tilbake til 1 del i en milliard; to kontrollpunkter gir tilbake skalaen og rotasjonen de ble laget med; et sjekkpunkt 0,05 ft unna viser en lukkefeil på 0,05 ft.
