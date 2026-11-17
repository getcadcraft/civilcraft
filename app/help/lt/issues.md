---
title: Problemos ir BCF
summary: Pažymėkite problemą plane, trasos stotyje, paviršiaus taške ar vamzdyje, nurodykite jos būseną ir komentarus bei keiskite problemas kaip BCF 2.1 failus šalia LandXML failo.
keywords: problema, problemos, bcf, komentaras, žymėjimas, trūkumas, defektas, aikštelė, žymeklis, būsena, atvira, išspręsta, uždaryta, BIM bendradarbiavimo formatas, landxml, klaidos
from: e44153b1
---

Problema – tai pastaba, prisegta prie tam tikros vietos jūsų CivilCraft brėžinyje, su pavadinimu, būsena ir komentarais. Ja naudokitės, kad nurodytumėte aikštelės darbuotojams ar kitai programai, į ką reikia atkreipti dėmesį, ir kad perskaitytumėte jų atsakymus.

## Problemos pridėjimas

1. Atidarykite **Paviršius, Daugiau, Problemos (BCF)...**
2. Įrašykite pavadinimą ir aprašykite, kas negerai.
3. Pasirinkite, kur ją prisegti: brėžinio vaizdo centre, paviršiaus tašku centre, pasirinktos trasos stotimi (įrašykite stotį ir poslinkį; dešiniojo poslinkio reikšmė teigiama) arba pasirinktu vamzdžiu, konstrukcija ar linijos elementu.
4. Spauskite **Pridėti problemą**. Žymeklis plane rodomas kaip mažas rombas su savo numeriu.

Spustelėkite problemos pavadinimą, kad priartintumėte prie jos, pakeiskite jos būseną sąraše (Atvira, Aktyvi, Išspręsta, Uždaryta) ir pridėkite komentarų. Kiekvienas pakeitimas – vienas anuliavimo žingsnis, o problemos įrašomos projekto faile.

## Keitimas BCF formatu

- **Eksportuoti BCF** įrašo BCF 2.1 failą, kuriame kiekviena problema yra viena tema: pavadinimas, būsena, komentarai ir vienas vaizdo taškas su ortogonalia plano kamera bei žymekliu.
- **Importuoti BCF** nuskaito BCF failą (2.0 ir 3.0 failai nuskaitomi tiek, kiek atitinka 2.1). Tema, kurios guid jau turite, atnaujina tą problemą (būseną, naujus komentarus), o ne prideda antrą.
- **Iš problemų** sukuria problemą iš kiekvieno atviro Problemų skydelio įrašo, kuriame nurodyta, kur jis yra.

BCF perduoda metrus šio projekto koordinatėmis, be jokio poslinkio. Kita programa turi būti toje pačioje koordinačių sistemoje kaip jūsų LandXML failas, kad žymekliai atsidurtų teisingoje vietoje. Elementas, į kurį rodo žymeklis (trasa, stotis, poslinkis, vamzdis), perduodamas kaip etiketės, prasidedančios „cc:“, kurias CivilCraft nuskaito atgal.

## Kas netikrinama

Žymekliai ir vaizdo taškai buvo išbandyti tik įrašant failą ir nuskaitant jį atgal CivilCraft programoje. Dar nė viena kita BIM programa jų neatidarė. Be to, ar BCF lauke „view to world scale“ turima omenyje visas ar pusė vaizdo aukščio, skirtingose programose skiriasi: CivilCraft įrašo visą aukštį.
