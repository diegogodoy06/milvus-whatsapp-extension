// injected.js — roda no MUNDO PRINCIPAL (contexto da página) do WhatsApp Web.
// O WhatsApp removeu o telefone/JID do DOM; a única fonte confiável agora é o
// estado interno (Store), acessível via window.require("WAWeb...").
// Este script lê o chat ativo e responde ao content.js por window.postMessage.

(function () {
  'use strict';

  function getChatCollection() {
    try {
      if (typeof window.require !== 'function') return null;
      const mod = window.require('WAWebChatCollection');
      return (mod && (mod.ChatCollection || (mod.default && mod.default.ChatCollection))) || null;
    } catch (e) {
      return null;
    }
  }

  // Extrai só os dígitos de um JID tipo "5518991903645@c.us"
  function phoneFromJid(jid) {
    if (!jid) return null;
    const m = String(jid).match(/(\d{8,15})@/);
    return m ? m[1] : null;
  }

  function getActiveChat() {
    try {
      const CC = getChatCollection();
      if (!CC || typeof CC.getActive !== 'function') return null;

      const active = CC.getActive();
      if (!active || !active.id) return null;

      const isGroup = active.id.server === 'g.us';

      // Nome do contato/conversa
      const contact = active.contact;
      const name = active.formattedTitle ||
                   active.name ||
                   (contact && (contact.name || contact.shortName || contact.pushname)) ||
                   null;

      // Telefone REAL (@c.us). O id do chat pode ser @lid (privacidade), então
      // priorizamos contact.phoneNumber, que carrega o número verdadeiro.
      let phone = null;
      if (!isGroup) {
        const candidates = [];
        if (contact && contact.phoneNumber) {
          candidates.push(contact.phoneNumber._serialized ||
                          (contact.phoneNumber.user && contact.phoneNumber.user + '@' + contact.phoneNumber.server));
        }
        if (active.historyChatId) {
          candidates.push(active.historyChatId._serialized || active.historyChatId);
        }
        if (contact && contact.id && contact.id.server === 'c.us') {
          candidates.push(contact.id._serialized);
        }
        if (active.id && active.id.server === 'c.us') {
          candidates.push(active.id._serialized);
        }
        for (const c of candidates) {
          const p = phoneFromJid(c);
          if (p) { phone = p; break; }
        }
      }

      return {
        name: name,
        phone: phone,
        isGroup: isGroup,
        jid: active.id._serialized || null
      };
    } catch (e) {
      return { error: String(e && e.message || e) };
    }
  }

  window.addEventListener('message', function (event) {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.__tiSupport !== 'request') return;

    const result = getActiveChat();
    window.postMessage({ __tiSupport: 'response', reqId: data.reqId, result: result }, '*');
  });

  // Avisa que está pronto (útil para depuração no console)
  window.postMessage({ __tiSupport: 'ready' }, '*');
})();
