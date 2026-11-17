---
title: Tasteri i miš
summary: Svaka prečica sa tastature i radnja mišem, touchpadom i dodirom u CivilCraft-u, grupisano, sa razlikama pregledača i platforme.
keywords: tastatura, prečice, tasteri, miš, touchpad, dodir, pomeri pogled, zumiraj, štipanje, točkić, desni klik, mac, taster command
from: a9756f46
---

Jednoslovni tasteri rade kad ne kucaš u polju. Prečice sa {{key:Mod}} koriste Command na Mac-u, a Ctrl drugde. Vidi i [Tasteri u pregledaču](common:keys).

## Datoteke i uređivanje

| Taster | Radnja |
|---|---|
| {{key:Mod+O}} | Otvori datoteku sa tačkama, LandXML ili projekat |
| {{key:Mod+S}} | Sačuvaj projekat (preuzima datoteku `.civilcraft.json`) |
| {{key:Mod+P}} | Iscrtaj plan u PDF (otvara dijalog iscrtavanja, a ne štampu pregledača) |
| {{key:Mod+Z}} | Opozovi |
| {{key:Mod+Y}} | Ponovi |
| {{key:Delete}} | Izbriši izabrane tačke premera, trasu, plato, objekat, cev ili PVI |
| {{key:Mod+C}} | Kopiraj izabrane tačke premera (i kao redove tačaka za tabelarni program) |
| {{key:Mod+X}} | Iseci izabrane tačke premera |
| {{key:Mod+V}} | Nalepi tačke: prate pokazivač, klikni gde idu |
| {{key:Mod+Shift+V}} | Nalepi na mestu: na sopstvenim koordinatama tačaka |
| {{key:Mod+D}} | Dupliraj izabrane tačke: kopija prati pokazivač |
| {{key:Mod+A}} | Izaberi svaku tačku premera |
| {{key:Esc}} | Poništi izbor (i otkaži lepljenje) |

{{key:Mod+S}}, {{key:Mod+O}} i {{key:Mod+P}} rade i dok kucaš u polju. {{key:Mod+Z}} i {{key:Mod+Y}} u tekstualnom polju opozivaju tvoje kucanje, kao i obično, a tako je i sa {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} i {{key:Mod+A}}: u polju kopiraju, seku, lepe i biraju njegov tekst. Sa izabranim tekstom na stranici (u panelu), {{key:Mod+C}} kopira taj tekst. {{key:Mod+Shift+Z}} ne radi ništa u CivilCraft-u: koristi {{key:Mod+Y}} ili dugme {{ui:Ponovi}}.

:::mac
Taster označen sa **delete** na Mac tastaturi je za pregledač {{key:Backspace}}. Da obrišeš izabrano, pritisni {{key:Delete}} (Fn i delete), ili izaberi {{ui:Izbriši}} u meniju {{ui:Više}} na traci sa alatkama.
:::

## Alati

| Taster | Alat |
|---|---|
| {{key:V}} | {{ui:Izaberi}} |
| {{key:M}} | {{ui:Izmeri}}: rastojanja, površine i nagibi na planu ([Merenje](topic:measure)) |
| {{key:A}} | {{ui:Trasa}} |
| {{key:G}} | {{ui:Plato}} |
| {{key:P}} | {{ui:Cevi}} |
| {{key:B}} | {{ui:Linija loma}} |
| {{key:O}} | {{ui:Granica}} |
| {{key:R}} | Prikaži ili sakrij prikaz profila |
| {{key:I}} | Uključi ili isključi {{ui:Dodaj PVI}} (otvara prikaz profila ako je zatvoren) |
| {{key:F}} | {{ui:Uklopi}}: prikaži sve |
| {{key:D}} | {{ui:3D}}: prikaži lokaciju u 3D, ili se vrati na plan |
| {{key:E}} | Prikaži ili sakrij nagibe i kote duž svake linije toka (samo na ekranu) |

Pritisak na taster aktivnog alata ponovo vraća na {{ui:Izaberi}}. Slova sa Shift ne rade ništa.

## Dok crtaš

| Taster | Radnja |
|---|---|
| {{key:Enter}} | Završi trasu, plato, niz cevi, liniju loma ili granicu |
| {{key:Backspace}} | Ukloni poslednju kliknutu tačku |
| {{key:C}} | Linija toka: uključi ili isključi lukove (posle temena klikni tačku na krivini, pa njen kraj) |
| {{key:Esc}} | Otkaži crtanje (ili lepljenje); kad se pritisne ponovo (ili kad ništa nije nacrtano), vrati se na {{ui:Izaberi}} i obriši izbor |

## Pogled na plan

| Taster ili radnja | Rezultat |
|---|---|
| Točkić | Uvećaj ili smanji kod pokazivača |
| Prevlačenje po praznom prostoru | Pomeri pogled (u bilo kom alatu; kratak klik i dalje klikne; uz držanje {{key:Shift}} crta okvir za izbor) |
| Prevlačenje srednjim dugmetom | Pomeri pogled |
| Prevlačenje desnim dugmetom | Pomeri pogled (ne otvara meni) |
| {{key:Space}} i prevlačenje | Pomeri pogled |
| Klik | Izaberi (sa {{ui:Izaberi}}), ili postavi tačku (sa alatom za crtanje) |
| {{key:Shift}} i klik | Dodaj tačku premera u izbor, ili je izvadi |
| {{key:Shift}} i prevlačenje | Nacrtaj okvir: tačke premera unutar njega se dodaju u izbor. Prevuci oko njih za [omču](topic:lasso-selection) |
| {{key:Space}} dok crtaš omču | Prozor, zatim ukrštanje, pa ograda |
| Klik dok lepiš | Stavi nalepljene tačke tamo ({{key:Enter}} ih stavlja na sopstvene koordinate) |
| Prevuci hvataljku | Pomeri PI, ugao platoa ili objekat (jedan korak opoziva) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Pomeri pogled, kad plan ima fokus (prvo klikni na njega) |
| {{key:Plus}} i {{key:Minus}} | Uvećaj i smanji u sredini, kad plan ima fokus |

Taster = uvećava kao {{key:Plus}}, pa ti Shift nije potreban.

## Pogled na profil

| Radnja | Rezultat |
|---|---|
| Klik sa uključenim {{ui:Dodaj PVI}} | Dodaj PVI tamo |
| Klik na PVI | Izaberi ga |
| Prevuci PVI | Pomeri ga (jedan korak opoziva) |
| {{key:Delete}} ili {{key:Backspace}} | Ukloni izabrani PVI ({{key:Backspace}} samo kad pogled profila ima fokus) |

Pogled profila ne uvećava i ne pomera se.

## Ekran i pomoć

| Taster | Radnja |
|---|---|
| {{key:F1}} | Otvori ili zatvori ovu pomoć (bočni panel); {{ui:Pomoć}} na traci aplikacije radi isto |
| {{key:Esc}} | Zatvori panel pomoći kad je otvoren |
| {{key:Ctrl+Shift+F}} | Prolazi kroz režime ekrana:ceo ekran, ceo ekran sa sakrivenim trakama, normalan |
| {{key:Esc}} | Izađi iz celog ekrana (sopstveni taster pregledača) |

{{key:F1}} stiže do pomoći pre nego što ga CivilCraft vidi, pa radi u bilo kom alatu. Na većini Mac tastatura pritisni fn sa F1, ili klikni {{ui:Pomoć}}. {{key:Ctrl+Shift+F}} koristi taster Control na svakoj platformi, uključujući Mac. Vidi [Korišćenje pomoći](common:help) za to kako da pretražuješ ovu pomoć.

## Miš, touchpad i dodir

:::mouse
- Točkić uvećava kod pokazivača. Miš sa slobodno okretnim točkićem uvećava brzo: okreći ga kratko.
- Pomeri pogled bilo kojim prevlačenjem po praznom prostoru, srednjim dugmetom, desnim dugmetom, ili {{key:Space}} i prevlačenjem.
:::

:::mac
Na Mac touchpadu:

- Skrolovanje dvema prstima **uvećava** (ne pomera pogled), a štipanje takođe uvećava.
- Da pomeriš pogled, pritisni i prevuci po praznom prostoru jednim prstom, ili drži {{key:Space}} i prevuci.
- Klik dvema prstima (desni klik) ne otvara meni i ne radi ništa sam od sebe.
:::

:::touch
Na ekranu osetljivom na dodir:

- Prvi dodir pravi dugmad i redove menija veličine prsta.
- Dodirni da izabereš ili postaviš tačku; jedan prst prevučen po praznom prostoru pomera pogled. Dodir može malo da zadrhti: pogled se pomera tek kad se prst pomeri oko 10 piksela.
- Dva prsta štipaju da uvećaju, a zajedno se pomeraju da pomere pogled.
- Prevuci hvataljku ili PVI jednim prstom. Hvataljke imaju širinu prsta oko sebe.
- Dok crtaš trasu, plato, liniju loma, granicu, niz cevi, liniju toka ili parcelu, traka preko plana nudi {{ui:Završi}} ({{key:Enter}}), {{ui:Opozovi tačku}} ({{key:Backspace}}) i {{ui:Otkaži}} ({{key:Esc}}). Dugi pritisak (pola sekunde bez pomeranja) takođe završava.
- U {{ui:Izaberi}}, dugi pritisak na tačku premera je dodaje u izbor, ili je vadi, kao što to radi {{key:Shift}}+klik.
- U 3D pregledu, jedan prst kruži, dva štipaju i pomeraju, a dodir bira.
- Na dodiru nema lebdenja, pa se očitavanja u statusnoj traci osvežavaju samo dok je prst na ekranu.
:::

## Prečice pregledača koje pobeđuju

Neki tasteri pripadaju pregledaču i nikad ne stižu do CivilCraft-a, na primer {{key:Mod+W}} (zatvori karticu), {{key:Mod+T}} (nova kartica), {{key:Mod+N}} (novi prozor) i {{key:F11}} (ceo ekran u pregledačima za Windows i Linux). CivilCraft ih ne koristi. Ako prečica umesto toga otvori nešto u pregledaču, klikni jednom na plan da stranica dobije fokus, pa pokušaj ponovo.

## Gde se nalazi Premesti

Nema komande Premesti: izaberi {{ui:Izaberi}} i prevuci tačku ili teme, ili izmeni njene koordinate u {{ui:Svojstva}}. Vidi [Izmena tačaka](topic:edit-points).
