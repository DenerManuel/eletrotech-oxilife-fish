/* ==========================================================================
   ELETROTECH SISTEMAS ELÉTRICOS & OXILIFE FISH - JAVASCRIPT PRINCIPAL
   Código simples, organizado em blocos numerados e sem dependências externas.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initAdminSidebar();
  initLanguageSwitcher();
  initCatalogFilters();
  initContactForm();
  initAdminLogin();
  initAdminCrudActions();
});

/* ==========================================================================
   01. MENU DE NAVEGAÇÃO MOBILE (SITE PÚBLICO)
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
   02. MENU RECOLHÍVEL DO PAINEL ADMIN NO CELULAR
   ========================================================================== */
function initAdminSidebar() {
  const adminToggle = document.querySelector('[data-admin-nav-toggle]');
  const sidebarBody = document.querySelector('[data-admin-sidebar-body]');
  if (!adminToggle || !sidebarBody) return;

  const icon = adminToggle.querySelector('i');

  adminToggle.addEventListener('click', () => {
    const isOpen = sidebarBody.classList.toggle('is-open');
    adminToggle.setAttribute('aria-expanded', String(isOpen));
    if (icon) {
      icon.classList.toggle('fa-bars', !isOpen);
      icon.classList.toggle('fa-xmark', isOpen);
    }
  });
}

/* ==========================================================================
   03. SELETOR DE IDIOMAS (PT / ES / EN) COM SALVAMENTO EM localStorage
   ========================================================================== */
function initLanguageSwitcher() {
  const langButtons = document.querySelectorAll('[data-lang]');
  const htmlLangMap = { pt: 'pt-BR', es: 'es', en: 'en' };

  const applyLanguage = (lang) => {
    const chosenLang = TRADUCOES && TRADUCOES[lang] ? lang : 'pt';
    const dict = typeof TRADUCOES !== 'undefined' ? TRADUCOES[chosenLang] : null;

    document.documentElement.setAttribute('lang', htmlLangMap[chosenLang] || 'pt-BR');
    document.documentElement.setAttribute('data-selected-lang', chosenLang);

    // Atualiza estado visual dos botões PT | ES | EN
    langButtons.forEach((btn) => {
      const isSelected = btn.getAttribute('data-lang') === chosenLang;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-pressed', String(isSelected));
    });

    if (!dict) return;

    // Atualiza textos fixos (sem apagar ícones porque cada texto fica no próprio <span>)
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Atualiza placeholders de inputs/campos de busca
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    document.dispatchEvent(new CustomEvent('eletrotech:lang-changed', { detail: { lang: chosenLang } }));
  };

  // Restaura o último idioma escolhido pelo usuário
  const savedLang = window.localStorage.getItem('eletrotech_lang') || 'pt';
  applyLanguage(savedLang);

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const newLang = btn.getAttribute('data-lang') || 'pt';
      window.localStorage.setItem('eletrotech_lang', newLang);
      applyLanguage(newLang);
    });
  });
}

/* ==========================================================================
   04. FILTROS E BUSCA (USADO EM CATÁLOGO E NO PAINEL ADMIN)
   ========================================================================== */
function initCatalogFilters() {
  const filterBtns = document.querySelectorAll('[data-filter-category]');
  const searchInput = document.querySelector('[data-search-input]');
  const emptyState = document.querySelector('[data-empty-state]');

  if (!filterBtns.length && !searchInput) return;

  let currentCategory = 'all';
  let currentQuery = '';

  const getSearchableText = (item) => {
    // Se existir atributo próprio de busca, usa ele; senão lê os textos principais ignorando botões
    const customText = item.getAttribute('data-search-text');
    if (customText) return customText.toLowerCase();

    const clone = item.cloneNode(true);
    clone.querySelectorAll('button, .btn-whatsapp, .action-group').forEach((el) => el.remove());
    return clone.textContent.toLowerCase();
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

  document.addEventListener('eletrotech:catalog-updated', applyFilters);

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter-category') || 'all';
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      currentQuery = event.target.value.trim().toLowerCase();
      applyFilters();
    });
  }
}

/* ==========================================================================
   05. FORMULÁRIO DE CONTATO + BOTÃO PARA WHATSAPP PRÉ-PREENCHIDO
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

    const textoWhatsapp = encodeURIComponent(
      `Olá, Eletrotech! Solicitação de orçamento via site:\n` +
      `• Nome: ${nome}\n` +
      `• Telefone: ${telefone}\n` +
      `• E-mail: ${email}\n` +
      `• Cidade/Estado: ${cidade}\n` +
      `• Mensagem: ${mensagem}`
    );

    if (feedback) {
      feedback.innerHTML = '';

      const info = document.createElement('p');
      info.textContent = 'Solicitação registrada com sucesso! Se preferir agilizar ainda mais, envie os dados preenchidos direto no nosso WhatsApp:';

      const waLink = document.createElement('a');
      waLink.href = `https://wa.me/554599241306?text=${textoWhatsapp}`;
      waLink.target = '_blank';
      waLink.rel = 'noopener noreferrer';
      waLink.className = 'btn-whatsapp';
      waLink.innerHTML = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i><span>Enviar Dados no WhatsApp</span>';

      feedback.appendChild(info);
      feedback.appendChild(waLink);
      feedback.classList.add('is-visible');
    }

    form.reset();
  });
}

/* ==========================================================================
   06. LOGIN DE DEMONSTRAÇÃO DO PAINEL ADMIN (PARA APRESENTAÇÃO)
   ========================================================================== */
function initAdminLogin() {
  const loginForm = document.querySelector('[data-login-form]');
  const errorBox = document.querySelector('[data-login-error]');
  if (!loginForm) return;

  const DEMO_EMAIL = 'admin@eletrotech.com.br';
  const DEMO_PASS = '123456';

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (errorBox) errorBox.classList.remove('is-visible');

    if (!loginForm.checkValidity()) {
      loginForm.reportValidity();
      return;
    }

    const email = (loginForm.querySelector('#admin-email')?.value || '').trim().toLowerCase();
    const password = loginForm.querySelector('#admin-password')?.value || '';

    if (email !== DEMO_EMAIL || password !== DEMO_PASS) {
      if (errorBox) {
        errorBox.textContent = 'E-mail ou senha incorretos. Use as credenciais de demonstração indicadas abaixo.';
        errorBox.classList.add('is-visible');
      }
      return;
    }

    window.location.href = 'produtos.html';
  });
}

/* ==========================================================================
   07. AÇÕES DO PAINEL ADMIN (EXCLUIR E MODAL DEMONSTRATIVO DE CRIAR/EDITAR)
   ========================================================================== */
function initAdminCrudActions() {
  const modal = document.querySelector('[data-admin-modal]');
  const modalTitle = document.querySelector('[data-admin-modal-title]');
  const modalInput = document.querySelector('[data-admin-modal-input]');
  const modalDesc = document.querySelector('[data-admin-modal-desc]');
  const modalForm = document.querySelector('[data-admin-modal-form]');
  const modalNotice = document.querySelector('[data-admin-modal-notice]');

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    if (modalNotice) modalNotice.classList.remove('is-visible');
  };

  document.addEventListener('click', (event) => {
    // Botão Excluir (funciona em linhas de tabela e nos cards de depoimento)
    const deleteBtn = event.target.closest('[data-action="delete"]');
    if (deleteBtn) {
      const row = deleteBtn.closest('tr, .card-testimonial');
      if (row && window.confirm('Confirma a exclusão deste registro na demonstração?')) {
        row.remove();
      }
      return;
    }

    // Botão Adicionar ou Editar -> abre modal demonstrativo simples
    const modalBtn = event.target.closest('[data-action="add"], [data-action="edit"]');
    if (modalBtn && modal) {
      const isEdit = modalBtn.getAttribute('data-action') === 'edit';
      const itemName = modalBtn.getAttribute('data-item-name') || '';
      const itemDesc = modalBtn.getAttribute('data-item-desc') || '';

      if (modalTitle) {
        modalTitle.textContent = isEdit ? 'Editar Registro (Demonstração)' : 'Novo Cadastro (Demonstração)';
      }
      if (modalInput) modalInput.value = itemName;
      if (modalDesc) modalDesc.value = itemDesc;
      if (modalNotice) modalNotice.classList.remove('is-visible');

      modal.classList.add('is-open');
      if (modalInput) modalInput.focus();
      return;
    }

    // Fechar modal pelo botão ou clicando fora
    if (event.target.closest('[data-modal-close]') || event.target === modal) {
      closeModal();
    }
  });

  if (modalForm) {
    modalForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (modalNotice) {
        modalNotice.textContent = 'Registro validado na demonstração! Na próxima etapa, o Sanity Studio salvará esses dados no banco em nuvem.';
        modalNotice.classList.add('is-visible');
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}
