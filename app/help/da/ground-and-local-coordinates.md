---
title: Terræn- og lokale koordinater
summary: Arbejd i terræn- (overflade-)koordinater skaleret fra gitteret med en kombineret skalafaktor, du skriver eller beregner i et punkt, eller i et antaget stedgitter knyttet til systemet via to kontrolpunkter.
keywords: terrænkoordinater, overfladekoordinater, gitter til terræn, kombineret skalafaktor, csf, kombineret faktor, gitterfaktor, kotefaktor, havniveaufaktor, konvergens, afbildningsvinkel, skalafaktor, antagne koordinater, lokale koordinater, stedgitter, 5000 5000, kontrolpunkter, lokalisering, kalibrering, to punkter, lukkefejl
from: 3d7453de
---

State Plane- og UTM-koordinater er **gitter**koordinater: en kortprojektion strækker eller skruber afstande en smule (titalls dele pr. million), og jo højere stedet ligger, jo mere afviger en målt terrænafstand fra gitterafstanden. Mange opmålinger afleverer derfor **terræn**koordinater, skaleret, så planafstande er lig med afstande målt på terrænet, eller et **antaget** stedgitter (5000, 5000 i et kontrolpunkt). CivilCraft beholder dine tal, som de er, og registrerer, hvordan de forholder sig til gitteret, så breddegrad og længdegrad, GIS-filer og kortlag stadig havner det rigtige sted.

Åbn {{ui:Koordinater}} i {{ui:GIS}}-gruppen, vælg (eller behold) systemet, og vælg derefter under **Gitter-, terræn- eller lokale koordinater**:

| Valg | Dine koordinater er | Sådan hænger de sammen med gitteret |
|---|---|---|
| {{ui:Gitter}} | Systemets egne (startpunktet) | De samme tal |
| {{ui:Terræn}} | Skaleret til terrænafstande | gitter = base + kombineret faktor × (terræn − base) |
| {{ui:Lokal}} | Et antaget stedgitter | Flyttet, drejet og skaleret ind på gitteret af to kontrolpunkter |

Det, du vælger, gemmes med projektet og er ét fortrydelsestrin; intet flytter sig.

## Terrænkoordinater

1. Vælg {{ui:Terræn}}.
2. Skriv den **kombinerede skalafaktor** fra opmålingen (for eksempel `0.99987`), eller beregn den:
   1. Under **Beregn faktoren i et punkt** starter punktet i midten af projektet. Vælg {{ui:Vælg et punkt i planen}} og klik på stedet (et klik nær et opmålingspunkt tager det punkt), eller skriv E og N.
   2. Koten kommer fra overfladen dér; skriv en anden, hvis du har brug for det.
   3. Vælg {{ui:Beregn}}. CivilCraft viser:
      - **Gitterskalafaktor k**: hvor meget kortprojektionen strækker afstande dér.
      - **Kotefaktor**: hvor meget kortere afstande er på ellipsoiden end i den højde.
      - **Kombineret faktor** = k × kotefaktor: gitterafstand = terrænafstand × denne.
      - **Konvergens**: vinklen fra gitternord til geografisk nord dér (geodætisk azimut = gitterazimut + konvergens).
   4. Vælg knappen {{ui:Anvendelse}} under tallene for at sætte den kombinerede faktor i feltet.
3. Angiv **Basispunkt**, hvor terræn- og gitterkoordinater er de samme. Det starter ved 0, 0: de fleste myndigheder, der offentliggør terrænkoordinater, skalerer om origo, så terrænkoordinaterne forbliver genkendeligt tæt på gitterets. Nogle opmålinger skalerer i stedet om projektets kontrolpunkt: brug det, opmålingen siger.
4. Vælg {{ui:Anvend}}.

:::warning
Koten tages som højde over ellipsoiden. CivilCraft har ingen geoidemodel, så hvor geoiden ligger 30 m (100 ft) under eller over ellipsoiden, er kotefaktoren forkert med cirka 5 ppm. Når opmålingen angiver sin kombinerede faktor, skriv den.
:::

## Lokale (antagne) koordinater

1. Vælg {{ui:Lokal}}.
2. Under **Kontrolpunkt 1** skriv opmålingspunktets nummer (eller vælg {{ui:Vælg}} og klik det på planen). Dets lokale koordinater vises ved siden af.
3. Skriv dets **gitter**-E og N, eller dets breddegrad og længdegrad i den tredje boks (for eksempel `30.2672, -97.7431`).
4. Gør det samme for **Kontrolpunkt 2**, så langt fra det første som muligt.
5. CivilCraft viser den fundne **Skala** og **Rotation** og minder dig om: **To punkter passer altid præcist — kontrollér et tredje.**
6. Giv et **Tjekpunkt** på samme måde. CivilCraft viser, hvor langt tilpasningen sætter det fra de gitterkoordinater, du skrev (dets lukkefejl, i projektets enheder og i dele pr. million). En stor lukkefejl betyder et forkert punkt, en tastefejl eller koordinater i en anden enhed.
7. Vælg {{ui:Anvend}}.

En skala langt fra 1 (ud over 0.5 til 2) afvises: kontrollér punkterne og deres enheder.

## Hvad der er kontrolleret

- Skalafaktoren og konvergensen matcher PROJ (pyproj 3.7.1 med PROJ 9.5.1), koordinatbiblioteket de fleste GIS-programmer bruger, inden for 1 del ud af en milliard på over 300 systemer med konforme projektioner (State Plane, UTM, transverse Mercator, Lambert conformal conic) og i browseren ved et punkt valgt på planen.
- Terræn- og lokale trin konverteres frem og tilbage inden for 1 del ud af en milliard; to kontrolpunkter giver skalaen og rotationen tilbage, som de blev lavet med; et tjekpunkt 0.05 ft ude viser en lukkefejl på 0.05 ft.
