# Instruções Rápidas de Instalação

## ⚡ Instalação Rápida

### 1. Criar os ícones PNG

A extensão precisa de ícones em formato PNG. Você tem 3 opções:

#### Opção A - Converter Online (Mais Fácil)
1. Acesse: https://cloudconvert.com/svg-to-png
2. Faça upload dos arquivos `icon16.svg`, `icon48.svg` e `icon128.svg` da pasta `icons/`
3. Baixe os PNGs gerados
4. Salve-os na pasta `icons/` com os mesmos nomes (substituindo .svg por .png)

#### Opção B - Criar Manualmente
Você pode criar 3 imagens PNG simples com as dimensões:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

Use qualquer editor de imagens (Paint, Photoshop, GIMP, etc.) e crie quadrados verdes (#00A884) com um ícone de suporte/ticket no centro.

#### Opção C - Usar ImageMagick (Linha de Comando)
```powershell
cd icons
magick icon16.svg -resize 16x16 icon16.png
magick icon48.svg -resize 48x48 icon48.png
magick icon128.svg -resize 128x128 icon128.png
```

### 2. Instalar no Chrome

1. Abra o Chrome
2. Digite na barra de endereços: `chrome://extensions/`
3. Ative o **Modo do desenvolvedor** (toggle no canto superior direito)
4. Clique em **Carregar sem compactação**
5. Selecione a pasta do projeto: `milvus-whatsapp-extension`
6. Pronto! A extensão está instalada

### 3. Configurar

1. Clique no ícone da extensão na barra do Chrome
2. Digite a URL da sua API (ex: `http://localhost:3000/api`)
3. Clique em **Salvar Configurações**

### 4. Usar

1. Acesse https://web.whatsapp.com
2. Abra uma conversa
3. Clique no ícone de suporte no cabeçalho
4. Gerencie seus chamados!

## 🚀 Testar com API de Exemplo

Se você ainda não tem uma API, use este código Node.js para teste:

### Instalar dependências:
```powershell
npm init -y
npm install express cors
```

### Criar arquivo `server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let tickets = [];

app.get('/api/tickets', (req, res) => {
  res.json(tickets.filter(t => t.status !== 'closed'));
});

app.get('/api/tickets/:id', (req, res) => {
  res.json(tickets.find(t => t.id === req.params.id) || {});
});

app.post('/api/tickets', (req, res) => {
  const ticket = { id: String(Date.now()), ...req.body, createdAt: new Date(), comments: [] };
  tickets.push(ticket);
  res.json(ticket);
});

app.patch('/api/tickets/:id', (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.id);
  if (ticket) Object.assign(ticket, req.body);
  res.json(ticket);
});

app.post('/api/tickets/:id/comments', (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.id);
  if (ticket) {
    const comment = { id: String(Date.now()), ...req.body, createdAt: new Date() };
    ticket.comments.push(comment);
    res.json(comment);
  }
  res.status(404).send();
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(3000, () => console.log('API rodando em http://localhost:3000'));
```

### Executar:
```powershell
node server.js
```

Agora configure a extensão para usar `http://localhost:3000/api` e teste!

## 🎯 Checklist de Instalação

- [ ] Ícones PNG criados na pasta `icons/`
- [ ] Extensão carregada no Chrome
- [ ] API configurada no popup
- [ ] WhatsApp Web aberto
- [ ] Testado em uma conversa

## ❓ Problemas Comuns

**"Erro ao carregar extensão"**
→ Certifique-se que os ícones PNG existem na pasta `icons/`

**"Painel não aparece"**
→ Recarregue a página do WhatsApp Web (F5)

**"Erro ao carregar chamados"**
→ Verifique se a API está rodando e configurada corretamente

**"CORS error"**
→ Sua API precisa ter CORS habilitado (use `app.use(cors())` no Express)
