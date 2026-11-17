---
title: Tipke i miš
summary: Svi tipkovnički prečaci te radnje mišem, trackpadom i dodirom u CivilCraft-u, grupirani, s razlikama među preglednicima i platformama.
keywords: tipkovnica, prečaci, tipkovni prečaci, tipke, miš, trackpad, dodir, pomicanje, zumiranje, stisak, kotačić, desni klik, mac, tipka command
from: a9756f46
---

Tipke s jednim slovom rade kad ne upisujete u polje. Prečaci s {{key:Mod}} koriste Command na Macu, a Ctrl drugdje. Vidi također [Tipke u pregledniku](common:keys).

## Datoteke i uređivanje

| Tipka | Radnja |
|---|---|
| {{key:Mod+O}} | Otvori datoteku točaka, LandXML ili projekt |
| {{key:Mod+S}} | Spremi projekt (preuzima datoteku `.civilcraft.json`) |
| {{key:Mod+P}} | Ispiši tlocrt u PDF (otvara dijaloški okvir za ispis, a ne ispis preglednika) |
| {{key:Mod+Z}} | Poništi |
| {{key:Mod+Y}} | Ponovi |
| {{key:Delete}} | Izbriši odabrane točke, os trase, plato, konstrukciju, cijev ili PVI |
| {{key:Mod+C}} | Kopiraj odabrane točke (također kao retke točaka za tablicu) |
| {{key:Mod+X}} | Izreži odabrane točke |
| {{key:Mod+V}} | Zalijepi točke: slijede pokazivač, kliknite gdje idu |
| {{key:Mod+Shift+V}} | Zalijepi na isto mjesto: na vlastitim koordinatama točaka |
| {{key:Mod+D}} | Dupliciraj odabrane točke: kopija slijedi pokazivač |
| {{key:Mod+A}} | Odaberi sve točke |
| {{key:Esc}} | Poništi odabir (i odustani od lijepljenja) |

{{key:Mod+S}}, {{key:Mod+O}} i {{key:Mod+P}} rade i dok upisujete u polje. {{key:Mod+Z}} i {{key:Mod+Y}} u tekstualnom polju poništavaju vaš upis, kao i obično, a tako je i s {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} i {{key:Mod+A}}: u polju kopiraju, izrezuju, lijepe i odabiru njegov tekst. Kad je tekst odabran na stranici (u ploči), {{key:Mod+C}} kopira taj tekst. {{key:Mod+Shift+Z}} ne radi ništa u CivilCraft-u: koristite {{key:Mod+Y}} ili gumb {{ui:Ponovi}}.

:::mac
Na Macu tipka označena **delete** u pregledniku djeluje kao {{key:Backspace}}. Za brisanje odabira pritisnite {{key:Delete}} (Fn i delete) ili odaberite {{ui:Izbriši}} u izborniku {{ui:Više}} na alatnoj traci.
:::

## Alati

| Tipka | Alat |
|---|---|
| {{key:V}} | {{ui:Odaberi}} |
| {{key:M}} | {{ui:Mjeri}}: udaljenosti, površine i nagibi na tlocrtu ([Mjerenje](topic:measure)) |
| {{key:A}} | {{ui:Os trase}} |
| {{key:G}} | {{ui:Plato}} |
| {{key:P}} | {{ui:Cijevi}} |
| {{key:B}} | {{ui:Prijelomnica}} |
| {{key:O}} | {{ui:Granica}} |
| {{key:R}} | Prikaži ili sakrij prikaz profila |
| {{key:I}} | Uključi ili isključi {{ui:Dodaj PVI}} (otvara prikaz profila ako je zatvoren) |
| {{key:F}} | {{ui:Prilagodi}}: prikaži sve |
| {{key:D}} | {{ui:3D}}: prikaži lokaciju u 3D-u ili se vrati na tlocrt |
| {{key:E}} | Prikaži ili sakrij nagibe i kote duž svake linije značajke (samo na zaslonu) |

Pritisak tipke aktivnog alata ponovno vraća na {{ui:Odaberi}}. Slova s Shiftom ne rade ništa.

## Tijekom crtanja

| Tipka | Radnja |
|---|---|
| {{key:Enter}} | Završi os trase, plato, niz cijevi, prijelomnicu ili granicu |
| {{key:Backspace}} | Ukloni zadnju kliknutu točku |
| {{key:C}} | Linija značajke: uključi ili isključi lukove (nakon vrha kliknite točku na krivulji, zatim njen kraj) |
| {{key:Esc}} | Odustani od crtanja (ili lijepljenja); pritisnut ponovno (ili kad ništa nije nacrtano), vraća na {{ui:Odaberi}} i poništava odabir |

## Prikaz tlocrta

| Tipka ili radnja | Rezultat |
|---|---|
| Kotačić | Zumiranje prema pokazivaču |
| Povlačenje po praznom prostoru | Pomicanje prikaza (Pan) (u bilo kojem alatu; kratak klik i dalje klikne; s držanim {{key:Shift}} crta okvir za odabir) |
| Povlačenje srednjom tipkom | Pomicanje prikaza |
| Povlačenje desnom tipkom | Pomicanje prikaza (ne otvara se izbornik) |
| {{key:Space}} i povlačenje | Pomicanje prikaza |
| Klik | Odabir (s {{ui:Odaberi}}) ili postavljanje točke (s alatom za crtanje) |
| {{key:Shift}} i klik | Dodaje točku u odabir ili je vadi iz njega |
| {{key:Shift}} i povlačenje | Nacrtaj okvir: točke unutar njega dodaju se u odabir. Povucite oko njih za [lasso](topic:lasso-selection) |
| {{key:Space}} dok crtate lasso | Prozor, zatim križanje, zatim ograda |
| Klik dok lijepite | Postavlja zalijepljene točke tamo ({{key:Enter}} ih postavlja na njihove vlastite koordinate) |
| Povlačenje ručke | Pomakni PI, kut platoa ili konstrukciju (jedan korak poništavanja) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Pomicanje prikaza, kad tlocrt ima fokus (prvo kliknite na njega) |
| {{key:Plus}} i {{key:Minus}} | Zumiranje prema sredini, kad tlocrt ima fokus |

Tipka = zumira kao {{key:Plus}}, pa Shift nije potreban.

## Prikaz profila

| Radnja | Rezultat |
|---|---|
| Klik s uključenim {{ui:Dodaj PVI}} | Dodaje PVI tamo |
| Klik na PVI | Odabire ga |
| Povlačenje PVI-ja | Pomiče ga (jedan korak poništavanja) |
| {{key:Delete}} ili {{key:Backspace}} | Uklanja odabrani PVI ({{key:Backspace}} samo kad prikaz profila ima fokus) |

Prikaz profila ne zumira niti pomiče.

## Zaslon i pomoć

| Tipka | Radnja |
|---|---|
| {{key:F1}} | Otvara ili zatvara ovu pomoć (bočnu ploču); {{ui:Pomoć}} u traci aplikacije radi isto |
| {{key:Esc}} | Zatvara ploču pomoći kad je otvorena |
| {{key:Ctrl+Shift+F}} | Mijenja načine zaslona: cijeli zaslon, cijeli zaslon sa skrivenim trakama, normalno |
| {{key:Esc}} | Izlazi iz cijelog zaslona (vlastita tipka preglednika) |

{{key:F1}} stiže do pomoći prije CivilCraft-a, pa radi u bilo kojem alatu. Na većini Mac tipkovnica pritisnite fn s F1 ili kliknite {{ui:Pomoć}}. {{key:Ctrl+Shift+F}} koristi tipku Control na svim platformama, uključujući Mac. Vidi [Korištenje pomoći](common:help) za pretraživanje ove pomoći.

## Miš, trackpad i dodir

:::mouse
- Kotačić zumira prema pokazivaču. Miš s slobodno rotirajućim kotačićem zumira brzo: dajte mu kratke okretaje.
- Pomicanje povlačenjem po praznom prostoru, srednjom tipkom, desnom tipkom ili {{key:Space}} i povlačenjem.
:::

:::mac
Na Mac trackpadu:

- Pomicanje dvama prstima **zumira** (ne pomiče), a stiskanje također zumira.
- Za pomicanje pritisnite i povucite po praznom prostoru jednim prstom ili držite {{key:Space}} i povlačite.
- Klik dvama prstima (desni klik) ne otvara izbornik i sam ne čini ništa.
:::

:::touch
Na zaslonu osjetljivom na dodir:

- Prvi dodir čini gumbe i retke izbornika veličine prsta.
- Dodirnite za odabir ili postavljanje točke; jedan prst povučen po praznom prostoru pomiče. Dodir se može malo pomaknuti: pomicanje počinje tek kad se prst pomakne oko 10 piksela.
- Dva prsta stišću za zumiranje i zajedno se pomiču za pomicanje.
- Povucite ručku ili PVI jednim prstom. Ručke imaju područje oko sebe široko kao prst.
- Dok crtate os trase, plato, prijelomnicu, granicu, niz cijevi, liniju značajke ili parcelu, traka iznad tlocrta nudi {{ui:Završi}} ({{key:Enter}}), {{ui:Poništi točku}} ({{key:Backspace}}) i {{ui:Odustani}} ({{key:Esc}}). Dugi pritisak (pola sekunde bez pomicanja) također završava.
- U {{ui:Odaberi}}, dugi pritisak na točku dodaje je u odabir ili je vadi, kao {{key:Shift}}+klik.
- U 3D prikazu jedan prst kruži, dva stišću i pomiču, a dodir odabire.
- Na dodiru nema lebdenja, pa se očitanja u statusnoj traci osvježavaju samo dok je prst pritisnut.
:::

## Prečaci preglednika koji imaju prednost

Neke tipke pripadaju pregledniku i nikad ne stignu do CivilCraft-a, na primjer {{key:Mod+W}} (zatvori karticu), {{key:Mod+T}} (nova kartica), {{key:Mod+N}} (novi prozor) i {{key:F11}} (cijeli zaslon u preglednicima na Windowsu i Linuxu). CivilCraft ih ne koristi. Ako prečac umjesto toga nešto otvori u pregledniku, jednom kliknite tlocrt da stranica dobije fokus i pokušajte ponovno.

## Gdje je Move

Ne postoji naredba Move: odaberite {{ui:Odaberi}} i povucite točku ili vrh, ili uredite njene koordinate u {{ui:Svojstva}}. Vidi [Uređivanje točaka](topic:edit-points).
