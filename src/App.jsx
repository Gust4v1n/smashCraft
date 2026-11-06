import React, { useState, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import './style.css';

// ID único de 32 bits para notificações agendadas (Desafio Extra)
const gerarIdUnico = () => Math.floor(Date.now() / 1000) % 2147483647;

const PRESETS = [5, 10, 30, 60];

export default function App() {
  const [permissaoConcedida, setPermissaoConcedida] = useState(false);
  const [statusPermissao, setStatusPermissao]       = useState('desconhecido');
  const [segundos, setSegundos]                     = useState(10);
  const [msg, setMsg]                               = useState({ texto: 'Verificando permissões…', tipo: 'info' });
  const [pendentes, setPendentes]                   = useState(0);
  const [historico, setHistorico]                   = useState([]);
  const [loading, setLoading]                       = useState(false);

  useEffect(() => {
    checarPermissao();
    atualizarPendentes();
  }, []);

  const toast = (texto, tipo = 'info') => setMsg({ texto, tipo });

  /* ── Permissão ──────────────────────────────────────────────── */
  const checarPermissao = async () => {
    try {
      const s = await LocalNotifications.checkPermissions();
      setStatusPermissao(s.display);
      if (s.display === 'granted') {
        setPermissaoConcedida(true);
        toast('Permissões ativas — pode disparar notificações.', 'sucesso');
      } else {
        setPermissaoConcedida(false);
        toast(`Permissão "${s.display}" — toque em Permitir para continuar.`, 'aviso');
      }
    } catch (e) {
      toast('Erro ao verificar permissão: ' + e.message, 'erro');
    }
  };

  const solicitarPermissao = async () => {
    setLoading(true);
    try {
      let s = await LocalNotifications.checkPermissions();
      if (s.display !== 'granted') s = await LocalNotifications.requestPermissions();
      setStatusPermissao(s.display);
      if (s.display === 'granted') {
        setPermissaoConcedida(true);
        toast('Permissão concedida!', 'sucesso');
      } else {
        setPermissaoConcedida(false);
        toast('Permissão negada pelo sistema.', 'erro');
      }
    } catch (e) {
      toast('Erro ao solicitar permissão: ' + e.message, 'erro');
    } finally {
      setLoading(false);
    }
  };

  /* ── Disparos ───────────────────────────────────────────────── */
  const dispararPedido = async () => {
    if (!permissaoConcedida) return toast('Conceda a permissão primeiro.', 'aviso');
    setLoading(true);
    try {
      // Fix Android: omitir schedule não dispara — usar +1s garante o disparo imediato
      await LocalNotifications.schedule({
        notifications: [{
          title: 'SmashCraft 🍔',
          body: 'O combo Burger Smash + Refil está pronto! Retire no balcão.',
          id: 120,
          schedule: { at: new Date(Date.now() + 1000) },
          sound: null, attachments: null, actionTypeId: '',
          extra: { tipo: 'pedido_pronto' },
        }],
      });
      toast('Pedido pronto! Notificação disparada.', 'sucesso');
      atualizarPendentes();
    } catch (e) {
      toast('Falha ao disparar: ' + e.message, 'erro');
    } finally {
      setLoading(false);
    }
  };

  const dispararHappyHour = async () => {
    if (!permissaoConcedida) return toast('Conceda a permissão primeiro.', 'aviso');
    setLoading(true);
    try {
      // Fix Android: omitir schedule não dispara — usar +1s garante o disparo imediato
      await LocalNotifications.schedule({
        notifications: [{
          title: 'SmashCraft 🎉 Happy Hour!',
          body: '18h chegou! Todos os combos com 30% OFF até 20h.',
          id: 180,
          schedule: { at: new Date(Date.now() + 1000) },
          sound: null, attachments: null, actionTypeId: '',
          extra: { tipo: 'happy_hour' },
        }],
      });
      toast('Happy Hour 18h disparado!', 'sucesso');
      atualizarPendentes();
    } catch (e) {
      toast('Falha ao disparar: ' + e.message, 'erro');
    } finally {
      setLoading(false);
    }
  };

  const agendar = async () => {
    if (!permissaoConcedida) return toast('Conceda a permissão primeiro.', 'aviso');
    const seg = parseInt(segundos) || 10;
    if (seg < 1 || seg > 3600) return toast('Use um valor entre 1 e 3600 segundos.', 'aviso');
    setLoading(true);
    const dataAlvo = new Date(Date.now() + seg * 1000);
    const id = gerarIdUnico(); // ✅ Desafio Extra
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: 'SmashCraft ⏰',
          body: `Lembrete agendado (${seg}s) — seu pedido está a caminho!`,
          id,
          schedule: { at: dataAlvo },
          sound: null, attachments: null, actionTypeId: '',
          extra: { tipo: 'agendado', segundos: seg },
        }],
      });
      setHistorico(h => [{ id, horario: dataAlvo.toLocaleTimeString('pt-BR'), seg }, ...h]);
      toast(`Agendado para ${dataAlvo.toLocaleTimeString('pt-BR')} — ID #${id}`, 'sucesso');
      atualizarPendentes();
    } catch (e) {
      toast('Falha ao agendar: ' + e.message, 'erro');
    } finally {
      setLoading(false);
    }
  };

  const atualizarPendentes = async () => {
    try {
      const r = await LocalNotifications.getPending();
      setPendentes(r.notifications.length);
    } catch (_) {}
  };

  const cancelarTodas = async () => {
    setLoading(true);
    try {
      const r = await LocalNotifications.getPending();
      if (!r.notifications.length) return toast('Nenhuma notificação pendente.', 'info');
      await LocalNotifications.cancel(r);
      setHistorico([]);
      toast(`${r.notifications.length} notificação(ões) cancelada(s).`, 'sucesso');
      atualizarPendentes();
    } catch (e) {
      toast('Erro ao cancelar: ' + e.message, 'erro');
    } finally {
      setLoading(false);
    }
  };

  /* ── Helpers de estilo ──────────────────────────────────────── */
  const permClass = {
    granted: 'perm-granted',
    denied:  'perm-denied',
    prompt:  'perm-prompt',
    'prompt-with-rationale': 'perm-prompt',
  }[statusPermissao] || 'perm-unknown';

  return (
    <div className="app">

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <div className="hero">
        <div className="hero-logo">🍔</div>
        <h1 className="hero-brand">Smash<span>Craft</span></h1>
        <p className="hero-sub">Hamburgueria Premium</p>
        <div className="hero-badges">
          <span className="badge badge-orange">Aluno 12</span>
          <span className="badge badge-green">✓ Plugin instalado</span>
          <span className="badge badge-orange">Android 13+</span>
        </div>
      </div>

      {/* ══ TOAST DE STATUS ═══════════════════════════════════════ */}
      <div className={`toaster toaster-${msg.tipo}`}>
        {loading
          ? <div className="spinner" />
          : <div className={`toaster-dot dot-${msg.tipo}`} />
        }
        <p className="toaster-msg">{msg.texto}</p>
      </div>

      {/* ══ PERMISSÃO ═════════════════════════════════════════════ */}
      <div className="section">
        <p className="section-label">Permissão</p>
        <div className={`card ${permissaoConcedida ? 'card-perm-granted' : 'card-perm-denied'}`}>
          <div className="card-inner">
            <div className="perm-header">
              <span className="perm-title">Notificações do sistema</span>
              <span className={`perm-pill ${permClass}`}>{statusPermissao}</span>
            </div>
            <p className="perm-desc">
              Android 13+ exige permissão <code>POST_NOTIFICATIONS</code> explícita.
              Sem ela, nenhum alerta será exibido.
            </p>
            <div className="btn-row">
              <button
                className="btn btn-ghost"
                onClick={checarPermissao}
                disabled={loading}
              >
                <span className="btn-icon">↻</span> Verificar
              </button>
              <button
                className="btn btn-primary"
                onClick={solicitarPermissao}
                disabled={loading || permissaoConcedida}
              >
                {permissaoConcedida
                  ? <><span className="btn-icon">✓</span> Concedida</>
                  : <><span className="btn-icon">🔓</span> Permitir</>
                }
              </button>
            </div>

            {!permissaoConcedida && (
              <div className="android-warn">
                <span className="android-warn-icon">⚠</span>
                <p className="android-warn-text">
                  <strong>Ação necessária:</strong> toque em <strong>Permitir</strong> para
                  liberar o disparo de notificações locais neste dispositivo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ DISPAROS IMEDIATOS ════════════════════════════════════ */}
      <div className="section">
        <p className="section-label">Disparo imediato</p>
        <div className="action-grid">

          <button
            className="action-card"
            onClick={dispararPedido}
            disabled={loading || !permissaoConcedida}
          >
            <div className="action-card-icon icon-red">🍔</div>
            <div>
              <div className="action-card-label">Pedido pronto</div>
              <div className="action-card-sub">ID fixo · #120</div>
            </div>
          </button>

          <button
            className="action-card"
            onClick={dispararHappyHour}
            disabled={loading || !permissaoConcedida}
          >
            <div className="action-card-icon icon-amber">🎉</div>
            <div>
              <div className="action-card-label">Happy Hour 18h</div>
              <div className="action-card-sub">ID fixo · #180</div>
            </div>
          </button>

        </div>
      </div>

      {/* ══ AGENDAMENTO ═══════════════════════════════════════════ */}
      <div className="section">
        <p className="section-label">Agendar para o futuro</p>
        <div className="schedule-box">

          <span className="schedule-label">Disparar em quantos segundos?</span>

          {/* Presets */}
          <div className="time-presets">
            {PRESETS.map(p => (
              <button
                key={p}
                className={`preset-btn ${segundos == p ? 'active' : ''}`}
                onClick={() => setSegundos(p)}
              >
                {p}s
              </button>
            ))}
          </div>

          {/* Input numérico */}
          <div className="time-input-wrap">
            <button
              className="time-btn"
              onClick={() => setSegundos(s => Math.max(1, (parseInt(s) || 10) - 5))}
            >−</button>
            <input
              type="number"
              className="time-input"
              value={segundos}
              onChange={e => setSegundos(e.target.value)}
              min="1"
              max="3600"
            />
            <span className="time-unit">seg</span>
            <button
              className="time-btn"
              onClick={() => setSegundos(s => Math.min(3600, (parseInt(s) || 10) + 5))}
            >+</button>
          </div>

          <button
            className="btn btn-success btn-full"
            onClick={agendar}
            disabled={loading || !permissaoConcedida}
          >
            <span className="btn-icon">⏰</span>
            Agendar lembrete · ID único
          </button>

          {/* Histórico */}
          {historico.length > 0 && (
            <div className="history-list">
              {historico.map((item, i) => (
                <div key={i} className="history-item">
                  <span className="history-id">#{item.id}</span>
                  <span className="history-time">dispara às {item.horario}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ PENDENTES ═════════════════════════════════════════════ */}
      <div className="section">
        <p className="section-label">Fila de agendamentos</p>
        <div className="pending-strip">
          <span className={`pending-num ${pendentes === 0 ? 'zero' : ''}`}>{pendentes}</span>
          <div className="pending-info">
            <p className="pending-title">
              {pendentes === 0 ? 'Nenhuma pendente' : 'Na fila do sistema'}
            </p>
            <p className="pending-sub">notificações aguardando disparo</p>
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: 10 }}>
          <button className="btn btn-ghost" onClick={atualizarPendentes} disabled={loading}>
            <span className="btn-icon">↻</span> Atualizar
          </button>
          <button
            className="btn btn-danger"
            onClick={cancelarTodas}
            disabled={loading || pendentes === 0}
          >
            <span className="btn-icon">✕</span> Cancelar todas
          </button>
        </div>
      </div>

      {/* ══ RODAPÉ ════════════════════════════════════════════════ */}
      <div className="footer">
        <p className="footer-text">
          @capacitor/local-notifications v8.3.1
          <span className="footer-dot">·</span>
          React + Vite
          <br />
          Aluno 12 · SmashCraft Hamburgueria
        </p>
      </div>

    </div>
  );
}
