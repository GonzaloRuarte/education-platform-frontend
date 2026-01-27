/**
 * Graph Tab Module
 * Handles the hierarchical clustering graph visualization
 */
(function () {
  // Storage key prefix for this tab
  const STORAGE_PREFIX = 'reporteMeta.graph.';
  const STORAGE_KEY_GRADE = STORAGE_PREFIX + 'grade';
  const STORAGE_KEY_DATASET = STORAGE_PREFIX + 'dataset';

  // Initialize only when graph tab is active
  function initGraphTab() {
    const gradeSelect = document.getElementById("grade-select");
    const dataSelect = document.getElementById("data-select");
    let jsonUrl = "hierarchical_clustering_graph.json";
    let dataUrl = "df_cat.json";
    let datasetLabel = "Conjunto de datos";
    let gradeEntries = [];
    let datasets = [];
    let datasetsByGrade = new Map();
    let datasetLookup = new Map();
    let gradeLabelById = new Map();
    let currentGradeId = null;
    let currentDatasetId = null;
    const container = d3.select("#viz-container");
    const status = d3.select("#status");
    const legend = d3.select("#legend");
    const legendCanvas = document.getElementById("legend-canvas");
    const legendCtx = legendCanvas ? legendCanvas.getContext("2d") : null;
    const legendMinLabel = d3.select("#legend-min");
    const legendMaxLabel = d3.select("#legend-max");
    const tableTitle = d3.select("#table-title");
    const tableContent = d3.select("#table-content");
    const histogramContainer = d3.select("#histogram");
    const histogramSvg = d3.select("#histogram-svg");
    const histogramMessage = d3.select("#histogram-message");
    const histogramWidth = Number(histogramSvg.attr("width")) || 180;
    const histogramHeight = Number(histogramSvg.attr("height")) || 110;
    const histogramMargin = { top: 8, right: 4, bottom: 24, left: 4 };
    histogramSvg
      .attr("viewBox", `0 0 ${histogramWidth} ${histogramHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    if (!histogramMessage.empty()) {
      histogramMessage.text("Los puntajes de hojas aparecen cuando se carga un conjunto de datos.");
    }

    let dfCatData = null;
    let currentGraphData = null;
    let currentRootNode = null;
    let currentSimulation = null;
    let currentLinkForce = null;
    let currentChargeForce = null;
    let currentCollisionForce = null;
    let currentLinkDistanceFn = null;
    let currentCollisionRadiusFn = null;
    let initialTransformApplied = false;
    const initialScale = 0.75;
    let highlightedNodeId = null;
    let currentSizeScale = null;
    let leafScores = null;
    let requestedHistogramBins = null;
    let currentColorScale = null;
    let colorMode = 'score'; // 'score' or 'cluster'
    let clusterColorScale = null;

  const gradeFallbackOrder = [
    "10",
    "7",
  ];
  const datasetFallbackOrder = [
    "lengua_sid",
    "matematica_sid",
    "lengua_pid",
    "matematica_pid",
    "lengua_sid_umap",
    "matematica_sid_umap",
  ];

  function datasetKey(gradeId, datasetId) {
    return `${gradeId}::${datasetId}`;
  }

  function titleCase(value) {
    return value.replace(/\w\S*/g, (segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase());
  }

  function clamp01(value) {
    if (!Number.isFinite(value)) {
      return null;
    }
    return Math.min(1, Math.max(0, value));
  }

  function parseBoolean(value) {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      if (Number.isNaN(value)) {
        return null;
      }
      return value !== 0;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (!normalized) {
        return null;
      }
      if (["true", "1", "yes", "y", "t"].includes(normalized)) {
        return true;
      }
      if (["false", "0", "no", "n", "f"].includes(normalized)) {
        return false;
      }
    }
    return null;
  }

  function formatGradeLabel(gradeId) {
    if (typeof gradeId !== "string") {
      return "Grado";
    }
    const trimmed = gradeId.trim();
    if (!trimmed) {
      return "Grado";
    }
    if (/^\d+$/.test(trimmed)) {
      return `Grado ${trimmed}`;
    }
    const normalized = trimmed.replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim() || trimmed;
    if (normalized.toLowerCase() === "all") {
      return "Todos";
    }
    return titleCase(normalized);
  }

  function normalizeDataset(entry, gradeId, gradeLabel) {
    if (!entry || typeof entry !== "object") {
      return null;
    }
    if (!gradeId) {
      return null;
    }
    const id = typeof entry.id === "string" && entry.id.trim() ? entry.id.trim() : null;
    let graphUrl = typeof entry.graph_url === "string" && entry.graph_url.trim()
      ? entry.graph_url.trim()
      : (typeof entry.graph === "string" && entry.graph.trim() ? entry.graph.trim() : null);
    let dataUrl = typeof entry.data_url === "string" && entry.data_url.trim()
      ? entry.data_url.trim()
      : (typeof entry.data === "string" && entry.data.trim() ? entry.data.trim() : null);
    if (!id || !graphUrl || !dataUrl) {
      return null;
    }
    if (!graphUrl.startsWith("/")) {
      graphUrl = `/${graphUrl.replace(/^\/+/g, "")}`;
    }
    if (!dataUrl.startsWith("/")) {
      dataUrl = `/${dataUrl.replace(/^\/+/g, "")}`;
    }
    const rawLabel = typeof entry.label === "string" && entry.label.trim()
      ? entry.label.trim()
      : titleCase(id.replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim() || id);
    return {
      id,
      graphUrl,
      dataUrl,
      label: rawLabel,
      gradeId,
      gradeLabel: gradeLabel || formatGradeLabel(gradeId),
    };
  }

  function normalizeGrade(entry) {
    if (!entry || typeof entry !== "object") {
      return null;
    }
    const gradeId = typeof entry.id === "string" && entry.id.trim() ? entry.id.trim() : null;
    if (!gradeId) {
      return null;
    }
    const gradeLabel = typeof entry.label === "string" && entry.label.trim()
      ? entry.label.trim()
      : formatGradeLabel(gradeId);
    const rawDatasets = Array.isArray(entry.datasets)
      ? entry.datasets
      : (Array.isArray(entry.children) ? entry.children : []);
    const normalizedDatasets = rawDatasets
      .map((dataset) => normalizeDataset(dataset, gradeId, gradeLabel))
      .filter((dataset) => dataset !== null);
    if (!normalizedDatasets.length) {
      return null;
    }
    return {
      id: gradeId,
      label: gradeLabel,
      datasets: normalizedDatasets,
    };
  }

  function normalizeLegacyDatasets(list) {
    if (!Array.isArray(list) || !list.length) {
      return [];
    }
    const grouped = new Map();
    list.forEach((raw) => {
      const gradeId = typeof raw.grade_id === "string" && raw.grade_id.trim()
        ? raw.grade_id.trim()
        : "all";
      const gradeLabel = typeof raw.grade_label === "string" && raw.grade_label.trim()
        ? raw.grade_label.trim()
        : formatGradeLabel(gradeId === "all" ? "All" : gradeId);
      const normalized = normalizeDataset(raw, gradeId, gradeLabel);
      if (!normalized) {
        return;
      }
      if (!grouped.has(gradeId)) {
        grouped.set(gradeId, {
          id: gradeId,
          label: gradeLabel,
          datasets: [],
        });
      }
      grouped.get(gradeId).datasets.push(normalized);
    });
    const grades = Array.from(grouped.values());
    grades.forEach((grade) => {
      grade.datasets.sort((a, b) => a.label.localeCompare(b.label));
    });
    return grades;
  }

  function buildFallbackGrades() {
    return gradeFallbackOrder
      .map((gradeId) => {
        const gradeLabel = formatGradeLabel(gradeId);
        const datasetsForGrade = datasetFallbackOrder
          .map((name) => normalizeDataset({
            id: name,
            label: titleCase(name.replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim() || name),
            graph_url: `/datasets/${gradeId}/${name}/graph`,
            data_url: `/datasets/${gradeId}/${name}/data`,
          }, gradeId, gradeLabel))
          .filter((dataset) => dataset !== null);
        if (!datasetsForGrade.length) {
          return null;
        }
        return {
          id: gradeId,
          label: gradeLabel,
          datasets: datasetsForGrade,
        };
      })
      .filter((entry) => entry !== null);
  }

  function loadStoredSettings() {
    if (!storageAvailable) {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      console.warn("Failed to load persisted settings:", error);
      return null;
    }
  }

  function persistSettings(zoomTransform = null) {
    if (!storageAvailable) {
      return;
    }
    const fallbackGrade = storedSettings && storedSettings.gradeId ? storedSettings.gradeId : null;
    const fallbackDataset = storedSettings && storedSettings.datasetId ? storedSettings.datasetId : null;
    const payload = {
      gradeId: currentGradeId || fallbackGrade,
      datasetId: currentDatasetId || fallbackDataset,
      forceSettings: { ...forceSettings },
      colorMode: colorMode, // Store color mode (score/cluster)
    };
    
    // Add zoom transform if provided
    if (zoomTransform) {
      payload.zoomTransform = {
        x: zoomTransform.x,
        y: zoomTransform.y,
        k: zoomTransform.k
      };
    } else if (storedSettings && storedSettings.zoomTransform) {
      // Preserve existing zoom if not updating
      payload.zoomTransform = storedSettings.zoomTransform;
    }
    
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload));
      storedSettings = payload;
    } catch (error) {
      console.warn("Failed to persist settings:", error);
    }
  }

  function getNodePositionsKey() {
    if (!currentGradeId || !currentDatasetId) return null;
    return `nodePositions.${currentGradeId}.${currentDatasetId}`;
  }

  // Note: Node positions are no longer persisted - nodes are free to move with simulation
  function loadNodePositions() {
    // Disabled - nodes should be free to move
    return null;
  }

  function saveNodePositions(nodes) {
    // Disabled - nodes should be free to move with simulation
    return;
  }

  function applyStoredForceSettings() {
    if (!storedSettings || typeof storedSettings.forceSettings !== "object") {
      return;
    }
    Object.entries(storedSettings.forceSettings).forEach(([key, value]) => {
      if (Object.prototype.hasOwnProperty.call(forceSettings, key)) {
        const numericValue = Number(value);
        if (Number.isFinite(numericValue)) {
          forceSettings[key] = numericValue;
        }
      }
    });
  }

  function applyStoredColorMode() {
    if (!storedSettings) {
      return;
    }
    if (storedSettings.colorMode === 'score' || storedSettings.colorMode === 'cluster') {
      colorMode = storedSettings.colorMode;
      // Update button label
      const colorModeLabel = document.getElementById('color-mode-label');
      if (colorModeLabel) {
        colorModeLabel.textContent = colorMode === 'score' ? 'Puntaje' : 'Agrupación';
      }
    }
  }

  function applyStoredSelections() {
    if (!storedSettings) {
      return;
    }
    const storedGradeId = typeof storedSettings.gradeId === "string" && storedSettings.gradeId.trim()
      ? storedSettings.gradeId.trim()
      : null;
    const storedDatasetId = typeof storedSettings.datasetId === "string" && storedSettings.datasetId.trim()
      ? storedSettings.datasetId.trim()
      : null;
    if (storedGradeId && datasetsByGrade.has(storedGradeId)) {
      currentGradeId = storedGradeId;
      const gradeDatasets = datasetsByGrade.get(storedGradeId) || [];
      if (storedDatasetId && gradeDatasets.some((dataset) => dataset.id === storedDatasetId)) {
        currentDatasetId = storedDatasetId;
      } else if (gradeDatasets.length && !currentDatasetId) {
        currentDatasetId = gradeDatasets[0].id;
      }
    }
  }

  function rebuildDatasetCollections() {
    datasets = [];
    datasetsByGrade = new Map();
    datasetLookup = new Map();
    gradeLabelById = new Map();
    gradeEntries.forEach((grade) => {
      gradeLabelById.set(grade.id, grade.label);
      datasetsByGrade.set(grade.id, grade.datasets);
      grade.datasets.forEach((dataset) => {
        datasets.push(dataset);
        datasetLookup.set(datasetKey(grade.id, dataset.id), dataset);
      });
    });
  }

  function ensureValidSelection() {
    if (!gradeEntries.length) {
      currentGradeId = null;
      currentDatasetId = null;
      return;
    }
    if (!gradeEntries.some((grade) => grade.id === currentGradeId)) {
      currentGradeId = gradeEntries[0].id;
    }
    const gradeDatasets = datasetsByGrade.get(currentGradeId) || [];
    if (!gradeDatasets.length) {
      currentDatasetId = null;
      return;
    }
    if (!gradeDatasets.some((dataset) => dataset.id === currentDatasetId)) {
      currentDatasetId = gradeDatasets[0].id;
    }
  }

  function populateGradeOptions() {
    if (!gradeSelect) {
      return;
    }
    if (!gradeEntries.length) {
      gradeSelect.innerHTML = '<option value="" selected>No se encontraron grados</option>';
      gradeSelect.disabled = true;
      return;
    }
    gradeSelect.innerHTML = "";
    gradeEntries.forEach((grade) => {
      const optionElement = document.createElement("option");
      optionElement.value = grade.id;
      optionElement.textContent = grade.label;
      gradeSelect.appendChild(optionElement);
    });
    gradeSelect.disabled = false;
    gradeSelect.value = currentGradeId || "";
  }

  function populateDatasetOptions() {
    if (!dataSelect) {
      return;
    }
    const gradeDatasets = datasetsByGrade.get(currentGradeId) || [];
    if (!gradeDatasets.length) {
      dataSelect.innerHTML = '<option value="" selected>No se encontraron conjuntos de datos</option>';
      dataSelect.disabled = true;
      return;
    }
    dataSelect.innerHTML = "";
    gradeDatasets.forEach((dataset) => {
      const optionElement = document.createElement("option");
      optionElement.value = dataset.id;
      optionElement.textContent = dataset.label;
      dataSelect.appendChild(optionElement);
    });
    dataSelect.disabled = false;
    dataSelect.value = currentDatasetId || "";
  }

  function applySelectionMetadata() {
    if (!currentGradeId || !currentDatasetId) {
      jsonUrl = null;
      dataUrl = null;
      datasetLabel = gradeLabelById.get(currentGradeId) || "Conjunto de datos";
      return null;
    }
    const selected = datasetLookup.get(datasetKey(currentGradeId, currentDatasetId)) || null;
    if (!selected) {
      jsonUrl = null;
      dataUrl = null;
      datasetLabel = gradeLabelById.get(currentGradeId) || "Conjunto de datos";
      return null;
    }
    jsonUrl = selected.graphUrl;
    dataUrl = selected.dataUrl;
    const gradeLabel = selected.gradeLabel || gradeLabelById.get(selected.gradeId) || selected.gradeId;
    datasetLabel = `${gradeLabel} · ${selected.label}`;
    return selected;
  }

  function loadDatasetsList() {
    updateStatus("Cargando lista de conjuntos...");
    fetch("datasets", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Datasets HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((payload) => {
        const rawGrades = (payload && typeof payload === "object" && Array.isArray(payload.grades))
          ? payload.grades
          : [];
        const rawLegacyDatasets = (payload && typeof payload === "object" && Array.isArray(payload.datasets))
          ? payload.datasets
          : [];
        let normalizedGrades = rawGrades
          .map(normalizeGrade)
          .filter((grade) => grade !== null);
        if (!normalizedGrades.length && rawLegacyDatasets.length) {
          normalizedGrades = normalizeLegacyDatasets(rawLegacyDatasets);
        }
        let usedFallback = false;
        gradeEntries = normalizedGrades;
        if (!gradeEntries.length) {
          gradeEntries = buildFallbackGrades();
          usedFallback = true;
        }
        rebuildDatasetCollections();
        applyStoredSelections();
        if (!gradeEntries.length) {
          updateStatus("No hay conjuntos de datos disponibles", true);
        } else if (usedFallback) {
          updateStatus(`El servicio devolvió vacío; usando lista local (${datasets.length} conjuntos)`);
        } else {
          updateStatus(`Cargados ${gradeEntries.length} grados · ${datasets.length} conjuntos`);
        }
        ensureValidSelection();
        populateGradeOptions();
        populateDatasetOptions();
        applySelectionMetadata();
        persistSettings();
        renderMemberTable(null);
        if (jsonUrl) {
          resetGraphState();
          loadGraph();
        } else if (gradeEntries.length) {
          updateStatus("No hay un conjunto seleccionado", true);
        }
      })
      .catch((error) => {
        console.info(`Dataset list request unavailable (${error instanceof Error ? error.message : error}) - using fallback datasets.`);
        gradeEntries = buildFallbackGrades();
        rebuildDatasetCollections();
        applyStoredSelections();
        if (gradeEntries.length) {
          updateStatus(`Servicio de conjuntos no disponible; usando lista local (${datasets.length} conjuntos)`);
        } else {
          updateStatus("No se pudo obtener la lista de conjuntos", true);
        }
        ensureValidSelection();
        populateGradeOptions();
        populateDatasetOptions();
        applySelectionMetadata();
        persistSettings();
        renderMemberTable(null);
        if (jsonUrl) {
          resetGraphState();
          loadGraph();
        }
      });
  }

  const forceSettings = {
    minSizeFilter: 1,
    linkDistanceBase: 20,
    linkDistanceScale: 2.5,
    linkStrength: 0.45,
    chargeStrength: -10,
    collisionPadding: 8,
    nodeSizeMultiplier: 3.5,
    fontSizeMultiplier: 1,
    sizeRangeFactor: 0.2,
  };

  const SETTINGS_STORAGE_KEY = STORAGE_PREFIX + "settings.v1";
  const storageAvailable = (() => {
    try {
      if (typeof window === "undefined") {
        return false;
      }
      return "localStorage" in window && window.localStorage !== null;
    } catch (error) {
      console.info("Local storage unavailable:", error);
      return false;
    }
  })();
  let storedSettings = storageAvailable ? loadStoredSettings() : null;

  applyStoredForceSettings();
  applyStoredColorMode();

  const valueFormatters = {
    minSizeFilter: (value) => Math.round(value).toString(),
    linkDistanceBase: (value) => Math.round(value).toString(),
    linkDistanceScale: (value) => Number(value).toFixed(2),
    linkStrength: (value) => Number(value).toFixed(2),
    chargeStrength: (value) => Math.round(value).toString(),
    collisionPadding: (value) => Math.round(value).toString(),
    nodeSizeMultiplier: (value) => Number(value).toFixed(2),
    fontSizeMultiplier: (value) => Number(value).toFixed(2),
    sizeRangeFactor: (value) => Number(value).toFixed(2),
  };

  function getBaseRadiusFromSize(sizeValue) {
    if (currentSizeScale) {
      return currentSizeScale(sizeValue);
    }
    return 5;
  }

  function getSimulationRadius(node) {
    const sizeValue = typeof node.size === "number" && Number.isFinite(node.size) ? node.size : 1;
    return getBaseRadiusFromSize(sizeValue);
  }

  function getNodeRadius(node) {
    return getSimulationRadius(node) * forceSettings.nodeSizeMultiplier;
  }

  function getLabelOffset() {
    // Keep labels centered on their nodes.
    return 0;
  }

  function updateNodeSizes() {
    nodeLayer.selectAll("circle.node")
      .attr("r", (d) => {
        // Hide circle for root node
        return d.isRoot ? 0 : getNodeRadius(d);
      });
    
    nodeLayer.selectAll("path.node-triangle")
      .attr("d", (d) => {
        if (!d.isRoot) return null;
        const r = getNodeRadius(d) * 1.3;
        const h = r * 1.5;
        return `M 0,${-h/2} L ${r},${h/2} L ${-r},${h/2} Z`;
      });
  }

  function getNodeFontSize(node) {
    const baseSize = node.is_leaf ? 1 : 0.7;
    return `${(baseSize * forceSettings.fontSizeMultiplier).toFixed(2)}rem`;
  }

  function getNodeFilterSize(node) {
    if (!node || typeof node !== "object") {
      return 1;
    }
    const directValue = toNumber(node.sizeFilterValue);
    if (Number.isFinite(directValue)) {
      return directValue;
    }
    if (Array.isArray(node.members_index) && node.members_index.length) {
      return node.members_index.length;
    }
    const fallbackSize = toNumber(node.size);
    if (Number.isFinite(fallbackSize)) {
      return fallbackSize;
    }
    return 1;
  }

  function updateNodeFontSizes() {
    nodeLayer.selectAll("text.node-label")
      .attr("font-size", (d) => getNodeFontSize(d))
      .attr("y", getLabelOffset);
  }

  function updateSizeFilterVisibility() {
    if (!currentSimulation) {
      return;
    }

    const nodeSelection = nodeLayer.selectAll("g.node-group");
    const nodeData = nodeSelection.data();
    if (!nodeData.length) {
      return;
    }

    const maxSize = d3.max(nodeData, (d) => getNodeFilterSize(d)) || 1;
    const threshold = Math.min(forceSettings.minSizeFilter, maxSize);
    const visibleNodeIds = new Set();

    nodeSelection.style("display", (d) => {
      const sizeMetric = getNodeFilterSize(d);
      const isVisible = sizeMetric >= threshold;
      if (isVisible) {
        visibleNodeIds.add(d.id);
      }
      return isVisible ? null : "none";
    });

    let visibleLinks = 0;
    linkLayer.selectAll("line")
      .style("display", (d) => {
        const sourceId = typeof d.source === "object" ? d.source.id : d.source;
        const targetId = typeof d.target === "object" ? d.target.id : d.target;
        const isVisible = visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
        if (isVisible) {
          visibleLinks += 1;
        }
        return isVisible ? null : "none";
      });

    const totalNodes = nodeSelection.size();
    const visibleCount = visibleNodeIds.size;
    const thresholdLabel = Number.isInteger(threshold) ? threshold : threshold.toFixed(2);
    updateStatus(`Loaded ${datasetLabel}: ${visibleCount}/${totalNodes} nodes / ${visibleLinks} links visible (size ≥ ${thresholdLabel})`);
  }

  function formatSettingValue(key, value) {
    const formatter = valueFormatters[key];
    return formatter ? formatter(value) : String(value);
  }

  function applyForceSettings(reheat = true) {
    if (!currentSimulation) {
      return;
    }
    if (currentLinkForce && currentLinkDistanceFn) {
      currentLinkForce.distance(currentLinkDistanceFn);
      currentLinkForce.strength(forceSettings.linkStrength);
    }
    if (currentChargeForce) {
      currentChargeForce.strength(forceSettings.chargeStrength);
    }
    if (currentCollisionForce && currentCollisionRadiusFn) {
      currentCollisionForce.radius(currentCollisionRadiusFn);
    }
    if (reheat) {
      currentSimulation.alpha(0.7).restart();
    }
  }

  function getDimensions() {
    const node = container.node();
    if (!node) {
      return { width: window.innerWidth || 1024, height: window.innerHeight || 768 };
    }
    const rect = node.getBoundingClientRect();
    const width = rect.width || window.innerWidth || 1024;
    const height = rect.height || window.innerHeight || 768;
    return { width, height };
  }

  let { width, height } = getDimensions();

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const zoomGroup = svg.append("g");
  const linkLayer = zoomGroup.append("g").attr("class", "links");
  const nodeLayer = zoomGroup.append("g").attr("class", "nodes");

  const sliderElements = document.querySelectorAll('#force-controls input[type="range"][data-setting]');
  sliderElements.forEach((slider) => {
    const key = slider.dataset.setting;
    if (!(key in forceSettings)) {
      return;
    }
    const valueDisplay = document.querySelector(`[data-setting-display="${key}"]`);
    const minValue = Number(slider.min);
    const maxValue = Number(slider.max);
    if (Number.isFinite(minValue) && Number.isFinite(maxValue)) {
      forceSettings[key] = Math.min(maxValue, Math.max(minValue, forceSettings[key]));
    }
    slider.value = forceSettings[key];
    const updateFromSlider = () => {
      forceSettings[key] = parseFloat(slider.value);
      if (valueDisplay) {
        valueDisplay.textContent = formatSettingValue(key, forceSettings[key]);
      }
      if (key === "minSizeFilter") {
        updateSizeFilterVisibility();
        persistSettings();
        return;
      }
      if (key === "nodeSizeMultiplier") {
        updateNodeSizes();
        updateNodeFontSizes();
        persistSettings();
        return;
      }
      if (key === "fontSizeMultiplier") {
        updateNodeFontSizes();
        persistSettings();
        return;
      }
      if (key === "sizeRangeFactor") {
        updateNodeSizes();
        updateNodeFontSizes();
        persistSettings();
        return;
      }
      applyForceSettings();
      persistSettings();
    };
    slider.addEventListener("input", updateFromSlider);
    updateFromSlider();
  });

  function resetGraphState() {
    dfCatData = null;
    initialTransformApplied = false;
    if (currentSimulation) {
      currentSimulation.stop();
      currentSimulation = null;
    }
    currentLinkForce = null;
    currentChargeForce = null;
    currentCollisionForce = null;
    currentLinkDistanceFn = null;
    currentCollisionRadiusFn = null;
    currentRootNode = null;
    currentSizeScale = null;
    linkLayer.selectAll("line").remove();
    nodeLayer.selectAll("g").remove();
    highlightedNodeId = null;
    leafScores = null;
    currentColorScale = null;
    requestedHistogramBins = null;
    updateHistogram(0);
    updateHighlightedNode();
  }

  function updateHighlightedNode() {
    nodeLayer.selectAll("circle.node")
      .classed("node-active", (d) => highlightedNodeId !== null && d.id === highlightedNodeId);
    nodeLayer.selectAll("path.node-triangle")
      .classed("node-active", (d) => highlightedNodeId !== null && d.id === highlightedNodeId);
  }

  const zoom = d3.zoom()
    .scaleExtent([0.01, 4])
    .on("zoom", (event) => {
      zoomGroup.attr("transform", event.transform);
      // Persist zoom state (debounced via end event)
    })
    .on("end", (event) => {
      // Save zoom transform to localStorage when zoom ends
      if (event.transform) {
        persistSettings(event.transform);
      }
    });

  svg.call(zoom);

  function handleResize() {
    const dims = getDimensions();
    width = dims.width;
    height = dims.height;
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    if (currentRootNode) {
      currentRootNode.fx = width / 2;
      currentRootNode.fy = height / 2;
    }
    if (currentSimulation) {
      currentSimulation.force("center", d3.forceCenter(width / 2, height / 2));
      currentSimulation.alpha(0.1).restart();
    }
  }

  window.addEventListener("resize", handleResize);

  function toNumber(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  function sanitizeValue(value, fallback) {
    const numeric = toNumber(value);
    return numeric === null ? fallback : numeric;
  }

  function drawLegend(colorScale, minValue, maxValue) {
    if (!(Number.isFinite(minValue) && Number.isFinite(maxValue))) {
      legend.attr("hidden", true);
      return;
    }
    const width = legendCanvas.width;
    const height = legendCanvas.height;
    const gradient = legendCtx.createLinearGradient(0, 0, width, 0);
    const steps = 32;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      gradient.addColorStop(t, colorScale(minValue + t * (maxValue - minValue)));
    }
    legendCtx.fillStyle = gradient;
    legendCtx.fillRect(0, 0, width, height);
    legendMinLabel.text(minValue.toFixed(2));
    legendMaxLabel.text(maxValue.toFixed(2));
    legend.attr("hidden", null);
  }

  function drawClusterLegend(clusterIds) {
    if (!Array.isArray(clusterIds) || clusterIds.length === 0) {
      legend.attr("hidden", true);
      return;
    }
    
    const width = legendCanvas.width;
    const height = legendCanvas.height;
    const segmentWidth = width / clusterIds.length;
    
    legendCtx.clearRect(0, 0, width, height);
    
    clusterIds.forEach((clusterId, index) => {
      legendCtx.fillStyle = clusterColorScale(clusterId);
      legendCtx.fillRect(index * segmentWidth, 0, segmentWidth, height);
    });
    
    const minCluster = Math.min(...clusterIds);
    const maxCluster = Math.max(...clusterIds);
    legendMinLabel.text(`Cluster ${minCluster}`);
    legendMaxLabel.text(`Cluster ${maxCluster}`);
    legend.attr("hidden", null);
  }

  function updateHistogram(desiredBinCount) {
    if (typeof desiredBinCount === "number" && Number.isFinite(desiredBinCount)) {
      requestedHistogramBins = Math.max(0, Math.floor(desiredBinCount));
    }

    const hasScoreArray = Array.isArray(leafScores);
    const hasScores = hasScoreArray && leafScores.length > 0;

    if (!hasScores || !currentColorScale) {
      histogramSvg.selectAll("*").remove();
      if (!histogramMessage.empty()) {
        const messageText = hasScoreArray
          ? "Leaf scores are unavailable for this dataset."
          : "Leaf scores appear once a dataset loads.";
        histogramMessage.text(messageText);
        histogramMessage.attr("hidden", null);
      }
      return;
    }

    if (!histogramMessage.empty()) {
      histogramMessage.attr("hidden", true);
    }

    // If in cluster mode, draw multiple histograms (one per cluster)
    if (colorMode === 'cluster' && clusterColorScale && currentGraphData && dfCatData) {
      drawClusterHistograms();
      return;
    }

    // Otherwise, draw single histogram with leaf scores
    drawSingleHistogram(leafScores, currentColorScale);
  }

  function drawSingleHistogram(scores, colorScale) {
    // Minimize number of bins to either 20 or number of scores, whichever is smaller.
    const binCount = Math.min(Math.ceil(scores.length), 20);

    if (!binCount) {
      histogramSvg.selectAll("*").remove();
      if (!histogramMessage.empty()) {
        histogramMessage.text("No hay nodos hoja para graficar.");
        histogramMessage.attr("hidden", true);
      }
      return;
    }

    const normalizedScores = scores.map((value) => Math.min(1, Math.max(0, value)));

    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([histogramMargin.left, histogramWidth - histogramMargin.right]);

    const bins = d3.bin()
      .domain(xScale.domain())
      .thresholds(binCount)(normalizedScores);

    const yMax = d3.max(bins, (d) => d.length) || 1;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([histogramHeight - histogramMargin.bottom, histogramMargin.top]);

    histogramSvg.selectAll("*").remove();

    const bars = histogramSvg.selectAll("rect.histogram-bar").data(bins);

    bars.enter()
      .append("rect")
      .attr("class", "histogram-bar")
      .attr("rx", 0)
      .attr("ry", 0)
      .attr("x", (d) => xScale(d.x0) - 0.5)
      .attr("y", (d) => yScale(d.length))
      .attr("width", (d) => {
        const left = xScale(d.x0);
        const right = xScale(d.x1);
        return Math.max(1, right - left + 1);
      })
      .attr("height", (d) => Math.max(0, (histogramHeight - histogramMargin.bottom) - yScale(d.length)))
      .attr("fill", (d) => {
        const center = d.x0 !== undefined && d.x1 !== undefined ? (d.x0 + d.x1) / 2 : 0.5;
        return colorScale(Math.min(1, Math.max(0, center)));
      });

    const baseline = histogramSvg.append("line")
      .attr("class", "histogram-baseline")
      .attr("x1", histogramMargin.left)
      .attr("y1", histogramHeight - histogramMargin.bottom + 0.5)
      .attr("x2", histogramWidth - histogramMargin.right)
      .attr("y2", histogramHeight - histogramMargin.bottom + 0.5)
      .attr("stroke", "rgba(15, 23, 42, 0.3)")
      .attr("stroke-width", 0.75);

    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d3.format(".1f"))
      .tickSizeOuter(0);

    histogramSvg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${histogramHeight - histogramMargin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "0.65rem")
      .style("fill", "#475569");
  }

  function drawClusterHistograms() {
    const nodes = currentGraphData.nodes;
    
    // Get unique clusters
    const clusterLabels = nodes
      .map(node => toNumber(node.cluster_label))
      .filter(label => label !== null);
    const uniqueClusters = Array.from(new Set(clusterLabels)).sort((a, b) => a - b);

    if (uniqueClusters.length === 0) {
      histogramSvg.selectAll("*").remove();
      return;
    }

    // Collect member scores for each cluster
    const clusterData = uniqueClusters.map(clusterLabel => {
      // Find all leaf nodes in this cluster
      const clusterLeafNodes = nodes.filter(node => 
        toNumber(node.cluster_label) === clusterLabel && node.is_leaf === true
      );
      
      // Get scores from leaf nodes
      const memberScores = clusterLeafNodes
        .map(node => node.score)
        .filter(score => typeof score === 'number')
        .map(score => Math.min(1, Math.max(0, score)));

      return {
        cluster: clusterLabel,
        scores: memberScores,
        color: clusterColorScale(clusterLabel)
      };
    });

    // Clear previous content
    histogramSvg.selectAll("*").remove();

    // Calculate layout: 4 histograms stacked vertically
    const numClusters = clusterData.length;
    const clusterHeight = histogramHeight / numClusters;
    const clusterMargin = { top: 4, right: 4, bottom: 12, left: 4 };
    const chartHeight = clusterHeight - clusterMargin.top - clusterMargin.bottom;

    clusterData.forEach((cluster, idx) => {
      const yOffset = idx * clusterHeight;
      
      if (cluster.scores.length === 0) {
        // No data for this cluster
        histogramSvg.append("text")
          .attr("x", histogramWidth / 2)
          .attr("y", yOffset + clusterHeight / 2)
          .attr("text-anchor", "middle")
          .attr("font-size", "0.6rem")
          .attr("fill", "#94a3b8")
          .text(`Cluster ${cluster.cluster}: sin datos`);
        return;
      }

      const binCount = Math.min(Math.ceil(cluster.scores.length), 10);
      
      const xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([clusterMargin.left, histogramWidth - clusterMargin.right]);

      const bins = d3.bin()
        .domain(xScale.domain())
        .thresholds(binCount)(cluster.scores);

      const yMax = d3.max(bins, (d) => d.length) || 1;
      const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .nice()
        .range([chartHeight, 0]);

      // Draw bars
      histogramSvg.selectAll(`rect.cluster-${cluster.cluster}`)
        .data(bins)
        .enter()
        .append("rect")
        .attr("class", `histogram-bar cluster-${cluster.cluster}`)
        .attr("x", (d) => xScale(d.x0) - 0.5)
        .attr("y", (d) => yOffset + clusterMargin.top + yScale(d.length))
        .attr("width", (d) => {
          const left = xScale(d.x0);
          const right = xScale(d.x1);
          return Math.max(1, right - left + 1);
        })
        .attr("height", (d) => Math.max(0, chartHeight - yScale(d.length)))
        .attr("fill", cluster.color)
        .attr("opacity", 0.8);

      // Draw baseline
      histogramSvg.append("line")
        .attr("class", "histogram-baseline")
        .attr("x1", clusterMargin.left)
        .attr("y1", yOffset + clusterMargin.top + chartHeight + 0.5)
        .attr("x2", histogramWidth - clusterMargin.right)
        .attr("y2", yOffset + clusterMargin.top + chartHeight + 0.5)
        .attr("stroke", "rgba(15, 23, 42, 0.3)")
        .attr("stroke-width", 0.75);

      // Draw cluster label
      histogramSvg.append("text")
        .attr("x", clusterMargin.left)
        .attr("y", yOffset + clusterMargin.top - 1)
        .attr("font-size", "0.55rem")
        .attr("font-weight", "600")
        .attr("fill", cluster.color)
        .text(`C${cluster.cluster} (n=${cluster.scores.length})`);

      // Draw x-axis for bottom cluster only
      if (idx === numClusters - 1) {
        const xAxis = d3.axisBottom(xScale)
          .ticks(5)
          .tickFormat(d3.format(".1f"))
          .tickSizeOuter(0);

        histogramSvg.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0, ${yOffset + clusterMargin.top + chartHeight})`)
          .call(xAxis)
          .selectAll("text")
          .style("font-size", "0.55rem")
          .style("fill", "#475569");
      }
    });
  }

  function updateStatus(message, isError = false) {
    status.text(message);
    status.style("color", isError ? "#c62828" : "#1565c0");
    status.style("background-color", isError ? "rgba(244, 67, 54, 0.12)" : "rgba(33, 150, 243, 0.12)");
    status.style("border-color", isError ? "rgba(198, 40, 40, 0.32)" : "rgba(33, 150, 243, 0.35)");
  }

  function renderMemberTable(memberIndices, nodeLabel = "", nodeScore = null) {
  const defaultMessage = `<p class="table-message">Click a node to see member response patterns for ${datasetLabel}.</p>`;

    if (!Array.isArray(memberIndices) || memberIndices.length === 0) {
      tableTitle.text(`Member Details · ${datasetLabel}`);
      tableContent.html(defaultMessage);
      return;
    }

    if (!dfCatData) {
      tableTitle.text(`Member Details · ${datasetLabel}`);
      tableContent.html(`<p class="table-message table-message--error">${dataUrl} is not available for ${datasetLabel}. Ensure the file exists.</p>`);
      return;
    }

    const rows = memberIndices.map((idx) => {
      const key = String(idx);
      return {
        memberIndex: idx,
        data: dfCatData[key] || null,
      };
    });

    const availableRows = rows.filter((row) => row.data);
    const missingCount = rows.length - availableRows.length;

    const titleParts = [datasetLabel];
    if (nodeLabel) {
      titleParts.push(nodeLabel);
    }
    titleParts.push(`${memberIndices.length} integrante${memberIndices.length === 1 ? "" : "s"}`);
    if (Number.isFinite(nodeScore)) {
      titleParts.push(`puntaje ${nodeScore.toFixed(3)}`);
    }
    tableTitle.text(titleParts.join(" · "));

    if (!availableRows.length) {
      tableContent.html(`<p class="table-message">No hay registros de ${datasetLabel} para los integrantes seleccionados.</p>`);
      return;
    }

    const columnSet = new Set();
    availableRows.forEach((row) => {
      Object.keys(row.data).forEach((col) => columnSet.add(col));
    });
    const columns = Array.from(columnSet).sort();

    if (!columns.length) {
      tableContent.html(`<p class="table-message">No se encontraron datos de preguntas para los integrantes seleccionados en ${datasetLabel}.</p>`);
      return;
    }

    const colorScale = d3.scaleSequential(d3.interpolateRgb("#eff6ff", "#1d4ed8"))
      .domain([0, 1])
      .clamp(true);

    const table = d3.create("table");
    const headerRow = table.append("thead").append("tr");
    headerRow.append("th").text("Pregunta");
    availableRows.forEach((row) => {
      headerRow.append("th").text(row.memberIndex);
    });

    const tbody = table.append("tbody");
    columns.forEach((column) => {
      const tr = tbody.append("tr");
      tr.append("th")
        .attr("scope", "row")
        .text(column);

      availableRows.forEach((row) => {
        const rawValue = row.data[column];
        const value = toNumber(rawValue);
        const cell = tr.append("td");

        if (value === null) {
          cell.attr("class", "cell-empty").text("–");
          return;
        }

        const normalized = Math.min(1, Math.max(0, value));
        const color = colorScale(normalized);
        cell.style("background", color);
        const lightness = d3.hsl(color).l;
        cell.style("color", lightness > 0.6 ? "#0f172a" : "#f8fafc");

        const displayValue = Math.abs(value - Math.round(value)) < 1e-6
          ? Math.round(value)
          : value.toFixed(2);
        cell.text(displayValue);
      });
    });

    tableContent.html("");
    const contentNode = tableContent.node();
    contentNode.appendChild(table.node());
    contentNode.scrollTop = 0;
    contentNode.scrollLeft = 0;

    if (missingCount > 0) {
      tableContent.append("p")
        .attr("class", "table-message")
        .text(`${missingCount} integrante${missingCount === 1 ? "" : "s"} no aparece en los datos de ${datasetLabel}.`);
    }
  }

  function render(graph) {
    if (!graph || !Array.isArray(graph.nodes)) {
      updateStatus("Datos de grafo no válidos", true);
      return;
    }

    currentGraphData = graph;
    currentSizeScale = null;

    const dims = getDimensions();
    width = dims.width;
    height = dims.height;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    if (!initialTransformApplied) {
      // Check if we have a stored zoom transform
      let transform;
      if (storedSettings && storedSettings.zoomTransform) {
        const zt = storedSettings.zoomTransform;
        if (typeof zt.x === 'number' && typeof zt.y === 'number' && typeof zt.k === 'number') {
          // Restore saved zoom state
          transform = d3.zoomIdentity
            .translate(zt.x, zt.y)
            .scale(zt.k);
        }
      }
      
      // Fall back to default initial transform if no stored state
      if (!transform) {
        transform = d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(initialScale)
          .translate(-width / 2, -height / 2);
      }
      
      svg.call(zoom.transform, transform);
      initialTransformApplied = true;
    }

    if (currentSimulation) {
      currentSimulation.stop();
    }
    currentSimulation = null;
    currentLinkForce = null;
    currentChargeForce = null;
    currentCollisionForce = null;
    currentLinkDistanceFn = null;
    currentCollisionRadiusFn = null;
    currentRootNode = null;

    const rawLinks = Array.isArray(graph.links) ? graph.links : [];
    const outgoingIds = new Set();
    rawLinks.forEach((link) => {
      if (!link) {
        return;
      }
      const sourceValue = typeof link.source === "object" && link.source !== null
        ? link.source.id
        : link.source;
      if (sourceValue === undefined || sourceValue === null) {
        return;
      }
      outgoingIds.add(String(sourceValue));
    });

    const nodes = graph.nodes.map((node) => {
      const memberIndex = Array.isArray(node.members_index) ? node.members_index : [];
      const rawSize = toNumber(node.size);
      const fallbackSize = memberIndex.length > 0 ? memberIndex.length : 1;
      const sizeFilterValue = sanitizeValue(rawSize, fallbackSize);
      const sizeValue = sanitizeValue(rawSize !== null ? rawSize * 4 : null, 1);
      const rawScore = toNumber(node.score);
  const rawCorrectTotal = toNumber(node.correct_total);
  const correctL = toNumber(node.correct_L);
  const correctM = toNumber(node.correct_M);


      const fallbackParts = [];
      if (rawCorrectTotal !== null) fallbackParts.push(rawCorrectTotal);
      if (correctL !== null) fallbackParts.push(correctL);
      if (correctM !== null) fallbackParts.push(correctM);

  const normalizedScore = clamp01(rawScore);
  const derivedCorrectTotal = fallbackParts.length ? clamp01(d3.mean(fallbackParts)) : null;
  const computedScore = normalizedScore !== null ? normalizedScore : derivedCorrectTotal;
  const scoreCandidate = clamp01(computedScore);
  const finalScore = scoreCandidate !== null ? scoreCandidate : 0.5;

      const nodeId = node.id !== undefined && node.id !== null ? String(node.id) : null;
      const explicitLeaf = parseBoolean(node.is_leaf ?? node.leaf ?? node.isLeaf ?? node.leaf_flag ?? null);
      let isLeaf = explicitLeaf;
      if (isLeaf === null && typeof node.type === "string") {
        const normalizedType = node.type.trim().toLowerCase();
        if (normalizedType.includes("leaf")) {
          isLeaf = true;
        } else if (normalizedType.includes("cluster")) {
          isLeaf = false;
        }
      }
      if (isLeaf === null && nodeId !== null) {
        const appearsAsSource = outgoingIds.has(nodeId);
        if (!appearsAsSource) {
          if (Array.isArray(node.children) && node.children.length > 0) {
            isLeaf = false;
          } else if (memberIndex.length > 0) {
            isLeaf = true;
          }
        }
      }
      if (isLeaf === null && memberIndex.length === 1) {
        isLeaf = true;
      }
      if (isLeaf === null) {
        isLeaf = false;
      }

      return {
        ...node,
        size: sizeValue,
        sizeFilterValue,
        members_index: memberIndex,
        correct_L: correctL,
        correct_M: correctM,
        correct_total: derivedCorrectTotal,
        score: finalScore,
        is_leaf: isLeaf,
      };
    });
    const links = rawLinks.map((link) => ({ ...link }));

    const nodesWithPos = nodes.filter((node) => Array.isArray(node.pos) && node.pos.length === 2);
    let positionScaler = null;
    if (nodesWithPos.length) {
      // Scale position values by 10
      const xValues = nodesWithPos.map((node) => toNumber(node.pos[0]) * 200).filter((value) => value !== null);
      const yValues = nodesWithPos.map((node) => toNumber(node.pos[1]) * 200).filter((value) => value !== null);
      if (xValues.length && yValues.length) {
        const xExtent = d3.extent(xValues);
        const yExtent = d3.extent(yValues);
        const padX = (xExtent[1] - xExtent[0]) || 1;
        const padY = (yExtent[1] - yExtent[0]) || 1;
        const domainX = [xExtent[0] - padX * 0.1, xExtent[1] + padX * 0.1];
        const domainY = [yExtent[0] - padY * 0.1, yExtent[1] + padY * 0.1];
        const rangeX = [width * 0.05, width * 0.95];
        const rangeY = [height * 0.1, height * 0.9];
        const xScale = d3.scaleLinear().domain(domainX).range(rangeX);
        const yScale = d3.scaleLinear().domain(domainY).range(rangeY);
        positionScaler = { xScale, yScale };
        nodesWithPos.forEach((node) => {
          const px = toNumber(node.pos[0]) * 10;
          const py = toNumber(node.pos[1]) * 10;
          if (px !== null && py !== null) {
            node.x = xScale(px);
            node.y = yScale(py);
            node.vx = 0;
            node.vy = 0;
          }
        });
      }
    }

    const sizeExtent = d3.extent(nodes, (d) => d.size);
    const sizeMin = Number.isFinite(sizeExtent[0]) ? sizeExtent[0] : 1;
    const sizeMax = Number.isFinite(sizeExtent[1]) ? sizeExtent[1] : sizeMin;
    const sizeDomain = sizeMin === sizeMax
      ? [sizeMin, sizeMin + 1]
      : [sizeMin, sizeMax];
    const sizeNormalizer = d3.scaleLinear()
      .domain(sizeDomain)
      .range([0, 1])
      .clamp(true);
    const sizeInterpolator = d3.interpolateNumber(5, 22);
    const sizeScale = (value) => {
      const normalized = sizeNormalizer(sanitizeValue(value, sizeDomain[0]));
      const adjusted = Math.pow(normalized, forceSettings.sizeRangeFactor);
      return sizeInterpolator(adjusted);
    };
    currentSizeScale = sizeScale;
    const sizeById = new Map(nodes.map((d) => [d.id, d.size]));

    leafScores = nodes
      .filter((node) => node.is_leaf === true)
      .map((node) => Math.min(1, Math.max(0, node.score)));

    const leafMean = leafScores.length ? d3.mean(leafScores) : null;
    const colorFallback = Number.isFinite(leafMean) ? leafMean : 0.5;
    const colorScale = d3.scaleSequential()
      .domain([0, 1])
      .clamp(true)
      .interpolator(d3.interpolateViridis);

    // Create cluster color scale (discrete)
    const clusterLabels = nodes
      .map(node => toNumber(node.cluster_label))
      .filter(label => label !== null);
    const uniqueClusters = Array.from(new Set(clusterLabels)).sort((a, b) => a - b);
    
    if (uniqueClusters.length > 0) {
      clusterColorScale = d3.scaleOrdinal()
        .domain(uniqueClusters)
        .range(d3.schemeCategory10.concat(d3.schemePaired));
    } else {
      clusterColorScale = null;
    }

    currentColorScale = colorScale;
    
    // Draw legend based on current color mode
    if (colorMode === 'cluster' && clusterColorScale) {
      drawClusterLegend(uniqueClusters);
    } else {
      drawLegend(colorScale, 0, 1);
    }
    
    updateHistogram(leafScores.length);

    // Function to get node color based on current mode
    function getNodeColor(node) {
      if (colorMode === 'cluster' && clusterColorScale) {
        const clusterLabel = toNumber(node.cluster_label);
        if (clusterLabel !== null) {
          return clusterColorScale(clusterLabel);
        }
        return '#94a3b8'; // Gray for nodes without cluster_label
      } else {
        const value = sanitizeValue(node.score, colorFallback);
        return colorScale(Math.min(1, Math.max(0, value)));
      }
    }

    linkLayer.selectAll("line").remove();
    nodeLayer.selectAll("g").remove();

    const linkKey = (d) => {
      const sourceId = typeof d.source === "object" ? d.source.id : d.source;
      const targetId = typeof d.target === "object" ? d.target.id : d.target;
      return `${sourceId}->${targetId}`;
    };

    const linkSelection = linkLayer.selectAll("line")
      .data(links, linkKey);

    linkSelection.enter()
      .append("line")
      .attr("class", "link");

    // Identify root node first
    const targetIdSet = new Set(links.map((link) => (typeof link.target === "object" ? link.target.id : link.target)));
    const rootNode = nodes.find((node) => !targetIdSet.has(node.id)) || nodes[0] || null;
    
    // Mark the root node with a property
    if (rootNode) {
      rootNode.isRoot = true;
    }
    
    // Load saved positions (only as initial positions, not fixed)
    const savedPositions = loadNodePositions();
    // savedPositions is always null now, nodes are free to move

    const nodeSelection = nodeLayer.selectAll("g.node-group")
      .data(nodes, (d) => d.id);

    const nodeEnter = nodeSelection.enter()
      .append("g")
      .attr("class", "node-group");

    // Add circle for non-root nodes
    nodeEnter.append("circle")
      .attr("class", "node")
      .attr("r", (d) => {
        // Hide circle for root node
        return d.isRoot ? 0 : getNodeRadius(d);
      })
      .attr("fill", (d) => getNodeColor(d))
      .on("click", (event, d) => {
        highlightedNodeId = d.id;
        updateHighlightedNode();
        const labelPrefix = d.is_leaf ? "Leaf" : "Cluster";
        const labelValue = d.is_leaf ? (d.label ?? d.id) : d.id;
        const nodeScore = toNumber(d.score);
        renderMemberTable(d.members_index, `${labelPrefix} ${labelValue}`, nodeScore);
      });

    // Add triangle for root node
    nodeEnter.append("path")
      .attr("class", "node-triangle")
      .attr("d", (d) => {
        if (!d.isRoot) return null;
        const r = getNodeRadius(d) * 1.3; // Slightly larger than circle
        const h = r * 1.5;
        // Upward pointing triangle
        return `M 0,${-h/2} L ${r},${h/2} L ${-r},${h/2} Z`;
      })
      .attr("fill", (d) => d.isRoot ? getNodeColor(d) : "none")
      .attr("stroke", (d) => d.isRoot ? "#1f3a93" : "none")
      .attr("stroke-width", (d) => d.isRoot ? 2 : 0)
      .on("click", (event, d) => {
        highlightedNodeId = d.id;
        updateHighlightedNode();
        const labelPrefix = d.is_leaf ? "Leaf" : "Cluster";
        const labelValue = d.is_leaf ? (d.label ?? d.id) : d.id;
        const nodeScore = toNumber(d.score);
        renderMemberTable(d.members_index, `${labelPrefix} ${labelValue}`, nodeScore);
      });

    nodeEnter.append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#0f172a")
      .attr("font-size", (d) => getNodeFontSize(d))
      .attr("font-weight", (d) => (d.is_leaf ? "700" : "400"))
      .attr("pointer-events", "none")
      .attr("y", getLabelOffset)
      .text((d) => (d.is_leaf ? d.label : ""));

    // Add drag behavior
    const dragBehavior = d3.drag()
      .on("start", function(event, d) {
        // Keep simulation running for all nodes
        if (!event.active) currentSimulation.alphaTarget(0.3).restart();
        // Fix only the dragged node
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", function(event, d) {
        // Update position of dragged node
        d.fx = event.x;
        d.fy = event.y;
        // Simulation continues running, updating other nodes
      })
      .on("end", function(event, d) {
        // Keep simulation running briefly after drag ends
        if (!event.active) currentSimulation.alphaTarget(0);
        // Release node so it can move with simulation
        d.fx = null;
        d.fy = null;
      });

    nodeEnter.call(dragBehavior);
    nodeSelection.call(dragBehavior);

    nodeSelection.exit().remove();
    updateNodeSizes();
    updateNodeFontSizes();
    updateHighlightedNode();

    const computeLinkDistance = (link) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source;
      const targetId = typeof link.target === "object" ? link.target.id : link.target;
      const sourceSize = sizeById.get(sourceId) ?? 1;
      const targetSize = sizeById.get(targetId) ?? 1;
      const averageSize = (sourceSize + targetSize) / 2;
      const baseRadius = getBaseRadiusFromSize(averageSize);
      return forceSettings.linkDistanceBase + baseRadius * forceSettings.linkDistanceScale;
    };

    const collisionRadiusFn = (d) => getSimulationRadius(d) + forceSettings.collisionPadding;

    const linkForce = d3.forceLink(links)
      .id((d) => d.id)
      .distance(computeLinkDistance)
      .strength(forceSettings.linkStrength);

    const chargeForce = d3.forceManyBody().strength(forceSettings.chargeStrength);

    const collisionForce = d3.forceCollide().radius(collisionRadiusFn);

    const simulation = d3.forceSimulation(nodes)
      .force("link", linkForce)
      .force("charge", chargeForce)
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", collisionForce);

    simulation.on("tick", () => {
      linkLayer.selectAll("line")
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      nodeLayer.selectAll("g.node-group")
        .attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    });

    currentSimulation = simulation;
    currentRootNode = rootNode;
    currentLinkForce = linkForce;
    currentChargeForce = chargeForce;
    currentCollisionForce = collisionForce;
    currentLinkDistanceFn = computeLinkDistance;
    currentCollisionRadiusFn = collisionRadiusFn;

    applyForceSettings(false);

    simulation.alpha(1).restart();
    updateStatus(`Loaded ${datasetLabel}: ${nodes.length} nodes / ${links.length} links`);
    
    // Apply initial size filter visibility
    updateSizeFilterVisibility();
  }

  function loadGraph() {
    if (!jsonUrl) {
      updateStatus("No hay un conjunto seleccionado", true);
      return;
    }
    const requestGraphUrl = jsonUrl;
    const requestDataUrl = dataUrl;
    const requestLabel = datasetLabel;
    updateStatus(`Loading ${requestLabel} graph...`);
    const graphPromise = fetch(requestGraphUrl, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Graph HTTP ${response.status}`);
        }
        return response.json();
      });

    const dfCatPromise = requestDataUrl
      ? fetch(requestDataUrl, { cache: "no-store" })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Data HTTP ${response.status}`);
            }
            return response.json();
          })
          .catch((error) => {
            console.warn("Failed to load dataset data:", error);
            return null;
          })
      : Promise.resolve(null);

    Promise.all([graphPromise, dfCatPromise])
      .then(([graph, dfCat]) => {
        if (requestGraphUrl !== jsonUrl || requestDataUrl !== dataUrl) {
          return;
        }
        dfCatData = dfCat;
        if (dfCatData) {
          renderMemberTable(null);
        } else if (requestDataUrl) {
          tableTitle.text(`Detalles de integrantes · ${requestLabel}`);
          tableContent.html(`<p class="table-message table-message--error">${requestDataUrl} no se pudo cargar para ${requestLabel}. Haz clic en los nodos para ver el detalle de clusters.</p>`);
        } else {
          tableTitle.text(`Detalles de integrantes · ${requestLabel}`);
          tableContent.html(`<p class="table-message">No hay datos de respuestas para ${requestLabel}. Haz clic en los nodos para ver el detalle de clusters.</p>`);
        }
        render(graph);
      })
      .catch((error) => {
        if (requestGraphUrl !== jsonUrl || requestDataUrl !== dataUrl) {
          return;
        }
        console.error("Failed to load graph:", error);
        updateStatus(`No se pudo cargar ${requestLabel}`, true);
      });
  }

  if (gradeSelect) {
    gradeSelect.addEventListener("change", () => {
      if (!gradeEntries.length) {
        return;
      }
      currentGradeId = gradeSelect.value || null;
      ensureValidSelection();
      if (gradeSelect.value !== (currentGradeId || "")) {
        gradeSelect.value = currentGradeId || "";
      }
      populateDatasetOptions();
      applySelectionMetadata();
      resetGraphState();
      renderMemberTable(null);
      if (jsonUrl) {
        loadGraph();
      } else {
        updateStatus("No hay un conjunto seleccionado", true);
      }
      persistSettings();
    });
  }

  if (dataSelect) {
    dataSelect.addEventListener("change", () => {
      if (!gradeEntries.length) {
        return;
      }
      currentDatasetId = dataSelect.value || null;
      ensureValidSelection();
      if (gradeSelect && gradeSelect.value !== (currentGradeId || "")) {
        gradeSelect.value = currentGradeId || "";
      }
      if (dataSelect.value !== (currentDatasetId || "")) {
        dataSelect.value = currentDatasetId || "";
      }
      applySelectionMetadata();
      resetGraphState();
      renderMemberTable(null);
      if (jsonUrl) {
        loadGraph();
      } else {
        updateStatus("No hay un conjunto seleccionado", true);
      }
      persistSettings();
    });
  }

  // Color mode toggle button
  const colorModeToggle = document.getElementById('color-mode-toggle');
  const colorModeLabel = document.getElementById('color-mode-label');
  
  if (colorModeToggle && colorModeLabel) {
    colorModeToggle.addEventListener('click', () => {
      // Toggle between score and cluster
      colorMode = colorMode === 'score' ? 'cluster' : 'score';
      colorModeLabel.textContent = colorMode === 'score' ? 'Puntaje' : 'Agrupación';
      
      // Update legend
      if (colorMode === 'cluster' && clusterColorScale) {
        const nodes = currentGraphData ? currentGraphData.nodes : [];
        const clusterLabels = nodes
          .map(node => toNumber(node.cluster_label))
          .filter(label => label !== null);
        const uniqueClusters = Array.from(new Set(clusterLabels)).sort((a, b) => a - b);
        drawClusterLegend(uniqueClusters);
      } else if (currentColorScale) {
        drawLegend(currentColorScale, 0, 1);
      }
      
      // Update histogram
      updateHistogram(0);
      
      // Update node colors
      if (currentGraphData) {
        const leafMean = leafScores && leafScores.length ? d3.mean(leafScores) : null;
        const colorFallback = Number.isFinite(leafMean) ? leafMean : 0.5;
        
        nodeLayer.selectAll("circle.node")
          .attr("fill", (d) => {
            if (colorMode === 'cluster' && clusterColorScale) {
              const clusterLabel = toNumber(d.cluster_label);
              if (clusterLabel !== null) {
                return clusterColorScale(clusterLabel);
              }
              return '#94a3b8';
            } else if (currentColorScale) {
              const value = sanitizeValue(d.score, colorFallback);
              return currentColorScale(Math.min(1, Math.max(0, value)));
            }
            return '#94a3b8';
          });
        
        // Update triangle color for root node
        nodeLayer.selectAll("path.node-triangle")
          .attr("fill", (d) => {
            if (!d.isRoot) return "none";
            if (colorMode === 'cluster' && clusterColorScale) {
              const clusterLabel = toNumber(d.cluster_label);
              if (clusterLabel !== null) {
                return clusterColorScale(clusterLabel);
              }
              return '#94a3b8';
            } else if (currentColorScale) {
              const value = sanitizeValue(d.score, colorFallback);
              return currentColorScale(Math.min(1, Math.max(0, value)));
            }
            return '#94a3b8';
          });
      }
      
      // Persist the color mode change
      persistSettings();
    });
  }

  // Modal control for cluster chart
  const showClusterChartBtn = document.getElementById('show-cluster-chart-btn');
  const clusterChartModal = document.getElementById('cluster-chart-modal');
  const closeClusterChartModal = document.getElementById('close-cluster-chart-modal');
  const clusterChartSvg = d3.select('#cluster-chart-svg');

  if (showClusterChartBtn && clusterChartModal && closeClusterChartModal) {
    showClusterChartBtn.addEventListener('click', () => {
      if (!currentGraphData || !dfCatData) {
        updateStatus("No hay datos disponibles para mostrar el gráfico", true);
        return;
      }
      clusterChartModal.removeAttribute('hidden');
      renderClusterChart();
    });

    closeClusterChartModal.addEventListener('click', () => {
      clusterChartModal.setAttribute('hidden', '');
    });

    // Close on background click
    clusterChartModal.addEventListener('click', (event) => {
      if (event.target === clusterChartModal) {
        clusterChartModal.setAttribute('hidden', '');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !clusterChartModal.hasAttribute('hidden')) {
        clusterChartModal.setAttribute('hidden', '');
      }
    });
  }

  let questionsDataCache = null;

  function renderClusterChart() {
    if (!currentGraphData || !dfCatData) {
      return;
    }

    // Load questions data if not already cached
    if (questionsDataCache === null) {
      fetch('/questions_stats', { cache: "no-store" })
        .then(response => {
          if (!response.ok) {
            console.warn('Failed to load questions_stats');
            return null;
          }
          return response.json();
        })
        .then(data => {
          questionsDataCache = data || {};
          continueRenderClusterChart();
        })
        .catch(error => {
          console.warn('Error loading questions_stats:', error);
          questionsDataCache = {};
          continueRenderClusterChart();
        });
    } else {
      continueRenderClusterChart();
    }
  }

  function continueRenderClusterChart() {
    if (!currentGraphData || !dfCatData) {
      return;
    }

    const nodes = currentGraphData.nodes;
    
    // Get unique clusters
    const clusterLabels = nodes
      .map(node => toNumber(node.cluster_label))
      .filter(label => label !== null);
    const uniqueClusters = Array.from(new Set(clusterLabels)).sort((a, b) => a - b);

    if (uniqueClusters.length === 0) {
      clusterChartSvg.selectAll("*").remove();
      clusterChartSvg.append("text")
        .attr("x", 450)
        .attr("y", 300)
        .attr("text-anchor", "middle")
        .attr("font-size", "1rem")
        .attr("fill", "#64748b")
        .text("No hay información de clusters disponible");
      return;
    }

    // Collect all questions from dfCatData
    const allQuestions = new Set();
    Object.values(dfCatData).forEach(record => {
      Object.keys(record).forEach(key => allQuestions.add(key));
    });
    const questionsList = Array.from(allQuestions).sort();

    if (questionsList.length === 0) {
      clusterChartSvg.selectAll("*").remove();
      clusterChartSvg.append("text")
        .attr("x", 450)
        .attr("y", 300)
        .attr("text-anchor", "middle")
        .attr("font-size", "1rem")
        .attr("fill", "#64748b")
        .text("No hay preguntas disponibles");
      return;
    }

    // Calculate averages per question per cluster
    const data = questionsList.map(question => {
      const questionData = { question };
      
      uniqueClusters.forEach(cluster => {
        // Find all leaf nodes in this cluster
        const clusterLeafNodes = nodes.filter(node => 
          toNumber(node.cluster_label) === cluster && node.is_leaf === true
        );
        
        // Get all member indices for this cluster
        const memberIndices = [];
        clusterLeafNodes.forEach(node => {
          if (Array.isArray(node.members_index)) {
            memberIndices.push(...node.members_index);
          }
        });

        // Calculate average for this question in this cluster
        const values = [];
        memberIndices.forEach(idx => {
          const key = String(idx);
          if (dfCatData[key] && dfCatData[key][question] !== undefined) {
            const value = toNumber(dfCatData[key][question]);
            if (value !== null) {
              values.push(value);
            }
          }
        });

        const average = values.length > 0 ? d3.mean(values) : null;
        questionData[`cluster_${cluster}`] = average;
      });

      return questionData;
    });

    // Set up chart dimensions
    const width = 1200;
    const height = 500;
    const margin = { top: 40, right: 120, bottom: 120, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    clusterChartSvg.selectAll("*").remove();
    clusterChartSvg.attr("width", width).attr("height", height);

    const g = clusterChartSvg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale (questions)
    const x0 = d3.scaleBand()
      .domain(questionsList)
      .range([0, chartWidth])
      .padding(0.2);

    // X1 scale (clusters within each question)
    const x1 = d3.scaleBand()
      .domain(uniqueClusters.map(c => `cluster_${c}`))
      .range([0, x0.bandwidth()])
      .padding(0.05);

    // Y scale (values)
    const y = d3.scaleLinear()
      .domain([0, 1])
      .nice()
      .range([chartHeight, 0]);

    // Color scale
    const colorScale = clusterColorScale || d3.scaleOrdinal()
      .domain(uniqueClusters)
      .range(d3.schemeCategory10.concat(d3.schemePaired));

    // Draw bars
    const questionGroups = g.selectAll(".question-group")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "question-group")
      .attr("transform", d => `translate(${x0(d.question)},0)`);

    uniqueClusters.forEach(cluster => {
      const key = `cluster_${cluster}`;
      questionGroups.append("rect")
        .attr("x", x1(key))
        .attr("y", d => {
          const value = d[key];
          return value !== null ? y(value) : y(0);
        })
        .attr("width", x1.bandwidth())
        .attr("height", d => {
          const value = d[key];
          return value !== null ? chartHeight - y(value) : 0;
        })
        .attr("fill", colorScale(cluster))
        .attr("opacity", 0.85)
        .append("title")
        .text(d => {
          const value = d[key];
          const questionId = d.question;
          let questionText = questionId;
          
          // Try to get the question text from questionsDataCache
          if (questionsDataCache && questionsDataCache[questionId] && questionsDataCache[questionId].question) {
            questionText = questionsDataCache[questionId].question;
          }
          
          const valueText = value !== null ? value.toFixed(3) : 'Sin datos';
          return `${questionId}\n${questionText}\nCluster ${cluster}: ${valueText}`;
        });
    });

    // X axis
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "0.75rem")
      .style("fill", "#475569");

    // Y axis
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(10).tickFormat(d3.format(".2f")))
      .selectAll("text")
      .style("font-size", "0.8rem")
      .style("fill", "#475569");

    // Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartHeight / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.9rem")
      .attr("font-weight", "600")
      .attr("fill", "#1f3a93")
      .text("Promedio");

    // Legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${chartWidth + 20}, 0)`);

    uniqueClusters.forEach((cluster, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);

      legendRow.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", colorScale(cluster))
        .attr("opacity", 0.85);

      legendRow.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.32em")
        .attr("font-size", "0.85rem")
        .attr("fill", "#1f2933")
        .text(`Cluster ${cluster}`);
    });

    // Title
    clusterChartSvg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "1rem")
      .attr("font-weight", "700")
      .attr("fill", "#1f3a93")
      .text(`Promedios por Pregunta y Cluster - ${datasetLabel}`);
  }

  // Toggle force controls
  const toggleForceControlsBtn = document.getElementById('toggle-force-controls');
  const forceControlsContent = document.getElementById('force-controls-content');
  const forceControlsHeader = document.querySelector('#force-controls .collapsible-header');

  if (toggleForceControlsBtn && forceControlsContent && forceControlsHeader) {
    const toggleControls = () => {
      const isExpanded = forceControlsContent.style.display !== 'none';
      forceControlsContent.style.display = isExpanded ? 'none' : 'block';
      toggleForceControlsBtn.classList.toggle('expanded', !isExpanded);
    };

    forceControlsHeader.addEventListener('click', toggleControls);
  }

  loadDatasetsList();
  } // end initGraphTab

  // Initialize when the graph tab becomes active
  window.addEventListener("tabChanged", (event) => {
    if (event.detail.tabId === "graph") {
      // Graph tab is now active - ensure it's initialized
      if (!window.__graphTabInitialized) {
        initGraphTab();
        window.__graphTabInitialized = true;
      }
    }
  });

  // Also initialize immediately if graph tab is already active on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const graphTab = document.querySelector('[data-tab-content="graph"]');
      if (graphTab && graphTab.classList.contains("active")) {
        initGraphTab();
        window.__graphTabInitialized = true;
      }
    });
  } else {
    const graphTab = document.querySelector('[data-tab-content="graph"]');
    if (graphTab && graphTab.classList.contains("active")) {
      initGraphTab();
      window.__graphTabInitialized = true;
    }
  }
})();
