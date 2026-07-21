# Milvus WhatsApp Extension

Extensão para Google Chrome que integra o WhatsApp Web ao service desk Milvus, acelerando a abertura, acompanhamento e encerramento de chamados diretamente da conversa com o cliente.

## Funcionalidades

- Botão de "Abrir chamado" em cada mensagem para iniciar o fluxo sem sair do WhatsApp Web.
- Captura automática do contexto das últimas mensagens do cliente para enviar à Groq.
- **Análise de imagens com IA**: quando uma mensagem contém imagem, um modelo multimodal da Groq analisa visualmente o conteúdo para identificar problemas, erros de tela, equipamentos, etc.
- Sugestões de título, descrição e categorias geradas pela Groq (modelo padrão `qwen/qwen3.6-27b`, configurável).
- Formulário rápido para criar chamados Milvus com preenchimento assistido por IA.
- Confirmação automática no WhatsApp informando ao contato que o ticket foi criado.
- Painel lateral com lista de chamados abertos, detalhes, histórico e ações rápidas.
- Comentários com refinamento opcional pela Groq antes do envio ao Milvus.
- Finalização de chamados diretamente pelo painel.

## Requisitos

- Google Chrome (modo desenvolvedor habilitado para extensões).
- Token de API do Milvus com acesso aos endpoints de chamados.
- Chave da API Groq. Para a análise de imagens, o modelo configurado precisa ser multimodal (o padrão `qwen/qwen3.6-27b` já atende). Consulte os modelos disponíveis em [console.groq.com/docs/models](https://console.groq.com/docs/models).

## Configuração

1. Carregue a pasta do projeto como extensão não empacotada em `chrome://extensions`.
2. Clique no ícone da extensão para abrir o popup de configurações e informe:
   - **Token de Autenticação Milvus** (gerado no [Portal Milvus](https://portal.milvus.com.br)).
   - **Chave da Groq API** (opcional, habilita as sugestões de IA).
   - **Modelo Groq** (opcional; em branco usa o padrão `qwen/qwen3.6-27b`). Troque aqui caso a Groq descontinue o modelo padrão.
3. Clique em **Salvar configurações**. As abas abertas do WhatsApp Web são recarregadas automaticamente.
4. Abra o WhatsApp Web, selecione um chat e use o painel lateral para gerenciar os chamados.

## Fluxo de Uso

1. Clique no ícone 🎫 ao lado de uma mensagem do cliente para iniciar um ticket.
2. **Para mensagens com imagem**: a Groq analisará automaticamente o conteúdo visual (telas de erro, equipamentos, problemas visíveis) junto com qualquer texto.
3. Revise as sugestões da Groq e ajuste antes de enviar.
4. Confirme a criação; o contato recebe automaticamente a mensagem de abertura do chamado.
5. Utilize o painel para visualizar chamados ativos, adicionar comentários ou finalizar o atendimento.

## Licença

Projeto de uso interno. Ajuste as permissões conforme a política da sua organização antes de publicar na Chrome Web Store.
