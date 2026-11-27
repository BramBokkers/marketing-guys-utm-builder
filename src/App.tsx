import { useState, type ReactNode } from "react";
import LynxMascot from "./LynxMascot";
import logoUrl from "./assets/marketing-guys-logo.png";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  History,
  Info,
  Link2,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import {
  conventions,
  emptyForm,
  example,
  parameters,
  presets,
  type FormValues,
} from "./config";
import { generateUrl, validate, warnings } from "./utm";
import {
  addHistory,
  historyKey,
  readHistory,
  type HistoryItem,
} from "./history";

function Field({
  name,
  label,
  hint,
  required,
  value,
  onChange,
  onBlur,
  error,
  suggestions,
  placeholder,
}: {
  name: keyof FormValues;
  label: string;
  hint?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  suggestions?: string[];
  placeholder?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>
        {label}{" "}
        {required ? (
          <span className="required">*</span>
        ) : (
          <span className="optional">Optioneel</span>
        )}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        list={suggestions ? `${name}-options` : undefined}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={`${name}-hint${error ? ` ${name}-error` : ""}`}
        autoComplete="off"
        spellCheck={false}
      />
      {suggestions && (
        <datalist id={`${name}-options`}>
          {suggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      )}
      <small id={`${name}-hint`}>{hint}</small>
      {error && (
        <p className="error" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
function IconButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="icon-button"
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export default function App() {
  const [values, setValues] = useState<FormValues>({ ...emptyForm });
  const [preset, setPreset] = useState("Aangepast");
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormValues, boolean>>
  >({});
  const [storageError, setStorageError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      return readHistory();
    } catch {
      return [];
    }
  });
  const [notice, setNotice] = useState({ text: "", success: true });
  const url = generateUrl(values);
  const errors = validate(values);
  const messages = warnings(values);
  const used = parameters.filter(([field]) => values[field].trim());
  function update(name: keyof FormValues, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }));
    if (name === "source" || name === "medium") setPreset("Aangepast");
    setNotice({ text: "", success: true });
  }
  function save(items: HistoryItem[]) {
    setHistory(items);
    try {
      localStorage.setItem(historyKey, JSON.stringify(items));
      setStorageError("");
    } catch {
      setStorageError(
        "Je browser kan de geschiedenis niet opslaan. Nieuwe links blijven alleen tijdens deze sessie beschikbaar.",
      );
    }
  }
  function remember(link: string, data: FormValues) {
    save(
      addHistory(history, {
        url: link,
        values: { ...data },
        date: new Date().toISOString(),
      }),
    );
  }
  async function copy(link: string, data: FormValues) {
    try {
      await navigator.clipboard.writeText(link);
      remember(link, data);
      setNotice({ text: "URL gekopieerd. Klaar om te delen!", success: true });
    } catch {
      setNotice({
        text: "Kopiëren is niet gelukt. Selecteer en kopieer de URL handmatig.",
        success: false,
      });
    }
  }
  const field = (
    name: keyof FormValues,
    label: string,
    hint: string,
    placeholder: string,
    required = false,
    suggestions?: string[],
  ) => (
    <Field
      name={name}
      label={label}
      hint={hint}
      placeholder={placeholder}
      required={required}
      suggestions={suggestions}
      value={values[name]}
      onChange={(value) => update(name, value)}
      onBlur={() => setTouched((previous) => ({ ...previous, [name]: true }))}
      error={touched[name] ? errors[name] : undefined}
    />
  );
  return (
    <>
      <header className="topbar">
        <div className="nav-inner">
          <a className="brand" href="#" aria-label="Marketing Guys start">
            <img
              className="brand-logo"
              src={logoUrl}
              alt="Marketing Guys"
              width="144"
              height="72"
            />
          </a>
          <div className="nav-tool">
            <Link2 size={16} /> UTM Builder
          </div>
          <span className="nav-badge">
            <span /> Marketing toolkit
          </span>
        </div>
      </header>
      <main>
        <section className="intro">
          <div className="eyebrow">VAN KLIK NAAR INZICHT</div>
          <h1>
            Marketing Guys <span>UTM Builder</span>
          </h1>
          <p>Maak eenvoudig consistente en meetbare links.</p>
          <div className="intro-meta">
            <span>
              <Check size={14} /> Klaar voor GA4
            </span>
            <span>
              <Check size={14} /> Geen account nodig
            </span>
            <span>
              <Check size={14} /> Jouw data blijft lokaal
            </span>
          </div>
        </section>
        <div className="builder-grid">
          <section className="card form-card" aria-labelledby="settings-title">
            <div className="card-heading">
              <div className="section-icon">
                <SlidersHorizontal size={19} />
              </div>
              <div>
                <h2 id="settings-title">Stel je link samen</h2>
                <p>Een goede meting begint met een goede link.</p>
              </div>
              <span className="step">01</span>
            </div>
            <form onSubmit={(event) => event.preventDefault()} noValidate>
              <div className="preset">
                <label htmlFor="preset">
                  <Zap size={16} /> Snelle instellingen
                </label>
                <div className="select-wrap">
                  <select
                    id="preset"
                    value={preset}
                    onChange={(event) => {
                      const selected = presets.find(
                        (item) => item.name === event.target.value,
                      );
                      setPreset(event.target.value);
                      if (selected)
                        setValues((previous) => ({
                          ...previous,
                          source: selected.source,
                          medium: selected.medium,
                        }));
                      setNotice({ text: "", success: true });
                    }}
                  >
                    <option value="Aangepast">
                      Aangepast — stel zelf je link in
                    </option>
                    {presets.map((item) => (
                      <option key={item.name}>{item.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} />
                </div>
              </div>
              {field(
                "website",
                "Website URL",
                "De volledige URL van de pagina waar je bezoekers naartoe stuurt.",
                "https://jouwwebsite.nl/landingspagina",
                true,
              )}
              <div className="field-row">
                {field(
                  "source",
                  "Source",
                  "Waar komt het verkeer vandaan?",
                  "Kies of typ een bron",
                  true,
                  conventions.source,
                )}
                {field(
                  "medium",
                  "Medium",
                  "Via welk marketingkanaal?",
                  "Kies of typ een medium",
                  true,
                  conventions.medium,
                )}
              </div>
              {field(
                "campaign",
                "Name",
                "Een herkenbare naam voor je campagne, actie of content.",
                "Bijv. voorjaar_campagne_2026",
              )}
              <details className="advanced">
                <summary>
                  <SlidersHorizontal size={15} /> Geavanceerde opties{" "}
                  <span>3 optionele velden</span>
                  <ChevronDown size={16} />
                </summary>
                <div className="advanced-fields">
                  {field(
                    "id",
                    "Campaign ID",
                    "Een unieke identificatie voor je campagne.",
                    "Bijv. camp_2026_01",
                  )}
                  {field(
                    "term",
                    "Campaign Term",
                    "Het zoekwoord of de doelgroep van je advertentie.",
                    "Bijv. marketing_automation",
                  )}
                  {field(
                    "content",
                    "Campaign Content",
                    "Onderscheid varianten van een link of advertentie.",
                    "Bijv. header_cta",
                  )}
                </div>
              </details>
              <div className="form-footer">
                <span>* Verplichte velden</span>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setValues({ ...emptyForm });
                    setTouched({});
                    setPreset("Aangepast");
                    setNotice({ text: "", success: true });
                  }}
                >
                  <RotateCcw size={14} /> Wis velden
                </button>
              </div>
            </form>
          </section>
          <aside className="preview-column">
            <section className="preview-card" aria-labelledby="preview-title">
              <div className="preview-heading">
                <div className="preview-title-group">
                  <span className="live">
                    <span /> LIVE PREVIEW
                  </span>
                  <h2 id="preview-title">Jouw meetbare link</h2>
                  <p>Gebouwd voor de volgende klik.</p>
                </div>
                <LynxMascot ready={Boolean(url)} />
              </div>
              <div
                className={`url-box ${url ? "has-url" : ""}`}
                aria-live="polite"
              >
                {url ? (
                  <code>{url}</code>
                ) : (
                  <>
                    <Link2 size={26} />
                    <span>Je link verschijnt hier</span>
                    <small>
                      Vul de website URL, Source en Medium in om je UTM-link te
                      genereren.
                    </small>
                  </>
                )}
              </div>
              <button
                className="copy-button"
                disabled={!url}
                onClick={() => url && void copy(url, values)}
              >
                <Copy size={17} /> Kopieer URL <span>↗</span>
              </button>
              <a
                className={`open-link ${!url ? "disabled" : ""}`}
                href={url || undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!url}
                onClick={(event) => {
                  if (!url) event.preventDefault();
                  else remember(url, values);
                }}
              >
                Open URL <ExternalLink size={14} />
              </a>
              <div className="parameter-section">
                <div className="parameter-heading">
                  UTM-PARAMETERS <span>{url ? used.length : 0}</span>
                </div>
                {url ? (
                  <dl>
                    {used.map(([field, key]) => (
                      <div key={field}>
                        <dt>{key}</dt>
                        <dd>{values[field]}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="empty-parameters">
                    Je ingevulde parameters vind je hier terug.
                  </p>
                )}
              </div>
              <div className="preview-foot">
                <Check size={14} /> Correct gecodeerd. Direct klaar voor
                gebruik.
              </div>
            </section>
            <button
              className="example-card"
              onClick={() => {
                setValues({ ...example });
                setPreset("LinkedIn Ads");
                setTouched({});
                setNotice({ text: "", success: true });
              }}
            >
              <span className="example-icon">
                <Sparkles size={20} />
              </span>
              <span>
                <strong>Eerst even proberen?</strong>
                <small>Laad het Marketing Guys-voorbeeld</small>
              </span>
              <ArrowUpRight size={20} />
            </button>
          </aside>
        </div>
        {messages.length > 0 && (
          <div className="warnings" role="status">
            {messages.map((message) => (
              <p key={message}>
                <Info size={17} />
                {message}
              </p>
            ))}
          </div>
        )}
        <div
          role="status"
          className={`notice ${notice.text ? "visible" : ""} ${notice.success ? "success" : "error"}`}
        >
          {notice.text && (
            <>
              {notice.success ? <Check size={17} /> : <Info size={17} />}{" "}
              {notice.text}
            </>
          )}
        </div>
        <section className="card history-card" aria-labelledby="history-title">
          <div className="history-heading">
            <div>
              <h2 id="history-title">
                <History size={20} /> Recent gegenereerde links{" "}
                <span className="count">{history.length}</span>
              </h2>
              <p>Je laatste 20 links, lokaal opgeslagen in deze browser.</p>
            </div>
            <button
              className="text-button"
              disabled={!history.length}
              onClick={() => save([])}
            >
              <Trash2 size={14} /> Wis geschiedenis
            </button>
          </div>
          {storageError && (
            <p className="error" role="alert">
              {storageError}
            </p>
          )}
          {history.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Datum / campagne</th>
                    <th>Source</th>
                    <th>Medium</th>
                    <th>Gegenereerde URL</th>
                    <th>
                      <span className="sr-only">Acties</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.url}>
                      <td>
                        <strong>
                          {item.values.campaign || "Zonder campagnenaam"}
                        </strong>
                        <small>
                          {new Intl.DateTimeFormat("nl-NL", {
                            dateStyle: "short",
                            timeStyle: "short",
                          }).format(new Date(item.date))}
                        </small>
                      </td>
                      <td>
                        <span className="tag">{item.values.source}</span>
                      </td>
                      <td>{item.values.medium}</td>
                      <td>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="history-url"
                          title={item.url}
                        >
                          {item.url}
                        </a>
                      </td>
                      <td>
                        <div className="row-actions">
                          <IconButton
                            label={`Kopieer ${item.values.campaign || "link"}`}
                            onClick={() => void copy(item.url, item.values)}
                          >
                            <Copy size={16} />
                          </IconButton>
                          <IconButton
                            label={`Verwijder ${item.values.campaign || "link"}`}
                            onClick={() =>
                              save(
                                history.filter(
                                  (other) => other.url !== item.url,
                                ),
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-history">
              <div>
                <History size={24} />
              </div>
              <strong>Je volgende campagne begint hier</strong>
              <p>Kopieer of open een link en je vindt hem hier terug.</p>
            </div>
          )}
        </section>
        <section className="info-section">
          <div className="info-icon">
            <Info size={21} />
          </div>
          <div>
            <h3>Kleine tags. Grote inzichten.</h3>
            <p>
              UTM-tags vertellen GA4 waar je bezoekers vandaan komen en welke
              campagnes resultaat opleveren. Gebruik ze voor externe links naar
              je website, zoals advertenties, nieuwsbrieven en social posts.
            </p>
            <p>
              <strong>Goed om te weten:</strong> gebruik geen UTM-tags op
              interne navigatielinks; die kunnen je attributie verstoren.
              Hoofdletters tellen mee: <code>LinkedIn</code> en{" "}
              <code>linkedin</code> worden apart gemeten.
            </p>
          </div>
        </section>
        <footer>
          <span>© {new Date().getFullYear()} Marketing Guys</span>
          <span>
            Meer inzicht. Meer impact.
            <span className="footer-dot" />
          </span>
        </footer>
      </main>
    </>
  );
}
