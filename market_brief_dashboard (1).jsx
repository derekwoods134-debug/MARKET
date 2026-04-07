import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bitcoin,
  Clock3,
  Gauge,
  Mail,
  Newspaper,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Waves,
} from "lucide-react";

type SectorMove = {
  sector: string;
  symbol: string;
  changePercent: number;
};

type Headline = {
  title: string;
  source: string;
};

type MarketStat = {
  name: string;
  symbol: string;
  value: string;
  changePercent: number;
};

type WatchItem = {
  symbol: string;
  price: string;
  changePercent: number;
};

const defaultSectors: SectorMove[] = [
  { sector: "Technology", symbol: "XLK", changePercent: 1.42 },
  { sector: "Financials", symbol: "XLF", changePercent: 0.91 },
  { sector: "Industrials", symbol: "XLI", changePercent: 0.54 },
  { sector: "Health Care", symbol: "XLV", changePercent: 0.21 },
  { sector: "Utilities", symbol: "XLU", changePercent: -0.44 },
  { sector: "Real Estate", symbol: "XLRE", changePercent: -0.78 },
  { sector: "Energy", symbol: "XLE", changePercent: -1.11 },
];

const defaultHeadlines: Headline[] = [
  { title: "Stocks rise as traders react to fresh inflation data", source: "MarketWatch" },
  { title: "Chip stocks lead gains after stronger semiconductor demand signals", source: "Reuters" },
  { title: "Treasury yields ease as rate cut expectations firm up", source: "Bloomberg" },
  { title: "Banks edge higher while energy lags the broad market", source: "CNBC" },
];

const defaultMarketStats: MarketStat[] = [
  { name: "S&P 500", symbol: "SPY", value: "518.22", changePercent: 0.64 },
  { name: "Nasdaq 100", symbol: "QQQ", value: "443.19", changePercent: 1.08 },
  { name: "Russell 2000", symbol: "IWM", value: "202.75", changePercent: -0.19 },
  { name: "VIX", symbol: "VIX", value: "14.82", changePercent: -3.21 },
  { name: "10Y Yield", symbol: "US10Y", value: "4.12%", changePercent: -0.72 },
  { name: "Bitcoin", symbol: "BTC", value: "$68,410", changePercent: 2.34 },
];

const defaultWatchlist: WatchItem[] = [
  { symbol: "AAPL", price: "$211.40", changePercent: 0.72 },
  { symbol: "MSFT", price: "$428.31", changePercent: 1.14 },
  { symbol: "NVDA", price: "$918.44", changePercent: 2.88 },
  { symbol: "AMD", price: "$171.62", changePercent: 1.92 },
  { symbol: "AMZN", price: "$182.90", changePercent: -0.22 },
  { symbol: "TSLA", price: "$167.21", changePercent: -1.36 },
];

function formatPct(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function toneFromMarket(stats: MarketStat[], sectors: SectorMove[]) {
  const spy = stats.find((item) => item.symbol === "SPY")?.changePercent ?? 0;
  const qqq = stats.find((item) => item.symbol === "QQQ")?.changePercent ?? 0;
  const vix = stats.find((item) => item.symbol === "VIX")?.changePercent ?? 0;
  const averageSector = sectors.reduce((sum, item) => sum + item.changePercent, 0) / sectors.length;

  if (spy > 0 && qqq > 0 && vix < 0 && averageSector > 0) return "Risk on";
  if (spy < 0 && qqq < 0 && vix > 0) return "Risk off";
  return "Mixed";
}

function buildSummary(
  email: string,
  sectors: SectorMove[],
  headlines: Headline[],
  stats: MarketStat[],
  watchlist: WatchItem[]
) {
  const sorted = [...sectors].sort((a, b) => b.changePercent - a.changePercent);
  const leaders = sorted.slice(0, 3);
  const laggards = sorted.slice(-3).reverse();
  const topWatch = [...watchlist].sort((a, b) => b.changePercent - a.changePercent).slice(0, 2);
  const weakWatch = [...watchlist].sort((a, b) => a.changePercent - b.changePercent).slice(0, 2);
  const marketTone = toneFromMarket(stats, sectors);

  return `Hourly Market Brief\n\nRecipient: ${email || "Not set"}\nTone: ${marketTone}\n\nIndex snapshot:\n${stats
    .slice(0, 4)
    .map((item) => `${item.name} ${item.value} (${formatPct(item.changePercent)})`)
    .join("\n")}\n\nSector leaders:\n${leaders
    .map((s) => `${s.sector} (${formatPct(s.changePercent)})`)
    .join("\n")}\n\nSector laggards:\n${laggards
    .map((s) => `${s.sector} (${formatPct(s.changePercent)})`)
    .join("\n")}\n\nTop market drivers:\n${headlines
    .map((h, i) => `${i + 1}. ${h.title} (${h.source})`)
    .join("\n")}\n\nWatchlist leaders:\n${topWatch.map((w) => `${w.symbol} (${formatPct(w.changePercent)})`).join(", ")}\nWatchlist laggards:\n${weakWatch.map((w) => `${w.symbol} (${formatPct(w.changePercent)})`).join(", ")}\n\nRead on the tape:\nLeadership is strongest in the top sectors above. Use breadth, volatility, and rate moves to decide whether this move looks durable or narrow.`;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white shadow-sm border border-slate-200 ${className}`}>{children}</div>;
}

function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-6 pb-6 ${className}`}>{children}</div>;
}

function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`font-semibold text-slate-900 ${className}`}>{children}</h2>;
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-xl bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ${className}`}>{children}</span>;
}

function Button({
  children,
  onClick,
  variant = "solid",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "solid" | "outline";
}) {
  const classes =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      : "bg-slate-900 text-white hover:bg-slate-800";

  return (
    <button onClick={onClick} className={`inline-flex items-center rounded-2xl px-4 py-2 text-sm font-medium transition ${classes}`}>
      {children}
    </button>
  );
}

function TextInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
    />
  );
}

function TextArea({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[160px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
    />
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-slate-700">{children}</label>;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-slate-900" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

function Separator() {
  return <div className="h-px w-full bg-slate-200" />;
}

export default function MarketBriefDashboard() {
  const [recipientEmail, setRecipientEmail] = useState("you@example.com");
  const [senderEmail, setSenderEmail] = useState("alerts@yourdomain.com");
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [sendHour] = useState("Every hour");
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [headlines] = useState<Headline[]>(defaultHeadlines);
  const [sectors, setSectors] = useState<SectorMove[]>(defaultSectors);
  const [marketStats, setMarketStats] = useState<MarketStat[]>(defaultMarketStats);
  const [watchlist, setWatchlist] = useState<WatchItem[]>(defaultWatchlist);
  const [notes, setNotes] = useState(
    "Deploy this to Vercel. Replace the mock data fetch inside refreshData with calls to your own market endpoint. Add a scheduled function to send the summary every hour even when the browser is closed."
  );

  async function refreshData() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    setSectors((current) =>
      current.map((item, index) => ({
        ...item,
        changePercent: Number((item.changePercent + (index % 2 === 0 ? 0.08 : -0.05)).toFixed(2)),
      }))
    );

    setMarketStats((current) =>
      current.map((item, index) => ({
        ...item,
        changePercent: Number((item.changePercent + (index % 2 === 0 ? 0.09 : -0.06)).toFixed(2)),
      }))
    );

    setWatchlist((current) =>
      current.map((item, index) => ({
        ...item,
        changePercent: Number((item.changePercent + (index % 2 === 0 ? 0.11 : -0.09)).toFixed(2)),
      }))
    );

    setApiConnected(true);
    setLoading(false);
  }

  useEffect(() => {
    refreshData();
  }, []);

  const leaders = useMemo(
    () => [...sectors].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3),
    [sectors]
  );

  const laggards = useMemo(
    () => [...sectors].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3),
    [sectors]
  );

  const summary = useMemo(
    () => buildSummary(recipientEmail, sectors, headlines, marketStats, watchlist),
    [recipientEmail, sectors, headlines, marketStats, watchlist]
  );

  const tone = useMemo(() => toneFromMarket(marketStats, sectors), [marketStats, sectors]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl tracking-tight">Market Pulse</CardTitle>
                    <p className="mt-1 text-sm text-slate-600">
                      Website ready market dashboard with live summary blocks and hourly email controls.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>Website app</Badge>
                  <Badge>{tone}</Badge>
                  <Badge>{apiConnected ? "Data connected" : "Mock data"}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Recipient email</Label>
                  <TextInput value={recipientEmail} onChange={setRecipientEmail} />
                </div>
                <div className="space-y-2">
                  <Label>Sender email</Label>
                  <TextInput value={senderEmail} onChange={setSenderEmail} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <Toggle checked={scheduleEnabled} onChange={setScheduleEnabled} />
                  <span className="text-sm font-medium">Hourly auto send</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock3 className="h-4 w-4" />
                  <span>{sendHour}</span>
                </div>
                <Button>Save settings</Button>
                <Button variant="outline" onClick={refreshData}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {marketStats.map((item) => (
                  <div key={item.symbol} className="rounded-2xl bg-slate-100 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">{item.symbol}</div>
                    <div className="mt-2 text-lg font-semibold">{item.name}</div>
                    <div className="mt-1 text-2xl font-semibold">{item.value}</div>
                    <div className={`mt-2 text-sm ${item.changePercent >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatPct(item.changePercent)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Mail className="h-5 w-5" />
                Delivery and setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Next send</span>
                  <Badge>1:00 PM</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-700">
                  Deploy this as a site, then add an hourly cron route for email delivery.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-4">
                <div className="text-sm text-slate-600">Recommended pieces</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge>Next.js</Badge>
                  <Badge>Vercel</Badge>
                  <Badge>Cron job</Badge>
                  <Badge>Resend</Badge>
                  <Badge>Market API</Badge>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-100 p-4">
                <Label>Build note</Label>
                <div className="mt-2">
                  <TextArea value={notes} onChange={setNotes} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_0.8fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Sector leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-slate-100 p-4">
                <div className="mb-3 flex items-center gap-2 text-base font-semibold">
                  <TrendingUp className="h-4 w-4" />
                  Strongest sectors
                </div>
                <div className="space-y-3">
                  {leaders.map((item) => (
                    <div key={item.symbol} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
                      <div>
                        <div className="font-medium">{item.sector}</div>
                        <div className="text-xs text-slate-500">{item.symbol}</div>
                      </div>
                      <Badge>{formatPct(item.changePercent)}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-100 p-4">
                <div className="mb-3 flex items-center gap-2 text-base font-semibold">
                  <TrendingDown className="h-4 w-4" />
                  Weakest sectors
                </div>
                <div className="space-y-3">
                  {laggards.map((item) => (
                    <div key={item.symbol} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
                      <div>
                        <div className="font-medium">{item.sector}</div>
                        <div className="text-xs text-slate-500">{item.symbol}</div>
                      </div>
                      <Badge>{formatPct(item.changePercent)}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">What else to track</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4" /> Volatility</div>
                  <p className="mt-2 text-sm text-slate-600">VIX tells you whether fear is rising or easing.</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="flex items-center gap-2 font-semibold"><Waves className="h-4 w-4" /> Rates</div>
                  <p className="mt-2 text-sm text-slate-600">The 10 year yield helps explain pressure on growth stocks and banks.</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="flex items-center gap-2 font-semibold"><Bitcoin className="h-4 w-4" /> Crypto and risk</div>
                  <p className="mt-2 text-sm text-slate-600">Bitcoin often gives another signal for risk appetite.</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4" /> Breadth</div>
                  <p className="mt-2 text-sm text-slate-600">Advancers versus decliners show whether the move is broad or narrow.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Summary and watchlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-slate-100 p-4">
                <div className="mb-3 flex items-center gap-2 text-base font-semibold">
                  <Newspaper className="h-4 w-4" />
                  Headlines
                </div>
                <div className="space-y-3">
                  {headlines.map((headline, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="font-medium">{headline.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{headline.source}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-100 p-4">
                <div className="mb-3 text-base font-semibold">Watchlist</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {watchlist.map((item) => (
                    <div key={item.symbol} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="font-medium">{item.symbol}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.price}</div>
                      <div className={`mt-2 text-sm ${item.changePercent >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {formatPct(item.changePercent)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="rounded-2xl bg-slate-950 p-4 text-slate-50 shadow-sm">
                <div className="mb-3 text-sm uppercase tracking-wide text-slate-300">Email preview</div>
                <pre className="whitespace-pre-wrap text-sm leading-6">{summary}</pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
