// Content Script - Injetado no WhatsApp Web
console.log('WhatsApp Suporte TI - Extensão Milvus carregada');

// Configuração da API Milvus (pode ser alterada via popup)
let API_BASE_URL = 'https://apiintegracao.milvus.com.br/api'; // URL da API Milvus
let API_TOKEN = ''; // Token de autenticação

// Carrega configurações salvas
chrome.storage.sync.get(['apiBaseUrl', 'apiToken'], (result) => {
  if (result.apiBaseUrl) {
    API_BASE_URL = result.apiBaseUrl;
  }
  if (result.apiToken) {
    API_TOKEN = result.apiToken;
  }
});

// Classe principal da extensão
class WhatsAppSupportExtension {
  constructor() {
    this.currentContact = null;
    this.currentPhone = null;
    this.tickets = [];
    this.panelVisible = false;
    this.headerObserver = null;
    this.mainObserver = null;
    this.init();
  }

  init() {
    console.log('Inicializando extensão...');
    // Aguarda o WhatsApp Web carregar completamente
    this.waitForWhatsAppLoad();
  }

  waitForWhatsAppLoad() {
    console.log('⏳ Aguardando WhatsApp Web carregar...');
    let attempts = 0;
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      // Busca o header da CONVERSA (não da lista de contatos)
      // O header da conversa está dentro de um elemento com role="main" ou que contenha o chat
      let chatHeader = null;
      
      // Método 1: Procurar header dentro do main
      const mainElement = document.querySelector('[role="main"]') || document.querySelector('#main');
      if (mainElement) {
        chatHeader = mainElement.querySelector('header');
        if (chatHeader) {
          console.log('🔍 Header encontrado dentro do [role="main"]');
        }
      }
      
      // Método 2: Se não encontrou, procura por header que contenha nome de contato
      if (!chatHeader) {
        const headers = document.querySelectorAll('header');
        for (let header of headers) {
          // O header da conversa geralmente tem mais conteúdo e elementos
          const hasContactInfo = header.querySelector('[title]') || 
                                header.querySelector('span[dir="auto"]');
          const isNotSidebar = header.getAttribute('data-tab') !== '2';
          
          if (hasContactInfo && isNotSidebar) {
            chatHeader = header;
            console.log('🔍 Header encontrado com informações de contato');
            break;
          }
        }
      }
      
      if (chatHeader) {
        clearInterval(checkInterval);
        console.log('✅ WhatsApp Web carregado!');
        console.log('📍 Header da conversa encontrado:', chatHeader);
        this.chatHeader = chatHeader; // Salva referência
        this.injectPanel();
        this.setupObservers();
      } else if (attempts > 60) {
        clearInterval(checkInterval);
        console.error('❌ Timeout: WhatsApp não carregou após 60 tentativas');
        console.log('💡 Dica: Abra uma conversa para ativar a extensão');
      } else if (attempts % 10 === 0) {
        console.log(`⏳ Ainda aguardando... (tentativa ${attempts}/60)`);
      }
    }, 1000);
  }

  injectPanel() {
    // Cria o container do painel lateral
    const panel = document.createElement('div');
    panel.id = 'ti-support-panel';
    panel.className = 'ti-support-panel hidden';
    panel.innerHTML = `
      <div class="ti-panel-header">
        <h2>
          <svg viewBox="0 0 24 24" width="24" height="24" class="ti-icon">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          Chamados de Suporte
        </h2>
        <button id="ti-close-panel" class="ti-btn-icon" title="Fechar painel">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <div class="ti-panel-content">
        <div id="ti-contact-info" class="ti-contact-info hidden">
          <div class="ti-contact-name"></div>
          <div class="ti-contact-phone"></div>
        </div>

        <div class="ti-actions">
          <button id="ti-new-ticket" class="ti-btn ti-btn-primary">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Novo Chamado
          </button>
          <button id="ti-refresh-tickets" class="ti-btn ti-btn-secondary">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Atualizar
          </button>
        </div>

        <div id="ti-tickets-list" class="ti-tickets-list">
          <div class="ti-loading">Selecione um contato para ver os chamados</div>
        </div>

        <div id="ti-ticket-details" class="ti-ticket-details hidden">
          <!-- Detalhes do chamado serão inseridos aqui -->
        </div>
      </div>
    `;

    // Encontra o container principal do WhatsApp
    const mainContainer = document.querySelector('#app > div > div');
    if (mainContainer) {
      mainContainer.appendChild(panel);
      this.setupEventListeners();
      this.adjustWhatsAppLayout();
    }
  }

  adjustWhatsAppLayout() {
    // Ajusta o layout do WhatsApp para painel FIXO lateral
    const style = document.createElement('style');
    style.id = 'ti-layout-adjustments';
    style.textContent = `
      /* Força o WhatsApp a deixar espaço para o painel fixo */
      #app {
        margin-right: 360px !important;
      }
      
      /* Quando o painel está escondido, remove a margem */
      body.ti-panel-hidden #app {
        margin-right: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }

  setupEventListeners() {
    // Botão de fechar painel
    document.getElementById('ti-close-panel')?.addEventListener('click', () => {
      this.togglePanel(false);
    });

    // Botão de novo chamado
    document.getElementById('ti-new-ticket')?.addEventListener('click', () => {
      this.showNewTicketForm();
    });

    // Botão de atualizar
    document.getElementById('ti-refresh-tickets')?.addEventListener('click', () => {
      this.loadTickets();
    });
  }

  getChatHeader() {
    return this.chatHeader ||
      (document.querySelector('[role="main"]') || document.querySelector('#main'))?.querySelector('header');
  }

  observeHeader(header) {
    if (!header) {
      console.warn('⚠️ observeHeader chamado sem header válido');
      return;
    }

    if (this.headerObserver) {
      this.headerObserver.disconnect();
    }

    this.chatHeader = header;

    // Debounce para evitar loops infinitos
    let debounceTimer = null;
    this.headerObserver = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.detectContactChange();
      }, 300);
    });

    this.headerObserver.observe(header, { 
      childList: true, 
      subtree: false // Reduz chamadas desnecessárias
    });
    console.log('✅ Observer configurado no header da conversa');
  }

  setupObservers() {
    console.log('📌 Configurando observers...');
    const header = this.getChatHeader();

    if (header) {
      this.observeHeader(header);
    } else {
      console.warn('⚠️ Header da conversa não encontrado para observação');
    }

    const mainElement = document.querySelector('[role="main"]') || document.querySelector('#main');
    if (mainElement && !this.mainObserver) {
      // Debounce para evitar loops infinitos no main observer
      let mainDebounceTimer = null;
      this.mainObserver = new MutationObserver(() => {
        if (mainDebounceTimer) clearTimeout(mainDebounceTimer);
        mainDebounceTimer = setTimeout(() => {
          const newHeader = this.getChatHeader();
          if (newHeader && newHeader !== this.chatHeader) {
            console.log('🔁 Header da conversa recriado, atualizando observadores...');
            this.observeHeader(newHeader);
          }
        }, 500);
      });

      this.mainObserver.observe(mainElement, { 
        childList: true, 
        subtree: false // Não observa subárvores para reduzir carga
      });
      console.log('✅ Observer configurado no elemento principal da conversa');
    } else if (!mainElement) {
      console.warn('⚠️ Elemento principal do WhatsApp não encontrado para observer');
    }
  }

  addToolbarButton() {
    console.log('🔘 Tentando adicionar botão no toolbar...');
    
    // Remove botão existente se houver
    document.getElementById('ti-toolbar-btn')?.remove();

    // Usa o header salvo (da conversa, não da lista)
    const chatHeader = this.getChatHeader();

    if (!chatHeader) {
      console.error('❌ Header da conversa não encontrado');
      return;
    }

    console.log('📍 Usando header da conversa:', chatHeader);

    // Tenta múltiplos seletores para encontrar o container de botões
    const headerButtons = chatHeader.querySelector('div[role="button"]')?.parentElement ||
                         chatHeader.querySelector('[aria-label]')?.parentElement ||
                         chatHeader.querySelector('button')?.parentElement ||
                         chatHeader.lastElementChild;

    if (headerButtons) {
      console.log('✅ Container de botões encontrado');
      
      const button = document.createElement('div');
      button.id = 'ti-toolbar-btn';
      button.className = 'ti-toolbar-button';
      button.title = 'Abrir painel de chamados';
      button.innerHTML = `
        <button class="ti-btn-icon" style="background: #00a884; color: white; border: none; padding: 8px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </button>
      `;
      button.addEventListener('click', () => {
        console.log('🖱️ Botão clicado!');
        this.togglePanel();
      });
      
      headerButtons.appendChild(button);
      console.log('✅ Botão adicionado com sucesso no header DA CONVERSA!');
    } else {
      console.error('❌ Container de botões não encontrado no header');
      console.log('📋 Estrutura do header:', chatHeader.innerHTML.substring(0, 200));
    }
  }

  ensureToolbarButton() {
    // Não faz nada - painel agora é fixo, sem necessidade de botão
    return;
  }

  normalizePhone(phone) {
    if (!phone) return null;
    const digits = phone.toString().replace(/\D/g, '');
    if (!digits) return null;
    return digits.startsWith('55') ? digits.substring(2) : digits;
  }

  togglePanel(show = null) {
    const panel = document.getElementById('ti-support-panel');
    if (!panel) return;

    this.panelVisible = show !== null ? show : !this.panelVisible;
    
    // Elemento principal do WhatsApp
    const whatsappMain = document.querySelector('#main') || 
                        document.querySelector('[role="main"]') ||
                        document.querySelector('#app > div > div');
    
    if (this.panelVisible) {
      console.log('📂 Abrindo painel...');
      
      panel.classList.remove('hidden');
      
      // Ajusta largura do WhatsApp para dar espaço ao painel
      if (whatsappMain) {
        whatsappMain.style.marginRight = '400px';
        whatsappMain.style.transition = 'margin-right 0.3s ease';
      }
      
      // LIMPA cache e força recarregamento SEMPRE ao abrir
      console.log('🧹 Limpando cache de tickets...');
      this.tickets = [];
      this.currentContact = null;
      this.currentPhone = null;
      
      // Aguarda painel abrir, então detecta contato e carrega
      setTimeout(() => {
        console.log('🔍 Forçando detecção de contato ao abrir painel...');
        this.detectContactChange();
        this.loadTickets();
      }, 100);
      
    } else {
      console.log('📁 Fechando painel...');
      
      panel.classList.add('hidden');
      
      // Restaura largura do WhatsApp
      if (whatsappMain) {
        whatsappMain.style.marginRight = '0';
      }
      
      // Garante que o botão permanece visível
      setTimeout(() => {
        console.log('� Verificando botão após fechar painel...');
        this.ensureToolbarButton();
      }, 150);
    }
  }

  detectContactChange() {
    console.log('🔍 === INÍCIO detectContactChange() ===');
    console.log('💾 Estado atual - Contact:', this.currentContact, '| Phone:', this.currentPhone, '| Tickets:', this.tickets.length);
    
    // Usa o header salvo ou busca novamente
    const header = this.getChatHeader();
    if (header && header !== this.chatHeader) {
      console.log('🆕 Header diferente encontrado. Atualizando observador...');
      this.observeHeader(header);
    }
    
    if (!header) {
      console.warn('⚠️ Header não encontrado para detectar contato');
      return;
    }

    // Extrai nome do contato - tenta múltiplos seletores
    const nameElement = header.querySelector('span[dir="auto"]') ||
                       header.querySelector('[title]') ||
                       header.querySelector('span');
    
    const contactName = nameElement?.textContent?.trim() || '';

    // Extrai número de telefone (melhor esforço)
    const phone = this.extractPhoneNumber();

    console.log('🔍 Contato detectado:', { contactName, phone });

    // SEMPRE atualiza se o telefone mudou (mesmo que o nome seja igual)
    const phoneChanged = phone && phone !== this.currentPhone;
    const contactChanged = contactName && contactName !== this.currentContact;

    if (phoneChanged || contactChanged) {
      console.log('🔄 ⚠️ MUDANÇA DE CONTATO DETECTADA!');
      console.log('   📱 Anterior:', { nome: this.currentContact, tel: this.currentPhone });
      console.log('   📱 Novo:', { nome: contactName, tel: phone });
      
      this.currentContact = contactName;
      this.currentPhone = phone;
      
      // Limpa cache de chamados ao mudar de contato
      console.log('🧹 Limpando cache: this.tickets = []');
      this.tickets = [];
      
      this.updateContactInfo();
      
      // Se o painel estiver aberto, recarrega os chamados
      if (this.panelVisible) {
        console.log('📥 Painel aberto! Carregando chamados do novo contato...');
        this.loadTickets();
      } else {
        console.log('📁 Painel fechado. Aguardando abertura para carregar tickets.');
      }
    } else {
      console.log('✅ Mesmo contato. Nenhuma mudança detectada.');
    }

    // Reforça a presença do botão no header
    this.ensureToolbarButton();
  }

  extractPhoneNumber() {
    console.log('📞 Tentando extrair telefone...');
    
    // Método 1: Extrair da URL (mais confiável)
    const urlMatch = window.location.href.match(/\/(\d+)@/);
    if (urlMatch) {
      const phone = urlMatch[1];
      console.log('✅ Telefone extraído da URL:', phone);
      return phone;
    }
    
    // Método 2: Buscar no atributo data-id ou aria-label
    const header = this.chatHeader || 
                  (document.querySelector('[role="main"]') || document.querySelector('#main'))?.querySelector('header');
    
    if (header) {
      // Tenta pegar de data-id
      const dataId = header.getAttribute('data-id');
      if (dataId) {
        const match = dataId.match(/(\d+)@/);
        if (match) {
          console.log('✅ Telefone extraído de data-id:', match[1]);
          return match[1];
        }
      }
      
      // Tenta extrair do texto (busca padrão de telefone brasileiro)
      const phoneMatch = header.textContent.match(/\+?55\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}/);
      if (phoneMatch) {
        const cleanPhone = phoneMatch[0].replace(/\D/g, '');
        console.log('✅ Telefone extraído do texto:', cleanPhone);
        return cleanPhone;
      }
      
      // Tenta extrair qualquer número longo
      const anyPhone = header.textContent.match(/\d{10,15}/);
      if (anyPhone) {
        console.log('✅ Número encontrado:', anyPhone[0]);
        return anyPhone[0];
      }
    }
    
    // Método 3: Pegar da área de conversa
    const chatPane = document.querySelector('[data-id]');
    if (chatPane) {
      const dataId = chatPane.getAttribute('data-id');
      if (dataId) {
        const match = dataId.match(/(\d+)@/);
        if (match) {
          console.log('✅ Telefone extraído do chat pane:', match[1]);
          return match[1];
        }
      }
    }
    
    console.warn('⚠️ Não foi possível extrair o telefone');
    console.log('💡 URL atual:', window.location.href);
    return null;
  }

  updateContactInfo() {
    const infoDiv = document.getElementById('ti-contact-info');
    if (!infoDiv) return;

    if (this.currentContact) {
      infoDiv.classList.remove('hidden');
      infoDiv.querySelector('.ti-contact-name').textContent = this.currentContact;
      infoDiv.querySelector('.ti-contact-phone').textContent = 
        this.currentPhone ? `Tel: ${this.currentPhone}` : 'Telefone não identificado';
    } else {
      infoDiv.classList.add('hidden');
    }
  }

  async loadTickets() {
    console.log('🔄 === INÍCIO loadTickets() ===');
    console.log('📱 this.currentPhone:', this.currentPhone);
    console.log('👤 this.currentContact:', this.currentContact);
    console.log('📊 this.tickets.length:', this.tickets.length);
    
    if (!this.currentPhone) {
      console.warn('⚠️ Telefone não identificado');
      this.showMessage('📵 Telefone não identificado. Não é possível buscar chamados.', 'info');
      return;
    }

    const listDiv = document.getElementById('ti-tickets-list');
    if (!listDiv) {
      console.error('❌ Elemento ti-tickets-list não encontrado!');
      return;
    }

    listDiv.innerHTML = '<div class="ti-loading">🔍 Buscando chamados...</div>';

    try {
      // Remove +55 ou 55 do início do telefone
      let cleanPhone = this.currentPhone;
      if (cleanPhone.startsWith('55')) {
        cleanPhone = cleanPhone.substring(2);
      }
      if (cleanPhone.startsWith('+55')) {
        cleanPhone = cleanPhone.substring(3);
      }

      console.log('📞 Telefone original:', this.currentPhone);
      console.log('📞 Telefone limpo para API:', cleanPhone);

      // Faz chamada para API Milvus - listagem de chamados
      const bodyPayload = {
        filtro_body: {
          telefone: cleanPhone,  // Busca apenas por telefone (sem +55)
          status: 9  // Status 9 = Chamados em aberto
        }
      };

      console.log('📤 Enviando para API Milvus:', {
        url: `${API_BASE_URL}/chamado/listagem?total_registros=50`,
        body: bodyPayload
      });

      const response = await fetch(`${API_BASE_URL}/chamado/listagem?total_registros=50`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_TOKEN
        },
        body: JSON.stringify(bodyPayload)
      });
      
      console.log('📥 Resposta da API:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na API:', errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Dados recebidos:', data);
      
      // Adapta formato Milvus para o formato da extensão
      const tickets = data.lista ? data.lista.map(ticket => ({
        id: ticket.codigo,
        title: ticket.assunto,
        description: ticket.descricao,
        status: this.mapMilvusStatus(ticket.status),
        priority: this.mapMilvusPriority(ticket.prioridade),
        contactName: ticket.contato,
        contactPhone: ticket.telefone,
        createdAt: ticket.data_criacao,
        technician: ticket.tecnico,
        category: ticket.categoria_primaria,
        subcategory: ticket.categoria_secundaria,
        mesa: ticket.mesa_trabalho,
        lastLog: ticket.ultima_log
      })) : [];
      
      console.log(`✅ ${tickets.length} chamado(s) encontrado(s) para ${cleanPhone}`);
      console.log('📋 Tickets processados:', tickets);
      
  const normalizedCurrentPhone = this.normalizePhone(this.currentPhone);
      const normalizedCurrentName = this.currentContact ? this.currentContact.trim().toLowerCase() : null;

  console.log('🔎 Telefone atual normalizado:', normalizedCurrentPhone);
  console.log('🔎 Nome de contato normalizado:', normalizedCurrentName);

      const filteredTickets = tickets.filter(ticket => {
        const normalizedTicketPhone = this.normalizePhone(ticket.contactPhone);
        const ticketName = ticket.contactName ? ticket.contactName.trim().toLowerCase() : null;
        const phoneMatches = normalizedCurrentPhone && normalizedTicketPhone && normalizedTicketPhone === normalizedCurrentPhone;
        const nameMatches = normalizedCurrentName && ticketName && ticketName === normalizedCurrentName;
        const shouldKeep = phoneMatches || nameMatches;

        if (!shouldKeep) {
          console.log('� Descartando ticket não relacionado ao contato atual:', {
            id: ticket.id,
            contato: ticket.contactName,
            telefone: ticket.contactPhone,
            normalizedTicketPhone
          });
        }

        return shouldKeep;
      });

      console.log(`🎯 ${filteredTickets.length} chamado(s) após filtro por contato`);
      console.log('📋 Tickets após filtro:', filteredTickets);

      this.tickets = filteredTickets;
      console.log('�💾 Cache atualizado. this.tickets.length =', this.tickets.length);
      
      this.renderTickets(filteredTickets);
      
      // Mensagem quando não encontrar nada
      if (filteredTickets.length === 0) {
        console.log('📭 Renderizando estado vazio para:', cleanPhone);
        listDiv.innerHTML = `
          <div class="ti-empty">
            <svg viewBox="0 0 24 24" width="48" height="48" style="opacity: 0.3; margin-bottom: 12px;">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p style="margin: 0; font-size: 14px; color: #667781;">Nenhum chamado em aberto</p>
            <small style="color: #8696a0; margin-top: 4px;">${this.currentContact ? `Contato: ${this.currentContact}` : `Telefone: ${cleanPhone}`}</small>
          </div>
        `;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar chamados:', error);
      listDiv.innerHTML = `
        <div class="ti-error">
          <p>❌ Erro ao carregar chamados</p>
          <small>${error.message}</small>
          <button onclick="document.querySelector('#ti-refresh-tickets').click()" 
                  style="margin-top: 8px; padding: 6px 12px; background: #00a884; color: white; border: none; border-radius: 4px; cursor: pointer;">
            🔄 Tentar novamente
          </button>
          <p class="ti-hint" style="margin-top: 8px; font-size: 12px; color: #8696a0;">Verifique se o token de autenticação está configurado</p>
        </div>
      `;
    }
  }

  renderTickets(tickets) {
    const listDiv = document.getElementById('ti-tickets-list');
    if (!listDiv) return;

    console.log(`🎨 Renderizando ${tickets.length} tickets no DOM...`);
    
    // SEMPRE limpa o conteúdo anterior para evitar cache visual
    listDiv.innerHTML = '';

    if (tickets.length === 0) {
      listDiv.innerHTML = '<div class="ti-empty">Nenhum chamado em aberto</div>';
      return;
    }

    const ticketsHtml = tickets.map(ticket => `
      <div class="ti-ticket-card" data-ticket-id="${ticket.id}">
        <div class="ti-ticket-header">
          <span class="ti-ticket-id">#${ticket.id}</span>
          <span class="ti-ticket-status ti-status-${ticket.status}">${this.getStatusLabel(ticket.status)}</span>
        </div>
        <div class="ti-ticket-title">${ticket.title || 'Sem título'}</div>
        <div class="ti-ticket-meta">
          <span>Criado em: ${this.formatDate(ticket.createdAt)}</span>
          ${ticket.priority ? `<span class="ti-priority ti-priority-${ticket.priority}">${this.getPriorityLabel(ticket.priority)}</span>` : ''}
        </div>
        <div class="ti-ticket-actions">
          <button class="ti-btn-small ti-btn-view" data-ticket-id="${ticket.id}">Ver Detalhes</button>
          <button class="ti-btn-small ti-btn-comment" data-ticket-id="${ticket.id}">Comentar</button>
          ${ticket.status !== 'closed' ? `<button class="ti-btn-small ti-btn-close" data-ticket-id="${ticket.id}">Finalizar</button>` : ''}
        </div>
      </div>
    `).join('');

    listDiv.innerHTML = ticketsHtml;

    // Adiciona event listeners aos botões
    listDiv.querySelectorAll('.ti-btn-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ticketId = e.target.dataset.ticketId;
        this.showTicketDetails(ticketId);
      });
    });

    listDiv.querySelectorAll('.ti-btn-comment').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ticketId = e.target.dataset.ticketId;
        this.showCommentForm(ticketId);
      });
    });

    listDiv.querySelectorAll('.ti-btn-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ticketId = e.target.dataset.ticketId;
        this.closeTicket(ticketId);
      });
    });
  }

  async showTicketDetails(ticketId) {
    try {
      // Busca acompanhamentos do chamado na API Milvus
      const response = await fetch(`${API_BASE_URL}/chamado/acompanhamento/${ticketId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_TOKEN
        }
      });
      
      if (!response.ok) throw new Error('Erro ao carregar detalhes');
      
      const data = await response.json();
      
      // Encontra o ticket na lista local
      const ticket = this.tickets.find(t => t.id == ticketId);
      if (!ticket) throw new Error('Chamado não encontrado');
      
      // Extrai comentários dos acompanhamentos
      const comments = data.retorno ? data.retorno
        .filter(log => log.log_tipo_id === 6 && !log.is_excluido) // Tipo 6 = comentários
        .map(log => ({
          id: log.data,
          author: log.pessoa || log.tecnico || 'Sistema',
          text: log.texto_html || log.texto,
          createdAt: log.data
        })) : [];
      
      const detailsDiv = document.getElementById('ti-ticket-details');
      if (!detailsDiv) return;

      detailsDiv.innerHTML = `
        <div class="ti-detail-header">
          <button id="ti-back-to-list" class="ti-btn-icon">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h3>Chamado #${ticket.id}</h3>
        </div>
        <div class="ti-detail-content">
          <div class="ti-detail-row">
            <label>Status:</label>
            <span class="ti-ticket-status ti-status-${ticket.status}">${this.getStatusLabel(ticket.status)}</span>
          </div>
          <div class="ti-detail-row">
            <label>Assunto:</label>
            <span>${ticket.title || 'Sem assunto'}</span>
          </div>
          <div class="ti-detail-row">
            <label>Descrição:</label>
            <p>${ticket.description || 'Sem descrição'}</p>
          </div>
          ${ticket.priority ? `
            <div class="ti-detail-row">
              <label>Prioridade:</label>
              <span class="ti-priority ti-priority-${ticket.priority}">${this.getPriorityLabel(ticket.priority)}</span>
            </div>
          ` : ''}
          ${ticket.technician ? `
            <div class="ti-detail-row">
              <label>Técnico:</label>
              <span>${ticket.technician}</span>
            </div>
          ` : ''}
          ${ticket.category ? `
            <div class="ti-detail-row">
              <label>Categoria:</label>
              <span>${ticket.category}${ticket.subcategory ? ' > ' + ticket.subcategory : ''}</span>
            </div>
          ` : ''}
          ${ticket.mesa ? `
            <div class="ti-detail-row">
              <label>Mesa:</label>
              <span>${ticket.mesa}</span>
            </div>
          ` : ''}
          <div class="ti-detail-row">
            <label>Criado em:</label>
            <span>${this.formatDate(ticket.createdAt)}</span>
          </div>
          ${comments && comments.length > 0 ? `
            <div class="ti-comments">
              <h4>Acompanhamentos (${comments.length})</h4>
              ${comments.map(comment => `
                <div class="ti-comment">
                  <div class="ti-comment-header">
                    <strong>${comment.author}</strong>
                    <span>${this.formatDate(comment.createdAt)}</span>
                  </div>
                  <div>${comment.text}</div>
                </div>
              `).join('')}
            </div>
          ` : '<p class="ti-no-comments">Sem acompanhamentos</p>'}
        </div>
      `;

      detailsDiv.classList.remove('hidden');
      document.getElementById('ti-tickets-list').style.display = 'none';

      document.getElementById('ti-back-to-list')?.addEventListener('click', () => {
        detailsDiv.classList.add('hidden');
        document.getElementById('ti-tickets-list').style.display = 'block';
      });
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      this.showMessage('Erro ao carregar detalhes do chamado', 'error');
    }
  }

  showNewTicketForm() {
    const listDiv = document.getElementById('ti-tickets-list');
    if (!listDiv) return;

    const originalContent = listDiv.innerHTML;

    listDiv.innerHTML = `
      <div class="ti-form">
        <h3>Novo Chamado</h3>
        <form id="ti-new-ticket-form">
          <div class="ti-form-group">
            <label>Cliente ID *</label>
            <input type="text" id="ti-ticket-cliente" placeholder="ABC123" required />
            <small>ID ou Token do cliente no Milvus</small>
          </div>
          <div class="ti-form-group">
            <label>Assunto *</label>
            <input type="text" id="ti-ticket-title" required />
          </div>
          <div class="ti-form-group">
            <label>Descrição *</label>
            <textarea id="ti-ticket-description" rows="4" required></textarea>
          </div>
          <div class="ti-form-group">
            <label>Técnico (email)</label>
            <input type="email" id="ti-ticket-technician" placeholder="tecnico@empresa.com" />
          </div>
          <div class="ti-form-group">
            <label>Mesa de Trabalho</label>
            <input type="text" id="ti-ticket-mesa" placeholder="Mesa padrão" />
          </div>
          <div class="ti-form-group">
            <label>Setor</label>
            <input type="text" id="ti-ticket-setor" placeholder="Setor padrão" />
          </div>
          <div class="ti-form-group">
            <label>Categoria Primária</label>
            <input type="text" id="ti-ticket-cat1" placeholder="Ex: Hardware, Software" />
          </div>
          <div class="ti-form-group">
            <label>Categoria Secundária</label>
            <input type="text" id="ti-ticket-cat2" placeholder="Ex: Troca de peça, Instalação" />
          </div>
          <div class="ti-form-actions">
            <button type="submit" class="ti-btn ti-btn-primary">Criar Chamado</button>
            <button type="button" class="ti-btn ti-btn-secondary" id="ti-cancel-form">Cancelar</button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('ti-cancel-form')?.addEventListener('click', () => {
      listDiv.innerHTML = originalContent;
      this.renderTickets(this.tickets);
    });

    document.getElementById('ti-new-ticket-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.createTicket();
    });
  }

  async createTicket() {
    const cliente_id = document.getElementById('ti-ticket-cliente')?.value;
    const assunto = document.getElementById('ti-ticket-title')?.value;
    const descricao = document.getElementById('ti-ticket-description')?.value;
    const tecnico = document.getElementById('ti-ticket-technician')?.value;
    const mesa = document.getElementById('ti-ticket-mesa')?.value;
    const setor = document.getElementById('ti-ticket-setor')?.value;
    const categoria1 = document.getElementById('ti-ticket-cat1')?.value;
    const categoria2 = document.getElementById('ti-ticket-cat2')?.value;

    try {
      // Cria chamado na API Milvus
      const payload = {
        cliente_id: cliente_id,
        chamado_assunto: assunto,
        chamado_descricao: descricao,
        chamado_email: '',
        chamado_telefone: this.currentPhone || '',
        chamado_contato: this.currentContact || 'WhatsApp',
      };

      // Campos opcionais
      if (tecnico) payload.chamado_tecnico = tecnico;
      if (mesa) payload.chamado_mesa = mesa;
      if (setor) payload.chamado_setor = setor;
      if (categoria1) payload.chamado_categoria_primaria = categoria1;
      if (categoria2) payload.chamado_categoria_secundaria = categoria2;

      const response = await fetch(`${API_BASE_URL}/chamado/criar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_TOKEN
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Erro ao criar chamado');

      const ticketCode = await response.text();
      this.showMessage(`Chamado #${ticketCode} criado com sucesso!`, 'success');
      await this.loadTickets();
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      this.showMessage('Erro ao criar chamado: ' + error.message, 'error');
    }
  }

  showCommentForm(ticketId) {
    const card = document.querySelector(`[data-ticket-id="${ticketId}"]`);
    if (!card) return;

    const existingForm = card.querySelector('.ti-comment-form');
    if (existingForm) {
      existingForm.remove();
      return;
    }

    const form = document.createElement('div');
    form.className = 'ti-comment-form';
    form.innerHTML = `
      <textarea placeholder="Adicionar comentário..." rows="3"></textarea>
      <div class="ti-form-actions">
        <button class="ti-btn-small ti-btn-primary">Enviar</button>
        <button class="ti-btn-small ti-btn-secondary">Cancelar</button>
      </div>
    `;

    card.appendChild(form);

    const textarea = form.querySelector('textarea');
    const btnSend = form.querySelector('.ti-btn-primary');
    const btnCancel = form.querySelector('.ti-btn-secondary');

    btnSend.addEventListener('click', async () => {
      const comment = textarea.value.trim();
      if (!comment) return;

      await this.addComment(ticketId, comment);
      form.remove();
    });

    btnCancel.addEventListener('click', () => {
      form.remove();
    });
  }

  async addComment(ticketId, comment) {
    try {
      // Adiciona acompanhamento na API Milvus
      const response = await fetch(`${API_BASE_URL}/chamado/acompanhamento/criar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_TOKEN
        },
        body: JSON.stringify({
          acompanhamento_ticket: ticketId.toString(),
          acompanhamento_descricao: comment,
          acompanhamento_privado: false
        })
      });

      if (!response.ok) throw new Error('Erro ao adicionar acompanhamento');

      this.showMessage('Acompanhamento adicionado!', 'success');
      await this.loadTickets();
    } catch (error) {
      console.error('Erro ao adicionar acompanhamento:', error);
      this.showMessage('Erro ao adicionar acompanhamento', 'error');
    }
  }

  async closeTicket(ticketId) {
    if (!confirm('Deseja realmente finalizar este chamado?')) return;

    try {
      // Finaliza chamado na API Milvus
      const response = await fetch(`${API_BASE_URL}/chamado/finalizar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_TOKEN
        },
        body: JSON.stringify({
          chamado_codigo: ticketId.toString(),
          chamado_servico_realizado: 'Atendido via WhatsApp',
          chamado_equipamento_retirado: '',
          chamado_material_utilizado: ''
        })
      });

      if (!response.ok) throw new Error('Erro ao finalizar chamado');

      this.showMessage('Chamado finalizado!', 'success');
      await this.loadTickets();
    } catch (error) {
      console.error('Erro ao finalizar chamado:', error);
      this.showMessage('Erro ao finalizar chamado', 'error');
    }
  }

  showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `ti-toast ti-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('ti-toast-show');
    }, 100);

    setTimeout(() => {
      toast.classList.remove('ti-toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  getStatusLabel(status) {
    const labels = {
      open: 'Aberto',
      in_progress: 'Em Andamento',
      pending: 'Pendente',
      closed: 'Fechado',
      paused: 'Pausado',
      scheduled: 'Agendado',
      conference: 'Conferência'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority) {
    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      urgent: 'Urgente',
      critical: 'Crítico'
    };
    return labels[priority] || priority;
  }

  // Mapeia status do Milvus para formato da extensão
  mapMilvusStatus(status) {
    const statusMap = {
      'AgAtendimento': 'open',
      'A fazer': 'open',
      'Atendendo': 'in_progress',
      'Pausado': 'paused',
      'Finalizado': 'closed',
      'Conferência': 'conference',
      'Agendado': 'scheduled',
      'Expirado': 'closed',
      'Ag. solução': 'pending'
    };
    return statusMap[status] || 'open';
  }

  // Mapeia prioridade do Milvus para formato da extensão
  mapMilvusPriority(prioridade) {
    const priorityMap = {
      'Crítico': 'critical',
      'Alta': 'high',
      'Média': 'medium',
      'Baixa': 'low',
      'Urgente': 'urgent'
    };
    return priorityMap[prioridade] || 'medium';
  }

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Inicializa a extensão quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WhatsAppSupportExtension();
  });
} else {
  new WhatsAppSupportExtension();
}
