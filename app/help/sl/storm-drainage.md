---
title: Izračun meteornih pretokov, dimenzij cevi in hidravlične črte
summary: Narišite prispevna območja, ki odtekajo v vsak objekt, seštejte pretoke po omrežju z racionalno metodo, določite dimenzije cevi po Manningovi enačbi in preverite, kje hidravlična črta teče polna ali doseže površje.
keywords: meteorno odvodnjavanje, prispevno območje, odtočno območje, racionalna metoda, koeficient odtoka, čas koncentracije, intenzivnost padavin, idf, manning, dimenzioniranje cevi, hidravlična črta, hgl, energijska črta, egl, preobremenitev, poplavljanje, gladina na iztoku
from: e44872ec
---

Meteorno odvodnjavanje deluje na [omrežju cevi](topic:pipe-network): najprej narišite omrežje, nato območja, ki vanj odtekajo. Vse je prikazano pod **Meteorno odvodnjavanje** v desni plošči, kadar ni nič izbrano.

## Risanje prispevnega območja

1. Kliknite **Nariši prispevno območje** pod **Meteorno odvodnjavanje**.
2. Kliknite oglišča območja, ki odteka v en objekt. {{key:Enter}} ali dvojni klik zaključi; {{key:Backspace}} vzame nazaj zadnje oglišče, {{key:Esc}} ustavi.
3. Območje odteka v objekt znotraj njega, sicer v najbližjega. Odprejo se njegove **Lastnosti**: nastavite ime, **Koeficient odtoka C** (delež padavin, ki odtečejo, od 0 do 1), **Čas koncentracije** v minutah in objekt, v katerega **odteka**.

**Nariši drugo prispevno območje** v njegovih Lastnostih začne naslednje. Kliknite znotraj prispevnega območja v tlorisu, da ga izberete; {{key:Delete}} ga odstrani. Vsaka sprememba je en korak: {{key:Mod+Z}} jo razveljavi.

## Nastavitev projektne nevihte

Intenzivnost padavin je i = a ÷ (tc + b) na potenco c, v palcih na uro pri projektu v čevljih in v milimetrih na uro pri projektu v metrih. Prilagodite **Intenzivnost a**, **b** in **c** lastni krivulji intenzivnost–trajanje–pogostost za povratno dobo, za katero projektirate.

:::warning
Začetna krivulja intenzivnosti, Manningov n (0.013) in izguba na stiku (0.5) sta nadomestni vrednosti, ne standard. Nastavite jih na podlagi lastnih podatkov o padavinah in projektnih kriterijev.
:::

- **Najkrajši čas koncentracije**: nobena cev se ne računa pri krajšem času (na začetku 10 minut).
- **Manningov n**: hrapavost cevi.
- **Izguba na stiku**: višinska izguba v vsakem objektu kot delež hitrostne višine V²/2g cevi, ki iz njega odteka.
- **Gladina vode na iztoku**: gladina na iztoku, kamor se izliva zadnja cev. Pustite prazno, kadar iztok odteka prosto.

## Seštevanje pretokov

Vsaka cev prenaša vsa območja nad seboj. Q = C × i × A, kjer se C × A seštevata po omrežju, i pa je intenzivnost pri najdaljšem času koncentracije prihajajoče vode: lastni čas območja ali čas iz višjega območja plus čas potovanja po cevi (dolžina ÷ hitrost pri polnem pretoku). Q je v kubičnih čevljih na sekundo (A v akrih) ali kubičnih metrih na sekundo (A v hektarih).

## Dimenzioniranje cevi

Preglednica pod **Pretoki in hidravlične črte** za vsako cev prikazuje pretok, kaj prenese pri polnem pretoku pri svojem naklonu, hitrost, hidravlično višino na vrhu in na dnu ter globino vode.

**Dimenzioniraj cevi za te pretoke** da vsaki cevi najmanjšo standardno dimenzijo, ki pri njenem naklonu prenese njen pretok (12 do 72 in ali 300 do 1800 mm). Gre za en korak. Dna cevi ostanejo, kjer so: če se dimenzije spremenijo, uporabite **Nastavi vsa dna cevi po pravilih**, da ohranite zasip, nato znova preverite preglednico.

## Branje hidravličnih črt

Hidravlična črta (HGL) se izračuna od iztoka navzgor:

- Cev, ki teče delno polna, ima HGL na gladini vode: dno plus normalna globina.
- Ko je voda spodaj višje od temena cevi ali cev prenaša več, kot lahko pri polnem pretoku, teče polna (preobremenjena) in njen HGL se dvigne za naklon trenja čez njeno dolžino.
- Na vsakem objektu je HGL enak HGL na vrhu odtočne cevi plus izguba na stiku.
- Energijska črta (EGL) je HGL plus hitrostna višina.

Cev, ki teče polna, je navedena, prav tako vsak objekt, kjer je HGL nad robom pokrova: voda tam doseže površje, objekt pa je v tlorisu obkrožen z rdečo. Izberite cev ali objekt, da v njegovih Lastnostih vidite pretok, globino, hitrost in obe hidravlični črti.

## Vodenje nevihte

Racionalna metoda da en vrh za vsako cev. {{ui:Izračunaj nevihto}} (pod rezultati, v Lastnostih omrežja) namesto tega izračuna celotno nevihto: odtok vsakega območja skozi čas, ki se prenaša po ceveh s svojim časom potovanja in zadrževanjem ter se sešteje tam, kjer se stekajo.

1. Pustite {{ui:Dež traja (min)}} in {{ui:Intenzivnost padavin}} prazna, da se uporabita najdaljši čas koncentracije in zgornja krivulja padavin, ali vnesite svoji.
2. Pritisnite {{ui:Izračunaj nevihto}}. Preglednica za vsako cev navaja največji pretok na vtoku in iztoku, za koliko je iztočni vrh nižji, kolikšen delež polne zmogljivosti cevi uporablja in minuto, ko doseže vrh.
3. Vsak iztok dobi majhen grafikon pretoka skozi čas in {{ui:Prenesi hidrogram (CSV)}}.

Prispevno območje odda dež, povprečen čez svoj čas koncentracije, zato nevihta, krajša od tega, doseže nižji vrh kot C × i × A. Vsaka cev se vodi po metodi Muskingum–Cunge z globino toka, ki jo je racionalna metoda že našla. Dve veji z različnima časoma koncentracije nimata vrhov ob istem času, zato je njuna vsota nižja od vsote njunih vrhov.

To ne modelira preobremenitve, vzvratnega vpliva, zadrževanja v objektih ali poplavljanja. Cev, katere vodeni vrh presega njeno polno zmogljivost, je navedena, njena voda pa se posreduje naprej, kot da se vanjo prilega. Uporabite za prikaz časovnega poteka in dušenja, ne za dimenzioniranje cevi. Gre za računsko pomoč: inženir jo preveri.

## Shranjeno s projektom

Prispevna območja in nastavitve nevihte se shranijo v datoteko projekta. Še niso v PDF izrisu, DWG ali DXF ali LandXML: glejte [Še ni izdelano](topic:not-built-yet).
