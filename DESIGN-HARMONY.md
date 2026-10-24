# Paychinxa — organização e ritmo, 24/10/2026

Alvo: landing existente, com a referência Brex enviada pelo cliente em DESIGN (3).md, variables (1).css, theme (1).css e tokens (1).json. Ajuste direto de produção, preservando marca, fotos e oferta. Pesquisa Refero ao vivo indisponível por assinatura; usados os documentos enviados, a página existente e os guias locais de tipografia e craft do Refero.

## Referência e decisões

| Decisão | Fonte e papel | Aplicação |
| --- | --- | --- |
| Canvas branco, seções cinza suaves | Brex: Paper/Fog como superfícies | Taxas em cinza, oferta em branco; sem sombras nos cards |
| Largura 1200, escala de 8, intervalos 48–80, raio 12 | Arquivos fornecidos: layout e formas | Mesmo alinhamento e respiro em todas as seções |
| Verde Paychinxa permanece a cor da marca | Identidade aprovada e site existente | Não importar o laranja da referência nem seus exemplos de formulários |
| Inter existente, títulos 32–48, texto 14–16 | Brex + guia de tipografia Refero | Melhor leitura, menos texto miúdo, hierarquia consistente |
| Apresentação → taxas → oferta → etapas → dúvidas → feedback → CTA final | Pedido do cliente e jornada de compra existente | Evitar duas ofertas seguidas; numerar 01–04 na ordem real |
| Foto hero uma vez, terminal na oferta | Assets existentes, papel de demonstração | Retirar a repetição da foto na seção de atendimento |
| Feedback compacto e secundário | Não existem depoimentos autorizados | Convite honesto, sem testemunhos ou números inventados |

Não importar valores inválidos dos arquivos (`#15191`, `48-80px`) nem depender de Flecha sem arquivo de fonte. Manter checkout Ticto, WhatsApp, preços, condições, taxas e ausência de PagBank. Ajustes isolados na classe harmony-page para não afetar o painel legado.

## Verificação visual

Prévia local conferida no navegador em desktop, 390×844 e 320×740. Sem rolagem horizontal da página; tabela completa abre com 19 linhas e rolagem própria; FAQ e menu móvel funcionam; todos os links de compra apontam à Ticto. Texto da oferta vem antes da imagem no celular. Corrigido o espaço duplicado das âncoras (scroll-padding global + scroll-margin). Referência preservada: alinhamento de 1200px, intervalos 48/80px, cards planos de 12px e hierarquia tipográfica. Identidade verde e assets existentes mantidos.
