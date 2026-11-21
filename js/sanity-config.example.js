/* ==========================================================================
   MODELO PREPARADO PARA FUTURA INTEGRAÇÃO COM O SANITY CMS (NÃO ATIVO AINDA)
   ==========================================================================
   Quando vocês criarem o projeto no Sanity (https://www.sanity.io):
   1. Copie este arquivo para js/sanity.js (ou cole o código abaixo).
   2. Preencha o SANITY_PROJECT_ID com o código do projeto criado no Sanity.
   3. No painel do Sanity (API -> CORS Origins), libere os endereços do site:
      - http://127.0.0.1:5500  (Live Server no VS Code)
      - http://localhost:5500
      - https://seudominio.com.br
   4. Mantenha os containers no HTML marcados com data-sanity-list="produtos",
      "servicos", "depoimentos" e "faq" para trocar o conteúdo sem mudar o layout.
   ========================================================================== */

const SANITY_CONFIG = {
  projectId: 'SEU_PROJECT_ID_AQUI', // Exemplo: 'ab12cd34'
  dataset: 'production',
  apiVersion: '2024-01-01',
  // Usa apicdn.sanity.io para cache rápido na internet rural 3G/4G
  useCdn: true
};

/* Monta a URL pública de consulta (GROQ) do Sanity */
function buildSanityUrl(groqQuery) {
  const host = SANITY_CONFIG.useCdn ? 'apicdn.sanity.io' : 'api.sanity.io';
  const encodedQuery = encodeURIComponent(groqQuery);
  return `https://${SANITY_CONFIG.projectId}.${host}/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodedQuery}`;
}

/* Exemplos de consultas GROQ alinhadas aos campos do nosso site e do SQL:

1) Configurações Gerais do Site (configuracoesSite):
   *[_type == "configuracoesSite"][0]{
     nomeEmpresa, whatsapp, email, enderecoCompleto, horarioAtendimento
   }

2) Produtos do Catálogo (produto) - já trazendo imagem otimizada para 3G/4G:
   *[_type == "produto" && ativo == true] | order(destaque desc, titulo asc){
     sku,
     titulo,
     "categoria": categoria->slug.current,
     descricao, // objeto { pt, es, en }
     destaque,
     "imagemUrl": imagem.asset->url + "?w=800&auto=format"
   }

3) Serviços Prestados (servico):
   *[_type == "servico"]{
     nome,       // objeto { pt, es, en }
     setor,
     descricao,  // objeto { pt, es, en }
     beneficios,
     icone
   }

4) Depoimentos de Piscicultores (depoimento - mantidos em português):
   *[_type == "depoimento"] | order(_createdAt desc){
     nomeProdutor,
     cidade,
     tempoCliente,
     nota,
     texto,
     "fotoUrl": foto.asset->url,
     videoUrl
   }

5) Perguntas Frequentes (faq):
   *[_type == "faq" && ativo == true] | order(ordem asc){
     ordem,
     pergunta, // objeto { pt, es, en }
     resposta  // objeto { pt, es, en }
   }
*/
