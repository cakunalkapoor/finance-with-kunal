#!/usr/bin/env python3
"""
Fetch heatmap constituents for ALL 10 indices from Yahoo Finance via yfinance
and compute WEEKLY % change for each ticker.

Indices covered (10):
  US:      S&P 500, NASDAQ 100
  Canada:  S&P/TSX
  UK:      FTSE 100
  Germany: DAX
  France:  CAC 40
  India:   NIFTY 50
  Japan:   Nikkei 225
  China:   Shanghai Composite
  Korea:   KOSPI

Yahoo ticker suffixes by market:
  US      → (none)             e.g. NVDA, BRK-B   (share classes use hyphen)
  TSX     → .TO                e.g. RY.TO, TECK-B.TO
  NSE     → .NS                e.g. RELIANCE.NS
  LSE     → .L                 e.g. SHEL.L
  XETRA   → .DE                e.g. SAP.DE
  PARIS   → .PA                e.g. MC.PA (LVMH)
  TSE     → .T                 e.g. 7203.T (Toyota)
  SSE     → .SS                e.g. 600519.SS (Moutai)
  KRX     → .KS                e.g. 005930.KS (Samsung)

Output: src/lib/heatmap-data.json
Run:    npm run fetch:heatmap
"""

import json
import time
from pathlib import Path

import yfinance as yf
import pandas as pd

PROJECT = Path(__file__).resolve().parent.parent
OUT = PROJECT / "src" / "lib" / "heatmap-data.json"

# ──────────────────────────────────────────────────────────────────────────────
# S&P 500 — top constituents by GICS sector
# ──────────────────────────────────────────────────────────────────────────────
SP500 = {
    "Technology": ["NVDA","AAPL","MSFT","AVGO","ORCL","CRM","AMD","ADBE","CSCO","ACN",
                   "INTC","TXN","QCOM","IBM","NOW","INTU","AMAT","MU","ADI","LRCX"],
    "Communication": ["GOOGL","GOOG","META","NFLX","DIS","TMUS","CMCSA","T","VZ"],
    "Consumer Disc.": ["AMZN","TSLA","HD","MCD","NKE","LOW","SBUX","BKNG","TJX","ORLY"],
    "Financials": ["BRK.B","JPM","V","MA","BAC","WFC","GS","MS","AXP","SPGI","BLK","C","SCHW"],
    "Healthcare": ["LLY","UNH","JNJ","MRK","ABBV","TMO","ABT","PFE","DHR","AMGN","ISRG","CVS","BMY"],
    "Industrials": ["GE","CAT","RTX","HON","UNP","BA","LMT","DE","UPS","ETN","ADP"],
    "Consumer Staples": ["WMT","PG","COST","KO","PEP","PM","MDLZ","CL"],
    "Energy": ["XOM","CVX","COP","SLB","EOG"],
    "Utilities": ["NEE","SO","DUK","CEG"],
    "Materials": ["LIN","SHW","FCX","NEM"],
    "Real Estate": ["PLD","AMT","EQIX","WELL"],
}

# ──────────────────────────────────────────────────────────────────────────────
# NASDAQ 100 — tech-heavy, distinct names not in S&P 500
# ──────────────────────────────────────────────────────────────────────────────
NDX = {
    "Technology": ["NVDA","AAPL","MSFT","AVGO","META","GOOGL","AMZN","TSLA","NFLX","ADBE",
                   "CSCO","AMD","INTC","QCOM","TXN","INTU","AMAT","MU","ADI","LRCX",
                   "KLAC","MRVL","NXPI","MCHP","FTNT","CDNS","SNPS","CRWD","PANW","ASML",
                   "PYPL","TEAM","DDOG","WDAY","ADSK","ANSS"],
    "Communication": ["GOOG","CMCSA","TMUS","CHTR","ROKU"],
    "Consumer Disc.": ["BKNG","MAR","ABNB","MELI","ROST","ORLY","LULU","EBAY","ROST"],
    "Healthcare": ["AMGN","GILD","REGN","VRTX","ISRG","IDXX","ILMN","DXCM","MRNA","ZTS"],
    "Consumer Staples": ["COST","PEP","MNST","KDP","KHC","MDLZ"],
    "Industrials": ["HON","ADP","PAYX","CSX","PCAR","ODFL","FAST","CTAS"],
    "Utilities": ["AEP","EXC","XEL"],
}

# ──────────────────────────────────────────────────────────────────────────────
# S&P/TSX — major Canadian constituents
# ──────────────────────────────────────────────────────────────────────────────
TSX = {
    "Financials": ["RY","TD","BMO","BNS","CM","BN","MFC","SLF","NA","IFC","FFH","GWO","POW"],
    "Energy": ["ENB","CNQ","SU","TRP","CVE","IMO","TOU","PPL","ARX"],
    "Materials": ["AEM","WPM","NTR","ABX","FNV","TECK","FM","NGT","K"],
    "Industrials": ["CP","CNR","WCN","GIB.A","TFII","TIH"],
    "Technology": ["SHOP","CSU","OTEX","DSG"],
    "Consumer": ["ATD","QSR","DOL","L","WN","MRU"],
    "Telecom": ["BCE","T","RCI.B"],  # 'T' here = Telus
    "Utilities": ["FTS","H","EMA","AQN"],
    "Real Estate": ["CAR.UN","REI.UN"],
}

# ──────────────────────────────────────────────────────────────────────────────
# FTSE 100 — top UK constituents
# ──────────────────────────────────────────────────────────────────────────────
FTSE = {
    "Energy": ["SHEL","BP"],
    "Pharma": ["AZN","GSK"],
    "Materials": ["RIO","BHP","AAL","GLEN","ANTO","CRH"],
    "Financials": ["HSBA","LLOY","BARC","NWG","STAN","PRU","LSE","LGEN","AV.","III"],
    "Consumer Staples": ["ULVR","DGE","BATS","IMB","RKT","TSCO","ABF","CPG"],
    "Industrials": ["BA.","RR.","EXPN","FERG","IHG","MNG"],
    "Telecom": ["VOD","BT.A"],
    "Utilities": ["NG.","SVT","UU."],
    "Consumer Disc.": ["NXT","JD.","WMH"],
    "Real Estate": ["LAND","BLND","SGRO"],
    "Technology": ["SGE","AVST"],
    "Healthcare": ["SN.","HIK"],
}

# ──────────────────────────────────────────────────────────────────────────────
# DAX — all 40 Germany constituents
# ──────────────────────────────────────────────────────────────────────────────
DAX = {
    "Technology": ["SAP","IFX","SHL"],
    "Industrials": ["SIE","AIR","MTX","RHM","HEI","CON","HNR1"],
    "Consumer Disc.": ["MBG","BMW","VOW3","P911","ADS","ZAL"],
    "Financials": ["ALV","MUV2","DBK","HNR1"],
    "Consumer Staples": ["BEI","HEN3","SY1"],
    "Healthcare": ["BAYN","FRE","FME","MRK","QGEN","SRT3","BNR"],
    "Materials": ["BAS","HEN3","EVK","1COV","SDF"],
    "Telecom": ["DTE"],
    "Utilities": ["RWE","EOAN","ENR"],
    "Real Estate": ["VNA"],
    "Logistics": ["DPW","DHL"],
}

# ──────────────────────────────────────────────────────────────────────────────
# CAC 40 — French constituents (all 40, .PA suffix)
# ──────────────────────────────────────────────────────────────────────────────
CAC = {
    "Luxury": ["MC","KER","RMS","EL"],   # LVMH, Kering, Hermes, EssilorLuxottica
    "Energy": ["TTE","ENGI"],
    "Consumer": ["OR","BN","RI","CA"],   # L'Oreal, Danone, Pernod Ricard, Carrefour
    "Industrials": ["AIR","SAF","SU","DG","ML","VIE","STMPA","HO","LR","SGO"],
    "Healthcare": ["SAN"],
    "Financials": ["BNP","CS","GLE","ACA","AMUN"],
    "Technology": ["CAP","DSY","STMPA","ATO","PUB","WLN"],
    "Auto": ["STLAP","RNO"],
    "Materials": ["AI"],   # Air Liquide
    "Real Estate": ["URW"],
    "Telecom": ["ORA"],
    "Media": ["VIV"],
}

# ──────────────────────────────────────────────────────────────────────────────
# NIFTY 50 — all 50 Indian constituents
# ──────────────────────────────────────────────────────────────────────────────
NIFTY50 = {
    "Financials": ["HDFCBANK","ICICIBANK","KOTAKBANK","SBIN","AXISBANK","BAJFINANCE",
                   "BAJAJFINSV","INDUSINDBK","SBILIFE","HDFCLIFE"],
    "IT": ["INFY","TCS","HCLTECH","WIPRO","TECHM","LTIM"],
    "Energy": ["RELIANCE","NTPC","ONGC","POWERGRID","COALINDIA","BPCL"],
    "Consumer": ["ITC","HINDUNILVR","TITAN","ASIANPAINT","NESTLEIND","TATACONSUM","BRITANNIA"],
    "Auto": ["TATAMOTORS","MARUTI","M&M","BAJAJ-AUTO","EICHERMOT","HEROMOTOCO"],
    "Materials": ["ULTRACEMCO","TATASTEEL","JSWSTEEL","HINDALCO","GRASIM","UPL"],
    "Pharma": ["SUNPHARMA","DRREDDY","CIPLA","DIVISLAB","APOLLOHOSP"],
    "Industrials": ["LT","ADANIPORTS","ADANIENT"],
    "Telecom": ["BHARTIARTL"],
}

# ──────────────────────────────────────────────────────────────────────────────
# Nikkei 225 — top Japanese constituents (numeric Yahoo tickers, .T suffix)
# Top 50 by weight: Fast Retailing (9983), Tokyo Electron (8035), etc.
# ──────────────────────────────────────────────────────────────────────────────
NIKKEI = {
    "Consumer Disc.": ["9983","7203","7267","7270","9024","3382"],     # Uniqlo, Toyota, Honda, Subaru, Seven&i, MUFG
    "Technology": ["8035","6857","6758","6861","6981","6098","6594","7974","6701","4063","6273","4519"],
    # Tokyo Electron, Advantest, Sony, Keyence, Murata, Recruit, Nidec, Nintendo, NEC, Shin-Etsu, SMC, Chugai
    "Financials": ["8306","8316","8411","8766","8591","8053"],         # MUFG, SMFG, Mizuho, Tokio Marine, ORIX, Sumitomo Corp
    "Industrials": ["6367","7011","6326","6981","6503","7741","6645","7751"],
    # Daikin, Mitsubishi Heavy, Kubota, Murata, Mitsubishi Elec, Hoya, Omron, Canon
    "Healthcare": ["4502","4543"],                                     # Takeda, Terumo
    "Telecom": ["9984","9433","9432"],                                 # SoftBank, KDDI, NTT
    "Energy": ["5020","5108"],                                          # ENEOS, Bridgestone
    "Trading": ["8001","8002","8058","8031"],                          # Itochu, Marubeni, Mitsubishi Corp, Mitsui
    "Utilities": ["9020","9501"],                                       # JR East, TEPCO
}

# ──────────────────────────────────────────────────────────────────────────────
# Shanghai Composite — top Chinese A-share constituents (numeric, .SS suffix)
# ──────────────────────────────────────────────────────────────────────────────
SSE = {
    "Banks": ["601398","601288","601988","600036","601166","601658","600000","601169","601229"],
    # ICBC, AgBk, BoC, CMB, Industrial, Postal Savings, SPDB, Bank of Beijing, Bank of Shanghai
    "Energy": ["601857","600028","601088"],                            # PetroChina, Sinopec, China Shenhua
    "Consumer Staples": ["600519","603288","600276","600887","600438","600600"],
    # Moutai, Haitian, Hengrui, Yili, Tongwei, Tsingtao
    "Insurance": ["601318","601628","601336","601319"],                # Ping An, China Life, New China Life, PICC
    "Industrials": ["601668","601800","601766","601989","600009"],     # CSCEC, CCCC, CRRC, CSSC, Shanghai Airport
    "Materials": ["600585","600547","603799","600188"],                # Anhui Conch, Shandong Gold, Huayou Cobalt, Yankuang
    "Tech": ["601138","600703","603501"],                              # Foxconn, San'an Optoelectronics, Will Semiconductor
    "Real Estate": ["600048","601155"],                                # Poly Real Estate, Shanghai Pudong
    "Pharma": ["600196","603259"],                                     # Fosun Pharma, Wuxi AppTec
}

# ──────────────────────────────────────────────────────────────────────────────
# TWSE / TAIEX — top Taiwanese constituents (4-digit codes, .TW suffix)
# Heavy concentration: TSMC alone is ~35% of the index.
# ──────────────────────────────────────────────────────────────────────────────
TWSE = {
    "Semiconductors": ["2330","2454","2303","3034","3711","2474","6488","3661"],
    # TSMC, MediaTek, UMC, Novatek, ASE Tech, Catcher, Phison, Wiwynn
    "Tech Hardware": ["2317","2308","2382","2357","3008","2354","2412"],
    # Hon Hai (Foxconn), Delta Elec, Quanta, Asustek, Largan, Foxconn Tech, Chunghwa Tel
    "Financials": ["2881","2882","2891","2885","2884","2886","2880","2883","2887","5880"],
    # Fubon FH, Cathay FH, CTBC FH, Yuanta FH, E.Sun FH, Mega FH, Hua Nan FH, China Dev FH, Taishin FH, Taiwan Coop FH
    "Telecom": ["3045","4904"],                  # Taiwan Mobile, Far EasTone
    "Materials": ["1301","1303","2002","6505"],  # Formosa Plastics, Nan Ya Plastics, China Steel, Formosa Petrochem
    "Consumer": ["1216","2912","2207","2105"],   # Uni-President, President Chain Store, Hotai Motor, Cheng Shin Rubber
    "Shipping": ["2603","2615","2609"],          # Evergreen Marine, Wan Hai Lines, Yang Ming Marine
}
# ──────────────────────────────────────────────────────────────────────────────
# KOSPI — top Korean constituents (numeric with leading zeros, .KS suffix)
# ──────────────────────────────────────────────────────────────────────────────
KOSPI = {
    "Technology": ["005930","000660","005935","034220","011070"],
    # Samsung Electronics, SK Hynix, Samsung Elec Pfd, LG Display, LG Innotek
    "Auto": ["005380","000270","012330","011200"],                     # Hyundai, Kia, Hyundai Mobis, HMM
    "Healthcare": ["207940","068270","068760"],                        # Samsung Biologics, Celltrion, Celltrion Pharm
    "Financials": ["105560","055550","086790","316140","138930"],     # KB Fin, Shinhan, Hana, Woori, BNK
    "Industrials": ["028260","042660","028050","034730"],              # Samsung C&T, Hanwha Ocean, Samsung Heavy, SK Holdings
    "Materials": ["005490","051910","006400","003670","010130"],
    # POSCO, LG Chem, Samsung SDI, POSCO Future M, Korea Zinc
    "Internet": ["035720","035420"],                                    # Kakao, NAVER
    "Telecom": ["017670","030200"],                                     # SK Telecom, KT
    "Energy": ["096770","034220"],                                      # SK Innovation, LG Display (dup OK)
    "Consumer": ["066570","003550","000810","097950"],                  # LG Electronics, LG Corp, Samsung F&M, CJ CheilJedang
}

# ──────────────────────────────────────────────────────────────────────────────
# Logical → Yahoo symbol mapping (one per market)
# ──────────────────────────────────────────────────────────────────────────────
def yahoo_us(t):  return t.replace(".", "-")           # BRK.B → BRK-B
def yahoo_nse(t): return t + ".NS"
def yahoo_jp(t):  return t + ".T"
def yahoo_sse(t): return t + ".SS"
def yahoo_kr(t):  return t + ".KS"
def yahoo_tw(t):  return t + ".TW"

TSX_OVERRIDES = {"TECK": "TECK-B.TO"}
def yahoo_tsx(t):
    if t in TSX_OVERRIDES: return TSX_OVERRIDES[t]
    return t.replace(".", "-") + ".TO"

FTSE_OVERRIDES = {"BT.A": "BT-A.L"}
def yahoo_ftse(t):
    if t in FTSE_OVERRIDES: return FTSE_OVERRIDES[t]
    return t.replace(".", "-") + ".L"

def yahoo_de(t):  return t + ".DE"
def yahoo_pa(t):  return t + ".PA"

# ──────────────────────────────────────────────────────────────────────────────
# Fetch + compute weekly change
# ──────────────────────────────────────────────────────────────────────────────
def fetch_batch(yahoo_symbols, label):
    print(f"\n{label}: fetching {len(yahoo_symbols)} tickers in batch...", flush=True)
    data = yf.download(
        tickers=" ".join(yahoo_symbols),
        period="1mo",
        interval="1d",
        group_by="ticker",
        auto_adjust=False,
        progress=False,
        threads=True,
    )
    out = {}
    for sym in yahoo_symbols:
        try:
            df = data[sym] if isinstance(data.columns, pd.MultiIndex) else data
            closes = df["Close"].dropna()
            if len(closes) < 2:
                out[sym] = {"ok": False, "reason": "no closes"}; continue
            last = float(closes.iloc[-1])
            wk_idx = max(0, len(closes) - 1 - 5)
            wk_ago = float(closes.iloc[wk_idx])
            wk_pct = ((last - wk_ago) / wk_ago * 100) if wk_ago else 0.0
            out[sym] = {
                "ok": True,
                "price": round(last, 2),
                "weekChange": round(wk_pct, 2),
                "asOf": closes.index[-1].strftime("%Y-%m-%d"),
            }
        except Exception as e:
            out[sym] = {"ok": False, "reason": str(e)[:80]}
    return out

def process_index(name, sectors_dict, map_fn):
    logical = []
    for sector, tickers in sectors_dict.items():
        for t in tickers:
            logical.append((sector, t, map_fn(t)))
    yahoo_syms = [m for _, _, m in logical]
    quotes = fetch_batch(yahoo_syms, name)
    result = {}
    ok_count = fail_count = 0
    for sector, ticker, yahoo_sym in logical:
        q = quotes.get(yahoo_sym, {"ok": False, "reason": "missing"})
        if q.get("ok"):
            ok_count += 1
            result.setdefault(sector, []).append({
                "ticker": ticker, "yahoo": yahoo_sym,
                "weekChange": q["weekChange"], "price": q["price"], "asOf": q["asOf"],
            })
        else:
            fail_count += 1
            result.setdefault(sector, []).append({
                "ticker": ticker, "yahoo": yahoo_sym,
                "weekChange": 0.0, "price": None, "asOf": None,
            })
    print(f"  {name}: {ok_count} ✓ · {fail_count} ✗  (failed → 0% default)")
    return result

# ──────────────────────────────────────────────────────────────────────────────
# Main — fetch all 10 indices
# ──────────────────────────────────────────────────────────────────────────────
def main():
    t0 = time.time()
    sp500_data  = process_index("S&P 500",         SP500,    yahoo_us)
    ndx_data    = process_index("NASDAQ 100",      NDX,      yahoo_us)
    tsx_data    = process_index("S&P/TSX",         TSX,      yahoo_tsx)
    ftse_data   = process_index("FTSE 100",        FTSE,     yahoo_ftse)
    dax_data    = process_index("DAX",             DAX,      yahoo_de)
    cac_data    = process_index("CAC 40",          CAC,      yahoo_pa)
    nifty_data  = process_index("NIFTY 50",        NIFTY50,  yahoo_nse)
    nikkei_data = process_index("Nikkei 225",      NIKKEI,   yahoo_jp)
    sse_data    = process_index("Shanghai Comp.",  SSE,      yahoo_sse)
    kospi_data  = process_index("KOSPI",           KOSPI,    yahoo_kr)
    twse_data   = process_index("TAIEX (TWSE)",    TWSE,     yahoo_tw)

    output = {
        "fetchedAt": pd.Timestamp.now(tz="UTC").isoformat(),
        "source": "Yahoo Finance via yfinance",
        "metric": "weekChange",
        "indices": {
            "sp500": sp500_data, "ndx": ndx_data, "tsx": tsx_data,
            "ftse": ftse_data, "dax": dax_data, "cac": cac_data,
            "nifty50": nifty_data, "nikkei": nikkei_data,
            "sse": sse_data, "kospi": kospi_data, "twse": twse_data,
        },
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w") as f:
        json.dump(output, f, indent=2)
    total = sum(len(v) for idx in output["indices"].values() for v in idx.values())
    print(f"\n✓ wrote {OUT.relative_to(PROJECT)}")
    print(f"  total tickers: {total}  ·  elapsed: {time.time()-t0:.1f}s")

if __name__ == "__main__":
    main()
