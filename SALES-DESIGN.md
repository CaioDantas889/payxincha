# Conversão da landing — 18/10/2026

## Referência e direção bloqueada
Implementação direta sobre a página Payxincha existente, capturada no navegador. Preservar Inter, verde escuro #122b20, verde promocional #c4f75a, canvas branco, fotografia do comerciante, máquina amarela e componentes arredondados. Ton (https://www.ton.com.br/) orienta oferta → taxas/bandeiras → compra. Square Terminal (https://squareup.com/us/en/hardware/terminal) contribui somente com apresentação de hardware e separação da escolha do produto do cadastro. Não transferir especificações, preços, bandeiras ou depoimentos de concorrentes.

Refero Styles consultado: resposta NO_SUBSCRIPTION. Fallback: referências oficiais, produto existente e guias locais copywriting/motion/visual-workflow.

## Decisões
| Decisão | Fonte | Papel e motivo |
| --- | --- | --- |
| Três argumentos: desconto, taxas, atendimento/envio | Pedido do usuário | Cada seção oferece um motivo distinto para comprar |
| Botões Comprar maquininha levam a /checkout | Pedido do usuário + jornada de produto | Nada de CPF ou formulário na landing |
| Resumo da oferta antes dos dados no checkout | Padrão de hardware Square | Entender o pedido antes de enviar dados |
| Débito 1,12%, crédito 3,09%, 12x 12,25% | P4.jpeg do usuário | Identificar Visa/Mastercard junto aos destaques; demais taxas preservadas |
| Visa, Mastercard, Elo, Hiper | P4.jpeg | Exibir somente bandeiras identificadas na fonte |
| Máquina com movimento leve e botão de pausa | Pedido de GIF + craft motion | Animar o produto existente, sem inventar funções ou nova imagem; respeitar movimento reduzido |
| Preços e depoimentos centralizados | Conteúdo pendente do usuário | Não fabricar valores, avaliações, rostos ou citações; seção de depoimentos só aparece com relatos autorizados |

## Conteúdo pendente
Preço confirmado em 18/10: de R$ 99,00 por R$ 9,90 à vista, economia de R$ 89,10 = 90%. Substituir todos os selos de 99% anteriores. Depoimentos reais autorizados ainda pendentes, seção não publicada até recebê-los. O checkout é um pedido para análise, sem cobrança automática. Manter isso explícito.

## Verificação
Prévia local revisada em desktop e 390px; menu e CTA adicionalmente verificados em 320px, com cabeçalho em duas linhas nesse tamanho. Landing sem formulário e sem campos pessoais. CTA abre /checkout com preço, frete sob consulta e formulário original. Animação tem pausa funcional. Tabela mantém as 19 modalidades. Os 19 testes de validação, segurança, exclusão e acompanhamento passaram. A animação é feita em CSS sobre a imagem do produto, equivalente visual a um GIF e com controle de pausa/movimento reduzido.

## Extensão da landing — 19/10/2026
Referência bloqueada: identidade existente, argumento sobre custo das taxas logo após a primeira dobra, prova documental, comparação e convite para feedback. Refero consultado novamente: NO_SUBSCRIPTION. Fallback para referências oficiais e craft já lido.

- Fonte primária: https://pagbank.com.br/para-seu-negocio/maquininhas, consultada em 19/10/2026, cards e modal com Visa/Mastercard. Print real dos dois planos, sem alteração de conteúdo, com link e data visíveis.
- Super Max e Essencial identificados, taxas posteriores à promoção. Promoções iniciais e limites declarados, pois podem ser menores que a Payxincha. Super Max acima de R$2.000/mês. Payxincha em 1 dia, PagBank em até 1h sujeito a análise. Não alegar menor taxa de todo o mercado.
- Simulador de crédito à vista usa valores em centavos, calcula apenas custo de taxas e compara com Essencial depois da promoção. Não é previsão de lucro.
- Leitura de apoio: https://blog.pagbank.com.br/repassar-taxa-das-maquininhas, atualizado em 27/12/2023, identificado como blog do fornecedor e não notícia atual ou jornalismo independente.
- Usuário confirmou que ainda não tem relatos. Seção de feedback agora convida clientes reais a escrever pelo WhatsApp; publicação condicionada à autorização. Sem avaliações, rostos, nomes ou estrelas fictícias.
- Layout: bloco editorial branco, prova sobre fundo suave, tabela com coluna Payxincha verde, simulador escuro e feedback com três perguntas. Mantém fonte, cores, preço e checkout existentes.
