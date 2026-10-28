/* ===== Inicialização Global Eletrotech / Oxilife Fish ===== */
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initLanguageSwitcher();
  initCatalogFilters();
  initContactForm();
  initAdminLogin();
  initAdminCrudActions();
});

/* ===== Menu Mobile ===== */
function initMobileNav() {
  const toggleBtn = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  if (!toggleBtn || !nav) return;

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    nav.classList.toggle('is-open');
  });
}

/* ===== Seletor Multilíngue (RF-009) ===== */
function initLanguageSwitcher() {
  const langButtons = document.querySelectorAll('[data-lang]');
  if (!langButtons.length) return;

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      langButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      document.documentElement.setAttribute('data-selected-lang', btn.dataset.lang);
    });
  });
}

/* ===== Busca e Filtro de Catálogo e Listagens (RF-004) ===== */
function initCatalogFilters() {
  const filterBtns = document.querySelectorAll('[data-filter-category]');
  const searchInput = document.querySelector('[data-search-input]');
  const filterableItems = document.querySelectorAll('[data-item-category]');

  if (!filterableItems.length) return;

  let currentCategory = 'all';
  let currentQuery = '';

  const applyFilters = () => {
    filterableItems.forEach((item) => {
      const category = item.getAttribute('data-item-category') || '';
      const text = item.textContent.toLowerCase();
      const matchesCategory = currentCategory === 'all' || category === currentCategory;
      const matchesQuery = !currentQuery || text.includes(currentQuery);

      item.classList.toggle('is-hidden', !(matchesCategory && matchesQuery));
    });
  };

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

/* ===== Validação do Formulário de Orçamento (RF-007 / RNF-006) ===== */
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

    if (feedback) {
      feedback.textContent = 'Solicitação técnica registrada com sucesso! Nossa engenharia entrará em contato via WhatsApp.';
      feedback.classList.add('is-visible');
    }
    form.reset();
  });
}

/* ===== Autenticação Administrativa (RNF-006) ===== */
function initAdminLogin() {
  const loginForm = document.querySelector('[data-login-form]');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!loginForm.checkValidity()) {
      loginForm.reportValidity();
      return;
    }
    window.location.href = 'produtos.html';
  });
}

/* ===== Ações Interativas do Painel Administrativo ===== */
function initAdminCrudActions() {
  document.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('[data-action="delete"]');
    if (deleteBtn) {
      const row = deleteBtn.closest('tr, .card-testimonial');
      if (row && window.confirm('Confirma a exclusão permanente deste registro?')) {
        row.remove();
      }
    }
  });
}

