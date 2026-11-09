---
title: Zaslon, del za delom
summary: Ogled vsake vrstice in podokna aplikacije CivilCraft po njihovih imenih na zaslonu, od orodne vrstice do vrstice stanja.
keywords: vmesnik, zaslon, orodna vrstica, podokna, lastnosti, vrstica stanja, pogled profila, postavitev, ogled, ui
from: 76272010
---

CivilCraft ima en sam zaslon. Zavihkov in postavitev ni. Stranska podokna se lahko premikajo, plavajo ali odprejo v lastnem oknu: glejte [Razporeditev podoknov in uporaba drugega monitorja](common:arrange-panels). Od zgoraj navzdol in z leve proti desni:

- **aplikacijska vrstica** (oznaka CadCraft, ime aplikacije, različica, O aplikaciji, način zaslona, Pomoč, Shrani za delo brez povezave, Papir in Model)
- **orodna vrstica** s sedmimi skupinami gumbov
- **levo podokno**: Lokacija, Točke, Površje, Prikaz in, ko uvozite nekaj GIS-slojev, GIS-sloji
- **načrt** na sredini, pod njim **pogled profila**, ko je odprt
- **desno podokno**: Lastnosti izbranega
- **vrstica stanja** ob dnu

## Aplikacijska vrstica

Tanka vrstica na vrhu pripada spletnemu mestu CadCraft, ne samemu CivilCraftu.

- Meni različice prikaže, katero različico zaganjate.
- {{ui:O aplikaciji CivilCraft}} odpre stran aplikacije na spletnem mestu.
- {{ui:Celozaslonski način}} preklaplja načine zaslona: celozaslonski, nato celozaslonski z skritimi vrsticami, nato nazaj na običajnega. {{key:Ctrl+Shift+F}} počne isto na vseh platformah, tudi na Macu (tam je to tipka Control, ne Command). Ko so vrstice skrite, premaknite kazalec na zgornji rob, da se vrnejo.
- {{ui:Pomoč}} (ali {{key:F1}}) odpre to pomoč v stranskem podoknu; {{key:F1}} ali {{key:Esc}} jo zapre.
- {{ui:Shrani za delo brez povezave}} ohrani CivilCraft v tem brskalniku, da se odpre brez povezave; nato prikaže {{ui:Pripravljeno za delo brez povezave}}. Glejte [Datoteke, ki jih lahko odprete, shranite in izvozite](topic:files#online-and-offline).
- {{ui:Papir}} in {{ui:Model}} preklapljata med svetlo in temno temo. Načrt in profil sledita temi; PDF-ji se vedno natisnejo na belo.

## Orodna vrstica

Vsaka skupina ima majhen napis nad gumbi. Pomaknite kazalec nad gumb, da vidite njegov namig in tipko.

| Skupina | Gumbi | Kaj počnejo |
|---|---|---|
| Datoteka | {{ui:Novo}}, {{ui:Odpri}}, {{ui:Shrani}} | Začnejo znova, odprejo datoteko točk, LandXML ali projekt, shranijo projekt kot prenos |
| Izvoz | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Zapišejo LandXML 1.2, DXF R12 ali DWG načrta oziroma izrišejo načrt v PDF |
| Površje | {{ui:Prelomnica}}, {{ui:Meja}} | Narišejo prelomnico skozi geodetske točke; narišejo zunanjo mejo |
| Zasnova | {{ui:Trasa}}, {{ui:Ploščad}}, {{ui:Cevi}}, {{ui:Vzdolžni profil}} | Narišejo traso, ploščad ali cevni odsek; prikažejo ali skrijejo pogled profila |
| Uredi | {{ui:Razveljavi}}, {{ui:Uveljavi}}, {{ui:Kopiraj}}, {{ui:Prilepi}}, {{ui:Več}} | Razveljavijo, uveljavijo, kopirajo in prilepijo geodetske točke; v {{ui:Več}} so Izreži, Prilepi na isto mesto, Podvoji, Izbriši, Izberi vse točke in Prekliči izbor |
| GIS | {{ui:Koordinate}}, {{ui:Uvozi}}, {{ui:Izvoz}}, {{ui:Zemljevid}} | Nastavijo koordinatni sistem, uvozijo in izvozijo datoteke GIS, prikažejo zemljevidne sloje pod načrtom |
| Pogled | {{ui:Izberi}}, {{ui:Prilagodi}}, {{ui:3D}} | Izbirajo in premikajo stvari; povečajo na prikaz vsega; prikažejo lokacijo v 3D ([Ogled lokacije v 3D](topic:site-3d)) |

Orodje za risanje ostane pritisnjeno, dokler je aktivno. Ponovni klik nanj, pritisk {{key:Esc}} ali pritisk {{key:V}} vrne na {{ui:Izberi}}. {{ui:Razveljavi}}, {{ui:Uveljavi}}, {{ui:Kopiraj}} in predmeti v {{ui:Več}} so zasivljeni, kadar ne morejo delovati; namig pove, zakaj (na primer „Najprej izberite geodetske točke“). Vsak gumb je naveden v [Referenca orodne vrstice](topic:toolbar).

Na ožjem oknu se orodna vrstica pomika vstran.

## Levo podokno

### Lokacija

- **Ime**: ime projekta. Poimenuje vsako datoteko, ki jo shranite ali izvozite, in je natisnjeno v naslovnem traku PDF-ja.
- **Enote**: {{ui:Ameriški čevlji}} ali {{ui:Metri}}. To pove, kaj pomenijo števila. Sprememba **ne** pretvori koordinat; glejte [Enote, stacionaže in oblike števil](topic:units-and-stations).

### Točke

Ko je prazno, pove, kako odpreti datoteko točk. S točkami prikaže ime datoteke, število točk in koliko jih ima višino, nato tabelo **skupin točk**: po ena vrstica za prvo besedo opisa (GRD, FL, TBS …), s številom in izbiro **Površje**:

- {{ui:Točke}}: točke gredo v površje (privzeto za vsako skupino).
- {{ui:Prelomnica}}: točke skupine se v vrstnem redu številk točk povežejo v eno prelomnico.
- {{ui:Izpuščeno}}: skupina se ne dotika površja.

### Površje

Dejstva o obstoječem terenu: točke, trikotniki, najnižja in najvišja višina, povprečna višina, 2D in 3D površina, prelomnice in ali obstaja meja. Pod dejstvi okvir našteje vse, kar je graditelj površja moral popraviti ali česa ni mogel narediti. Nato:

- **Najdaljši zunanji rob**: 0 ohrani vse zunanje trikotnike; število odreže dolge tanke trikotnike z zunanje strani.
- Povezave, ki se prikažejo, ko veljajo: {{ui:Odstrani mejo}}, {{ui:Odstrani narisane prelomnice}} in, za površje, prebrano iz LandXML, {{ui:Obnovi površje iz točk}}.

### Prikaz

- **Površje**: {{ui:Obstoječi teren}} ali {{ui:Predvideno (izravnano)}}. Druga je na voljo, ko ploščad ali koridor izravnava brez težav.
- **Plastnice na vsakih**, **Glavne plastnice na vsakih** in **Pasovi** (število barvnih pasov).
- Potrditvena polja: {{ui:Plastnice}}, {{ui:Oznake plastnic}}, {{ui:Trikotniki}}, {{ui:Višinski pasovi}}, {{ui:Puščice naklona}}, {{ui:Točke}}, {{ui:Oznake točk}}, {{ui:Prelomnice}}, {{ui:Rob površja}}, {{ui:Cevi}}.
- Ko so pasovi vklopljeni, se prikaže legenda višin pasov.

Nastavitve prikaza se shranijo s projektom, vendar niso koraki razveljavitve: {{key:Mod+Z}} potrditvenega polja nikoli ne vrne nazaj.

## Načrt

Načrt prikazuje točke, površje in vse, kar zasnujete, v tlorisnem pogledu z severom navzgor. Kolešček za povečavo deluje na mestu kazalca, vlečenje praznega prostora pa pomika pogled. Celoten seznam je v [Tipke in miška](topic:keyboard).

- Na praznem projektu okvir z naslovom **Začnite z geodetskimi točkami** našteje prve korake in ponudi {{ui:Odpri vzorčno zemljišče}}.
- Medtem ko je orodje za risanje aktivno, namig na vrhu načrta pove, kaj klikniti in kako končati.
- Povlečenje datoteke čez načrt prikaže „Spustite datoteko točk, LandXML ali projekt“.
- Izbrane stvari so osvetljene. Izbrana trasa ali ploščad pokaže kvadratne ročice na svojih PI-jih ali vogalih; izbran objekt pokaže eno ročico. Povlecite ročico, da premaknete.
- Izbrane geodetske točke imajo obroč. {{key:Shift}} in klik doda ali odstrani točko; {{key:Shift}} in vlečenje nariše okvir (ali, potegnjeno okoli njih, lasso), ki doda točke znotraj. Glejte [Izbor, kopiranje in lepljenje geodetskih točk](topic:copy-paste-points).

## Pogled profila

Pritisnite {{key:R}} ali kliknite {{ui:Vzdolžni profil}}, da ga odprete pod načrtom. Njegova vrstica ima:

- seznam tras (omogočen, ko sta dve ali več tras)
- {{ui:Dodaj lomne točke}}: medtem ko je pritisnjen, klik v profilu doda PVI ({{key:I}} ga preklaplja)
- odčitek stacionaže, terena, projektne višine, naklona ter izkopa ali nasipa pod kazalcem
- gumb za zaprtje

Profil prikazuje obstoječi teren, projektni profil, naklone na vsaki tangenti, stacionažo in višino vsakega PVI-ja, dolžino L in K vsake vertikalne krivine z njeno BVC in EVC, najvišje in najnižje točke ter vertikalno pretiravanje. Vedno prilagodi celotno traso: ne povečuje in ne pomika. Premikanje kazalca vzdolž njega postavi piko na traso v načrtu.

## Desno podokno: Lastnosti

Naslov pove, kaj prikazuje.

- **Projekt** (nič ni izbrano): trase in ploščadi kot povezave, blok **Zemeljska dela** in blok **Cevno omrežje** s pravili in težavami.
- **Trasa**: ime, začetna stacionaža, dolžina, tabela PI-jev, krivine, tabela PVI-jev projektnega profila in njegova dejstva ter nastavitve **Koridor**.
- **Ploščad**: ime, višina, nakloni izkopa in nasipa, površina, dejstva o dnevni liniji in zemeljska dela.
- **Objekt** ali **Cev**: velikosti, višine pokrovov, višine dna, naklon, nadkritje in morebitne težave.
- **Točka** in njena številka: koordinate točke, višina, opis in skupina (samo za branje).

Polja začnejo veljati, ko pritisnete {{key:Enter}} ali zapustite polje. Vrednost, ki ni sprejeta, je označena kot neveljavna, nič pa se ne spremeni.

## Vrstica stanja

- **E** in **N**: vzhodna in severna koordinata pod kazalcem.
- **Višina terena** tam (in **Izravnano**, kjer je ploščad ali koridor spremenil teren), ali „Zunaj površja“.
- Najbližja trasa (ali izbrana) s **Sta** in odmikom (**L** ali **R**) pod kazalcem.
- Na desni sporočila: kaj se je pravkar zgodilo ali zakaj nekaj ni bilo sprejeto. Sporočilo se čez nekaj sekund samo počisti.

## Pogovorna okna

- **Uvoz točk**: se odpre pri vsaki datoteki točk. Glejte [Uvoz geodetskih točk](topic:import-points).
- **Izris načrta v PDF**: glejte [Izris načrta v PDF](topic:plot-pdf).
- **Neshranjene spremembe**: vpraša, preden {{ui:Novo}} ali odpiranje projekta ali datoteke LandXML zavrže neshranjeno delo. {{ui:Shrani kopijo}} najprej prenese projekt.

## Majhni zasloni

Do 760 slikovnih pik širine, na primer na telefonu, načrt ohrani zaslon: orodna vrstica je ena vrstica, ki se pomika vstran, podokna pa se odprejo kot listi iz vrstice na dnu. {{ui:Orodja}} skrije orodno vrstico, {{ui:Premakni}} pa jo postavi na dno.
