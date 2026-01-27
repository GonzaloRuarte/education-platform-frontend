/**
 * Estadísticas Tab Module
 * Handles statistical reports and visualizations
 */
(function () {
  // Storage key prefix for this tab
  const STORAGE_PREFIX = 'reporteMeta.estadisticas.';
  const STORAGE_KEY_FILTERS = STORAGE_PREFIX + 'filters';
  const STORAGE_KEY_SORT = STORAGE_PREFIX + 'sort';

  let summariesData = null;
  let filteredData = [];
  let currentSortColumn = null;
  let currentSortDirection = 'asc';
  let activeFilters = {};

  /**
   * Load summaries data from the server
   */
  function loadSummaries() {
    fetch('/summaries', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        summariesData = data;
        displayTotalStats(data);
        filteredData = data.data || [];
        buildFilters(filteredData);
        restoreState();
        renderTable(filteredData);
      })
      .catch(error => {
        console.error('Failed to load summaries:', error);
        showError('No se pudieron cargar las estadísticas. Verifique que el archivo summaries.json existe.');
      });
  }

  /**
   * Display total statistics in cards
   */
  function displayTotalStats(data) {
    document.getElementById('stat-total-responses').textContent = 
      data.total_responses?.toLocaleString() || '—';
    document.getElementById('stat-total-questions').textContent = 
      data.total_questions?.toLocaleString() || '—';
    document.getElementById('stat-total-students').textContent = 
      data.total_students?.toLocaleString() || '—';
    document.getElementById('stat-total-schools').textContent = 
      data.total_schools?.toLocaleString() || '—';
    document.getElementById('stat-total-kr20').textContent = 
      data.total_kr20 != null ? data.total_kr20_lengua.toFixed(3) : '—';
    document.getElementById('stat-total-mean').textContent = 
      data.total_mean_score != null ? (data.total_mean_score * 100).toFixed(1) + '%' : '—';
  }

  /**
   * Build filter dropdowns
   */
  function buildFilters(data) {
    const filterControls = document.getElementById('filter-controls');
    filterControls.innerHTML = '';

    // Extract unique values for each filterable column
    const columns = [
      { key: 'evaluation_grade', label: 'Grado' },
      { key: 'school_id', label: 'Escuela' },
      { key: 'subject_id', label: 'Materia' }
    ];

    columns.forEach(col => {
      const uniqueValues = [...new Set(data.map(row => row[col.key]))].sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
      });

      const filterGroup = document.createElement('div');
      filterGroup.className = 'filter-group';

      const label = document.createElement('label');
      label.textContent = col.label;
      label.htmlFor = `filter-${col.key}`;

      const select = document.createElement('select');
      select.id = `filter-${col.key}`;
      select.dataset.column = col.key;

      // Add "All" option
      const allOption = document.createElement('option');
      allOption.value = '';
      allOption.textContent = `Todos`;
      select.appendChild(allOption);

      // Add options for each unique value
      uniqueValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = formatCellValue(col.key, value);
        select.appendChild(option);
      });

      select.addEventListener('change', () => {
        const column = select.dataset.column;
        const value = select.value;
        if (value === '') {
          delete activeFilters[column];
        } else {
          activeFilters[column] = value;
        }
        saveState();
        applyFilters();
      });

      filterGroup.appendChild(label);
      filterGroup.appendChild(select);
      filterControls.appendChild(filterGroup);
    });
  }

  /**
   * Apply active filters to the data
   */
  function applyFilters() {
    filteredData = summariesData.data.filter(row => {
      for (const [column, value] of Object.entries(activeFilters)) {
        if (String(row[column]) !== String(value)) {
          return false;
        }
      }
      return true;
    });
    renderTable(filteredData);
  }

  /**
   * Sort data by column
   */
  function sortData(data, column, direction) {
    const sorted = [...data].sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];

      // Handle null/undefined
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // String comparison
      const aStr = String(aVal);
      const bStr = String(bVal);
      const comparison = aStr.localeCompare(bStr);
      return direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * Format cell values for display
   */
  function formatCellValue(column, value) {
    if (value == null) return '—';

    switch (column) {
      case 'evaluation_grade':
        return `${value}°`;
      case 'school_id':
        return `Escuela ${value}`;
      case 'subject_id':
        return value === 'L' ? 'Lengua' : value === 'M' ? 'Matemática' : value;
      case 'n_students':
        return value.toLocaleString();
      case 'kr20':
      case 'mean_score':
      case 'std_score':
      case 'standard_error':
        return typeof value === 'number' ? value.toFixed(3) : value;
      default:
        return value;
    }
  }

  /**
   * Render the data table
   */
  function renderTable(data) {
    const tbody = document.getElementById('stats-table-body');
    
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="loading-message">No hay datos que mostrar</td></tr>';
      return;
    }

    tbody.innerHTML = '';

    data.forEach(row => {
      const tr = document.createElement('tr');

      const columns = [
        'evaluation_grade',
        'school_id',
        'subject_id',
        'n_students',
        'mean_score',
        'std_score',
        'standard_error',
        'kr20',
      ];

      columns.forEach(col => {
        const td = document.createElement('td');
        td.textContent = formatCellValue(col, row[col]);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    // Update sort button states
    updateSortButtons();
  }

  /**
   * Update sort button visual states
   */
  function updateSortButtons() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.textContent = '↕';
    });

    if (currentSortColumn) {
      const btn = document.querySelector(`[data-sort="${currentSortColumn}"]`);
      if (btn) {
        btn.classList.add('active');
        btn.textContent = currentSortDirection === 'asc' ? '↑' : '↓';
      }
    }
  }

  /**
   * Setup sort button handlers
   */
  function setupSortHandlers() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const column = btn.dataset.sort;
        
        if (currentSortColumn === column) {
          // Toggle direction
          currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          // New column, default to ascending
          currentSortColumn = column;
          currentSortDirection = 'asc';
        }

        saveState();
        const sorted = sortData(filteredData, currentSortColumn, currentSortDirection);
        renderTable(sorted);
      });
    });
  }

  /**
   * Show error message
   */
  function showError(message) {
    const tbody = document.getElementById('stats-table-body');
    tbody.innerHTML = `<tr><td colspan="8" class="loading-message" style="color: #c62828;">${message}</td></tr>`;
  }

  /**
   * Save current state to localStorage
   */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(activeFilters));
      localStorage.setItem(STORAGE_KEY_SORT, JSON.stringify({
        column: currentSortColumn,
        direction: currentSortDirection
      }));
    } catch (error) {
      console.warn('Failed to save estadisticas state to localStorage:', error);
    }
  }

  /**
   * Load and restore state from localStorage
   */
  function restoreState() {
    try {
      const savedFilters = localStorage.getItem(STORAGE_KEY_FILTERS);
      const savedSort = localStorage.getItem(STORAGE_KEY_SORT);
      
      if (savedFilters) {
        activeFilters = JSON.parse(savedFilters);
        // Update select elements
        Object.entries(activeFilters).forEach(([column, value]) => {
          const select = document.getElementById(`filter-${column}`);
          if (select) {
            select.value = value;
          }
        });
      }
      
      if (savedSort) {
        const sort = JSON.parse(savedSort);
        currentSortColumn = sort.column;
        currentSortDirection = sort.direction;
      }
    } catch (error) {
      console.warn('Failed to restore estadisticas state from localStorage:', error);
    }
  }

  /**
   * Initialize the Estadísticas tab
   */
  function initEstadisticasTab() {
    console.log("Estadísticas tab initialized");
    loadSummaries();
    setupSortHandlers();
    // Restore will be called after filters are built in loadSummaries
  }

  // Initialize when the estadisticas tab becomes active
  window.addEventListener("tabChanged", (event) => {
    if (event.detail.tabId === "estadisticas") {
      // Estadísticas tab is now active
      if (!window.__estadisticasTabInitialized) {
        initEstadisticasTab();
        window.__estadisticasTabInitialized = true;
      }
    }
  });

  // Also initialize immediately if estadisticas tab is already active on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const estadisticasTab = document.querySelector('[data-tab-content="estadisticas"]');
      if (estadisticasTab && estadisticasTab.classList.contains("active")) {
        initEstadisticasTab();
        window.__estadisticasTabInitialized = true;
      }
    });
  } else {
    const estadisticasTab = document.querySelector('[data-tab-content="estadisticas"]');
    if (estadisticasTab && estadisticasTab.classList.contains("active")) {
      initEstadisticasTab();
      window.__estadisticasTabInitialized = true;
    }
  }
})();
