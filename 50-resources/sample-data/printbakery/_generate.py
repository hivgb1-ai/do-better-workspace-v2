# -*- coding: utf-8 -*-
"""
프린트베이커리(주식회사 피비지) AX 데모용 더미데이터 생성기.
이카운트 ERP export 느낌의 sales + product_master + ad_promo + channel_master.
향수/화장품 일절 없음. 아트에디션 + 라이프스타일 오브제만.
"""
import csv, random, datetime as dt

random.seed(20260701)
OUT = "/Users/rhim/Projects/do-better-workspace-v2/50-resources/sample-data/printbakery"

# ---------------------------------------------------------------------------
# 1) 채널 마스터
# ---------------------------------------------------------------------------
# 수수료율 차등이 마진 미션의 핵심: 자사몰/직영은 낮고, 무신사/백화점/신세계몰은 높다.
CHANNELS = [
    # code, name, type, fee_rate, settle, note
    ("PB", "자사몰",        "자사몰(D2C)", 0.030, "D+3",     "printbakery.com / PG 수수료만"),
    ("MS", "무신사",        "오픈마켓",     0.290, "익월 말",  "패션·리빙 플랫폼 / 입점 수수료"),
    ("SG", "신세계몰",      "오픈마켓",     0.250, "익월 15일", "SSG.COM 입점"),
    ("DP", "오프라인-백화점", "백화점 입점",   0.280, "익월 말",  "더현대서울·신세계 등 입점 / 백화점 수수료"),
    ("DR", "오프라인-직영",   "직영 매장",     0.025, "D+2",     "워커힐 플래그십·직영 로드샵 / 카드 수수료만"),
]
CH_BY_CODE = {c[0]: c for c in CHANNELS}

with open(f"{OUT}/channel_master.csv", "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["채널코드", "채널명", "유형", "수수료율", "정산주기", "비고"])
    for code, name, typ, fee, settle, note in CHANNELS:
        w.writerow([code, name, typ, f"{fee:.3f}", settle, note])

# ---------------------------------------------------------------------------
# 2) 상품 마스터 (아트에디션 + 라이프스타일 오브제, 향수/화장품 없음)
# ---------------------------------------------------------------------------
# (sku, 카테고리, 상품명, 작가/콜라보, 정가, 자사몰판매가, 원가, 재고)
# 원가는 정가 대비: 아트에디션 0.52~0.62(작가 로열티·제작) / 리빙 0.36~0.50
PRODUCTS = [
    # --- 아트에디션 (판화·원화, 작가 콜라보) ---
    ("AE01", "아트에디션", "김창열 〈물방울〉 판화 에디션 (소)", "김창열", 420000,  380000, 232000, 18),
    ("AE02", "아트에디션", "김창열 〈물방울〉 판화 에디션 (대)", "김창열", 1300000, 1200000, 744000, 9),
    ("AE03", "아트에디션", "김환기 〈무제〉 점화 에디션 (소)",   "김환기", 490000,  450000, 279000, 14),
    ("AE04", "아트에디션", "김환기 〈무제〉 점화 에디션 (대)",   "김환기", 1900000, 1800000, 1116000, 6),
    ("AE05", "아트에디션", "쿠사마 야요이 〈호박〉 실크스크린 (S)", "쿠사마 야요이", 720000, 680000, 421000, 11),
    ("AE06", "아트에디션", "쿠사마 야요이 〈호박〉 실크스크린 (L)", "쿠사마 야요이", 2500000, 2400000, 1488000, 4),
    ("AE07", "아트에디션", "김창열 〈물방울〉 원화",            "김창열", 4200000, 4000000, 2480000, 2),
    ("AE08", "아트에디션", "김환기 〈점화〉 한정 에디션",        "김환기", 3400000, 3200000, 1984000, 3),
    # --- 리빙: 글라스 ---
    ("LG01", "리빙-글라스", "세라믹 버블글라스",   "", 98000,  93000,  37000, 120),
    ("LG02", "리빙-글라스", "버블 와인버킷",       "", 230000, 220000, 92000, 40),
    ("LG03", "리빙-글라스", "버블 텀블러",         "", 72000,  68000,  27000, 150),
    ("LG04", "리빙-글라스", "버블 보울",           "", 89000,  85000,  35000, 90),
    # --- 리빙: 도자 ---
    ("LD01", "리빙-도자",  "산딸기 티웨어 세트",   "", 390000, 370000, 152000, 28),
    ("LD02", "리빙-도자",  "산딸기 머그",         "", 94000,  89000,  35000, 110),
    ("LD03", "리빙-도자",  "도자 화병",           "", 152000, 145000, 60000, 55),
    ("LD04", "리빙-도자",  "도자 접시 세트",       "", 172000, 165000, 70000, 48),
    ("LD05", "리빙-도자",  "백자 다기 세트",       "", 295000, 280000, 118000, 22),
    ("LD06", "리빙-도자",  "도자 컵받침 세트",     "", 34000,  32000,  14000, 130),
    # --- 리빙: 공예/유기 ---
    ("LC01", "리빙-공예",  "유기 수저 세트",       "", 208000, 198000, 89000, 44),
    ("LC02", "리빙-공예",  "유기 반상기 세트",     "", 540000, 520000, 234000, 12),
    ("LC03", "리빙-공예",  "황동 트레이",         "", 182000, 175000, 73000, 60),
    ("LC04", "리빙-공예",  "옻칠 함",             "", 250000, 240000, 108000, 20),
    # --- 리빙: 텍스타일 ---
    ("LT01", "리빙-텍스타일", "Work1969 실크 스카프", "", 450000, 430000, 193000, 35),
    ("LT02", "리빙-텍스타일", "패턴 머플러",         "", 99000,  95000,  41000, 70),
    ("LT03", "리빙-텍스타일", "린넨 테이블러너",     "", 76000,  72000,  31000, 85),
    ("LT04", "리빙-텍스타일", "코튼 에코백",         "", 40000,  38000,  16000, 200),
    ("LT05", "리빙-텍스타일", "린넨 앞치마",         "", 61000,  58000,  25000, 75),
    # --- 리빙: 문구 ---
    ("LP01", "리빙-문구",  "한지 엽서",           "", 7000,   7000,   2800, 600),
    ("LP02", "리빙-문구",  "아트 포스터 (소)",     "", 30000,  28000,  11000, 220),
    ("LP03", "리빙-문구",  "아트 노트",           "", 16000,  15000,  6000, 280),
    ("LP04", "리빙-문구",  "마스킹테이프",         "", 9000,   9000,   3400, 400),
    ("LP05", "리빙-문구",  "아트 엽서세트",        "", 19000,  18000,  7200, 240),
    ("LP06", "리빙-문구",  "책갈피 세트",         "", 13000,  12000,  4800, 300),
    ("LP07", "리빙-문구",  "아트 마그넷",         "", 8500,   8000,   3200, 350),
]
P_BY_SKU = {p[0]: p for p in PRODUCTS}
ART_SKUS = [p[0] for p in PRODUCTS if p[1] == "아트에디션"]
LIVING_SKUS = [p[0] for p in PRODUCTS if p[1] != "아트에디션"]

# 월평균판매량은 채널 분배 후 산출하기 위해 우선 골격만 — 나중에 채움
monthly_sales = {p[0]: 0 for p in PRODUCTS}

# 채널별 판매가 산출: 자사몰=base, 무신사 0.97, 신세계몰 0.98, 백화점=정가, 직영=base
def unit_price(sku, ch):
    _, _, _, _, msrp, base, _, _ = P_BY_SKU[sku]
    if ch == "PB": return base
    if ch == "MS": return int(round(base * 0.97 / 100) * 100)
    if ch == "SG": return int(round(base * 0.98 / 100) * 100)
    if ch == "DP": return msrp
    if ch == "DR": return base
    return base

# 아트에디션은 무신사 미취급 (패션 플랫폼에 고가 원화/판화 X)
def eligible_skus(ch):
    if ch == "MS":
        return LIVING_SKUS
    return [p[0] for p in PRODUCTS]

# ---------------------------------------------------------------------------
# 3) 캠페인/프로모션 (ad_promo) — 스파이크 이벤트 + 상시 광고
# ---------------------------------------------------------------------------
# 5개 히어로 이벤트: 대상 채널/SKU/날짜가 sales 스파이크와 정확히 정렬
HERO = [
    dict(id="CMP-2606-01", typ="콜라보런칭", media="메타+구글",  ch=["PB"],
         start="2026-06-12", end="2026-06-13", cat="아트에디션",
         skus=["AE05", "AE06"], spend=4500000, disc=0.0,
         note="쿠사마 야요이 〈호박〉 콜라보 에디션 런칭 (강하영 광고 집행)"),
    dict(id="CMP-2606-02", typ="프로모션", media="무신사 부스팅", ch=["PB", "MS"],
         start="2026-06-05", end="2026-06-07", cat="리빙",
         skus=["LD01", "LD02", "LG01", "LG04"], spend=1800000, disc=0.15,
         note="여름 테이블웨어 기획전 (황나영 리빙아트 기획)"),
    dict(id="CMP-2606-03", typ="채널세일", media="신세계몰 광고", ch=["SG"],
         start="2026-06-20", end="2026-06-22", cat="리빙-도자",
         skus=["LD03", "LD04", "LD05"], spend=1200000, disc=0.20,
         note="신세계몰 여름 리빙 정기세일"),
    dict(id="CMP-2606-04", typ="광고부스팅", media="메타+구글", ch=["PB"],
         start="2026-06-18", end="2026-06-19", cat="리빙-글라스",
         skus=["LG02", "LG03", "LG01"], spend=2200000, disc=0.0,
         note="버블 컬렉션 퍼포먼스 광고 (강하영 광고 집행)"),
    dict(id="CMP-2606-05", typ="프로모션", media="메타", ch=["PB", "DP"],
         start="2026-06-26", end="2026-06-27", cat="아트에디션",
         skus=["AE03", "AE04"], spend=3000000, disc=0.10,
         note="김환기 점화 에디션 프로모션 (이번 주)"),
]
HERO_DAYS = {}  # date -> list of hero
for h in HERO:
    d0 = dt.date.fromisoformat(h["start"]); d1 = dt.date.fromisoformat(h["end"])
    d = d0
    while d <= d1:
        HERO_DAYS.setdefault(d, []).append(h)
        d += dt.timedelta(days=1)

# 소형 프로모션 (스파이크 아님, 일상 쿠폰/단품 세일) — 할인 반영 위해 미리 정의
SMALL = [
    ("문구 묶음 쿠폰",   "PB", "리빙-문구",   ["LP01","LP03","LP05"], 0.10, "2026-06-02","2026-06-08"),
    ("에코백 단독전",     "MS", "리빙-텍스타일",["LT04"],              0.12, "2026-06-09","2026-06-12"),
    ("머그 1+1",         "PB", "리빙-도자",   ["LD02"],              0.00, "2026-06-14","2026-06-16"),
    ("스카프 백화점 행사","DP", "리빙-텍스타일",["LT01"],              0.05, "2026-06-10","2026-06-13"),
    ("텀블러 여름 쿨딜",  "SG", "리빙-글라스", ["LG03"],              0.15, "2026-06-23","2026-06-26"),
    ("아트노트 신학기",   "PB", "리빙-문구",   ["LP03","LP06"],       0.10, "2026-05-26","2026-05-31"),
    ("화병 단독 큐레이션","DR", "리빙-도자",   ["LD03"],              0.00, "2026-06-16","2026-06-22"),
]

# 할인 적용 맵: (날짜, 채널코드, SKU) -> 할인율  (히어로 + 소형 프로모션)
PROMO_DISC = {}
def _register_disc(start, end, ch_codes, skus, disc):
    if disc <= 0:
        return
    d0 = dt.date.fromisoformat(start); d1 = dt.date.fromisoformat(end)
    d = d0
    while d <= d1:
        for ch in ch_codes:
            for s in skus:
                PROMO_DISC[(d.isoformat(), ch, s)] = max(PROMO_DISC.get((d.isoformat(), ch, s), 0), disc)
        d += dt.timedelta(days=1)
for h in HERO:
    _register_disc(h["start"], h["end"], h["ch"], h["skus"], h["disc"])
for name, ch, cat, skus, disc, ws, we in SMALL:
    _register_disc(ws, we, [ch], skus, disc)

# ---------------------------------------------------------------------------
# 4) 매출 데이터 생성
# ---------------------------------------------------------------------------
START = dt.date(2026, 5, 26)
END = dt.date(2026, 6, 28)
HOUR_W = [1,1,1,1,1,2,3,5,7,9,10,11,10,9,8,7,8,9,10,11,10,8,5,3]
REGION = (["서울"]*30 + ["경기"]*25 + ["인천"]*8 + ["부산"]*7 + ["대구"]*5 +
          ["광주"]*4 + ["대전"]*4 + ["울산"]*3 + ["경남"]*4 + ["기타"]*10)
STATUS = (["배송완료"]*80 + ["배송중"]*8 + ["교환완료"]*6 + ["반품완료"]*6)
CH_W = {"PB": 0.36, "MS": 0.18, "SG": 0.15, "DP": 0.19, "DR": 0.12}
CH_CODES = list(CH_W.keys())
CH_WEIGHTS = list(CH_W.values())
WEEKDAY_F = [0.85, 0.9, 1.0, 1.1, 1.25, 1.35, 1.0]  # Mon..Sun (주말·금 강세)

BASE_PER_DAY = 52
rows = []
seq = {}  # (code, ymd) -> running seq

def new_order_id(ch, d):
    key = (ch, d)
    seq[key] = seq.get(key, 0) + 1
    return f"{ch}-{d.strftime('%y%m%d')}-{seq[key]:04d}"

def pick_sku(ch, art_bias=0.0):
    elig = eligible_skus(ch)
    arts = [s for s in elig if s in ART_SKUS]
    livs = [s for s in elig if s in LIVING_SKUS]
    # 아트에디션은 고가·저빈도(재고 한 자릿수). 평소엔 드물게, 런칭일에만 몰림.
    # 판화 에디션(소형)은 가끔, 원화·대형은 매우 드물게.
    if arts and random.random() < (0.012 + art_bias):
        ART_W = {"AE01": 30, "AE02": 6, "AE03": 28, "AE04": 6,
                 "AE05": 22, "AE06": 5, "AE07": 2, "AE08": 3}
        ws = [ART_W.get(s, 5) for s in arts]
        return random.choices(arts, weights=ws)[0]
    # 문구·글라스 등 저가 물량이 더 자주 팔리게 가중
    pop = (livs * 1) + [s for s in livs if s.startswith(("LP", "LG", "LD0", "LT04"))]
    return random.choice(pop)

def emit_order(ch, d, skus=None, qty_boost=1.0):
    oid = new_order_id(ch, d)
    hour = random.choices(range(24), weights=HOUR_W)[0]
    minute = random.randint(0, 59)
    region = random.choice(REGION)
    status = random.choice(STATUS)
    n_lines = random.choices([1, 2, 3], weights=[68, 24, 8])[0]
    chosen = []
    for _ in range(n_lines):
        sku = (random.choice(skus) if skus else pick_sku(ch, art_bias=(0.18 if ch in ("PB","DP") else 0.0)))
        if sku in [c[0] for c in chosen]:
            continue
        p = P_BY_SKU[sku]
        cat = p[1]
        price = unit_price(sku, ch)
        disc = PROMO_DISC.get((d.isoformat(), ch, sku), 0)
        if disc > 0:
            price = int(round(price * (1 - disc) / 100) * 100)
        # 아트에디션은 수량 1, 문구는 다수
        if sku in ART_SKUS:
            qty = 1
        elif sku.startswith("LP"):
            qty = random.choices([1,2,3,4,5], weights=[40,25,15,12,8])[0]
        else:
            qty = random.choices([1,2,3], weights=[70,22,8])[0]
        qty = max(1, int(round(qty * qty_boost)))
        chosen.append((sku, cat, price, qty))
    if not chosen:
        return
    for sku, cat, price, qty in chosen:
        amount = price * qty
        rows.append([
            oid, d.isoformat(), f"{hour:02d}:{minute:02d}",
            CH_BY_CODE[ch][1], cat, sku, P_BY_SKU[sku][2], qty, price, amount,
            region, status,
        ])
        monthly_sales[sku] += qty

d = START
while d <= END:
    wf = WEEKDAY_F[d.weekday()]
    n = int(round(BASE_PER_DAY * wf * random.uniform(0.9, 1.1)))
    for _ in range(n):
        ch = random.choices(CH_CODES, weights=CH_WEIGHTS)[0]
        emit_order(ch, d)
    # 스파이크: 해당일 히어로 캠페인의 대상 채널/SKU로 주문 수 자체를 끌어올림.
    # 아트에디션 런칭(고단가)은 적은 건수로도 일총매출이 크게 뜀 → 건수 적게.
    # 리빙 프로모션(저단가)은 일총매출을 +30%↑ 넘기려면 건수를 크게.
    for h in HERO_DAYS.get(d, []):
        is_art = h["cat"].startswith("아트")
        for ch in h["ch"]:
            extra = random.randint(16, 24) if is_art else random.randint(56, 72)
            boost = 1.0 if is_art else 1.5
            for _ in range(extra):
                emit_order(ch, d, skus=h["skus"], qty_boost=boost)
    d += dt.timedelta(days=1)

# 주문번호/시간 정렬
rows.sort(key=lambda r: (r[1], r[2], r[0]))

with open(f"{OUT}/sales.csv", "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["주문번호","주문일","주문시간","채널","카테고리","SKU","상품명","수량","단가","금액","배송지역","주문상태"])
    w.writerows(rows)

# ---------------------------------------------------------------------------
# 5) product_master.csv (월평균판매량은 실제 생성분 반영)
# ---------------------------------------------------------------------------
with open(f"{OUT}/product_master.csv", "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["SKU","카테고리","상품명","작가콜라보","정가","자사몰판매가","원가","재고수량","월판매량"])
    for sku, cat, name, artist, msrp, base, cost, stock in PRODUCTS:
        w.writerow([sku, cat, name, artist, msrp, base, cost, stock, monthly_sales[sku]])

# ---------------------------------------------------------------------------
# 6) ad_promo.csv (~50행: 히어로 5 + 상시 광고/소형 프로모션)
# ---------------------------------------------------------------------------
promo_rows = []
for h in HERO:
    promo_rows.append([
        h["id"], h["typ"], h["media"], ",".join(CH_BY_CODE[c][1] for c in h["ch"]),
        h["start"], h["end"], h["cat"], ",".join(h["skus"]),
        h["spend"], f"{h['disc']:.2f}", h["note"],
    ])

# 상시 광고: 주차별 메타·구글·무신사 always-on (강하영 매일 취합 대상)
weeks = [("2026-05-26","2026-06-01"),("2026-06-02","2026-06-08"),
         ("2026-06-09","2026-06-15"),("2026-06-16","2026-06-22"),
         ("2026-06-23","2026-06-28")]
aon = [("메타",     "PB",  "리빙",      450000),
       ("구글 검색", "PB",  "전체",      380000),
       ("무신사 노출","MS", "리빙",      300000),
       ("신세계몰 노출","SG","리빙-도자", 220000)]
wi = 0
for ws, we in weeks:
    wi += 1
    for media, ch, cat, base_spend in aon:
        spend = int(base_spend * random.uniform(0.85, 1.15) / 1000) * 1000
        promo_rows.append([
            f"AON-26{wi:02d}-{ch}", "상시광고", media, CH_BY_CODE[ch][1],
            ws, we, cat, "", spend, "0.00", f"{wi}주차 상시 {media} 운영",
        ])

# 소형 프로모션 (쿠폰·단품 세일) — 스파이크 없는 일상 프로모션
sn = 0
for name, ch, cat, skus, disc, ws, we in SMALL:
    sn += 1
    spend = random.choice([0, 0, 150000, 200000, 300000])
    promo_rows.append([
        f"PRM-2606-{sn:02d}", "프로모션", "자체", CH_BY_CODE[ch][1],
        ws, we, cat, ",".join(skus), spend, f"{disc:.2f}", name,
    ])

with open(f"{OUT}/ad_promo.csv", "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["캠페인ID","유형","매체","채널","시작일","종료일","대상카테고리","대상SKU","광고비","할인율","비고"])
    w.writerows(promo_rows)

print(f"sales rows: {len(rows)}")
print(f"products: {len(PRODUCTS)}  art: {len(ART_SKUS)}  living: {len(LIVING_SKUS)}")
print(f"ad_promo rows: {len(promo_rows)}")
