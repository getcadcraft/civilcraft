---
title: Rasporedite solarne nizove na tlu
summary: Postavite solarne stolove montirane na tlo unutar katastarske čestice ili platoa, s redovima razmaknutima prema tlu na kojem svaki stvarno stoji, strmo tlo ostavljeno prazno, izračunatom godišnjom energijom i stolovima prikazanima na tlocrtu i u 3D-u.
keywords: solarno, pv, fotonaponski, niz, montaža na tlo, stolovi, redovi, razmak redova, sjena, teren, nagib, piloti, proizvodnja, kWp, energija, horizont
from: 95593fd6
---

## Što ćete naučiti

Kako rasporediti polje solarnih stolova na lokaciji koja nije ravna i što znače brojke. Otvorite ga iz Teren › Više › Solarni nizovi.

## Rasporedite stolove

1. Odaberite **Gdje**: katastarsku česticu ili plato projekta ili upišite kutove područja. Označite sve platoe ili čestice koje moraju ostati **prazne** (zgrada, jezero).
2. Upišite **geografsku širinu i dužinu** lokacije. Sunce ovisi o njima; ništa se ne pretpostavlja. Ako projekt ima koordinatni sustav, **Postavi iz koordinatnog sustava** ih popunjava.
3. Postavite nagib, orijentaciju (prazno znači prema ekvatoru), koliko modula čini jedan stol te snagu i veličinu modula. Brojke modula počinju kao opće vrijednosti i tako su označene; upišite svoje.
4. Pritisnite **Rasporedi stolove**. Prozor daje broj stolova i modula, veličinu u kWp i razmak od reda do reda.

Svaki stol je stupac u području, postavljen počevši s prednje strane i pomican unatrag. Stol se postavlja samo tamo gdje je teren ispod njega unutar granice nagiba, unutar područja i odmaka te gdje piloti koje treba nisu viši od granice koju ste postavili. Mjesta koja ne prolaze ostaju prazna, a prozor kaže koliko ih je i zašto.

## Redovi su razmaknuti prema tlu

Na ravnom tlu redovi su razmaknuti uobičajenim pravilom bez sjene: sjena reda u podne na zimski solsticij ne smije doseći donji rub reda iza njega. Na nagibu CivilCraft primjenjuje isto pravilo na tlo na kojem stvarno stoji sljedeći red. Gdje tlo raste iza stola, redovi mogu stajati bliže; gdje se spušta, stoje dalje. Prozor pokazuje najbliži, najdalji i srednji razmak uz razmak na ravnom tlu, pa vidite što je teren učinio.

Ploha stola podiže se na pilotima sve dok svaka točka uzorka ispod nje ne bude iznad tla za slobodni razmak koji ste postavili. Najviši pilot prikazuje se u rezultatu.

## Godišnja energija

**Godišnja energija** računa svjetlo na nagnutoj plohi za reprezentativni dan svakog mjeseca, temperaturu ćelije, upisane gubitke, stolove koji zasjenjuju jedni druge te brda na horizontu koja oduzimaju sunce koje zaklanjaju. Nebo je vedro, pa je odgovor gornja granica; stvarno vrijeme daje manje. To je procjena u ranoj fazi projektiranja, a ne izvješće o proizvodnji.

## Spremite

**Spremi u projekt** čuva ulazne podatke i brojke u datoteci projekta; stolovi se ponovno izračunavaju iz terena kada se datoteka otvori, pa promijenjena površina ih pomiče. Prikazuju se na tlocrtu i u 3D-u (Prikaz › Solarni nizovi). Popis stolova preuzima se kao CSV. Jedan korak poništavanja uklanja ili vraća niz.

## Još nije izrađeno

Podaci o vremenu umjesto vedrog neba, stolovi koji prate teren u smjeru istok–zapad, pratitelji sunca te električni projekt (nizovi, vodiči, izmjenjivači) u CivilCraftu. Ploča Solarni PV u BimCraftu ima nizove i jednopolnu shemu za krovove.
