/* ==========================================================================
   INTEGRAÇÃO COM SANITY CMS - ELETROTECH / OXILIFE FISH
   ========================================================================== */

const SANITY_CONFIG = {
  projectId: 'q5uusc9r',
  dataset: 'production',
  apiVersion: '2024-01-01',
  // Usa apicdn.sanity.io para cache rápido na internet rural 3G/4G
  useCdn: true,
};

function buildSanityUrl(groqQuery) {
  const host = SANITY_CONFIG.useCdn ? 'apicdn.sanity.io' : 'api.sanity.io';
  const encodedQuery = encodeURIComponent(groqQuery);
  return `https://${SANITY_CONFIG.projectId}.${host}/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodedQuery}`;
}

async function fetchSanity(groqQuery) {
  const response = await fetch(buildSanityUrl(groqQuery));
  if (!response.ok) {
    throw new Error(`Erro ao consultar Sanity (${response.status})`);
  }
  const data = await response.json();
  return data.result || [];
}

function getCurrentLang() {
  return document.documentElement.getAttribute('data-selected-lang') || 'pt';
}

function getLocalizedText(field, lang) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.pt || field.es || field.en || '';
}

function getDictText(key, lang, fallback) {
  if (typeof TRADUCOES !== 'undefined' && TRADUCOES[lang] && TRADUCOES[lang][key]) {
    return TRADUCOES[lang][key];
  }
  return fallback;
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeIconClass(iconClass, fallback = 'fa-solid fa-bolt') {
  if (typeof iconClass === 'string' && /^[a-z0-9\s-]+$/i.test(iconClass.trim())) {
    return iconClass.trim();
  }
  return fallback;
}

/* Helper compartilhado para buscar uma lista do Sanity e renderizar no container */
async function mountSanityList(listName, groqQuery, renderFn, { translatable = true, onRendered } = {}) {
  const container = document.querySelector(`[data-sanity-list="${listName}"]`);
  if (!container) return;

  try {
    const items = await fetchSanity(groqQuery);
    if (!items.length) return;

    const update = () => {
      const lang = getCurrentLang();
      container.innerHTML = renderFn(items, lang);
      if (typeof onRendered === 'function') onRendered();
    };

    update();
    if (translatable) {
      document.addEventListener('eletrotech:lang-changed', update);
    }
  } catch (error) {
    console.warn(`Sanity (${listName}): usando conteúdo estático de fallback.`, error);
  }
}

/* ==========================================================================
   1. CATÁLOGO DE PRODUTOS (catalogo.html)
   ========================================================================== */
function initSanityProdutos() {
  const query = `*[_type == "produto" && ativo == true] | order(destaque desc, titulo asc){
    titulo,
    sku,
    destaque,
    "categoriaNome": categoria->nome,
    "categoriaSlug": categoria->slug.current,
    descricao,
    "imagemUrl": imagem.asset->url + "?w=800&auto=format"
  }`;

  mountSanityList(
    'produtos',
    query,
    (produtos, lang) => {
      const consultText = getDictText('catalog.consult_price', lang, 'Preço sob consulta técnica');
      const whatsappText = getDictText('btn.quote_whatsapp', lang, 'Cotar no WhatsApp');

      return produtos
        .map((prod) => {
          const titulo = escapeHtml(prod.titulo);
          const sku = escapeHtml(prod.sku || '');
          const desc = escapeHtml(getLocalizedText(prod.descricao, lang));
          const catSlug = escapeHtml(prod.categoriaSlug || 'outros');
          const catNome = escapeHtml(prod.categoriaNome || 'Produto');
          const searchText = escapeHtml(`${prod.titulo} ${prod.sku || ''} ${desc} ${catNome}`);

          const thumbHtml = prod.imagemUrl
            ? `<div class="product-thumb product-thumb--photo">
                 <img src="${escapeHtml(prod.imagemUrl)}" alt="${titulo}" class="product-thumb__img" loading="lazy">
               </div>`
            : `<div class="product-thumb">
                 <i class="fa-solid fa-microchip" aria-hidden="true"></i>
                 <span class="caption">Sem foto cadastrada</span>
               </div>`;

          const badgeHtml = prod.destaque
            ? `<span class="badge-status badge-status--success">Destaque</span>`
            : `<span class="section-tag">${catNome}</span>`;

          const skuHtml = sku ? `<span class="sku-tag">SKU: ${sku}</span>` : '';
          const whatsMsg = encodeURIComponent(
            `Olá, gostaria de cotar ${prod.titulo}${prod.sku ? ` (SKU: ${prod.sku})` : ''}.`
          );

          return `
            <article class="card-product" data-item-category="${catSlug}" data-search-text="${searchText}">
              <div class="card-product__content">
                ${thumbHtml}
                <div class="card-meta-row">
                  ${badgeHtml}
                  ${skuHtml}
                </div>
                <h2 class="card-title">${titulo}</h2>
                <p class="card-product__body">${desc}</p>
              </div>
              <div class="card-footer-row">
                <span class="price-consult" data-i18n="catalog.consult_price">${escapeHtml(consultText)}</span>
                <a href="https://wa.me/554599241306?text=${whatsMsg}" class="btn-whatsapp btn-block" target="_blank" rel="noopener noreferrer">
                  <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
                  <span data-i18n="btn.quote_whatsapp">${escapeHtml(whatsappText)}</span>
                </a>
              </div>
            </article>
          `;
        })
        .join('');
    },
    {
      onRendered: () => document.dispatchEvent(new CustomEvent('eletrotech:catalog-updated')),
    }
  );
}

/* ==========================================================================
   2. SERVIÇOS PRESTADOS (servicos.html)
   ========================================================================== */
function initSanityServicos() {
  const query = `*[_type == "servico"] | order(_createdAt asc){
    nome,
    setor,
    descricao,
    beneficios,
    icone
  }`;

  mountSanityList('servicos', query, (servicos, lang) => {
    const ctaText = getDictText('services.cta_visit', lang, 'Solicitar Orçamento / Visita');

    return servicos
      .map((srv) => {
        const nome = escapeHtml(getLocalizedText(srv.nome, lang));
        const setor = escapeHtml(srv.setor || 'Serviço');
        const desc = escapeHtml(getLocalizedText(srv.descricao, lang));
        const icone = sanitizeIconClass(srv.icone);
        const beneficios = Array.isArray(srv.beneficios) ? srv.beneficios : [];

        const listHtml = beneficios.length
          ? `<ul class="check-list">
               ${beneficios
                 .map(
                   (item) =>
                     `<li><i class="fa-solid fa-check" aria-hidden="true"></i><span>${escapeHtml(item)}</span></li>`
                 )
                 .join('')}
             </ul>`
          : '';

        return `
          <article class="card-service">
            <div class="card-product__content">
              <div class="card-meta-row">
                <div class="card-service__icon" aria-hidden="true">
                  <i class="${icone}"></i>
                </div>
                <span class="section-tag">${setor}</span>
              </div>
              <h2 class="card-title">${nome}</h2>
              <p class="card-product__body">${desc}</p>
              ${listHtml}
            </div>
            <a href="contato.html" class="btn-primary btn-block" data-i18n="services.cta_visit">${escapeHtml(ctaText)}</a>
          </article>
        `;
      })
      .join('');
  });
}

/* ==========================================================================
   3. PERGUNTAS FREQUENTES - FAQ (faq.html)
   ========================================================================== */
function initSanityFaq() {
  const query = `*[_type == "faq" && ativo == true] | order(ordem asc, _createdAt asc){
    ordem,
    pergunta,
    resposta
  }`;

  mountSanityList('faq', query, (faqs, lang) => {
    return faqs
      .map((item, index) => {
        const numero = item.ordem ? `${item.ordem}. ` : `${index + 1}. `;
        const pergunta = escapeHtml(getLocalizedText(item.pergunta, lang));
        const resposta = escapeHtml(getLocalizedText(item.resposta, lang));
        const isOpen = index < 2 ? ' open' : '';

        return `
          <details class="faq-item"${isOpen}>
            <summary class="faq-question">
              <span>${numero}${pergunta}</span>
              <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
            </summary>
            <div class="faq-answer">
              <p class="body-text">${resposta}</p>
            </div>
          </details>
        `;
      })
      .join('');
  });
}

/* ==========================================================================
   4. DEPOIMENTOS DE PISCICULTORES (oxilife-fish.html - sempre em português)
   ========================================================================== */
function initSanityDepoimentos() {
  const query = `*[_type == "depoimento"] | order(_createdAt desc){
    nomeProdutor,
    cidade,
    tempoCliente,
    nota,
    texto
  }`;

  mountSanityList(
    'depoimentos',
    query,
    (depoimentos) => {
      return depoimentos
        .map((dep) => {
          const nota = Math.max(1, Math.min(5, Number(dep.nota) || 5));
          const starsHtml = '<i class="fa-solid fa-star" aria-hidden="true"></i>'.repeat(nota);
          const autor = escapeHtml(dep.nomeProdutor);
          const cidade = dep.cidade ? ` &mdash; ${escapeHtml(dep.cidade)}` : '';
          const tempo = dep.tempoCliente
            ? `<div class="caption">${escapeHtml(dep.tempoCliente)}</div>`
            : '';

          return `
            <article class="card-testimonial">
              <div class="card-testimonial__stars" aria-label="Avaliação ${nota} de 5 estrelas">
                ${starsHtml}
              </div>
              <p class="body-text">&ldquo;${escapeHtml(dep.texto)}&rdquo;</p>
              <div>
                <div class="card-testimonial__author">${autor}${cidade}</div>
                ${tempo}
              </div>
            </article>
          `;
        })
        .join('');
    },
    { translatable: false }
  );
}

document.addEventListener('DOMContentLoaded', () => {
  initSanityProdutos();
  initSanityServicos();
  initSanityFaq();
  initSanityDepoimentos();
});
