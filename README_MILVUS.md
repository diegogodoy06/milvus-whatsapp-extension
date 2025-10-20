# 📖 README - Versão Milvus

## 🎉 Extensão Atualizada para API Milvus!

A extensão foi **totalmente adaptada** para funcionar com a **API de Integração do Milvus**.

## ✅ O que mudou?

### 1. **Autenticação com Token**
- Agora é necessário um **token de autenticação** do Milvus
- Gere seu token no [Portal Gestor do Milvus](https://portal.milvus.com.br)

### 2. **Integração com API Milvus**
Todos os endpoints foram adaptados:

| Funcionalidade | Endpoint Milvus | Método |
|----------------|-----------------|--------|
| Listar chamados | `/chamado/listagem` | POST |
| Ver detalhes | `/chamado/acompanhamento/{codigo}` | GET |
| Criar chamado | `/chamado/criar` | POST |
| Adicionar comentário | `/chamado/acompanhamento/criar` | POST |
| Finalizar chamado | `/chamado/finalizar` | PUT |

### 3. **Campos Específicos do Milvus**
O formulário de criação de chamados agora inclui:
- ✅ Cliente ID (token ou ID numérico)
- ✅ Assunto do chamado
- ✅ Descrição
- ✅ Técnico responsável (email)
- ✅ Mesa de trabalho
- ✅ Setor
- ✅ Categoria primária e secundária

### 4. **Mapeamento de Status**
A extensão mapeia automaticamente os status do Milvus:

| Milvus | Extensão |
|--------|----------|
| AgAtendimento / A fazer | Aberto |
| Atendendo | Em Andamento |
| Pausado | Pausado |
| Finalizado | Fechado |
| Conferência | Conferência |
| Agendado | Agendado |

### 5. **Suporte a Prioridades**
- Baixa, Média, Alta, Urgente, Crítico

## 🚀 Como Instalar

### Passo 1: Converter Ícones (Obrigatório)

A extensão precisa de ícones PNG. Escolha uma opção:

**Opção A - Online (Mais Fácil):**
1. Acesse https://cloudconvert.com/svg-to-png
2. Converta `icons/icon16.svg`, `icons/icon48.svg`, `icons/icon128.svg`
3. Salve os PNGs na pasta `icons/`

**Opção B - ImageMagick:**
```bash
cd icons
magick icon16.svg -resize 16x16 icon16.png
magick icon48.svg -resize 48x48 icon48.png
magick icon128.svg -resize 128x128 icon128.png
```

### Passo 2: Carregar no Chrome

1. Abra `chrome://extensions/`
2. Ative **Modo do desenvolvedor**
3. Clique em **Carregar sem compactação**
4. Selecione a pasta do projeto

### Passo 3: Configurar

1. Clique no ícone da extensão
2. Preencha:
   - **URL da API**: `https://apiintegracao.milvus.com.br/api`
   - **Token**: Seu token do Milvus
3. Clique em **Salvar Configurações**

## 📋 Como Usar

### 1. Abrir Painel de Chamados

1. Acesse [WhatsApp Web](https://web.whatsapp.com)
2. Abra uma conversa com um cliente
3. Clique no ícone de suporte (🎫) no cabeçalho
4. O painel lateral abrirá mostrando os chamados

### 2. Listar Chamados

- Os chamados **em aberto** do contato aparecem automaticamente
- Mostra: código, assunto, status, prioridade, data

### 3. Criar Novo Chamado

1. Clique em **Novo Chamado**
2. Preencha os campos:
   - **Cliente ID**: Token do cliente no Milvus (ex: `ABC123`)
   - **Assunto**: Título do chamado
   - **Descrição**: Detalhamento do problema
   - **Técnico** (opcional): Email do técnico
   - **Mesa** (opcional): Mesa de trabalho
   - **Setor** (opcional): Setor responsável
   - **Categorias** (opcional): Primária e secundária
3. Clique em **Criar Chamado**

### 4. Ver Detalhes

- Clique em **Ver Detalhes** em qualquer chamado
- Visualize:
  - Informações completas
  - Status e prioridade
  - Técnico responsável
  - Categorias e mesa
  - Acompanhamentos anteriores

### 5. Adicionar Acompanhamento

1. Clique em **Comentar** no chamado
2. Digite o acompanhamento
3. Clique em **Enviar**
4. O acompanhamento é salvo no Milvus

### 6. Finalizar Chamado

1. Clique em **Finalizar** no chamado
2. Confirme a ação
3. O chamado é finalizado no Milvus

## 🔑 Onde Obter o Cliente ID?

### Método 1: Token do Cliente

1. Acesse o [Portal Milvus](https://portal.milvus.com.br)
2. Vá em **Clientes**
3. Encontre o cliente
4. Copie o **Token** (ex: `ABC123`, `K1OSGA`)

### Método 2: ID Numérico

1. No portal, abra o cadastro do cliente
2. Copie o **ID** numérico (ex: `30753`)

💡 **Dica**: Mantenha uma planilha com os tokens dos seus principais clientes para consulta rápida!

## 📁 Arquivos do Projeto

```
milvus-whatsapp-extension/
├── manifest.json              # Configuração da extensão
├── content.js                 # Script principal (ADAPTADO PARA MILVUS)
├── styles.css                 # Estilos do painel
├── popup.html                 # Interface de configurações (COM TOKEN)
├── popup.js                   # Lógica das configurações (COM TOKEN)
├── icons/                     # Ícones da extensão
│   ├── icon16.png/.svg
│   ├── icon48.png/.svg
│   └── icon128.png/.svg
├── README.md                  # Documentação geral
├── MILVUS_CONFIG.md          # 🆕 Guia de configuração Milvus
├── INSTALL.md                 # Guia de instalação
├── CHECKLIST.md               # Checklist de testes
├── API_EXAMPLES.md            # Exemplos de API
└── documentação milvus.md     # Documentação completa da API
```

## 🆕 Novos Arquivos

- **MILVUS_CONFIG.md**: Guia completo de configuração da API Milvus
- **documentação milvus.md**: Documentação oficial da API Milvus

## 🧪 Testando

### Teste de Conexão via PowerShell:

```powershell
$headers = @{
    "Authorization" = "Bearer SEU_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    filtro_body = @{
        status = 9  # Chamados abertos
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://apiintegracao.milvus.com.br/api/chamado/listagem?total_registros=5" -Method Post -Headers $headers -Body $body
```

## ⚠️ Importante

### Requisitos:

1. ✅ Token válido do Milvus
2. ✅ Permissões de API habilitadas
3. ✅ Cliente cadastrado no Milvus
4. ✅ WhatsApp Web aberto e logado

### Limitações:

- A busca por telefone usa o campo `nome_contato` da API Milvus
- É necessário informar o Cliente ID ao criar chamados
- Apenas chamados em aberto (status 9) são listados por padrão

## 🐛 Troubleshooting

### "Token inválido"
→ Gere um novo token no portal Milvus

### "Cliente não encontrado"
→ Verifique se o token/ID do cliente está correto

### "Erro ao carregar chamados"
→ Verifique se:
  - Token está configurado
  - URL da API está correta
  - Cliente tem chamados no Milvus

### "Painel não aparece"
→ Recarregue a página do WhatsApp (F5)

## 📚 Documentação

- **MILVUS_CONFIG.md**: Configuração detalhada da API Milvus
- **INSTALL.md**: Guia de instalação passo a passo
- **CHECKLIST.md**: Lista de verificação completa
- **API_EXAMPLES.md**: Exemplos de uso da API (versão antiga, use MILVUS_CONFIG.md)

## 🎓 Suporte

- 📖 Documentação Milvus: https://developers.milvus.com.br
- 🌐 Portal Milvus: https://portal.milvus.com.br
- 💬 Issues: GitHub do projeto

## 🎉 Pronto para Usar!

Agora sua extensão está totalmente integrada com o Milvus. Comece a gerenciar chamados diretamente do WhatsApp!

---

**Versão**: 1.0.0-milvus  
**Última atualização**: 20/10/2025  
**API**: Milvus Integration API v1
