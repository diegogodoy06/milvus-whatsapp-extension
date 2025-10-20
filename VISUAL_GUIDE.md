# 🎨 Screenshots e Preview

## 📸 Como a extensão funciona

### 1. Botão na barra do WhatsApp
Quando você abre uma conversa, um novo botão aparece no cabeçalho:

```
┌────────────────────────────────────────┐
│ [←] João Silva              [🎫] [🔍] │ ← Novo botão de suporte
└────────────────────────────────────────┘
```

### 2. Painel lateral integrado
Ao clicar no botão, um painel lateral aparece ao lado da conversa:

```
┌─────────────────────┬──────────────────────┐
│                     │  Chamados de Suporte │
│   Chat WhatsApp     │  ─────────────────── │
│                     │  📋 João Silva       │
│   [Mensagens...]    │     Tel: 5511999..   │
│                     │                      │
│   [Nova msg...]     │  [➕ Novo] [🔄 Att]  │
│                     │                      │
│                     │  ╔═══════════════╗   │
│                     │  ║ #1 🟢 Aberto  ║   │
│                     │  ║ Computador... ║   │
│                     │  ║ 20/10 10:00   ║   │
│                     │  ║ [Ver][✉][✓]  ║   │
│                     │  ╚═══════════════╝   │
│                     │                      │
└─────────────────────┴──────────────────────┘
```

### 3. Criar novo chamado
Formulário completo para criar chamados:

```
╔══════════════════════════════════╗
║ Novo Chamado                     ║
║ ──────────────────────────────── ║
║                                  ║
║ Título: ___________________      ║
║                                  ║
║ Descrição:                       ║
║ ┌──────────────────────────┐    ║
║ │                          │    ║
║ │                          │    ║
║ └──────────────────────────┘    ║
║                                  ║
║ Prioridade: [▼ Média]            ║
║                                  ║
║ [Criar Chamado] [Cancelar]       ║
╚══════════════════════════════════╝
```

### 4. Detalhes do chamado
Visualização completa com comentários:

```
╔══════════════════════════════════╗
║ [←] Chamado #1                   ║
║ ──────────────────────────────── ║
║ Status: 🟢 Aberto                ║
║ Título: Computador não liga      ║
║ Descrição: O computador...       ║
║ Prioridade: 🔴 Alta              ║
║ Criado em: 20/10/2025 10:00     ║
║                                  ║
║ 💬 Comentários (1)               ║
║ ┌────────────────────────────┐  ║
║ │ Suporte TI - 10:30         │  ║
║ │ Vou verificar hoje às 14h  │  ║
║ └────────────────────────────┘  ║
╚══════════════════════════════════╝
```

## 🎯 Fluxo de Uso

```
┌─────────────┐
│   Usuário   │
│  abre chat  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Clica no botão  │
│   de suporte    │
└──────┬──────────┘
       │
       ▼
┌──────────────────┐
│  Painel abre     │
│  com chamados    │
│  do contato      │
└──────┬───────────┘
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌──────────────┐    ┌──────────────┐
│ Ver detalhes │    │ Criar novo   │
│  e comentar  │    │   chamado    │
└──────┬───────┘    └──────┬───────┘
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────┐
│  Finalizar   │    │ Acompanhar   │
│   chamado    │    │   progresso  │
└──────────────┘    └──────────────┘
```

## 🌈 Cores e Design

A extensão usa as cores do WhatsApp para integração perfeita:

- **Verde principal**: `#00a884` - Botões e headers
- **Verde hover**: `#008f6f` - Estados interativos
- **Cinza claro**: `#f0f2f5` - Background
- **Cinza médio**: `#e9edef` - Bordas e divisores
- **Texto escuro**: `#111b21` - Texto principal
- **Texto secundário**: `#667781` - Metadados

### Status dos chamados:
- 🟢 **Aberto** (open) - Azul: `#dbeafe`
- 🟡 **Em andamento** (in_progress) - Amarelo: `#fef3c7`
- 🟠 **Pendente** (pending) - Laranja: `#fed7aa`
- ⚫ **Fechado** (closed) - Cinza: `#d1d7db`

### Prioridades:
- ⚪ **Baixa** (low) - Cinza
- 🔵 **Média** (medium) - Azul
- 🟠 **Alta** (high) - Laranja
- 🔴 **Urgente** (urgent) - Vermelho

## 📱 Responsividade

A extensão se adapta a diferentes tamanhos de tela:

- **Desktop (>1200px)**: Painel de 400px ao lado do chat
- **Laptop (900-1200px)**: Painel de 350px
- **Tablet (<900px)**: Painel overlay em tela cheia

## 🔄 Estados da Interface

### Loading (Carregando)
```
┌──────────────────────┐
│                      │
│   ⏳ Carregando...   │
│                      │
└──────────────────────┘
```

### Empty (Vazio)
```
┌──────────────────────┐
│                      │
│  📭 Nenhum chamado   │
│     em aberto        │
│                      │
└──────────────────────┘
```

### Error (Erro)
```
┌──────────────────────┐
│  ⚠️ Erro ao carregar │
│     chamados         │
│  Verifique a API     │
└──────────────────────┘
```

### Success (Sucesso)
```
┌──────────────────────┐
│  ✓ Ação realizada    │
│    com sucesso!      │
└──────────────────────┘
```

## 🎬 Animações

- **Slide in**: Painel desliza da direita (300ms)
- **Fade in**: Toasts aparecem suavemente (100ms)
- **Hover**: Botões mudam de cor (200ms)
- **Scroll**: Scroll suave com scrollbar customizada

## 🖱️ Interações

### Botões principais:
- **Novo Chamado** - Abre formulário
- **Atualizar** - Recarrega lista
- **Ver Detalhes** - Mostra informações completas
- **Comentar** - Adiciona comentário inline
- **Finalizar** - Confirma e fecha chamado

### Atalhos do teclado:
- `ESC` - Fecha painel/formulário
- `Ctrl+N` - Novo chamado (quando painel aberto)
- `Ctrl+R` - Atualizar lista

---

*Para mais informações, consulte o README.md principal*
