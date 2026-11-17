---
title: Meniji, tipke in miška
summary: Izberite slog menija, ki ustreza vašemu načinu dela, dodelite lastno tipko vsakemu ukazu, premikajte ukaze med zavihki traku ter določite, kaj počneta kolesce in tipke miške v tlorisu in v 3D.
keywords: slog menija, meniji, trak, civilni trak, orodna vrstica, ukazna vrstica, klasično risanje, bližnjice, tipke, prilagodi, preslikaj, ponovno dodeli, miška, kolesce, dno, smer povečave, srednja tipka, desna tipka, pomik, vrtenje, izvoz, uvoz, preklapljanje, znano
from: 07ac73a0
---

Ukazi CivilCraft so enaki, ne glede na to, kako do njih pridete. **Slog menija** le določa, kje so prikazani na zaslonu, kako se imenujejo in s katerimi tipkami se zaženejo, tako da lahko ohranite svoje navade. Izberete ga v {{ui:Nastavitve}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Meniji, tipke in miška}}; sprememba začne veljati takoj, ta brskalnik pa si jo zapomni.

## Trije slogi

| Slog | Kaj dobite |
|---|---|
| {{ui:CivilCraft}} | Lastna orodna vrstica CivilCraft ({{ui:Datoteka}}, {{ui:Izvoz}}, {{ui:Površje}}, Načrtovanje, Uredi, GIS, {{ui:Pogled}}) in posamezne tipke: {{key:A}} poravnava, {{key:G}} podloga, {{key:P}} cevi, {{key:B}} prelomnica, {{key:O}} meja, {{key:L}} karakteristična črta, {{key:R}} profil, {{key:X}} prerezi, {{key:E}} naklon, {{key:D}} 3D, {{key:F}} prilagodi, {{key:V}} izberi. Izhodišče. |
| {{ui:Klasično risanje}} | Majhen trak ({{ui:Domov}}, {{ui:Vstavi}}, {{ui:Izpis}}) in ukazna vrstica za tiste, ki ukaze vtipkajo: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (razveljavi), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Začnite tipkati kjerkoli in črke gredo v ukazno vrstico; {{key:Enter}} zažene ukaz, {{key:Enter}} brez vnosa ponovi zadnji ukaz, {{key:Esc}} ga počisti. Srednja tipka pomika. |
| {{ui:Civilni trak}} | Zavihki z velikimi gumbi, kakor civilna projektantska orodja združujejo svoja orodja: {{ui:Domov}} (podatki o terenu, ustvarjanje zasnove, pogledi profila in prereza), {{ui:Površja}}, {{ui:Spremeni}}, {{ui:Geolokacija}}, {{ui:Pogled}} in {{ui:Izpis}}, z menijem {{ui:Datoteka}} ter hitrimi gumbi na desni. Posamezne tipke ostanejo. Srednja tipka pomika tloris; v 3D srednja tipka pomika, {{key:Shift}} s srednjo tipko pa vrti. |

Vsi slogi ohranijo tipke {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Tipka, ki pripada lastni postavitvi CivilCraft, vaš slog pa ji je dodelil drug ukaz, ne naredi ničesar, vrstica stanja pa pove, kam je šel njen ukaz („V Moje tipke je Pad Ctrl+Alt+G“). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} in puščice ohranijo svoj pomen, med risanjem črte pa njene točke ohranijo svoje tipke ({{key:Backspace}}, {{key:Enter}}).
:::

## Prilagodite po svoje

1. Izberite slog, ki je najbližje tistemu, kar želite, nato kliknite {{ui:Prilagodi…}}.
2. Na {{ui:Tipke in meniji}} poiščite ukaz (pomaga iskalno polje). Kliknite {{ui:Dodaj ključ}} in pritisnite tipko ali dve tipki zapored za dvočrkovno tipko. Kliknite tipko, da jo odstranite.
3. Pri traku {{ui:Kje je}} premakne ukaz na drug zavihek in podokno, v meni {{ui:Datoteka}} ali na {{ui:Samo tipke}}.
4. Na {{ui:Miška}} nastavite kolesce, gumbe, ki pomikajo tloris, in to, kaj vsak gumb počne v pogledu 3D.
5. Dajte slogu ime in kliknite {{ui:Shrani}}.

Shranjevanje vgrajenega sloga ustvari vašo lastno kopijo („Moj civilni trak“); vgrajeni slog se nikoli ne spremeni. Tipka, dodeljena dvema ukazoma, ali tipka, ki bi se izvedla, preden lahko vtipkate dvočrkovno tipko, je prikazana z rdečo in jo morate popraviti, preden lahko shranite.

## Miška

- **Kolesce miške**: {{ui:Drsenje navzgor poveča}} (izhodišče) ali {{ui:Drsenje navzgor pomanjša}}, in kako hitro, v tlorisu in v 3D. Stisk s sledilno ploščico vedno povečuje ali pomanjšuje v smeri gibanja prstov.
- **Pomik tlorisa z**: srednjo tipko, desno tipko ali obema. {{key:Space}} in vlečenje prav tako pomikata. Leva tipka vedno izbira in riše.
- **Vlečenje v pogledu 3D**: {{ui:Lastni za vsak pogled}} ohrani gumbe CivilCraft (levi vrti, desni pomika). Ali pa nastavite vsak gumb na vrtenje, pomik, povečavo ali nič; {{key:Shift}} s tipko zamenja vrtenje in pomik. Klik brez vlečenja še vedno izbere.

## Vzemite ga s seboj

{{ui:Izvoz}} shrani slog v uporabi kot majhno datoteko `.ccinput.json`; {{ui:Uvozi…}} doda eno, z drugega računalnika ali od sodelavca. Uvožena datoteka lahko kaže samo na lastne ukaze CivilCraft: vse drugo se izpusti in prešteje v vrstici stanja. {{ui:Izbriši ta slog}} odstrani enega od vaših lastnih.

:::note
Te nastavitve ostanejo v tem brskalniku. {{ui:Uporabi ta slog v vseh programih}} pod karticami slogov vsak program odpre v ustreznem slogu (lastna orodna vrstica, trak ali klasično risanje), s spremembami, ki ste jih naredili v vsakem programu. CivilCraft nima sloga z menijsko vrstico: ko se za vse programe izbere menijska vrstica drugega programa, CivilCraft ohrani svojo orodno vrstico.
:::

Povezano: [Tipkovnica in miška](topic:keyboard) · [Nastavitve CivilCraft](topic:settings) · [Prihajate iz druge civilne programske opreme](topic:coming-from)
