/* ==========================================================================
   ELETROTECH SISTEMAS ELÉTRICOS & OXILIFE FISH - JAVASCRIPT PRINCIPAL
   Código simples, organizado em blocos numerados e sem dependências externas.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initLanguageSwitcher();
  initCatalogFilters();
  initContactForm();
});

function getDictValue(key, fallback) {
  const lang = document.documentElement.getAttribute('data-selected-lang') || 'pt';
  if (typeof TRADUCOES !== 'undefined' && TRADUCOES[lang] && TRADUCOES[lang][key]) {
    return TRADUCOES[lang][key];
  }
  return fallback;
}

function normalizeSearchText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/* ==========================================================================
   01. MENU DE NAVEGAÇÃO MOBILE
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  if (!toggleBtn || !nav) return;

  const icon = toggleBtn.querySelector('i');

  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    if (icon) {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }
  };

  toggleBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      closeMenu();
    } else {
      nav.classList.add('is-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      if (icon) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      }
    }
  });

  // Fecha o menu ao clicar em um link no celular
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Fecha o menu ao clicar fora dele
  document.addEventListener('click', (event) => {
    if (!nav.classList.contains('is-open')) return;
    if (!nav.contains(event.target) && !toggleBtn.contains(event.target)) {
      closeMenu();
    }
  });

  // Fecha o menu ao apertar a tecla Esc
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      toggleBtn.focus();
    }
  });
}

/* ==========================================================================
   02. SELETOR DE IDIOMAS (PT / ES / EN) COM SALVAMENTO EM localStorage
   ========================================================================== */
function initLanguageSwitcher() {
  const langButtons = document.querySelectorAll('[data-lang]');
  const htmlLangMap = { pt: 'pt-BR', es: 'es', en: 'en' };

  const applyLanguage = (lang) => {
    const hasDict = typeof TRADUCOES !== 'undefined';
    const chosenLang = hasDict && TRADUCOES[lang] ? lang : 'pt';
    const dict = hasDict ? TRADUCOES[chosenLang] : null;

    document.documentElement.setAttribute('lang', htmlLangMap[chosenLang] || 'pt-BR');
    document.documentElement.setAttribute('data-selected-lang', chosenLang);

    // Atualiza estado visual dos botões PT | ES | EN
    langButtons.forEach((btn) => {
      const isSelected = btn.getAttribute('data-lang') === chosenLang;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-pressed', String(isSelected));
    });

    if (!dict) return;

    // Atualiza textos fixos sem apagar ícones (cada texto fica no próprio <span>)
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Atualiza placeholders de campos de busca e formulários
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    document.dispatchEvent(new CustomEvent('eletrotech:lang-changed', { detail: { lang: chosenLang } }));
  };

  // Restaura o último idioma escolhido pelo usuário
  let savedLang = 'pt';
  try {
    savedLang = window.localStorage.getItem('eletrotech_lang') || 'pt';
  } catch {
    savedLang = 'pt';
  }
  applyLanguage(savedLang);

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const newLang = btn.getAttribute('data-lang') || 'pt';
      try {
        window.localStorage.setItem('eletrotech_lang', newLang);
      } catch {
        // Ignora se localStorage estiver bloqueado
      }
      applyLanguage(newLang);
    });
  });
}

/* ==========================================================================
   03. FILTROS E BUSCA DO CATÁLOGO (SEM SENSIBILIDADE A ACENTOS)
   ========================================================================== */
function initCatalogFilters() {
  const pillsContainer = document.querySelector('.filter-pills');
  const searchInput = document.querySelector('[data-search-input]');
  const emptyState = document.querySelector('[data-empty-state]');

  if (!pillsContainer && !searchInput) return;

  let currentCategory = 'all';
  let currentQuery = '';

  const getSearchableText = (item) => {
    const customText = item.getAttribute('data-search-text');
    if (customText) return normalizeSearchText(customText);

    const clone = item.cloneNode(true);
    clone.querySelectorAll('button, .btn-whatsapp').forEach((el) => el.remove());
    return normalizeSearchText(clone.textContent);
  };

  const applyFilters = () => {
    const filterableItems = document.querySelectorAll('[data-item-category]');
    let visibleCount = 0;

    filterableItems.forEach((item) => {
      const category = item.getAttribute('data-item-category') || '';
      const text = getSearchableText(item);
      const matchesCategory = currentCategory === 'all' || category === currentCategory;
      const matchesQuery = !currentQuery || text.includes(currentQuery);
      const shouldShow = matchesCategory && matchesQuery;

      item.classList.toggle('is-hidden', !shouldShow);
      if (shouldShow) visibleCount += 1;
    });

    if (emptyState) {
      emptyState.classList.toggle('is-hidden', visibleCount > 0);
    }
  };

  // Mantém a categoria ativa sincronizada quando os botões são atualizados pelo Sanity
  document.addEventListener('eletrotech:catalog-updated', () => {
    if (pillsContainer) {
      const activeBtn = pillsContainer.querySelector(`[data-filter-category="${CSS.escape(currentCategory)}"]`);
      if (!activeBtn) {
        currentCategory = 'all';
      }
      pillsContainer.querySelectorAll('[data-filter-category]').forEach((btn) => {
        const isActive = (btn.getAttribute('data-filter-category') || 'all') === currentCategory;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });
    }
    applyFilters();
  });

  if (pillsContainer) {
    pillsContainer.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-filter-category]');
      if (!btn) return;

      pillsContainer.querySelectorAll('[data-filter-category]').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      currentCategory = btn.getAttribute('data-filter-category') || 'all';
      applyFilters();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      currentQuery = normalizeSearchText(event.target.value.trim());
      applyFilters();
    });
  }
}

/* ==========================================================================
   04. FORMULÁRIO DE CONTATO + BOTÃO PARA WHATSAPP PRÉ-PREENCHIDO
   ========================================================================== */
function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  const feedback = document.querySelector('[data-form-feedback]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const nome = (form.querySelector('#nome')?.value || '').trim();
    const telefone = (form.querySelector('#telefone')?.value || '').trim();
    const email = (form.querySelector('#email')?.value || '').trim();
    const cidade = (form.querySelector('#cidade')?.value || '').trim();
    const mensagem = (form.querySelector('#mensagem')?.value || '').trim();

    const intro = getDictValue('contact.wa_intro', 'Olá, Eletrotech! Solicitação de orçamento via site:');
    const lNome = getDictValue('contact.wa_name', 'Nome');
    const lFone = getDictValue('contact.wa_phone', 'Telefone');
    const lEmail = getDictValue('contact.wa_email', 'E-mail');
    const lCidade = getDictValue('contact.wa_city', 'Cidade/Estado');
    const lMsg = getDictValue('contact.wa_message', 'Mensagem');

    const textoWhatsapp = encodeURIComponent(
      `${intro}\n` +
      `• ${lNome}: ${nome}\n` +
      `• ${lFone}: ${telefone}\n` +
      `• ${lEmail}: ${email}\n` +
      `• ${lCidade}: ${cidade}\n` +
      `• ${lMsg}: ${mensagem}`
    );

    if (feedback) {
      feedback.innerHTML = '';

      const info = document.createElement('p');
      info.textContent = getDictValue(
        'contact.feedback_success',
        'Solicitação registrada com sucesso! Para enviar agora para nossa equipe técnica, clique no botão abaixo:'
      );

      const waLink = document.createElement('a');
      waLink.href = `https://wa.me/554599241306?text=${textoWhatsapp}`;
      waLink.target = '_blank';
      waLink.rel = 'noopener noreferrer';
      waLink.className = 'btn-whatsapp';

      const waIcon = document.createElement('i');
      waIcon.className = 'fa-brands fa-whatsapp';
      waIcon.setAttribute('aria-hidden', 'true');

      const waLabel = document.createElement('span');
      waLabel.textContent = getDictValue('contact.feedback_wa_btn', 'Enviar Dados no WhatsApp');

      waLink.appendChild(waIcon);
      waLink.appendChild(waLabel);

      feedback.appendChild(info);
      feedback.appendChild(waLink);
      feedback.classList.add('is-visible');
    }

    form.reset();
  });
}
