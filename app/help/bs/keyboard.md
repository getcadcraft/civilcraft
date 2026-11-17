---
title: Tipke i miš
summary: Svaka prečica s tastature i svaka radnja mišem, touchpadom i dodirom u CivilCraft-u, grupisano, s razlikama u pregledaču i platformi.
keywords: tastatura, prečice, tipke, miš, touchpad, dodir, pomjeranje pogleda, zumiranje, prstohvat, točkić, desni klik, mac, tipka command
from: a9756f46
---

Tipke od jednog slova rade kada ne kucate u polju. Prečice sa {{key:Mod}} koriste Command na Mac-u, a Ctrl drugdje. Pogledajte i [Tipke u pregledaču](common:keys).

## Datoteke i uređivanje

| Tipka | Radnja |
|---|---|
| {{key:Mod+O}} | Otvori datoteku tačaka, LandXML ili projekat |
| {{key:Mod+S}} | Spasi projekat (preuzima datoteku `.civilcraft.json`) |
| {{key:Mod+P}} | Iscrtaj plan u PDF (otvara dijalog iscrtavanja, a ne štampanje pregledača) |
| {{key:Mod+Z}} | Poništi |
| {{key:Mod+Y}} | Ponovi |
| {{key:Delete}} | Izbriši odabrane tačke premjera, trasu, plato, objekat, cijev ili PVI |
| {{key:Mod+C}} | Kopiraj odabrane tačke premjera (također kao redove tačaka za tabelu) |
| {{key:Mod+X}} | Izreži odabrane tačke premjera |
| {{key:Mod+V}} | Zalijepi tačke: prate pokazivač, kliknite gdje idu |
| {{key:Mod+Shift+V}} | Zalijepi na mjestu: na sopstvenim koordinatama tačaka |
| {{key:Mod+D}} | Dupliraj odabrane tačke: kopija prati pokazivač |
| {{key:Mod+A}} | Odaberi svaku tačku premjera |
| {{key:Esc}} | Ne odaberi ništa (i otkaži lijepljenje) |

{{key:Mod+S}}, {{key:Mod+O}} i {{key:Mod+P}} rade i dok kucate u polju. {{key:Mod+Z}} i {{key:Mod+Y}} u tekstualnom polju umjesto toga poništavaju vaše kucanje, kao i obično, i tako isto {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} i {{key:Mod+A}}: u polju kopiraju, izrezuju, lijepe i biraju njegov tekst. Sa tekstom odabranim na stranici (u panelu), {{key:Mod+C}} kopira taj tekst. {{key:Mod+Shift+Z}} ne radi ništa u CivilCraft-u: upotrijebite {{key:Mod+Y}} ili dugme {{ui:Ponovi}}.

:::mac
Tipka na Mac-u označena **delete** je za pregledač {{key:Backspace}}. Da obrišete odabir, pritisnite {{key:Delete}} (Fn i delete), ili odaberite {{ui:Izbriši}} na traci sa alatima u meniju {{ui:Više}}.
:::

## Alati

| Tipka | Alat |
|---|---|
| {{key:V}} | {{ui:Odaberi}} |
| {{key:M}} | {{ui:Izmjeri}}: udaljenosti, površine i nagibi na planu ([Izmjeri](topic:measure)) |
| {{key:A}} | {{ui:Trasa}} |
| {{key:G}} | {{ui:Plato}} |
| {{key:P}} | {{ui:Cijevi}} |
| {{key:B}} | {{ui:Prelomna linija}} |
| {{key:O}} | {{ui:Granica}} |
| {{key:R}} | Prikaži ili sakrij prikaz profila |
| {{key:I}} | Uključi ili isključi {{ui:Dodaj PVI}} (otvara prikaz profila ako je zatvoren) |
| {{key:F}} | {{ui:Uklopi}}: prikaži sve |
| {{key:D}} | {{ui:3D}}: prikaži lokaciju u 3D, ili se vrati na plan |
| {{key:E}} | Prikaži ili sakrij nagibe i kote duž svake linije terena (samo na ekranu) |

Pritiskom na tipku aktivnog alata ponovo se vraća na {{ui:Odaberi}}. Slova sa Shift ne rade ništa.

## Dok crtate

| Tipka | Radnja |
|---|---|
| {{key:Enter}} | Završi trasu, plato, dionicu cijevi, prelomnu liniju ili granicu |
| {{key:Backspace}} | Ukloni posljednju kliknutu tačku |
| {{key:C}} | Linija terena: uključi ili isključi lukove (nakon vrha, kliknite tačku na krivini, zatim njen kraj) |
| {{key:Esc}} | Otkaži crtanje (ili lijepljenje); ako se pritisne ponovo (ili kad ništa nije nacrtano), vrati se na {{ui:Odaberi}} i poništi odabir |

## Prikaz plana

| Tipka ili radnja | Rezultat |
|---|---|
| Točkić | Zumira unutra ili van na pokazivaču |
| Prevuci po praznom prostoru | Pomjeri pogled (u bilo kom alatu; kratki klik i dalje klikne; uz držan {{key:Shift}} crta okvir za odabir) |
| Prevuci srednjim dugmetom | Pomjeri pogled |
| Prevuci desnim dugmetom | Pomjeri pogled (meni se ne otvara) |
| {{key:Space}} i prevuci | Pomjeri pogled |
| Klik | Odaberi (sa {{ui:Odaberi}}), ili postavi tačku (sa alatom za crtanje) |
| {{key:Shift}} i klik | Dodaj tačku premjera u odabir, ili je izvadi |
| {{key:Shift}} i prevuci | Nacrtaj okvir: tačke premjera unutar njega dodaju se u odabir. Prevucite oko njih za [lasso](topic:lasso-selection) |
| {{key:Space}} dok crtate lasso | Prozor, zatim presijecanje, zatim ograda |
| Klik dok lijepite | Postavi zalijepljene tačke tamo ({{key:Enter}} ih postavlja na njihove sopstvene koordinate) |
| Prevuci ručicu | Pomjeri PI, ugao plata ili objekat (jedan korak poništavanja) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Pomjeri pogled, kada plan ima fokus (prvo kliknite na njega) |
| {{key:Plus}} i {{key:Minus}} | Zumiraj unutra i van u sredini, kada plan ima fokus |

Tipka = zumira kao {{key:Plus}}, pa vam Shift nije potreban.

## Prikaz profila

| Radnja | Rezultat |
|---|---|
| Klik kada je uključeno {{ui:Dodaj PVI}} | Dodaj PVI tamo |
| Klik na PVI | Odaberi ga |
| Prevuci PVI | Pomjeri ga (jedan korak poništavanja) |
| {{key:Delete}} ili {{key:Backspace}} | Ukloni odabrani PVI ({{key:Backspace}} samo kada prikaz profila ima fokus) |

Prikaz profila ne zumira niti pomjera pogled.

## Ekran i pomoć

| Tipka | Radnja |
|---|---|
| {{key:F1}} | Otvori ili zatvori ovu pomoć (bočni panel); {{ui:Pomoć}} na traci aplikacije radi isto |
| {{key:Esc}} | Zatvori panel pomoći kada je otvoren |
| {{key:Ctrl+Shift+F}} | Prolazi kroz režime ekrana: cijeli ekran, cijeli ekran sa sakrivenim trakama, normalno |
| {{key:Esc}} | Izađi iz cijelog ekrana (tipka samog pregledača) |

{{key:F1}} stiže do pomoći prije nego što je CivilCraft vidi, pa radi u bilo kojem alatu. Na većini Mac tastatura pritisnite fn sa F1, ili kliknite {{ui:Pomoć}}. {{key:Ctrl+Shift+F}} koristi tipku Control na svim platformama, uključujući Mac. Pogledajte [Korištenje pomoći](common:help) za pretragu ove pomoći.

## Miš, touchpad i dodir

:::mouse
- Točkić zumira na pokazivaču. Miš sa slobodno okretnim točkićem zumira brzo: dajte mu kratke okrete.
- Pomjerajte pogled prevlačenjem po praznom prostoru, srednjim dugmetom, desnim dugmetom, ili {{key:Space}} i prevlačenjem.
:::

:::mac
Na Mac touchpadu:

- Pomicanje sa dva prsta **zumira** (ne pomjera pogled), a i prstohvat zumira.
- Za pomjeranje pogleda pritisnite i prevucite po praznom prostoru jednim prstom, ili držite {{key:Space}} i prevucite.
- Klik sa dva prsta (desni klik) ne otvara meni i ne radi ništa sam od sebe.
:::

:::touch
Na ekranu osjetljivom na dodir:

- Prvi dodir čini dugmad i redove menija veličine prsta.
- Dodirnite za odabir ili za postavljanje tačke; jedan prst prevučen po praznom prostoru pomjera pogled. Dodir može malo zadrhtati: pogled se pomjera tek kada se prst pomakne oko 10 piksela.
- Dva prsta stisnu za zumiranje, a pomjeraju se zajedno za pomjeranje pogleda.
- Prevucite ručicu ili PVI jednim prstom. Ručice imaju zonu širine prsta oko sebe.
- Dok crtate trasu, plato, prelomnu liniju, granicu, dionicu cijevi, liniju terena ili parcelu, traka iznad plana nudi {{ui:Završi}} ({{key:Enter}}), {{ui:Poništi tačku}} ({{key:Backspace}}) i {{ui:Otkaži}} ({{key:Esc}}). Dugi pritisak (pola sekunde bez pomjeranja) također završava.
- U {{ui:Odaberi}}, dugi pritisak na tačku premjera dodaje je u odabir, ili je vadi, kao što radi {{key:Shift}}+klik.
- U 3D prikazu, jedan prst orbitira, dva stišću i pomjeraju, a dodir bira.
- Na dodiru nema lebdenja, pa se očitavanja u statusnoj traci osvježavaju samo dok je prst spušten.
:::

## Tipke pregledača koje pobjeđuju

Neke tipke pripadaju pregledaču i nikada ne stignu do CivilCraft-a, na primjer {{key:Mod+W}} (zatvori karticu), {{key:Mod+T}} (nova kartica), {{key:Mod+N}} (novi prozor) i {{key:F11}} (cijeli ekran u pregledačima za Windows i Linux). CivilCraft ih ne koristi. Ako prečica umjesto toga otvori nešto u pregledaču, jednom kliknite na plan da stranica dobije fokus, pa pokušajte ponovo.

## Gdje se nalazi Premjesti

Ne postoji naredba Premjesti: odaberite {{ui:Odaberi}} i prevucite tačku ili vrh, ili uredite njene koordinate u {{ui:Svojstva}}. Pogledajte [Uređivanje tačaka](topic:edit-points).
