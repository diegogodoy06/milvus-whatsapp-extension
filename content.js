// Content Script - Injetado no WhatsApp Web
console.log('WhatsApp Suporte TI - Extensão Milvus carregada');

// Configuração da API Milvus (pode ser alterada via popup)
let API_BASE_URL = 'https://apiintegracao.milvus.com.br/api'; // URL da API Milvus
let API_TOKEN = ''; // Token de autenticação
let GEMINI_API_KEY = '';

// Mapeamento de Categorias do Milvus (Categoria Primária | Categoria Secundária : ID)
const MILVUS_CATEGORIES = {
  'Acessos': '157982',
  'Acessos | Liberação Portões Estoque': '631701',
  'Acessos | Recuperação de senha': '631422',
  'Acessos | Liberação de Sites / Firewall': '631421',
  'Acessos | Liberação de acesso Outros': '631419',
  'Acessos | Liberação de acesso Alarme': '631417',
  'Acessos | Remoção de Acessos': '563653',
  'Acessos | Liberação de funções ERP': '563543',
  'Acessos | Liberação de acesso Pastas (NAS)': '562350',
  'Acessos | Novo colaborador / Cadastro de funcionário': '562349',
  'Backup': '157479',
  'Backup | Execução': '631424',
  'Backup | Restore Execução': '561052',
  'Backup | Corrompido': '559948',
  'Backup | Não rodou': '559947',
  'Gerencial': '157749',
  'Gerencial | Prestação de contas': '631425',
  'Gerencial | Relatórios gerenciais / Saída': '561068',
  'Gerencial | Procedimento Operacional': '561063',
  'Gerencial | Torno CNC / Prorrogar expiração mensal': '561061',
  'Hardware': '157480',
  'Hardware | Outros tipos de aprovações': '631595',
  'Hardware | Configuração inicial': '631426',
  'Hardware | Mudança física': '621634',
  'Hardware | Passagem de cabos': '580941',
  'Hardware | Computador Não liga': '561075',
  'Hardware | Mouse / Teclado / Monitor / Outros': '561074',
  'Hardware | Limpeza': '559950',
  'Hardware | Troca de peça': '559949',
  'Impressoras': '159289',
  'Impressoras | Outros Problemas de impressão': '631427',
  'Impressoras | Suprimentos / Troca de Tonner': '567350',
  'Impressoras | Manutenção': '567349',
  'Impressoras | Instalação': '567348',
  'Servidor': '157482',
  'Servidor | Servidor NAS': '561090',
  'Servidor | Servidor Windows': '561086',
  'Servidor | Outros servidores / Virtualização': '559955',
  'Software': '157481',
  'Software | Instalação / Configuração / Remoção': '631443',
  'Software | Formatação': '563670',
  'Software | SolidWorks': '561114',
  'Software | Adobe / Corel': '561111',
  'Software | Sistema Operacional Problemas': '561107',
  'Software | Contratar software / licença': '561103',
  'Software | ERP Ajuste / Parametrização': '559953',
  'Software | ERP Erro no sistema': '559951',
  'Telefonia': '157751',
  'Telefonia | Relatórios': '633559',
  'Telefonia | Problema com Aparelho': '631428',
  'Telefonia | Ramal Problema': '561126',
  'Telefonia | Ramal Configurar / Instalar': '561125',
  'Telefonia | Problema linha móvel / chip': '561123',
  'Telefonia | Contratar Ramal / Linha / Linha Móvel': '561122'
};

// Carrega configurações salvas
chrome.storage.sync.get(['apiBaseUrl', 'apiToken', 'geminiApiKey'], (result) => {
  if (result.apiBaseUrl) {
    API_BASE_URL = result.apiBaseUrl;
  }
  if (result.apiToken) {
    API_TOKEN = result.apiToken;
  }
  if (result.geminiApiKey) {
    GEMINI_API_KEY = result.geminiApiKey;
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  if (changes.apiToken?.newValue) {
    API_TOKEN = changes.apiToken.newValue;
  }
  if (changes.apiBaseUrl?.newValue) {
    API_BASE_URL = changes.apiBaseUrl.newValue;
  }
  if ('geminiApiKey' in changes) {
    GEMINI_API_KEY = changes.geminiApiKey?.newValue || '';
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
    this.chatListObserver = null;
  this.messageObserver = null;
  this.contextMenuObserver = null;
  this.lastContextMenuMessage = null;
    this.contactDetectionTimer = null;
    this.pendingPhoneRetryCount = 0;
    this.pendingNameRetryCount = 0;
  this.suppressNextTicketLoad = false;
    this.init();
  }

  init() {
    console.log('🚀 Inicializando extensão...');
    
    // Detecta e aplica tema do WhatsApp
    this.detectAndApplyTheme();
    
    // Injeta o painel IMEDIATAMENTE
    this.injectPanel();
    
    // Aguarda o WhatsApp Web carregar para configurar observers
    this.waitForWhatsAppLoad();
  }

  scheduleContactDetection(delay = 400, reason = '') {
    if (this.contactDetectionTimer) {
      clearTimeout(this.contactDetectionTimer);
      this.contactDetectionTimer = null;
    }

    if (reason) {
      console.log(`⏱️ Reagendando detecção (${reason}) em ${delay}ms`);
    }

    this.contactDetectionTimer = setTimeout(() => {
      this.contactDetectionTimer = null;
      this.detectContactChange();
    }, delay);
  }

  detectAndApplyTheme() {
    // Detecta se o WhatsApp está em modo escuro
    const isDark = document.body.classList.contains('dark') ||
                   document.documentElement.getAttribute('data-theme') === 'dark' ||
                   document.documentElement.getAttribute('data-color-scheme') === 'dark' ||
                   getComputedStyle(document.body).backgroundColor === 'rgb(17, 27, 33)';
    
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
      console.log('🌙 Modo escuro detectado e aplicado');
    } else {
      document.body.setAttribute('data-theme', 'light');
      console.log('☀️ Modo claro detectado e aplicado');
    }
    
    // Observer para detectar mudanças de tema
    const themeObserver = new MutationObserver(() => {
      this.detectAndApplyTheme();
    });
    
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-color-scheme', 'class']
    });
    
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  waitForWhatsAppLoad() {
    console.log('⏳ Aguardando WhatsApp Web carregar...');
    let attempts = 0;
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      // Verifica se o WhatsApp está carregado (qualquer elemento principal)
      const appElement = document.querySelector('#app');
      const hasLoaded = appElement && appElement.querySelector('[data-testid], [role]');
      
      if (hasLoaded) {
        clearInterval(checkInterval);
        console.log('✅ WhatsApp Web carregado!');
        
        // Mostra o painel automaticamente
        setTimeout(() => {
          console.log('� Mostrando painel fixo lateral automaticamente...');
          this.togglePanel(true);
        }, 500);
        
        // Configura observers para detectar mudanças de contato
        this.setupObservers();
        
      } else if (attempts > 60) {
        clearInterval(checkInterval);
        console.error('❌ Timeout: WhatsApp não carregou após 60 tentativas');
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

    // Injeta direto no BODY para garantir que sempre apareça
    console.log('💉 Injetando painel no body...');
    document.body.appendChild(panel);
    
    // Inicializa com painel oculto
    document.body.classList.add('ti-panel-hidden');
    
    // Cria botão flutuante para abrir/fechar o painel
    this.createFloatingButton();
    
    this.setupEventListeners();
    this.adjustWhatsAppLayout();
    
    console.log('✅ Painel injetado com sucesso!');
  }

  createFloatingButton() {
    const button = document.createElement('button');
    button.id = 'ti-floating-toggle';
    button.className = 'ti-floating-toggle';
    button.title = 'Abrir/Fechar Chamados';
    button.innerHTML = `
      <svg viewBox="0 0 24 24" width="28" height="28">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    `;
    
    button.addEventListener('click', () => {
      console.log('🖱️ Botão flutuante clicado!');
      this.togglePanel();
    });
    
    document.body.appendChild(button);
    console.log('✅ Botão flutuante criado');
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
    
    // Observer na URL para detectar mudanças de conversa
    let lastUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        console.log('🔗 URL mudou:', currentUrl);
        lastUrl = currentUrl;
        this.scheduleContactDetection(900, 'mudança de URL');
      }
    });
    
    urlObserver.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    console.log('✅ Observer de URL configurado');
    
    // Detecção inicial imediata
    this.scheduleContactDetection(1000, 'detecção inicial');
    
    // Tenta configurar observer no header se existir
    const header = this.getChatHeader();
    if (header) {
      this.observeHeader(header);
    }
    
    // Observer no main element para detectar quando um header é criado
    const mainElement = document.querySelector('[role="main"]') || document.querySelector('#main');
    if (mainElement && !this.mainObserver) {
      let mainDebounceTimer = null;
      this.mainObserver = new MutationObserver(() => {
        if (mainDebounceTimer) clearTimeout(mainDebounceTimer);
        mainDebounceTimer = setTimeout(() => {
          const newHeader = this.getChatHeader();
          if (newHeader && newHeader !== this.chatHeader) {
            console.log('🔁 Header da conversa recriado, detectando contato...');
            this.observeHeader(newHeader);
            this.scheduleContactDetection(400, 'header recriado');
          }
        }, 500);
      });

      this.mainObserver.observe(mainElement, { 
        childList: true, 
        subtree: false
      });
      console.log('✅ Observer configurado no elemento principal');
    }

    // Observer na lista de chats para capturar seleção de novos contatos
    const chatList = document.querySelector('[data-testid="chat-list"]') ||
                     document.querySelector('[role="grid"]');

    if (chatList && !this.chatListObserver) {
      let chatListDebounce = null;
      this.chatListObserver = new MutationObserver(() => {
        if (chatListDebounce) clearTimeout(chatListDebounce);
        chatListDebounce = setTimeout(() => {
          console.log('📚 Mudança detectada na lista de chats');
          this.scheduleContactDetection(350, 'lista de chats atualizada');
        }, 200);
      });

      this.chatListObserver.observe(chatList, {
        childList: true,
        subtree: true
      });

      // Captura clique direto nos contatos
      chatList.addEventListener('click', () => {
        console.log('🖱️ Clique na lista de chats');
        this.scheduleContactDetection(350, 'clique na lista de chats');
      }, true);

      console.log('✅ Observer configurado na lista de chats');
    }

    // Configura ações nas mensagens (botão de chamado)
    console.log('🎫 Configurando ações de mensagens...');
    setTimeout(() => this.setupMessageActions(), 1500);
  }

  setupMessageActions() {
    if (this.messageObserver) {
      this.messageObserver.disconnect();
      this.messageObserver = null;
    }

    // Tenta múltiplos seletores para área de mensagens
    const messagesArea = document.querySelector('#main') ||
                         document.querySelector('[role="main"]') ||
                         document.querySelector('[data-testid="conversation-panel-messages"]') ||
                         document.querySelector('[data-testid="conversation-panel-body"]') ||
                         document.querySelector('div[role="application"]');

    if (!messagesArea) {
      console.log('ℹ️ Área de mensagens (#main ou [role="main"]) não encontrada. Tentando novamente em 2s...');
      setTimeout(() => this.setupMessageActions(), 2000);
      return;
    }

    console.log('✅ Área de mensagens encontrada:', messagesArea.id || messagesArea.getAttribute('role') || 'elemento detectado');

    const attachButtons = () => {
      // Tenta seletores mais genéricos para mensagens
      let messageNodes = [];
      
      // Busca por divs com classes que contenham 'message'
      const allDivs = messagesArea.querySelectorAll('div[class*="message"]');
      allDivs.forEach(div => {
        // Verifica se é uma mensagem real (tem texto ou mídia)
        const hasText = div.querySelector('span[dir="ltr"], span[dir="rtl"], span[dir="auto"]');
        const hasMedia = div.querySelector('img, video, audio');
        
        if ((hasText || hasMedia) && !div.getAttribute('data-ti-action')) {
          messageNodes.push(div);
        }
      });
      
      console.log(`🔍 Encontradas ${messageNodes.length} mensagens para adicionar botões`);
      messageNodes.forEach(node => this.attachMessageAction(node));
    };

    attachButtons();

    this.messageObserver = new MutationObserver(() => {
      attachButtons();
    });

    this.messageObserver.observe(messagesArea, {
      childList: true,
      subtree: true
    });

    console.log('✅ Observer de mensagens configurado');
    this.setupContextMenuObserver();
  }

  setupContextMenuObserver() {
    if (this.contextMenuObserver) {
      return;
    }

    this.contextMenuObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;

          const menus = node.matches('[role="menu"]') ? [node] : Array.from(node.querySelectorAll('[role="menu"]'));
          menus.forEach(menu => this.injectContextMenuItem(menu));
        });
      }
    });

    this.contextMenuObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  injectContextMenuItem(menuElement) {
    if (!menuElement || menuElement.querySelector('[data-ti-menu-item="open-ticket"]')) {
      return;
    }

    if (!this.lastContextMenuMessage || !document.contains(this.lastContextMenuMessage)) {
      return;
    }

    const sampleItem = menuElement.querySelector('[role="menuitem"]');
    const menuItem = document.createElement('div');
    menuItem.setAttribute('role', sampleItem?.getAttribute('role') || 'menuitem');
    menuItem.setAttribute('data-ti-menu-item', 'open-ticket');
    menuItem.className = `${sampleItem?.className || ''} ti-context-menu-item`.trim();

    const labelWrapper = document.createElement('div');
    labelWrapper.className = sampleItem?.firstElementChild?.className || '';
    labelWrapper.classList.add('ti-context-menu-label');

    const textSpan = document.createElement('span');
    textSpan.className = sampleItem?.querySelector('span')?.className || '';
    textSpan.textContent = 'Abrir chamado';

    labelWrapper.appendChild(textSpan);
    menuItem.appendChild(labelWrapper);

    menuItem.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const targetMessage = this.lastContextMenuMessage;
      this.lastContextMenuMessage = null;

      if (targetMessage) {
        this.handleMessageTicket(targetMessage);
      } else {
        this.showMessage('Não foi possível identificar a mensagem selecionada.', 'error');
      }

      setTimeout(() => {
        const escEvent = new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, which: 27, bubbles: true });
        document.dispatchEvent(escEvent);
      }, 0);
    });

    menuElement.appendChild(menuItem);
  }

  attachMessageAction(messageElement) {
    if (!messageElement || messageElement.getAttribute('data-ti-action')) {
      return;
    }

    const messageText = this.extractMessageTextFromBubble(messageElement);
    if (!messageText) {
      return;
    }

    messageElement.setAttribute('data-ti-action', 'true');

    // Detecta clique na setinha (menu dropdown) da mensagem para injetar no menu
    const detectMenuClick = () => {
      const menuButton = messageElement.querySelector('[data-testid="msg-menu"], [data-icon="down-context"], button[aria-label*="Menu"], span[data-icon="down"]');
      if (menuButton && !menuButton.getAttribute('data-ti-listener')) {
        menuButton.setAttribute('data-ti-listener', 'true');
        menuButton.addEventListener('click', () => {
          this.lastContextMenuMessage = messageElement;
          console.log('📌 Menu clicado, mensagem armazenada');
        }, { capture: true });
      }
    };

    // Tenta detectar imediatamente
    detectMenuClick();

    // Cria botão customizado simples que sempre aparece
    const ticketBtn = document.createElement('button');
    ticketBtn.type = 'button';
    ticketBtn.className = 'ti-simple-ticket-btn';
    ticketBtn.title = 'Criar chamado de suporte';
    ticketBtn.innerHTML = '🎫';

    ticketBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();
      console.log('🎫 Botão de chamado clicado!');
      this.handleMessageTicket(messageElement);
    });

    // Adiciona o botão diretamente no container da mensagem
    messageElement.style.position = 'relative';
    messageElement.appendChild(ticketBtn);

    // Ao fazer hover, tenta detectar novamente a setinha
    messageElement.addEventListener('mouseenter', () => {
      detectMenuClick();
    }, { once: false });

    console.log('✅ Botão de chamado adicionado à mensagem');
  }

  injectTicketButtonInMessageActions(messageElement) {
    // Função removida - usando abordagem mais simples acima
  }

  extractMessageTextFromBubble(messageElement) {
    if (!messageElement) return '';

    const selectors = [
      '[data-testid="msg-text"] span',
      'span.selectable-text span',
      'span[dir="auto"]'
    ];

    const parts = [];
    const seen = new Set();

    selectors.forEach(selector => {
      messageElement.querySelectorAll(selector).forEach(node => {
        const text = node.textContent?.trim();
        if (text && !seen.has(text)) {
          seen.add(text);
          parts.push(text);
        }
      });
    });

    if (parts.length === 0) {
      const clone = messageElement.cloneNode(true);
      clone.querySelectorAll('.ti-message-action-btn').forEach(btn => btn.remove());
      const raw = clone.textContent?.trim() || '';
      if (!raw) return '';

      const lines = raw.split('\n').map(line => line.trim()).filter(Boolean);
      if (lines.length > 1 && /\d{2}:\d{2}/.test(lines[lines.length - 1])) {
        lines.pop();
      }
      return lines.join('\n').trim();
    }

    return parts.join('\n').trim();
  }

  async handleMessageTicket(messageElement) {
    const messageText = this.extractMessageTextFromBubble(messageElement);

    if (!messageText) {
      this.showMessage('Não foi possível capturar o texto da mensagem selecionada.', 'error');
      return;
    }

    if (!GEMINI_API_KEY) {
      this.showMessage('Configure a chave da Gemini API nas configurações da extensão.', 'error');
      return;
    }

    try {
      if (!this.panelVisible) {
        this.suppressNextTicketLoad = true;
        this.togglePanel(true);
      }

      this.showMessage('💡 Gerando sugestão de chamado com Gemini...', 'info');

      const suggestion = await this.generateTicketSuggestion(messageText);

      if (suggestion.notice) {
        this.showMessage(suggestion.notice, 'info');
      } else {
        this.showMessage('✅ Sugestão criada! Revise os campos antes de enviar.', 'success');
      }

      this.showNewTicketForm({
        title: suggestion.title || '',
        description: suggestion.description || messageText,
        contactName: this.currentContact,
        contactPhone: this.currentPhone,
        originalMessage: messageText,
        categoryId: suggestion.categoryId,
        primaryCategory: suggestion.primaryCategory,
        secondaryCategory: suggestion.secondaryCategory,
        source: suggestion.source || 'gemini'
      });
    } catch (error) {
      console.error('Erro ao gerar sugestão com Gemini:', error);
      this.showMessage(`Falha ao gerar sugestão: ${error.message}`, 'error');

      this.showNewTicketForm({
        title: '',
        description: messageText,
        contactName: this.currentContact,
        contactPhone: this.currentPhone,
        originalMessage: messageText,
        source: 'manual'
      });
    }
  }

  async generateTicketSuggestion(messageText) {
    const sanitizedMessage = messageText.trim().slice(0, 4000);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    // Lista de categorias disponíveis para o Gemini escolher
    const categoriesText = Object.keys(MILVUS_CATEGORIES).join('\n- ');

    const prompt = `Você é um analista de suporte técnico. Analise a mensagem e:
1. Gere um título curto (até 80 caracteres)
2. Crie uma descrição detalhada
3. ESCOLHA a categoria mais adequada desta lista (use EXATAMENTE como está escrito):

CATEGORIAS DISPONÍVEIS:
- ${categoriesText}

Responda APENAS em JSON com o formato:
{
  "title": "...",
  "description": "...",
  "category": "categoria exata da lista"
}

Use um tom profissional e claro em português.

Mensagem do usuário: """${sanitizedMessage}"""`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.35,
        topP: 0.95,
        maxOutputTokens: 512
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.error?.message || 'Erro desconhecido na Gemini API';
      throw new Error(errorMessage);
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const combinedText = parts.map(part => part.text).filter(Boolean).join('\n').trim();

    if (!combinedText) {
      return {
        title: '',
        description: sanitizedMessage,
        category: null,
        categoryId: null,
        notice: 'Não foi possível gerar sugestão automática. Mensagem original carregada.',
        source: 'gemini'
      };
    }

    const cleaned = combinedText
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      
      // Extrai categoria primária e secundária
      let categoryId = null;
      let primaryCategory = null;
      let secondaryCategory = null;
      
      if (parsed.category && MILVUS_CATEGORIES[parsed.category]) {
        categoryId = MILVUS_CATEGORIES[parsed.category];
        
        // Separa categoria primária | secundária
        if (parsed.category.includes(' | ')) {
          const parts = parsed.category.split(' | ');
          primaryCategory = parts[0].trim();
          secondaryCategory = parts[1].trim();
        } else {
          primaryCategory = parsed.category;
        }
      }
      
      return {
        title: typeof parsed.title === 'string' ? parsed.title.trim() : '',
        description: typeof parsed.description === 'string' ? parsed.description.trim() : sanitizedMessage,
        category: parsed.category,
        categoryId: categoryId,
        primaryCategory: primaryCategory,
        secondaryCategory: secondaryCategory,
        source: 'gemini'
      };
    } catch (error) {
      console.warn('Não foi possível interpretar resposta da Gemini como JSON. Texto bruto:', combinedText);
      return {
        title: '',
        description: sanitizedMessage,
        category: null,
        categoryId: null,
        notice: 'Sugestão recebida em formato inesperado. Mensagem original carregada.',
        source: 'gemini'
      };
    }
  }

  async generateCommentRefinement(originalComment, context = {}) {
    const sanitizedComment = originalComment.trim().slice(0, 4000);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    const ticketInfo = context.ticketId ? `#${context.ticketId}` : 'desconhecido';
    const contactInfo = context.contactName ? context.contactName : (context.contactPhone || 'Contato não identificado');

    const prompt = `Atue como um analista de suporte técnico experiente. Reescreva o comentário abaixo em português, mantendo todas as informações essenciais, mas deixando o texto claro, objetivo e profissional. Não inclua saudações nem repita informações já implícitas. Se faltar contexto, apenas organize melhor o que já existe.

Contexto:
- Chamado: ${ticketInfo}
- Contato: ${contactInfo}

Comente somente o necessário para registrar o andamento ou comunicação com o cliente.

Retorne APENAS em JSON com o formato {"comment":"texto refinado"}.

Comentário original: """${sanitizedComment}"""`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: 256
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.error?.message || 'Erro desconhecido na Gemini API';
      throw new Error(errorMessage);
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const combinedText = parts.map(part => part.text).filter(Boolean).join('\n').trim();

    if (!combinedText) {
      return sanitizedComment;
    }

    const cleaned = combinedText
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      const refined = typeof parsed.comment === 'string' ? parsed.comment.trim() : '';
      return refined || sanitizedComment;
    } catch (error) {
      console.warn('Não foi possível interpretar resposta da Gemini para comentário. Texto bruto:', combinedText);
      return sanitizedComment;
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
      
      // Limpa APENAS os tickets (mantém contato e telefone)
      console.log('🧹 Limpando cache de tickets (mantendo informações do contato)...');
      this.tickets = [];
      
      const shouldLoadTickets = !this.suppressNextTicketLoad;
      this.suppressNextTicketLoad = false;

      // Aguarda painel abrir, então verifica se tem contato e carrega tickets
      setTimeout(() => {
        console.log('🔍 Verificando contato atual ao abrir painel...');
        
        // Se não tem contato detectado, força detecção
        if (!this.currentPhone) {
          console.log('⚠️ Contato não detectado, forçando detecção...');
          this.detectContactChange();
        } else {
          console.log('✅ Contato já detectado:', { nome: this.currentContact, tel: this.currentPhone });
          this.updateContactInfo();
        }
        
        // Carrega tickets se houver telefone
        if (this.currentPhone && shouldLoadTickets) {
          console.log('📥 Carregando tickets...');
          this.loadTickets();
        } else if (this.currentPhone && !shouldLoadTickets) {
          console.log('🛑 Carregamento automático de tickets suprimido para formulário rápido.');
        } else {
          console.log('⏳ Aguardando detecção de telefone...');
        }
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

  async detectContactChange() {
    console.log('🔍 === INÍCIO detectContactChange() ===');
    console.log('💾 Estado atual - Contact:', this.currentContact, '| Phone:', this.currentPhone, '| Tickets:', this.tickets.length);
    
    const headerElement = this.getChatHeader();
    const conversationPanel = document.querySelector('[data-testid="conversation-panel-messages"]') ||
                              document.querySelector('[data-testid="conversation-panel"]') ||
                              document.querySelector('[data-testid="conversation-panel-body"]');
    
    // Extrai número de telefone PRIMEIRO (mais confiável que header)
    const phone = this.extractPhoneNumber();
    
    const hasConversation = !!phone || !!headerElement || !!conversationPanel;
    console.log('🧭 Estado da conversa:', {
      headerEncontrado: !!headerElement,
      painelEncontrado: !!conversationPanel,
      telefoneDetectado: phone
    });
    
    if (!hasConversation) {
      console.log('📭 Nenhuma conversa ativa no momento');
      
      if (this.currentContact || this.currentPhone || this.tickets.length > 0) {
        console.log('🧹 Limpando dados do contato anterior');
        this.currentContact = null;
        this.currentPhone = null;
        this.tickets = [];
      }

      this.pendingPhoneRetryCount = 0;
      this.pendingNameRetryCount = 0;

      if (this.messageObserver) {
        this.messageObserver.disconnect();
        this.messageObserver = null;
      }
      this.updateContactInfo();
      return;
    }

    if (!phone) {
      this.pendingPhoneRetryCount += 1;

      if (this.pendingPhoneRetryCount <= 6) {
        this.scheduleContactDetection(350 + this.pendingPhoneRetryCount * 100, `tentativa ${this.pendingPhoneRetryCount} sem telefone`);
        return;
      }

      console.warn('⚠️ Não foi possível detectar o telefone após múltiplas tentativas');
    } else {
      this.pendingPhoneRetryCount = 0;
    }
    
    // Extrai nome do contato - tenta múltiplos seletores
    let contactName = '';
    let shouldRetryName = false;
    
    console.log('👤 Iniciando extração de nome do contato...');
    
    // SOLUÇÃO DEFINITIVA: SEMPRE re-buscar header (nunca usar cache/parâmetro)
    const header = document.querySelector('header[data-testid="conversation-header"]') ||
                   document.querySelector('#main header') ||
                   document.querySelector('div[data-testid="conversation-header"] header') ||
                   document.querySelector('div[data-testid="conversation-header"]');
    
    if (header) {
      console.log('📋 Header encontrado, buscando nome...');
      
      // MÉTODO DEFINITIVO: Buscar o span de nome usando a estrutura conhecida
      
      // 1. Buscar pelo atributo title (mais confiável - contém nome completo)
      const spanWithTitle = header.querySelector('span[dir="auto"][title]');
      if (spanWithTitle?.title) {
        contactName = spanWithTitle.title.trim();
        console.log('✅ Nome extraído de span[title]:', contactName);
      }
      
      const invalidPatterns = [
        /^\+?\d+$/,
        /^online$/i,
        /^digitando/i,
        /^gravando [a\u00e1]udio/i,
        /^escrevendo/i,
        /^typing/i,
        /visto por \u00faltimo/i,
        /\u00faltima vez/i,
        /^conectando/i,
        /^dispon[i\u00ed]vel$/i,
        /^whatsapp$/i
      ];

      const isValidNameText = (text) => {
        if (!text) return false;
        const normalized = text.trim();
        if (normalized.length < 2) return false;
        return !invalidPatterns.some(pattern => pattern.test(normalized));
      };

      // 2. Buscar no container principal de informações
      if (!contactName) {
        const headerContent = header.querySelector('div[role="button"]');
        if (headerContent) {
          // Pega TODOS os spans, filtra os que têm texto válido
          const allSpans = Array.from(headerContent.querySelectorAll('span[dir="auto"]'));
          console.log('🔎 Spans encontrados no botão:', allSpans.length);
          
          for (const span of allSpans) {
            const text = span.textContent?.trim();
            console.log('  → Span text:', text);
            if (!isValidNameText(text)) continue;

            const candidate = text.trim();
            contactName = candidate;
            console.log('✅ Nome extraído de span válido:', contactName);
            break;
          }
        }
      }
      
      // 3. Fallback: buscar qualquer span com texto
      if (!contactName) {
        const anySpan = header.querySelector('span[dir="auto"]');
        if (anySpan?.textContent?.trim()) {
          const text = anySpan.textContent.trim();
          if (isValidNameText(text)) {
            contactName = text;
            console.log('✅ Nome extraído de anySpan (fallback):', contactName);
          }
        }
      }

      // 4. Fallback final: analisar texto bruto do header
      if (!contactName) {
        const headerText = (header.innerText || header.textContent || '').trim();
        console.log('🧾 headerText:', headerText);
        if (headerText) {
          const candidates = headerText
            .split('\n')
            .map(line => line.trim())
            .filter(isValidNameText);

          if (candidates.length > 0) {
            contactName = candidates[0];
            console.log('✅ Nome extraído de headerText:', contactName);
          }
        }
      }
      
      if (!contactName) {
        shouldRetryName = true;
        console.log('⚠️ Nenhum elemento de nome encontrado no header');
      }
      
      // Atualiza cache do header
      this.chatHeader = header;
    } else {
      shouldRetryName = true;
      console.log('❌ Header não encontrado');
    }

    // Método 2: Busca no chat selecionado da lista lateral
    if (!contactName) {
      console.log('🔍 Tentando método 2: lista lateral...');
      const selectedChat = document.querySelector('[data-testid="cell-frame-container"][aria-selected="true"]') ||
                            document.querySelector('[data-testid="conversation-list-item"][aria-selected="true"]');
      if (selectedChat) {
        const selectedTitle = selectedChat.getAttribute('title');
        if (selectedTitle) {
          contactName = selectedTitle.trim();
          console.log('✅ Nome extraído da lista lateral (title):', contactName);
        } else {
          const possibleNames = Array.from(selectedChat.querySelectorAll('span[dir="auto"]'))
            .map(span => span.textContent?.trim())
            .filter(text => text && text.length > 0 && !/\d{6,}/.test(text));
          if (possibleNames.length > 0) {
            contactName = possibleNames[0];
            console.log('✅ Nome extraído da lista lateral (span):', contactName);
          }
        }
      }
    }

    // Método 3: Busca em atributos do header
    if (!contactName && header) {
      console.log('🔍 Tentando método 3: aria-label...');
      const ariaLabel = header.getAttribute('aria-label');
      if (ariaLabel) {
        contactName = ariaLabel.split(',')[0]?.trim() || '';
        console.log('✅ Nome extraído de aria-label:', contactName);
      }
    }

    // Método 4: Se não encontrou nome ou pegou um número, usa fallback
    const nameLooksLikePhone = contactName && (/^\+?\d+$/.test(contactName) || /^Contato \(/.test(contactName));
    if (!contactName || nameLooksLikePhone) {
      console.log('⚠️ Nome não encontrado ou parece número, usando fallback...');
      if (phone) {
        contactName = `Contato (${phone})`;
        shouldRetryName = true;
        console.log('📝 Fallback: Contato (' + phone + ')');
      } else {
        contactName = 'Contato sem nome';
        shouldRetryName = true;
        console.log('📝 Fallback: Contato sem nome');
      }
    }

    const isFallbackName = contactName && (contactName.startsWith('Contato (') || contactName === 'Contato sem nome');
    if (contactName && !isFallbackName && !nameLooksLikePhone) {
      shouldRetryName = false;
    }

    console.log('✅ Nome final extraído:', contactName);
    console.log('🔍 Contato detectado:', { contactName, phone });
    console.log('📊 Estado anterior:', { currentContact: this.currentContact, currentPhone: this.currentPhone });

    // SEMPRE atualiza se o telefone mudou (mesmo que o nome seja igual)
    const phoneChanged = phone && phone !== this.currentPhone;
    const contactChanged = contactName && contactName !== this.currentContact;

    if (phoneChanged || contactChanged) {
      console.log('🔄 ⚠️ MUDANÇA DE CONTATO DETECTADA!');
      console.log('   📱 Anterior:', { nome: this.currentContact, tel: this.currentPhone });
      console.log('   📱 Novo:', { nome: contactName, tel: phone });
      console.log('   🔍 phoneChanged:', phoneChanged, '| contactChanged:', contactChanged);
      
      // Atualiza PRIMEIRO o estado
      this.currentContact = contactName;
      this.currentPhone = phone;
      
      console.log('💾 Estado atualizado para:', { currentContact: this.currentContact, currentPhone: this.currentPhone });
      
      // Limpa cache de chamados ao mudar de contato
      console.log('🧹 Limpando cache: this.tickets = []');
      this.tickets = [];
      
      // SEMPRE atualiza as informações do contato no painel
      console.log('🔄 Chamando updateContactInfo()...');
      this.updateContactInfo();
      console.log('✅ updateContactInfo() executado');
      
      // Se o painel estiver aberto, recarrega os chamados automaticamente
      if (this.panelVisible) {
        console.log('📥 Painel aberto! Carregando chamados do novo contato...');
        this.loadTickets();
      } else {
        console.log('📁 Painel fechado. Informações atualizadas, tickets serão carregados ao abrir.');
      }
    } else if (this.currentContact && this.currentPhone) {
      // Mesmo sem mudança, SEMPRE atualiza o display
      console.log('ℹ️ Mesmo contato detectado. Forçando atualização do display...');
      this.updateContactInfo();
      console.log('✅ Display atualizado.');
    } else {
      console.log('⏳ Aguardando detecção de contato...');
    }

    if (shouldRetryName && this.pendingNameRetryCount < 6) {
      this.pendingNameRetryCount += 1;
      this.scheduleContactDetection(400 + this.pendingNameRetryCount * 120, `retentativa nome (${this.pendingNameRetryCount})`);
    } else if (!shouldRetryName) {
      this.pendingNameRetryCount = 0;
    }

    // Configura ações em mensagens ao confirmar conversa ativa
    this.setupMessageActions();

    // Reforça a presença do botão no header
    this.ensureToolbarButton();
  }

  extractPhoneNumber() {
    console.log('📞 Tentando extrair telefone...');
    
    // Método 1: Extrair da URL (MAIS CONFIÁVEL)
    const urlMatch = window.location.href.match(/\/(\d+)@/);
    if (urlMatch) {
      const phone = urlMatch[1];
      console.log('✅ Telefone extraído da URL:', phone);
      return phone;
    }
    
    // Método 2: Buscar em elementos com data-id DENTRO da área principal
    const mainArea = document.querySelector('[role="main"]') || document.querySelector('#main');
    const elementsWithDataId = mainArea ? mainArea.querySelectorAll('[data-id]') : [];
    for (let element of elementsWithDataId) {
      const dataId = element.getAttribute('data-id');
      if (dataId && dataId.includes('@')) {
        const match = dataId.match(/(\d+)@/);
        if (match && match[1].length >= 10) {
          console.log('✅ Telefone extraído de data-id:', match[1]);
          return match[1];
        }
      }
    }
    
    // Método 3: Buscar no header da conversa
    const header = document.querySelector('[role="main"] header') || 
                   document.querySelector('header[data-testid="conversation-header"]');
    
    if (header) {
      const dataId = header.getAttribute('data-id');
      if (dataId) {
        const match = dataId.match(/(\d+)@/);
        if (match) {
          console.log('✅ Telefone extraído do header:', match[1]);
          return match[1];
        }
      }
    }
    
    // Método 4: Buscar na área de mensagens
    const messagesArea = document.querySelector('[data-testid="conversation-panel-messages"]');
    if (messagesArea) {
      const parent = messagesArea.closest('[data-id]');
      if (parent) {
        const dataId = parent.getAttribute('data-id');
        const match = dataId?.match(/(\d+)@/);
        if (match) {
          console.log('✅ Telefone extraído da área de mensagens:', match[1]);
          return match[1];
        }
      }
    }
    
    // Método 5: Última tentativa - buscar em span com título
    const titleSpan = document.querySelector('[role="main"] span[title]');
    if (titleSpan) {
      const title = titleSpan.getAttribute('title');
      const phoneMatch = title?.match(/\d{10,15}/);
      if (phoneMatch) {
        console.log('✅ Telefone extraído do título:', phoneMatch[0]);
        return phoneMatch[0];
      }
    }
    
    console.warn('⚠️ Não foi possível extrair o telefone');
    console.log('💡 URL atual:', window.location.href);
    console.log('💡 Elementos com data-id encontrados:', elementsWithDataId.length);
    return null;
  }

  updateContactInfo() {
    console.log('🔄 === updateContactInfo() INICIADO ===');
    console.log('📊 Estado atual:', { currentContact: this.currentContact, currentPhone: this.currentPhone });
    
    const infoDiv = document.getElementById('ti-contact-info');
    if (!infoDiv) {
      console.error('❌ Elemento ti-contact-info não encontrado!');
      return;
    }

    if (this.currentContact && this.currentPhone) {
      infoDiv.classList.remove('hidden');
      
      // Garante que mostra o NOME no campo de contato (não o número)
      const contactName = this.currentContact;
      
      console.log('📝 Atualizando display com:', contactName);
      
      // Se o nome for do tipo "Contato (número)", exibe mensagem apropriada
      if (contactName.startsWith('Contato (')) {
        infoDiv.querySelector('.ti-contact-name').textContent = 'Sem nome salvo';
        console.log('ℹ️ Display: Sem nome salvo');
      } else {
        infoDiv.querySelector('.ti-contact-name').textContent = contactName;
        console.log('✅ Display: Nome =', contactName);
      }
      
      infoDiv.querySelector('.ti-contact-phone').textContent = `Tel: ${this.currentPhone}`;
      console.log('✅ Display: Tel =', this.currentPhone);
    } else {
      // Nenhum contato selecionado
      infoDiv.classList.remove('hidden');
      infoDiv.querySelector('.ti-contact-name').textContent = '📭 Nenhuma conversa selecionada';
      infoDiv.querySelector('.ti-contact-phone').textContent = 'Abra um chat para visualizar tickets';
      console.log('ℹ️ Display: Nenhuma conversa selecionada');
    }
    
    console.log('✅ === updateContactInfo() CONCLUÍDO ===');
  }

  async loadTickets() {
    console.log('🔄 === INÍCIO loadTickets() ===');
    console.log('📱 this.currentPhone:', this.currentPhone);
    console.log('👤 this.currentContact:', this.currentContact);
    console.log('📊 this.tickets.length:', this.tickets.length);
    
    const listDiv = document.getElementById('ti-tickets-list');
    if (!listDiv) {
      console.error('❌ Elemento ti-tickets-list não encontrado!');
      return;
    }
    
    if (!this.currentPhone) {
      console.warn('⚠️ Telefone não identificado');
      listDiv.innerHTML = `
        <div class="ti-empty-state">
          <div class="ti-empty-icon">📭</div>
          <div class="ti-empty-title">Nenhuma conversa selecionada</div>
          <div class="ti-empty-message">Abra um chat para visualizar os tickets</div>
        </div>
      `;
      return;
    }

    listDiv.innerHTML = '<div class="ti-loading">🔍 Buscando chamados...</div>';

    try {
      // Remove +55 ou 55 do início do telefone usando função auxiliar
      const cleanPhone = this.cleanPhoneForAPI(this.currentPhone);

      console.log('📞 Telefone original:', this.currentPhone);
      console.log('📞 Telefone limpo para API (sem 55):', cleanPhone);

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
      
      console.log(`✅ ${tickets.length} chamado(s) encontrado(s) para telefone ${cleanPhone}`);
      console.log('📋 Tickets processados:', tickets);
      
      // VALIDAÇÃO APENAS POR NÚMERO (sem nome)
      const normalizedCurrentPhone = this.cleanPhoneForAPI(this.currentPhone);
      console.log('🔎 Telefone atual normalizado (sem 55):', normalizedCurrentPhone);

      const filteredTickets = tickets.filter(ticket => {
        const normalizedTicketPhone = this.cleanPhoneForAPI(ticket.contactPhone);
        const phoneMatches = normalizedTicketPhone === normalizedCurrentPhone;

        if (!phoneMatches) {
          console.log('❌ Descartando ticket com telefone diferente:', {
            id: ticket.id,
            ticketPhone: ticket.contactPhone,
            normalizedTicketPhone,
            currentPhone: normalizedCurrentPhone
          });
        }

        return phoneMatches; // Valida APENAS por telefone
      });

      console.log(`🎯 ${filteredTickets.length} chamado(s) após filtro por telefone`);
      console.log('📋 Tickets após filtro:', filteredTickets);

      this.tickets = filteredTickets;
      console.log('�💾 Cache atualizado. this.tickets.length =', this.tickets.length);
      
      this.renderTickets(filteredTickets);
      
      // Mensagem quando não encontrar nada
      if (filteredTickets.length === 0) {
        console.log('📭 Renderizando estado vazio para:', cleanPhone);
        listDiv.innerHTML = `
          <div class="ti-empty">
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

  showNewTicketForm(prefill = {}) {
    const listDiv = document.getElementById('ti-tickets-list');
    if (!listDiv) return;

    const originalContent = listDiv.innerHTML;

    // SEMPRE pega o contato ATUAL do estado, não do prefill
    const contactName = this.currentContact ?? prefill.contactName ?? '';
    const contactPhone = this.currentPhone ?? prefill.contactPhone ?? '';
    const originalMessage = prefill.originalMessage ?? '';
    const suggestionSource = prefill.source || '';

    console.log('📝 Formulário - Contato atual:', contactName, '| Tel:', contactPhone);

    const escape = (value) => this.escapeHTML(value ?? '');
    const contactInfoHtml = (contactName || contactPhone) ? `
      <div class="ti-ticket-context-contact">
        <span class="ti-context-label">Contato</span>
        <strong>${escape(contactName) || 'Sem nome salvo'}</strong>
        <span class="ti-context-phone">${contactPhone ? escape(contactPhone) : 'Telefone não identificado'}</span>
      </div>
    ` : '';

    const messageHtml = originalMessage ? `
      <div class="ti-ticket-context-message">
        <span class="ti-context-label">Mensagem selecionada</span>
        <p>${escape(originalMessage).replace(/\n/g, '<br>')}</p>
      </div>
    ` : '';

    const badgeHtml = suggestionSource === 'gemini' ? `
      <span class="ti-context-badge">✨ Sugestão gerada pela Gemini (título, descrição e categorias)</span>
    ` : '';

    listDiv.innerHTML = `
      <div class="ti-form">
        <h3>Novo Chamado</h3>
        ${(contactInfoHtml || messageHtml || badgeHtml) ? `
          <div class="ti-ticket-context">
            ${badgeHtml}
            ${contactInfoHtml}
            ${messageHtml}
          </div>
        ` : ''}
        <form id="ti-new-ticket-form">
          <input type="hidden" id="ti-ticket-cliente" value="04V63K" />
          <div class="ti-form-group">
            <label>Assunto *</label>
            <input type="text" id="ti-ticket-title" required />
          </div>
          <div class="ti-form-group">
            <label>Descrição *</label>
            <textarea id="ti-ticket-description" rows="4" required></textarea>
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

    const titleInput = document.getElementById('ti-ticket-title');
    if (titleInput) {
      titleInput.value = prefill.title ?? '';
      if (prefill.title && suggestionSource === 'gemini') {
        titleInput.classList.add('ti-ai-filled');
      }
    }

    const descriptionInput = document.getElementById('ti-ticket-description');
    if (descriptionInput) {
      const descriptionValue = prefill.description ?? (originalMessage || '');
      descriptionInput.value = descriptionValue;
      if (prefill.description && suggestionSource === 'gemini') {
        descriptionInput.classList.add('ti-ai-filled');
      }
    }

    // Preenche categorias se foram sugeridas pela IA
    const cat1Input = document.getElementById('ti-ticket-cat1');
    if (cat1Input && prefill.primaryCategory) {
      cat1Input.value = prefill.primaryCategory;
      cat1Input.classList.add('ti-ai-filled');
    }

    const cat2Input = document.getElementById('ti-ticket-cat2');
    if (cat2Input && prefill.secondaryCategory) {
      cat2Input.value = prefill.secondaryCategory;
      cat2Input.classList.add('ti-ai-filled');
    }

    // Se temos category ID, mostra nos logs
    if (prefill.categoryId) {
      console.log('🏷️ Categoria sugerida pela IA:', {
        id: prefill.categoryId,
        primaria: prefill.primaryCategory,
        secundaria: prefill.secondaryCategory
      });
    }

    setTimeout(() => {
      titleInput?.focus();
    }, 100);

    document.getElementById('ti-new-ticket-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.createTicket();
    });
  }

  async createTicket() {
    const cliente_id = '04V63K'; // Cliente ID fixo
    const assunto = document.getElementById('ti-ticket-title')?.value;
    const descricao = document.getElementById('ti-ticket-description')?.value;
    const categoria1 = document.getElementById('ti-ticket-cat1')?.value;
    const categoria2 = document.getElementById('ti-ticket-cat2')?.value;

    try {
      // Limpa telefone removendo código do país (55)
      const cleanPhone = this.cleanPhoneForAPI(this.currentPhone);
      
      console.log('📞 Criando chamado - Tel original:', this.currentPhone);
      console.log('📞 Criando chamado - Tel limpo (sem 55):', cleanPhone);
      
      // Cria chamado na API Milvus
      const payload = {
        cliente_id: cliente_id,
        chamado_assunto: assunto,
        chamado_descricao: descricao,
        chamado_email: '',
        chamado_telefone: cleanPhone, // Envia sem código do país
        chamado_contato: this.currentContact || 'WhatsApp',
      };

      // Campos opcionais
      if (categoria1) payload.chamado_categoria_primaria = categoria1;
      if (categoria2) payload.chamado_categoria_secundaria = categoria2;

      console.log('📤 Payload para criar chamado:', payload);

      const response = await fetch(`${API_BASE_URL}/chamado/criar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_TOKEN
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Erro ao criar chamado');

  const ticketCode = (await response.text()).trim();
  this.showMessage(`Chamado #${ticketCode} criado com sucesso!`, 'success');

  const subjectForMessage = (assunto ?? '').toString().trim();
  await this.notifyContactTicketCreated(ticketCode, subjectForMessage);

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
      <div class="ti-form-actions ti-comment-actions">
        <button type="button" class="ti-btn-small ti-btn-gemini" title="Refinar comentário com ajuda da IA">✨ Refinar com Gemini</button>
        <button class="ti-btn-small ti-btn-primary">Enviar</button>
        <button class="ti-btn-small ti-btn-secondary">Cancelar</button>
      </div>
    `;

    card.appendChild(form);

    const textarea = form.querySelector('textarea');
    const btnGemini = form.querySelector('.ti-btn-gemini');
    const btnSend = form.querySelector('.ti-btn-primary');
    const btnCancel = form.querySelector('.ti-btn-secondary');

    textarea?.addEventListener('input', () => {
      textarea.classList.remove('ti-ai-filled');
    });

    btnGemini?.addEventListener('click', async () => {
      const originalText = textarea.value.trim();

      if (!originalText) {
        this.showMessage('Digite algo antes de pedir ajuda à Gemini.', 'warning');
        textarea.focus();
        return;
      }

      if (!GEMINI_API_KEY) {
        this.showMessage('Configure a chave da Gemini API nas configurações.', 'error');
        return;
      }

      btnGemini.disabled = true;
      const previousLabel = btnGemini.textContent;
      btnGemini.textContent = '⏳ Refinando...';

      try {
        const refined = await this.generateCommentRefinement(originalText, {
          ticketId,
          contactName: this.currentContact,
          contactPhone: this.currentPhone
        });

        if (refined) {
          textarea.value = refined;
          textarea.classList.add('ti-ai-filled');
          this.showMessage('Comentário refinado pela Gemini. Revise antes de enviar.', 'success');
        } else {
          this.showMessage('A Gemini não conseguiu melhorar este comentário.', 'warning');
        }
      } catch (error) {
        console.error('Erro ao refinar comentário com Gemini:', error);
        this.showMessage('Não foi possível refinar o comentário agora.', 'error');
      } finally {
        btnGemini.disabled = false;
        btnGemini.textContent = previousLabel;
      }
    });

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

  async notifyContactTicketCreated(ticketCode, subject) {
    if (!ticketCode) return;

    const cleanSubject = subject?.length ? subject : 'Sem assunto informado';
    const messageLines = [
      'Chamado aberto! ✓',
      `Ticket: *#${ticketCode}*`,
      `_Assunto: ${cleanSubject}_`,
      '',
      'Qualquer novidade falo por aqui.'
    ];

    const message = messageLines.join('\n');
    const sent = await this.sendWhatsAppMessageToCurrentChat(message);

    if (!sent) {
      this.showMessage('Chamado criado, mas não consegui enviar a confirmação no WhatsApp.', 'warning');
    }
  }

  async sendWhatsAppMessageToCurrentChat(message) {
    try {
      if (!message?.trim()) {
        return false;
      }

      const composer = document.querySelector('[contenteditable="true"][data-testid="conversation-compose-box-input"]') ||
                       document.querySelector('#main footer div[contenteditable="true"]');

      if (!composer) {
        console.warn('✉️ Campo de mensagem do WhatsApp não encontrado para envio automático.');
        return false;
      }

      composer.focus();

      // Limpa conteúdo atual
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);

      const lines = message.split('\n');
      let needsFallback = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line) {
          const insertedText = document.execCommand('insertText', false, line);
          if (!insertedText) {
            needsFallback = true;
            break;
          }
        }

        if (i < lines.length - 1) {
          const insertedBreak = document.execCommand('insertLineBreak', false, null) ||
                                document.execCommand('insertParagraph', false, null);
          if (!insertedBreak) {
            needsFallback = true;
            break;
          }
        }
      }

      if (needsFallback) {
        const html = lines
          .map(line => line ? this.escapeHTML(line) : '')
          .join('<br>');
        composer.innerHTML = html;
      }

      composer.dispatchEvent(new Event('input', { bubbles: true }));

      await new Promise(resolve => setTimeout(resolve, 60));

      const sendButton = document.querySelector('button[data-testid="compose-btn-send"]') ||
                         document.querySelector('button[aria-label="Enviar"]') ||
                         document.querySelector('[data-testid="compose-btn-send"]');

      if (!sendButton) {
        console.warn('🛑 Botão de enviar mensagem não encontrado.');
        return false;
      }

      sendButton.click();
      console.log('💬 Mensagem automática enviada ao contato.');
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem automática:', error);
      return false;
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

  escapeHTML(value) {
    if (typeof value !== 'string') {
      return '';
    }

    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  // Remove código do país (55) do telefone para enviar à API
  cleanPhoneForAPI(phone) {
    if (!phone) return '';
    
    let clean = phone.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    // Remove código do país 55
    if (clean.startsWith('55')) {
      clean = clean.substring(2);
    }
    
    console.log('🧹 Limpeza de telefone:', phone, '→', clean);
    return clean;
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
