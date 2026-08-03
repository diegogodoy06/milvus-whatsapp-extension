// Content Script - Injetado no WhatsApp Web


// Configuração da API Milvus (pode ser alterada via popup)
let API_BASE_URL = 'https://apiintegracao.milvus.com.br/api'; // URL da API Milvus
let API_TOKEN = ''; // Token de autenticação
let GROQ_API_KEY = '';

// Configuração da API Groq (compatível com OpenAI)
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
// Modelo multimodal (suporta texto e imagem). A Groq descontinua modelos com
// frequência, então este valor pode ser sobrescrito pelo popup (chave groqModel).
const DEFAULT_GROQ_MODEL = 'qwen/qwen3.6-27b';
let GROQ_MODEL = DEFAULT_GROQ_MODEL;

// Mapeamento de Categorias do Milvus.
// Categorizamos até 3 níveis: Primária (departamento) | Secundária (categoria
// principal) | Terciária (detalhamento específico do problema). A IA escolhe o
// caminho mais específico disponível.
// Chave = "Primária | Secundária | Terciária"  |  Valor = ID da categoria no Milvus.
//
// OBS: alguns nomes de Terciária contêm " | " no próprio nome (ex: "Backup |
// Corrompido", "Impressoras | Instalação"). Por isso a Primária e a Secundária
// são SEMPRE os dois primeiros campos e todo o restante compõe a Terciária
// (ver splitCategoryPath). Os nomes são mantidos EXATAMENTE como no Milvus.
const MILVUS_CATEGORIES = {
  // ===== Marketing =====
  'Marketing': '182267',
  'Marketing | Artes Gráficas': '681221',

  // ===== Tecnologia da Informação =====
  'Tecnologia da Informação': '182275',

  // --- Acessos ---
  'Tecnologia da Informação | Acessos': '681485',
  'Tecnologia da Informação | Acessos | Criação de usuário | Novo colaborador / Cadastro de funcionário': '681486',
  'Tecnologia da Informação | Acessos | Liberação | Liberação Portões Estoque': '681487',
  'Tecnologia da Informação | Acessos | Liberações | Liberação de acesso Alarme': '681488',
  'Tecnologia da Informação | Acessos | Liberações | Liberação de acesso Outros': '681489',
  'Tecnologia da Informação | Acessos | Liberações | Liberação de acesso Pastas (NAS)': '681490',
  'Tecnologia da Informação | Acessos | Liberações | Liberação de funções ERP': '681491',
  'Tecnologia da Informação | Acessos | Liberações | Liberação de Sites / Firewall': '681492',
  'Tecnologia da Informação | Acessos | Recuperação de senha': '681493',
  'Tecnologia da Informação | Acessos | Remoção de Acessos': '681494',

  // --- Backup ---
  'Tecnologia da Informação | Backup': '681495',
  'Tecnologia da Informação | Backup | Backup | Corrompido': '681500',
  'Tecnologia da Informação | Backup | Backup | Execução': '681499',
  'Tecnologia da Informação | Backup | Backup | Não rodou': '681498',
  'Tecnologia da Informação | Backup | Corrompido': '681497',
  'Tecnologia da Informação | Backup | Restore | Execução': '681496',

  // --- Gerencial ---
  'Tecnologia da Informação | Gerencial': '681535',
  'Tecnologia da Informação | Gerencial | Procedimentos | Procedimento Operacional': '681536',
  'Tecnologia da Informação | Gerencial | Relatórios | Prestação de contas': '681537',
  'Tecnologia da Informação | Gerencial | Relatórios | Relatórios gerenciais / Saída': '681538',
  'Tecnologia da Informação | Gerencial | Torno CNC / Produção | Torno CNC / Prorrogar expiração mensal': '681553',

  // --- Hardware ---
  'Tecnologia da Informação | Hardware': '681527',
  'Tecnologia da Informação | Hardware | Computador | Configuração inicial': '681534',
  'Tecnologia da Informação | Hardware | Computador | Limpeza': '681533',
  'Tecnologia da Informação | Hardware | Computador | Não liga': '681532',
  'Tecnologia da Informação | Hardware | Computador | Troca de peça': '681531',
  'Tecnologia da Informação | Hardware | Infraestrutura | Mudança física': '681530',
  'Tecnologia da Informação | Hardware | Infraestrutura | Passagem de cabos': '681529',
  'Tecnologia da Informação | Hardware | Periféricos | Mouse / Teclado / Monitor / Outros': '681528',

  // --- Impressoras ---
  'Tecnologia da Informação | Impressoras': '681522',
  'Tecnologia da Informação | Impressoras | Impressoras | Instalação': '681523',
  'Tecnologia da Informação | Impressoras | Impressoras | Manutenção': '681524',
  'Tecnologia da Informação | Impressoras | Impressoras | Outros Problemas de impressão': '681525',
  'Tecnologia da Informação | Impressoras | Impressoras | Suprimentos / Troca de Tonner': '681526',

  // --- Servidor ---
  'Tecnologia da Informação | Servidor': '681518',
  'Tecnologia da Informação | Servidor | Servidor | Outros servidores / Virtualização': '681519',
  'Tecnologia da Informação | Servidor | Servidor | Servidor NAS': '681520',
  'Tecnologia da Informação | Servidor | Servidor | Servidor Windows': '681521',

  // --- Software ---
  'Tecnologia da Informação | Software': '681507',
  'Tecnologia da Informação | Software | ERP (Sistema) | Ajuste / Parametrização': '681517',
  'Tecnologia da Informação | Software | ERP (Sistema) | Cadastro de funcionário': '681516',
  'Tecnologia da Informação | Software | ERP (Sistema) | Erro no sistema': '681515',
  'Tecnologia da Informação | Software | Licenças | Contratar software / licença': '681514',
  'Tecnologia da Informação | Software | Outros Softwares | Instalação / Configuração / Remoção': '681511',
  'Tecnologia da Informação | Software | Sistema Operacional': '681509',
  'Tecnologia da Informação | Software | SKA | Ajuste / Parametrização / ERRO': '681508',

  // --- Telefonia ---
  'Tecnologia da Informação | Telefonia': '681501',
  'Tecnologia da Informação | Telefonia | Contratar Ramal / Linha / Linha Móvel / outros': '681506',
  'Tecnologia da Informação | Telefonia | Ramal / Linha fixa | Configurar / Instalar': '681505',
  'Tecnologia da Informação | Telefonia | Ramal / Linha fixa | Problema': '681504',
  'Tecnologia da Informação | Telefonia | Telefonia móvel | Problema com Aparelho': '681503',
  'Tecnologia da Informação | Telefonia | Telefonia móvel | Problema linha móvel / chip': '681502'
};

// Quebra um caminho de categoria "A | B | C" em até 3 níveis.
function splitCategoryPath(categoryPath) {
  if (!categoryPath || typeof categoryPath !== 'string') {
    return { primary: null, secondary: null, tertiary: null };
  }
  const parts = categoryPath.split(' | ').map(part => part.trim()).filter(Boolean);
  // Primária e Secundária nunca contêm " | ". A Terciária pode conter (ex:
  // "Backup | Corrompido"), então tudo a partir do 3º campo é reunido na Terciária.
  return {
    primary: parts[0] || null,
    secondary: parts[1] || null,
    tertiary: parts.length > 2 ? parts.slice(2).join(' | ') : null
  };
}

// Lista de categorias na ordem em que aparece no prompt. A IA responde apenas o
// número da opção, o que economiza tokens (entrada e saída) e evita erro de
// digitação no caminho completo.
const CATEGORY_OPTIONS = Object.keys(MILVUS_CATEGORIES);

// Monta a lista compacta enviada no prompt: agrupa por Primária (departamento)
// para não repetir "Tecnologia da Informação | " em ~50 linhas.
const CATEGORY_PROMPT_LIST = (() => {
  const lines = [];
  let currentPrimary = null;

  CATEGORY_OPTIONS.forEach((path, index) => {
    const { primary } = splitCategoryPath(path);
    if (primary !== currentPrimary) {
      currentPrimary = primary;
      lines.push(`[${primary}]`);
    }
    const rest = path.slice(primary.length).replace(/^\s*\|\s*/, '');
    lines.push(`${index + 1}. ${rest || '(geral)'}`);
  });

  return lines.join('\n');
})();

// Converte a resposta da IA (número da lista ou caminho completo) na categoria do Milvus.
function resolveCategoryFromResponse(parsed) {
  const empty = {
    category: null,
    categoryId: null,
    primaryCategory: null,
    secondaryCategory: null,
    tertiaryCategory: null
  };

  let path = null;
  const index = Number(parsed?.categoryIndex);

  if (Number.isInteger(index) && index >= 1 && index <= CATEGORY_OPTIONS.length) {
    path = CATEGORY_OPTIONS[index - 1];
  } else if (typeof parsed?.category === 'string' && MILVUS_CATEGORIES[parsed.category.trim()]) {
    path = parsed.category.trim();
  }

  if (!path) return empty;

  const levels = splitCategoryPath(path);
  return {
    category: path,
    categoryId: MILVUS_CATEGORIES[path],
    primaryCategory: levels.primary,
    secondaryCategory: levels.secondary,
    tertiaryCategory: levels.tertiary
  };
}

// ===== Chamadas à Groq com tratamento de rate limit =====
const GROQ_MAX_RETRIES = 3;
const GROQ_MAX_RETRY_WAIT_MS = 30000;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Lê quanto tempo esperar antes de repetir: header Retry-After ou o
// "Please try again in 4.7925s" que vem na mensagem de erro da Groq.
function parseGroqRetryDelay(response, data) {
  const header = response.headers.get('retry-after');
  if (header) {
    const seconds = parseFloat(header);
    if (Number.isFinite(seconds)) return seconds * 1000;
  }

  const message = data?.error?.message || '';
  const match = message.match(/try again in\s+([\d.]+)\s*(ms|m|s)\b/i);
  if (match) {
    const value = parseFloat(match[1]);
    if (Number.isFinite(value)) {
      const unit = match[2].toLowerCase();
      if (unit === 'ms') return value;
      if (unit === 'm') return value * 60000;
      return value * 1000;
    }
  }

  return null;
}

// Detecta o erro do modo JSON estrito da Groq (code "json_validate_failed"),
// que acontece quando a saída do modelo é truncada ou vem com texto extra.
function isJsonValidationError(response, data) {
  if (response.status !== 400) return false;
  return data?.error?.code === 'json_validate_failed' ||
    /failed to validate json/i.test(data?.error?.message || '');
}

// Envia o payload para a Groq, repetindo automaticamente em 429 (rate limit) e
// erros temporários do servidor. onRetry(ms, tentativa) permite avisar o usuário.
async function callGroqApi(payload, { onRetry } = {}) {
  let lastError = new Error('Erro desconhecido na Groq API');
  let body = { ...payload };
  let jsonModeDropped = false;
  let attempt = 0;

  while (attempt <= GROQ_MAX_RETRIES) {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => null);

    if (response.ok) return data;

    // O modo JSON estrito rejeitou a saída. Modelos de raciocínio às vezes
    // devolvem JSON truncado ou com texto em volta; repetimos sem o
    // response_format e deixamos o parser tolerante do chamador resolver.
    if (isJsonValidationError(response, data)) {
      const failedGeneration = data?.error?.failed_generation;
      console.warn('Groq: JSON inválido no modo estrito.', failedGeneration || data?.error?.message);

      if (body.response_format && !jsonModeDropped) {
        jsonModeDropped = true;
        const { response_format, ...rest } = body;
        body = rest;
        continue; // não conta como tentativa de rate limit
      }

      // Último recurso: aproveita o texto bruto que a Groq devolveu.
      if (failedGeneration) {
        return { choices: [{ message: { content: failedGeneration } }] };
      }
    }

    const isRateLimit = response.status === 429;
    lastError = new Error(
      isRateLimit
        ? 'Limite de uso da Groq atingido (tokens por minuto). Aguarde alguns segundos e tente novamente.'
        : (data?.error?.message || `Erro ${response.status} na Groq API`)
    );
    lastError.status = response.status;
    lastError.isRateLimit = isRateLimit;
    lastError.details = data?.error?.message || null;

    const isRetryable = isRateLimit || response.status === 500 || response.status === 502 || response.status === 503;
    if (!isRetryable || attempt === GROQ_MAX_RETRIES) break;

    const suggested = parseGroqRetryDelay(response, data);
    const delayMs = Math.min(suggested ?? (2000 * (attempt + 1)), GROQ_MAX_RETRY_WAIT_MS) + 500;

    if (typeof onRetry === 'function') {
      onRetry(delayMs, attempt + 1);
    }

    console.warn(`Groq retornou ${response.status}. Tentando novamente em ${Math.round(delayMs / 1000)}s...`, data?.error?.message || '');
    await wait(delayMs);
    attempt++;
  }

  throw lastError;
}

// Carrega configurações salvas
chrome.storage.sync.get(['apiBaseUrl', 'apiToken', 'groqApiKey', 'groqModel'], (result) => {
  if (result.apiBaseUrl) {
    API_BASE_URL = result.apiBaseUrl;
  }
  if (result.apiToken) {
    API_TOKEN = result.apiToken;
  }
  if (result.groqApiKey) {
    GROQ_API_KEY = result.groqApiKey;
  }
  if (result.groqModel) {
    GROQ_MODEL = result.groqModel;
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
  if ('groqApiKey' in changes) {
    GROQ_API_KEY = changes.groqApiKey?.newValue || '';
  }
  if ('groqModel' in changes) {
    GROQ_MODEL = changes.groqModel?.newValue || DEFAULT_GROQ_MODEL;
  }
});

// Classe principal da extensão
class WhatsAppSupportExtension {
  constructor() {
    this.currentContact = null;
    this.currentPhone = null;
    this.tickets = [];
    this.panelVisible = true;
    this.headerObserver = null;
    this.mainObserver = null;
    this.chatListObserver = null;
    this.themeObserver = null;
    this.contextMenuObserver = null;
    this.lastContextMenuMessage = null;
    this.messageActionsSetup = false;
    this.sharedTicketBtn = null;
    this.hoveredMessage = null;
    this.storeRequestInFlight = null;
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
    
    // Verificacao periodica para garantir que o painel exista
    this.startPanelWatcher();
  }
  
  startPanelWatcher() {
    // Desabilitado - causava travamentos
    // O painel agora é injetado apenas uma vez e o CSS garante visibilidade
    return;
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
    // getComputedStyle força recálculo de estilo, então só é usado na detecção
    // inicial — nunca dentro do observer.
    this.applyTheme(true);

    // Observer criado UMA única vez. Antes, cada mutação criava um novo par de
    // observers que chamava esta função de novo — multiplicação exponencial de
    // observers, uma das principais causas de travamento.
    if (this.themeObserver) return;

    this.themeObserver = new MutationObserver(() => {
      this.applyTheme(false);
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-color-scheme', 'class']
    });

    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  applyTheme(checkComputedStyle = false) {
    const isDark = document.body.classList.contains('dark') ||
                   document.documentElement.getAttribute('data-theme') === 'dark' ||
                   document.documentElement.getAttribute('data-color-scheme') === 'dark' ||
                   (checkComputedStyle && getComputedStyle(document.body).backgroundColor === 'rgb(17, 27, 33)');

    const next = isDark ? 'dark' : 'light';
    // Evita reescrever o atributo (e re-disparar estilos) se nada mudou
    if (document.body.getAttribute('data-theme') !== next) {
      document.body.setAttribute('data-theme', next);
    }
  }

  waitForWhatsAppLoad() {
    
    let attempts = 0;
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      // Verifica se o WhatsApp está carregado (qualquer elemento principal)
      const appElement = document.querySelector('#app');
      const hasLoaded = appElement && appElement.querySelector('[data-testid], [role]');
      
      if (hasLoaded) {
        clearInterval(checkInterval);
        
        console.log('[TI Support] WhatsApp carregado');
        
        // Configura observers para detectar mudanças de contato com delay maior
        setTimeout(() => {
          this.setupObservers();
        }, 2000);
        
      } else if (attempts > 60) {
        clearInterval(checkInterval);
        console.error('� Timeout: WhatsApp não carregou após 60 tentativas');
      } else if (attempts % 10 === 0) {
        
      }
    }, 1000);
  }

  injectPanel() {
    // Remove painel existente se houver (evita duplicatas)
    const existingPanel = document.getElementById('ti-support-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
    const existingButton = document.getElementById('ti-floating-toggle');
    if (existingButton) {
      existingButton.remove();
    }
    
    // Cria o container do painel lateral
    const panel = document.createElement('div');
    panel.id = 'ti-support-panel';
    panel.className = 'ti-support-panel';
    panel.innerHTML = `
      <div class="ti-panel-header">
        <h2>
          <svg viewBox="0 0 24 24" width="24" height="24" class="ti-icon">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          Chamados de Suporte
        </h2>
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
    console.log('[TI Support] Injetando painel...');
    document.body.appendChild(panel);
    
    // Painel sempre visível - remover classe hidden
    document.body.classList.remove('ti-panel-hidden');
    
    // Aplica estilos de layout PRIMEIRO
    this.adjustWhatsAppLayout();
    
    // Depois configura event listeners
    this.setupEventListeners();
    
    console.log('[TI Support] Painel injetado com sucesso!');
  }

  createFloatingButton() {
    // Botão flutuante removido - painel sempre visível
    return;
  }

  adjustWhatsAppLayout() {
    // Verifica se o estilo já existe para evitar duplicatas
    const existingStyle = document.getElementById('ti-layout-adjustments');
    if (existingStyle) {
      return; // Já foi aplicado
    }
    
    // Ajusta o layout do WhatsApp para painel FIXO lateral - SEMPRE VISÍVEL
    const style = document.createElement('style');
    style.id = 'ti-layout-adjustments';
    style.textContent = `
      /* Garante que o painel da extensão esteja sempre visível */
      #ti-support-panel {
        display: flex !important;
        position: fixed !important;
        right: 0 !important;
        top: 0 !important;
        width: 400px !important;
        height: 100vh !important;
        /* z-index baixo de propósito: o painel fica no espaço reservado de 400px
           (não sobrepõe a UI normal do WhatsApp), mas qualquer overlay de tela
           cheia do WhatsApp — visualizador de imagem/vídeo, modais — fica POR CIMA
           do painel naturalmente. Assim não precisamos detectar a mídia via JS. */
        z-index: 100 !important;
        background: #ffffff !important;
      }
      
      /* Tema escuro */
      body[data-theme="dark"] #ti-support-panel {
        background: #111b21 !important;
      }
      
      /* Força o WhatsApp a deixar espaço para o painel fixo - SEMPRE */
      /* Seletores atualizados para nova estrutura do WhatsApp Web 2024/2025 */
      #app {
        width: calc(100vw - 400px) !important;
        max-width: calc(100vw - 400px) !important;
        margin-right: 400px !important;
      }
      
      /* Container principal do WhatsApp */
      #app > div,
      #app > div > div,
      #app > div > div > div {
        max-width: 100% !important;
        width: 100% !important;
      }
      
      /* Wrapper principal que contém sidebar e chat */
      [data-testid="web"] {
        width: 100% !important;
        max-width: 100% !important;
      }
      
      /* Lista de chats e área de conversa */
      [data-testid="chat-list"],
      #main,
      [role="main"],
      [data-testid="default-user"],
      [data-testid="conversation-panel-wrapper"] {
        max-width: 100% !important;
      }
      
      /* Evita que elementos flutuantes do WhatsApp fiquem sobre o painel */
      [data-testid="menu"],
      [data-testid="popup"] {
        right: auto !important;
      }
    `;
    document.head.appendChild(style);
    console.log('[TI Support] Estilos de layout aplicados');

    // Antes existia um MutationObserver no body inteiro (subtree) para detectar
    // a abertura do visualizador de mídia e esconder o painel. Isso causava
    // travamentos longos ao abrir/fechar imagens (tempestade de mutações +
    // leitura de layout). Removido: agora o painel tem z-index baixo e o
    // overlay de tela cheia do WhatsApp simplesmente fica por cima dele.
  }

  setupEventListeners() {
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
    // Só reaproveita o header em cache se ainda estiver no DOM (evita usar um
    // header "fantasma" de uma conversa anterior já removida).
    if (this.chatHeader && this.chatHeader.isConnected) {
      return this.chatHeader;
    }
    return (document.querySelector('#main') || document.querySelector('[role="main"]'))?.querySelector('header') || null;
  }

  observeHeader(header) {
    if (!header) {
      console.warn('⚠� observeHeader chamado sem header válido');
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
    
  }

  setupObservers() {
    console.log('[TI Support] Configurando observers...');
    
    // Detecção de mudança de contato apenas por clique (muito mais leve)
    // Removemos observers pesados que causavam travamento
    
    // Detecção inicial após delay
    this.scheduleContactDetection(2000, 'detecção inicial');
    
    // Tenta configurar observer no header se existir
    const header = this.getChatHeader();
    if (header) {
      this.observeHeader(header);
    }
    
    // Observer LEVE no main element para detectar quando um header é criado
    const mainElement = document.querySelector('[role="main"]') || document.querySelector('#main');
    if (mainElement && !this.mainObserver) {
      let mainDebounceTimer = null;
      this.mainObserver = new MutationObserver(() => {
        if (mainDebounceTimer) clearTimeout(mainDebounceTimer);
        mainDebounceTimer = setTimeout(() => {
          const newHeader = this.getChatHeader();
          if (newHeader && newHeader !== this.chatHeader) {
            this.observeHeader(newHeader);
            this.scheduleContactDetection(500, 'header recriado');
          }
        }, 1000);
      });

      this.mainObserver.observe(mainElement, { 
        childList: true, 
        subtree: false
      });
    }

    // Captura clique na lista de chats (muito mais leve que observer)
    const chatList = document.querySelector('[data-testid="chat-list"]') ||
                     document.querySelector('[role="grid"]');

    if (chatList) {
      chatList.addEventListener('click', () => {
        this.scheduleContactDetection(800, 'clique na lista de chats');
      }, { passive: true, capture: true });
    }

    // Configura ações nas mensagens com delay maior
    setTimeout(() => this.setupMessageActions(), 3000);

    // Monitor principal: o WhatsApp removeu o header/data-testid do DOM, então
    // os observers acima ficaram pouco confiáveis. Aqui lemos o chat ativo do
    // Store interno a cada 1,5s e disparamos a detecção quando o chat muda.
    this.startStorePolling();

    console.log('[TI Support] Observers configurados');
  }

  startStorePolling() {
    if (this.storePollTimer) return;
    this.lastStoreJid = undefined;

    this.storePollTimer = setInterval(async () => {
      // Não gasta CPU com a aba em segundo plano nem quando o Store não existe
      if (this.storeUnavailable || document.hidden) return;

      const store = await this.getActiveChatFromStore();
      const jid = store && store.jid ? store.jid : null;

      if (jid !== this.lastStoreJid) {
        this.lastStoreJid = jid;
        // Reaproveita o resultado do Store: evita uma 2ª ida ao injected.js
        this.detectContactChange(store);
      }
    }, 2000);
  }

  setupMessageActions() {
    // Antes: um MutationObserver com subtree:true na área de mensagens injetava
    // um botão + 4 listeners de hover em CADA mensagem. Como a própria injeção
    // gera mutações observadas, isso criava um loop infinito de reprocessamento
    // (4 querySelectorAll pesados + appendChild a cada 1,5s, para sempre) — a
    // principal causa dos travamentos. Agora usamos DELEGAÇÃO: um único botão
    // compartilhado e 2 listeners no #app, sem observer nenhum na lista.
    if (this.messageActionsSetup) return;

    const appElement = document.querySelector('#app');
    if (!appElement) {
      setTimeout(() => this.setupMessageActions(), 3000);
      return;
    }
    this.messageActionsSetup = true;

    const MESSAGE_SELECTOR = '[data-testid="msg-container"], [data-id], .message-in, .message-out, div.copyable-text';

    // Botão único compartilhado, movido para a mensagem sob o cursor
    const ticketBtn = document.createElement('button');
    ticketBtn.type = 'button';
    ticketBtn.className = 'ti-simple-ticket-btn';
    ticketBtn.title = 'Criar chamado de suporte';
    ticketBtn.innerHTML = '🎫';
    ticketBtn.style.cssText = `
      position: absolute;
      top: -8px;
      right: -8px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #00a884;
      color: white;
      border: 2px solid white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.15s, transform 0.15s;
      pointer-events: none;
      transform: scale(0.8);
    `;
    ticketBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();
      if (this.hoveredMessage) {
        this.handleMessageTicket(this.hoveredMessage);
      }
    });
    this.sharedTicketBtn = ticketBtn;

    // Delegação de hover: um único listener em vez de 4 por mensagem
    appElement.addEventListener('mouseover', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      // Só atua dentro da conversa aberta
      if (!target.closest('#main, [role="main"]')) {
        this.hideSharedTicketButton();
        return;
      }

      const msg = target.closest(MESSAGE_SELECTOR);
      if (!msg) {
        this.hideSharedTicketButton();
        return;
      }
      if (msg === this.hoveredMessage) return;

      this.showSharedTicketButtonOn(msg);
    }, { passive: true });

    // Registra a mensagem clicada para o item "Abrir chamado" do menu de contexto
    const rememberMessage = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target || ticketBtn.contains(target)) return;
      const msg = target.closest(MESSAGE_SELECTOR);
      this.lastContextMenuMessage = (msg && msg.closest('#main, [role="main"]')) ? msg : null;
    };
    appElement.addEventListener('click', rememberMessage, { capture: true, passive: true });
    appElement.addEventListener('contextmenu', rememberMessage, { capture: true, passive: true });

    // Configura observer do menu de contexto
    this.setupContextMenuObserver();

    console.log('[TI Support] Ações nas mensagens configuradas (delegação)');
  }

  showSharedTicketButtonOn(messageElement) {
    const btn = this.sharedTicketBtn;
    if (!btn || !messageElement) return;

    this.hoveredMessage = messageElement;

    if (btn.parentElement !== messageElement) {
      if (!messageElement.style.position) {
        messageElement.style.position = 'relative';
      }
      messageElement.appendChild(btn);
    }

    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    btn.style.transform = 'scale(1)';
  }

  hideSharedTicketButton() {
    const btn = this.sharedTicketBtn;
    if (!btn || !this.hoveredMessage) return;

    this.hoveredMessage = null;
    btn.style.opacity = '0';
    btn.style.pointerEvents = 'none';
    btn.style.transform = 'scale(0.8)';
  }

  setupContextMenuObserver() {
    if (this.contextMenuObserver) {
      return; // Já configurado
    }

    // Observer apenas no #app para detectar menus (muito mais leve que document.body)
    const appElement = document.querySelector('#app');
    if (!appElement) return;

    this.contextMenuObserver = new MutationObserver((mutations) => {
      // Sem mensagem-alvo registrada não há o que injetar: sai imediatamente.
      // Isso torna o custo do observer praticamente zero durante o uso normal
      // (antes ele rodava querySelector em toda mutação do #app inteiro).
      if (!this.lastContextMenuMessage) return;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;

          // Busca menus de contexto
          const menu = node.matches('[role="menu"]') ? node : (node.childElementCount ? node.querySelector('[role="menu"]') : null);
          if (menu) {
            setTimeout(() => this.injectContextMenuItem(menu), 50);
          }
        }
      }
    });

    this.contextMenuObserver.observe(appElement, {
      childList: true,
      subtree: true
    });
    
    console.log('[TI Support] Observer do menu de contexto configurado');
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
     if (prePlain.includes('Você:')) {
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
      this.showMessage('Não foi possível capturar conteúdo da mensagem selecionada.', 'error');
      return;
    }

    if (!GROQ_API_KEY) {
      this.showMessage('Configure a chave da Groq API nas configurações da extensão.', 'error');
      return;
    }

    try {
      if (!this.panelVisible) {
        this.suppressNextTicketLoad = true;
        this.togglePanel(true);
      }

      if (imageData) {
        this.showMessage('🖼️ Analisando imagem com Groq...', 'info');
      } else {
        this.showMessage('💡 Gerando sugestão de chamado com Groq...', 'info');
      }

      const suggestion = await this.generateTicketSuggestion(messageText, imageData);

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
        tertiaryCategory: suggestion.tertiaryCategory,
        source: suggestion.source || 'groq',
        hasImage: !!imageData
      });
    } catch (error) {
      console.error('Erro ao gerar sugestão com Groq:', error);
      this.showMessage(`Falha ao gerar sugestão: ${error.message}`, 'error');

      this.showNewTicketForm({
        title: '',
        description: messageText || '[Imagem anexada - análise não disponível]',
        contactName: this.currentContact,
        contactPhone: this.currentPhone,
        originalMessage: messageText,
        source: 'manual',
        hasImage: !!imageData
      });
    }
  }

  async generateTicketSuggestion(messageText, imageData = null) {
    const sanitizedMessage = messageText ? messageText.trim().slice(0, 2500) : '';

    let prompt = `Você é um analista de suporte técnico. `;

    prompt += imageData
      ? `Analise a imagem (evidência principal do problema) e o texto, se houver.`
      : `Analise a mensagem.`;

    prompt += `

Gere:
1. "title": título curto (até 80 caracteres) do problema identificado
2. "description": descrição detalhada${imageData ? ', incluindo o que aparece na imagem (telas, erros, equipamentos)' : ''}
3. "categoryIndex": o NÚMERO da categoria mais adequada da lista abaixo

CATEGORIAS (agrupadas por departamento entre colchetes; " | " separa subníveis):
${CATEGORY_PROMPT_LIST}

Escolha sempre a opção MAIS ESPECÍFICA que descreva o problema. Use "(geral)" ou
uma opção mais curta apenas quando nenhuma específica se aplicar.

Responda APENAS em JSON: {"title":"...","description":"...","categoryIndex":0}

Use um tom profissional e claro em português.`;

    if (messageText) {
      prompt += `\n\nTexto da mensagem: """${sanitizedMessage}"""`;
    }

    // Monta o conteúdo da mensagem no formato OpenAI/Groq
    const content = [];

    // Adiciona o prompt de texto
    content.push({ type: 'text', text: prompt });

    // Adiciona imagem se disponível
    if (imageData) {
      try {
        const base64Image = await this.convertImageToBase64(imageData.element);
        content.push({
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`
          }
        });
      } catch (error) {
        console.warn('Falha ao processar imagem, continuando só com texto:', error);
        if (!messageText) {
          throw new Error('Não foi possível processar a imagem e não há texto disponível');
        }
      }
    }

    // Se não houver imagem, envia o texto como string simples
    const messageContent = content.length === 1 ? content[0].text : content;

    const payload = {
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: messageContent
        }
      ],
      temperature: 0.35,
      top_p: 0.95,
      // Folga suficiente para modelos de raciocínio: se o orçamento acaba antes
      // do fim do JSON, a Groq rejeita a resposta com "Failed to validate JSON".
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    };

    const data = await callGroqApi(payload, {
      onRetry: (delayMs) => {
        this.showMessage(`⏳ Limite da Groq atingido. Tentando novamente em ${Math.ceil(delayMs / 1000)}s...`, 'info');
      }
    });

    const combinedText = (data?.choices?.[0]?.message?.content || '').trim();

    console.log('Groq raw response:', combinedText);

    if (!combinedText) {
      return {
        title: '',
        description: sanitizedMessage || '[Imagem anexada - descrição não gerada]',
        category: null,
        categoryId: null,
        notice: 'Não foi possível gerar sugestão automática. Conteúdo original carregado.',
        source: 'groq'
      };
    }

    // Remove blocos de raciocínio (modelos como o qwen podem emiti-los quando o
    // modo JSON estrito é desativado) e marcadores de código markdown.
    let cleaned = combinedText
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    // Tenta extrair JSON do texto (pode vir com texto antes/depois)
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    console.log('Groq response (cleaned):', cleaned);

    try {
      const parsed = JSON.parse(cleaned);

      // Extrai categorias (até 3 níveis: primária | secundária | terciária)
      const category = resolveCategoryFromResponse(parsed);

      return {
        title: typeof parsed.title === 'string' ? parsed.title.trim() : '',
        description: typeof parsed.description === 'string' ? parsed.description.trim() : (sanitizedMessage || '[Imagem anexada - descrição não gerada]'),
        category: category.category,
        categoryId: category.categoryId,
        primaryCategory: category.primaryCategory,
        secondaryCategory: category.secondaryCategory,
        tertiaryCategory: category.tertiaryCategory,
        source: 'groq'
      };
    } catch (error) {
      console.warn('Não foi possível interpretar resposta da Groq como JSON. Texto bruto:', combinedText);
      return {
        title: '',
        description: sanitizedMessage || '[Imagem anexada - descrição não gerada]',
        category: null,
        categoryId: null,
        notice: 'Sugestão recebida em formato inesperado. Conteúdo original carregado.',
        source: 'groq'
      };
    }
  }

  async generateCommentRefinement(originalComment, context = {}) {
    const sanitizedComment = originalComment.trim().slice(0, 4000);

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
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    };

    const data = await callGroqApi(payload, {
      onRetry: (delayMs) => {
        this.showMessage(`⏳ Limite da Groq atingido. Tentando novamente em ${Math.ceil(delayMs / 1000)}s...`, 'info');
      }
    });

    const combinedText = (data?.choices?.[0]?.message?.content || '').trim();

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
      console.warn('Não foi possível interpretar resposta da Groq para comentário. Texto bruto:', combinedText);
      return sanitizedComment;
    }
  }

  addToolbarButton() {
    // Botão removido - painel sempre visível
    return;
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
    // Painel sempre visível - este método agora apenas garante visibilidade
    const panel = document.getElementById('ti-support-panel');
    if (!panel) return;

    // Garantir que o painel sempre esteja visível
    this.panelVisible = true;
    panel.classList.remove('hidden');
    document.body.classList.remove('ti-panel-hidden');
  }

  // Pede ao injected.js (rodando no contexto da página) os dados do chat ativo
  // lidos do Store interno do WhatsApp (nome + telefone real, mesmo com @lid).
  async getActiveChatFromStore() {
    if (this.storeUnavailable) return null;

    // Deduplica chamadas concorrentes (polling + detectContactChange):
    // todas aguardam a mesma resposta em vez de abrir várias requisições.
    if (this.storeRequestInFlight) {
      return this.storeRequestInFlight;
    }

    this.storeRequestInFlight = this.requestActiveChatFromStore();
    try {
      return await this.storeRequestInFlight;
    } finally {
      this.storeRequestInFlight = null;
    }
  }

  async requestActiveChatFromStore() {
    const result = await new Promise((resolve) => {
      const reqId = 'ti_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      let done = false;
      const handler = (event) => {
        if (event.source !== window) return;
        const d = event.data;
        if (!d || d.__tiSupport !== 'response' || d.reqId !== reqId) return;
        done = true;
        window.removeEventListener('message', handler);
        resolve({ ok: true, data: d.result || null });
      };
      window.addEventListener('message', handler);
      window.postMessage({ __tiSupport: 'request', reqId }, '*');
      setTimeout(() => {
        if (!done) { window.removeEventListener('message', handler); resolve({ ok: false }); }
      }, 1000);
    });

    if (!result.ok) {
      // injected.js não respondeu (não carregou / world MAIN indisponível)
      this.storeNoResponse = (this.storeNoResponse || 0) + 1;
      if (this.storeNoResponse >= 3) {
        this.storeUnavailable = true;
        console.warn('[TI Support] Store interno indisponível; usando fallback do DOM.');
      }
      return null;
    }

    this.storeNoResponse = 0;
    return result.data; // null (sem chat ativo) ou { name, phone, jid, isGroup }
  }

  async detectContactChange(preloadedStore = null) {
    // Fonte primária: estado interno do WhatsApp via injected.js (Store).
    // O WhatsApp removeu o telefone do DOM, então lemos nome+telefone do Store.
    // Quando chamado pelo polling, reaproveita o resultado já obtido.
    const store = preloadedStore || await this.getActiveChatFromStore();
    const storeName = store && store.name ? store.name : '';
    const hasActiveStoreChat = !!(store && (store.phone || store.name));

    const headerElement = this.getChatHeader();

    // Telefone: primeiro do Store interno; se faltar, tenta o DOM (legado).
    const phone = (store && store.phone) ? store.phone : this.extractPhoneNumber();

    const hasConversation = hasActiveStoreChat || !!phone || !!headerElement;
    
    
    if (!hasConversation) {
      
      
      if (this.currentContact || this.currentPhone || this.tickets.length > 0) {
        
        this.currentContact = null;
        this.currentPhone = null;
        this.tickets = [];
      }

      this.pendingPhoneRetryCount = 0;
      this.pendingNameRetryCount = 0;

      this.hideSharedTicketButton();
      this.updateContactInfo();
      return;
    }

    let shouldRetryPhone = false;
    if (!phone) {
      this.pendingPhoneRetryCount += 1;

      if (this.pendingPhoneRetryCount <= 6) {
        // Não retorna mais aqui: segue e mostra o NOME do contato enquanto
        // tenta o telefone em segundo plano. Antes o card ficava oculto até o
        // telefone aparecer (ou sumia de vez se ele nunca era encontrado).
        shouldRetryPhone = true;
      } else {
        console.warn('[TI Support] Não foi possível detectar o telefone após múltiplas tentativas');
      }
    } else {
      this.pendingPhoneRetryCount = 0;
    }
    
    // Extrai nome do contato - tenta múltiplos seletores
    let contactName = '';
    let shouldRetryName = false;
    
    
    
    // SOLUÇÃO DEFINITIVA: SEMPRE re-buscar header (nunca usar cache/parâmetro)
    const header = document.querySelector('header[data-testid="conversation-header"]') ||
                   document.querySelector('#main header') ||
                   document.querySelector('div[data-testid="conversation-header"] header') ||
                   document.querySelector('div[data-testid="conversation-header"]');
    
    if (header) {
      
      
      // MÉTODO DEFINITIVO: Buscar o span de nome usando a estrutura conhecida
      
      // 1. Buscar pelo atributo title (mais confiável - contém nome completo)
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

      // 2. Buscar no container principal de informações
      if (!contactName) {
        const headerContent = header.querySelector('div[role="button"]');
        if (headerContent) {
          // Pega TODOS os spans, filtra os que têm texto válido
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

    // Método 2: Busca no chat selecionado da lista lateral
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

    // Método 3: Busca em atributos do header
    if (!contactName && header) {
      
      const ariaLabel = header.getAttribute('aria-label');
      if (ariaLabel) {
        contactName = ariaLabel.split(',')[0]?.trim() || '';
        
      }
    }

    // Método 4: Se não encontrou nome ou pegou um número, usa fallback
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

    // O nome do Store interno é o mais confiável: sobrescreve o do DOM.
    if (storeName) {
      contactName = storeName;
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
      
      // SEMPRE atualiza as informações do contato no painel
      
      this.updateContactInfo();
      
      
      // Se o painel estiver aberto, recarrega os chamados automaticamente
      if (this.panelVisible) {
        
        this.loadTickets();
      } else {
        
      }
    } else if (this.currentContact && this.currentPhone) {
      // Mesmo sem mudança, SEMPRE atualiza o display
      
      this.updateContactInfo();
      
    } else {
      
    }

    if (shouldRetryName && this.pendingNameRetryCount < 6) {
      this.pendingNameRetryCount += 1;
      this.scheduleContactDetection(400 + this.pendingNameRetryCount * 120, `retentativa nome (${this.pendingNameRetryCount})`);
    } else if (!shouldRetryName) {
      this.pendingNameRetryCount = 0;
    }

    // Continua tentando o telefone em segundo plano (sem bloquear a exibição do nome)
    if (shouldRetryPhone) {
      this.scheduleContactDetection(350 + this.pendingPhoneRetryCount * 100, `retentativa telefone (${this.pendingPhoneRetryCount})`);
    }

    // Garante que a delegação de ações em mensagens está ativa (idempotente:
    // depois da primeira configuração este chamado retorna imediatamente)
    this.setupMessageActions();
  }

  extractPhoneNumber() {
    // Método 1: Extrair da URL (quando aberto via wa.me / send?phone=)
    const urlMatch = window.location.href.match(/(?:phone=|\/)(\d{10,15})(?:@|&|$)/);
    if (urlMatch) {
      return urlMatch[1];
    }

    const mainArea = document.querySelector('#main') || document.querySelector('[role="main"]');

    // Método 2: data-id das mensagens (ex.: "false_5511999999999@c.us_3EB0...").
    // É a fonte mais confiável no WhatsApp atual, que removeu os data-testid.
    // Procura o número antes de "@c.us" / "@s.whatsapp.net" (ignora @g.us/@lid).
    const phoneFromDataId = (root) => {
      if (!root) return null;
      const els = root.querySelectorAll('[data-id*="@c.us"], [data-id*="@s.whatsapp.net"]');
      for (const el of els) {
        const dataId = el.getAttribute('data-id') || '';
        const matches = [...dataId.matchAll(/(\d{10,15})@(?:c\.us|s\.whatsapp\.net)/g)];
        if (matches.length) {
          // Em grupos, o último é o participante; em 1:1 só há um.
          return matches[matches.length - 1][1];
        }
      }
      return null;
    };

    const phoneFromMessages = phoneFromDataId(mainArea);
    if (phoneFromMessages) {
      return phoneFromMessages;
    }

    // Método 3: data-id no próprio header da conversa
    const header = document.querySelector('#main header') ||
                   document.querySelector('[role="main"] header') ||
                   document.querySelector('header[data-testid="conversation-header"]');
    if (header) {
      const dataId = header.getAttribute('data-id') || '';
      const match = dataId.match(/(\d{10,15})@/);
      if (match) {
        return match[1];
      }
    }

    // Método 4: Última tentativa - span com título contendo número
    const titleSpan = document.querySelector('#main span[title]') ||
                      document.querySelector('[role="main"] span[title]');
    if (titleSpan) {
      const phoneMatch = (titleSpan.getAttribute('title') || '').match(/\d{10,15}/);
      if (phoneMatch) {
        return phoneMatch[0];
      }
    }

    console.warn('[TI Support] Não foi possível extrair o telefone');
    return null;
  }

  updateContactInfo() {
    
    
    
    const infoDiv = document.getElementById('ti-contact-info');
    if (!infoDiv) {
      console.error('[TI Support] Elemento ti-contact-info não encontrado!');
      return;
    }

    const nameEl = infoDiv.querySelector('.ti-contact-name');
    const phoneEl = infoDiv.querySelector('.ti-contact-phone');

    // Mostra o contato assim que tivermos NOME OU TELEFONE (não exige os dois).
    // Antes exigia ambos, então qualquer falha na extração do telefone fazia o
    // card sumir e exibir "Nenhuma conversa selecionada".
    if (this.currentContact || this.currentPhone) {
      infoDiv.classList.remove('hidden');

      const contactName = this.currentContact;
      if (!contactName || contactName.startsWith('Contato (') || contactName === 'Contato sem nome') {
        // Nome ainda não detectado: mostra o que for possível
        nameEl.textContent = this.currentPhone ? 'Sem nome salvo' : 'Contato selecionado';
      } else {
        nameEl.textContent = contactName;
      }

      phoneEl.textContent = this.currentPhone
        ? `Tel: ${this.currentPhone}`
        : 'Buscando número...';
    } else {
      // Nenhum contato selecionado
      infoDiv.classList.remove('hidden');
      nameEl.textContent = '📭 Nenhuma conversa selecionada';
      phoneEl.textContent = 'Abra um chat para visualizar tickets';
    }
  }

  async loadTickets() {
    
    
    
    
    
    const listDiv = document.getElementById('ti-tickets-list');
    if (!listDiv) {
      console.error('� Elemento ti-tickets-list não encontrado!');
      return;
    }
    
    if (!this.currentPhone) {
      console.warn('⚠� Telefone não identificado');
      listDiv.innerHTML = `
        <div class="ti-empty-state">
          <div class="ti-empty-icon">📭</div>
          <div class="ti-empty-title">Nenhuma conversa selecionada</div>
          <div class="ti-empty-message">Abra um chat para visualizar os tickets</div>
        </div>
      `;
      return;
    }

    listDiv.innerHTML = '<div class="ti-loading">� Buscando chamados...</div>';

    try {
      // Remove +55 ou 55 do início do telefone usando função auxiliar
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
        console.error('� Erro na API:', errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      
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
        subcategory2: ticket.categoria_terciaria,
        mesa: ticket.mesa_trabalho,
        lastLog: ticket.ultima_log
      })) : [];
      
      
      
      
      // VALIDAÇÃO APENAS POR NÚMERO (sem nome)
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
      
      // Mensagem quando não encontrar nada
      if (filteredTickets.length === 0) {
        
        listDiv.innerHTML = `
          <div class="ti-empty">
            <p style="margin: 0; font-size: 14px; color: #667781;">Nenhum chamado em aberto</p>
            <small style="color: #8696a0; margin-top: 4px;">${this.currentContact ? `Contato: ${this.currentContact}` : `Telefone: ${cleanPhone}`}</small>
          </div>
        `;
      }
    } catch (error) {
      console.error('� Erro ao carregar chamados:', error);
      listDiv.innerHTML = `
        <div class="ti-error">
          <p>� Erro ao carregar chamados</p>
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
              <span>${[ticket.category, ticket.subcategory, ticket.subcategory2].filter(Boolean).join(' > ')}</span>
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
        ${prefill.hasImage ? '<span class="ti-image-indicator">🖼� Imagem anexada e analisada</span>' : ''}
      </div>
    ` : '';

    let badgeText = '✨ Sugestão gerada pela Groq (título, descrição e categorias)';
    if (prefill.hasImage && suggestionSource === 'groq') {
      badgeText = '🖼️ Sugestão gerada pela Groq com análise de imagem';
    }

    const badgeHtml = suggestionSource === 'groq' ? `
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
            <label>Descrição *</label>
            <textarea id="ti-ticket-description" rows="4" required></textarea>
          </div>
          <input type="hidden" id="ti-ticket-cat-id" value="" />
          <div class="ti-form-group">
            <label>Categoria Primária</label>
            <input type="text" id="ti-ticket-cat1" placeholder="Ex: Tecnologia da Informação, Marketing" />
          </div>
          <div class="ti-form-group">
            <label>Categoria Secundária</label>
            <input type="text" id="ti-ticket-cat2" placeholder="Ex: Hardware, Impressoras, Software" />
          </div>
          <div class="ti-form-group">
            <label>Categoria Terciária</label>
            <input type="text" id="ti-ticket-cat3" placeholder="Ex: Instalação, Troca de peça" />
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
      if (prefill.title && suggestionSource === 'groq') {
        titleInput.classList.add('ti-ai-filled');
      }
    }

    const descriptionInput = document.getElementById('ti-ticket-description');
    if (descriptionInput) {
      const descriptionValue = prefill.description ?? (originalMessage || '');
      descriptionInput.value = descriptionValue;
      if (prefill.description && suggestionSource === 'groq') {
        descriptionInput.classList.add('ti-ai-filled');
      }
    }

    // Preenche categorias se foram sugeridas pela IA (até 3 níveis)
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

    const cat3Input = document.getElementById('ti-ticket-cat3');
    if (cat3Input && prefill.tertiaryCategory) {
      cat3Input.value = prefill.tertiaryCategory;
      cat3Input.classList.add('ti-ai-filled');
    }

    // Guarda o ID da categoria folha sugerida (usado no envio, se disponível)
    const catIdInput = document.getElementById('ti-ticket-cat-id');
    if (catIdInput && prefill.categoryId) {
      catIdInput.value = prefill.categoryId;
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
    const categoria1 = document.getElementById('ti-ticket-cat1')?.value?.trim();
    const categoria2 = document.getElementById('ti-ticket-cat2')?.value?.trim();
    const categoria3 = document.getElementById('ti-ticket-cat3')?.value?.trim();

    // Recalcula o ID da categoria a partir do caminho atual (caso o usuário tenha editado)
    const categoryPath = [categoria1, categoria2, categoria3].filter(Boolean).join(' | ');
    const categoryId = MILVUS_CATEGORIES[categoryPath] ||
                       document.getElementById('ti-ticket-cat-id')?.value || '';

    try {
      // Limpa telefone removendo código do país (55)
      const cleanPhone = this.cleanPhoneForAPI(this.currentPhone);
      
      
      
      
      // Cria chamado na API Milvus
      const payload = {
        cliente_id: cliente_id,
        chamado_assunto: assunto,
        chamado_descricao: descricao,
        chamado_email: '',
        chamado_telefone: cleanPhone, // Envia sem código do país
        chamado_contato: this.currentContact || 'WhatsApp',
      };

      // Campos opcionais — categorias em até 3 níveis (enviadas por nome,
      // seguindo o mesmo padrão já usado para primária/secundária)
      if (categoria1) payload.chamado_categoria_primaria = categoria1;
      if (categoria2) payload.chamado_categoria_secundaria = categoria2;
      if (categoria3) payload.chamado_categoria_terciaria = categoria3;

      if (categoryId) {
        console.log('[TI Support] Categoria selecionada:', categoryPath, '→ ID', categoryId);
      }

      

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
      <textarea placeholder="Adicionar comentário..." rows="3"></textarea>
      <div class="ti-form-actions ti-comment-actions">
        <button type="button" class="ti-btn-small ti-btn-groq" title="Refinar comentário com ajuda da IA">✨ Refinar com Groq</button>
        <button class="ti-btn-small ti-btn-primary">Enviar</button>
        <button class="ti-btn-small ti-btn-secondary">Cancelar</button>
      </div>
    `;

    card.appendChild(form);

    const textarea = form.querySelector('textarea');
    const btnGroq = form.querySelector('.ti-btn-groq');
    const btnSend = form.querySelector('.ti-btn-primary');
    const btnCancel = form.querySelector('.ti-btn-secondary');

    textarea?.addEventListener('input', () => {
      textarea.classList.remove('ti-ai-filled');
    });

    btnGroq?.addEventListener('click', async () => {
      const originalText = textarea.value.trim();

      if (!originalText) {
        this.showMessage('Digite algo antes de pedir ajuda à Groq.', 'warning');
        textarea.focus();
        return;
      }

      if (!GROQ_API_KEY) {
        this.showMessage('Configure a chave da Groq API nas configurações.', 'error');
        return;
      }

      btnGroq.disabled = true;
      const previousLabel = btnGroq.textContent;
      btnGroq.textContent = '⏳ Refinando...';

      try {
        const refined = await this.generateCommentRefinement(originalText, {
          ticketId,
          contactName: this.currentContact,
          contactPhone: this.currentPhone
        });

        if (refined) {
          textarea.value = refined;
          textarea.classList.add('ti-ai-filled');
          this.showMessage('Comentário refinado pela Groq. Revise antes de enviar.', 'success');
        } else {
          this.showMessage('A Groq não conseguiu melhorar este comentário.', 'warning');
        }
      } catch (error) {
        console.error('Erro ao refinar comentário com Groq:', error);
        this.showMessage('Não foi possível refinar o comentário agora.', 'error');
      } finally {
        btnGroq.disabled = false;
        btnGroq.textContent = previousLabel;
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
        console.warn('✉� Campo de mensagem do WhatsApp não encontrado para envio automático.');
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
