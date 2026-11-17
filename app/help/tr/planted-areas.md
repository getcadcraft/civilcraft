---
title: Dikili alanlar: çimler, yataklar, çayırlar, yer örtücüler
summary: Kat yapısı (üst toprak, malç, membran, kenar çerçevesi), bitki karışımı ve isteğe bağlı bitmiş kot ile nesne olarak dikili alanlar; sert zemin, duvar ve basamakların etrafında kendilerini kırpar; net alan, hacim, kenar uzunluğu ve bitki sayımı verir.
keywords: dikili alan, çim, çimen, yatak, kenar yatağı, çayır, yer örtücü, üst toprak, malç, membran, yabani ot örtüsü, kenar çerçevesi, bitmiş kot, miktarlar, net alan, kırpma
from: 2617ec0e
---

Peyzaj grubundaki {{ui:Alanlar}}, bir **çim**, **dikili yatak**, **çayır** ya da **yer örtücü** çizer: köşelerine tıklayın ve {{key:Enter}} tuşuna basın. Bir yatak ya da yer örtücü, Bitkiler bölümünde seçilen bitkiyle dolu başlar; bir çimde bitki bulunmaz.

## İçerdikleri

- **Kat yapısı**: üst toprak kalınlığı, malç kalınlığı, bir yabani ot membranı ve bir kenar çerçevesi (çelik, ahşap, tuğla, beton, plastik ya da yok). Tipik kalınlıklar doldurulur; kendinizinkini ayarlayın.
- **Karışım**: tür (çeşit ve boyutuyla) ve paylar; yatak gibi, aralıkta ya da yoğunlukta doldurulur.
- **Bitmiş kot**: boş bırakırsanız alan zemini izler; bir kot verirseniz alan bir zemin değiştiricisi olur (bkz. [Zemin değiştiriciler ve kotlar](topic:ground-modifiers)).
- **Sert zemin, duvar ve basamakların etrafında kırpma** (varsayılan olarak açık): sert zemin, yol, duvar, kaldırım kenarı, rampa veya basamaklar alanla çakıştığında o kısım dışarıda bırakılır. Bunların altına ve kenarlarının yarım aralık yakınına hiçbir bitki yerleştirilmez.

## Miktarlar

Özellikler bölümü **net alanı** (kırpmadan sonra, tam olarak ölçülmüş), çevreyi, **kenar uzunluğunu** (yalnızca alanın kendi kenarı boyunca; sert zeminin kestiği yerler hariç), üst toprak ve malç hacimlerini, membran alanını ve her karışım satırı için bitki sayılarını gösterir. Bitki listesi alanın bitkilerini sayar; TakeoffCraft için miktar dosyası alanı, üst toprağı, malçı, membranı ve kenar çerçevesini alır; peyzaj IFC'si ise miktar kümesi olan bir IfcGeographicElement yazar.
