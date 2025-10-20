Autenticação
Para gerar a sua chave de API acesse o portal gestor do Milvus.

Base Conhecimento
buscarContextoPergunta - buscarContextoPergunta
Busca a lista de contextos para uma pergunta

POST
https://apiintegracao.milvus.com.br/api/base-conhecimento/buscar-contexto
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Request-Example:
{
     "pergunta": "Como instalar uma impressora na rede?",   
}
Success-Response:
HTTP/1.1 200 OK
[
   {
       "id": 1820,
       "artigo": ""
   },
   {
       "id": 1821,
       "artigo": ""
   }
]
perguntarComContexo - perguntarComContexo
Faz pergunta e devolve resposta baseada no contexto

POST
https://apiintegracao.milvus.com.br/api/base-conhecimento/perguntar-contexto
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Request-Example:
{
     "pergunta": "Como instalar uma impressora na rede?",   
}
Success-Response:
HTTP/1.1 200 OK
{
    "status_code": 200,
    "resposta": "",
    "prompt": ""
}
Chamado
criarAcompanhamento - criarAcompanhamento
Cria um novo acompanhamento para o chamado

POST
https://apiintegracao.milvus.com.br/api/chamado/acompanhamento/criar
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Request-Example:
{
    "acompanhamento_ticket": "2270",
    "acompanhamento_descricao": "teste 1 hora externa nao comercial",
    "acompanhamento_privado": false,
    "atendimento_total_horas": "01:00",
    "atendimento_valor_deslocamento": 0,
    "atendimento_horario_comercial": false,
    "atendimento_externo": true
}
Success-Response:
HTTP/1.1 204 OK
criarAnexo - criarAnexo
Cria um novo anexo para o chamado (formData)

POST
https://apiintegracao.milvus.com.br/api/chamado/anexo/criar/:chamado
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Request-Example:
"anexo": "file"
Success-Response:
HTTP/1.1 204 OK
criarChamado - criarChamado
Cria um novo chamado para o cliente

POST
https://apiintegracao.milvus.com.br/api/chamado/criar
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Request-Example:
{
    "cliente_id": "ABC123",
    "chamado_assunto": "Teste",
    "chamado_descricao": "Teste",
    "chamado_email": "teste@milvus.com.br",
    "chamado_telefone": "(11) 1234-1234",
    "chamado_contato": "Teste",
    "chamado_tecnico": "teste@teste.com.br",
    "chamado_mesa": "Mesa padrão",
    "chamado_setor": "Setor padrão",
    "chamado_categoria_primaria": "Backup",
    "chamado_categoria_secundaria": "Verificar"
}
Success-Response:
HTTP/1.1 200 OK
123
finalizarChamado - finalizarChamado
Finaliza o chamado

PUT
https://apiintegracao.milvus.com.br/api/chamado/finalizar
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Request-Example:
{
    "chamado_codigo": "1234",
    "chamado_servico_realizado": "Teste",
    "chamado_equipamento_retirado": "Teste",
    "chamado_material_utilizado": "Teste"
}
Success-Response:
HTTP/1.1 200 OK
123
listagemChamados - listagemChamados
Listagem de chamados

POST
https://apiintegracao.milvus.com.br/api/chamado/listagem
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Parâmetro
Campo	Tipo	Descrição
is_descendingopcional	Boolean	
** A opção true ordenará do maior para o menor e false ao contrário, o padrão é true (Decresente) **

Valores permitidos: true, false

order_byopcional	String	
** É possível ordenar por todos os campos de filtro, se não informado o padrão é codigo **

Valores permitidos: "assunto", "codigo", "nome_contato", "email_conferencia"

total_registrosopcional	Integer	
** Se não informado o padrão é 50 e o limite máximo é de 1000 registros por requisição **

Valores permitidos: 50, 100, 200

paginaopcional	Integer	
** Se não informado o padrão é 1 **

Valores permitidos: 1, 2

Request-Example:
{
 "filtro_body": {
     "assunto": "",
     "codigo": "",
     "nome_contato": "",
     "email_conferencia": "",
     "data_criacao": "",
     "data_solucao": "",
     "cliente_token": "",
     "cliente_id": "",
     "status": "",
     "tecnico": "",
     "cliente": "",
     "mesa_trabalho": "",
     "categoria_primaria": "",
     "categoria_secundaria": "",
     "total_avaliacao": 5,
     "descricao_avaliacao" : "Tudo certo!",
     "setor": "",
     "tipo_ticket": "",
     "dispositivo": "asus",
     "possui_avaliacao": true,
     "prioridade": 1,
     "data_hora_criacao_inicial": "2022-12-04 12:45:00",
     "data_hora_criacao_final": "2022-12-16 17:50:00",
     "data_hora_solucao_inicial": "2022-12-04 12:45:00",
     "data_hora_solucao_final": "2022-12-16 17:50:00"
 }
}

---------------Opções de filtro status (filtrar pelo id ou texto---------------
{A fazer - 1 ou "AgAtendimento" }
{Atendendo - 2 ou "Atendendo"}
{Pausado - 3 ou "Pausado"}
{Finalizado - 4 ou "Finalizado"}
{Conferência - 5 ou "Conferencia"}
{Agendado - 6 ou "Agendado"}
{Expirado - 7 ou "Expirado"}
{Tickets abertos - 9 ou "ChamadosAbertos"}
{Todos - 10 ou "Todos"}
{Ag. solução - 11 ou "AgSolucao"}
{Tickets aguardando atendimento ou não agendados - 13 ou "AbertosNaoAgendados"}
{Sem técnico - 14 ou "SemTecnico"}
--------------------------------------------------------------------------------
Success-Response:
HTTP/1.1 200 OK
{
     "meta": {
         "paginate": {
             "current_page": "1",
             "total": 1,
             "to": 50,
             "from": 1,
             "last_page": 1,
             "per_page": 50
         }
     },
     "lista": [{
         "categoria_primaria": "Hardware",
         "categoria_secundaria": "Troca de peça",
         "total_avaliacao": null,
         "descricao_avaliacao": null,
         "tecnico": "Favio Ramos",
         "mesa_trabalho": "mesa favio teste",
         "data_solucao": "2020-10-05 17:30:42",
         "dispositivo_vinculado": null,
         "servico_realizado": "teste",
         "data_agendamento": null,
         "data_resposta": "2020-10-05 17:30:04",
         "equipamento_retirado": null,
         "material_utilizado": null,
         "setor": null,
         "prioridade": "Crítico",
         "codigo": 857,
         "id": 884790,
         "cliente": "MILVUS MILVUS",
         "cliente_token": "ASSDF",
         "assunto": "teste de  automatização",
         "descricao": "teste de ticket automatico",
         "contato": "favio",
         "email_conferencia": "favio.ramos@milvus.com.br",
         "telefone": "",
         "data_criacao": "2019-11-13 06:00:02",
         "data_modificacao": "2020-10-05 17:30:42",
         "total_horas": "00:00:00",
         "origem": "Tickets pré-programados",
         "status": "Conferência",
         "impacto": "Não possui",
         "urgencia": "Não possui",
         "ultima_log": {
             "tecnico": "julio fatec",
             "texto": "Ticket finalizado: aaaaaa",
             "texto_html": null,
             "data": "2021-04-05 11:13:34"
         },
         "ultimas_cinco_logs": [],
         "motivo_pausa": "",
         "email_tecnico": "favio.ramos@milvus.com.br",
         "sla": {
             "is_sla_pausada": false,
             "total_sla_resposta_programado": "02:00",
             "total_sla_solucao_programado": "04:00",
             "total_pausas_sla": 0,
             "data_expiracao_sla": "2020-10-07 09:20:00",
             "status_sla_resposta": "Estourado",
             "status_sla_solucao": "Em conformidade",
             "resposta": {
                 "status": "Estourado",
                 "tempo_gasto": "1931:20",
                 "tempo_restante": null,
                 "porcentagem": 100
             },
             "solucao": {
                 "status": "Em conformidade",
                 "tempo_gasto": "00:00",
                 "tempo_restante": null,
                 "porcentagem": "0.0"
             }
         },
         "status_sla_resposta": "Estourado",
         "status_sla_solucao": "Em conformidade"
     }]
}
listarAcompanhamentos - listarAcompanhamentos
Lista acompanhamentos do chamado por técnicos e clientes

GET
https://apiintegracao.milvus.com.br/api/chamado/acompanhamento/{chamado_codigo}
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Parâmetro
Campo	Tipo	Descrição
tipoopcional	String	
** Se não informado, mostra todos os tipos **

Valores permitidos: "comentarios", "interacoes", "sla", "criacoes", "pausas", "finalizacoes", "anexos", "email", "ligacoes", "excluidos"

privadoopcional	String	
** Se não informado, mostra todos **

Valores permitidos: "true", "false"

perfilopcional	String	
** Filtra acompanhamentos pelo perfil **

Valores permitidos: "tecnico", "cliente"

pessoaopcional	String	
** Filtra pelo nome do técnico ou cliente **

Success-Response:
HTTP/1.1 200 OK
{
     "status_code": 200,
     "retorno": [{
         "pessoa": "Milvus",
         "perfil": "tecnico",
         "texto": "teste",
         "texto_html": "<p>teste</p>",
         "data": "2021-06-24 16:43:19",
         "privado": true,
         "log_tipo_id": 6,
         "is_excluido": false
     }]
}
listarAcompanhamentosTecnicos - listarAcompanhamentosTecnicos
Lista todos os acompanhamentos feito por técnicos

GET
https://apiintegracao.milvus.com.br/api/chamado/acompanhamento/tecnico/{chamado_codigo}
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Parâmetro
Campo	Tipo	Descrição
tipoopcional	String	
** Se não informado, mostra todos os tipos **

Valores permitidos: "comentarios", "interacoes", "sla", "criacoes", "pausas", "finalizacoes", "anexos", "email", "ligacoes", "excluidos"

privadoopcional	String	
** Se não informado, mostra todos **

Valores permitidos: "true", "false"

tecnicoopcional	String	
** Se não informado, mostra de todos os tecnicos **

Valores permitidos: "nome do tecnico"

Success-Response:
HTTP/1.1 200 OK
{
     "status_code": 200,
     "retorno": [{
         "tecnico": "Milvus",
         "texto": "teste",
         "texto_html": "<p>teste</p>",
         "data": "2021-06-24 16:43:19",
         "privado": true
		    "log_tipo_id": 6,
         "is_excluido": false
     }]
 }
salvarLigacao - salvarLigacao
Salva os dados de ligação

POST
https://apiintegracao.milvus.com.br/api/chamado/ligacao
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Request-Example:
{
    "start_at": "2020-04-23 15:51:26",
    "end_at": "2020-04-23 15:51:26",
    "status": "200",
    "record_url": "https://www.google.com.br/",
    "id_ticket": "885425",
    "duration": "00:00:02",
    "ramal": "8383",
    "user_milvus": 123
}
Chat
listagemChats - listagemChats
Listagem de chats

POST
https://apiintegracao.milvus.com.br/api/chat/listagem
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Parâmetro
Campo	Tipo	Descrição
is_descendingopcional	Boolean	
** A opção true ordenará do maior para o menor e false ao contrário, o padrão é true (Decresente) **

Valores permitidos: true, false

order_byopcional	String	
** É possível ordenar por todos os campos de filtro, se não informado o padrão é codigo **

Valores permitidos: "assunto", "codigo", "nome_contato", "email_conferencia"

total_registrosopcional	Integer	
** Se não informado o padrão é 50 e o limite máximo é de 100 registros por requisição **

Valores permitidos: 50, 100

paginaopcional	Integer	
** Se não informado o padrão é 1 **

Valores permitidos: 1, 2

Request-Example:
{
     "filtro_body" : {
         "contato": "teste",
         "fila_atendimento": "Suporte",
         "widget": "Whatsapp",
         "tabulacao": "Apenas dúvidas",
         "tecnico_ativo": "teste@milvus.com.br"
         "status": 1,
         "total_avaliacao": 1,
         "data_criacao": "2016-01-01",
         "data_finalizacao": "2016-02-18",
         "data_atendimento": "2016-01-01",
         "data_criacao_inicial": "2016-02-04",
         "data_criacao_final": "2016-02-17",
         "data_finalizacao_inicial": "2016-02-04",
         "data_finalizacao_final": "2016-02-17",
         "data_atendimento_inicial": "2016-02-04",
         "data_atendimento_final": "2016-02-17",
     }
}
Success-Response:
HTTP/1.1 200 OK
{
    "meta": {
        "paginate": {
            "current_page": "1",
            "total": 3,
            "to": 1,
            "from": 1,
            "last_page": 3,
            "per_page": "1"
        }
    },
    "lista": [
        {
            "iniciado_pelo_operador": true,
            "is_whatsapp": true,
            "possui_mensagens_nao_lidas": false,
            "is_finalizado_inatividade": false,
            "is_telegram": false,
            "whatsapp_oficial": true,
            "tempo_total": "00:11",
            "tempo_atendimento": "00:11",
            "modo_avaliacao_ligado": false,
            "is_finalizado_cliente": false,
            "descricao_finalizacao": "adasd",
            "data_final": "2024-10-23T20:33:18.000Z",
            "data_ultima_interacao": "2024-10-23T20:33:18.000Z",
            "whatsapp_numero_valido": "5511962299724",
            "data_inicio_atendimento": "2024-10-23 17:23:10",
            "fila_enviada": true,
            "data_atendimento_fila": "2024-10-23 17:23:10",
            "tecnico_ativo": "Teste",
            "status": "Finalizado",
            "numero_contato": "5511911111111",
            "numero_empresa": "5511922222222",
            "possui_fila_atribuida": true,
            "tabulacao": "Apenas dúvidas",
            "cliente": "A. CLIENTE GRUPO CATEGORIAS",
            "nome_contato": "Teste ",
            "email_contato": null,
            "ultima_mensagem": "Obrigado, até logo.",
            "data_mensagem": "23/10/2024 17:33:18",
            "fila_atendimento": "Geral Transf",
            "widget": "Whatsapp111",
            "chamado_vinculado": 64015,
            "mensagens": [
                {
                    "data_mensagem": "2024-10-23 17:33:18",
                    "tipo_mensagem": "Automatica",
                    "body": "Obrigado, até logo.",
                    "status_mensagem": 1,
                    "tipo": "botao",
                    "enviado_por": "robo",
                    "autor_nome": "milvus",
                    "autor_foto": "https://milvus-publico.s3.sa-east-1.amazonaws.com/logos/milvus-robo-chat.png",
                    "autor_tipo": "Bot"
                },
                {
                    "data_mensagem": "2024-10-23 17:33:18",
                    "tipo_mensagem": "Automatica",
                    "body": "Por favor, nos conte como foi o seu atendimento.\n\n1.😔 Péssimo\n\n2.🙁 Ruim\n\n3.😐 Regular\n\n4.😀 Bom\n\n5.🤩 Excelente\n\n9.❌ Não avaliar",
                    "status_mensagem": 1,
                    "tipo": "botao",
                    "enviado_por": "robo",
                    "autor_nome": "milvus",
                    "autor_foto": "https://milvus-publico.s3.sa-east-1.amazonaws.com/logos/milvus-robo-chat.png",
                    "autor_tipo": "Bot"
                },
                {
                    "data_mensagem": "2024-10-23 17:23:33",
                    "tipo_mensagem": "Comum",
                    "body": "Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us.",
                    "status_mensagem": 1,
                    "tipo": "texto",
                    "enviado_por": "tecnico",
                    "autor_nome": "Teste",
                    "autor_foto": null,
                    "autor_tipo": "Tecnico"
                }
            ],
            "id": "67195b2fcbf4bf4ae87ff0ac"
        }
    ]
}
Cliente
ListarCliente - ListarCliente
Busca clientes caso seja informado o valor do parâmetro "documento" com base no ID. Caso esse parâmetro não seja repassado, será retornada a listagem de todos os clientes.

GET
https://apiintegracao.milvus.com.br/api/cliente/busca
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Parâmetro
Campo	Tipo	Descrição
documento	String	
(Não Obrigatório).

Valores permitidos: "59759145000108"

Success-Response:
HTTP/1.1 200 OK
{
    "lista": [
        {
            "id": 30753,
            "nome_fantasia": "Teste cliente 1",
            "razao_social": "Teste cliente 1",
            "cnpj_cpf": "111111000111",
            "token": "KEN7B5",
            "equipes": [ "EQUIPE 1","EQUIPE 2"]
        },
        { 
            "id": 50662,
            "nome_fantasia": "Fa o parte",
            "razao_social": "Fa o parte",
            "cnpj_cpf": "111111000111",
            "token": "K1OSGA",
            "equipes": [ "EQUIPE 3","EQUIPE 4"]
        },
}
alterarCliente - alterarCliente
Altera um cliente com base no id

PUT
https://apiintegracao.milvus.com.br/api/cliente/alterar/:id
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Request-Example:
{
    "cliente_documento": 11123445667,
    "cliente_site": "www.site.com",
    "cliente_observacao": "teste",
    "cliente_ativo": true,
    "cliente_id_integracao": 123,
    "cliente_pessoa_fisica": {
        "nome": "teste",
        "data_nascimento": "2019-09-09",
        "sexo": "F"
    },
    "cliente_pessoa_juridica": {
        "nome_fantasia": "teste",
        "razao_social": "teste",
        "inscricao_estadual": ""
    }
}
Success-Response:
HTTP/1.1 204 OK
criarCliente - criarCliente
Cria um novo cliente e atribui ele para todas as equipes ativas

POST
https://apiintegracao.milvus.com.br/api/cliente/criar
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Request-Example:
{
     "cliente_documento": 11123445667,
     "cliente_site": "www.site.com",
     "cliente_observacao": "teste",
     "cliente_ativo": true,
     "cliente_id_integracao": 0* Para cadastro sequencial de clientes.  
     "cliente_pessoa_fisica": {
         "nome": "teste",
         "data_nascimento": "2019-09-09",
         "sexo": "F"
     },
     "cliente_pessoa_juridica": {
         "nome_fantasia": "teste",
         "razao_social": "teste",
         "inscricao_estadual": ""
     },
     "cliente_enderecos": [{
         "endereco_padrao": true,
         "endereco_descricao" : "exemplo 1",
         "endereco_cep" : "00000000",
         "endereco_logradouro" : "Rua exemplo 1",
         "endereco_numero" : "123",
         "endereco_complemento": "Andar exemplo 3",
         "endereco_bairro": "exemplo 4",
         "endereco_cidade": "exemplo 5",
         "endereco_estado": "SP"
     }],
     "cliente_contatos": [{
         "contato_padrao": true,
         "contato_descricao": "Teste",
         "contato_email": "cassiano@teste.com.br",
         "contato_telefone": "(11) 1234-5678",
         "contato_celular": "(11) 97654-3210",
         "contato_observacao": "teste de obs"
     }]
}
Success-Response:
HTTP/1.1 200 OK
123
criarContato - criarContato
Cria um novo contato para o cliente

POST
https://apiintegracao.milvus.com.br/api/cliente/contato/criar
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Request-Example:
{
    "cliente_id": "ABC123",
    "contato_descricao": "Teste",
    "contato_email": "teste@milvus.com.br",
    "contato_telefone": "(11) 1234-1234",
    "contato_celular": "(11) 91234-1234",
    "contato_observacao": "Teste",
    "is_padrao": "false"
}
Success-Response:
HTTP/1.1 200 OK
1234
excluirCliente - excluirCliente
Exclui um cliente com base no id

DELETE
https://apiintegracao.milvus.com.br/api/cliente/excluir/:id
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Success-Response:
HTTP/1.1 204 OK
pesquisarContatos - pesquisarContatos
Busca todos os contatos que tenham o parametro informado na pesquisa

GET
https://apiintegracao.milvus.com.br/api/cliente/contato/pesquisar
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Parâmetro
Campo	Tipo	Descrição
telefoneopcional	String	
** Para perquisar por telefone **

Valores permitidos: "(11) 12345-6789"

emailopcional	String	
** Para perquisar por Email **

Valores permitidos: "teste@hotmail.com"

Success-Response:
HTTP/1.1 200 OK
[
    {
        "cliente_nome": "Milvus",
        "cliente_id": "ABC123",
        "contato_descricao": "Milvus",
        "contato_email": "contato@milvus.com.br",
        "observacao": "Milvus",
        "contato_telefone": "11123456789",
        "contato_celular": "11123456789"
    }
]
Dispositivos
buscaLogsPorDispositivo - buscaLogsPorDispositivo
Lista todas as logs do dispositivo

GET
https://apiintegracao.milvus.com.br/api/dispositivos/logs/{dispositivo_id}
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token.

Parâmetro
Campo	Tipo	Descrição
is_paginateopcional	Boolean	
** Se não informado o padrão é true **

Valores permitidos: true, false

is_descendingopcional	Boolean	
** Se não informado o padrão é false **

Valores permitidos: true, false

order_byopcional	String	
** Se não informado o padrão é descricao **

Valores permitidos: "id", "nome"

total_registrosopcional	Integer	
** Se não informado o padrão é 50 **

Valores permitidos: 50, 100

paginaopcional	Integer	
** Se não informado o padrão é 1 **

Valores permitidos: 1, 2

Success-Response:
HTTP/1.1 200 OK
{
    "meta": {
        "paginate": {
            "current_page": 1,
            "total": 2,
            "to": 1,
            "from": 1,
            "last_page": 2,
            "per_page": "1"
        }
    },
    "lista": [
        {
            "data_criacao": "2020-05-27T14:45:39.218Z",
            "log": "A licença do sistema operacional foi alterada de [] para [W269N-WFGWX-YVC9B-4J6C9-T83GX]"
        }
    ]
}
buscarDispositivo - buscarDispositivo
Busca os dispositivos por patrimonio, serial, id e cliente

GET
https://apiintegracao.milvus.com.br/api/dispositivos/buscar
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token.

Parâmetro
Campo	Tipo	Descrição
idopcional	String	
** Filtra por ID de dispositivo

Valores permitidos: 142

clienteopcional	String	
** Filtra por cliente

Valores permitidos: 1456

patrimonioopcional	String	
** Filtra por patrimonio

Valores permitidos: PR1234

serialopcional	String	
** Filtra por serial

Valores permitidos: SR1234

Success-Response:
HTTP/1.1 200 OK
criaDispositivo - criaDispositivo
Cria dispositivo

POST
https://apiintegracao.milvus.com.br/api/dispositivos/
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Request-Example:
{
    "--CAMPOS OBRIGATÓRIOS--": {},
    "apelido": "Computador X",
    "cliente_id": 1456,
    "hostname": "ASU-45000",
    "tipo_dispositivo_id": 2,
    "--CAMPOS OPCIONAIS--": {},
    "armazenamento": null,
    "arquitetura_sistema_operacional": null,
    "cod_tercerizada": null,
    "cpu_usage": null,
    "data_compra": "2020-04-16T00:00:00.000Z",
    "data_exclusao": null,
    "data_garantia": "2020-04-30T00:00:00.000Z",
    "dispositivo_locado_id": null,
    "dominio": null,
    "fabricante": "teste",
    "firewall_ativo": null,
    "gps_latitude": null,
    "gps_longitude": null,
    "grupo_dispositivo_id": null,
    "ip_externo": null,
    "ip_interno": "192.168.0.149",
    "is_agent": false,
    "is_ativo": true,
    "is_gerenciavel": false,
    "is_locado": false,
    "is_nobreak": false,
    "is_notebook": false,
    "is_servidor": false,
    "is_tablet": false,
    "is_usb": false,
    "is_vm": false,
    "is_wireless": false,
    "localizacao": "Escritorio",
    "macaddres": "12:34:12:54:45:12",
    "marca": "ASU",
    "mobile_bateria_porcentagem": null,
    "mobile_bateria_temperatura": null,
    "mobile_blueetooth_nome": null,
    "mobile_blueetooth_status": null,
    "mobile_bssid": null,
    "mobile_conexao_movel": null,
    "mobile_dhcp_server": null,
    "mobile_dns_primario": null,
    "mobile_dns_secundario": null,
    "mobile_fabricante": null,
    "mobile_gateway": null,
    "mobile_hardware": null,
    "mobile_ip": null,
    "mobile_is_dual_chip": false,
    "mobile_is_tablet": false,
    "mobile_is_view_block_app": null,
    "mobile_macaddress": null,
    "mobile_memoria_disponivel": null,
    "mobile_memoria_total": null,
    "mobile_memoria_utilizada": null,
    "mobile_modelo": null,
    "mobile_netmask": null,
    "mobile_numero_sim1": null,
    "mobile_numero_sim2": null,
    "mobile_processador": null,
    "mobile_roaming": null,
    "mobile_serial": null,
    "mobile_sim1_correiodevoz": null,
    "mobile_sim1_imei": null,
    "mobile_sim1_is_ativo": false,
    "mobile_sim1_is_roaming": false,
    "mobile_sim1_iso": null,
    "mobile_sim1_operadora": null,
    "mobile_sim1_rede": null,
    "mobile_sim2_correiodevoz": null,
    "mobile_sim2_imei": null,
    "mobile_sim2_is_ativo": false,
    "mobile_sim2_is_roaming": false,
    "mobile_sim2_iso": null,
    "mobile_sim2_operadora": null,
    "mobile_sim2_rede": null,
    "mobile_ssid": null,
    "mobile_storage_externo_disponivel": null,
    "mobile_storage_externo_total": null,
    "mobile_storage_externo_utilizado": null,
    "mobile_storage_interno_disponivel": null,
    "mobile_storage_interno_total": null,
    "mobile_storage_interno_utilizado": null,
    "mobile_sync_tempo": null,
    "mobile_sync_tipo": null,
    "mobile_tecnologia_transmissao": null,
    "mobile_versao_android": null,
    "mobile_versao_firmware": null,
    "mobile_versao_ios": null,
    "mobile_versao_windows_phone": null,
    "mobile_view_inventario": null,
    "mobile_view_novo_chamado": null,
    "mobile_wifi_status": null,
    "modelo": null,
    "modelo_notebook": null,
    "nobreak_id": 708,
    "numero_serial": "1234",
    "numero_serie_bateria": "123",
    "numero_telefone": null,
    "observacao": null,
    "patrimonio": null,
    "periferico_rede_id": null,
    "placa_mae": null,
    "placa_mae_modelo": null,
    "placa_mae_product": "",
    "placa_mae_serial": null,
    "porta_sip": null,
    "portas_rtp": null,
    "possui_antivirus": false,
    "possui_display": false,
    "potencia": "4500w",
    "processador": null,
    "proxy_endereco": null,
    "proxy_porta": null,
    "proxy_senha": null,
    "proxy_usuario": null,
    "qtd_portas": null,
    "ram_total": null,
    "ram_usage": null,
    "ramal": null,
    "rede": null,
    "senha": null,
    "servidor_voip": null,
    "sistema_operacional": "Windows",
    "sistema_operacional_atualizado": null,
    "sistema_operacional_disco": null,
    "sistema_operacional_licenca": null,
    "sistema_operacional_servicepack": null,
    "sistema_operacional_versao_build": null,
    "status_vulnerabilidade_id": null,
    "teamviewer_id": null,
    "temperatura_cpu": null,
    "tempo_de_troca_bateria": "12",
    "TipoNobreak_id": null,
    "TipoPerifericoRede": null,
    "TipoPerifericoRedeVelocidade": null,
    "total_alertas": 0,
    "total_maximo_slots": null,
    "total_processadores": null,
    "update_ativo": null,
    "usuario": null,
    "usuario_logado": null,
    "versao_client": null,
    "voltagem_entrada": null,
    "voltagem_saida": null,
    "wireless_senha": null,
    "wireless_ssid": null
}
Success-Response:
HTTP/1.1 200 OK
{
  dispositivo_id: 626
}
editarDispositivo - editarDispositivo
Edita dispositivo

PUT
https://apiintegracao.milvus.com.br/api/dispositivos/
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Request-Example:
{
    "id": 626,
    "cliente_id": 1456,
    "grupo_dispositivo_id": null,
    "hostname": "ASU-45000",
    "ip_interno": "192.168.0.149",
    "mobile_is_tablet": false,
    "ip_externo": null,
    "cpu_usage": null,
    "is_vm": false,
    "dominio": null,
    "sistema_operacional": "",
    "sistema_operacional_licenca": null,
    "sistema_operacional_servicepack": null,
    "ram_total": null,
    "ram_usage": null,
    "placa_mae": null,
    "placa_mae_serial": null,
    "processador": null,
    "macaddres": "12:34:12:54:45:12",
    "versao_client": null,
    "temperatura_cpu": null,
    "observacao": null,
    "is_servidor": false,
    "teamviewer_id": null,
    "is_ativo": true,
    "is_tablet": false,
    "gps_latitude": null,
    "gps_longitude": null,
    "mobile_sync_tipo": null,
    "mobile_sync_tempo": null,
    "mobile_bateria_porcentagem": null,
    "mobile_bateria_temperatura": null,
    "mobile_versao_android": null,
    "mobile_versao_ios": null,
    "mobile_versao_windows_phone": null,
    "mobile_fabricante": null,
    "mobile_modelo": null,
    "mobile_processador": null,
    "mobile_versao_firmware": null,
    "mobile_hardware": null,
    "mobile_serial": null,
    "mobile_macaddress": null,
    "mobile_ip": null,
    "mobile_gateway": null,
    "mobile_netmask": null,
    "mobile_dhcp_server": null,
    "mobile_dns_primario": null,
    "mobile_dns_secundario": null,
    "mobile_conexao_movel": null,
    "mobile_ssid": null,
    "mobile_bssid": null,
    "mobile_blueetooth_nome": null,
    "mobile_memoria_total": null,
    "mobile_memoria_utilizada": null,
    "mobile_memoria_disponivel": null,
    "mobile_storage_interno_total": null,
    "mobile_storage_interno_utilizado": null,
    "mobile_storage_interno_disponivel": null,
    "mobile_storage_externo_total": null,
    "mobile_storage_externo_utilizado": null,
    "mobile_storage_externo_disponivel": null,
    "mobile_is_dual_chip": false,
    "mobile_sim1_is_ativo": false,
    "mobile_sim2_is_ativo": false,
    "mobile_sim1_operadora": null,
    "mobile_sim2_operadora": null,
    "mobile_sim1_imei": null,
    "mobile_sim2_imei": null,
    "mobile_sim1_rede": null,
    "mobile_sim2_rede": null,
    "mobile_sim1_iso": null,
    "mobile_sim2_iso": null,
    "mobile_tecnologia_transmissao": null,
    "mobile_roaming": null,
    "mobile_numero_sim1": null,
    "mobile_numero_sim2": null,
    "mobile_sim1_correiodevoz": null,
    "mobile_sim2_correiodevoz": null,
    "mobile_sim1_is_roaming": false,
    "mobile_sim2_is_roaming": false,
    "mobile_wifi_status": null,
    "mobile_blueetooth_status": null,
    "mobile_view_novo_chamado": null,
    "mobile_view_inventario": null,
    "mobile_is_view_block_app": null,
    "usuario_logado": null,
    "apelido": "ASU-45000",
    "is_agent": false,
    "total_processadores": null,
    "arquitetura_sistema_operacional": null,
    "data_exclusao": null,
    "possui_antivirus": false,
    "numero_serial": "1234",
    "proxy_endereco": null,
    "proxy_porta": null,
    "proxy_usuario": null,
    "proxy_senha": null,
    "sistema_operacional_versao_build": null,
    "sistema_operacional_disco": null,
    "is_notebook": false,
    "total_alertas": 0,
    "placa_mae_product": "",
    "total_maximo_slots": null,
    "placa_mae_modelo": null,
    "data_compra": "2020-04-16T00:00:00.000Z",
    "data_garantia": "2020-04-30T00:00:00.000Z",
    "modelo_notebook": null,
    "nobreak_id": 708,
    "localizacao": "Escritorio",
    "TipoNobreak_id": 2,
    "is_nobreak": true,
    "potencia": "4500w",
    "voltagem_entrada": "220",
    "voltagem_saida": "127",
    "fabricante": "teste",
    "numero_serie_bateria": "123",
    "tempo_de_troca_bateria": "12",
    "periferico_rede_id": null,
    "is_wireless": false,
    "wireless_ssid": null,
    "wireless_senha": null,
    "is_usb": false,
    "patrimonio": null,
    "marca": "ASU",
    "modelo": null,
    "cod_tercerizada": null,
    "rede": null,
    "qtd_portas": null,
    "TipoPerifericoRedeVelocidade": null,
    "TipoPerifericoRede": null,
    "is_gerenciavel": false,
    "armazenamento": null,
    "dispositivo_locado_id": null,
    "is_locado": false,
    "firewall_ativo": null,
    "sistema_operacional_atualizado": null,
    "status_vulnerabilidade_id": null,
    "tipo_dispositivo_id": 5,
    "porta_sip": null,
    "servidor_voip": null,
    "numero_telefone": null,
    "ramal": null,
    "possui_display": false,
    "portas_rtp": null,
    "usuario": null,
    "senha": null,
    "update_ativo": null
}
Success-Response:
HTTP/1.1 200 OK
"Dispositivo atualizado com sucesso"
excluirDispositivo - excluirDispositivo
Deleta um dispositivo e suas dependências

DELETE
https://apiintegracao.milvus.com.br/api/dispositivos/{id}
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token.

Success-Response:
HTTP/1.1 200 OK
"Dispositivo excluido"
listagemDispositivos - listagemDispositivos
Lista dispositivos

POST
https://apiintegracao.milvus.com.br/api/dispositivos/listagem
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Parâmetro
Campo	Tipo	Descrição
is_paginateopcional	Boolean	
** Se não informado o padrão é true **

Valores permitidos: true, false

is_descendingopcional	Boolean	
** Se não informado o padrão é false **

Valores permitidos: true, false

order_byopcional	String	
** Se não informado o padrão é descricao **

Valores permitidos: "id", "nome"

total_registrosopcional	Integer	
** Se não informado o padrão é 50 e o limite máximo é de 1000 registros por requisição **

Valores permitidos: 50, 100

paginaopcional	Integer	
** Se não informado o padrão é 1 **

Valores permitidos: 1, 2

Request-Example:
{
    "filtro_body": {
        "tipo_dispositivo_id": 1,
        "hostname": "teste",
        "apelido": "teste",
        "ip_interno": 10.0.0.1,
        "ip_externo": 200.201.8.125,
        "macaddress": "te:st:et:es:te",
        "usuario_logado": "teste",
        "data_criacao": "19/05/2020"
    }
}
Success-Response:
{
    "meta": {
        "paginate": {
            "current_page": 1,
            "total": 95,
            "to": 1,
            "from": 1,
            "last_page": 95,
            "per_page": "1"
        }
    },
    "lista": [
        {
            "id": 276417,
            "hostname": "PHILIPS-TV",
            "apelido": null,
            "ip_interno": "192.168.0.108",
            "macaddres": "5C:C9:D3:8F:93:15",
            "marca": null,
            "fabricante": null,
            "is_ativo": true,
            "data_criacao": "2020-05-27T17:44:25.000Z",
            "ip_externo": "170.80.86.83",
            "data_ultima_atualizacao": "2020-05-27T17:50:55.000Z",
            "dominio": "",
            "sistema_operacional": "Microsoft Windows 10 Pro",
            "sistema_operacional_licenca": "W269N-WFGWX-YVC9B-4J6C9-T83GX",
            "placa_mae": "Acer",
            "placa_mae_serial": "NXGMFAL006748855889501",
            "processador": "Intel(R) Core(TM) i3-6006U CPU @ 2.00GHz",
            "versao_client": "78.64.57.66",
            "observacao": null,
            "usuario_logado": "Matheus Cassimiro",
            "total_processadores": 2,
            "numero_serial": "NXGMFAL006748855889501",
            "placa_mae_modelo": "",
            "data_compra": null,
            "data_garantia": null,
            "modelo_notebook": "Aspire ES1-572",
            "nome_fantasia": "111 Sem Endereço",
            "tipo_dispositivo_text": "Notebook",
            "tipo_dispositivo_icone": "mdi mdi-laptop-windows"
        }
    ]
}
listarTipoDispositivo - listarTipoDispositivo
Lista os tipos de dispositivo

GET
https://apiintegracao.milvus.com.br/api/dispositivos/lista/tipo-dispositivo
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token.

Success-Response:
HTTP/1.1 200 OK
  {
  "lista": [
      {
        "id": 34,
        "descricao": "SMART TV"
      },
      {
      "id": 35,
      "descricao": "setsetset"
      },
      {
      "id": 40,
      "descricao": "NET"
      }  
      ]
  }
obterStatus - obterStatus
Obtem o status do dispositivo (Online/Offline)

GET
https://apiintegracao.milvus.com.br/api/dispositivos/status/{dispositivo_id}
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token.

Success-Response:
HTTP/1.1 200 OK
{
    "hostname": "PHILIPS-TV",
    "status": "Offline"
}
softwaresDispositivos - softwaresDispositivos
Lista softwares instalados dispositivo

GET
https://apiintegracao.milvus.com.br/api/dispositivos/softwares/{dispositivo_id}
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Parâmetro
Campo	Tipo	Descrição
is_paginateopcional	Boolean	
** Se não informado o padrão é true **

Valores permitidos: true, false

is_descendingopcional	Boolean	
** Se não informado o padrão é false **

Valores permitidos: true, false

order_byopcional	String	
** Se não informado o padrão é descricao **

Valores permitidos: "id", "nome"

total_registrosopcional	Integer	
** Se não informado o padrão é 50 **

Valores permitidos: 50, 100

paginaopcional	Integer	
** Se não informado o padrão é 1 **

Valores permitidos: 1, 2

Success-Response:
{
    "meta": {
        "paginate": {
            "current_page": 1,
            "total": 61,
            "to": 1,
            "from": 1,
            "last_page": 61,
            "per_page": "1"
        }
    },
    "lista": [
        {
            "key_licenca": "Não encontrada",
            "chaveRegistro": "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\7-Zip",
            "software_geral_id": 85893,
            "versao": "19.00",
            "descricao": "7-Zip 19.00 (x64)",
            "empresa": "Igor Pavlov"
        }
    ]
}
Relatorio Atendimentos
exportarRelatorioAtendimentoArquivos - exportarRelatorioAtendimentoArquivos
Exportação de relatorios de atendimentos para xls ou csv

POST
https://apiintegracao.milvus.com.br/api/relatorio-atendimento/exporta
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Request-Example:
{
 "filtro_body": {
   "nome_tecnico": "teste",
   "data_inicial": "2022-06-13",
   "data_final": "2022-07-13",
   "codigo": "",
   "tipo_arquivo": "csv"
   "token": "AASSYY"
 }
}

"--EXEMPLOS PARA PREENCHER OS CAMPOS--"
"codigo": {"codigo do ticket"}
"token": {"token do cliente"}
Success-Response:
HTTP/1.1 200 OK
relatorioAtendimentoListagem - relatorioAtendimentoListagem
Relatorio listagem de atendimentos - via integração

POST
https://apiintegracao.milvus.com.br/api/relatorio-atendimento/listagem
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Parâmetro
Campo	Tipo	Descrição
is_descendingopcional	Boolean	
** A opção true ordenará do maior para o menor e false ao contrário, o padrão é true (Decresente) **

Valores permitidos: true, false

total_registrosopcional	Integer	
** Se não informado o padrão é 50 e o limite máximo é de 1000 registros por requisição **

Valores permitidos: 50, 100, 200

paginaopcional	Integer	
** Se não informado o padrão é 1 **

Valores permitidos: 1, 2

Request-Example:
{
  "filtro_body":{
    "data_inicial":"2022-03-01",
    "data_final":"2022-03-01",
    "token": "O5NHAA",
    "is_externo": true,
    "is_comercial": true,
    "motivo_pausa": "teste"
    "codigo": 5353,
    "nome_tecnico": "teste",
    "nome_mesa": "mesa padrao"
  }
}

"-- EXEMPLOS PARA PREENCHIMENTO DOS CAMPOS --"
"codigo": {"codigo do ticket"}
"token": {"token do cliente"}

"-- EXEMPLOS PARA PREENCHIMENTO DOS CAMPOS --"
"codigo": {"codigo do ticket"}
"token": {"token do cliente"}}
Success-Response:
HTTP/1.1 200 OK
{
   "meta":{
      "paginate":{
         "current_page":"1",
         "total":1,
         "to":10,
         "from":1,
         "last_page":1,
         "per_page":"10"
      }
   },
   "lista":[
      {
         "id":830606,
         "codigo":7391,
         "assunto":"teste de consulta",
         "nome_fantasia":"A. PRATES - COMBUSTIVEIS - EIRELI",
         "nome":"Cassiano",
         "sobrenome":"Oliveira",
         "data_inicial":"2022-03-21 19:48:15",
         "data_final":"2022-03-22 13:21:14",
         "tipo_hora":"Atendimento",
         "is_externo":false,
         "tecnico":"Cassiano Oliveira",
         "total_horas_atendimento":"07:10",
         "descricao":null,
         "is_comercial":true,
         "contato":"Contato 1",
         "mesa_trabalho":{
            "id":8740,
            "text":"Mesa Padrão"
         },
         "tipo_chamado":{
            "id":null,
            "text":"Não possui"
         },
         "categoria_primaria":{
            "id":null,
            "text":"Não possui"
         },
         "categoria_secundaria":{
            "id":null,
            "text":"Não possui"
         },
         "status":{
            "id":4,
            "text":"Finalizado"
         },
         "data_criacao":"2022-03-21 11:37:08",
         "data_solucao":"2022-03-22 13:21:14",
         "setor":{
            "id":null,
            "text":"Não possui"
         },
         "motivo_pausa":{
            "text":"Não possui"
         },
         "data_saida":null,
         "data_chegada":null
      }
   ],
   "resumo":{
      "total_chamados":1,
      "total_horas":"00:00",
      "total_horas_expediente":"07:10",
      "total_horas_fora_expediente":"00:00",
      "total_horas_atendimento":"07:10",
      "total_horas_internas":"07:10",
      "total_horas_externas":"00:00"
   }
}
Relatorio Personalizado
exportarRelatorio - exportarRelatorio
Exporta o relatorio personalizado por tipo

POST
https://apiintegracao.milvus.com.br/api/relatorio-personalizado/exportar
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token de autenticação.

Request-Example:
{
    "nome": "Relatorio Teste",
    "tipo": "csv"
}
Success-Response:
HTTP/1.1 200 OK
UsuarioCliente
Atualizar - Atualizar
Altera um usuario cliente existente

PUT
https://apiintegracao.milvus.com.br/api/usuario-cliente
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token.

Request-Example:
{
   "usuarioCliente" : {
       "--CAMPOS OBRIGATÓRIOS--":"{}",
       "id":1

       "CAMPOS OPCIONAIS--":"{}",
       "nome": "Teste 1",
       "sobrenome": "Teste 1",
       "password": "teste",
       "setor": "Financeiro"
       "perfil": "CEO || Gestor || Colaborador || DPO",
       "status": "Ativo || Inativo"
    }   	
}
Success-Response:
HTTP/1.1 200 OK
Criar - Criar
Grava um novo Usuario Cliente

POST
https://apiintegracao.milvus.com.br/api/usuario-cliente
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token.

Request-Example:
{
   "usuarioCliente" : {
       "--CAMPOS OBRIGATÓRIOS--":"{}",
       "cliente_token": "3MENJ7" OU "cliente_nome": "Milvus",
       "perfil": "CEO || Gestor || Colaborador || DPO",
       "nome": "Teste 1",
       "username": "teste@teste.com",
       "password"   : "teste",

       "CAMPOS OPCIONAIS--":"{}",
       "sobrenome"  : "Teste 1",
       "observacao"   : "teste2",
       "setor": "Financeiro"
   }   	
}
Success-Response:
HTTP/1.1 200 OK
Excluir - Excluir
Exclui um usuario cliente existente por id

DELETE
https://apiintegracao.milvus.com.br/api/usuario-cliente/{usuario_id}
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token.

Success-Response:
HTTP/1.1 204 OK
importarUsuariosCliente - importarUsuariosCliente
Utiliza um arquivo csv para importar os usuarios clientes para o Milvus

POST
https://apiintegracao.milvus.com.br/api/usuario-cliente/importar/{delimitador}
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token.

Request-Example:
{
     "DOWNLOAD CSV EXEMPLO--":"{}",
https://milvus-files.s3.sa-east-1.amazonaws.com/producao/empresa8214/documentosdiversos/20210527195936_ImportacaoCliente.csv
     
     "cliente_nome": "MILVUS" OU "cliente_token": "3MENJ7"
     "nome": "teste"
     "sobrenome": "teste",
     "email": "teste@teste.com",
     "senha": "@Mudar123",
     "perfil": "CEO",
     "setor": "teste",
     "situacao": "Ativo"
}
Success-Response:
HTTP/1.1 200 OK
listarUsuarios - listarUsuarios
Lista todos usuarios com base no filtro

POST
https://apiintegracao.milvus.com.br/api/usuario-cliente/listar
Header
Campo	Tipo	Descrição
Authorization	String	
Obrigatorio o uso do token.

Parâmetro
Campo	Tipo	Descrição
is_descendingopcional	Boolean	
** Se não informado o padrão é false **

Valores permitidos: true, false

order_byopcional	String	
** Se não informado o padrão é nome **

Valores permitidos: "nome", "email", "perfil", "cliente_nome", "cliente_token", "status"

total_registrosopcional	Integer	
** Se não informado o padrão é 50 e o limite máximo é de 1000 registros por requisição **

Valores permitidos: 50, 100, 1000

paginaopcional	Integer	
** Se não informado o padrão é 1 **

Valores permitidos: 1, 2

Request-Example:
{
    "filtro_body": {
        "nome": "",
        "email": "",
        "perfil": "",
        "cliente_nome": "",
        "cliente_token": "",
        "status": ""
    }
}
Success-Response:
HTTP/1.1 200 OK
{
    "meta": {
      "paginate": {
        "current_page": 1,
        "total": 13,
        "to": 50,
        "from": 1,
        "last_page": 1,
        "per_page": 50
      }
    },
    "lista": [
      {
        "id": 100,
        "nome": "Nome",
        "sobrenome": "sobrenome",
        "status": "Inativo",
        "cliente_nome": "Milvus TI",
        "cliente_token": "3MENJ7",
        "perfil": "CEO",
        "email": "email@teste.com"
      }
  ]
}