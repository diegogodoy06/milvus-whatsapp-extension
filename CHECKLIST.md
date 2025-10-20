# ✅ Checklist de Instalação e Configuração

Use este checklist para garantir que tudo está funcionando corretamente.

## 📦 Preparação

- [ ] Repositório clonado/baixado
- [ ] Node.js instalado (versão 14 ou superior)
- [ ] Chrome/Edge instalado
- [ ] Editor de texto (VS Code, Notepad++, etc)

## 🎨 Criação dos Ícones

Escolha uma opção:

### Opção A - Converter SVG para PNG Online
- [ ] Acesse https://cloudconvert.com/svg-to-png
- [ ] Faça upload do `icons/icon16.svg`
- [ ] Faça upload do `icons/icon48.svg`
- [ ] Faça upload do `icons/icon128.svg`
- [ ] Baixe os 3 arquivos PNG
- [ ] Salve na pasta `icons/` (substitua .svg por .png)

### Opção B - Criar Manualmente
- [ ] Crie `icon16.png` (16x16 pixels)
- [ ] Crie `icon48.png` (48x48 pixels)
- [ ] Crie `icon128.png` (128x128 pixels)
- [ ] Salve na pasta `icons/`

### Opção C - Usar ImageMagick
- [ ] Instale ImageMagick
- [ ] Execute os comandos de conversão
- [ ] Verifique se os 3 PNGs foram criados

## 🔧 Instalação da Extensão

- [ ] Abra o Chrome
- [ ] Acesse `chrome://extensions/`
- [ ] Ative **Modo do desenvolvedor** (canto superior direito)
- [ ] Clique em **Carregar sem compactação**
- [ ] Selecione a pasta do projeto
- [ ] Extensão aparece na lista de extensões
- [ ] Nenhum erro de carregamento aparece

## 🚀 Configuração do Backend

### API de Teste (Opcional)

- [ ] Abra o terminal na pasta do projeto
- [ ] Execute: `npm install`
- [ ] Execute: `npm start`
- [ ] Servidor iniciado em http://localhost:3000
- [ ] Teste: http://localhost:3000/api/health
- [ ] Resposta: `{"status":"ok",...}`

### API Real (Se já tiver)

- [ ] API está rodando
- [ ] API responde em todas as rotas:
  - [ ] GET /tickets
  - [ ] GET /tickets/:id
  - [ ] POST /tickets
  - [ ] PATCH /tickets/:id
  - [ ] POST /tickets/:id/comments
- [ ] CORS está habilitado
- [ ] Endpoints retornam JSON válido

## ⚙️ Configuração da Extensão

- [ ] Clique no ícone da extensão na barra do Chrome
- [ ] Digite a URL da API (ex: `http://localhost:3000/api`)
- [ ] Clique em **Salvar Configurações**
- [ ] Mensagem de sucesso aparece

## 🧪 Testes no WhatsApp Web

### Acesso e Interface

- [ ] Acesse https://web.whatsapp.com
- [ ] Faça login com seu WhatsApp
- [ ] WhatsApp Web está carregado completamente
- [ ] Abra qualquer conversa
- [ ] Botão de suporte aparece no cabeçalho (ícone 🎫)
- [ ] Clique no botão
- [ ] Painel lateral abre à direita

### Funcionalidades Básicas

- [ ] Nome do contato aparece no painel
- [ ] Botões "Novo Chamado" e "Atualizar" aparecem
- [ ] Clique em "Atualizar"
- [ ] Lista de chamados carrega (pode estar vazia)
- [ ] Nenhum erro no console (F12)

### Criar Chamado

- [ ] Clique em "Novo Chamado"
- [ ] Formulário aparece
- [ ] Preencha título (ex: "Teste")
- [ ] Preencha descrição (ex: "Chamado de teste")
- [ ] Selecione prioridade
- [ ] Clique em "Criar Chamado"
- [ ] Mensagem de sucesso aparece
- [ ] Chamado aparece na lista

### Visualizar Detalhes

- [ ] Clique em "Ver Detalhes" em um chamado
- [ ] Detalhes completos aparecem
- [ ] Todas as informações estão corretas
- [ ] Botão "Voltar" funciona

### Adicionar Comentário

- [ ] Clique em "Comentar" em um chamado
- [ ] Campo de comentário aparece
- [ ] Digite um comentário
- [ ] Clique em "Enviar"
- [ ] Mensagem de sucesso aparece
- [ ] Comentário é salvo

### Finalizar Chamado

- [ ] Clique em "Finalizar" em um chamado aberto
- [ ] Confirmação aparece
- [ ] Confirme a ação
- [ ] Mensagem de sucesso aparece
- [ ] Chamado desaparece da lista (se filtrado por abertos)

### Múltiplos Contatos

- [ ] Abra outra conversa
- [ ] Abra o painel novamente
- [ ] Chamados do novo contato aparecem
- [ ] Informações do novo contato estão corretas

## 🐛 Troubleshooting

### Problemas Comuns

#### Extensão não carrega
- [ ] Verificado se todos os ícones PNG existem
- [ ] Manifest.json está sem erros
- [ ] Recarregada a extensão em chrome://extensions/

#### Painel não aparece
- [ ] Está em https://web.whatsapp.com
- [ ] WhatsApp Web está completamente carregado
- [ ] Página recarregada (F5)
- [ ] Console verificado por erros (F12)

#### Erro ao carregar chamados
- [ ] API está rodando
- [ ] URL da API está correta nas configurações
- [ ] CORS está habilitado na API
- [ ] Endpoints da API estão corretos
- [ ] API retorna JSON válido

#### Número de telefone não detectado
- [ ] Está em uma conversa individual (não grupo)
- [ ] URL do WhatsApp contém o número
- [ ] Nome do contato aparece no painel
- [ ] API aceita busca por nome

#### "Failed to fetch" / "Network error"
- [ ] API está acessível no navegador
- [ ] Firewall não está bloqueando
- [ ] CORS está habilitado
- [ ] Usando HTTP para localhost (ou HTTPS válido)

## 🎯 Testes de Performance

- [ ] Painel abre em menos de 1 segundo
- [ ] Lista carrega em menos de 2 segundos
- [ ] Interface responde rapidamente
- [ ] Sem travamentos no WhatsApp
- [ ] Memória não aumenta excessivamente

## 🔐 Testes de Segurança

- [ ] Dados sensíveis não aparecem no console
- [ ] API não aceita requests maliciosos
- [ ] Validação de dados funciona
- [ ] Erros não expõem informações internas

## 📱 Testes de Usabilidade

- [ ] Interface é intuitiva
- [ ] Botões têm labels claros
- [ ] Mensagens de erro são claras
- [ ] Mensagens de sucesso aparecem
- [ ] Cores contrastam bem
- [ ] Textos são legíveis

## 🎨 Testes de Compatibilidade

### Navegadores
- [ ] Google Chrome (versão 88+)
- [ ] Microsoft Edge (versão 88+)
- [ ] Brave
- [ ] Opera

### Resoluções
- [ ] 1920x1080 (Full HD)
- [ ] 1366x768 (HD)
- [ ] 1280x720 (HD Ready)
- [ ] Zoom do navegador 100%
- [ ] Zoom do navegador 125%
- [ ] Zoom do navegador 150%

## 📊 Validação Final

- [ ] Todas as funcionalidades testadas
- [ ] Nenhum erro crítico encontrado
- [ ] Performance aceitável
- [ ] Interface funcional
- [ ] Documentação lida
- [ ] Pronto para uso!

## 🚀 Próximos Passos

### Uso Diário
- [ ] Treinar equipe de suporte
- [ ] Documentar processos internos
- [ ] Definir SLAs
- [ ] Monitorar uso

### Melhorias Futuras
- [ ] Adicionar autenticação
- [ ] Implementar notificações
- [ ] Adicionar relatórios
- [ ] Integrar com outras ferramentas
- [ ] Deploy em produção

## 📞 Suporte

Se encontrar problemas:

1. ✅ Consulte o README.md
2. ✅ Veja o INSTALL.md
3. ✅ Leia o API_EXAMPLES.md
4. ✅ Verifique o console (F12)
5. ✅ Teste a API separadamente
6. ✅ Recarregue a extensão
7. ✅ Reinicie o Chrome
8. ❓ Abra uma issue no GitHub

---

## 🎉 Conclusão

- [ ] Todos os itens do checklist completados
- [ ] Sistema funcionando corretamente
- [ ] Equipe treinada
- [ ] Pronto para produção!

**Parabéns! Sua extensão está instalada e configurada com sucesso! 🎊**

---

*Data da instalação: ____/____/________*  
*Instalado por: _____________________*  
*Versão: 1.0.0*
