#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
랩노쉬(LABNOSH) / 이그니스(EGNIS) AX Bootcamp 데모용 더미데이터 생성기.
실제 자사몰(labnosh.com) 제품·가격 기반. 단백질 간편식(프로틴 드링크·슬림쉐이크) 브랜드.
온라인 채널: 자사몰 / 쿠팡 / 네이버스토어 / 마켓컬리 / 무신사
페르소나: 이정호(헬스케어사업본부 온라인MD팀장) — 채널별 매출·원가·광고비·배송비로 이익 산출, 주간 경영진 보고.
4종 CSV: sales / product_master / ad_performance / inventory
"""
import csv
import random
from datetime import date, timedelta

random.seed(20260611)

OUT = "."

# ── 온라인 채널 정의 (이정호 제안서: 카페24·네이버스토어 + 온라인MD JD: 쿠팡 주력) ──
# fee_rate = 채널 판매수수료, price_factor = 자사몰 판매가 대비 채널 판매가 배율
CHANNELS = {
    "자사몰":     {"code": "OWN", "fee": 0.030, "price_factor": 1.00, "weight": 0.30},
    "쿠팡":       {"code": "CPG", "fee": 0.115, "price_factor": 1.02, "weight": 0.34},
    "네이버스토어": {"code": "NVR", "fee": 0.055, "price_factor": 1.00, "weight": 0.18},
    "마켓컬리":   {"code": "KLY", "fee": 0.230, "price_factor": 1.05, "weight": 0.10},
    "무신사":     {"code": "MUS", "fee": 0.180, "price_factor": 1.00, "weight": 0.08},
}

# ── 제품 마스터 (실제 랩노쉬 라인업·자사몰 판매가 기반 — 2026-06 확인) ─────────
# (sku, 제품명, 라인, 카테고리, 정가, 자사몰판매가, 원가율)
# 가격은 자사몰 묶음가 기준. 퍼펙트/맥스 12입 환산, 슬림쉐이크 35입, 미니 6입 등.
PRODUCTS = [
    ("PRO-PFT-12", "프로틴 드링크 퍼펙트 12입",   "프로틴드링크", "단백질음료",   51900, 44900, 0.40),
    ("PRO-MAX-12", "프로틴 드링크 맥스 12입",     "프로틴드링크", "단백질음료",   43900, 39900, 0.42),
    ("PRO-MNI-06", "프로틴 드링크 미니 6입",      "프로틴드링크", "단백질음료",   17400,  9900, 0.44),
    ("SLM-SHK-35", "슬림쉐이크 9종 35입",         "슬림쉐이크",   "다이어트셰이크",103500, 89900, 0.38),
    ("SLM-SHK-21", "슬림쉐이크 9종 21입",         "슬림쉐이크",   "다이어트셰이크", 69900, 62900, 0.39),
    ("CRN-SHK-10", "크런치 단백질 셰이크 10회분",  "파우더",       "다이어트셰이크", 38900, 34900, 0.41),
    ("DRL-ACV-30", "닥터랩노쉬 ACV 구미 30일",    "건강기능식품", "건강기능식품",   15900, 13900, 0.36),
    ("GRN-CRN-01", "그래놀라 크런치",             "스낵",         "스낵",          10900,  6900, 0.45),
]

# 제품별 인기 가중치 (퍼펙트·맥스 단백질음료 강세)
POP_WEIGHT = {
    "PRO-PFT-12": 0.26, "PRO-MAX-12": 0.22, "SLM-SHK-35": 0.15,
    "PRO-MNI-06": 0.10, "SLM-SHK-21": 0.09, "CRN-SHK-10": 0.07,
    "DRL-ACV-30": 0.06, "GRN-CRN-01": 0.05,
}

# 슬림쉐이크 9종 맛 (실제 라인업: 초코·인절미·초당옥수수·얼그레이밀크티 등)
FLAVORS_SHK = ["초코", "인절미", "초당옥수수", "얼그레이밀크티", "딸기",
               "바나나", "흑임자", "녹차", "단호박"]
FLAVORS_DRK = ["오리지널", "초코", "바나나", "딸기", "커피"]

# ── 프로모션/기획전 정의 — ad_performance.csv·content와 연동 ───────────────
# 이정호 업무: 채널별 매출·광고비·이익. 기획전·라방 당일은 주문 수 자체가 튀어야
# 분석에서 급등일로 검출됨(일 총매출 +30%↑). day boost를 넉넉히.
PROMOS = [
    # (기획전명, 시작, 끝, 대상SKU, 일주문 부스트배율, 추가할인율, 집중채널)
    ("퍼펙트 리뉴얼 사전예약 오픈", date(2026,5,2),  date(2026,5,4),
        ["PRO-PFT-12"], 3.6, 0.10, "자사몰"),
    ("쿠팡 골드박스 단백질 위크",   date(2026,5,9),  date(2026,5,11),
        ["PRO-MAX-12","PRO-PFT-12"], 4.0, 0.12, "쿠팡"),
    ("슬림쉐이크 여름 다이어트전",   date(2026,5,17), date(2026,5,19),
        ["SLM-SHK-35","SLM-SHK-21"], 3.6, 0.13, "네이버스토어"),
    ("자사몰 회원의 날 라이브",     date(2026,5,27), date(2026,5,28),
        ["PRO-PFT-12","PRO-MAX-12","DRL-ACV-30"], 4.4, 0.10, "자사몰"),
]

START = date(2026, 5, 1)
END   = date(2026, 5, 31)

def daterange(a, b):
    d = a
    while d <= b:
        yield d
        d += timedelta(days=1)

def weighted_choice(d):
    keys = list(d.keys()); ws = list(d.values())
    return random.choices(keys, weights=ws, k=1)[0]

prod_by_sku = {p[0]: p for p in PRODUCTS}

def channel_price(sku, ch):
    p = prod_by_sku[sku]
    base = p[5]  # 자사몰판매가 기준
    return round(base * CHANNELS[ch]["price_factor"] / 100) * 100

# ── 1) product_master.csv ─────────────────────────────────────
with open(f"{OUT}/product_master.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["sku","제품명","라인","카테고리","정가","자사몰판매가","원가",
                "쿠팡수수료율","네이버수수료율","마켓컬리수수료율","무신사수수료율","자사몰수수료율"])
    for p in PRODUCTS:
        sku, name, line, cat, listp, ownp, costr = p
        cost = round(listp * costr / 100) * 100
        w.writerow([sku, name, line, cat, listp, ownp, cost,
                    CHANNELS["쿠팡"]["fee"], CHANNELS["네이버스토어"]["fee"],
                    CHANNELS["마켓컬리"]["fee"], CHANNELS["무신사"]["fee"],
                    CHANNELS["자사몰"]["fee"]])

# ── 2) sales.csv (주문 라인) ──────────────────────────────────
seq = {}
rows = []
def next_id(chcode, d):
    key = (chcode, d.strftime("%y%m%d"))
    seq[key] = seq.get(key, 0) + 1
    return f"{chcode}-{d.strftime('%y%m%d')}-{seq[key]:03d}"

REGIONS = ["서울","경기","부산","인천","대구","대전","광주","기타"]
ORDER_STATUS = ["결제완료","배송완료","배송완료","배송완료","교환","환불"]

# 배송비: 단백질 음료는 무게 있어 채널 정책 다름 (자사몰 무료배송 임계, 쿠팡 로켓 등)
def ship_fee(ch, amount):
    if ch == "쿠팡":     return 0      # 로켓배송 흡수
    if ch == "자사몰":   return 0 if amount >= 30000 else 3000
    if ch == "네이버스토어": return 0 if amount >= 40000 else 3000
    if ch == "마켓컬리": return 0      # 샛별배송 단가 흡수
    if ch == "무신사":   return 0 if amount >= 50000 else 3000
    return 3000

for d in daterange(START, END):
    wd = d.weekday()
    day_factor = 1.0
    if wd >= 5: day_factor *= 1.12          # 주말 약간↑
    if d.day in (1, 11, 21):  day_factor *= 1.10  # 월초·페이데이 약간↑
    active_promos = [pm for pm in PROMOS if pm[1] <= d <= pm[2]]
    boost = 1.0
    promo_skus = set()
    focus_ch = None
    for pm in active_promos:
        boost = max(boost, pm[4])
        promo_skus |= set(pm[3])
        focus_ch = pm[6]
    base_orders = int(random.gauss(34, 5) * day_factor * boost)
    base_orders = max(14, base_orders)
    if active_promos:                       # 기획전일 하한: RNG 변동이 +30% 검출을 깨지 않게
        base_orders = max(base_orders, int(34 * 1.7))

    for _ in range(base_orders):
        # 기획전 중이면 집중채널로 쏠림(라방·골드박스 등 채널 한정 프로모)
        if focus_ch and random.random() < 0.6:
            ch = focus_ch
        else:
            ch = weighted_choice({k: v["weight"] for k, v in CHANNELS.items()})
        chcode = CHANNELS[ch]["code"]
        oid = next_id(chcode, d)
        region = random.choice(REGIONS)
        status = random.choices(ORDER_STATUS, weights=[10,40,40,4,3,3], k=1)[0]
        n_lines = random.choices([1,2,3], weights=[68,26,6], k=1)[0]
        order_amount = 0
        order_lines = []
        for _l in range(n_lines):
            if promo_skus and random.random() < 0.74:
                sku = random.choice(list(promo_skus))
            else:
                sku = weighted_choice(POP_WEIGHT)
            p = prod_by_sku[sku]
            qty = random.choices([1,2], weights=[84,16], k=1)[0]
            unit = channel_price(sku, ch)
            extra_disc = 0.0
            for pm in active_promos:
                if sku in pm[3]:
                    extra_disc = max(extra_disc, pm[5])
            sale_unit = round(unit * (1 - extra_disc) / 100) * 100
            if p[2] == "슬림쉐이크":
                flavor = random.choice(FLAVORS_SHK)
            elif p[2] == "프로틴드링크":
                flavor = random.choice(FLAVORS_DRK)
            else:
                flavor = "-"
            promo_name = ""
            for pm in active_promos:
                if sku in pm[3]:
                    promo_name = pm[0]; break
            order_amount += qty * sale_unit
            order_lines.append([oid, d.isoformat(), ch, sku, p[1], flavor, qty,
                                sale_unit, qty*sale_unit, status, region, promo_name])
        sf = ship_fee(ch, order_amount)
        for ln in order_lines:
            ln.insert(12, sf if ln is order_lines[0] else 0)  # 배송비는 주문 첫 라인에만
            rows.append(ln)

with open(f"{OUT}/sales.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["order_id","주문일","채널","sku","제품명","맛","수량",
                "판매단가","판매금액","주문상태","배송지역","기획전","배송비"])
    for r in sorted(rows, key=lambda x: (x[1], x[0])):
        w.writerow(r)

# ── 3) ad_performance.csv (채널별 일자별 광고 성과 — ROAS) ──────────────
# 온라인MD JD: "채널 매체광고 운영관리". 기획전 집중일에 광고비도 집중.
# 채널 → 매체 매핑
AD_MEDIA = {
    "자사몰":     "메타(인스타/페북)",
    "쿠팡":       "쿠팡애즈",
    "네이버스토어": "네이버 쇼핑검색광고",
    "마켓컬리":   "컬리 큐레이션광고",
    "무신사":     "무신사 부스트",
}
# 채널별 기본 일광고비(원) + 기본 ROAS
AD_BASE = {
    "자사몰":     (450000, 4.2),
    "쿠팡":       (700000, 3.1),
    "네이버스토어": (380000, 4.8),
    "마켓컬리":   (180000, 2.4),
    "무신사":     (150000, 2.9),
}
ad_rows = []
for d in daterange(START, END):
    active = [pm for pm in PROMOS if pm[1] <= d <= pm[2]]
    focus = {pm[6] for pm in active}
    for ch, (base_spend, base_roas) in AD_BASE.items():
        spend = base_spend * random.uniform(0.85, 1.15)
        roas = base_roas * random.uniform(0.9, 1.1)
        if ch in focus:                 # 기획전 집중채널: 광고비↑·ROAS↑(전환 좋음)
            spend *= random.uniform(1.8, 2.4)
            roas  *= random.uniform(1.15, 1.4)
        spend = int(round(spend / 1000) * 1000)
        rev = int(round(spend * roas / 1000) * 1000)
        clicks = int(spend / random.uniform(550, 850))
        ad_rows.append([d.isoformat(), ch, AD_MEDIA[ch], spend, rev,
                        round(rev / spend, 2), clicks])

with open(f"{OUT}/ad_performance.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["날짜","채널","매체","광고비","광고기여매출","ROAS","클릭수"])
    for r in ad_rows:
        w.writerow(r)

# ── 4) inventory.csv (재고) ───────────────────────────────────
# 잘 나가는데 재고 바닥인 SKU 의도 배치 (베스트셀러 결품 위험)
# 단백질 음료는 유통기한·생산 리드타임 있음
INV_OVERRIDE = {
    "PRO-PFT-12": 420,   # 베스트셀러인데 사전예약 완판 후 재고 적음 → 경보
    "PRO-MAX-12": 680,
    "SLM-SHK-35": 5200,  # 과재고(여름전 대량입고)
    "GRN-CRN-01": 3100,  # 과재고(스낵 회전 느림)
}
with open(f"{OUT}/inventory.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["sku","제품명","현재고","입고예정","입고리드타임(일)","유통기한(D-)"])
    for p in PRODUCTS:
        sku = p[0]
        stock = INV_OVERRIDE.get(sku, random.randint(1500, 6000))
        incoming = random.choice([0, 0, 1000, 2000, 3000])
        lead = random.choice([14, 21, 30])      # 식품 생산 리드타임
        expiry = random.choice([120, 180, 240, 300, 365])
        w.writerow([sku, p[1], stock, incoming, lead, expiry])

print("생성 완료: product_master.csv, sales.csv, ad_performance.csv, inventory.csv")
print(f"sales 라인 수: {len(rows)}")
