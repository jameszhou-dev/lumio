import { useState } from "react";
import { api, ContextType } from "./api";

// ── Types ────────────────────────────────────────────────────────────────────

interface Response {
  ok: boolean;
  status: number;
  data: unknown;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function ResponseBox({ res }: { res: Response | null }) {
  if (!res) return null;
  const cls = res.ok ? "ok" : "err";
  const label = res.ok ? `${res.status} OK` : `${res.status} Error`;
  return (
    <div className={`response ${cls}`}>
      <div className="response-header">{label}</div>
      <pre>{JSON.stringify(res.data, null, 2)}</pre>
    </div>
  );
}

const CONTEXT_TYPES: ContextType[] = ["HOURS", "MENU", "POLICY", "FAQ", "CALENDAR", "OTHER"];

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [businessId, setBusinessId] = useState("");
  const [contextId, setContextId] = useState("");

  return (
    <div id="root">
      <nav className="sidebar">
        <div className="sidebar-logo">Lumio</div>
        <div className="sidebar-group">
          <div className="sidebar-label">General</div>
          <a className="sidebar-link" href="#health">Health</a>
        </div>
        <div className="sidebar-group">
          <div className="sidebar-label">Businesses</div>
          <a className="sidebar-link" href="#create-business">Create</a>
          <a className="sidebar-link" href="#get-business">Get</a>
        </div>
        <div className="sidebar-group">
          <div className="sidebar-label">Contexts</div>
          <a className="sidebar-link" href="#add-context">Add</a>
          <a className="sidebar-link" href="#update-context">Update</a>
          <a className="sidebar-link" href="#delete-context">Delete</a>
        </div>
        <div className="sidebar-group">
          <div className="sidebar-label">Vapi</div>
          <a className="sidebar-link" href="#system-prompt">System Prompt</a>
        </div>
      </nav>

      <main className="main">
        <h1 className="page-title">Lumio API</h1>
        <p className="page-subtitle">
          Exercises every Lumio backend endpoint. 
        </p>

        {/* Shared IDs */}
        <div className="ids-bar">
          <div>
            <label>Business ID</label>
            <input
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="auto-filled after Create Business"
            />
          </div>
          <div>
            <label>Context ID</label>
            <input
              value={contextId}
              onChange={(e) => setContextId(e.target.value)}
              placeholder="auto-filled after Add Context"
            />
          </div>
        </div>

        {/* ── Health ── */}
        <section className="section" id="health">
          <h2 className="section-title">Health</h2>
          <HealthCard />
        </section>

        {/* ── Businesses ── */}
        <section className="section" id="create-business">
          <h2 className="section-title">Businesses</h2>
          <CreateBusinessCard onCreated={setBusinessId} />
          <div id="get-business">
            <GetBusinessCard businessId={businessId} />
          </div>
        </section>

        {/* ── Contexts ── */}
        <section className="section" id="add-context">
          <h2 className="section-title">Contexts</h2>
          <AddContextCard businessId={businessId} onCreated={setContextId} />
          <div id="update-context">
            <UpdateContextCard businessId={businessId} contextId={contextId} />
          </div>
          <div id="delete-context">
            <DeleteContextCard businessId={businessId} contextId={contextId} />
          </div>
        </section>

        {/* ── System Prompt ── */}
        <section className="section" id="system-prompt">
          <h2 className="section-title">System Prompt</h2>
          <SystemPromptCard businessId={businessId} />
        </section>
      </main>
    </div>
  );
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function HealthCard() {
  const [res, setRes] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    const r = await api.health();
    setRes(r);
    setLoading(false);
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="badge badge-get">GET</span>
        <span className="card-path">/api/health</span>
      </div>
      <button className="btn" onClick={send} disabled={loading}>
        {loading ? "Sending…" : "Send"}
      </button>
      <ResponseBox res={res} />
    </div>
  );
}

function CreateBusinessCard({ onCreated }: { onCreated: (id: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [res, setRes] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    const r = await api.createBusiness({
      name,
      description: description || undefined,
      phone: phone || undefined,
    });
    setRes(r);
    if (r.ok && r.data && typeof r.data === "object" && "id" in r.data) {
      onCreated(r.data.id as string);
    }
    setLoading(false);
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="badge badge-post">POST</span>
        <span className="card-path">/api/businesses</span>
      </div>
      <div className="fields">
        <div className="field">
          <label>name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Joe's Diner" />
        </div>
        <div className="field">
          <label>description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A family diner downtown" />
        </div>
        <div className="field">
          <label>phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="555-123-4567" />
        </div>
      </div>
      <button className="btn" onClick={send} disabled={loading || !name.trim()}>
        {loading ? "Sending…" : "Send"}
      </button>
      <ResponseBox res={res} />
    </div>
  );
}

function GetBusinessCard({ businessId }: { businessId: string }) {
  const [res, setRes] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    const r = await api.getBusiness(businessId);
    setRes(r);
    setLoading(false);
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="badge badge-get">GET</span>
        <span className="card-path">/api/businesses/:id</span>
      </div>
      <button className="btn" onClick={send} disabled={loading || !businessId.trim()}>
        {loading ? "Sending…" : "Send"}
      </button>
      {!businessId && <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>Set Business ID above first.</p>}
      <ResponseBox res={res} />
    </div>
  );
}

function AddContextCard({
  businessId,
  onCreated,
}: {
  businessId: string;
  onCreated: (id: string) => void;
}) {
  const [type, setType] = useState<ContextType>("HOURS");
  const [content, setContent] = useState("");
  const [res, setRes] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    const r = await api.addContext(businessId, { type, content });
    setRes(r);
    if (r.ok && r.data && typeof r.data === "object" && "id" in r.data) {
      onCreated(r.data.id as string);
    }
    setLoading(false);
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="badge badge-post">POST</span>
        <span className="card-path">/api/businesses/:id/contexts</span>
      </div>
      <div className="fields">
        <div className="field">
          <label>type *</label>
          <select value={type} onChange={(e) => setType(e.target.value as ContextType)}>
            {CONTEXT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label>content *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Mon–Fri 8am–9pm, Sat–Sun 9am–10pm"
          />
        </div>
      </div>
      <button className="btn" onClick={send} disabled={loading || !businessId.trim() || !content.trim()}>
        {loading ? "Sending…" : "Send"}
      </button>
      {!businessId && <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>Set Business ID above first.</p>}
      <ResponseBox res={res} />
    </div>
  );
}

function UpdateContextCard({
  businessId,
  contextId,
}: {
  businessId: string;
  contextId: string;
}) {
  const [type, setType] = useState<ContextType | "">("");
  const [content, setContent] = useState("");
  const [res, setRes] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    const r = await api.updateContext(businessId, contextId, {
      type: type || undefined,
      content: content || undefined,
    });
    setRes(r);
    setLoading(false);
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="badge badge-put">PUT</span>
        <span className="card-path">/api/businesses/:id/contexts/:contextId</span>
      </div>
      <div className="fields">
        <div className="field">
          <label>type (leave blank to keep current)</label>
          <select value={type} onChange={(e) => setType(e.target.value as ContextType | "")}>
            <option value="">— unchanged —</option>
            {CONTEXT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label>content (leave blank to keep current)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Updated content…"
          />
        </div>
      </div>
      <button
        className="btn"
        onClick={send}
        disabled={loading || !businessId.trim() || !contextId.trim()}
      >
        {loading ? "Sending…" : "Send"}
      </button>
      {(!businessId || !contextId) && (
        <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>Set Business ID and Context ID above first.</p>
      )}
      <ResponseBox res={res} />
    </div>
  );
}

function DeleteContextCard({
  businessId,
  contextId,
}: {
  businessId: string;
  contextId: string;
}) {
  const [res, setRes] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    const r = await api.deleteContext(businessId, contextId);
    setRes(r.status === 204 ? { ...r, data: "Deleted successfully" } : r);
    setLoading(false);
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="badge badge-delete">DELETE</span>
        <span className="card-path">/api/businesses/:id/contexts/:contextId</span>
      </div>
      <button
        className="btn btn-danger"
        onClick={send}
        disabled={loading || !businessId.trim() || !contextId.trim()}
      >
        {loading ? "Sending…" : "Send"}
      </button>
      {(!businessId || !contextId) && (
        <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>Set Business ID and Context ID above first.</p>
      )}
      <ResponseBox res={res} />
    </div>
  );
}

function SystemPromptCard({ businessId }: { businessId: string }) {
  const [res, setRes] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    const r = await api.getSystemPrompt(businessId);
    setRes(r);
    setLoading(false);
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="badge badge-get">GET</span>
        <span className="card-path">/api/businesses/:id/system-prompt</span>
      </div>
      <button className="btn" onClick={send} disabled={loading || !businessId.trim()}>
        {loading ? "Sending…" : "Send"}
      </button>
      {!businessId && <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>Set Business ID above first.</p>}
      <ResponseBox res={res} />
    </div>
  );
}
