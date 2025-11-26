// Content Script - Injetado no WhatsApp Web


// ConfiguraÃ§Ã£o da API Milvus (pode ser alterada via popup)
let API_BASE_URL = 'https://apiintegracao.milvus.com.br/api'; // URL da API Milvus
let API_TOKEN = ''; // Token de autenticaÃ§Ã£o
let GEMINI_API_KEY = '';

// Mapeamento de Categorias do Milvus (Categoria PrimÃ¡ria | Categoria SecundÃ¡ria : ID)
const MILVUS_CATEGORIES = {
  'Acessos': '157982',
  'Acessos | LiberaÃ§Ã£o PortÃµes Estoque': '631701',
  'Acessos | RecuperaÃ§Ã£o de senha': '631422',
  'Acessos | LiberaÃ§Ã£o de Sites / Firewall': '631421',
  'Acessos | LiberaÃ§Ã£o de acesso Outros': '631419',
  'Acessos | LiberaÃ§Ã£o de acesso Alarme': '631417',
  'Acessos | RemoÃ§Ã£o de Acessos': '563653',
  'Acessos | LiberaÃ§Ã£o de funÃ§Ãµes ERP': '563543',
  'Acessos | LiberaÃ§Ã£o de acesso Pastas (NAS)': '562350',
  'Acessos | Novo colaborador / Cadastro de funcionÃ¡rio': '562349',
  'Backup': '157479',
  'Backup | ExecuÃ§Ã£o': '631424',
  'Backup | Restore ExecuÃ§Ã£o': '561052',
  'Backup | Corrompido': '559948',
  'Backup | NÃ£o rodou': '559947',
  'Gerencial': '157749',
  'Gerencial | PrestaÃ§Ã£o de contas': '631425',
  'Gerencial | RelatÃ³rios gerenciais / SaÃ­da': '561068',
  'Gerencial | Procedimento Operacional': '561063',
  'Gerencial | Torno CNC / Prorrogar expiraÃ§Ã£o mensal': '561061',
  'Hardware': '157480',
  'Hardware | Outros tipos de aprovaÃ§Ãµes': '631595',
  'Hardware | ConfiguraÃ§Ã£o inicial': '631426',
  'Hardware | MudanÃ§a fÃ­sica': '621634',
  'Hardware | Passagem de cabos': '580941',
  'Hardware | Computador NÃ£o liga': '561075',
  'Hardware | Mouse / Teclado / Monitor / Outros': '561074',
  'Hardware | Limpeza': '559950',
  'Hardware | Troca de peÃ§a': '559949',
  'Impressoras': '159289',
  'Impressoras | Outros Problemas de impressÃ£o': '631427',
  'Impressoras | Suprimentos / Troca de Tonner': '567350',
  'Impressoras | ManutenÃ§Ã£o': '567349',
  'Impressoras | InstalaÃ§Ã£o': '567348',
  'Servidor': '157482',
  'Servidor | Servidor NAS': '561090',
  'Servidor | Servidor Windows': '561086',
  'Servidor | Outros servidores / VirtualizaÃ§Ã£o': '559955',
  'Software': '157481',
  'Software | InstalaÃ§Ã£o / ConfiguraÃ§Ã£o / RemoÃ§Ã£o': '631443',
  'Software | FormataÃ§Ã£o': '563670',
  'Software | SolidWorks': '561114',
  'Software | Adobe / Corel': '561111',
  'Software | Sistema Operacional Problemas': '561107',
  'Software | Contratar software / licenÃ§a': '561103',
  'Software | ERP Ajuste / ParametrizaÃ§Ã£o': '559953',
  'Software | ERP Erro no sistema': '559951',
  'Telefonia': '157751',
  'Telefonia | RelatÃ³rios': '633559',
  'Telefonia | Problema com Aparelho': '631428',
  'Telefonia | Ramal Problema': '561126',
  'Telefonia | Ramal Configurar / Instalar': '561125',
  'Telefonia | Problema linha mÃ³vel / chip': '561123',
  'Telefonia | Contratar Ramal / Linha / Linha MÃ³vel': '561122'
};

// Carrega configuraÃ§Ãµes salvas
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

// Classe principal da extensÃ£o
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
      
    }

    this.contactDetectionTimer = setTimeout(() => {
      this.contactDetectionTimer = null;
      this.detectContactChange();
    }, delay);
  }

  detectAndApplyTheme() {
    // Detecta se o WhatsApp estÃ¡ em modo escuro
    const isDark = document.body.classList.contains('dark') ||
                   document.documentElement.getAttribute('data-theme') === 'dark' ||
                   document.documentElement.getAttribute('data-color-scheme') === 'dark' ||
                   getComputedStyle(document.body).backgroundColor === 'rgb(17, 27, 33)';
    
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
      
    } else {
      document.body.setAttribute('data-theme', 'light');
      
    }
    
    // Observer para detectar mudanÃ§as de tema
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
    
    let attempts = 0;
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      // Verifica se o WhatsApp estÃ¡ carregado (qualquer elemento principal)
      const appElement = document.querySelector('#app');
      const hasLoaded = appElement && appElement.querySelector('[data-testid], [role]');
      
      if (hasLoaded) {
        clearInterval(checkInterval);
        
        
        // Mostra o painel automaticamente
        setTimeout(() => {
          
          this.togglePanel(true);
        }, 500);
        
        // Configura observers para detectar mudanÃ§as de contato
        this.setupObservers();
        
      } else if (attempts > 60) {
        clearInterval(checkInterval);
        console.error('âŒ Timeout: WhatsApp nÃ£o carregou apÃ³s 60 tentativas');
      } else if (attempts % 10 === 0) {
        
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
          <!-- Detalhes do chamado serÃ£o inseridos aqui -->
        </div>
      </div>
    `;

    // Injeta direto no BODY para garantir que sempre apareÃ§a
    
    document.body.appendChild(panel);
    
    // Inicializa com painel oculto
    document.body.classList.add('ti-panel-hidden');
    
    // Cria botÃ£o flutuante para abrir/fechar o painel
    this.createFloatingButton();
    
    this.setupEventListeners();
    this.adjustWhatsAppLayout();
    
    
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
      
      this.togglePanel();
    });
    
    document.body.appendChild(button);
    
  }

  adjustWhatsAppLayout() {
    // Ajusta o layout do WhatsApp para painel FIXO lateral
    const style = document.createElement('style');
    style.id = 'ti-layout-adjustments';
    style.textContent = `
      /* ForÃ§a o WhatsApp a deixar espaÃ§o para o painel fixo */
      /* Aplica em mÃºltiplos elementos para garantir compatibilidade */
      body:not(.ti-panel-hidden) #app,
      body:not(.ti-panel-hidden) #app > div,
      body:not(.ti-panel-hidden) #app > div > div,
      body:not(.ti-panel-hidden) [data-testid="chat-list"],
      body:not(.ti-panel-hidden) #main,
      body:not(.ti-panel-hidden) [role="main"] {
        max-width: calc(100vw - 400px) !important;
        transition: max-width 0.3s ease !important;
      }
      
      /* Garante que o container principal respeite o espaÃ§o */
      body:not(.ti-panel-hidden) #app {
        width: calc(100% - 400px) !important;
        transition: width 0.3s ease !important;
      }
      
      /* Quando o painel estÃ¡ escondido, remove as restriÃ§Ãµes */
      body.ti-panel-hidden #app,
      body.ti-panel-hidden #app > div,
      body.ti-panel-hidden #app > div > div,
      body.ti-panel-hidden [data-testid="chat-list"],
      body.ti-panel-hidden #main,
      body.ti-panel-hidden [role="main"] {
        max-width: 100vw !important;
        width: 100% !important;
      }
      
      /* Evita que elementos flutuantes do WhatsApp fiquem sobre o painel */
      body:not(.ti-panel-hidden) [data-testid="menu"],
      body:not(.ti-panel-hidden) [data-testid="popup"] {
        right: auto !important;
      }
      
      /* Esconde o painel quando o visualizador de mÃ­dia estÃ¡ aberto */
      /* O visualizador de mÃ­dia deve ter z-index maior e ocupar tela cheia */
      body:has([data-testid="media-viewer"]) .ti-support-panel,
      body:has([data-testid="image-preview"]) .ti-support-panel,
      body:has([data-testid="media-viewer-modal"]) .ti-support-panel,
      body:has([data-testid="lightbox"]) .ti-support-panel,
      body:has([data-testid="image-viewer"]) .ti-support-panel,
      body:has([role="dialog"][aria-modal="true"]) .ti-support-panel,
      body:has(.overlay) .ti-support-panel,
      body:has(div[tabindex="-1"] > div > img[draggable="false"]) .ti-support-panel {
        display: none !important;
      }
      
      /* TambÃ©m esconde o botÃ£o flutuante quando visualizador estÃ¡ aberto */
      body:has([data-testid="media-viewer"]) .ti-floating-toggle,
      body:has([data-testid="image-preview"]) .ti-floating-toggle,
      body:has([data-testid="media-viewer-modal"]) .ti-floating-toggle,
      body:has([data-testid="lightbox"]) .ti-floating-toggle,
      body:has([data-testid="image-viewer"]) .ti-floating-toggle,
      body:has([role="dialog"][aria-modal="true"]) .ti-floating-toggle,
      body:has(.overlay) .ti-floating-toggle,
      body:has(div[tabindex="-1"] > div > img[draggable="false"]) .ti-floating-toggle {
        display: none !important;
      }
      
      /* Restaura o layout do WhatsApp quando visualizador estÃ¡ aberto */
      body:has([data-testid="media-viewer"]) #app,
      body:has([data-testid="image-preview"]) #app,
      body:has([data-testid="media-viewer-modal"]) #app,
      body:has([role="dialog"][aria-modal="true"]) #app {
        width: 100% !important;
        max-width: 100vw !important;
      }
    `;
    document.head.appendChild(style);
  }

  setupEventListeners() {
    // BotÃ£o de fechar painel
    document.getElementById('ti-close-panel')?.addEventListener('click', () => {
      this.togglePanel(false);
    });

    // BotÃ£o de novo chamado
    document.getElementById('ti-new-ticket')?.addEventListener('click', () => {
      this.showNewTicketForm();
    });

    // BotÃ£o de atualizar
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
      console.warn('âš ï¸ observeHeader chamado sem header vÃ¡lido');
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
      subtree: false // Reduz chamadas desnecessÃ¡rias
    });
    
  }

  setupObservers() {
    
    
    // Observer na URL para detectar mudanÃ§as de conversa
    let lastUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        
        lastUrl = currentUrl;
        this.scheduleContactDetection(900, 'mudanÃ§a de URL');
      }
    });
    
    urlObserver.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    
    
    // DetecÃ§Ã£o inicial imediata
    this.scheduleContactDetection(1000, 'detecÃ§Ã£o inicial');
    
    // Tenta configurar observer no header se existir
    const header = this.getChatHeader();
    if (header) {
      this.observeHeader(header);
    }
    
    // Observer no main element para detectar quando um header Ã© criado
    const mainElement = document.querySelector('[role="main"]') || document.querySelector('#main');
    if (mainElement && !this.mainObserver) {
      let mainDebounceTimer = null;
      this.mainObserver = new MutationObserver(() => {
        if (mainDebounceTimer) clearTimeout(mainDebounceTimer);
        mainDebounceTimer = setTimeout(() => {
          const newHeader = this.getChatHeader();
          if (newHeader && newHeader !== this.chatHeader) {
            
            this.observeHeader(newHeader);
            this.scheduleContactDetection(400, 'header recriado');
          }
        }, 500);
      });

      this.mainObserver.observe(mainElement, { 
        childList: true, 
        subtree: false
      });
      
    }

    // Observer na lista de chats para capturar seleÃ§Ã£o de novos contatos
    const chatList = document.querySelector('[data-testid="chat-list"]') ||
                     document.querySelector('[role="grid"]');

    if (chatList && !this.chatListObserver) {
      let chatListDebounce = null;
      this.chatListObserver = new MutationObserver(() => {
        if (chatListDebounce) clearTimeout(chatListDebounce);
        chatListDebounce = setTimeout(() => {
          
          this.scheduleContactDetection(350, 'lista de chats atualizada');
        }, 200);
      });

      this.chatListObserver.observe(chatList, {
        childList: true,
        subtree: true
      });

      // Captura clique direto nos contatos
      chatList.addEventListener('click', () => {
        
        this.scheduleContactDetection(350, 'clique na lista de chats');
      }, true);

      
    }

    // Configura aÃ§Ãµes nas mensagens (botÃ£o de chamado)
    
    setTimeout(() => this.setupMessageActions(), 1500);
  }

  setupMessageActions() {
    if (this.messageObserver) {
      this.messageObserver.disconnect();
      this.messageObserver = null;
    }

    // Tenta mÃºltiplos seletores para Ã¡rea de mensagens
    const messagesArea = document.querySelector('#main') ||
                         document.querySelector('[role="main"]') ||
                         document.querySelector('[data-testid="conversation-panel-messages"]') ||
                         document.querySelector('[data-testid="conversation-panel-body"]') ||
                         document.querySelector('div[role="application"]');

    if (!messagesArea) {
      
      setTimeout(() => this.setupMessageActions(), 2000);
      return;
    }

    

    const attachButtons = () => {
      // Tenta seletores mais genÃ©ricos para mensagens
      let messageNodes = [];
      
      // Busca por divs com classes que contenham 'message'
      const allDivs = messagesArea.querySelectorAll('div[class*="message"]');
      allDivs.forEach(div => {
        // Verifica se Ã© uma mensagem real (tem texto ou mÃ­dia)
        const hasText = div.querySelector('span[dir="ltr"], span[dir="rtl"], span[dir="auto"]');
        const hasMedia = div.querySelector('img, video, audio');
        
        if ((hasText || hasMedia) && !div.getAttribute('data-ti-action')) {
          messageNodes.push(div);
        }
      });
      
      
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
        this.showMessage('NÃ£o foi possÃ­vel identificar a mensagem selecionada.', 'error');
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
          
        }, { capture: true });
      }
    };

    // Tenta detectar imediatamente
    detectMenuClick();

    // Cria botÃ£o customizado simples que sempre aparece
    const ticketBtn = document.createElement('button');
    ticketBtn.type = 'button';
    ticketBtn.className = 'ti-simple-ticket-btn';
    ticketBtn.title = 'Criar chamado de suporte';
    ticketBtn.innerHTML = 'ðŸŽ«';

    ticketBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();
      
      this.handleMessageTicket(messageElement);
    });

    // Adiciona o botÃ£o diretamente no container da mensagem
    messageElement.style.position = 'relative';
    messageElement.appendChild(ticketBtn);

    // Ao fazer hover, tenta detectar novamente a setinha
    messageElement.addEventListener('mouseenter', () => {
      detectMenuClick();
    }, { once: false });

    
  }

  injectTicketButtonInMessageActions(messageElement) {
    // FunÃ§Ã£o removida - usando abordagem mais simples acima
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
      clone.querySelectorAll('.ti-message-action-btn, .ti-simple-ticket-btn').forEach(btn => btn.remove());
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

  extractImageFromMessage(messageElement) {
    if (!messageElement) return null;

    // Busca por imagens na mensagem
    const imageSelectors = [
      'img[src*="blob:"]',
      'img[data-testid="media-img"]',
      'img[role="button"]',
      'div[data-testid="image-thumb"] img',
      'div[data-testid="media-image"] img'
    ];

    for (const selector of imageSelectors) {
      const img = messageElement.querySelector(selector);
      if (img && img.src && img.src.startsWith('blob:')) {
        return {
          element: img,
          src: img.src,
          alt: img.alt || ''
        };
      }
    }

    return null;
  }

  async convertImageToBase64(imgElement) {
    try {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);
          
          try {
            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => reject(new Error('Falha ao carregar imagem'));
        img.src = imgElement.src;
      });
    } catch (error) {
      console.error('Erro ao converter imagem para base64:', error);
      throw error;
    }
  }

   getMessageDirection(messageElement) {
     if (!messageElement || !messageElement.classList) return null;
     const classTokens = Array.from(messageElement.classList);

     if (classTokens.some(cls => cls.includes('message-out'))) {
       return 'out';
     }
     if (classTokens.some(cls => cls.includes('message-in'))) {
       return 'in';
     }

     const prePlain = messageElement.getAttribute?.('data-pre-plain-text') || '';
     if (prePlain.includes('VocÃª:')) {
       return 'out';
     }
     if (prePlain.length) {
       return 'in';
     }

     return null;
   }

   isMessageBubble(element) {
     if (!element) return false;

     if (element.dataset?.prePlainText) {
       return true;
     }

     const className = typeof element.className === 'string' ? element.className : '';
    return className.includes('message');
   }

   collectContextualMessageText(messageElement, maxMessages = 3) {
    if (!messageElement) return '';

    const bubble = messageElement.matches?.('[data-pre-plain-text]')
      ? messageElement
      : (messageElement.closest?.('[data-pre-plain-text]') || messageElement);

    const mainArea = bubble.closest?.('#main') ||
                     bubble.closest?.('[role="main"]') ||
                     document.querySelector('[data-testid="conversation-panel-messages"]') ||
                     document.querySelector('[data-testid="conversation-panel-body"]') ||
                     document.querySelector('#main') ||
                     document.querySelector('[role="main"]');

    if (!mainArea) {
      return this.extractMessageTextFromBubble(bubble);
    }

    const allMessages = Array.from(mainArea.querySelectorAll('[data-pre-plain-text]'))
      .filter(node => this.isMessageBubble(node));

    if (!allMessages.length) {
      return this.extractMessageTextFromBubble(bubble);
    }

    let index = allMessages.findIndex(node => node === bubble);
    if (index === -1) {
      index = allMessages.findIndex(node => node.contains(bubble));
    }
    if (index === -1) {
      index = allMessages.findIndex(node => bubble.contains(node));
    }

    if (index === -1) {
      return this.extractMessageTextFromBubble(bubble);
    }

    const targetDirection = this.getMessageDirection(bubble);
    const collected = [];
    const visited = new Set();

    const addText = (el, position = 'end') => {
      if (!el || visited.has(el)) {
        return;
      }
      visited.add(el);

      const text = this.extractMessageTextFromBubble(el);
      const image = this.extractImageFromMessage(el);
      
      let content = '';
      if (text) {
        content += text;
      }
      if (image) {
        content += (content ? '\n' : '') + '[IMAGEM ANEXADA]';
      }
      
      if (!content) {
        return;
      }

      if (position === 'start') {
        collected.unshift(content);
      } else {
        collected.push(content);
      }
    };

    addText(allMessages[index]);

    for (let i = index - 1; i >= 0 && collected.length < maxMessages; i--) {
      const candidate = allMessages[i];
      const direction = this.getMessageDirection(candidate);
      if (targetDirection && direction && direction !== targetDirection) {
        break;
      }

      addText(candidate, 'start');
    }

    for (let i = index + 1; i < allMessages.length && collected.length < maxMessages; i++) {
      const candidate = allMessages[i];
      const direction = this.getMessageDirection(candidate);
      if (targetDirection && direction && direction !== targetDirection) {
        break;
      }

      addText(candidate, 'end');
    }

    return collected.join('\n\n').trim();
   }

  async handleMessageTicket(messageElement) {
    const messageText = this.collectContextualMessageText(messageElement);
    const imageData = this.extractImageFromMessage(messageElement);

    if (!messageText && !imageData) {
      this.showMessage('NÃ£o foi possÃ­vel capturar conteÃºdo da mensagem selecionada.', 'error');
      return;
    }

    if (!GEMINI_API_KEY) {
      this.showMessage('Configure a chave da Gemini API nas configuraÃ§Ãµes da extensÃ£o.', 'error');
      return;
    }

    try {
      if (!this.panelVisible) {
        this.suppressNextTicketLoad = true;
        this.togglePanel(true);
      }

      if (imageData) {
        this.showMessage('ï¿½ï¸ Analisando imagem com Gemini...', 'info');
      } else {
        this.showMessage('ï¿½ðŸ’¡ Gerando sugestÃ£o de chamado com Gemini...', 'info');
      }

      const suggestion = await this.generateTicketSuggestion(messageText, imageData);

      if (suggestion.notice) {
        this.showMessage(suggestion.notice, 'info');
      } else {
        this.showMessage('âœ… SugestÃ£o criada! Revise os campos antes de enviar.', 'success');
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
        source: suggestion.source || 'gemini',
        hasImage: !!imageData
      });
    } catch (error) {
      console.error('Erro ao gerar sugestÃ£o com Gemini:', error);
      this.showMessage(`Falha ao gerar sugestÃ£o: ${error.message}`, 'error');

      this.showNewTicketForm({
        title: '',
        description: messageText || '[Imagem anexada - anÃ¡lise nÃ£o disponÃ­vel]',
        contactName: this.currentContact,
        contactPhone: this.currentPhone,
        originalMessage: messageText,
        source: 'manual',
        hasImage: !!imageData
      });
    }
  }

  async generateTicketSuggestion(messageText, imageData = null) {
    const sanitizedMessage = messageText ? messageText.trim().slice(0, 4000) : '';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    // Lista de categorias disponÃ­veis para o Gemini escolher
    const categoriesText = Object.keys(MILVUS_CATEGORIES).join('\n- ');

    let prompt = `VocÃª Ã© um analista de suporte tÃ©cnico. `;
    
    if (imageData) {
      prompt += `Analise a imagem fornecida e o texto (se houver) para:
1. Descrever o que vocÃª vÃª na imagem (telas, erros, equipamentos, problemas visÃ­veis)
2. Gerar um tÃ­tulo curto (atÃ© 80 caracteres) baseado no problema identificado
3. Criar uma descriÃ§Ã£o detalhada incluindo o que foi observado na imagem
4. ESCOLHER a categoria mais adequada desta lista (use EXATAMENTE como estÃ¡ escrito):

CATEGORIAS DISPONÃVEIS:
- ${categoriesText}

Considere a imagem como evidÃªncia principal do problema relatado.`;
    } else {
      prompt += `Analise a mensagem e:
1. Gere um tÃ­tulo curto (atÃ© 80 caracteres)
2. Crie uma descriÃ§Ã£o detalhada
3. ESCOLHA a categoria mais adequada desta lista (use EXATAMENTE como estÃ¡ escrito):

CATEGORIAS DISPONÃVEIS:
- ${categoriesText}`;
    }

    prompt += `

Responda APENAS em JSON com o formato:
{
  "title": "...",
  "description": "...",
  "category": "categoria exata da lista"
}

Use um tom profissional e claro em portuguÃªs.`;

    if (messageText) {
      prompt += `\n\nTexto da mensagem: """${sanitizedMessage}"""`;
    }

    const parts = [];
    
    // Adiciona o prompt de texto
    parts.push({ text: prompt });

    // Adiciona imagem se disponÃ­vel
    if (imageData) {
      try {
        const base64Image = await this.convertImageToBase64(imageData.element);
        parts.push({
          inline_data: {
            mime_type: "image/jpeg",
            data: base64Image
          }
        });
      } catch (error) {
        console.warn('Falha ao processar imagem, continuando sÃ³ com texto:', error);
        if (!messageText) {
          throw new Error('NÃ£o foi possÃ­vel processar a imagem e nÃ£o hÃ¡ texto disponÃ­vel');
        }
      }
    }

    const payload = {
      contents: [
        {
          role: 'user',
          parts: parts
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

    const responseParts = data?.candidates?.[0]?.content?.parts || [];
    const combinedText = responseParts.map(part => part.text).filter(Boolean).join('\n').trim();

    if (!combinedText) {
      return {
        title: '',
        description: sanitizedMessage || '[Imagem anexada - descriÃ§Ã£o nÃ£o gerada]',
        category: null,
        categoryId: null,
        notice: 'NÃ£o foi possÃ­vel gerar sugestÃ£o automÃ¡tica. ConteÃºdo original carregado.',
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
      
      // Extrai categoria primÃ¡ria e secundÃ¡ria
      let categoryId = null;
      let primaryCategory = null;
      let secondaryCategory = null;
      
      if (parsed.category && MILVUS_CATEGORIES[parsed.category]) {
        categoryId = MILVUS_CATEGORIES[parsed.category];
        
        // Separa categoria primÃ¡ria | secundÃ¡ria
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
        description: typeof parsed.description === 'string' ? parsed.description.trim() : (sanitizedMessage || '[Imagem anexada - descriÃ§Ã£o nÃ£o gerada]'),
        category: parsed.category,
        categoryId: categoryId,
        primaryCategory: primaryCategory,
        secondaryCategory: secondaryCategory,
        source: 'gemini'
      };
    } catch (error) {
      console.warn('NÃ£o foi possÃ­vel interpretar resposta da Gemini como JSON. Texto bruto:', combinedText);
      return {
        title: '',
        description: sanitizedMessage || '[Imagem anexada - descriÃ§Ã£o nÃ£o gerada]',
        category: null,
        categoryId: null,
        notice: 'SugestÃ£o recebida em formato inesperado. ConteÃºdo original carregado.',
        source: 'gemini'
      };
    }
  }

  async generateCommentRefinement(originalComment, context = {}) {
    const sanitizedComment = originalComment.trim().slice(0, 4000);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    const ticketInfo = context.ticketId ? `#${context.ticketId}` : 'desconhecido';
    const contactInfo = context.contactName ? context.contactName : (context.contactPhone || 'Contato nÃ£o identificado');

    const prompt = `Atue como um analista de suporte tÃ©cnico experiente. Reescreva o comentÃ¡rio abaixo em portuguÃªs, mantendo todas as informaÃ§Ãµes essenciais, mas deixando o texto claro, objetivo e profissional. NÃ£o inclua saudaÃ§Ãµes nem repita informaÃ§Ãµes jÃ¡ implÃ­citas. Se faltar contexto, apenas organize melhor o que jÃ¡ existe.

Contexto:
- Chamado: ${ticketInfo}
- Contato: ${contactInfo}

Comente somente o necessÃ¡rio para registrar o andamento ou comunicaÃ§Ã£o com o cliente.

Retorne APENAS em JSON com o formato {"comment":"texto refinado"}.

ComentÃ¡rio original: """${sanitizedComment}"""`;

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
      console.warn('NÃ£o foi possÃ­vel interpretar resposta da Gemini para comentÃ¡rio. Texto bruto:', combinedText);
      return sanitizedComment;
    }
  }

  addToolbarButton() {
    
    
    // Remove botÃ£o existente se houver
    document.getElementById('ti-toolbar-btn')?.remove();

    // Usa o header salvo (da conversa, nÃ£o da lista)
    const chatHeader = this.getChatHeader();

    if (!chatHeader) {
      console.error('âŒ Header da conversa nÃ£o encontrado');
      return;
    }

    

    // Tenta mÃºltiplos seletores para encontrar o container de botÃµes
    const headerButtons = chatHeader.querySelector('div[role="button"]')?.parentElement ||
                         chatHeader.querySelector('[aria-label]')?.parentElement ||
                         chatHeader.querySelector('button')?.parentElement ||
                         chatHeader.lastElementChild;

    if (headerButtons) {
      
      
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
        
        this.togglePanel();
      });
      
      headerButtons.appendChild(button);
      
    } else {
      console.error('âŒ Container de botÃµes nÃ£o encontrado no header');
      
    }
  }

  ensureToolbarButton() {
    // NÃ£o faz nada - painel agora Ã© fixo, sem necessidade de botÃ£o
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
    
    if (this.panelVisible) {
      
      
      panel.classList.remove('hidden');
      document.body.classList.remove('ti-panel-hidden');
      
      // ForÃ§a recalculo do layout apÃ³s pequeno delay
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
      
      // Limpa APENAS os tickets (mantÃ©m contato e telefone)
      
      this.tickets = [];
      
      const shouldLoadTickets = !this.suppressNextTicketLoad;
      this.suppressNextTicketLoad = false;

      // Aguarda painel abrir, entÃ£o verifica se tem contato e carrega tickets
      setTimeout(() => {
        
        
        // Se nÃ£o tem contato detectado, forÃ§a detecÃ§Ã£o
        if (!this.currentPhone) {
          
          this.detectContactChange();
        } else {
          
          this.updateContactInfo();
        }
        
        // Carrega tickets se houver telefone
        if (this.currentPhone && shouldLoadTickets) {
          
          this.loadTickets();
        } else if (this.currentPhone && !shouldLoadTickets) {
          
        } else {
          
        }
      }, 100);
      
    } else {
      
      
      panel.classList.add('hidden');
      document.body.classList.add('ti-panel-hidden');
      
      // ForÃ§a recalculo do layout
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
      
      // Garante que o botÃ£o permanece visÃ­vel
      setTimeout(() => {
        
        this.ensureToolbarButton();
      }, 150);
    }
  }

  async detectContactChange() {
    
    
    
    const headerElement = this.getChatHeader();
    const conversationPanel = document.querySelector('[data-testid="conversation-panel-messages"]') ||
                              document.querySelector('[data-testid="conversation-panel"]') ||
                              document.querySelector('[data-testid="conversation-panel-body"]');
    
    // Extrai nÃºmero de telefone PRIMEIRO (mais confiÃ¡vel que header)
    const phone = this.extractPhoneNumber();
    
    const hasConversation = !!phone || !!headerElement || !!conversationPanel;
    
    
    if (!hasConversation) {
      
      
      if (this.currentContact || this.currentPhone || this.tickets.length > 0) {
        
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

      console.warn('âš ï¸ NÃ£o foi possÃ­vel detectar o telefone apÃ³s mÃºltiplas tentativas');
    } else {
      this.pendingPhoneRetryCount = 0;
    }
    
    // Extrai nome do contato - tenta mÃºltiplos seletores
    let contactName = '';
    let shouldRetryName = false;
    
    
    
    // SOLUÃ‡ÃƒO DEFINITIVA: SEMPRE re-buscar header (nunca usar cache/parÃ¢metro)
    const header = document.querySelector('header[data-testid="conversation-header"]') ||
                   document.querySelector('#main header') ||
                   document.querySelector('div[data-testid="conversation-header"] header') ||
                   document.querySelector('div[data-testid="conversation-header"]');
    
    if (header) {
      
      
      // MÃ‰TODO DEFINITIVO: Buscar o span de nome usando a estrutura conhecida
      
      // 1. Buscar pelo atributo title (mais confiÃ¡vel - contÃ©m nome completo)
      const spanWithTitle = header.querySelector('span[dir="auto"][title]');
      if (spanWithTitle?.title) {
        contactName = spanWithTitle.title.trim();
        
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

      // 2. Buscar no container principal de informaÃ§Ãµes
      if (!contactName) {
        const headerContent = header.querySelector('div[role="button"]');
        if (headerContent) {
          // Pega TODOS os spans, filtra os que tÃªm texto vÃ¡lido
          const allSpans = Array.from(headerContent.querySelectorAll('span[dir="auto"]'));
          
          
          for (const span of allSpans) {
            const text = span.textContent?.trim();
            
            if (!isValidNameText(text)) continue;

            const candidate = text.trim();
            contactName = candidate;
            
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
            
          }
        }
      }

      // 4. Fallback final: analisar texto bruto do header
      if (!contactName) {
        const headerText = (header.innerText || header.textContent || '').trim();
        
        if (headerText) {
          const candidates = headerText
            .split('\n')
            .map(line => line.trim())
            .filter(isValidNameText);

          if (candidates.length > 0) {
            contactName = candidates[0];
            
          }
        }
      }
      
      if (!contactName) {
        shouldRetryName = true;
        
      }
      
      // Atualiza cache do header
      this.chatHeader = header;
    } else {
      shouldRetryName = true;
      
    }

    // MÃ©todo 2: Busca no chat selecionado da lista lateral
    if (!contactName) {
      
      const selectedChat = document.querySelector('[data-testid="cell-frame-container"][aria-selected="true"]') ||
                            document.querySelector('[data-testid="conversation-list-item"][aria-selected="true"]');
      if (selectedChat) {
        const selectedTitle = selectedChat.getAttribute('title');
        if (selectedTitle) {
          contactName = selectedTitle.trim();
          
        } else {
          const possibleNames = Array.from(selectedChat.querySelectorAll('span[dir="auto"]'))
            .map(span => span.textContent?.trim())
            .filter(text => text && text.length > 0 && !/\d{6,}/.test(text));
          if (possibleNames.length > 0) {
            contactName = possibleNames[0];
            
          }
        }
      }
    }

    // MÃ©todo 3: Busca em atributos do header
    if (!contactName && header) {
      
      const ariaLabel = header.getAttribute('aria-label');
      if (ariaLabel) {
        contactName = ariaLabel.split(',')[0]?.trim() || '';
        
      }
    }

    // MÃ©todo 4: Se nÃ£o encontrou nome ou pegou um nÃºmero, usa fallback
    const nameLooksLikePhone = contactName && (/^\+?\d+$/.test(contactName) || /^Contato \(/.test(contactName));
    if (!contactName || nameLooksLikePhone) {
      
      if (phone) {
        contactName = `Contato (${phone})`;
        shouldRetryName = true;
        
      } else {
        contactName = 'Contato sem nome';
        shouldRetryName = true;
        
      }
    }

    const isFallbackName = contactName && (contactName.startsWith('Contato (') || contactName === 'Contato sem nome');
    if (contactName && !isFallbackName && !nameLooksLikePhone) {
      shouldRetryName = false;
    }

    
    
    

    // SEMPRE atualiza se o telefone mudou (mesmo que o nome seja igual)
    const phoneChanged = phone && phone !== this.currentPhone;
    const contactChanged = contactName && contactName !== this.currentContact;

    if (phoneChanged || contactChanged) {
      
      
      
      
      
      // Atualiza PRIMEIRO o estado
      this.currentContact = contactName;
      this.currentPhone = phone;
      
      
      
      // Limpa cache de chamados ao mudar de contato
      
      this.tickets = [];
      
      // SEMPRE atualiza as informaÃ§Ãµes do contato no painel
      
      this.updateContactInfo();
      
      
      // Se o painel estiver aberto, recarrega os chamados automaticamente
      if (this.panelVisible) {
        
        this.loadTickets();
      } else {
        
      }
    } else if (this.currentContact && this.currentPhone) {
      // Mesmo sem mudanÃ§a, SEMPRE atualiza o display
      
      this.updateContactInfo();
      
    } else {
      
    }

    if (shouldRetryName && this.pendingNameRetryCount < 6) {
      this.pendingNameRetryCount += 1;
      this.scheduleContactDetection(400 + this.pendingNameRetryCount * 120, `retentativa nome (${this.pendingNameRetryCount})`);
    } else if (!shouldRetryName) {
      this.pendingNameRetryCount = 0;
    }

    // Configura aÃ§Ãµes em mensagens ao confirmar conversa ativa
    this.setupMessageActions();

    // ReforÃ§a a presenÃ§a do botÃ£o no header
    this.ensureToolbarButton();
  }

  extractPhoneNumber() {
    
    
    // MÃ©todo 1: Extrair da URL (MAIS CONFIÃVEL)
    const urlMatch = window.location.href.match(/\/(\d+)@/);
    if (urlMatch) {
      const phone = urlMatch[1];
      
      return phone;
    }
    
    // MÃ©todo 2: Buscar em elementos com data-id DENTRO da Ã¡rea principal
    const mainArea = document.querySelector('[role="main"]') || document.querySelector('#main');
    const elementsWithDataId = mainArea ? mainArea.querySelectorAll('[data-id]') : [];
    for (let element of elementsWithDataId) {
      const dataId = element.getAttribute('data-id');
      if (dataId && dataId.includes('@')) {
        const match = dataId.match(/(\d+)@/);
        if (match && match[1].length >= 10) {
          
          return match[1];
        }
      }
    }
    
    // MÃ©todo 3: Buscar no header da conversa
    const header = document.querySelector('[role="main"] header') || 
                   document.querySelector('header[data-testid="conversation-header"]');
    
    if (header) {
      const dataId = header.getAttribute('data-id');
      if (dataId) {
        const match = dataId.match(/(\d+)@/);
        if (match) {
          
          return match[1];
        }
      }
    }
    
    // MÃ©todo 4: Buscar na Ã¡rea de mensagens
    const messagesArea = document.querySelector('[data-testid="conversation-panel-messages"]');
    if (messagesArea) {
      const parent = messagesArea.closest('[data-id]');
      if (parent) {
        const dataId = parent.getAttribute('data-id');
        const match = dataId?.match(/(\d+)@/);
        if (match) {
          
          return match[1];
        }
      }
    }
    
    // MÃ©todo 5: Ãšltima tentativa - buscar em span com tÃ­tulo
    const titleSpan = document.querySelector('[role="main"] span[title]');
    if (titleSpan) {
      const title = titleSpan.getAttribute('title');
      const phoneMatch = title?.match(/\d{10,15}/);
      if (phoneMatch) {
        
        return phoneMatch[0];
      }
    }
    
    console.warn('âš ï¸ NÃ£o foi possÃ­vel extrair o telefone');
    
    
    return null;
  }

  updateContactInfo() {
    
    
    
    const infoDiv = document.getElementById('ti-contact-info');
    if (!infoDiv) {
      console.error('âŒ Elemento ti-contact-info nÃ£o encontrado!');
      return;
    }

    if (this.currentContact && this.currentPhone) {
      infoDiv.classList.remove('hidden');
      
      // Garante que mostra o NOME no campo de contato (nÃ£o o nÃºmero)
      const contactName = this.currentContact;
      
      
      
      // Se o nome for do tipo "Contato (nÃºmero)", exibe mensagem apropriada
      if (contactName.startsWith('Contato (')) {
        infoDiv.querySelector('.ti-contact-name').textContent = 'Sem nome salvo';
        
      } else {
        infoDiv.querySelector('.ti-contact-name').textContent = contactName;
        
      }
      
      infoDiv.querySelector('.ti-contact-phone').textContent = `Tel: ${this.currentPhone}`;
      
    } else {
      // Nenhum contato selecionado
      infoDiv.classList.remove('hidden');
      infoDiv.querySelector('.ti-contact-name').textContent = 'ðŸ“­ Nenhuma conversa selecionada';
      infoDiv.querySelector('.ti-contact-phone').textContent = 'Abra um chat para visualizar tickets';
      
    }
    
    
  }

  async loadTickets() {
    
    
    
    
    
    const listDiv = document.getElementById('ti-tickets-list');
    if (!listDiv) {
      console.error('âŒ Elemento ti-tickets-list nÃ£o encontrado!');
      return;
    }
    
    if (!this.currentPhone) {
      console.warn('âš ï¸ Telefone nÃ£o identificado');
      listDiv.innerHTML = `
        <div class="ti-empty-state">
          <div class="ti-empty-icon">ðŸ“­</div>
          <div class="ti-empty-title">Nenhuma conversa selecionada</div>
          <div class="ti-empty-message">Abra um chat para visualizar os tickets</div>
        </div>
      `;
      return;
    }

    listDiv.innerHTML = '<div class="ti-loading">ðŸ” Buscando chamados...</div>';

    try {
      // Remove +55 ou 55 do inÃ­cio do telefone usando funÃ§Ã£o auxiliar
      const cleanPhone = this.cleanPhoneForAPI(this.currentPhone);

      
      

      // Faz chamada para API Milvus - listagem de chamados
      const bodyPayload = {
        filtro_body: {
          telefone: cleanPhone,  // Busca apenas por telefone (sem +55)
          status: 9  // Status 9 = Chamados em aberto
        }
      };

      

      const response = await fetch(`${API_BASE_URL}/chamado/listagem?total_registros=50`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_TOKEN
        },
        body: JSON.stringify(bodyPayload)
      });
      
      

      if (!response.ok) {
        const errorText = await response.text();
        console.error('âŒ Erro na API:', errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      
      // Adapta formato Milvus para o formato da extensÃ£o
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
      
      
      
      
      // VALIDAÃ‡ÃƒO APENAS POR NÃšMERO (sem nome)
      const normalizedCurrentPhone = this.cleanPhoneForAPI(this.currentPhone);
      

      const filteredTickets = tickets.filter(ticket => {
        const normalizedTicketPhone = this.cleanPhoneForAPI(ticket.contactPhone);
        const phoneMatches = normalizedTicketPhone === normalizedCurrentPhone;

        if (!phoneMatches) {
          
        }

        return phoneMatches; // Valida APENAS por telefone
      });

      
      

      this.tickets = filteredTickets;
      
      
      this.renderTickets(filteredTickets);
      
      // Mensagem quando nÃ£o encontrar nada
      if (filteredTickets.length === 0) {
        
        listDiv.innerHTML = `
          <div class="ti-empty">
            <p style="margin: 0; font-size: 14px; color: #667781;">Nenhum chamado em aberto</p>
            <small style="color: #8696a0; margin-top: 4px;">${this.currentContact ? `Contato: ${this.currentContact}` : `Telefone: ${cleanPhone}`}</small>
          </div>
        `;
      }
    } catch (error) {
      console.error('âŒ Erro ao carregar chamados:', error);
      listDiv.innerHTML = `
        <div class="ti-error">
          <p>âŒ Erro ao carregar chamados</p>
          <small>${error.message}</small>
          <button onclick="document.querySelector('#ti-refresh-tickets').click()" 
                  style="margin-top: 8px; padding: 6px 12px; background: #00a884; color: white; border: none; border-radius: 4px; cursor: pointer;">
            ðŸ”„ Tentar novamente
          </button>
          <p class="ti-hint" style="margin-top: 8px; font-size: 12px; color: #8696a0;">Verifique se o token de autenticaÃ§Ã£o estÃ¡ configurado</p>
        </div>
      `;
    }
  }

  renderTickets(tickets) {
    const listDiv = document.getElementById('ti-tickets-list');
    if (!listDiv) return;

    
    
    // SEMPRE limpa o conteÃºdo anterior para evitar cache visual
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
        <div class="ti-ticket-title">${ticket.title || 'Sem tÃ­tulo'}</div>
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

    // Adiciona event listeners aos botÃµes
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
      if (!ticket) throw new Error('Chamado nÃ£o encontrado');
      
      // Extrai comentÃ¡rios dos acompanhamentos
      const comments = data.retorno ? data.retorno
        .filter(log => log.log_tipo_id === 6 && !log.is_excluido) // Tipo 6 = comentÃ¡rios
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
            <label>DescriÃ§Ã£o:</label>
            <p>${ticket.description || 'Sem descriÃ§Ã£o'}</p>
          </div>
          ${ticket.priority ? `
            <div class="ti-detail-row">
              <label>Prioridade:</label>
              <span class="ti-priority ti-priority-${ticket.priority}">${this.getPriorityLabel(ticket.priority)}</span>
            </div>
          ` : ''}
          ${ticket.technician ? `
            <div class="ti-detail-row">
              <label>TÃ©cnico:</label>
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

    // SEMPRE pega o contato ATUAL do estado, nÃ£o do prefill
    const contactName = this.currentContact ?? prefill.contactName ?? '';
    const contactPhone = this.currentPhone ?? prefill.contactPhone ?? '';
    const originalMessage = prefill.originalMessage ?? '';
    const suggestionSource = prefill.source || '';

    

    const escape = (value) => this.escapeHTML(value ?? '');
    const contactInfoHtml = (contactName || contactPhone) ? `
      <div class="ti-ticket-context-contact">
        <span class="ti-context-label">Contato</span>
        <strong>${escape(contactName) || 'Sem nome salvo'}</strong>
        <span class="ti-context-phone">${contactPhone ? escape(contactPhone) : 'Telefone nÃ£o identificado'}</span>
      </div>
    ` : '';

    const messageHtml = originalMessage ? `
      <div class="ti-ticket-context-message">
        <span class="ti-context-label">Mensagem selecionada</span>
        <p>${escape(originalMessage).replace(/\n/g, '<br>')}</p>
        ${prefill.hasImage ? '<span class="ti-image-indicator">ðŸ–¼ï¸ Imagem anexada e analisada</span>' : ''}
      </div>
    ` : '';

    let badgeText = 'âœ¨ SugestÃ£o gerada pela Gemini (tÃ­tulo, descriÃ§Ã£o e categorias)';
    if (prefill.hasImage && suggestionSource === 'gemini') {
      badgeText = 'ðŸ–¼ï¸ SugestÃ£o gerada pela Gemini com anÃ¡lise de imagem';
    }

    const badgeHtml = suggestionSource === 'gemini' ? `
      <span class="ti-context-badge">${badgeText}</span>
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
            <label>DescriÃ§Ã£o *</label>
            <textarea id="ti-ticket-description" rows="4" required></textarea>
          </div>
          <div class="ti-form-group">
            <label>Categoria PrimÃ¡ria</label>
            <input type="text" id="ti-ticket-cat1" placeholder="Ex: Hardware, Software" />
          </div>
          <div class="ti-form-group">
            <label>Categoria SecundÃ¡ria</label>
            <input type="text" id="ti-ticket-cat2" placeholder="Ex: Troca de peÃ§a, InstalaÃ§Ã£o" />
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
      // Limpa telefone removendo cÃ³digo do paÃ­s (55)
      const cleanPhone = this.cleanPhoneForAPI(this.currentPhone);
      
      
      
      
      // Cria chamado na API Milvus
      const payload = {
        cliente_id: cliente_id,
        chamado_assunto: assunto,
        chamado_descricao: descricao,
        chamado_email: '',
        chamado_telefone: cleanPhone, // Envia sem cÃ³digo do paÃ­s
        chamado_contato: this.currentContact || 'WhatsApp',
      };

      // Campos opcionais
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

  const ticketCode = (await response.text()).trim();
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
      <textarea placeholder="Adicionar comentÃ¡rio..." rows="3"></textarea>
      <div class="ti-form-actions ti-comment-actions">
        <button type="button" class="ti-btn-small ti-btn-gemini" title="Refinar comentÃ¡rio com ajuda da IA">âœ¨ Refinar com Gemini</button>
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
        this.showMessage('Digite algo antes de pedir ajuda Ã  Gemini.', 'warning');
        textarea.focus();
        return;
      }

      if (!GEMINI_API_KEY) {
        this.showMessage('Configure a chave da Gemini API nas configuraÃ§Ãµes.', 'error');
        return;
      }

      btnGemini.disabled = true;
      const previousLabel = btnGemini.textContent;
      btnGemini.textContent = 'â³ Refinando...';

      try {
        const refined = await this.generateCommentRefinement(originalText, {
          ticketId,
          contactName: this.currentContact,
          contactPhone: this.currentPhone
        });

        if (refined) {
          textarea.value = refined;
          textarea.classList.add('ti-ai-filled');
          this.showMessage('ComentÃ¡rio refinado pela Gemini. Revise antes de enviar.', 'success');
        } else {
          this.showMessage('A Gemini nÃ£o conseguiu melhorar este comentÃ¡rio.', 'warning');
        }
      } catch (error) {
        console.error('Erro ao refinar comentÃ¡rio com Gemini:', error);
        this.showMessage('NÃ£o foi possÃ­vel refinar o comentÃ¡rio agora.', 'error');
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
      'Chamado aberto! âœ“',
      `Ticket: *#${ticketCode}*`,
      `_Assunto: ${cleanSubject}_`,
      '',
      'Qualquer novidade falo por aqui.'
    ];

    const message = messageLines.join('\n');
    const sent = await this.sendWhatsAppMessageToCurrentChat(message);

    if (!sent) {
      this.showMessage('Chamado criado, mas nÃ£o consegui enviar a confirmaÃ§Ã£o no WhatsApp.', 'warning');
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
        console.warn('âœ‰ï¸ Campo de mensagem do WhatsApp nÃ£o encontrado para envio automÃ¡tico.');
        return false;
      }

      composer.focus();

      // Limpa conteÃºdo atual
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
        console.warn('ðŸ›‘ BotÃ£o de enviar mensagem nÃ£o encontrado.');
        return false;
      }

      sendButton.click();
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem automÃ¡tica:', error);
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
      conference: 'ConferÃªncia'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority) {
    const labels = {
      low: 'Baixa',
      medium: 'MÃ©dia',
      high: 'Alta',
      urgent: 'Urgente',
      critical: 'CrÃ­tico'
    };
    return labels[priority] || priority;
  }

  // Mapeia status do Milvus para formato da extensÃ£o
  mapMilvusStatus(status) {
    const statusMap = {
      'AgAtendimento': 'open',
      'A fazer': 'open',
      'Atendendo': 'in_progress',
      'Pausado': 'paused',
      'Finalizado': 'closed',
      'ConferÃªncia': 'conference',
      'Agendado': 'scheduled',
      'Expirado': 'closed',
      'Ag. soluÃ§Ã£o': 'pending'
    };
    return statusMap[status] || 'open';
  }

  // Mapeia prioridade do Milvus para formato da extensÃ£o
  mapMilvusPriority(prioridade) {
    const priorityMap = {
      'CrÃ­tico': 'critical',
      'Alta': 'high',
      'MÃ©dia': 'medium',
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

  // Remove cÃ³digo do paÃ­s (55) do telefone para enviar Ã  API
  cleanPhoneForAPI(phone) {
    if (!phone) return '';
    
    let clean = phone.replace(/\D/g, ''); // Remove tudo que nÃ£o Ã© dÃ­gito
    
    // Remove cÃ³digo do paÃ­s 55
    if (clean.startsWith('55')) {
      clean = clean.substring(2);
    }
    
    
    return clean;
  }
}

// Inicializa a extensÃ£o quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WhatsAppSupportExtension();
  });
} else {
  new WhatsAppSupportExtension();
}
