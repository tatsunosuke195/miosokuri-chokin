import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "miosokuri-chokin-app-v1";

function yen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

type Goal = {
  name: string;
  amount: number;
};

type Entry = {
  id: string;
  item: string;
  amount: number;
  date: string;
  memo: string;
};

type PersistedState = {
  goal: Goal;
  entries: Entry[];
};

const todayString = () => new Date().toISOString().slice(0, 10);

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "16px",
    color: "#0f172a",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  } as React.CSSProperties,
  container: {
    maxWidth: "440px",
    margin: "0 auto",
  } as React.CSSProperties,
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  } as React.CSSProperties,
  title: {
    fontSize: "28px",
    fontWeight: 800,
    margin: 0,
    letterSpacing: "-0.02em",
  } as React.CSSProperties,
  subtitle: {
    fontSize: "14px",
    color: "#475569",
    marginTop: "6px",
    marginBottom: 0,
  } as React.CSSProperties,
  iconBox: {
    width: "52px",
    height: "52px",
    borderRadius: "18px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
  } as React.CSSProperties,
  card: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "18px",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
    marginBottom: "16px",
  } as React.CSSProperties,
  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: "14px",
  } as React.CSSProperties,
  sectionBox: {
    background: "#f1f5f9",
    borderRadius: "20px",
    padding: "16px",
    border: "1px solid #e2e8f0",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: "13px",
    color: "#334155",
    marginBottom: "6px",
    fontWeight: 600,
  } as React.CSSProperties,
  input: {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "16px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    padding: "12px 14px",
    fontSize: "16px",
    outline: "none",
  } as React.CSSProperties,
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "16px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    padding: "12px 14px",
    fontSize: "16px",
    minHeight: "96px",
    resize: "vertical",
    outline: "none",
  } as React.CSSProperties,
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  } as React.CSSProperties,
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "14px",
  } as React.CSSProperties,
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "4px",
  } as React.CSSProperties,
  statValue: {
    fontSize: "24px",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  } as React.CSSProperties,
  progressRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "14px",
    marginBottom: "8px",
    color: "#475569",
  } as React.CSSProperties,
  progressTrack: {
    width: "100%",
    height: "12px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
  } as React.CSSProperties,
  progressFill: {
    height: "100%",
    background: "#0f172a",
    borderRadius: "999px",
    transition: "width 0.3s ease",
  } as React.CSSProperties,
  achieveBox: {
    marginTop: "16px",
    borderRadius: "18px",
    background: "#0f172a",
    color: "#ffffff",
    padding: "16px",
  } as React.CSSProperties,
  achieveTitle: {
    fontSize: "30px",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    margin: 0,
  } as React.CSSProperties,
  achieveSub: {
    fontSize: "14px",
    color: "#cbd5e1",
    marginTop: "6px",
    marginBottom: 0,
  } as React.CSSProperties,
  saveNotice: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#64748b",
  } as React.CSSProperties,
  button: {
    width: "100%",
    height: "46px",
    borderRadius: "16px",
    border: "none",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
  } as React.CSSProperties,
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  } as React.CSSProperties,
  empty: {
    borderRadius: "16px",
    background: "#f8fafc",
    padding: "14px",
    color: "#64748b",
    fontSize: "14px",
  } as React.CSSProperties,
  historyItem: {
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    padding: "10px 12px",
    marginBottom: "8px",
  } as React.CSSProperties,
  historyTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  } as React.CSSProperties,
  historyName: {
    fontSize: "14px",
    fontWeight: 700,
    margin: 0,
  } as React.CSSProperties,
  historyDate: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "2px",
  } as React.CSSProperties,
  historyAmount: {
    fontSize: "14px",
    fontWeight: 800,
    whiteSpace: "nowrap",
    marginLeft: "8px",
  } as React.CSSProperties,
  historyMemo: {
    fontSize: "12px",
    color: "#475569",
    marginTop: "6px",
    lineHeight: 1.5,
    wordBreak: "break-word",
  } as React.CSSProperties,
  rowActions: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  } as React.CSSProperties,
  deleteButton: {
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#475569",
    borderRadius: "12px",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "14px",
  } as React.CSSProperties,
};

export default function App() {
  const [goal, setGoal] = useState<Goal>({ name: "", amount: 0 });
  const [entries, setEntries] = useState<Entry[]>([]);
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayString());
  const [memo, setMemo] = useState("");
  const [saveNotice, setSaveNotice] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed?.goal) setGoal(parsed.goal);
      if (Array.isArray(parsed?.entries)) setEntries(parsed.entries);
    } catch {
      // ignore invalid local data
    }
  }, []);

  useEffect(() => {
    const payload: PersistedState = { goal, entries };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    if (goal.name || goal.amount || entries.length) {
      setSaveNotice("ローカル保存済み");
      const t = setTimeout(() => setSaveNotice(""), 1400);
      return () => clearTimeout(t);
    }
  }, [goal, entries]);

  const currentTotal = useMemo(
    () => entries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0),
    [entries]
  );

  const remaining = Math.max((Number(goal.amount) || 0) - currentTotal, 0);
  const progress = goal.amount > 0 ? Math.min((currentTotal / goal.amount) * 100, 100) : 0;
  const achieved = goal.amount > 0 && currentTotal >= goal.amount;

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [entries]
  );

  function addEntry() {
    const numericAmount = Number(amount);
    if (!item.trim()) return;
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;

    const next: Entry = {
      id: crypto.randomUUID(),
      item: item.trim(),
      amount: numericAmount,
      date: date || todayString(),
      memo: memo.trim(),
    };

    setEntries((prev) => [next, ...prev]);
    setItem("");
    setAmount("");
    setDate(todayString());
    setMemo("");
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>見送り貯金</h1>
            <p style={styles.subtitle}>買わなかった出費を、欲しいものへの前進に。</p>
          </div>
          <div style={styles.iconBox}>🐷</div>
        </div>

        <section style={styles.card}>
          <div style={styles.cardTitle}>目標</div>

          <div style={{ marginBottom: "14px" }}>
            <label htmlFor="goalName" style={styles.label}>本当に欲しいもの</label>
            <input
              id="goalName"
              value={goal.name}
              onChange={(e) => setGoal((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="例：新しいiPad"
              style={styles.input}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="goalAmount" style={styles.label}>目標金額</label>
            <input
              id="goalAmount"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={goal.amount || ""}
              onChange={(e) =>
                setGoal((prev) => ({
                  ...prev,
                  amount: Math.max(0, Number(e.target.value.replace(/[^0-9]/g, "")) || 0),
                }))
              }
              placeholder="例：80000"
              style={styles.input}
            />
          </div>

          <div style={styles.sectionBox}>
            <div style={styles.statsGrid}>
              <div>
                <div style={styles.statLabel}>現在の見送り貯金額</div>
                <div style={styles.statValue}>{yen(currentTotal)}</div>
              </div>
              <div>
                <div style={styles.statLabel}>あといくら</div>
                <div style={styles.statValue}>{yen(remaining)}</div>
              </div>
            </div>

            <div style={styles.progressRow}>
              <span>達成率</span>
              <strong style={{ color: "#0f172a" }}>{Math.round(progress)}%</strong>
            </div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>

            {achieved && (
              <div style={styles.achieveBox}>
                <p style={styles.achieveTitle}>目標達成!!</p>
                <p style={styles.achieveSub}>見送り貯金が目標額に到達しました。</p>
              </div>
            )}

            {saveNotice && <div style={styles.saveNotice}>{saveNotice}</div>}
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.cardTitle}>見送ったものを記録</div>

          <div style={{ marginBottom: "14px" }}>
            <label htmlFor="item" style={styles.label}>品目</label>
            <input
              id="item"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="例：ジャケット"
              style={styles.input}
            />
          </div>

          <div style={{ ...styles.twoCol, marginBottom: "14px" }}>
            <div>
              <label htmlFor="amount" style={styles.label}>金額</label>
              <input
                id="amount"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="4800"
                style={styles.input}
              />
            </div>
            <div>
              <label htmlFor="date" style={styles.label}>日付</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label htmlFor="memo" style={styles.label}>メモ</label>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="欲しくなった理由を含めてメモ"
              style={styles.textarea}
            />
          </div>

          <button
            onClick={addEntry}
            style={{
              ...styles.button,
              ...((!item.trim() || !amount || Number(amount) <= 0) ? styles.buttonDisabled : {}),
            }}
            disabled={!item.trim() || !amount || Number(amount) <= 0}
          >
            追加する
          </button>
        </section>

        <section style={styles.card}>
          <div style={styles.cardTitle}>履歴</div>

          {sortedEntries.length === 0 ? (
            <div style={styles.empty}>まだ記録はありません。</div>
          ) : (
            <div>
              {sortedEntries.map((entry) => (
                <div key={entry.id} style={styles.historyItem}>
                  <div style={styles.historyTop}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={styles.historyName}>{entry.item}</p>
                      <div style={styles.historyDate}>{entry.date}</div>
                    </div>
                    <div style={styles.rowActions}>
                      <div style={styles.historyAmount}>{yen(entry.amount)}</div>
                      <button
                        onClick={() => removeEntry(entry.id)}
                        aria-label="履歴を削除"
                        style={styles.deleteButton}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  {entry.memo && <div style={styles.historyMemo}>{entry.memo}</div>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}