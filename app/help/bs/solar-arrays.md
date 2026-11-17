---
title: Postavi solarne nizove na terenu
summary: Postavi zemaljske solarne stolove unutar parcele ili plata, s redovima razmaknutim za teren na kojem svaki stoji, strmo tlo ostavljeno prazno, godišnja energija izračunata, a stolovi prikazani na planu i u 3D.
keywords: solarni, pv, fotonaponski, niz, zemaljska montaža, stolovi, redovi, razmak redova, zasjenjenje, teren, nagib, piloti, prinos, kWp, energija, horizont
from: 95593fd6
---

## Šta ćete naučiti

Kako rasporediti polje solarnih stolova na lokaciji koja nije ravna i šta znače brojevi. Otvorite ga preko Površina › Više › Solarni nizovi.

## Rasporedi stolove

1. Odaberi **Gdje**: parcelu ili plato projekta ili upiši uglove područja. Označi sve platoe ili parcele koji moraju ostati **prazni** (zgrada, jezero).
2. Upiši **geografsku širinu i dužinu** lokacije. Sunce zavisi od njih; ništa se ne pretpostavlja. Ako projekat ima koordinatni sistem, **Postavi iz koordinatnog sistema** ih popunjava.
3. Postavi nagib, orijentaciju (prazno znači prema ekvatoru), koliko modula čini jedan sto, te snagu i veličinu modula. Brojke modula počinju kao generičke vrijednosti i tako su označene; upiši svoje.
4. Pritisni **Rasporedi stolove**. Prozor daje broj stolova i modula, veličinu u kWp i razmak red–red.

Svaki sto je kolona u području, postavljena od prednje strane i pomjerena unazad. Sto se postavlja samo tamo gdje je teren ispod njega unutar ograničenja nagiba, unutar područja i odmaka, i gdje piloti koji su mu potrebni nisu viši od ograničenja koje ste postavili. Neuspjela mjesta ostaju prazna, a prozor kaže koliko ih je i zašto.

## Redovi su razmaknuti prema terenu

Na ravnom terenu redovi stoje razmaknuti prema uobičajenom pravilu bez zasjenjenja: sjena jednog reda u podne na zimski solsticij ne smije doseći donji rub reda iza njega. Na nagibu CivilCraft primjenjuje isto pravilo na teren na kojem zaista stoji sljedeći red. Gdje teren raste iza stola, redovi mogu stajati bliže; gdje se spušta, stoje dalje jedan od drugog. Prozor prikazuje najmanji, najveći i srednji razmak pored razmaka na ravnom terenu, pa vidite šta je teren uradio.

Ravan stola se diže na piloте dok svaka tačka uzorka ispod njega ne bude iznad terena za slobodni razmak koji ste postavili. Najviši pilot prikazuje se u rezultatu.

## Godišnja energija

**Godišnja energija** računa svjetlost na nagnutoj ravni za reprezentativni dan svakog mjeseca, temperaturu ćelija, upisane gubitke, zasjenjenje stolova jednih drugima i brda na horizontu koja preuzimaju sunce koje zaklanjaju. Nebo je vedro, pa je odgovor gornja granica; stvarno vrijeme daje manje. Riječ je o procjeni u ranoj fazi projektovanja, a ne o izvještaju o prinosu.

## Sačuvaj

**Spasi u projekat** čuva ulazne podatke i brojke u datoteci projekta; stolovi se ponovo računaju iz terena kada se datoteka otvori, pa promijenjena površina pomjera ih. Prikazuju se na planu i u 3D (Prikaži › Solarni nizovi). Lista stolova preuzima se kao CSV. Jedan korak poništavanja uklanja ili vraća niz.

## Još nije izrađeno

Podaci o vremenu umjesto vedrog neba, stolovi koji prate teren u pravcu istok–zapad, pratioci sunca i električni projekat (stringovi, kabl, invertori) u programu CivilCraft. Panel Solar PV u programu BimCraft ima stringove i jednopolnu shemu za krovove.
