// API de exemplo - server-example.js
// Execute com: node server-example.js

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Banco de dados em memória (para exemplo)
let tickets = [
  {
    id: '1',
    title: 'Computador não liga',
    description: 'O computador do escritório não está ligando. Já tentei verificar as conexões.',
    status: 'open',
    priority: 'high',
    contactName: 'João Silva',
    contactPhone: '5511999999999',
    createdAt: '2025-10-19T10:00:00Z',
    comments: [
      {
        id: '1',
        author: 'Suporte TI',
        text: 'Vou verificar o equipamento hoje às 14h',
        createdAt: '2025-10-19T10:30:00Z'
      }
    ]
  },
  {
    id: '2',
    title: 'Problema com email',
    description: 'Não consigo enviar emails desde ontem',
    status: 'in_progress',
    priority: 'medium',
    contactName: 'Maria Santos',
    contactPhone: '5511988888888',
    createdAt: '2025-10-18T15:00:00Z',
    comments: []
  }
];

let nextId = 3;

// Listar chamados por telefone ou nome
app.get('/api/tickets', (req, res) => {
  console.log('GET /api/tickets', req.query);
  
  const { phone, contact } = req.query;
  
  let filtered = tickets;
  
  if (phone) {
    filtered = tickets.filter(t => t.contactPhone === phone);
  } else if (contact) {
    filtered = tickets.filter(t => 
      t.contactName.toLowerCase().includes(contact.toLowerCase())
    );
  }
  
  // Retorna apenas chamados não fechados por padrão
  filtered = filtered.filter(t => t.status !== 'closed');
  
  res.json(filtered);
});

// Buscar chamado específico
app.get('/api/tickets/:id', (req, res) => {
  console.log('GET /api/tickets/:id', req.params.id);
  
  const ticket = tickets.find(t => t.id === req.params.id);
  
  if (ticket) {
    res.json(ticket);
  } else {
    res.status(404).json({ error: 'Chamado não encontrado' });
  }
});

// Criar novo chamado
app.post('/api/tickets', (req, res) => {
  console.log('POST /api/tickets', req.body);
  
  const newTicket = {
    id: String(nextId++),
    title: req.body.title,
    description: req.body.description,
    status: req.body.status || 'open',
    priority: req.body.priority || 'medium',
    contactName: req.body.contactName,
    contactPhone: req.body.contactPhone,
    createdAt: new Date().toISOString(),
    comments: []
  };
  
  tickets.push(newTicket);
  res.status(201).json(newTicket);
});

// Atualizar chamado (para finalizar, por exemplo)
app.patch('/api/tickets/:id', (req, res) => {
  console.log('PATCH /api/tickets/:id', req.params.id, req.body);
  
  const ticket = tickets.find(t => t.id === req.params.id);
  
  if (ticket) {
    // Atualiza os campos fornecidos
    Object.assign(ticket, req.body);
    res.json(ticket);
  } else {
    res.status(404).json({ error: 'Chamado não encontrado' });
  }
});

// Adicionar comentário a um chamado
app.post('/api/tickets/:id/comments', (req, res) => {
  console.log('POST /api/tickets/:id/comments', req.params.id, req.body);
  
  const ticket = tickets.find(t => t.id === req.params.id);
  
  if (ticket) {
    const comment = {
      id: String(ticket.comments.length + 1),
      author: req.body.author || 'Sistema',
      text: req.body.text,
      createdAt: new Date().toISOString()
    };
    
    ticket.comments.push(comment);
    res.status(201).json(comment);
  } else {
    res.status(404).json({ error: 'Chamado não encontrado' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    ticketsCount: tickets.length
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 API de Chamados rodando!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`📋 Tickets: http://localhost:${PORT}/api/tickets`);
  console.log(`\n✨ Configure a extensão para usar: http://localhost:${PORT}/api\n`);
});
