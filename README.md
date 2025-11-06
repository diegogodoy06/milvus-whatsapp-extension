# Milvus WhatsApp Extension

Extensão para Google Chrome que integra o WhatsApp Web ao service desk Milvus, acelerando a abertura, acompanhamento e encerramento de chamados diretamente da conversa com o cliente.

## Funcionalidades

- Botão de "Abrir chamado" em cada mensagem para iniciar o fluxo sem sair do WhatsApp Web.
- Captura automática do contexto das últimas mensagens do cliente para enviar ao Gemini.
- **Análise de imagens com IA**: quando uma mensagem contém imagem, o Gemini analisa visualmente o conteúdo para identificar problemas, erros de tela, equipamentos, etc.
- Sugestões de título, descrição e categorias geradas pela Gemini 2.0 Flash (Google AI).
- Formulário rápido para criar chamados Milvus com preenchimento assistido por IA.
- Confirmação automática no WhatsApp informando ao contato que o ticket foi criado.
- Painel lateral com lista de chamados abertos, detalhes, histórico e ações rápidas.
- Comentários com refinamento opcional pela Gemini antes do envio ao Milvus.
- Finalização de chamados diretamente pelo painel.

## Requisitos

- Google Chrome (modo desenvolvedor habilitado para extensões).
- Token de API do Milvus com acesso aos endpoints de chamados.
- Chave da API Gemini (Generative Language API) habilitada para o modelo `gemini-2.0-flash`.

## Configuração

1. Renomeie `manifest.json` e `content.js` somente se necessário para publicação; eles já estão prontos para uso.
2. Configure as variáveis de ambiente (ou substitua valores no código):
   - `API_BASE_URL`
   - `API_TOKEN`
   - `GEMINI_API_KEY`
3. Carregue a pasta do projeto como extensão não empacotada em `chrome://extensions`.
4. Abra o WhatsApp Web, selecione um chat e use o painel lateral para gerenciar os chamados.

## Fluxo de Uso

1. Clique no ícone 🎫 ao lado de uma mensagem do cliente para iniciar um ticket.
2. **Para mensagens com imagem**: o Gemini analisará automaticamente o conteúdo visual (telas de erro, equipamentos, problemas visíveis) junto com qualquer texto.
3. Revise as sugestões do Gemini e ajuste antes de enviar.
4. Confirme a criação; o contato recebe automaticamente a mensagem de abertura do chamado.
5. Utilize o painel para visualizar chamados ativos, adicionar comentários ou finalizar o atendimento.

## Licença

Projeto de uso interno. Ajuste as permissões conforme a política da sua organização antes de publicar na Chrome Web Store.
