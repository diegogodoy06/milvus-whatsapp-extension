# 🧪 Testes e Exemplos da API

Este arquivo contém exemplos de requisições para testar a API de chamados.

## 🚀 Iniciando o servidor de exemplo

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start

# Ou com auto-reload (desenvolvimento)
npm run dev
```

O servidor estará disponível em: `http://localhost:3000`

## 📡 Endpoints e Exemplos

### 1. Health Check

Verifica se a API está funcionando:

```bash
# GET /api/health
curl http://localhost:3000/api/health
```

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T10:00:00.000Z",
  "ticketsCount": 2
}
```

---

### 2. Listar Chamados

#### Por número de telefone:

```bash
# GET /api/tickets?phone=5511999999999
curl "http://localhost:3000/api/tickets?phone=5511999999999"
```

#### Por nome do contato:

```bash
# GET /api/tickets?contact=João
curl "http://localhost:3000/api/tickets?contact=Jo%C3%A3o"
```

**Resposta:**
```json
[
  {
    "id": "1",
    "title": "Computador não liga",
    "description": "O computador do escritório não está ligando",
    "status": "open",
    "priority": "high",
    "contactName": "João Silva",
    "contactPhone": "5511999999999",
    "createdAt": "2025-10-19T10:00:00Z",
    "comments": [
      {
        "id": "1",
        "author": "Suporte TI",
        "text": "Vou verificar o equipamento hoje às 14h",
        "createdAt": "2025-10-19T10:30:00Z"
      }
    ]
  }
]
```

---

### 3. Buscar Chamado Específico

```bash
# GET /api/tickets/:id
curl http://localhost:3000/api/tickets/1
```

**Resposta:**
```json
{
  "id": "1",
  "title": "Computador não liga",
  "description": "O computador do escritório não está ligando",
  "status": "open",
  "priority": "high",
  "contactName": "João Silva",
  "contactPhone": "5511999999999",
  "createdAt": "2025-10-19T10:00:00Z",
  "comments": [...]
}
```

---

### 4. Criar Novo Chamado

```bash
# POST /api/tickets
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Impressora não funciona",
    "description": "A impressora do 2º andar não está imprimindo",
    "priority": "medium",
    "contactName": "Maria Santos",
    "contactPhone": "5511988888888",
    "status": "open"
  }'
```

**Resposta:**
```json
{
  "id": "3",
  "title": "Impressora não funciona",
  "description": "A impressora do 2º andar não está imprimindo",
  "status": "open",
  "priority": "medium",
  "contactName": "Maria Santos",
  "contactPhone": "5511988888888",
  "createdAt": "2025-10-20T10:00:00.000Z",
  "comments": []
}
```

---

### 5. Atualizar Chamado (Finalizar)

```bash
# PATCH /api/tickets/:id
curl -X PATCH http://localhost:3000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "closed"
  }'
```

**Resposta:**
```json
{
  "id": "1",
  "title": "Computador não liga",
  "status": "closed",
  ...
}
```

#### Outros status possíveis:
- `open` - Aberto
- `in_progress` - Em andamento
- `pending` - Pendente
- `closed` - Fechado

---

### 6. Adicionar Comentário

```bash
# POST /api/tickets/:id/comments
curl -X POST http://localhost:3000/api/tickets/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "author": "Técnico João",
    "text": "Problema resolvido! Era um cabo desconectado."
  }'
```

**Resposta:**
```json
{
  "id": "2",
  "author": "Técnico João",
  "text": "Problema resolvido! Era um cabo desconectado.",
  "createdAt": "2025-10-20T15:00:00.000Z"
}
```

---

## 🧪 Testando com PowerShell

Se você preferir usar PowerShell no Windows:

### Listar chamados:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/tickets?phone=5511999999999" -Method Get
```

### Criar chamado:
```powershell
$body = @{
    title = "Problema no sistema"
    description = "Sistema está lento"
    priority = "high"
    contactName = "João Silva"
    contactPhone = "5511999999999"
    status = "open"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/tickets" -Method Post -Body $body -ContentType "application/json"
```

### Adicionar comentário:
```powershell
$comment = @{
    author = "Suporte TI"
    text = "Verificando o problema"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/tickets/1/comments" -Method Post -Body $comment -ContentType "application/json"
```

### Finalizar chamado:
```powershell
$update = @{
    status = "closed"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/tickets/1" -Method Patch -Body $update -ContentType "application/json"
```

---

## 🔍 Testando com a extensão

1. **Inicie o servidor:**
   ```bash
   npm start
   ```

2. **Configure a extensão:**
   - Abra a extensão
   - Configure: `http://localhost:3000/api`
   - Salve

3. **Teste no WhatsApp Web:**
   - Acesse https://web.whatsapp.com
   - Abra uma conversa
   - Clique no botão de suporte
   - Crie um chamado de teste
   - Adicione comentários
   - Finalize o chamado

---

## 🐛 Debug e Logs

O servidor de exemplo mostra logs de todas as requisições:

```
GET /api/tickets { phone: '5511999999999' }
POST /api/tickets { title: 'Novo chamado', ... }
PATCH /api/tickets/1 { status: 'closed' }
```

Para mais detalhes, abra o console do navegador (F12) na página do WhatsApp Web.

---

## 📊 Estrutura de Dados

### Ticket (Chamado)
```typescript
interface Ticket {
  id: string;                    // ID único
  title: string;                 // Título do chamado
  description: string;           // Descrição detalhada
  status: 'open' | 'in_progress' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  contactName: string;           // Nome do contato
  contactPhone: string;          // Telefone (com código do país)
  createdAt: string;            // ISO 8601 timestamp
  comments: Comment[];          // Array de comentários
}
```

### Comment (Comentário)
```typescript
interface Comment {
  id: string;          // ID único
  author: string;      // Nome do autor
  text: string;        // Texto do comentário
  createdAt: string;   // ISO 8601 timestamp
}
```

---

## 🔐 Segurança (Próximos Passos)

Para produção, considere adicionar:

1. **Autenticação:**
   ```javascript
   app.use((req, res, next) => {
     const token = req.headers.authorization;
     // Validar token
     next();
   });
   ```

2. **Rate Limiting:**
   ```javascript
   const rateLimit = require('express-rate-limit');
   app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
   ```

3. **Validação de Dados:**
   ```javascript
   const { body, validationResult } = require('express-validator');
   app.post('/api/tickets', [
     body('title').notEmpty(),
     body('description').notEmpty()
   ], (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }
     // ...
   });
   ```

4. **HTTPS:**
   ```javascript
   const https = require('https');
   const fs = require('fs');
   
   https.createServer({
     key: fs.readFileSync('key.pem'),
     cert: fs.readFileSync('cert.pem')
   }, app).listen(443);
   ```

---

## 🗄️ Integrando com Banco de Dados

### Exemplo com MongoDB:

```javascript
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
  priority: String,
  contactName: String,
  contactPhone: String,
  comments: [{
    author: String,
    text: String,
    createdAt: Date
  }]
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', ticketSchema);

// Usar nos endpoints
app.get('/api/tickets', async (req, res) => {
  const tickets = await Ticket.find({ contactPhone: req.query.phone });
  res.json(tickets);
});
```

### Exemplo com PostgreSQL (Sequelize):

```javascript
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password');

const Ticket = sequelize.define('Ticket', {
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  status: DataTypes.STRING,
  priority: DataTypes.STRING,
  contactName: DataTypes.STRING,
  contactPhone: DataTypes.STRING
});

// Usar nos endpoints
app.get('/api/tickets', async (req, res) => {
  const tickets = await Ticket.findAll({
    where: { contactPhone: req.query.phone }
  });
  res.json(tickets);
});
```

---

## 📞 Testando com Postman

Importe esta coleção no Postman:

```json
{
  "info": {
    "name": "WhatsApp Support API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/health"
      }
    },
    {
      "name": "List Tickets",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/tickets?phone=5511999999999"
      }
    },
    {
      "name": "Create Ticket",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/tickets",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"title\":\"Test\",\"description\":\"Test\",\"priority\":\"medium\",\"contactName\":\"Test\",\"contactPhone\":\"123\",\"status\":\"open\"}"
        }
      }
    }
  ]
}
```

---

Para mais informações, consulte o README.md principal.
