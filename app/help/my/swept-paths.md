---
title: ယာဉ် swept path များ
summary: trailer အများဆုံး သုံးခုပါသော ယာဉ်ကို feature line သို့မဟုတ် alignment တစ်လျှောက် ရှေ့ သို့မဟုတ် နောက်ပြန် မောင်းပြီး၊ ၎င်း လွှမ်းခြုံသော ဧရိယာ၊ ဘီးလမ်းကြောင်းများ၊ ကွေ့ချိန် (steering) နှင့် jackknife ဖြစ်သည့်နေရာကို ကြည့်ပါ။
keywords: swept path, turning path, vehicle tracking, turning template, design vehicle, truck, bus, trailer, semitrailer, reversing, backing, jackknife, articulation, steering lock, offtracking, wheel path, loading dock, turning radius
from: 8caafb8a
---

swept path သည် ယာဉ်ကို မျဉ်းတစ်လျှောက် မောင်းပြီး ၎င်း၏ ကိုယ်ထည် ဖြတ်သွားသော မြေပြင်ကို ပြပါသည်။ ကွေ့ခွင့်ရှိမရှိ၊ loading dock သို့ ရောက်နိုင်မရှိ၊ သို့မဟုတ် trailer ကို ကတ်တိုင်မှ မထွက်ဘဲ နောက်ပြန် ထိုးနိုင်မရှိကို စစ်ဆေးရန် အသုံးပြုပါ။

## မျဉ်းတစ်လျှောက် ယာဉ်ကို မောင်းခြင်း

1. ယာဉ်လိုက်သွားမည့် မျဉ်းကို၊ သွားလာသည့် ဦးတည်ချက်အတိုင်း ဆွဲပါ: feature line (arc များ ရပါသည်: ဆွဲနေစဉ် {{key:C}} ကို နှိပ်ပါ၊ [Feature lines](topic:feature-lines) ကို ကြည့်ပါ) သို့မဟုတ် alignment တစ်ခု။
2. ထိုမျဉ်းကို ရွေးပြီး ၎င်း၏ **Properties** တွင် {{ui:Swept path…}} ကို နှိပ်ပါ။
3. **Start from** အောက်တွင် ယာဉ်တစ်စီးကို ရွေးပြီး၊ သင့်ကိုယ်ပိုင် design vehicle မှ အရွယ်အစားများ: width၊ front overhang၊ wheelbase၊ rear overhang၊ track နှင့် **Steering lock** ကို သတ်မှတ်ပါ။ trailer အများဆုံး သုံးခုအထိ ထည့်နိုင်ပြီး၊ တစ်ခုစီတွင် ချိတ်ထားသည့်နေရာ၊ hitch မှ ၎င်း၏ axle အထိ အရှည်၊ overhangs နှင့် **Largest articulation** ပါသည်။
4. **Driving** ကို ရွေးပါ: ရှေ့သို့ သို့မဟုတ် နောက်ပြန်။ **Drive it** ကို နှိပ်ပါ။

:::warning
စတင်ရန် ယာဉ်များသည် နေရာယူထားသော တန်ဖိုးများဖြစ်ပြီး စံသတ်မှတ်ချက် မဟုတ်ပါ။ သင့်ပရောဂျက်သုံးသော design vehicle မှ အရွယ်အစားများကို သတ်မှတ်ပါ။
:::

## ရှေ့သို့နှင့် နောက်ပြန်

| Driving | မျဉ်းကို လိုက်သည့်အရာ | CivilCraft က တွက်ချက်သည့်အရာ |
|---|---|---|
| **Forward** | ရှေ့ axle ၏ အလယ်ဗဟို | နောက် axle နှင့် trailer တိုင်း ရောက်မည့်နေရာ၊ steering angle နှင့် articulation |
| **Reversing** | နောက်ဆုံး axle ၏ အလယ်ဗဟို (trailer ၏ နောက်ဘက်) | ရှေ့ရှိ ယူနစ်တိုင်း ရောက်မည့်နေရာ၊ နှင့် trailer ကို ထိုနေရာသို့ ရောက်စေရန် cab လိုအပ်သော steering |

နောက်ပြန်ထိုးခြင်းကို စစ်ဆေးသည့်နည်းမှာ trailer ရောက်သင့်သည့်နေရာကို ပြောပြပါ၊ ထို့နောက် cab က ရနိုင်/မရနိုင်ကို CivilCraft က ပြောပါမည်။

## ရလဒ်ကို ဖတ်ခြင်း

swept path ကို plan ပေါ်တွင် လိမ္မော်ရောင်ဖြင့် ဆွဲထားပါသည်: ၎င်း၏ အနားသတ်နှင့် အပြင်ဆုံး ဘီးများ၏ လမ်းကြောင်းများ (မျဉ်းကြိုးထိုးထားသည်)။ ၎င်းကို ရွေးပါ (အတွင်းကို နှိပ်ပါ) ပြီး **Properties** တွင် ကြည့်ပါ:

- **Length driven**၊ အကြီးဆုံး **Steering** angle နှင့် **Articulation** ကို ၎င်းတို့၏ limits နှင့်၊ နှင့် **Swept area**။
- မျဉ်းတစ်လျှောက် မည်သည့်ပြဿနာမဆို၊ ၎င်း၏ အကွာအဝေးဖြင့်: lock ထက် ကျော်သော steering၊ သို့မဟုတ် articulation limit ထက် ကျော်သော trailer ကွေ့ခြင်း (jackknife ဖြစ်သည်)။
- **The vehicle along the line**: slider ကို ရွှေ့ပြီး မည်သည့်အချက်တွင်မဆို ယာဉ်ကို ၎င်း၏ steering နှင့် articulation နှင့်အတူ ကြည့်ပါ။

မျဉ်းကို ပြောင်းပါက swept path သည် လိုက်ပြောင်းပါမည်။ {{ui:Edit the vehicle…}} သည် အရွယ်အစားများကို ပြောင်းပြီး၊ **Driving** က ရှေ့သို့နှင့် နောက်ပြန်ကို ပြောင်းပါသည်။ ပြောင်းလဲမှု တစ်ခုစီသည် အဆင့်တစ်ခုဖြစ်ပြီး {{key:Mod+Z}} ဖြင့် ပြန်ဖျက်နိုင်ပါသည်။ {{key:Delete}} က ရွေးထားသော swept path ကို ဖျက်ပါသည် (မျဉ်းသည် ကျန်ရစ်ပါသည်)။

အနားသတ်နှင့် ဘီးလမ်းကြောင်းများကို PDF၊ DXF နှင့် DWG သို့ layer C-ROAD-SWPT ပေါ်တွင် ပို့ပါသည်။

## တွက်ချက်ပုံ

ယူနစ်တစ်ခုစီသည် ၎င်း၏ နောက် axle ၏ မျဉ်းပေါ်တွင် လည်ပြီး ၎င်း၏ ရှေ့ရှိ အမှတ် (ရှေ့ axle သို့မဟုတ် hitch) က ဆွဲယူပါသည်၊ swept path စစ်ဆေးမှုများက အသုံးပြုသော low-speed၊ no-slip model ဖြစ်ပါသည်။ swept area သည် နေရာတိုင်း၏ ကိုယ်ထည် အနားသတ်များ ပေါင်းထားခြင်း ဖြစ်ပါသည်။ အမြန်နှုန်း၊ ဘီး slip၊ steering အချိန်၊ trailer steering သို့မဟုတ် ကိုယ်ထည်အောက်ရှိ clearance တို့ကို မပုံဖော်ပါ။
