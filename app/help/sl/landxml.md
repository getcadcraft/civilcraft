---
title: Izmenjava LandXML
summary: Odprite LandXML iz druge gradbene programske opreme kot nov projekt, izvozite točke, površine, trase, profile in cevno omrežje kot LandXML 1.2 ter vedite, kaj ne potuje.
keywords: landxml, xml, uvoz, izvoz, izmenjava, tin, površina, trasa, profil, cevno omrežje, medsebojna operabilnost, izmenjava podatkov
from: 870d5ece
---

LandXML je odprt izmenjevalni format, ki ga večina gradbenih programov bere in piše. CivilCraft bere in piše LandXML 1.2. Če ste uporabljali Civil 3D, so njegova pogovorna okna za uvoz in izvoz LandXML najbližja primerjava; tu ni izbir, opombe pa povedo, kaj je bilo izpuščeno.

## Odprtje datoteke LandXML

1. Kliknite {{ui:Odpri}} (ali pritisnite {{key:Mod+O}}) in izberite datoteko `.xml` ali `.landxml` ali jo spustite na načrt.
2. Če ima trenutni projekt neshranjene spremembe, CivilCraft najprej vpraša. Izberite {{ui:Shrani kopijo}}, {{ui:Ne shrani}} ali {{ui:Prekliči}}.
3. Naredi se **nov projekt**. Vrstica stanja pove, kaj je bilo prebrano, na primer "Odprto site.xml: 412 točk, 2 površini, 3 trase."
4. Poglejte okvir pod dejstvi za **Površje**. Našteje vse, kar je bilo preskočeno ali spremenjeno, na primer:
   - "Odprta je bila samo prva površina („EG“); datoteka ima še 1."
   - "Trasa „Ramp A“ ima elemente, ki jih CivilCraft še ne more risati (niso črte, loki ali klotoidne spirale); bila je preskočena."
   - "Pravila cevnega omrežja niso bila v datoteki; uporabljajo se začasne vrednosti — svoja nastavite pod Projekt."

Kaj postane kaj:

| V datoteki | V CivilCraft |
|---|---|
| Enote (Imperial ali Metric) | **Enote** projekta (čevlji ali metri) |
| Ime projekta | **Ime** projekta |
| CgPoints | Točke projekta; opis (ali koda) določi skupino |
| Prva TIN površina | Obstoječi teren, uporabljen kot je ("Surface (from LandXML)") |
| Vsaka trasa iz črt, lokov in klotoidnih spiral | Trasa z lomnimi točkami, polmeri in dolžinami spiral, obnovljena iz krivin |
| Prvi projektirani profil vsake trase | Njegov projektirani profil s paraboličnimi vertikalnimi krivinami |
| Prvo cevno omrežje | Cevno omrežje z robovi, sumpi in dnom cevi |
| Značilne črte in loki iz načrta | Značilne črte, loki ohranjeni; iz drugega programa se začnejo kot **Samo narisano** |

Celoten seznam elementov in atributov je v [LandXML: kaj se bere in zapiše](topic:landxml-reference).

:::note
Površina, prebrana iz LandXML, se ne obnovi, ko spremenite skupine točk ali narišete lomne črte. Kliknite {{ui:Obnovi površje iz točk}} v razdelku **Površje**, da jo zgradite iz točk namesto tega ({{key:Mod+Z}} vrne površino LandXML).
:::

## Izvoz LandXML

1. Kliknite {{ui:LandXML}} v skupini **Izvoz**.
2. Brskalnik prenese `<ime>.xml`. Vrstica stanja pove, kaj je šlo notri, na primer "Izvoženo LandXML 1.2: 276 točk, 2 površini, 1 trasa, cevno omrežje. Podlage tukaj niso del LandXML; del je oblikovana površina."

Datoteka vsebuje:

- **Enote**: ameriške geodetske čevlje ali metre.
- **CgPoints**: vsako točko s številko kot imenom, opisom in skupino kot kodo.
- **Površine**: obstoječi teren kot TIN z lomnimi črtami in zunanjo mejo kot izvornimi podatki; in, kadar podlage ali koridorji oblikujejo teren, drugo TIN površino z imenom "Proposed".
- **Trase**: črte, loki in klotoidne spirale z njihovimi staciji, vsaka s profilom, ki vsebuje obstoječi teren, vzorčen vzdolž nje, in projektirani profil (PVI in parabolične krivine), kadar ima vsaj dve PVI.
- **PipeNetworks**: objekti z robovi, sumpi in dnom cevi za vsako cev ter cevi s premerom, dolžino in naklonom.
- **PlanFeatures**: vsaka značilna črta kot črte in loki z višino na vsakem koncu ter tem, za kaj se uporablja.

## Kaj ne potuje

- Podlage in koridorji kot objekti. Njihov rezultat je v površini "Proposed".
- Trase z napakami (na primer prekrivajoče se krivine): izpuščene in štete v sporočilu stanja.
- Cevi brez obeh dna in omrežja z manj kot dvema objektoma.
- Rob, vzet iz površine, se zapiše kot fiksni rob. Ko se datoteka ponovno odpre, objekt ohrani to številko, tudi če se površina spremeni.
- Pravila omrežja (najmanjši naklon, pokritje, padec): LandXML zanje nima mesta.
- Nastavitve prikaza in izbire površin za skupine točk: za to shranite projekt CivilCraft.

Ob odpiranju CivilCraft ne bere spiral razen klotoidnih, mrežnih površin, točk, ki se sklicujejo samo na druge točke, parcel, spiral v značilnih črtah, cestnih mrež ali podatkov posnetka. Vsaka je navedena v opombah, nikoli ugibana.

## Povratna izmenjava

Da delo predate nekomu, ki uporablja drugo gradbeno programsko opremo, in ga dobite nazaj, izvozite LandXML, pustite jim urejanje in odprite njihov LandXML kot nov projekt. Ohranite tudi svojo datoteko `.civilcraft.json`: je edina datoteka, ki hrani vse, kar CivilCraft ve.
