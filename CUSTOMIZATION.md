# ⚙️ Guia de Personalização

Este guia mostra como personalizar a extensão para suas necessidades específicas.

## 🎨 Personalização Visual

### 1. Alterar Cores

Edite o arquivo `styles.css`:

```css
/* Cor principal (substitua #00a884 pela cor desejada) */
.ti-panel-header {
  background-color: #00a884; /* Verde WhatsApp */
}

.ti-btn-primary {
  background-color: #00a884;
}

/* Exemplo: Usar azul corporativo */
.ti-panel-header {
  background-color: #1e40af; /* Azul */
}
```

### 2. Alterar Tamanho do Painel

```css
.ti-support-panel {
  width: 400px; /* Altere para 300px, 500px, etc */
}
```

### 3. Mudar Posição do Botão

No arquivo `content.js`, localize a função `addToolbarButton()` e altere:

```javascript
// Para adicionar no final
headerButtons.appendChild(button);

// Para adicionar no início (padrão)
headerButtons.insertBefore(button, headerButtons.firstChild);
```

### 4. Customizar Ícones

Substitua os arquivos na pasta `icons/` por seus próprios ícones PNG (16x16, 48x48, 128x128 pixels).

### 5. Alterar Fonte

```css
.ti-support-panel {
  font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
}
```

## 🔧 Personalização Funcional

### 1. Adicionar Novos Campos ao Formulário

No arquivo `content.js`, localize `showNewTicketForm()` e adicione:

```javascript
<div class="ti-form-group">
  <label>Categoria</label>
  <select id="ti-ticket-category">
    <option value="hardware">Hardware</option>
    <option value="software">Software</option>
    <option value="network">Rede</option>
  </select>
</div>
```

Depois, em `createTicket()`, capture o valor:

```javascript
const category = document.getElementById('ti-ticket-category')?.value;

// Adicione ao body da requisição
body: JSON.stringify({
  title,
  description,
  priority,
  category, // Novo campo
  contactName: this.currentContact,
  contactPhone: this.currentPhone,
  status: 'open'
})
```

### 2. Adicionar Filtros

Adicione botões de filtro no painel:

```javascript
<div class="ti-filters">
  <button class="ti-filter-btn active" data-filter="all">Todos</button>
  <button class="ti-filter-btn" data-filter="open">Abertos</button>
  <button class="ti-filter-btn" data-filter="closed">Fechados</button>
</div>
```

E implemente a lógica de filtro:

```javascript
setupFilters() {
  document.querySelectorAll('.ti-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const filter = e.target.dataset.filter;
      this.filterTickets(filter);
    });
  });
}

filterTickets(filter) {
  const filtered = filter === 'all' 
    ? this.tickets 
    : this.tickets.filter(t => t.status === filter);
  this.renderTickets(filtered);
}
```

### 3. Adicionar Ordenação

```javascript
sortTickets(tickets, sortBy = 'createdAt', order = 'desc') {
  return tickets.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
}
```

### 4. Adicionar Notificações Desktop

```javascript
async showDesktopNotification(title, message) {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      icon: chrome.runtime.getURL('icons/icon48.png')
    });
  } else if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification(title, { body: message });
    }
  }
}

// Usar quando criar um chamado
this.showDesktopNotification(
  'Chamado Criado', 
  `Chamado #${newTicket.id} foi criado com sucesso`
);
```

### 5. Adicionar Busca Local

```javascript
<input 
  type="text" 
  id="ti-search" 
  placeholder="Buscar chamados..."
  class="ti-search-input"
/>
```

```javascript
setupSearch() {
  const searchInput = document.getElementById('ti-search');
  searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = this.tickets.filter(ticket => 
      ticket.title.toLowerCase().includes(query) ||
      ticket.description.toLowerCase().includes(query) ||
      ticket.id.includes(query)
    );
    this.renderTickets(filtered);
  });
}
```

### 6. Adicionar Anexos

Modifique o formulário para aceitar arquivos:

```javascript
<div class="ti-form-group">
  <label>Anexos</label>
  <input type="file" id="ti-ticket-attachments" multiple />
</div>
```

E processe os arquivos:

```javascript
async createTicket() {
  const files = document.getElementById('ti-ticket-attachments')?.files;
  
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  
  for (let i = 0; i < files.length; i++) {
    formData.append('attachments', files[i]);
  }

  const response = await fetch(`${API_BASE_URL}/tickets`, {
    method: 'POST',
    body: formData // Não use JSON quando enviar arquivos
  });
}
```

## 🌐 Personalização de API

### 1. Alterar Endpoint Base

No popup ou diretamente no `content.js`:

```javascript
let API_BASE_URL = 'https://sua-api.com/v1/support';
```

### 2. Adicionar Headers Personalizados

```javascript
async loadTickets() {
  const response = await fetch(`${API_BASE_URL}/tickets`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`,
      'X-Custom-Header': 'valor'
    }
  });
}
```

### 3. Usar GraphQL

```javascript
async loadTickets() {
  const query = `
    query GetTickets($phone: String!) {
      tickets(phone: $phone) {
        id
        title
        status
        priority
        createdAt
      }
    }
  `;

  const response = await fetch(`${API_BASE_URL}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { phone: this.currentPhone }
    })
  });

  const { data } = await response.json();
  this.tickets = data.tickets;
  this.renderTickets(this.tickets);
}
```

### 4. Adicionar Retry Logic

```javascript
async fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## 📱 Personalização de Comportamento

### 1. Auto-refresh

Atualize automaticamente os chamados a cada X segundos:

```javascript
startAutoRefresh(intervalSeconds = 30) {
  this.autoRefreshInterval = setInterval(() => {
    if (this.panelVisible && this.currentPhone) {
      this.loadTickets();
    }
  }, intervalSeconds * 1000);
}

stopAutoRefresh() {
  if (this.autoRefreshInterval) {
    clearInterval(this.autoRefreshInterval);
  }
}
```

### 2. Salvar Rascunhos

```javascript
saveDraft() {
  const draft = {
    title: document.getElementById('ti-ticket-title')?.value,
    description: document.getElementById('ti-ticket-description')?.value,
    priority: document.getElementById('ti-ticket-priority')?.value,
    timestamp: Date.now()
  };
  
  chrome.storage.local.set({ 
    [`draft_${this.currentPhone}`]: draft 
  });
}

loadDraft() {
  chrome.storage.local.get([`draft_${this.currentPhone}`], (result) => {
    const draft = result[`draft_${this.currentPhone}`];
    if (draft && Date.now() - draft.timestamp < 3600000) { // 1 hora
      document.getElementById('ti-ticket-title').value = draft.title;
      document.getElementById('ti-ticket-description').value = draft.description;
      document.getElementById('ti-ticket-priority').value = draft.priority;
    }
  });
}
```

### 3. Atalhos de Teclado

```javascript
setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+N - Novo chamado
    if (e.ctrlKey && e.key === 'n' && this.panelVisible) {
      e.preventDefault();
      this.showNewTicketForm();
    }
    
    // Ctrl+R - Atualizar
    if (e.ctrlKey && e.key === 'r' && this.panelVisible) {
      e.preventDefault();
      this.loadTickets();
    }
    
    // ESC - Fechar painel
    if (e.key === 'Escape' && this.panelVisible) {
      this.togglePanel(false);
    }
  });
}
```

### 4. Integração com Chat

Envie mensagens automáticas no WhatsApp quando criar um chamado:

```javascript
async sendWhatsAppMessage(message) {
  const inputBox = document.querySelector('[contenteditable="true"]');
  if (inputBox) {
    inputBox.focus();
    document.execCommand('insertText', false, message);
    
    // Envia a mensagem
    const sendButton = document.querySelector('[data-testid="send"]');
    sendButton?.click();
  }
}

async createTicket() {
  // ... criar chamado na API
  
  // Enviar mensagem no chat
  const message = `✅ Chamado #${newTicket.id} criado!\n\nTítulo: ${newTicket.title}\nPrioridade: ${newTicket.priority}`;
  await this.sendWhatsAppMessage(message);
}
```

## 🔐 Personalização de Segurança

### 1. Adicionar Autenticação

```javascript
class WhatsAppSupportExtension {
  constructor() {
    this.authToken = null;
    this.init();
  }

  async authenticate() {
    const credentials = await this.getStoredCredentials();
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const { token } = await response.json();
    this.authToken = token;
    
    // Salva token
    chrome.storage.local.set({ authToken: token });
  }

  async getStoredCredentials() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['username', 'password'], resolve);
    });
  }
}
```

### 2. Validar Dados Antes de Enviar

```javascript
validateTicketData(data) {
  const errors = [];

  if (!data.title || data.title.trim().length < 5) {
    errors.push('Título deve ter no mínimo 5 caracteres');
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push('Descrição deve ter no mínimo 10 caracteres');
  }

  if (!['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
    errors.push('Prioridade inválida');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

async createTicket() {
  const ticketData = {
    title: document.getElementById('ti-ticket-title')?.value,
    description: document.getElementById('ti-ticket-description')?.value,
    priority: document.getElementById('ti-ticket-priority')?.value
  };

  const validation = this.validateTicketData(ticketData);
  
  if (!validation.isValid) {
    this.showMessage(validation.errors.join('\n'), 'error');
    return;
  }

  // Continua com criação...
}
```

## 📊 Personalização de Analytics

### 1. Rastrear Eventos

```javascript
trackEvent(category, action, label) {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      'event_category': category,
      'event_label': label
    });
  }

  // Ou enviar para sua própria API
  fetch(`${API_BASE_URL}/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, action, label })
  });
}

// Usar em ações
async createTicket() {
  // ... criar chamado
  this.trackEvent('Tickets', 'Create', `Priority: ${priority}`);
}
```

## 🎯 Dicas Avançadas

### 1. Modo Offline

```javascript
async loadTickets() {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets?phone=${this.currentPhone}`);
    const tickets = await response.json();
    
    // Salva no cache
    chrome.storage.local.set({ 
      [`cache_${this.currentPhone}`]: {
        tickets,
        timestamp: Date.now()
      }
    });
    
    this.renderTickets(tickets);
  } catch (error) {
    // Se falhar, carrega do cache
    const cached = await this.getFromCache();
    if (cached) {
      this.showMessage('Modo offline - dados podem estar desatualizados', 'info');
      this.renderTickets(cached.tickets);
    }
  }
}
```

### 2. Sincronização em Background

No `manifest.json`, adicione:

```json
{
  "background": {
    "service_worker": "background.js"
  }
}
```

Crie `background.js`:

```javascript
// Sincroniza a cada 5 minutos
chrome.alarms.create('syncTickets', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncTickets') {
    // Sincronizar tickets
    syncTickets();
  }
});
```

---

Para mais ideias, veja os arquivos de código-fonte ou abra uma issue no GitHub!
