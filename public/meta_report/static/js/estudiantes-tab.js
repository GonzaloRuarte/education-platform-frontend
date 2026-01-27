/**
 * Estudiantes Tab Module
 * Handles student statistics and visualizations
 */
(function () {
  // Storage key prefix for this tab
  const STORAGE_PREFIX = 'reporteMeta.estudiantes.';
  const STORAGE_KEY_FILTERS = STORAGE_PREFIX + 'filters';
  const STORAGE_KEY_THRESHOLDS = STORAGE_PREFIX + 'thresholds';

  let studentsData = null;
  let filteredData = null;
  let thresholds = {
    redYellow: 0.40,
    yellowGreen: 0.60
  };
  let filters = {
    grade: '',
    school: '',
    subject: ''
  };
  let chartDimensions = null;
  let tooltip = null;

  /**
   * Parse student ID key (student_id, grade, school, subject)
   */
  function parseStudentKey(key) {
    // Key format: "(227, 7, 22, 'L')" o "(228, 10, 23, 'M')"
    const match = key.match(/\((\d+),\s*(\d+),\s*(\d+),\s*'([LM])'\)/);
    if (match) {
      return {
        studentId: parseInt(match[1]),
        grade: parseInt(match[2]),
        school: parseInt(match[3]),
        subject: match[4]
      };
    }
    return null;
  }

  /**
   * Filter students based on current filter values
   */
  function filterStudents() {
    if (!studentsData) return [];

    return Object.entries(studentsData).filter(([key, data]) => {
      const parsed = parseStudentKey(key);
      if (!parsed) return false;

      if (filters.grade && parsed.grade !== parseInt(filters.grade)) return false;
      if (filters.school && parsed.school !== parseInt(filters.school)) return false;
      if (filters.subject && parsed.subject !== filters.subject) return false;

      return true;
    });
  }

  /**
   * Build filter options from data
   */
  function buildFilterOptions() {
    if (!studentsData) return;

    const grades = new Set();
    const schools = new Set();
    const subjects = new Set();

    Object.keys(studentsData).forEach(key => {
      const parsed = parseStudentKey(key);
      if (parsed) {
        grades.add(parsed.grade);
        schools.add(parsed.school);
        subjects.add(parsed.subject);
      }
    });

    // Populate grade filter
    const gradeSelect = document.getElementById('filter-grade');
    if (gradeSelect) {
      gradeSelect.innerHTML = '<option value="">Todos</option>';
      Array.from(grades).sort((a, b) => a - b).forEach(grade => {
        const option = document.createElement('option');
        option.value = grade;
        option.textContent = `${grade}°`;
        gradeSelect.appendChild(option);
      });
    }

    // Populate school filter
    const schoolSelect = document.getElementById('filter-school');
    if (schoolSelect) {
      schoolSelect.innerHTML = '<option value="">Todas</option>';
      Array.from(schools).sort((a, b) => a - b).forEach(school => {
        const option = document.createElement('option');
        option.value = school;
        option.textContent = school;
        schoolSelect.appendChild(option);
      });
    }

    // Populate subject filter
    const subjectSelect = document.getElementById('filter-subject');
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
    const gradeSelect = document.getElementById('filter-grade');
    const schoolSelect = document.getElementById('filter-school');
    const subjectSelect = document.getElementById('filter-subject');

    if (gradeSelect) {
      gradeSelect.addEventListener('change', () => {
        filters.grade = gradeSelect.value;
        saveState();
        renderChart();
      });
    }

    if (schoolSelect) {
      schoolSelect.addEventListener('change', () => {
        filters.school = schoolSelect.value;
        saveState();
        renderChart();
      });
    }

    if (subjectSelect) {
      subjectSelect.addEventListener('change', () => {
        filters.subject = subjectSelect.value;
        saveState();
        renderChart();
      });
    }
  }
  function getBarColor(score) {
    if (score < thresholds.redYellow) {
      return '#ef4444'; // Red
    } else if (score < thresholds.yellowGreen) {
      return '#f59e0b'; // Yellow
    } else {
      return '#22c55e'; // Green
    }
  }

  /**
   * Get darker version of bar color for hover
   */
  function getDarkerBarColor(score) {
    if (score < thresholds.redYellow) {
      return '#dc2626'; // Darker Red
    } else if (score < thresholds.yellowGreen) {
      return '#d97706'; // Darker Yellow
    } else {
      return '#16a34a'; // Darker Green
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
  function showTooltip(event, studentKey, normalizedScore, rawScore) {
    // Parse student key to extract only student ID
    const parsed = parseStudentKey(studentKey);
    const studentId = parsed ? parsed.studentId : studentKey;
    
    tooltip
      .html(`
        <div class="tooltip-id">Estudiante: ${studentId}</div>
        <div class="tooltip-score">Puntaje: ${(normalizedScore * 100).toFixed(1)}%</div>
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
   * Get student data for both subjects (Lengua and Matemática)
   */
  function getStudentFullData(studentId, grade, school) {
    const lenguaKey = `(${studentId}, ${grade}, ${school}, 'L')`;
    const matemKey = `(${studentId}, ${grade}, ${school}, 'M')`;
    
    const lenguaData = studentsData[lenguaKey] || null;
    const matemData = studentsData[matemKey] || null;
    
    return {
      lengua: lenguaData ? {
        score: lenguaData.mean,
        count: lenguaData.count
      } : null,
      matematica: matemData ? {
        score: matemData.mean,
        count: matemData.count
      } : null
    };
  }

  /**
   * Update student detail panel with student information
   */
  function updateStudentDetailPanel(studentData) {
    const detailContent = document.getElementById('student-detail-content');
    if (!detailContent) return;

    const parsed = parseStudentKey(studentData.id);
    if (!parsed) {
      detailContent.innerHTML = '<p class="no-selection">Error al cargar datos del estudiante</p>';
      return;
    }

    // Get data for both subjects
    const fullData = getStudentFullData(parsed.studentId, parsed.grade, parsed.school);
    
    const lenguaScore = fullData.lengua ? (fullData.lengua.score * 100).toFixed(1) + '%' : 'N/A';
    const lenguaCount = fullData.lengua ? fullData.lengua.count : 'N/A';
    const matemScore = fullData.matematica ? (fullData.matematica.score * 100).toFixed(1) + '%' : 'N/A';
    const matemCount = fullData.matematica ? fullData.matematica.count : 'N/A';
    
    detailContent.innerHTML = `
      <div class="detail-item detail-item-stats">
        <div class="stat-row">
          <span class="detail-label">ID Estudiante</span>
          <span class="detail-value">${parsed.studentId}</span>
        </div>
        <div class="stat-row">
          <span class="detail-label">Escuela</span>
          <span class="detail-value">${parsed.school}</span>
        </div>
        <div class="stat-row">
          <span class="detail-label">Grado</span>
          <span class="detail-value">${parsed.grade}°</span>
        </div>
      </div>
      <div class="detail-item detail-item-stats">
        <div class="stat-row">
          <span class="detail-label">Lengua - Puntaje</span>
          <span class="detail-value">${lenguaScore}</span>
        </div>
        <div class="stat-row">
          <span class="detail-label">Lengua - Preguntas</span>
          <span class="detail-value">${lenguaCount}</span>
        </div>
      </div>
      <div class="detail-item detail-item-stats">
        <div class="stat-row">
          <span class="detail-label">Matemática - Puntaje</span>
          <span class="detail-value">${matemScore}</span>
        </div>
        <div class="stat-row">
          <span class="detail-label">Matemática - Preguntas</span>
          <span class="detail-value">${matemCount}</span>
        </div>
      </div>
    `;
  }

  /**
   * Render the bar chart
   */
  function renderChart() {
    if (!studentsData) return;

    const container = d3.select('#students-chart-container');
    container.selectAll('*').remove();

    // Filter and convert to array
    const filteredEntries = filterStudents();
    
    if (filteredEntries.length === 0) {
      container.append('div')
        .style('padding', '2rem')
        .style('text-align', 'center')
        .style('color', '#64748b')
        .text('No hay datos de estudiantes para los filtros seleccionados');
      
      // Reset color counts
      document.getElementById('count-red').textContent = '0';
      document.getElementById('count-yellow').textContent = '0';
      document.getElementById('count-green').textContent = '0';
      return;
    }

    const studentsArray = filteredEntries.map(([id, data]) => ({
      id,
      mean: data.mean || 0,
      count: data.count || 0
    })).sort((a, b) => a.mean - b.mean);

    // Find min/max values for normalization
    const minMean = d3.min(studentsArray, d => d.mean);
    const maxMean = d3.max(studentsArray, d => d.mean);

    console.log('Data range:', { minMean, maxMean, count: studentsArray.length });

    // Normalize function: converts raw score to 0-1 range
    const normalize = (value) => {
      if (maxMean === minMean) return 0.5;
      return (value - minMean) / (maxMean - minMean);
    };

    // Add normalized values
    studentsArray.forEach(d => {
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
      .domain(studentsArray.map(d => d.id))
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
      .data(studentsArray)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.id) - 0.5)  // Slight negative offset
      .attr('y', d => yScale(d.normalizedMean))
      .attr('width', xScale.bandwidth() + 1)  // Slightly wider to overlap
      .attr('height', d => chartHeight - yScale(d.normalizedMean))
      .attr('fill', d => getBarColor(d.normalizedMean))
      .attr('stroke', 'none')
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        // Remove highlight from all bars
        g.selectAll('.bar')
          .attr('fill', data => getBarColor(data.normalizedMean))
          .attr('stroke', 'none');
        
        // Highlight clicked bar
        d3.select(this)
          .attr('fill', getDarkerBarColor(d.normalizedMean))
          .attr('stroke', '#1f3a93')
          .attr('stroke-width', 2);
        
        // Update detail panel
        updateStudentDetailPanel(d);
      })
      .on('mouseover', function(event, d) {
        // Only change color if not selected
        const isSelected = d3.select(this).attr('stroke') !== 'none';
        if (!isSelected) {
          d3.select(this)
            .attr('fill', getDarkerBarColor(d.normalizedMean));
        }
        showTooltip(event, d.id, d.normalizedMean, d.mean);
      })
      .on('mousemove', function(event, d) {
        showTooltip(event, d.id, d.normalizedMean, d.mean);
      })
      .on('mouseout', function(event, d) {
        // Only restore color if not selected
        const isSelected = d3.select(this).attr('stroke') !== 'none';
        if (!isSelected) {
          d3.select(this)
            .attr('fill', getBarColor(d.normalizedMean));
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
      .text('Puntaje Promedio');

    // Add X-axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .style('text-anchor', 'middle')
      .style('font-size', '0.9rem')
      .style('fill', '#475569')
      .style('font-weight', '600')
      .text(`Estudiantes (${studentsArray.length} total)`);

    chartDimensions = { width, height, margin, chartWidth, chartHeight };
    
    // Update color counts after rendering
    updateColorCounts();
  }

  /**
   * Update chart colors based on new thresholds
   */
  function updateChartColors() {
    d3.selectAll('#students-chart-container .bar')
      .attr('fill', function() {
        const data = d3.select(this).datum();
        return getBarColor(data.normalizedMean);
      });
    
    updateColorCounts();
  }

  /**
   * Update color counts display
   */
  function updateColorCounts() {
    const bars = d3.selectAll('#students-chart-container .bar');
    let redCount = 0, yellowCount = 0, greenCount = 0;
    
    bars.each(function() {
      const data = d3.select(this).datum();
      const color = getBarColor(data.normalizedMean);
      if (color === '#ef4444') redCount++;
      else if (color === '#f59e0b') yellowCount++;
      else if (color === '#22c55e') greenCount++;
    });
    
    document.getElementById('count-red').textContent = redCount;
    document.getElementById('count-yellow').textContent = yellowCount;
    document.getElementById('count-green').textContent = greenCount;
  }

  /**
   * Setup threshold sliders
   */
  function setupThresholdControls() {
    const redYellowSlider = document.getElementById('threshold-red-yellow');
    const yellowGreenSlider = document.getElementById('threshold-yellow-green');
    const redYellowValue = document.getElementById('threshold-red-yellow-value');
    const yellowGreenValue = document.getElementById('threshold-yellow-green-value');

    if (!redYellowSlider || !yellowGreenSlider) return;

    // Update red-yellow threshold
    redYellowSlider.addEventListener('input', () => {
      const value = parseFloat(redYellowSlider.value);
      thresholds.redYellow = value;
      redYellowValue.textContent = value.toFixed(2);
      
      // Ensure red-yellow is less than yellow-green
      if (value >= thresholds.yellowGreen) {
        thresholds.yellowGreen = Math.min(1, value + 0.01);
        yellowGreenSlider.value = thresholds.yellowGreen;
        yellowGreenValue.textContent = thresholds.yellowGreen.toFixed(2);
      }
      
      saveState();
      updateChartColors();
    });

    // Update yellow-green threshold
    yellowGreenSlider.addEventListener('input', () => {
      const value = parseFloat(yellowGreenSlider.value);
      thresholds.yellowGreen = value;
      yellowGreenValue.textContent = value.toFixed(2);
      
      // Ensure yellow-green is greater than red-yellow
      if (value <= thresholds.redYellow) {
        thresholds.redYellow = Math.max(0, value - 0.01);
        redYellowSlider.value = thresholds.redYellow;
        redYellowValue.textContent = thresholds.redYellow.toFixed(2);
      }
      
      saveState();
      updateChartColors();
    });
  }

  /**
   * Load students statistics from the server
   */
  function loadStudentsStats() {
    console.log('Loading students statistics...');
    
    fetch('/students_stats', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        studentsData = data;
        console.log('Students data loaded:', data);
        console.log('Total students:', Object.keys(data).length);
        buildFilterOptions();
        renderChart();
      })
      .catch(error => {
        console.error('Failed to load students statistics:', error);
        const container = d3.select('#students-chart-container');
        container.append('div')
          .style('padding', '2rem')
          .style('text-align', 'center')
          .style('color', '#c62828')
          .text('Error al cargar los datos de estudiantes');
      });
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    if (studentsData) {
      renderChart();
    }
  }

  /**
   * Save current state to localStorage
   */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters));
      localStorage.setItem(STORAGE_KEY_THRESHOLDS, JSON.stringify(thresholds));
    } catch (error) {
      console.warn('Failed to save estudiantes state to localStorage:', error);
    }
  }

  /**
   * Load and restore state from localStorage
   */
  function restoreState() {
    try {
      const savedFilters = localStorage.getItem(STORAGE_KEY_FILTERS);
      const savedThresholds = localStorage.getItem(STORAGE_KEY_THRESHOLDS);
      
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        filters = { ...filters, ...parsedFilters };
        
        // Update UI elements
        const gradeSelect = document.getElementById('filter-grade');
        const schoolSelect = document.getElementById('filter-school');
        const subjectSelect = document.getElementById('filter-subject');
        
        if (gradeSelect) gradeSelect.value = filters.grade;
        if (schoolSelect) schoolSelect.value = filters.school;
        if (subjectSelect) subjectSelect.value = filters.subject;
      }
      
      if (savedThresholds) {
        const parsedThresholds = JSON.parse(savedThresholds);
        thresholds = { ...thresholds, ...parsedThresholds };
        
        // Update slider UI elements
        const redYellowSlider = document.getElementById('threshold-red-yellow');
        const yellowGreenSlider = document.getElementById('threshold-yellow-green');
        const redYellowValue = document.getElementById('threshold-red-yellow-value');
        const yellowGreenValue = document.getElementById('threshold-yellow-green-value');
        
        if (redYellowSlider) {
          redYellowSlider.value = thresholds.redYellow;
          if (redYellowValue) redYellowValue.textContent = thresholds.redYellow.toFixed(2);
        }
        if (yellowGreenSlider) {
          yellowGreenSlider.value = thresholds.yellowGreen;
          if (yellowGreenValue) yellowGreenValue.textContent = thresholds.yellowGreen.toFixed(2);
        }
      }
    } catch (error) {
      console.warn('Failed to restore estudiantes state from localStorage:', error);
    }
  }

  /**
   * Initialize the Estudiantes tab
   */
  function initEstudiantesTab() {
    console.log("Estudiantes tab initialized");
    createTooltip();
    setupFilterControls();
    setupThresholdControls();
    restoreState();
    loadStudentsStats();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
  }

  // Initialize when the estudiantes tab becomes active
  window.addEventListener("tabChanged", (event) => {
    if (event.detail.tabId === "estudiantes") {
      if (!window.__estudiantesTabInitialized) {
        initEstudiantesTab();
        window.__estudiantesTabInitialized = true;
      }
    }
  });

  // Also initialize immediately if estudiantes tab is already active on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const estudiantesTab = document.querySelector('[data-tab-content="estudiantes"]');
      if (estudiantesTab && estudiantesTab.classList.contains("active")) {
        initEstudiantesTab();
        window.__estudiantesTabInitialized = true;
      }
    });
  } else {
    const estudiantesTab = document.querySelector('[data-tab-content="estudiantes"]');
    if (estudiantesTab && estudiantesTab.classList.contains("active")) {
      initEstudiantesTab();
      window.__estudiantesTabInitialized = true;
    }
  }
})();
