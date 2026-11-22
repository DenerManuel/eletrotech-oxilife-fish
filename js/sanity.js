/* ==========================================================================
   INTEGRAÇÃO COM SANITY CMS - ELETROTECH / OXILIFE FISH
   Consulta sempre a CDN pública do Sanity (apicdn.sanity.io) e mantém
   compatibilidade com textos simples e objetos traduzidos (PT / ES / EN).
   ========================================================================== */

const SANITY_CONFIG = {
  projectId: 'q5uusc9r',
  dataset: 'production',
  apiVersion: '2024-01-01',
  // false = consulta direto a API principal (atualização na hora para a banca/demonstração).
  // Após a banca, troque para true para usar o cache rápido (apicdn.sanity.io) no 3G/4G.
  useCdn: false,
};

const VALID_SERVICO_ICONS = new Set([
  'fa-solid fa-industry',
  'fa-solid fa-screwdriver-wrench',
  'fa-solid fa-plug-circle-bolt',
  'fa-solid fa-truck-fast',
  'fa-solid fa-microchip',
  'fa-solid fa-bolt',
]);

function buildSanityUrl(groqQuery) {
  const host = SANITY_CONFIG.useCdn ? 'apicdn.sanity.io' : 'api.sanity.io';
  const encodedQuery = encodeURIComponent(groqQuery);
  return `https://${SANITY_CONFIG.projectId}.${host}/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodedQuery}`;
}

async function fetchSanity(groqQuery) {
  const response = await fetch(buildSanityUrl(groqQuery), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Erro ao consultar Sanity (${response.status})`);
  }
  const data = await response.json();
  return data.result ?? null;
}

function getCurrentLang() {
  return document.documentElement.getAttribute('data-selected-lang') || 'pt';
}

function getLocalizedText(field, lang) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.pt || field.es || field.en || '';
}

function getLocalizedArray(items, lang) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => getLocalizedText(item, lang))
    .filter((text) => Boolean(text && text.trim()));
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
  if (typeof iconClass !== 'string') return fallback;
  const trimmed = iconClass.trim();
  if (VALID_SERVICO_ICONS.has(trimmed)) return trimmed;
  if (/^fa-(solid|regular|brands)\s+fa-[a-z0-9-]+$/i.test(trimmed)) return trimmed;
  return fallback;
}

function isSafeHttpUrl(url) {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/* Helper compartilhado para buscar dados do Sanity e renderizar no container */
async function mountSanitySection(listName, groqQuery, renderFn, { translatable = true, onRendered, hasData } = {}) {
  const container = document.querySelector(`[data-sanity-list="${listName}"]`);
  if (!container) return;

  try {
    const data = await fetchSanity(groqQuery);
    const valid = typeof hasData === 'function' ? hasData(data) : Array.isArray(data) && data.length > 0;
    if (!valid) return;

    const update = () => {
      const lang = getCurrentLang();
      renderFn(data, lang, container);
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
   1. CATÁLOGO DE PRODUTOS + CATEGORIAS DINÂMICAS + GALERIA SOB DEMANDA
   ========================================================================== */
function initProductGalleryModal() {
  const dialog = document.querySelector('[data-gallery-modal]');
  if (!dialog) return;

  const titleEl = dialog.querySelector('[data-gallery-title]');
  const gridEl = dialog.querySelector('[data-gallery-grid]');
  const closeBtn = dialog.querySelector('[data-gallery-close]');

  const closeModal = () => {
    if (dialog.open) dialog.close();
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeModal();
  });

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-gallery]');
    if (!trigger) return;

    const productTitle = trigger.getAttribute('data-product-title') || '';
    let urls = [];
    try {
      urls = JSON.parse(trigger.getAttribute('data-gallery-urls') || '[]');
    } catch {
      urls = [];
    }
    if (!Array.isArray(urls) || !urls.length || !gridEl) return;

    if (titleEl) titleEl.textContent = productTitle;

    gridEl.innerHTML = '';
    urls.forEach((rawUrl, index) => {
      if (!isSafeHttpUrl(rawUrl)) return;
      const img = document.createElement('img');
      img.src = `${rawUrl}?w=900&q=80&auto=format`;
      img.alt = `${productTitle} - ${index + 1}`;
      img.className = 'gallery-modal__img';
      img.loading = 'lazy';
      img.decoding = 'async';
      gridEl.appendChild(img);
    });

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
  });
}

function initSanityProdutos() {
  initProductGalleryModal();

  // Uma única consulta traz categorias e produtos para economizar dados no 3G/4G
  const query = `{
    "categorias": *[_type == "categoria"] | order(coalesce(ordem, 999) asc, nome.pt asc, nome asc){
      nome,
      "slug": slug.current
    },
    "produtos": *[_type == "produto" && ativo != false] | order(destaque desc, coalesce(ordem, 999) asc, titulo.pt asc, titulo asc){
      titulo,
      sku,
      destaque,
      "categoriaNome": categoria->nome,
      "categoriaSlug": categoria->slug.current,
      descricao,
      "imagemUrl": select(defined(imagem.asset) => imagem.asset->url + "?w=480&q=75&auto=format", null),
      "galeriaUrls": galeria[defined(asset)].asset->url
    }
  }`;

  mountSanitySection(
    'produtos',
    query,
    (data, lang, container) => {
      const categorias = Array.isArray(data.categorias) ? data.categorias : [];
      const produtos = Array.isArray(data.produtos) ? data.produtos : [];

      // Atualiza botões de categoria dinamicamente mantendo "Todos os Produtos" primeiro
      const pillsContainer = document.querySelector('.filter-pills');
      if (pillsContainer && categorias.length) {
        const allLabel = escapeHtml(getDictText('catalog.filter_all', lang, 'Todos os Produtos'));
        const catButtons = categorias
          .filter((cat) => Boolean(cat.slug))
          .map((cat) => {
            const slug = escapeHtml(cat.slug);
            const fallbackCatName = getLocalizedText(cat.nome, lang) || cat.slug;
            const label = escapeHtml(
              typeof cat.nome === 'string'
                ? getDictText(`catalog.filter_${cat.slug}`, lang, fallbackCatName)
                : fallbackCatName
            );
            return `<button type="button" class="filter-btn" data-filter-category="${slug}" aria-pressed="false">${label}</button>`;
          })
          .join('');

        pillsContainer.innerHTML = `<button type="button" class="filter-btn active" data-filter-category="all" aria-pressed="true">${allLabel}</button>${catButtons}`;
      }

      const consultText = getDictText('catalog.consult_price', lang, 'Preço sob consulta técnica');
      const whatsappText = getDictText('btn.quote_whatsapp', lang, 'Cotar no WhatsApp');
      const featuredLabel = getDictText('catalog.badge_featured', lang, 'Destaque');
      const noPhotoLabel = getDictText('catalog.no_photo', lang, 'Foto ilustrativa do equipamento');
      const quotePrefix = getDictText('catalog.wa_quote_prefix', lang, 'Olá, gostaria de cotar');
      const viewPhotosLabel = getDictText('btn.view_photos', lang, 'Ver mais fotos');

      container.innerHTML = produtos
        .map((prod) => {
          const rawTitle = getLocalizedText(prod.titulo, lang);
          const titulo = escapeHtml(rawTitle);
          const sku = escapeHtml(prod.sku || '');
          const desc = escapeHtml(getLocalizedText(prod.descricao, lang));
          const catSlug = escapeHtml(prod.categoriaSlug || 'outros');
          const rawCatNome = getLocalizedText(prod.categoriaNome, lang) || 'Produto';
          const catNome = escapeHtml(
            typeof prod.categoriaNome === 'string' && prod.categoriaSlug
              ? getDictText(`catalog.filter_${prod.categoriaSlug}`, lang, rawCatNome)
              : rawCatNome
          );

          // Inclui títulos em todos os idiomas na busca para facilitar a pesquisa
          const allTitles = typeof prod.titulo === 'object' && prod.titulo !== null
            ? `${prod.titulo.pt || ''} ${prod.titulo.es || ''} ${prod.titulo.en || ''}`
            : rawTitle;
          const searchText = escapeHtml(`${allTitles} ${prod.sku || ''} ${desc} ${catNome}`);

          const thumbHtml = prod.imagemUrl && isSafeHttpUrl(prod.imagemUrl)
            ? `<div class="product-thumb product-thumb--photo">
                 <img src="${escapeHtml(prod.imagemUrl)}" alt="${titulo}" class="product-thumb__img" width="320" height="120" loading="lazy" decoding="async">
               </div>`
            : `<div class="product-thumb">
                 <i class="fa-solid fa-microchip" aria-hidden="true"></i>
                 <span class="caption">${escapeHtml(noPhotoLabel)}</span>
               </div>`;

          const badgeHtml = prod.destaque
            ? `<span class="badge-status badge-status--success">${escapeHtml(featuredLabel)}</span>`
            : `<span class="section-tag">${catNome}</span>`;

          const skuHtml = sku ? `<span class="sku-tag">SKU: ${sku}</span>` : '';

          const galeria = Array.isArray(prod.galeriaUrls) ? prod.galeriaUrls.filter(isSafeHttpUrl) : [];
          const galleryBtnHtml = galeria.length
            ? `<button type="button" class="btn-secondary btn-sm btn-block" data-open-gallery data-product-title="${titulo}" data-gallery-urls="${escapeHtml(JSON.stringify(galeria))}">
                 <i class="fa-regular fa-images" aria-hidden="true"></i>
                 <span>${escapeHtml(viewPhotosLabel)} (${galeria.length})</span>
               </button>`
            : '';

          const whatsMsg = encodeURIComponent(
            `${quotePrefix}: ${rawTitle}${prod.sku ? ` (SKU: ${prod.sku})` : ''}.`
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
                <span class="price-consult">${escapeHtml(consultText)}</span>
                ${galleryBtnHtml}
                <a href="https://wa.me/554599241306?text=${whatsMsg}" class="btn-whatsapp btn-block" target="_blank" rel="noopener noreferrer">
                  <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
                  <span>${escapeHtml(whatsappText)}</span>
                </a>
              </div>
            </article>
          `;
        })
        .join('');
    },
    {
      hasData: (data) => Boolean(data && Array.isArray(data.produtos) && data.produtos.length > 0),
      onRendered: () => document.dispatchEvent(new CustomEvent('eletrotech:catalog-updated')),
    }
  );
}

/* ==========================================================================
   2. SERVIÇOS PRESTADOS (servicos.html)
   ========================================================================== */
function initSanityServicos() {
  const query = `*[_type == "servico" && ativo != false] | order(coalesce(ordem, 999) asc, _createdAt asc){
    nome,
    setor,
    descricao,
    beneficios,
    icone,
    destaqueEmergencia,
    tipoBotao,
    textoBotao
  }`;

  mountSanitySection('servicos', query, (servicos, lang, container) => {
    container.innerHTML = servicos
      .map((srv) => {
        const rawNome = getLocalizedText(srv.nome, lang);
        const nome = escapeHtml(rawNome);
        const rawSetorPt = getLocalizedText(srv.setor, 'pt');
        const setor = escapeHtml(
          getLocalizedText(srv.setor, lang) || getDictText('services.default_sector', lang, 'Serviço')
        );
        const desc = escapeHtml(getLocalizedText(srv.descricao, lang));
        const icone = sanitizeIconClass(srv.icone);
        const beneficios = getLocalizedArray(srv.beneficios, lang);

        // Mantém compatibilidade com os dados antigos caso os novos campos ainda não tenham sido marcados no Studio
        const isEmergency = srv.destaqueEmergencia === true || (srv.destaqueEmergencia == null && /emerg/i.test(rawSetorPt));
        const isWhatsapp = srv.tipoBotao === 'whatsapp' || (srv.tipoBotao == null && isEmergency);

        const badgeClass = isEmergency ? 'badge-status badge-status--critical' : 'section-tag';

        const defaultCta = isWhatsapp
          ? getDictText('services.cta_emergency', lang, 'Acionar Plantão no WhatsApp')
          : getDictText('services.cta_visit', lang, 'Solicitar Visita Técnica');
        const ctaText = escapeHtml(getLocalizedText(srv.textoBotao, lang) || defaultCta);

        const ctaHtml = isWhatsapp
          ? `<a href="https://wa.me/554599241306?text=${encodeURIComponent(
              isEmergency
                ? getDictText('services.wa_emergency_msg', lang, 'Olá, preciso de atendimento emergencial elétrico da Eletrotech.')
                : `${getDictText('services.wa_service_prefix', lang, 'Olá, gostaria de solicitar informações sobre o serviço:')} ${rawNome}`
            )}" class="btn-whatsapp btn-block" target="_blank" rel="noopener noreferrer">
               <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
               <span>${ctaText}</span>
             </a>`
          : `<a href="contato.html" class="btn-primary btn-block">${ctaText}</a>`;

        const listHtml = beneficios.length
          ? `<ul class="check-list">
               ${beneficios
                 .map((item) => `<li><i class="fa-solid fa-check" aria-hidden="true"></i><span>${escapeHtml(item)}</span></li>`)
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
                <span class="${badgeClass}">${setor}</span>
              </div>
              <h2 class="card-title">${nome}</h2>
              <p class="card-product__body">${desc}</p>
              ${listHtml}
            </div>
            ${ctaHtml}
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
  const query = `*[_type == "faq" && ativo != false] | order(coalesce(ordem, 999) asc, _createdAt asc){
    ordem,
    pergunta,
    resposta
  }`;

  mountSanitySection('faq', query, (faqs, lang, container) => {
    container.innerHTML = faqs
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
  const query = `*[_type == "depoimento" && ativo != false] | order(coalesce(ordem, 999) asc, _createdAt desc){
    nomeProdutor,
    cidade,
    tempoCliente,
    nota,
    texto,
    "fotoUrl": select(defined(foto.asset) => foto.asset->url + "?w=120&h=120&fit=crop&auto=format", null),
    videoUrl
  }`;

  mountSanitySection(
    'depoimentos',
    query,
    (depoimentos, lang, container) => {
      const watchLabel = escapeHtml(getDictText('btn.watch_video', lang, 'Assistir depoimento'));

      container.innerHTML = depoimentos
        .map((dep) => {
          const nota = Math.max(1, Math.min(5, Number(dep.nota) || 5));
          const starsHtml = '<i class="fa-solid fa-star" aria-hidden="true"></i>'.repeat(nota);
          const autor = escapeHtml(dep.nomeProdutor);
          const cidade = dep.cidade ? ` &mdash; ${escapeHtml(dep.cidade)}` : '';
          const tempo = dep.tempoCliente ? `<div class="caption">${escapeHtml(dep.tempoCliente)}</div>` : '';

          const fotoHtml = dep.fotoUrl && isSafeHttpUrl(dep.fotoUrl)
            ? `<img src="${escapeHtml(dep.fotoUrl)}" alt="${autor}" class="testimonial-avatar" width="48" height="48" loading="lazy" decoding="async">`
            : '';

          const videoHtml = isSafeHttpUrl(dep.videoUrl)
            ? `<a href="${escapeHtml(dep.videoUrl)}" class="btn-secondary btn-sm" target="_blank" rel="noopener noreferrer">
                 <i class="fa-solid fa-play" aria-hidden="true"></i>
                 <span>${watchLabel}</span>
               </a>`
            : '';

          return `
            <article class="card-testimonial">
              <div class="card-testimonial__stars" aria-label="Avaliação ${nota} de 5 estrelas">
                ${starsHtml}
              </div>
              <p class="body-text">&ldquo;${escapeHtml(dep.texto)}&rdquo;</p>
              <div class="card-footer-row">
                <div class="testimonial-author-row">
                  ${fotoHtml}
                  <div>
                    <div class="card-testimonial__author">${autor}${cidade}</div>
                    ${tempo}
                  </div>
                </div>
                ${videoHtml}
              </div>
            </article>
          `;
        })
        .join('');
    },
    { translatable: true }
  );
}

document.addEventListener('DOMContentLoaded', () => {
  initSanityProdutos();
  initSanityServicos();
  initSanityFaq();
  initSanityDepoimentos();
});
