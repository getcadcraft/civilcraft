---
title: De la adresă la amplasament
summary: Transformați o adresă în ceea ce trebuie să știe un amplasament: parcela, clădirile din jur, zonarea, solul și zona de inundabilitate, din date deschise pe care le cereți prin buton sau le aduceți ca fișiere, și le trimiteți către BimCraft ca sugestii.
keywords: adresă, geocodare, amplasament, parcelă, clădiri, zonare, sol, inundație, date deschise, openstreetmap, fema, ssurgo, usgs, context, ccsite, bimcraft
from: 125d848a
---

## Ce face

Suprafață › Mai multe › De la adresă la amplasament răspunde, pentru un punct: în ce parcelă se află, clădirile din jur, zonarea, solul și zona de inundabilitate. Datele sunt deschise: fișierele pe care le adăugați (GeoJSON, shapefile, KML, GeoPackage) și, când activați suplimentele, butoane care cer fiecare câte un serviciu deschis.

## Cum se folosește

1. Tastați o adresă și apăsați butonul de căutare a adresei (suplimentul „Căutare adresă”), sau tastați latitudinea și longitudinea.
2. Adăugați straturi: fișiere cu „Adăugare fișiere”, sau celelalte butoane de sursă (zona de inundabilitate, clădiri, sol, altitudinea terenului, parcele ale județului). Un serviciu este interogat doar când apăsați butonul lui; nimic nu se descarcă la pornire.
3. Apăsați butonul de rulare pentru răspunsul în cuvinte, cu un CSV.
4. „Salvarea amplasamentului ca fișier” sau „Trimitere către BimCraft ca sugestii” dă conturele către BimCraft sau ModelCraft; acestea le listează și adaugă doar ce bifați.

## Ce trebuie să știți

- Căutarea adresei trece prin getcadcraft.com, care cere Nominatim al OpenStreetMap în locul utilizatorului (cel mult o cerere pe secundă; răspunsurile se păstrează 90 de zile, ca aceeași adresă să nu fie cerută de două ori; se stochează doar un hash al adresei, niciodată cine a cerut). Celelalte butoane merg direct din browser către serviciul lor.
- Fiecare sursă are propria licență (OpenStreetMap este sub ODbL: păstrați linia de atribuire).
- Straturile sunt la fel de bune ca datele deschise din zonă. Verificați ce contează față de un releveu.
