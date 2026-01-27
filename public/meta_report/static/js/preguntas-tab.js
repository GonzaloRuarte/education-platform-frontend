/**
 * Preguntas Tab Module
 * Handles question statistics and visualizations
 */
(function () {
  // Storage key prefix for this tab
  const STORAGE_PREFIX = 'reporteMeta.preguntas.';
  const STORAGE_KEY_SUBJECT = STORAGE_PREFIX + 'subject';

  let questionsData = null;
  let filters = {
    subject: ''
  };
  let tooltip = null;
  
  // Dynamic color mappings - will be built from data
  let mathColorMap = {};
  let languageColorMap = {};

  // Color palettes by subject
  // Matemática: violet to green gradient
  const mathPalette = [
    '#7c3aed',  // violet-600
    '#6366f1',  // indigo-500
    '#3b82f6',  // blue-500
    '#0ea5e9',  // sky-500
    '#14b8a6',  // teal-500
    '#10b981',  // emerald-500
    '#22c55e',  // green-500
  ];

  // Lengua: pink to yellow gradient
  const languagePalette = [
    '#ec4899',  // pink-500
    '#f43f5e',  // rose-500
    '#ef4444',  // red-500
    '#f97316',  // orange-500
    '#f59e0b',  // amber-500
    '#eab308',  // yellow-500
    '#fde047',  // yellow-300
  ];

  // Darker versions of palettes for hover/selection
  const mathPaletteDark = [
    '#6d28d9',  // violet-700
    '#4f46e5',  // indigo-600
    '#2563eb',  // blue-600
    '#0284c7',  // sky-600
    '#0d9488',  // teal-600
    '#059669',  // emerald-600
    '#16a34a',  // green-600
  ];

  const languagePaletteDark = [
    '#db2777',  // pink-600
    '#e11d48',  // rose-600
    '#dc2626',  // red-600
    '#ea580c',  // orange-600
    '#d97706',  // amber-600
    '#ca8a04',  // yellow-600
    '#facc15',  // yellow-400
  ];

  /**
   * Build color maps from the data
   */
  function buildColorMaps() {
    if (!questionsData) return;

    const mathCompetencias = new Set();
    const languageCompetencias = new Set();

    Object.entries(questionsData).forEach(([qid, data]) => {
      const subject = parseQuestionId(qid);
      const comp = data.competencia || 'Sin especificar';
      
      if (subject === 'M') {
        mathCompetencias.add(comp);
      } else if (subject === 'L') {
        languageCompetencias.add(comp);
      }
    });

    // Build math color map - spread colors evenly across the palette
    const mathComps = Array.from(mathCompetencias).sort();
    mathColorMap = {};
    mathComps.forEach((comp, index) => {
      // Spread indices evenly across the palette
      const paletteIndex = mathComps.length === 1 ? 0 : 
        Math.round(index * (mathPalette.length - 1) / (mathComps.length - 1));
      mathColorMap[comp] = {
        normal: mathPalette[paletteIndex],
        dark: mathPaletteDark[paletteIndex]
      };
    });

    // Build language color map - spread colors evenly across the palette
    const langComps = Array.from(languageCompetencias).sort();
    languageColorMap = {};
    langComps.forEach((comp, index) => {
      // Spread indices evenly across the palette
      const paletteIndex = langComps.length === 1 ? 0 : 
        Math.round(index * (languagePalette.length - 1) / (langComps.length - 1));
      languageColorMap[comp] = {
        normal: languagePalette[paletteIndex],
        dark: languagePaletteDark[paletteIndex]
      };
    });

    console.log('Math competencias:', mathComps);
    console.log('Language competencias:', langComps);

    // Update the legend
    updateColorLegend();
  }

  /**
   * Update the color legend display
   */
  function updateColorLegend() {
    const legendContent = document.getElementById('questions-legend-content');
    if (!legendContent) return;

    let html = '';

    // Lengua legend
    if (Object.keys(languageColorMap).length > 0) {
      html += `
        <div class="legend-group">
          <span class="legend-group-title">Lengua:</span>
          <div class="legend-items">
      `;
      Object.entries(languageColorMap).forEach(([comp, colors]) => {
        html += `
          <div class="legend-item">
            <span class="legend-color" style="background-color: ${colors.normal}"></span>
            <span class="legend-label">${comp}</span>
          </div>
        `;
      });
      html += `</div></div>`;
    }

    // Matemática legend
    if (Object.keys(mathColorMap).length > 0) {
      html += `
        <div class="legend-group">
          <span class="legend-group-title">Matemática:</span>
          <div class="legend-items">
      `;
      Object.entries(mathColorMap).forEach(([comp, colors]) => {
        html += `
          <div class="legend-item">
            <span class="legend-color" style="background-color: ${colors.normal}"></span>
            <span class="legend-label">${comp}</span>
          </div>
        `;
      });
      html += `</div></div>`;
    }

    legendContent.innerHTML = html;
  }

  /**
   * Get bar color based on subject and competencia
   */
  function getBarColor(questionId, competencia) {
    const subject = parseQuestionId(questionId);
    const comp = competencia || 'Sin especificar';
    
    if (subject === 'M' && mathColorMap[comp]) {
      return mathColorMap[comp].normal;
    } else if (subject === 'L' && languageColorMap[comp]) {
      return languageColorMap[comp].normal;
    }
    return '#94a3b8'; // fallback gray
  }

  /**
   * Get darker version of bar color for hover/selection
   */
  function getDarkerBarColor(questionId, competencia) {
    const subject = parseQuestionId(questionId);
    const comp = competencia || 'Sin especificar';
    
    if (subject === 'M' && mathColorMap[comp]) {
      return mathColorMap[comp].dark;
    } else if (subject === 'L' && languageColorMap[comp]) {
      return languageColorMap[comp].dark;
    }
    return '#64748b'; // fallback darker gray
  }

  /**
   * Parse question ID to extract subject
   */
  function parseQuestionId(qid) {
    // Question ID format: "L_123" or "M_456"
    const match = qid.match(/^([LM])_/);
    return match ? match[1] : null;
  }

  /**
   * Filter questions based on current filter values
   */
  function filterQuestions() {
    if (!questionsData) return [];

    return Object.entries(questionsData).filter(([qid, data]) => {
      const subject = parseQuestionId(qid);
      if (!subject) return false;

      if (filters.subject && subject !== filters.subject) return false;

      return true;
    });
  }

  /**
   * Build filter options from data
   */
  function buildFilterOptions() {
    if (!questionsData) return;

    const subjects = new Set();

    Object.keys(questionsData).forEach(qid => {
      const subject = parseQuestionId(qid);
      if (subject) {
        subjects.add(subject);
      }
    });

    // Populate subject filter
    const subjectSelect = document.getElementById('filter-question-subject');
    if (subjectSelect) {
      subjectSelect.innerHTML = '<option value="">Todas</option>';
      const subjectNames = { 'L': 'Lengua', 'M': 'Matemática' };
      Array.from(subjects).sort().forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subjectNames[subject] || subject;
        subjectSelect.appendChild(option);
      });
    }
  }

  /**
   * Setup filter controls
   */
  function setupFilterControls() {
    const subjectSelect = document.getElementById('filter-question-subject');

    if (subjectSelect) {
      subjectSelect.addEventListener('change', () => {
        filters.subject = subjectSelect.value;
        saveState();
        renderChart();
      });
    }
  }

  /**
   * Create tooltip element
   */
  function createTooltip() {
    tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip');
  }

  /**
   * Show tooltip
   */
  function showTooltip(event, questionId, mean, count, questionText) {
    const displayText = questionText || 'Sin texto';
    tooltip
      .html(`
        <div class="tooltip-id">Pregunta: ${questionId}</div>
        <div class="tooltip-question">${displayText}</div>
        <div class="tooltip-score">Promedio: ${(mean * 100).toFixed(1)}%</div>
        <div class="tooltip-score">Respuestas: ${count}</div>
      `)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 28) + 'px')
      .classed('visible', true);
  }

  /**
   * Hide tooltip
   */
  function hideTooltip() {
    tooltip.classed('visible', false);
  }

  /**
   * Update detail panel with question information
   */
  function updateDetailPanel(questionData) {
    const detailContent = document.getElementById('question-detail-content');
    if (!detailContent) return;

    const questionText = questionData.question || 'Sin texto disponible';
    const meanPercent = (questionData.normalizedMean * 100).toFixed(1);
    const competencia = questionData.competencia || 'No especificada';
    const contenido = questionData.contenido || 'No especificado';
    
    const subjectNames = { 'L': 'Lengua', 'M': 'Matemática' };
    const subject = questionData.id.match(/^([LM])_/) ? subjectNames[questionData.id.match(/^([LM])_/)[1]] : 'No especificada';
    
    detailContent.innerHTML = `
      <div class="detail-item detail-item-stats">
        <div class="stat-row">
          <span class="detail-label">Texto</span>
          <span class="detail-value question-text">${questionText}</span>
        </div>
        <div class="stat-row">
          <span class="detail-label">Respuestas</span>
          <span class="detail-value">${questionData.count}</span>
        </div>
        <div class="stat-row">
          <span class="detail-label">Promedio</span>
          <span class="detail-value large">${meanPercent}%</span>
        </div>
      </div>
      <div class="detail-item detail-item-stats">
        <div class="stat-row">
          <span class="detail-label">Materia</span>
          <span class="detail-value">${subject}</span>
        </div>
        <div class="stat-row">
          <span class="detail-label">Competencia</span>
          <span class="detail-value">${competencia}</span>
        </div>
        <div class="stat-row">
          <span class="detail-label">Contenido</span>
          <span class="detail-value">${contenido}</span>
        </div>
      </div>
    `;
  }

  /**
   * Render the bar chart
   */
  function renderChart() {
    if (!questionsData) return;

    const container = d3.select('#questions-chart-container');
    container.selectAll('*').remove();

    // Filter and convert to array
    const filteredEntries = filterQuestions();
    
    if (filteredEntries.length === 0) {
      container.append('div')
        .style('padding', '2rem')
        .style('text-align', 'center')
        .style('color', '#64748b')
        .text('No hay datos de preguntas para los filtros seleccionados');
      return;
    }

    const questionsArray = filteredEntries.map(([qid, data]) => ({
      id: qid,
      mean: data.mean || 0,
      count: data.count || 0,
      question: data.question || '',
      competencia: data.competencia || null,
      contenido: data.contenido || null
    })).sort((a, b) => a.mean - b.mean);

    // Find min/max values for normalization
    const minMean = d3.min(questionsArray, d => d.mean);
    const maxMean = d3.max(questionsArray, d => d.mean);

    console.log('Questions data range:', { minMean, maxMean, count: questionsArray.length });

    // Normalize function: converts raw score to 0-1 range
    const normalize = (value) => {
      if (maxMean === minMean) return 0.5;
      return (value - minMean) / (maxMean - minMean);
    };

    // Add normalized values
    questionsArray.forEach(d => {
      d.normalizedMean = normalize(d.mean);
    });

    // Get container dimensions
    const containerNode = container.node();
    const containerRect = containerNode.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = container.append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleBand()
      .domain(questionsArray.map(d => d.id))
      .range([0, chartWidth])
      .padding(0);  // Sin espaciado entre barras

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([chartHeight, 0]);

    // Add axes
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickValues([]));

    const yAxis = g.append('g')
      .call(d3.axisLeft(yScale).ticks(10).tickFormat(d => (d * 100).toFixed(0) + '%'));

    // Style axes
    yAxis.selectAll('text')
      .style('font-size', '0.85rem')
      .style('fill', '#64748b');

    yAxis.selectAll('line')
      .style('stroke', '#e2e8f0');

    xAxis.selectAll('line')
      .style('stroke', '#e2e8f0');

    g.selectAll('.domain')
      .style('stroke', '#cbd5e1');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .ticks(10)
        .tickSize(-chartWidth)
        .tickFormat('')
      )
      .style('stroke', '#f1f5f9')
      .style('stroke-opacity', 0.7)
      .selectAll('.domain')
      .remove();

    // Add bars
    const bars = g.selectAll('.bar')
      .data(questionsArray)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.id) - 0.5)  // Slight negative offset
      .attr('y', d => yScale(d.normalizedMean))
      .attr('width', xScale.bandwidth() + 1)  // Slightly wider to overlap
      .attr('height', d => chartHeight - yScale(d.normalizedMean))
      .attr('fill', d => getBarColor(d.id, d.competencia))
      .attr('stroke', 'none')
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        // Remove highlight from all bars
        g.selectAll('.bar')
          .attr('fill', data => getBarColor(data.id, data.competencia))
          .attr('stroke', 'none');
        
        // Highlight clicked bar
        d3.select(this)
          .attr('fill', getDarkerBarColor(d.id, d.competencia))
          .attr('stroke', '#1f3a93')
          .attr('stroke-width', 2);
        
        // Update detail panel
        updateDetailPanel(d);
      })
      .on('mouseover', function(event, d) {
        // Only change opacity if not selected
        const isSelected = d3.select(this).attr('stroke') !== 'none';
        if (!isSelected) {
          d3.select(this).attr('fill', getDarkerBarColor(d.id, d.competencia));
        }
        showTooltip(event, d.id, d.normalizedMean, d.count, d.question);
      })
      .on('mousemove', function(event, d) {
        showTooltip(event, d.id, d.normalizedMean, d.count, d.question);
      })
      .on('mouseout', function(event, d) {
        // Only restore color if not selected
        const isSelected = d3.select(this).attr('stroke') !== 'none';
        if (!isSelected) {
          d3.select(this).attr('fill', getBarColor(d.id, d.competencia));
        }
        hideTooltip();
      });

    // Add Y-axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2))
      .attr('y', 15)
      .style('text-anchor', 'middle')
      .style('font-size', '0.9rem')
      .style('fill', '#475569')
      .style('font-weight', '600')
      .text('Promedio de Aciertos');

    // Add X-axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .style('text-anchor', 'middle')
      .style('font-size', '0.9rem')
      .style('fill', '#475569')
      .style('font-weight', '600')
      .text(`Preguntas (${questionsArray.length} total)`);
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    if (questionsData) {
      renderChart();
    }
  }

  /**
   * Load questions statistics from the server
   */
  function loadQuestionsStats() {
    console.log('Loading questions statistics...');
    
    fetch('/questions_stats', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        questionsData = data;
        console.log('Questions data loaded:', data);
        console.log('Total questions:', Object.keys(data).length);
        buildColorMaps();
        buildFilterOptions();
        renderChart();
      })
      .catch(error => {
        console.error('Failed to load questions statistics:', error);
        const container = d3.select('#questions-chart-container');
        container.append('div')
          .style('padding', '2rem')
          .style('text-align', 'center')
          .style('color', '#c62828')
          .text('Error al cargar los datos de preguntas');
      });
  }

  /**
   * Save current state to localStorage
   */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_SUBJECT, filters.subject);
    } catch (error) {
      console.warn('Failed to save preguntas state to localStorage:', error);
    }
  }

  /**
   * Load and restore state from localStorage
   */
  function restoreState() {
    try {
      const savedSubject = localStorage.getItem(STORAGE_KEY_SUBJECT);
      if (savedSubject) {
        filters.subject = savedSubject;
        const subjectSelect = document.getElementById('filter-question-subject');
        if (subjectSelect) {
          subjectSelect.value = savedSubject;
        }
      }
    } catch (error) {
      console.warn('Failed to restore preguntas state from localStorage:', error);
    }
  }

  /**
   * Initialize the Preguntas tab
   */
  function initPreguntasTab() {
    console.log("Preguntas tab initialized");
    createTooltip();
    setupFilterControls();
    restoreState();
    loadQuestionsStats();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
  }

  // Initialize when the preguntas tab becomes active
  window.addEventListener("tabChanged", (event) => {
    if (event.detail.tabId === "preguntas") {
      if (!window.__preguntasTabInitialized) {
        initPreguntasTab();
        window.__preguntasTabInitialized = true;
      }
    }
  });

  // Also initialize immediately if preguntas tab is already active on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const preguntasTab = document.querySelector('[data-tab-content="preguntas"]');
      if (preguntasTab && preguntasTab.classList.contains("active")) {
        initPreguntasTab();
        window.__preguntasTabInitialized = true;
      }
    });
  } else {
    const preguntasTab = document.querySelector('[data-tab-content="preguntas"]');
    if (preguntasTab && preguntasTab.classList.contains("active")) {
      initPreguntasTab();
      window.__preguntasTabInitialized = true;
    }
  }
})();
