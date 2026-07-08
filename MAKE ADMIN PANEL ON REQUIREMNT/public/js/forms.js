document.addEventListener('DOMContentLoaded', () => {
  initLoadingButtons();
  initDeleteConfirm();
  initImagePreview();
  initCascadeDropdowns();
});

// Show spinner on form submit
function initLoadingButtons() {
  document.querySelectorAll('form[data-loading]').forEach((form) => {
    form.addEventListener('submit', () => {
      const btn = form.querySelector('.nv-btn[type="submit"]');
      if (btn) btn.classList.add('loading');
    });
  });
}

// Confirm before delete
function initDeleteConfirm() {
  document.querySelectorAll('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      const message = form.dataset.confirm || 'Are you sure?';
      if (!confirm(message)) e.preventDefault();
    });
  });
}

// Live image preview
function initImagePreview() {
  document.querySelectorAll('[data-preview]').forEach((input) => {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const target = document.querySelector(input.dataset.preview);
      if (!target) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (target.tagName === 'IMG') {
          target.src = ev.target.result;
        } else {
          target.innerHTML = `<img src="${ev.target.result}" class="profile-avatar" alt="Preview">`;
        }
      };
      reader.readAsDataURL(file);
    });
  });
}

// Cascading category → subcategory → extra category
function initCascadeDropdowns() {
  const categorySelect = document.getElementById('categorySelect');
  const subcategorySelect = document.getElementById('subcategorySelect');
  const extraCategorySelect = document.getElementById('extraCategorySelect');

  if (!categorySelect || !subcategorySelect) return;

  const isProductForm = document.querySelector('[data-product]');

  categorySelect.addEventListener('change', async () => {
    const categoryId = categorySelect.value;
    resetSelect(subcategorySelect, 'Select subcategory');

    if (extraCategorySelect) {
      resetSelect(extraCategorySelect, 'Select extra category');
    }

    if (!categoryId) {
      subcategorySelect.disabled = true;
      if (extraCategorySelect) extraCategorySelect.disabled = true;
      return;
    }

    await loadSubcategories(categoryId);
  });

  if (subcategorySelect && extraCategorySelect) {
    subcategorySelect.addEventListener('change', async () => {
      const subcategoryId = subcategorySelect.value;
      resetSelect(extraCategorySelect, 'Select extra category');

      if (!subcategoryId) {
        extraCategorySelect.disabled = true;
        return;
      }

      await loadExtraCategories(subcategoryId);
    });
  }

  async function loadSubcategories(categoryId) {
    try {
      const res = await fetch(`/admin/subcategories/api/by-category/${categoryId}`);
      const data = await res.json();

      data.forEach((item) => {
        const opt = document.createElement('option');
        opt.value = item._id;
        opt.textContent = item.name;
        subcategorySelect.appendChild(opt);
      });

      subcategorySelect.disabled = data.length === 0;
    } catch {
      subcategorySelect.disabled = true;
    }
  }

  async function loadExtraCategories(subcategoryId) {
    if (!extraCategorySelect) return;

    try {
      const res = await fetch(`/admin/extra-categories/api/by-subcategory/${subcategoryId}`);
      const data = await res.json();

      data.forEach((item) => {
        const opt = document.createElement('option');
        opt.value = item._id;
        opt.textContent = item.name;
        extraCategorySelect.appendChild(opt);
      });

      extraCategorySelect.disabled = data.length === 0;
    } catch {
      extraCategorySelect.disabled = true;
    }
  }

  function resetSelect(select, placeholder) {
    select.innerHTML = `<option value="">${placeholder}</option>`;
  }

  // Trigger load on edit pages where category is pre-selected
  if (categorySelect.value && subcategorySelect.options.length <= 1) {
    loadSubcategories(categorySelect.value);
  }
}
