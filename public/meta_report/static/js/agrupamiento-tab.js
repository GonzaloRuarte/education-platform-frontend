/**
 * agrupamiento-tab.js
 * Handles the Agrupamiento (Clustering) tab functionality
 */

(function () {
  'use strict';

  // Storage key prefix for this tab
  const STORAGE_PREFIX = 'reporteMeta.agrupamiento.';
  const STORAGE_KEY_GRADE = STORAGE_PREFIX + 'grade';
  const STORAGE_KEY_SUBJECT = STORAGE_PREFIX + 'subject';

  // State
  let availableGrades = [];
  let availableDatasets = [];
  let currentGrade = '';
  let currentSubject = '';
  let clusterData = null;

  // DOM Elements
  let gradeSelect;
  let subjectSelect;
  let clustersContainer;

  /**
   * Initialize the Agrupamiento tab
   */
  function init() {
    // Get DOM elements
    gradeSelect = document.getElementById('agrupamiento-grade-select');
    subjectSelect = document.getElementById('agrupamiento-subject-select');
    clustersContainer = document.getElementById('agrupamiento-clusters-container');

    if (!gradeSelect || !subjectSelect || !clustersContainer) {
      console.error('Agrupamiento tab: Required DOM elements not found');
      return;
    }

    // Setup event listeners
    gradeSelect.addEventListener('change', handleGradeChange);
    subjectSelect.addEventListener('change', handleSubjectChange);

    // Load available datasets
    loadDatasets();
  }

  /**
   * Load available datasets from the server
   */
  async function loadDatasets() {
    try {
      const response = await fetch('/datasets');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      availableGrades = data.grades || [];
      availableDatasets = data.datasets || [];
      
      populateGradeSelect();
      
      // Restore state from localStorage after grades are loaded
      restoreState();
    } catch (error) {
      console.error('Error loading datasets:', error);
      showError('Error al cargar los datos disponibles');
    }
  }

  /**
   * Populate the grade select dropdown
   */
  function populateGradeSelect() {
    gradeSelect.innerHTML = '<option value="">Seleccionar...</option>';
    
    availableGrades.forEach(grade => {
      const option = document.createElement('option');
      option.value = grade.id;
      option.textContent = grade.label;
      gradeSelect.appendChild(option);
    });
  }

  /**
   * Handle grade selection change
   */
  function handleGradeChange(event) {
    currentGrade = event.target.value;
    
    // Reset subject selection
    currentSubject = '';
    subjectSelect.value = '';
    
    // Clear clusters display
    clearClusters();
    
    // Save state to localStorage
    saveState();
    
    if (!currentGrade) {
      subjectSelect.disabled = true;
      subjectSelect.innerHTML = '<option value="">Seleccionar...</option>';
      return;
    }
    
    // Populate subject select based on selected grade
    populateSubjectSelect();
    subjectSelect.disabled = false;
  }

  /**
   * Populate the subject select dropdown based on selected grade
   */
  function populateSubjectSelect() {
    subjectSelect.innerHTML = '<option value="">Seleccionar...</option>';
    
    // Find datasets for the selected grade
    const gradeDatasets = availableDatasets.filter(ds => ds.grade_id === currentGrade);
    
    // Create a map of unique subjects
    const subjects = new Map();
    gradeDatasets.forEach(ds => {
      if (!subjects.has(ds.id)) {
        subjects.set(ds.id, ds.label);
      }
    });
    
    // Add options to select
    subjects.forEach((label, id) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = label;
      subjectSelect.appendChild(option);
    });
  }

  /**
   * Handle subject selection change
   */
  function handleSubjectChange(event) {
    currentSubject = event.target.value;
    
    // Save state to localStorage
    saveState();
    
    if (!currentSubject) {
      clearClusters();
      return;
    }
    
    // Load cluster data
    loadClusterData();
  }

  /**
   * Load cluster summary data from the server
   */
  async function loadClusterData() {
    if (!currentGrade || !currentSubject) {
      return;
    }
    
    try {
      showLoading();
      
      const url = `/datasets/${currentGrade}/${currentSubject}/cluster_summary`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      clusterData = await response.json();
      renderClusters();
      
    } catch (error) {
      console.error('Error loading cluster data:', error);
      showError('Error al cargar los datos de clusters');
    }
  }

  /**
   * Render cluster panels
   */
  function renderClusters() {
    if (!clusterData) {
      clearClusters();
      return;
    }
    
    clustersContainer.innerHTML = '';
    
    // Get cluster IDs (they are the keys in the JSON)
    const clusterIds = Object.keys(clusterData.scores_mean || {}).sort((a, b) => parseInt(a) - parseInt(b));
    
    if (clusterIds.length === 0) {
      showError('No hay datos de clusters disponibles');
      return;
    }
    
    // Create a panel for each cluster
    clusterIds.forEach(clusterId => {
      const panel = createClusterPanel(clusterId);
      clustersContainer.appendChild(panel);
    });
  }

  /**
   * Create a cluster panel element
   */
  function createClusterPanel(clusterId) {
    const panel = document.createElement('div');
    panel.className = 'cluster-panel';
    panel.setAttribute('data-cluster', clusterId);
    
    // Get data for this cluster
    const nStudents = clusterData.n_students?.[clusterId] || 0;
    const scoresMean = clusterData.scores_mean?.[clusterId] || 0;
    const studentIds = clusterData.student_ids?.[clusterId] || [];
    
    // Get competencia scores
    const competencias = [];
    for (const key in clusterData) {
      if (key !== 'scores_mean' && key !== 'n_students' && key !== 'student_ids' && clusterData[key]?.[clusterId] !== undefined) {
        competencias.push({
          name: formatCompetenciaName(key),
          value: clusterData[key][clusterId]
        });
      }
    }
    
    // Build panel HTML
    panel.innerHTML = `
      <div class="cluster-panel-header">
        <h3 class="cluster-panel-title">Grupo ${clusterId}</h3>
        <span class="cluster-panel-count tag-pill">${nStudents} estudiante${nStudents !== 1 ? 's' : ''}</span>
      </div>
      
      <div class="cluster-panel-body">
        <div class="cluster-metric">
          <span class="cluster-metric-label">Promedio Global</span>
          <span class="cluster-metric-value tag-pill"><span class="tag-pill-value">${formatPercent(scoresMean)}</span></span>
        </div>
        
        ${competencias.map(comp => `
          <div class="cluster-metric">
            <span class="cluster-metric-label">${comp.name}</span>
            <span class="cluster-metric-value tag-pill"><span class="tag-pill-value">${formatPercent(comp.value)}</span></span>
          </div>
        `).join('')}
      </div>
      
      <div class="cluster-panel-footer">
        <button class="cluster-download-btn" data-cluster-id="${clusterId}">
          <span>⬇</span>
          <span>Descargar IDs de Estudiantes</span>
        </button>
      </div>
    `;
    
    // Add download button event listener
    const downloadBtn = panel.querySelector('.cluster-download-btn');
    downloadBtn.addEventListener('click', () => downloadStudentIds(clusterId, studentIds));
    
    return panel;
  }

  /**
   * Format competencia name for display
   */
  function formatCompetenciaName(name) {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Format a number as percentage
   */
  function formatPercent(value) {
    if (value === null || value === undefined || isNaN(value)) {
      return '—';
    }
    return `${(value * 100).toFixed(1)}%`;
  }

  /**
   * Download student IDs as CSV
   */
  function downloadStudentIds(clusterId, studentIds) {
    if (!studentIds || studentIds.length === 0) {
      alert('No hay IDs de estudiantes disponibles para este cluster');
      return;
    }
    
    // Create CSV content
    const csvContent = 'student_id\n' + studentIds.join('\n');
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `cluster_${clusterId}_grade_${currentGrade}_${currentSubject}_students.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Show loading message
   */
  function showLoading() {
    clustersContainer.innerHTML = '<p class="agrupamiento-placeholder">Cargando datos...</p>';
  }

  /**
   * Show error message
   */
  function showError(message) {
    clustersContainer.innerHTML = `<p class="agrupamiento-placeholder" style="color: #ef4444;">${message}</p>`;
  }

  /**
   * Clear clusters display
   */
  function clearClusters() {
    clustersContainer.innerHTML = '<p class="agrupamiento-placeholder">Seleccione un grado y una materia para ver los clusters</p>';
    clusterData = null;
  }

  /**
   * Save current state to localStorage
   */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_GRADE, currentGrade);
      localStorage.setItem(STORAGE_KEY_SUBJECT, currentSubject);
    } catch (error) {
      console.warn('Failed to save agrupamiento state to localStorage:', error);
    }
  }

  /**
   * Load and restore state from localStorage
   */
  function restoreState() {
    try {
      const savedGrade = localStorage.getItem(STORAGE_KEY_GRADE);
      const savedSubject = localStorage.getItem(STORAGE_KEY_SUBJECT);
      
      if (savedGrade && gradeSelect) {
        gradeSelect.value = savedGrade;
        currentGrade = savedGrade;
        
        // Populate subjects for this grade
        if (currentGrade) {
          populateSubjectSelect();
          subjectSelect.disabled = false;
          
          // Restore subject selection if available
          if (savedSubject && Array.from(subjectSelect.options).some(opt => opt.value === savedSubject)) {
            subjectSelect.value = savedSubject;
            currentSubject = savedSubject;
            
            // Load the cluster data for this selection
            if (currentGrade && currentSubject) {
              loadClusterData();
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to restore agrupamiento state from localStorage:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
