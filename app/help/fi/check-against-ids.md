---
title: Tarkista IFC-vienti asiakkaan IDS:ää vasten
summary: Lataa asiakkaan tai tieviranomaisen antama .ids-tiedosto ja näe jokainen viety kohde, joka ei täytä sitä, Ongelmat-listassa.
keywords: ids, tietojen toimitusmääritys, buildingsmart, vaatimukset, toimitus, tarkistus, laadunvarmistus, ifc-vienti, ifc 4.3, linjaus, tie, hankinta
from: 183d9a0e
---

## Mitä teet

IDS (Information Delivery Specification, buildingSMART-standardi) on luettelo siitä, mitä IFC:n on sisällettävä. Julkiset hankinnat lähettävät sellaisen usein työn mukana. CivilCraft tarkistaa tämän projektin viemän IFC:n sitä vasten siinä IFC-versiossa, jonka valitsit viennille, ja listaa jokaisen kohteen, joka jää vaatimuksesta jälkeen.

## Vaiheet

1. Avaa projektisi.
2. Napsauta työkalurivin **Vienti**-ryhmässä {{ui:IFC}}-painiketta. Valitse valintaikkunassa IFC-versio, jonka toimitat.
3. Napsauta {{ui:Check against IDS…}}.
4. Napsauta {{ui:Load an .ids file…}} ja valitse tiedosto. Mitään ei lähetetä.
5. Lue tulos: jokainen määritys merkittynä {{ui:Pass}} (Läpäisee) tai {{ui:Fail}} (Ei läpäise) ja kuinka monta kohdetta se koskee.
6. Avaa Ongelmat ({{key:Ctrl+Shift+M}}) ja napsauta epäonnistumista valitaksesi linjauksen, alustan, putken, rakenteen tai rakennusmassan, josta se tuli.

## Mitä pitäisi näkyä

- Yksi varoitus jokaisesta viedystä kohteesta ja vaatimuksesta, jonka se jättää täyttämättä. Varoituksessa on määrityksen nimi, mitä IDS vaatii ja mitä vienti sisältää.
- Tarkistusraportti (Ongelmat-listassa) alkaa IDS:stä: sen nimi, versio, tekijä ja kunkin määrityksen lukumäärät.

## Hyvä tietää

- IDS tallennetaan projektitiedostoon, joten se tarkistetaan uudelleen, kun avaat projektin. IDS:n lataaminen tai unohtaminen on yksi kumottava askel.
- Jokainen muutos tarkistetaan hetken päästä uudelleen. Suuret maastomallit vievät kirjoittamiseen kauemmin, joten tarkistus odottaa silloin hieman pidempään ajojen välillä.
- Tarkistus käyttää samaa tiedostoa, jonka {{ui:IFC}}-vienti kirjoittaa, siinä versiossa, joka valittiin viimeksi (IFC 4.3, jos et ole valinnut mitään).
- Luvut verrataan SI-yksiköissä: projekti, jonka yksikkö on ft, muunnetaan ensin metreiksi.

- Säännölliset lausekkeet IDS:ssä luetaan koko arvona. Alussa oleva `^` ja lopussa oleva `$` tulkitaan myös ”koko arvo”, kuten useimmat IDS-tiedostot ne tarkoittavat.

## Seuraava

- [Vie IFC](topic:ifc)
