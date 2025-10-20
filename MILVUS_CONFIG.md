# 🔧 Configuração da API Milvus

Este guia explica como configurar a extensão para funcionar com a API do Milvus.

## 🔑 Obtendo o Token de Autenticação

1. Acesse o **Portal Gestor do Milvus**: https://portal.milvus.com.br
2. Faça login com suas credenciais
3. Navegue até a seção de **Integrações** ou **API**
4. Clique em **Gerar Token de API** ou copie um token existente
5. Guarde este token em local seguro - você precisará dele na extensão

## ⚙️ Configurando a Extensão

### 1. Abrir Configurações

- Clique no ícone da extensão na barra de ferramentas do Chrome
- Ou acesse através do menu de extensões

### 2. Preencher os Campos

**URL da API:**
```
https://apiintegracao.milvus.com.br/api
```

**Token de Autenticação:**
```
seu-token-aqui (exemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
```

### 3. Salvar

- Clique em **Salvar Configurações**
- A extensão tentará validar a conexão
- Se bem-sucedido, verá: "✓ Configurações salvas e API Milvus conectada!"

## 📋 Configuração de Cliente

Para criar chamados, você precisa informar o **ID do Cliente** no Milvus.

### Como encontrar o ID do Cliente:

#### Opção 1: Token do Cliente
1. No portal Milvus, vá até **Clientes**
2. Encontre o cliente desejado
3. Copie o **Token** (ex: `ABC123`, `K1OSGA`)
4. Use este token ao criar chamados

#### Opção 2: ID Numérico
1. No portal Milvus, acesse o cadastro do cliente
2. Copie o **ID** (número)
3. Use este ID ao criar chamados

### Exemplo de uso:

Ao criar um chamado via WhatsApp, você precisará informar:
- **Cliente ID**: `ABC123` (token) ou `30753` (ID numérico)

Você pode armazenar essa informação em uma planilha ou documento para consulta rápida.

## 🔄 Fluxo de Integração

```
┌─────────────────────┐
│  WhatsApp Web       │
│  (Conversa aberta)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Extensão Chrome    │
│  - Detecta contato  │
│  - Busca telefone   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   API Milvus        │
│  POST /chamado/     │
│  listagem           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Exibe Chamados     │
│  no Painel Lateral  │
└─────────────────────┘
```

## 📊 Estrutura de Dados

### Campos Obrigatórios ao Criar Chamado:

```json
{
  "cliente_id": "ABC123",                    // Token ou ID do cliente
  "chamado_assunto": "Problema no sistema",  // Título do chamado
  "chamado_descricao": "Descrição detalhada",// Descrição completa
  "chamado_email": "",                       // Email (pode ficar vazio)
  "chamado_telefone": "5511999999999",       // Telefone detectado
  "chamado_contato": "João Silva"            // Nome do contato
}
```

### Campos Opcionais:

```json
{
  "chamado_tecnico": "tecnico@empresa.com",  // Email do técnico
  "chamado_mesa": "Mesa Padrão",             // Mesa de trabalho
  "chamado_setor": "TI",                     // Setor
  "chamado_categoria_primaria": "Hardware",  // Categoria primária
  "chamado_categoria_secundaria": "Mouse"    // Categoria secundária
}
```

## 🎯 Status dos Chamados

A API Milvus retorna os seguintes status:

| ID | Status Milvus    | Status Extensão  | Cor     |
|----|------------------|------------------|---------|
| 1  | AgAtendimento    | Aberto           | 🔵 Azul |
| 2  | Atendendo        | Em Andamento     | 🟡 Amarelo |
| 3  | Pausado          | Pausado          | 🟠 Laranja |
| 4  | Finalizado       | Fechado          | ⚫ Cinza |
| 5  | Conferência      | Conferência      | 🟣 Roxo |
| 6  | Agendado         | Agendado         | 🟢 Verde |
| 9  | ChamadosAbertos  | Aberto           | 🔵 Azul |

## 🔐 Segurança

### Boas Práticas:

1. **Nunca compartilhe seu token** em repositórios públicos
2. **Gere tokens específicos** para cada integração
3. **Renove tokens periodicamente** por questões de segurança
4. **Use HTTPS sempre** - a API Milvus já usa SSL
5. **Monitore o uso da API** no portal do Milvus

### Permissões Necessárias:

O token precisa ter permissões para:
- ✅ Listar chamados
- ✅ Criar chamados
- ✅ Adicionar acompanhamentos
- ✅ Finalizar chamados

Verifique estas permissões no portal do Milvus.

## 🧪 Testando a Conexão

### Via PowerShell:

```powershell
$headers = @{
    "Authorization" = "Bearer SEU_TOKEN_AQUI"
    "Content-Type" = "application/json"
}

$body = @{
    filtro_body = @{
        status = 9
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://apiintegracao.milvus.com.br/api/chamado/listagem?total_registros=5" -Method Post -Headers $headers -Body $body
```

### Via cURL:

```bash
curl -X POST "https://apiintegracao.milvus.com.br/api/chamado/listagem?total_registros=5" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"filtro_body":{"status":9}}'
```

## 🔍 Busca de Chamados por Contato

A extensão busca chamados usando:

1. **Número de telefone** (se detectado)
   - Formato: `5511999999999`
   - Campo: `filtro_body.nome_contato`

2. **Nome do contato** (fallback)
   - Campo: `filtro_body.nome_contato`

⚠️ **Nota**: A API Milvus usa `nome_contato` tanto para nome quanto para telefone na busca.

## 📞 Detecção de Telefone

A extensão tenta detectar o número de telefone de duas formas:

1. **Da URL do WhatsApp Web:**
   - `https://web.whatsapp.com/send?phone=5511999999999`
   - Formato: número com código do país

2. **Do DOM (cabeçalho da conversa):**
   - Busca padrões de telefone no texto

### Formato esperado:
- Com código do país: `5511999999999`
- Sem espaços, parênteses ou hifens

## 🛠️ Troubleshooting

### Erro: "Token inválido"

**Solução:**
1. Verifique se o token está correto (sem espaços extras)
2. Regenere o token no portal Milvus
3. Verifique se o token não expirou

### Erro: "Cliente não encontrado"

**Solução:**
1. Verifique se o cliente_id está correto
2. Confirme que o cliente existe no Milvus
3. Use o token do cliente (ex: `ABC123`) em vez do ID numérico

### Erro: "Nenhum chamado encontrado"

**Possíveis causas:**
1. Cliente não tem chamados em aberto
2. Telefone/nome não corresponde aos dados do Milvus
3. Filtro de status está muito restritivo

**Solução:**
- Tente criar um chamado de teste
- Verifique os dados de contato no Milvus

### Erro: "CORS"

Não deve acontecer, pois a API Milvus tem CORS habilitado. Se ocorrer:
1. Verifique se está usando HTTPS
2. Contate o suporte do Milvus

## 📚 Documentação Completa

Para documentação completa da API Milvus, acesse:
- Portal: https://portal.milvus.com.br
- Docs: https://developers.milvus.com.br

## 💡 Dicas de Uso

1. **Prepare uma lista de clientes** com seus tokens/IDs
2. **Defina categorias padrão** para agilizar a criação de chamados
3. **Configure técnicos e mesas** no Milvus antes de usar
4. **Use o campo de observação** para informações extras
5. **Treine a equipe** sobre os campos obrigatórios

## 🎓 Exemplo Prático

### Cenário: Cliente liga pelo WhatsApp

1. **Cliente**: "João Silva" envia mensagem
2. **Extensão**: Detecta telefone `5511999999999`
3. **Você**: Clica no ícone de suporte
4. **Sistema**: Busca chamados de João Silva
5. **Você**: Vê que há um chamado em aberto
6. **Você**: Adiciona acompanhamento: "Cliente solicitou atualização"
7. **Sistema**: Acompanhamento salvo no Milvus
8. **Cliente**: Problema resolvido
9. **Você**: Clica em "Finalizar"
10. **Sistema**: Chamado finalizado no Milvus

---

**Precisa de ajuda?** Entre em contato com o suporte do Milvus ou abra uma issue no GitHub da extensão.
