import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../api";
import type { DashboardData, RecordItem } from "../types";
const fmt = (n: number | null) =>
  n === null ? "—" : `${n.toFixed(1).replace(".", ",")}%`;
const fields: Array<[keyof RecordItem, string]> = [
  ["matricula", "Matrícula"],
  ["prova", "Prova"],
  ["nome", "Nome completo"],
  ["idade", "Idade"],
  ["cargo", "Cargo"],
  ["gerencia", "Gerência"],
  ["coordenacao", "Coordenação"],
  ["lider", "Líder"],
  ["turno", "Letra do turno"],
  ["admissao", "Admissão"],
  ["tempo", "Tempo"],
  ["genero", "Gênero"],
  ["dataAplicacao", "Data da aplicação"],
  ["situacao", "Situação"],
  ["aplicador", "Aplicador"],
];
export default function Participant() {
  const { candidateKey = "" } = useParams();
  const [data, setData] = useState<DashboardData | null>(null);
  useEffect(() => {
    api<DashboardData>("/dashboard").then(setData);
  }, []);
  if (!data)
    return (
      <div className="loader page">
        <span />
      </div>
    );
  const key = decodeURIComponent(candidateKey),
    exactT = data.records.theoretical.find((r) => r.candidateKey === key),
    exactP = data.records.practical.find((r) => r.candidateKey === key),
    matricula = exactP?.matricula ?? exactT?.matricula,
    t =
      exactT ??
      data.records.theoretical
        .filter((r) => r.matricula === matricula)
        .sort((a, b) =>
          String(b.dataAplicacao ?? "").localeCompare(
            String(a.dataAplicacao ?? ""),
          ),
        )[0],
    p =
      exactP ??
      data.records.practical
        .filter((r) => r.matricula === matricula)
        .sort((a, b) =>
          String(b.dataAplicacao ?? "").localeCompare(
            String(a.dataAplicacao ?? ""),
          ),
        )[0],
    person = p || t;
  if (!person)
    return <div className="empty error">Participante não encontrado.</div>;
  const objects = Array.from({ length: 11 }, (_, i) => {
      const name = `O${i + 1}`;
      return {
        name,
        Teórica: t?.objects[name] ?? 0,
        Prática: p?.objects[name] ?? 0,
      };
    }),
    notes = [
      { name: "Resultado geral", Teórica: t?.nota ?? 0, Prática: p?.nota ?? 0 },
    ];
  return (
    <div className="dashboard participant-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">DETALHES DO PARTICIPANTE</span>
          <h1>{person.nome}</h1>
          <p>
            {person.matricula} · {person.prova}
          </p>
        </div>
      </header>
      <section className="detail-grid">
        <div className="panel participant-data">
          <h3>Dados cadastrais</h3>
          <dl>
            {fields.map(([field, label]) => (
              <div key={field}>
                <dt>{label}</dt>
                <dd>{String(person[field] ?? "—")}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="panel score-summary">
          <h3>Resultados gerais</h3>
          <div className="score-cards">
            <article>
              <span>Teórica</span>
              <strong>{fmt(t?.nota ?? null)}</strong>
              <small>{t?.resultado ?? "Sem resultado"}</small>
            </article>
            <article>
              <span>Prática</span>
              <strong>{fmt(p?.nota ?? null)}</strong>
              <small>{p?.resultado ?? "Sem resultado"}</small>
            </article>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={notes}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => fmt(Number(v))} />
              <Legend />
              <Bar dataKey="Teórica" fill="#0755a6">
                <LabelList
                  dataKey="Teórica"
                  position="center"
                  angle={-90}
                  fill="#fff"
                  formatter={(v: unknown) => fmt(Number(v))}
                />
              </Bar>
              <Bar dataKey="Prática" fill="#ff8a1f">
                <LabelList
                  dataKey="Prática"
                  position="center"
                  angle={-90}
                  fill="#fff"
                  formatter={(v: unknown) => fmt(Number(v))}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="panel participant-objects">
        <h3>Resultados por objeto de conhecimento</h3>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={objects}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => fmt(Number(v))} />
            <Legend />
            <Bar dataKey="Teórica" fill="#0755a6">
              <LabelList
                dataKey="Teórica"
                position="center"
                angle={-90}
                fill="#fff"
                formatter={(v: unknown) => fmt(Number(v))}
              />
            </Bar>
            <Bar dataKey="Prática" fill="#ff8a1f">
              <LabelList
                dataKey="Prática"
                position="center"
                angle={-90}
                fill="#fff"
                formatter={(v: unknown) => fmt(Number(v))}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="table-scroll participant-result-table">
          <table>
            <thead>
              <tr>
                <th>Objeto</th>
                <th>Resultado teórico</th>
                <th>Resultado prático</th>
                <th>GAP (P − T)</th>
              </tr>
            </thead>
            <tbody>
              {objects.map((row, index) => {
                const theoretical = t?.objects[`O${index + 1}`] ?? null,
                  practical = p?.objects[`O${index + 1}`] ?? null,
                  gap =
                    theoretical !== null && practical !== null
                      ? practical - theoretical
                      : null;
                return (
                  <tr key={row.name}>
                    <td>
                      <strong>{row.name}</strong>
                    </td>
                    <td>{fmt(theoretical)}</td>
                    <td>{fmt(practical)}</td>
                    <td
                      className={
                        gap === null ? "" : gap >= 0 ? "positive" : "negative"
                      }
                    >
                      {gap === null ? "—" : `${gap >= 0 ? "+" : ""}${fmt(gap)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel participant-summary-table">
        <h3>Resumo das avaliações</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Avaliação</th>
                <th>Nota</th>
                <th>Resultado</th>
                <th>Data da aplicação</th>
                <th>Situação</th>
                <th>Aplicador</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Teórica</strong>
                </td>
                <td>{fmt(t?.nota ?? null)}</td>
                <td>{t?.resultado ?? "—"}</td>
                <td>{t?.dataAplicacao ?? "—"}</td>
                <td>{t?.situacao ?? "—"}</td>
                <td>{t?.aplicador ?? "—"}</td>
              </tr>
              <tr>
                <td>
                  <strong>Prática</strong>
                </td>
                <td>{fmt(p?.nota ?? null)}</td>
                <td>{p?.resultado ?? "—"}</td>
                <td>{p?.dataAplicacao ?? "—"}</td>
                <td>{p?.situacao ?? "—"}</td>
                <td>{p?.aplicador ?? "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
