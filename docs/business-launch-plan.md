# PremiumLeaf (`premiumleaf.shop`) — Dropshipping & Private-Label Launch Playbook

Target Launch: **June**  
Primary Markets: **Sweden / European Union (EUR)** & **United States (USD)**  
Initial Supplier: **Chartogi** (Steven Tang — WhatsApp: `+86 186 2826 3573`, Email: `steven.tang@chartogi.com`, Storefront: `chartogi.en.alibaba.com`)

---

## 1. Two-Phase Business Model: Dropship First, Private Label Second

### Phase 1 — Asset-Light Validation (June Launch)
- **Catalog Split (`116` total SKUs)**:
  - **52 Ready-to-Order Accessories**: Compact humidors (`Hum-001`..`Hum-020` lightweight models), cigar cases (`Cas-001`..`Cas-012`), cutters & unfilled lighters (`Cut-001`..`Cut-016`), hygrometers & two-way humidity packs (`Hyd-001`..`Hyd-011`), cigar rests (`Rst-001`..`Rst-007`), and wooden/metal ashtrays (`Ash-001`..`Ash-007`).
  - **64 Inquiry-Approval Items**: Climate-controlled cabinets (`Cab-001`..`Cab-005`, up to `185 kg`), heavy/multi-kg display pieces, glass/ceramic fragility risks, and specialty items gated behind `/shop` **Send Inquiry for Approval** so you never accidentally accept an unfulfillable instant checkout order.
- **Admin Price & Catalog Control (`/admin`)**:
  - Sign in using `ADMIN_PASSWORD` stored in `.env.local`.
  - Override USD/EUR retail prices, enter real Chartogi EXW quotes as you receive them, monitor live gross margins, and toggle any SKU between **Ready to Order**, **Inquiry Required**, or **Hidden**.
  - Inspect incoming **Inquiry Approvals** and **Orders** with internal supplier mapping (`data/chartogi_extracted.json` & `docs/supplier-sku-matrix.csv`).

### Phase 2 — Bulk & Custom Branding Transition
- Identify your top 5–10 winning SKUs from June–October parcel orders.
- Order MOQ runs (typically 50–300 pcs per SKU in China) with **PremiumLeaf** laser engraving on stainless cutters, brass/wood plaques on humidors, blind-debossed leather cigar cases, and branded rigid gift boxes.
- Note from PDF audit: Some studio photos in the supplier catalogue (such as `Hum-001` brass badge and `Cab-001` lower frame) show existing supplier marks—confirm **neutral/unbranded stock** during Phase 1 or prioritize clean unbranded cases/cutters until Phase 2 tooling.
- Transition top sellers into a local EU (Sweden/Netherlands/Germany) and/or US 3PL warehouse for 2–4 day domestic shipping.

---

## 2. Chinese Air Shipping & Freight Guide (China -> Sweden/EU & USA)

China air freight charges by **Chargeable Weight**, which is the **greater** of:
1. **Gross Packaged Weight (kg)**: Product net weight + ~18% + outer double-wall carton/foam (`~0.12–0.35 kg`).
2. **Volumetric Weight (kg)**: `(Length_cm × Width_cm × Height_cm) / 5000`.

### Why 1 Humidor is ~$50 Express vs ~$65 for 2 Humidors
Courier air lines (DHL Express / FedEx International Priority / UPS Worldwide Expedited out of Shenzhen or Hong Kong) apply a high first-0.5 kg air waybill + export clearance base fee (~$30–$35), then add a lower incremental per-kg rate (~$6–$8/kg):
- **1 Wooden Humidor** (`~2.0–3.2 kg` boxed/volumetric) -> **~$50 USD** Express Air Freight (`€50 EUR` DDP EU).
- **2 Wooden Humidors consolidated in 1 carton** (`~4.0–6.4 kg`) -> **~$65 USD** Express Air Freight (`€64 EUR` DDP EU) — saving ~$35 compared to two separate shipments!

### Recommended Shipping Tiers Implemented in `src/lib/shipping.ts`
| Method | Carrier Examples | Transit Time | 1 Light Accessory (<0.4 kg) | 1 Humidor (~2.5 kg) | 2 Humidors (~5.0 kg) | Customs Handling |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Direct Air Line (DDP)** | YunExpress / 4PX / Yanwen Special Line | 8–14 business days | **$14 / €16** | **$34 / €34** | **$47 / €46** | Pre-cleared DDP (US Section 321 / EU IOSS ready) |
| **Express Air Freight** | DHL Express / FedEx Priority (HK/SZ) | 4–7 business days | **$32 / €33** | **$50 / €50** | **$65 / €64** | Full commercial invoice tracking |
| **Concierge Freight** | Sea LCL / Air Pallet (Cabinets 5–185 kg) | Quoted per destination | N/A | N/A | N/A | Requires Inquiry Approval + voltage check (220V EU / 110V US) |

### Cargo Compliance Checklist
- **Jet Lighters** (`Cut-002`, `Cut-003`, `Cut-004`, `Cut-008`, etc.): **Must ship empty (no butane fuel)**. Confirm with Steven Tang that all lighters are shipped purged and routed on lighter-permitted lines (4PX / YunExpress special cargo).
- **Cigar Cabinets (`Cab-001`..`Cab-005`)**: Confirm **220–240V / EU Type-F/C plug** for Sweden/EU orders vs **110–120V / US Type-A/B plug** for US orders, plus CE/UL certification before quoting freight.
- **Liquid Spray (`Sig-001`)**: PDF notes fill volume & formulation are unconfirmed—do not ship by air without MSDS.

---

## 3. Ready-to-Send RFQ Template for Chartogi (Steven Tang)

Send via email (`steven.tang@chartogi.com`) or WhatsApp (`+86 186 2826 3573`):

> Hi Steven,
>
> I am launching **PremiumLeaf** (`premiumleaf.shop`), a curated cigar accessories store serving **Sweden/EU** and the **United States**, starting in **June**.
>
> We reviewed your complete 119-page Trade Collection catalogue and would like to start by dropshipping a curated ~50-SKU accessory assortment from China (humidors, leather cases, V-cutters, hygrometers, rests, ashtrays) before scaling into bulk OEM/private-label orders with our own branding.
>
> Could you please quote on the attached SKU list (`supplier-sku-matrix.csv` / PDF references):
> 1. **Unit EXW / FOB price** for 1-piece dropship vs 10 / 50 / 100-piece MOQ tiers.
> 2. **Neutral / blind packaging**: Can items ship without Chartogi logos, invoices, or external branding? Which models currently have fixed physical Chartogi marks?
> 3. **China Air Shipping options** to **Sweden (EU)** and **USA** via YunExpress/4PX DDP and DHL/FedEx Express (and confirmation that jet lighters ship purged/unfilled).
> 4. **Sample order** lead time and freight cost for 6–8 hero items for quality inspection.
> 5. **OEM branding costs** (laser engraving, leather debossing, custom gift box MOQs) for Phase 2.
>
> Best regards,  
> [Your Name] — PremiumLeaf (`premiumleaf.shop`)

---

## 4. Operational Launch Checklist (Before June)

- [ ] **Week 1–2**: Send RFQ + `docs/supplier-sku-matrix.csv` to Steven Tang; confirm neutral packaging & real EXW prices; update prices in `/admin`.
- [ ] **Week 3–4**: Order 6–8 sample products (1 glass-lid humidor, 2 leather/carbon cases, 2 cutters, 1 hygrometer, 1 wooden ashtray) to Sweden to inspect Spanish cedar aroma, seal tightness, blade steel, and actual boxed weight.
- [ ] **Month 2**: Register Swedish Enskild Firma / AB (or US LLC), register for **EU IOSS** (if shipping B2C parcels <= €150 into EU so Swedish/EU buyers avoid PostNord 75–100 SEK handling surprises!), and connect **Stripe** keys in `.env.local` (verify merchant category is *Home Goods / Gift & Lounge Accessories*—do not sell tobacco or rolling papers on the same merchant account).
- [ ] **Month 3**: Connect `premiumleaf.shop` DNS to Vercel, run end-to-end test orders in USD and EUR, verify shipping rates and `/admin` password protection, and launch!
