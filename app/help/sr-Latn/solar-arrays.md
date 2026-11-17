---
title: Postavi solarne nizove na terenu
summary: Postavi solarne stolove montirane na tlu unutar parcele ili platoa, sa redovima razmaknutim prema terenu na kome svaki zaista stoji, strmi teren ostavljen prazan, godišnja energija izračunata i stolovi prikazani na planu i u 3D.
keywords: solarni, pv, fotonaponski, niz, montaža na tlu, stolovi, redovi, razmak redova, senka, teren, nagib, piloti, prinos, kWp, energija, horizont
from: 95593fd6
---

## Šta ćete naučiti

Kako postaviti polje solarnih stolova na lokaciji koja nije ravna, i šta znače brojevi. Otvorite ga iz Teren › Više › Solarni nizovi.

## Rasporedi stolove

1. Izaberi **Gde**: parcelu ili plato projekta, ili upiši tačke ivica područja. Označi sve platoe ili parcele koji moraju ostati **prazni** (zgrada, jezero).
2. Upiši **geografsku širinu i dužinu** lokacije. Od njih zavisi Sunce; ništa se ne pretpostavlja. Ako projekat ima koordinatni sistem, **Postavi iz koordinatnog sistema** ih popunjava.
3. Podesi nagib, orijentaciju (prazno znači prema ekvatoru), koliko modula čini jedan sto, te snagu i veličinu modula. Brojevi modula počinju kao opšte vrednosti i tako su označeni; upiši svoje.
4. Pritisni **Rasporedi stolove**. Prozor daje broj stolova i modula, veličinu u kWp i razmak između redova.

Svaki sto se postavlja u području, počevši od prednje ivice i pomerajući se unazad. Sto se postavlja samo tamo gde je teren ispod njega unutar granice nagiba, unutar područja i odstojanja od ivice, i gde piloti koji su mu potrebni nisu viši od granice koju ste podesili. Mesta na kojima to ne uspeva ostaju prazna, a prozor kaže koliko ih je i zašto.

## Redovi su razmaknuti prema terenu

Na ravnom terenu redovi stoje na razmaku prema uobičajenom pravilu bez senke: senka reda u podne na zimski solsticij ne sme da dopre do donje ivice reda iza njega. Na nagibu CivilCraft primenjuje isto pravilo na teren na kome zaista stoji sledeći red. Tamo gde teren raste iza stola, redovi mogu stajati bliže; tamo gde se spušta, stoje dalje jedan od drugog. Prozor pokazuje najmanji, najveći i srednji razmak pored razmaka na ravnom terenu, pa možete videti šta je teren uradio.

Ravan stola se podiže na pilotima dok svaka tačka uzorka ispod njega ne bude iznad terena za slobodnu visinu koju ste podesili. Najviši pilot se prikazuje u rezultatu.

## Godišnja energija

**Godišnja energija** računa svetlost na nagnutoj ravni za reprezentativan dan svakog meseca, temperaturu ćelija, upisane gubitke, to što stolovi međusobno zasenčuju jedni druge i to što brda na horizontu uzimaju sunce koje zaklanjaju. Nebo je vedro, pa je odgovor gornja granica; stvarno vreme daje manje. To je procena u ranoj fazi projektovanja, a ne izveštaj o prinosu.

## Čuvanje

**Sačuvaj u projekat** čuva ulazne podatke i brojeve u datoteci projekta; stolovi se ponovo računaju iz terena kada se datoteka otvori, pa promenjena površina pomera njihov položaj. Prikazuju se na planu i u 3D (Prikaži › Solarni nizovi). Spisak stolova se preuzima kao CSV. Jedan korak opozivanja uklanja ili vraća niz.

## Još nije izgrađeno

Podaci o vremenu umesto vedrog neba, stolovi koji prate teren u pravcu istok–zapad, pratioci sunca i električni projekat (stringovi, žice, invertori) u programu CivilCraft. Panel Solar PV u programu BimCraft ima stringove i jednopolnu šemu za krovove.
