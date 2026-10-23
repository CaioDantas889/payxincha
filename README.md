# Paychinxa

Landing de vendas em português com cadastro de CPF/CNPJ, acompanhamento individual e painel administrativo. Implementada em React/Vinext, hospedada em Sites, com banco D1.

## Conteúdo e operação
- `app/landing.tsx` e `public/sales.css`: campanha 90% OFF, preço de R$ 99,00 por R$ 9,90 à vista, taxas, bandeiras e botões de compra. Sem formulário na landing.
- `/checkout`: resumo do pedido e cadastro separado em três etapas. Envia ao mesmo banco e painel. Não processa pagamentos; contratação e frete são confirmados após análise.
- `lib/sales-content.ts`: preços confirmados e depoimentos autorizados. A lista de depoimentos está vazia até o responsável fornecer relatos reais. Enquanto isso, a seção convida clientes a enviarem feedback pelo WhatsApp; publicação somente com autorização.
- `components/product-motion.tsx`: animação leve do produto em CSS, com pausa e respeito a movimento reduzido; sem arquivo GIF pesado.
- `components/customer-registration.tsx`: cadastro em três etapas, com os campos solicitados pelo cliente.
- `/admin`: acesso por e-mail e senha própria do painel, independente do ChatGPT e da senha do Gmail. A conta principal é caioalves0807@gmail.com. Lista, busca, filtros, detalhes, resposta pública, notas internas, exclusão e decisões Apto / Não apto / Em análise.
- `/acompanhar`: consulta por chave aleatória no fragmento do link. Mostra somente protocolo, status e resposta. Não expõe dados pessoais nem notas internas.
- `app/api`: envio validado no servidor, consultas e atualização com controle de versão para impedir decisões concorrentes.
- `drizzle/`: migrações versionadas; a segunda acrescenta os novos campos sem apagar cadastros existentes.

O cadastro vai ao banco de dados. Não há API do WhatsApp, disparo de mensagem, SMS ou e-mail automático. Os links de atendimento abrem uma conversa com +55 88 8223-1738. O administrador registra manualmente a análise; não existe decisão automática de elegibilidade. CPF, nascimento, mãe e endereço são retornados somente no detalhe autenticado.

Dados pessoais não são gravados no armazenamento do navegador. A chave de acompanhamento fica em memória durante o envio e é devolvida ao usuário no link. Reenvios com a mesma chave são idempotentes. Guarde o link após o cadastro.

## Oferta
Oferta corrigida e confirmada pelo cliente em 18/10/2026: preço original R$ 99,00, desconto R$ 89,10 (90%), preço final R$ 9,90 à vista. Substitui a campanha anterior de 99%. Frete e prazo por CEP sob consulta. Taxas de cartão transcritas da imagem P4.jpeg (Tabela Newblack — Máquina), com recebimento em 1 dia, antecipação de 1,58% a.m. no parcelamento e crédito 1x sem antecipação. O custo Pix de 0,79% na fonte não é apresentado como taxa ao cliente, pois a própria tabela informa que a taxa final ainda não foi definida. Aprovação e condições são confirmadas antes da contratação. Imagens ilustrativas geradas a partir do produto de referência.

## Design
Referência principal da repaginação: https://www.ton.com.br/ — fotografia de comerciante com produto, título de campanha forte, selo de oferta e CTA direto. Identidade própria Paychinxa, verde claro e verde escuro, fonte Inter local. Sem copiar taxas, depoimentos ou condições da Ton. Preserva formulário e painel como caminho de conversão.

## Desenvolvimento
Node >= 22.13.0. Instalação: `npm run install:ci`. Desenvolvimento: `npm run dev`. Build: `npm run build`.
No Windows, se o iniciador npm falhar ao resolver seu diretório, execute o mesmo build por `node scripts/run-framework.mjs build`.
Verificações: `node node_modules/typescript/bin/tsc --noEmit` e `node --experimental-strip-types --test tests/*.test.ts`.
Geração de migrações: `node node_modules/drizzle-kit/bin.cjs generate`.

A identidade ChatGPT do starter não concede acesso ao painel. Os endpoints administrativos exigem uma sessão própria válida, com conta ativa; alterações também exigem origem correta e proteção CSRF. A audiência pública da landing permanece preservada.

## Login e equipe administrativa

A conta principal é ativada uma única vez em `/admin/configurar#TOKEN`, por um link privado com prazo de 24 horas. O responsável escolhe a própria senha, com 15 a 128 caracteres. Não existe senha padrão ou cadastro público de administradores.

Depois de entrar, abra **Administradores → Adicionar administrador**, informe nome/e-mail e confirme com sua senha. O painel gera um link individual em `/admin/ativar#TOKEN`, de uso único e válido por 24 horas. Compartilhe diretamente com o destinatário; o sistema não envia e-mail. O destinatário define sua própria senha. O link é uma credencial: sua posse permite ativar a conta e não comprova a titularidade do endereço de e-mail.

Somente o administrador principal gerencia a equipe. Administradores comuns analisam e excluem cadastros. Desativação e recuperação invalidam as sessões existentes. **Novo acesso** revoga a senha anterior e gera outro convite; **Minha senha** exige a senha atual. A conta principal não pode ser desativada pelo painel. Se perder a senha principal, será necessária manutenção pela pessoa responsável pela hospedagem; não há recuperação automática por e-mail nem autenticação em dois fatores nesta versão.

Os segredos de ativação são configurados no ambiente da hospedagem: `ADMIN_SETUP_HASH` (SHA-256 de um token aleatório de 32 bytes) e `ADMIN_SETUP_EXPIRES` (prazo Unix em milissegundos). O token bruto não é armazenado no banco ou no Git. Depois da criação da conta principal, o link não pode ser reutilizado, mesmo antes do prazo. Nenhum segredo deve ser colocado no arquivo de configuração versionado.

Senhas usam scrypt N=32768, r=8, p=3, salt individual e comparação sem saída antecipada. Sessões usam tokens aleatórios armazenados por hash, cookies HttpOnly/Secure/SameSite=Strict, prazo absoluto de 8 horas e 30 minutos sem atividade. Login e confirmação de senha têm limites de tentativas no banco. Referências: [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) e [noble-hashes](https://github.com/paulmillr/noble-hashes).

O histórico registra entradas, alterações de acesso, consultas, análises e exclusões. Não registra senhas, tokens brutos ou uma cópia dos dados pessoais do cadastro. A migração `0003_acoustic_thundra.sql` adiciona as tabelas de autenticação sem apagar os pedidos anteriores.

## Acompanhamento e exclusão

O botão **Acompanhar pedido**, no cabeçalho em computador e celular, abre `/acompanhar`. O cliente pode colar o código aleatório de 64 caracteres ou seu link individual. A confirmação do cadastro permite visualizar e copiar ambos. O protocolo PX é apenas uma referência e não concede acesso. Links antigos continuam compatíveis.

No painel, abra **Analisar → Excluir cadastro**, digite o protocolo e confirme. A exclusão autenticada remove o cadastro e suas análises do banco ativo, em transação, com proteção contra versão desatualizada. O registro mínimo em `deletion_events` mantém somente identificador interno, administrador e data. Não há lixeira; cópias de segurança anteriores precisam seguir a política de retenção. A migração `0002_safe_stingray.sql` cria o registro de exclusões sem modificar cadastros existentes.

## Hospedagem
Produção principal: https://paychinxa.com.br, em contêiner próprio na VPS, atrás do Traefik/EasyPanel. O volume nomeado `payxincha_data` preserva o D1 local entre rebuilds e as migrações pendentes são aplicadas ao iniciar. Os segredos do painel ficam em `.dev.vars`, montado somente em execução e ignorado pelo Git.

Configure `PUBLIC_ORIGIN=https://paychinxa.com.br` em `.dev.vars`: o proxy termina o HTTPS e encaminha HTTP ao contêiner; cadastro, acompanhamento e autenticação validam a origem pública configurada. `www.paychinxa.com.br` e o endereço temporário `payxincha.simulapay.online` redirecionam para o domínio principal, preservando o caminho.

Publicação em 20/10/2026: corrigido o domínio nas regras do Traefik (antes estava `payxincha.com.br`), emitidos certificados Let's Encrypt e preservado o volume existente. Backup anterior à alteração em `/opt/backups/payxincha/20261020-domain/`, com banco e configurações privadas. Para atualizar, execute `docker compose build app` e `docker compose up -d --no-build app` em `/opt/payxincha`, após fazer backup. Não remova o volume. Arquivos `.dev.vars*` e links privados de ativação são excluídos também do contexto Docker.

Validação desta publicação: 22 testes automatizados e TypeScript aprovados; build Docker concluído. Pelo HTTPS público, foram verificados as quatro páginas principais, redirecionamentos, bloqueio de outras origens, proteção do painel, cadastro técnico, reenvio idempotente e acompanhamento sem dados pessoais. O cadastro técnico foi removido após o teste. A conta principal aguarda o responsável definir sua senha pelo link privado de ativação; o fluxo autenticado do painel não foi testado com uma conta de produção.

O projeto Sites original (`appgprj_6ace62b019b881918da6fa593079d8eb`) continua disponível como origem histórica em https://payxincha.paleridge2.chatgpt.site. Seu D1 é independente do banco da VPS; nenhuma cópia de dados entre as duas hospedagens é feita automaticamente.

## Comparação de taxas e feedback
A seção após a primeira dobra compara a tabela Visa/Mastercard da Paychinxa com os planos PagBank Super Max e Essencial após a promoção, consultados em 19/10/2026. Inclui print oficial, fonte, regras promocionais e diferentes prazos de recebimento. O simulador calcula apenas diferenças nas taxas do crédito à vista. Novos valores devem ser conferidos antes de atualizar lib/rate-comparison.ts. Não há depoimentos fictícios.

## Atualização pelo Windows

Abra `Atualizar-Paychinxa.bat` no projeto ou `07-DEPLOY-PAYCHINXA.bat` em `Área de Trabalho/Comandos Deploy VPS` e digite `DEPLOY`. O iniciador executa pull com avanço direto na cópia local, checagem TypeScript e testes, depois pull na VPS, backup, build Docker e publicação somente do Paychinxa. Interrompe se houver alterações rastreadas locais, divergência de histórico, outro deploy em andamento ou falha de validação. Arquivos não rastreados não são publicados.

O SSH usa a chave já instalada para `root@72.60.51.248`, sem senhas no BAT. São necessários Git, Node.js >= 22.13, npm e OpenSSH. Backups ficam em `/opt/backups/payxincha/AAAAMMDD-HHMMSS/`: código anterior, configuração privada, volume consistente e checksums. O build acontece antes da breve parada para copiar o banco. O volume `payxincha_data` é mantido, e o processo confere saúde, HTTPS, páginas e proteção das APIs antes de informar sucesso. Em caso de falha, o backup é mantido; restauração de banco exige manutenção explícita.

Para validar apenas a sintaxe remota, sem pull ou deploy: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/deploy-paychinxa.ps1 -ValidateOnly`. A opção `-NoConfirm` permite execução previamente autorizada sem a pergunta interativa. O processo não faz commit ou push de alterações locais.

## Fluxo atual — checkout Ticto (23/10/2026)
O site público agora é somente a landing de vendas. Todos os botões Comprar maquininha apontam diretamente para https://payment.ticto.app/OA0F493FD (constante em lib/checkout.ts), na mesma aba. A antiga rota /checkout redireciona com HTTP 307, e links antigos /#cadastro também seguem para a Ticto. Não há repasse automático de dados pessoais nem parâmetros de cadastro no link.

Removidos os acessos ao painel e acompanhamento da navegação da landing. A FAQ, as etapas de compra e o aviso de privacidade refletem o checkout externo. POST /api/solicitacoes retorna 410 sem ler ou gravar dados. Banco, painel autenticado e acompanhamento de registros históricos foram preservados para não perder pedidos antigos; as seções anteriores deste documento sobre cadastro interno descrevem esse legado, não o fluxo comercial atual. Novas compras são feitas na Ticto e não entram nesse painel legado. Não foi criada integração de pedidos ou webhook.

Conferência do destino: R$9,90 à vista. O checkout externo informa preço anterior R$147,00, diferente dos R$99,00 confirmados pelo responsável para a landing. Essa divergência foi comunicada; o preço da landing não foi alterado sem nova confirmação.
