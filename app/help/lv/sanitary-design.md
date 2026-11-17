---
title: Sadzīves kanalizācijas projektētās plūsmas un kanalizācijas pārbaude
summary: Ievadiet iedzīvotājus un platību, kas ieplūst katrā revīzijas akā sadzīves kanalizācijas tīklā; CivilCraft tos saskaita pa tīklu lejup, aprēķina maksimālo plūsmu ar maksimālās plūsmas koeficientu un infiltrāciju un pārbauda katras caurules jaudu un ātrumu.
keywords: sadzīves kanalizācija, kanalizācija, notekūdeņi, sadzīves kanalizācijas caurule, projektētā plūsma, maksimālā plūsma, maksimālās plūsmas koeficients, harmons, babits, infiltrācija, iedzīvotāji, uz vienu iedzīvotāju, procenti pilni, pašattīrīšanās, ātrums, caurules izmēra noteikšana, projektēšanas lapa
from: 73ba197a
---

Sadzīves kanalizācijas projektētās plūsmas darbojas uz [caurulu tīkla](topic:pipe-network), kad tā {{ui:Tips}} ir {{ui:Sadzīves kanalizācija}}. Ja nekas nav atlasīts, labajā panelī tad tiek rādīts **Sadzīves kanalizācijas projektētās plūsmas**, kur lietus tīklam tiek rādīta lietus ūdens novadīšana.

## Ievadiet, kas ieplūst

1. Atlasiet revīzijas aku. Sadaļā **Sadzīves kanalizācijas projektētās plūsmas** ierakstiet {{ui:Šeit ieplūstošie iedzīvotāji}} un {{ui:Šeit ieplūstošā platība}} (hektāri metru projektā, akri pēdu projektā).
2. Veikalām, birojiem vai rūpniecībai ierakstiet ekvivalentos iedzīvotājus: platība, reizināta ar iedzīvotājiem uz hektāru (vai akru), ko izmanto jūsu aģentūra. Platība skaitās infiltrācijai abos gadījumos.
3. Atkārtojiet katrai revīzijas akai, kur pieslēdzas iela vai zemesgabals. Revīzijas aka, kur nekas nepieslēdzas, paliek ar 0 abiem.

Katra caurule nes visu, kas ieplūst tās augšējā revīzijas akā un virs tās. Atlasiet revīzijas aku, lai redzētu, kas tai iet cauri.

## Iestatījumi

| Iestatījums | Ko tas nozīmē |
|---|---|
| {{ui:Plūsma uz vienu cilvēku}} | vidējā viena cilvēka plūsma dienā: litri (metru projektā) vai ASV galoni (pēdu projektā) |
| {{ui:Infiltrācija}} | gruntsūdens, kas ieplūst: litri sekundē uz hektāru vai galoni dienā uz akru |
| {{ui:Maksimālās plūsmas koeficients}} | Harmons, 1 + 14 / (4 + √P), vai Babits, 5 / P^0.2, ar P iedzīvotāju skaitu tūkstošos |
| {{ui:Maksimuma koeficients vismaz}} / {{ui:Maksimuma koeficients ne vairāk kā}} | koeficients tiek turēts starp šīm divām vērtībām |
| {{ui:Manninga n}} | jaudai un ātrumam |
| {{ui:Mazākais ātrums}} / {{ui:Lielākais ātrums}} | maksimālās plūsmas pašas dziļumā caurulē |
| {{ui:Lielākā daļa no pilnas jaudas}} | cik pilna caurule drīkst būt maksimālajā plūsmā, procentos no tā, ko tā nes pilna |

Sākuma vērtības ir vietturi, nevis standarts. Izmantojiet vērtības, ko publicē jūsu aģentūra.

## Ko tā aprēķina

Katrai caurulei plūsmas secībā:

- maksimālā plūsma = iedzīvotāji × plūsma uz iedzīvotāju × maksimālās plūsmas koeficients + platība × infiltrācija
- jauda pilnā caurulē (Manninga vienādojums pie caurules slīpuma) un cik pilna to padara maksimālā plūsma
- maksimālās plūsmas normālais dziļums un ātrums tajā

Tabula **Sadzīves kanalizācijas rezultāti** uzskaita katras caurules iedzīvotājus, maksimālās plūsmas koeficientu, maksimālo plūsmu (l/s vai gpm un cubic feet per second), procentus pilni un ātrumu. Zem tās uzskaitītas problēmas: caurule, kas ir pilnāka par ierobežojumu, lēnāka par mazāko ātrumu (tā var nepašķīst pati), ātrāka par lielāko vai bez krituma. {{ui:Izmēriet caurules šīm plūsmām}} izvēlas katrai caurulei mazāko standarta izmēru (200 mm vai 8 collas un lielāks), kas nes tās maksimālo plūsmu ierobežojumā; viens {{key:Mod+Z}} to atsauc.

:::note
Šī ir stacionārā maksimālā plūsma, ko aprēķina projektēšanas lapa, pārbaudīta pret publicētu projektēšanas lapu līdz tās drukātajam noapaļojumam. Tas nav kanalizācijas modelis laikā: nav hidrogrāfu, uzkrāšanas, sūkņu vai pārplūdes. Skatiet [Vēl nav izveidots](topic:not-built-yet).
:::

Ātrumi izmanto Manninga vienādojumu ar to pašu n katrā dziļumā. Dažu aģentūru daļēji pilno diagrammās n mainās ar dziļumu, kas dod nedaudz zemāku ātrumu caurulē, kas ir 60 līdz 70 procentus pilna (par aptuveni 3 procentiem mazāku).
