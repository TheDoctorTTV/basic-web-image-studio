document.addEventListener('DOMContentLoaded', () => {
  // Cache all DOM references once at startup to avoid repeated lookups.
  const dropArea = document.getElementById('drop-area');
  const preview = document.getElementById('preview');
  const sideMenu = document.getElementById('side-menu');
  const enlargeBtn = document.getElementById('enlarge-btn');
  const shrinkBtn = document.getElementById('shrink-btn');
  const upBtn = document.getElementById('up-btn');
  const downBtn = document.getElementById('down-btn');
  const leftBtn = document.getElementById('left-btn');
  const rightBtn = document.getElementById('right-btn');
  const resetBtn = document.getElementById('reset-btn');
  const flipBtn = document.getElementById('flip-btn');
  const rotateBtn = document.getElementById('rotate-btn');
  const restoreBtn = document.getElementById('restore-btn');
  const redoBtn = document.getElementById('redo-btn');
  const showBtn = document.getElementById('show-btn');
  const menuBtn = document.getElementById('menu-btn');
  const closeMenuBtn = document.getElementById('close-menu-btn');
  const helpBtn = document.getElementById('help-btn');
  const fileMenuBtn = document.getElementById('file-menu-btn');
  const fileMenu = document.getElementById('file-menu');
  const editMenuBtn = document.getElementById('edit-menu-btn');
  const editMenu = document.getElementById('edit-menu');
  const openFileBtn = document.getElementById('open-file-btn');
  const helpMenu = document.getElementById('help-menu');
  const closeHelpBtn = document.getElementById('close-help-btn');
  const menuBtn2 = document.getElementById('menu-btn-2');
  const sideMenu2 = document.getElementById('side-menu-2');
  const closeMenu2Btn = document.getElementById('close-menu-2-btn');
  const menuBtn3 = document.getElementById('menu-btn-3');
  const sideMenu3 = document.getElementById('side-menu-3');
  const closeMenu3Btn = document.getElementById('close-menu-3-btn');
  const menuBtn4 = document.getElementById('menu-btn-4');
  const sideMenu4 = document.getElementById('side-menu-4');
  const closeMenu4Btn = document.getElementById('close-menu-4-btn');
  const menuBtn5 = document.getElementById('menu-btn-5');
  const sideMenu5 = document.getElementById('side-menu-5');
  const closeMenu5Btn = document.getElementById('close-menu-5-btn');
  const invertBtn = document.getElementById('invert-btn');
  const grayscaleBtn = document.getElementById('grayscale-btn');
  const brightnessBtn = document.getElementById('brightness-btn');
  const beigeBtn = document.getElementById('beige-btn');
  const heightBtn = document.getElementById('height-btn');
  const normalBtn = document.getElementById('normal-btn');
  const sobelBtn = document.getElementById('sobel-btn');
  const polarizationBtn = document.getElementById('polarization-btn');
  const acrylicBtn = document.getElementById('acrylic-btn');
  const medianBtn = document.getElementById('median-btn');
  const redSlider = document.getElementById('red-slider');
  const greenSlider = document.getElementById('green-slider');
  const blueSlider = document.getElementById('blue-slider');
  const alphaSlider = document.getElementById('alpha-slider');
  const brightnessSlider = document.getElementById('brightness-slider');
  const redResetBtn = document.getElementById('red-reset-btn');
  const greenResetBtn = document.getElementById('green-reset-btn');
  const blueResetBtn = document.getElementById('blue-reset-btn');
  const alphaResetBtn = document.getElementById('alpha-reset-btn');
  const brightnessResetBtn = document.getElementById('brightness-reset-btn');
  const redValue = document.getElementById('red-value');
  const greenValue = document.getElementById('green-value');
  const blueValue = document.getElementById('blue-value');
  const alphaValue = document.getElementById('alpha-value');
  const brightnessValue = document.getElementById('brightness-value');
  const workspaceStage = document.querySelector('.workspace-stage');
  const rulerTop = document.getElementById('ruler-top');
  const rulerLeft = document.getElementById('ruler-left');
  const scaleReadout = document.getElementById('scale-readout');
  const undoProgressFill = document.getElementById('undo-progress-fill');
  const redoProgressFill = document.getElementById('redo-progress-fill');
  const undoProgressText = document.getElementById('undo-progress-text');
  const redoProgressText = document.getElementById('redo-progress-text');
  const duplicateLayerBtn = document.getElementById('duplicate-layer-btn');
  const newLayerBtn = document.getElementById('new-layer-btn');
  const layerToggleBtn = document.getElementById('layer-toggle-btn');
  const layerMergeBtn = document.getElementById('layer-merge-btn');
  const layerDiscardBtn = document.getElementById('layer-discard-btn');
  const layerOpacitySlider = document.getElementById('layer-opacity-slider');
  const layerOpacityValue = document.getElementById('layer-opacity-value');
  const layerBlendMode = document.getElementById('layer-blend-mode');
  const layerStatus = document.getElementById('layer-status');
  const layerList = document.getElementById('layer-list');
  const canvasGrabBtn = document.getElementById('canvas-grab-btn');
  const layerGrabBtn = document.getElementById('layer-grab-btn');
  const annotationOverlay = document.getElementById('annotation-overlay');
  const annotationPenBtn = document.getElementById('annotation-tool-pen-btn');
  const annotationPencilBtn = document.getElementById('annotation-tool-pencil-btn');
  const annotationBrushBtn = document.getElementById('annotation-tool-brush-btn');
  const annotationLineBtn = document.getElementById('annotation-tool-line-btn');
  const annotationSizeSlider = document.getElementById('annotation-size-slider');
  const annotationSizeValue = document.getElementById('annotation-size-value');
  const annotationSizeResetBtn = document.getElementById('annotation-size-reset-btn');
  const annotationColorInput = document.getElementById('annotation-color-input');

  const downloadBtn = document.getElementById('download-btn');
  const quitBtn = document.getElementById('quit-btn');

  // Validate minimum required controls so runtime errors fail fast and clearly.
  if (!dropArea || !preview) {
    console.error('Required editor elements are missing (#drop-area or #preview).');
    return;
  }

  // Upload safety limits to prevent huge files from freezing the UI.
  const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 MB
  const MAX_TOTAL_PIXELS = 40000000; // 40 MP
  const ALLOWED_IMAGE_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/bmp'
  ]);
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = Array.from(ALLOWED_IMAGE_TYPES).join(',');
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  preview.draggable = false;
  dropArea.tabIndex = 0;
  dropArea.setAttribute('role', 'button');
  dropArea.setAttribute('aria-label', 'Upload image');

  // Per-channel buffers for non-destructive slider-based channel edits.
  let channelData = {
    red: null,
    green: null,
    blue: null,
    alpha: null,
    width: 0,
    height: 0,
    sourceKey: null
  };

  // Multi-step history stacks for undo/redo
  const MAX_HISTORY_STEPS = 200;
  let undoStack = [];
  let redoStack = [];
  let hasChanges = false; // legacy flag kept for compatibility

  // Flag to prevent re-extracting channels when updating display
  let isApplyingRGBA = false;

  let isFlipped = false;
  let offsetX = 0;
  let offsetY = 0;
  let width = 0;
  let height = 0;
  let originalWidth = 0;
  let originalHeight = 0;
  let initialWidth = 0;
  let initialHeight = 0;
  let rotation = 0;
  const moveStep = 2;
  const sizeStep = 10;
  const layerScaleStep = 0.03;
  const FIT_PADDING = 8;
  const RULER_SIZE = 26;
  const RULER_TARGET_MAJOR_SPACING = 90;
  const RULER_UNITS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragLayerStartX = 0;
  let dragLayerStartY = 0;
  let dragLayerId = null;
  let activeGrabMode = 'canvas';
  let activeKeys = {};
  let transformHistoryArmed = true;
  let animationFrameId = null;
  let activePreviewObjectUrl = null;
  let sliderHistoryArmed = true;
  let channelApplyToken = 0;
  let isFreshUploadLoad = false;
  const DEFAULT_CHANNEL_VALUES = {
    red: '255',
    green: '255',
    blue: '255',
    alpha: '255',
    brightness: '100'
  };
  const BLEND_MODE_MAP = {
    normal: 'source-over',
    multiply: 'multiply',
    screen: 'screen',
    overlay: 'overlay'
  };
  const TOOL_VISIBILITY_STORAGE_KEY = 'imageStudio.toolVisibility.v1';
  const GRAB_MODE_STORAGE_KEY = 'imageStudio.grabMode.v1';
  const DEFAULT_TOOL_VISIBILITY = {
    transform: true,
    filters: true,
    channels: true,
    layers: true,
    annotate: true
  };
  const DEFAULT_ANNOTATION_SIZE = 6;
  const DEFAULT_ANNOTATION_COLOR = '#ff3b3b';
  const layerState = {
    layers: [],
    selectedLayerId: null,
    renderToken: 0,
    nextLayerId: 1,
    canvasWidth: 0,
    canvasHeight: 0
  };
  let activeAnnotationTool = 'pen';
  let activeInteractionMode = 'grab';
  let annotationColor = DEFAULT_ANNOTATION_COLOR;
  let annotationSize = DEFAULT_ANNOTATION_SIZE;
  let isAnnotationDrawing = false;
  let annotationStartX = 0;
  let annotationStartY = 0;
  let nextLayerNumber = 1;

  /**
   * Returns true if an image is currently active in the workspace.
   * Keeps display-state checks consistent in one place.
   * @returns {boolean}
   */
  function isImageLoaded() {
    return preview.style.display === 'block';
  }

  function isAnnotationToolActive() {
    if (!isPanelVisible(sideMenu5)) return false;
    if (activeInteractionMode !== 'annotate') return false;
    return activeAnnotationTool === 'pen'
      || activeAnnotationTool === 'pencil'
      || activeAnnotationTool === 'brush'
      || activeAnnotationTool === 'line';
  }

  function resetChannelControls(applyToImage = false) {
    redSlider.value = DEFAULT_CHANNEL_VALUES.red;
    greenSlider.value = DEFAULT_CHANNEL_VALUES.green;
    blueSlider.value = DEFAULT_CHANNEL_VALUES.blue;
    alphaSlider.value = DEFAULT_CHANNEL_VALUES.alpha;
    brightnessSlider.value = DEFAULT_CHANNEL_VALUES.brightness;
    redValue.value = DEFAULT_CHANNEL_VALUES.red;
    greenValue.value = DEFAULT_CHANNEL_VALUES.green;
    blueValue.value = DEFAULT_CHANNEL_VALUES.blue;
    alphaValue.value = DEFAULT_CHANNEL_VALUES.alpha;
    brightnessValue.value = DEFAULT_CHANNEL_VALUES.brightness;

    if (applyToImage && isImageLoaded()) {
      applyRGBAMultipliers(preview);
    }
  }

  function readStorageJson(key, fallbackValue) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallbackValue;
      return JSON.parse(raw);
    } catch (err) {
      return fallbackValue;
    }
  }

  function writeStorageJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Ignore persistence failures (private mode/quota/security policy).
    }
  }

  function readStorageString(key, fallbackValue) {
    try {
      const raw = localStorage.getItem(key);
      return raw || fallbackValue;
    } catch (err) {
      return fallbackValue;
    }
  }

  function writeStorageString(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      // Ignore persistence failures (private mode/quota/security policy).
    }
  }

  function isPanelVisible(panel) {
    if (!panel) return false;
    return panel.style.display !== 'none';
  }

  function setPanelVisibility(panel, isVisible, shownDisplay = 'flex') {
    if (!panel) return;
    panel.style.display = isVisible ? shownDisplay : 'none';
  }

  function getToolVisibilityPreferences() {
    const stored = readStorageJson(TOOL_VISIBILITY_STORAGE_KEY, DEFAULT_TOOL_VISIBILITY);
    return {
      transform: stored && typeof stored.transform === 'boolean' ? stored.transform : DEFAULT_TOOL_VISIBILITY.transform,
      filters: stored && typeof stored.filters === 'boolean' ? stored.filters : DEFAULT_TOOL_VISIBILITY.filters,
      channels: stored && typeof stored.channels === 'boolean' ? stored.channels : DEFAULT_TOOL_VISIBILITY.channels,
      layers: stored && typeof stored.layers === 'boolean' ? stored.layers : DEFAULT_TOOL_VISIBILITY.layers,
      annotate: stored && typeof stored.annotate === 'boolean' ? stored.annotate : DEFAULT_TOOL_VISIBILITY.annotate
    };
  }

  function saveToolVisibilityPreferences() {
    writeStorageJson(TOOL_VISIBILITY_STORAGE_KEY, {
      transform: isPanelVisible(sideMenu),
      filters: isPanelVisible(sideMenu2),
      channels: isPanelVisible(sideMenu3),
      layers: isPanelVisible(sideMenu4),
      annotate: isPanelVisible(sideMenu5)
    });
  }

  function applyStoredToolVisibilityPreferences() {
    const prefs = getToolVisibilityPreferences();
    setPanelVisibility(sideMenu, prefs.transform, 'flex');
    setPanelVisibility(sideMenu2, prefs.filters, 'flex');
    setPanelVisibility(sideMenu3, prefs.channels, 'flex');
    setPanelVisibility(sideMenu4, prefs.layers, 'flex');
    setPanelVisibility(sideMenu5, prefs.annotate, 'flex');
  }

  function clearChannelDataCache() {
    channelData.red = null;
    channelData.green = null;
    channelData.blue = null;
    channelData.alpha = null;
    channelData.width = 0;
    channelData.height = 0;
    channelData.sourceKey = null;
  }

  function extractChannelDataFromImage(imageElement, sourceKey) {
    const sourceWidth = imageElement.naturalWidth || imageElement.width;
    const sourceHeight = imageElement.naturalHeight || imageElement.height;
    if (!sourceWidth || !sourceHeight) {
      clearChannelDataCache();
      return false;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    ctx.drawImage(imageElement, 0, 0, sourceWidth, sourceHeight);
    const imageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
    const data = imageData.data;
    const pixelCount = sourceWidth * sourceHeight;

    channelData.red = new Uint8ClampedArray(pixelCount);
    channelData.green = new Uint8ClampedArray(pixelCount);
    channelData.blue = new Uint8ClampedArray(pixelCount);
    channelData.alpha = new Uint8ClampedArray(pixelCount);
    channelData.width = sourceWidth;
    channelData.height = sourceHeight;
    channelData.sourceKey = sourceKey || null;

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 4;
      channelData.red[i] = data[idx];
      channelData.green[i] = data[idx + 1];
      channelData.blue[i] = data[idx + 2];
      channelData.alpha[i] = data[idx + 3];
    }
    return true;
  }

  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.add('dragover');
  });

  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
  });

  function handleImageFile(file, options = {}) {
    // Basic file gatekeeping before creating object URLs.
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      alert('Please drop a valid image file (PNG, JPG, WEBP, GIF, or BMP).');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      alert('Image file is too large. Please use an image smaller than 20 MB.');
      return;
    }
    if (options.appendAsLayer && isImageLoaded()) {
      addImageAsLayer(file);
      return;
    }
    resetLayerState();
    if (activePreviewObjectUrl) {
      URL.revokeObjectURL(activePreviewObjectUrl);
      activePreviewObjectUrl = null;
    }
    const objectUrl = URL.createObjectURL(file);
    activePreviewObjectUrl = objectUrl;
    isFreshUploadLoad = true;
    preview.onerror = function() {
      if (activePreviewObjectUrl) {
        URL.revokeObjectURL(activePreviewObjectUrl);
        activePreviewObjectUrl = null;
      }
      updateAnnotationOverlayInteractivity();
      alert('Unable to load that image file.');
    };
    preview.onload = function() {
      if (activePreviewObjectUrl) {
        URL.revokeObjectURL(activePreviewObjectUrl);
        activePreviewObjectUrl = null;
      }
      // Skip channel extraction if we're just applying RGBA modifications
      if (isApplyingRGBA) {
        isApplyingRGBA = false;
        return;
      }
      // Layer composite renders also update preview.src; skip upload-style
      // channel/control re-initialization for those internal refreshes.
      if (isLayerSessionActive()) {
        return;
      }

      originalWidth = preview.naturalWidth;
      originalHeight = preview.naturalHeight;
      const totalPixels = originalWidth * originalHeight;
      if (totalPixels > MAX_TOTAL_PIXELS) {
        preview.style.display = 'none';
        dropArea.style.display = 'flex';
        alert('Image dimensions are too large. Please use an image under 40 megapixels.');
        return;
      }

      extractChannelDataFromImage(preview, `preview:${preview.currentSrc || preview.src}`);

      // Reset channel controls only when loading a brand-new upload.
      if (isFreshUploadLoad) {
        resetChannelControls(false);
      }

      // Scale image to fit the current canvas workspace while maintaining aspect ratio
      const bounds = getCanvasBounds();
      let scaleFactor = Math.min(bounds.width / originalWidth, bounds.height / originalHeight);
      if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) {
        alert('Invalid image dimensions.');
        return;
      }
      width = originalWidth * scaleFactor;
      height = originalHeight * scaleFactor;
      initialWidth = width;
      initialHeight = height;

      if (isFreshUploadLoad) {
        dropArea.style.display = 'none';
        showBtn.style.display = 'none';
        menuBtn.style.display = 'flex';
        isFlipped = false;
        offsetX = 0;
        offsetY = 0;
        rotation = 0;
        clearHistory();
        stopAnimationLoop();
        startAnimationLoop();
        isFreshUploadLoad = false;
      }

      updateImageTransform();
      updateAnnotationOverlayInteractivity();
    };
    preview.style.display = 'block';
    preview.src = objectUrl;
  }

  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageFile(files[0], { appendAsLayer: true });
    }
  });

  function openFilePicker() {
    fileInput.value = '';
    fileInput.click();
  }

  dropArea.addEventListener('click', () => {
    openFilePicker();
  });

  dropArea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFilePicker();
    }
  });

  function setFileMenuOpen(isOpen) {
    if (!fileMenuBtn || !fileMenu) return;
    fileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    fileMenu.classList.toggle('is-open', isOpen);
  }

  function setEditMenuOpen(isOpen) {
    if (!editMenuBtn || !editMenu) return;
    editMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    editMenu.classList.toggle('is-open', isOpen);
  }

  if (fileMenuBtn && fileMenu) {
    fileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const shouldOpen = fileMenuBtn.getAttribute('aria-expanded') !== 'true';
      setEditMenuOpen(false);
      setFileMenuOpen(shouldOpen);
    });

    fileMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (editMenuBtn && editMenu) {
    editMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const shouldOpen = editMenuBtn.getAttribute('aria-expanded') !== 'true';
      setFileMenuOpen(false);
      setEditMenuOpen(shouldOpen);
    });

    editMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (fileMenuBtn || editMenuBtn) {
    document.addEventListener('click', () => {
      setFileMenuOpen(false);
      setEditMenuOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setFileMenuOpen(false);
        setEditMenuOpen(false);
      }
    });
  }

  if (openFileBtn) {
    openFileBtn.addEventListener('click', () => {
      setFileMenuOpen(false);
      setEditMenuOpen(false);
      openFilePicker();
    });
  }

  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageFile(files[0], { appendAsLayer: true });
    }
  });

  function getCanvasBounds() {
    const fallback = {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight
    };

    if (!workspaceStage) return fallback;

    const stageRect = workspaceStage.getBoundingClientRect();
    const left = stageRect.left + RULER_SIZE + FIT_PADDING;
    const top = stageRect.top + RULER_SIZE + FIT_PADDING;
    const right = stageRect.right - FIT_PADDING;
    const bottom = stageRect.bottom - FIT_PADDING;
    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);

    return { left, top, right, bottom, width, height };
  }

  function pickMajorUnit(pixelsPerUnit) {
    for (const unit of RULER_UNITS) {
      if ((unit * pixelsPerUnit) >= RULER_TARGET_MAJOR_SPACING) {
        return unit;
      }
    }
    return RULER_UNITS[RULER_UNITS.length - 1];
  }

  function buildRulerTicks(container, config) {
    const {
      isVertical,
      axisStartPx,
      axisLengthPx,
      originPx,
      pixelsPerUnit,
      majorUnit,
      minorUnit
    } = config;

    if (!container || axisLengthPx <= 0 || pixelsPerUnit <= 0) return;

    container.innerHTML = '';
    const minUnit = (axisStartPx - originPx) / pixelsPerUnit;
    const maxUnit = ((axisStartPx + axisLengthPx) - originPx) / pixelsPerUnit;
    const firstMinorIndex = Math.floor(minUnit / minorUnit);
    const lastMinorIndex = Math.ceil(maxUnit / minorUnit);
    const maxTicks = 500;

    for (let i = firstMinorIndex; i <= lastMinorIndex && (i - firstMinorIndex) <= maxTicks; i++) {
      const value = i * minorUnit;
      const pixelPos = (originPx + (value * pixelsPerUnit)) - axisStartPx;
      if (pixelPos < -1 || pixelPos > axisLengthPx + 1) continue;

      const majorIndex = Math.round(value / majorUnit);
      const isMajor = Math.abs(value - (majorIndex * majorUnit)) < 0.0001;

      const tick = document.createElement('span');
      tick.className = 'ruler-tick';
      if (isVertical) {
        tick.style.top = `${pixelPos}px`;
        tick.style.width = isMajor ? '13px' : '8px';
      } else {
        tick.style.left = `${pixelPos}px`;
        tick.style.height = isMajor ? '13px' : '8px';
      }
      container.appendChild(tick);

      if (isMajor) {
        const label = document.createElement('span');
        label.className = 'ruler-label';
        label.textContent = `${Math.round(value)}`;
        if (isVertical) {
          label.style.top = `${pixelPos + 1}px`;
        } else {
          label.style.left = `${pixelPos + 1}px`;
        }
        container.appendChild(label);
      }
    }
  }

  function updateRulers() {
    if (!workspaceStage || !rulerTop || !rulerLeft || !scaleReadout) return;

    const stageRect = workspaceStage.getBoundingClientRect();
    const horizontalLength = Math.max(0, stageRect.width - RULER_SIZE);
    const verticalLength = Math.max(0, stageRect.height - RULER_SIZE);

    if (horizontalLength <= 0 || verticalLength <= 0) return;

    let pixelsPerUnit = 1;
    let originX = stageRect.left + RULER_SIZE;
    let originY = stageRect.top + RULER_SIZE;
    let readout = 'No image loaded';

    if (originalWidth > 0 && originalHeight > 0 && width > 0 && height > 0) {
      pixelsPerUnit = width / originalWidth;
      if (!Number.isFinite(pixelsPerUnit) || pixelsPerUnit <= 0) {
        pixelsPerUnit = 1;
      }

      const stageCenterX = stageRect.left + (stageRect.width / 2);
      const stageCenterY = stageRect.top + (stageRect.height / 2);
      originX = stageCenterX + offsetX - (width / 2);
      originY = stageCenterY + offsetY - (height / 2);

      const zoomPercent = Math.round((width / originalWidth) * 100);
      readout = `${originalWidth}x${originalHeight}px | ${Math.round(width)}x${Math.round(height)}px | ${zoomPercent}%`;
    }

    const majorUnit = pickMajorUnit(pixelsPerUnit);
    const minorUnit = Math.max(majorUnit / 5, 1);

    buildRulerTicks(rulerTop, {
      isVertical: false,
      axisStartPx: stageRect.left + RULER_SIZE,
      axisLengthPx: horizontalLength,
      originPx: originX,
      pixelsPerUnit,
      majorUnit,
      minorUnit
    });

    buildRulerTicks(rulerLeft, {
      isVertical: true,
      axisStartPx: stageRect.top + RULER_SIZE,
      axisLengthPx: verticalLength,
      originPx: originY,
      pixelsPerUnit,
      majorUnit,
      minorUnit
    });

    scaleReadout.textContent = readout;
  }

  function updateImageTransform() {
    // Compose translation, flip, and rotation into a single CSS transform.
    const scaleX = isFlipped ? -1 : 1;
    preview.style.width = width + 'px';
    preview.style.height = height + 'px';
    const transformString = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scaleX(${scaleX}) rotate(${rotation}deg)`;
    preview.style.transform = transformString;
    if (annotationOverlay) {
      annotationOverlay.style.width = `${Math.max(1, Math.round(width))}px`;
      annotationOverlay.style.height = `${Math.max(1, Math.round(height))}px`;
      annotationOverlay.style.transform = transformString;
      annotationOverlay.style.display = isImageLoaded() ? 'block' : 'none';
    }
    updateAnnotationOverlayInteractivity();
    updateRulers();
  }

  function getAnnotationContext() {
    if (!annotationOverlay) return null;
    return annotationOverlay.getContext('2d');
  }

  function syncAnnotationCanvasDimensions() {
    if (!annotationOverlay || !isImageLoaded()) return;
    const canvasWidth = Math.max(1, Math.round(width));
    const canvasHeight = Math.max(1, Math.round(height));
    if (annotationOverlay.width === canvasWidth && annotationOverlay.height === canvasHeight) return;
    annotationOverlay.width = canvasWidth;
    annotationOverlay.height = canvasHeight;
  }

  function clearAnnotationOverlay() {
    const ctx = getAnnotationContext();
    if (!ctx || !annotationOverlay) return;
    ctx.clearRect(0, 0, annotationOverlay.width, annotationOverlay.height);
  }

  function clampAnnotationSize(rawSize) {
    const parsed = Number.parseInt(rawSize, 10);
    if (!Number.isFinite(parsed)) return annotationSize;
    return Math.max(1, Math.min(80, parsed));
  }

  function syncAnnotationToolButtons() {
    if (annotationPenBtn) annotationPenBtn.classList.toggle('is-active', activeAnnotationTool === 'pen');
    if (annotationPencilBtn) annotationPencilBtn.classList.toggle('is-active', activeAnnotationTool === 'pencil');
    if (annotationBrushBtn) annotationBrushBtn.classList.toggle('is-active', activeAnnotationTool === 'brush');
    if (annotationLineBtn) annotationLineBtn.classList.toggle('is-active', activeAnnotationTool === 'line');
  }

  function setAnnotationTool(tool) {
    const nextTool = ['pen', 'pencil', 'brush', 'line'].includes(tool) ? tool : 'pen';
    activeAnnotationTool = nextTool;
    activeInteractionMode = 'annotate';
    syncAnnotationToolButtons();
    updatePreviewCursor();
    updateAnnotationOverlayInteractivity();
  }

  function setAnnotationSize(rawSize) {
    annotationSize = clampAnnotationSize(rawSize);
    if (annotationSizeSlider) annotationSizeSlider.value = String(annotationSize);
    if (annotationSizeValue) annotationSizeValue.value = String(annotationSize);
  }

  function normalizeHexColor(rawColor) {
    if (typeof rawColor !== 'string') return DEFAULT_ANNOTATION_COLOR;
    const trimmed = rawColor.trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(trimmed)) return DEFAULT_ANNOTATION_COLOR;
    return trimmed.toLowerCase();
  }

  function setAnnotationColor(rawColor) {
    annotationColor = normalizeHexColor(rawColor);
    if (annotationColorInput) annotationColorInput.value = annotationColor;
  }

  function updateAnnotationOverlayInteractivity() {
    if (!annotationOverlay) return;
    const allowDraw = isImageLoaded() && isAnnotationToolActive();
    annotationOverlay.style.pointerEvents = allowDraw ? 'auto' : 'none';
    if (!isImageLoaded()) {
      clearAnnotationOverlay();
    }
  }

  function getAnnotationPointFromClient(clientX, clientY) {
    if (!workspaceStage || !isImageLoaded()) return null;
    const stageRect = workspaceStage.getBoundingClientRect();
    const centerX = stageRect.left + (stageRect.width / 2) + offsetX;
    const centerY = stageRect.top + (stageRect.height / 2) + offsetY;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const angle = (rotation * Math.PI) / 180;
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const rotatedX = (dx * cos) - (dy * sin);
    const rotatedY = (dx * sin) + (dy * cos);
    const unflippedX = isFlipped ? -rotatedX : rotatedX;
    const x = unflippedX + (width / 2);
    const y = rotatedY + (height / 2);
    if (x < 0 || y < 0 || x > width || y > height) return null;
    return { x, y };
  }

  function applyAnnotationStrokeStyle(ctx, tool) {
    if (!ctx) return;
    const size = Math.max(1, annotationSize);
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = annotationColor;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = 'transparent';
    if (tool === 'pencil') {
      ctx.globalAlpha = 0.72;
      ctx.lineWidth = Math.max(1, size * 0.85);
      return;
    }
    if (tool === 'brush') {
      ctx.globalAlpha = 0.34;
      ctx.lineWidth = Math.max(1, size * 1.8);
      ctx.shadowColor = annotationColor;
      ctx.shadowBlur = Math.max(1, size * 0.9);
      return;
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = size;
  }

  function drawAnnotationSegment(startX, startY, endX, endY, tool) {
    const ctx = getAnnotationContext();
    if (!ctx || !annotationOverlay) return;
    applyAnnotationStrokeStyle(ctx, tool);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  function drawAnnotationLinePreview(endX, endY) {
    const ctx = getAnnotationContext();
    if (!ctx || !annotationOverlay) return;
    ctx.clearRect(0, 0, annotationOverlay.width, annotationOverlay.height);
    drawAnnotationSegment(annotationStartX, annotationStartY, endX, endY, 'line');
  }

  function commitAnnotationOverlayToImage() {
    if (!annotationOverlay || !isImageLoaded()) return;
    if (annotationOverlay.width <= 0 || annotationOverlay.height <= 0) return;
    const dims = getImageDimensions(preview);
    if (!dims) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = dims.width;
    canvas.height = dims.height;
    ctx.drawImage(preview, 0, 0, dims.width, dims.height);
    ctx.drawImage(annotationOverlay, 0, 0, canvas.width, canvas.height);
    hasChanges = true;
    if (isLayerSessionActive()) {
      resetLayerState();
    }
    preview.src = canvas.toDataURL('image/png');
    clearAnnotationOverlay();
  }

  function startAnimationLoop() {
    if (animationFrameId !== null) return;
    function loop() {
      let updated = false;

      const wantsTransform = activeKeys['ArrowUp'] || activeKeys['ArrowDown'] || activeKeys['ArrowLeft']
        || activeKeys['ArrowRight'] || activeKeys['Enlarge'] || activeKeys['Shrink'];

      if (wantsTransform) {
        if (activeGrabMode === 'layer' && ensureLayerSessionFromPreview()) {
          const selectedLayer = getSelectedLayer();
          if (selectedLayer) {
            if (transformHistoryArmed) {
              saveImageState(preview);
              transformHistoryArmed = false;
            }
            if (activeKeys['ArrowUp']) {
              selectedLayer.y -= moveStep;
              updated = true;
            }
            if (activeKeys['ArrowDown']) {
              selectedLayer.y += moveStep;
              updated = true;
            }
            if (activeKeys['ArrowLeft']) {
              selectedLayer.x -= moveStep;
              updated = true;
            }
            if (activeKeys['ArrowRight']) {
              selectedLayer.x += moveStep;
              updated = true;
            }
            if (activeKeys['Enlarge']) {
              selectedLayer.scale = Math.min(8, Math.max(0.05, Number(selectedLayer.scale || 1) + layerScaleStep));
              updated = true;
            }
            if (activeKeys['Shrink']) {
              selectedLayer.scale = Math.min(8, Math.max(0.05, Number(selectedLayer.scale || 1) - layerScaleStep));
              updated = true;
            }
          }
          if (updated) {
            syncLayerControls();
            renderLayerComposite();
          }
        } else if (activeGrabMode === 'canvas' && isImageLoaded()) {
          if (activeKeys['ArrowUp']) {
            offsetY -= moveStep;
            updated = true;
          }
          if (activeKeys['ArrowDown']) {
            offsetY += moveStep;
            updated = true;
          }
          if (activeKeys['ArrowLeft']) {
            offsetX -= moveStep;
            updated = true;
          }
          if (activeKeys['ArrowRight']) {
            offsetX += moveStep;
            updated = true;
          }
          if (activeKeys['Enlarge'] && scaleCanvasPreview(1)) {
            updated = true;
          }
          if (activeKeys['Shrink'] && scaleCanvasPreview(-1)) {
            updated = true;
          }
          if (updated) {
            updateImageTransform();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(loop);
    }
    
    loop();
  }

  function stopAnimationLoop() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  /**
   * Turns a press-and-hold button into an entry in the keyboard action map.
   * @param {HTMLElement|null} button
   * @param {string} actionKey
   */
  function bindHoldKeyButton(button, actionKey) {
    if (!button) return;
    button.addEventListener('mousedown', () => {
      activeKeys[actionKey] = true;
    });
    button.addEventListener('mouseup', () => {
      activeKeys[actionKey] = false;
      if (!activeKeys['ArrowUp'] && !activeKeys['ArrowDown'] && !activeKeys['ArrowLeft']
        && !activeKeys['ArrowRight'] && !activeKeys['Enlarge'] && !activeKeys['Shrink']) {
        transformHistoryArmed = true;
      }
    });
    button.addEventListener('mouseleave', () => {
      activeKeys[actionKey] = false;
      if (!activeKeys['ArrowUp'] && !activeKeys['ArrowDown'] && !activeKeys['ArrowLeft']
        && !activeKeys['ArrowRight'] && !activeKeys['Enlarge'] && !activeKeys['Shrink']) {
        transformHistoryArmed = true;
      }
    });
  }

  bindHoldKeyButton(enlargeBtn, 'Enlarge');
  bindHoldKeyButton(shrinkBtn, 'Shrink');
  bindHoldKeyButton(upBtn, 'ArrowUp');
  bindHoldKeyButton(downBtn, 'ArrowDown');
  bindHoldKeyButton(leftBtn, 'ArrowLeft');
  bindHoldKeyButton(rightBtn, 'ArrowRight');

  /**
   * Execute an image operation only when an image is loaded.
   * Optionally saves undo state before applying the operation.
   * @param {() => void} operation
   * @param {{saveHistory?: boolean}} [options]
   */
  function runImageOperation(operation, options = {}) {
    if (!isImageLoaded()) return;
    if (options.saveHistory) {
      saveImageState(preview);
    }
    operation();
    if (isLayerSessionActive()) {
      resetLayerState();
    }
  }

  resetBtn.addEventListener('click', () => {
    applyTransformByGrabMode((layer) => {
      layer.x = 0;
      layer.y = 0;
      layer.scale = 1;
      layer.rotation = 0;
      layer.flipX = false;
    }, () => {
      offsetX = 0;
      offsetY = 0;
      width = initialWidth || width;
      height = initialHeight || height;
      rotation = 0;
      isFlipped = false;
    }, { saveLayerHistory: true });
  });
  
  flipBtn.addEventListener('click', () => {
    applyTransformByGrabMode((layer) => {
      layer.flipX = !Boolean(layer.flipX);
    }, () => {
      isFlipped = !isFlipped;
    }, { saveLayerHistory: true });
  });
  
  rotateBtn.addEventListener('click', () => {
    applyTransformByGrabMode((layer) => {
      const next = (Number(layer.rotation || 0) + 90) % 360;
      layer.rotation = next;
    }, () => {
      rotation = (rotation + 90) % 360;
    }, { saveLayerHistory: true });
  });
  
  restoreBtn.addEventListener('click', () => {
    setEditMenuOpen(false);
    restoreImageState(preview);
  });

  if (redoBtn) {
    redoBtn.addEventListener('click', () => {
      setEditMenuOpen(false);
      redoImageState(preview);
    });
  }

  /**
   * Attach a click filter/action with consistent guard + undo behavior.
   * @param {HTMLElement|null} button
   * @param {(image: HTMLImageElement) => void} handler
   */
  function bindFilterButton(button, handler) {
    if (!button) return;
    button.addEventListener('click', () => {
      runImageOperation(() => handler(preview), { saveHistory: true });
    });
  }

  bindFilterButton(invertBtn, invertImageColors);
  bindFilterButton(grayscaleBtn, grayscaleImage);
  bindFilterButton(brightnessBtn, reduceBrightnessByPosition);
  bindFilterButton(beigeBtn, beigeImage);
  bindFilterButton(heightBtn, heightImage);
  bindFilterButton(normalBtn, normalImage);
  bindFilterButton(sobelBtn, applySobelFilter);
  bindFilterButton(polarizationBtn, applyPolarization);
  bindFilterButton(acrylicBtn, applyAcrylicFilter);
  bindFilterButton(medianBtn, applyMedianFilter);

  function isLayerSessionActive() {
    return layerState.layers.length > 0;
  }

  function setLayerStatus(text) {
    if (layerStatus) {
      layerStatus.textContent = text;
    }
  }

  function createCurrentImageDataUrl() {
    const snapshot = createImageSnapshot(preview);
    return snapshot ? snapshot.dataUrl : null;
  }

  function loadImageData(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to decode layer image data.'));
      img.src = dataUrl;
    });
  }

  function getSelectedLayerIndex() {
    if (!isLayerSessionActive()) return -1;
    const selectedIndex = layerState.layers.findIndex((layer) => layer.id === layerState.selectedLayerId);
    if (selectedIndex >= 0) return selectedIndex;
    return layerState.layers.length - 1;
  }

  function getSelectedLayer() {
    const idx = getSelectedLayerIndex();
    return idx >= 0 ? layerState.layers[idx] : null;
  }

  function ensureLayerSessionFromPreview() {
    if (isLayerSessionActive()) return true;
    if (!isImageLoaded()) return false;
    const baseDataUrl = createCurrentImageDataUrl();
    const dims = getImageDimensions(preview);
    if (!baseDataUrl || !dims) return false;

    const baseLayerId = layerState.nextLayerId++;
    layerState.layers = [{
      id: baseLayerId,
      name: 'Background',
      dataUrl: baseDataUrl,
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      scale: 1,
      rotation: 0,
      flipX: false,
      x: 0,
      y: 0
    }];
    layerState.selectedLayerId = baseLayerId;
    layerState.canvasWidth = dims.width;
    layerState.canvasHeight = dims.height;
    return true;
  }

  function renderLayerList() {
    if (!layerList) return;
    if (!isLayerSessionActive()) {
      layerList.innerHTML = `<div class="layer-list-item is-active">
        <span class="layer-eye"></span>
        <span class="layer-thumb"><span class="layer-chip">BG</span></span>
        <span class="layer-name">Background</span>
      </div>`;
      return;
    }

    const rows = [];
    for (let i = layerState.layers.length - 1; i >= 0; i--) {
      const layer = layerState.layers[i];
      const chip = i === 0 ? 'BG' : `L${i}`;
      const activeClass = layer.id === layerState.selectedLayerId ? ' is-active' : '';
      const hiddenClass = layer.visible ? '' : ' is-hidden';
      const visibilityText = layer.visible ? 'Visible' : 'Hidden';
      rows.push(`<div class="layer-list-item${activeClass}${hiddenClass}" data-layer-id="${layer.id}">
        <span class="layer-eye" title="${visibilityText}"></span>
        <span class="layer-thumb"><span class="layer-chip">${chip}</span></span>
        <span class="layer-name">${layer.name}</span>
      </div>`);
    }
    layerList.innerHTML = rows.join('');
  }

  function syncLayerControls() {
    const selectedLayer = getSelectedLayer();
    const opacityValueSafe = selectedLayer ? String(selectedLayer.opacity) : '100';
    if (layerOpacitySlider) {
      layerOpacitySlider.value = opacityValueSafe;
    }
    if (layerOpacityValue) {
      layerOpacityValue.value = opacityValueSafe;
    }
    if (layerBlendMode) {
      layerBlendMode.value = selectedLayer ? selectedLayer.blendMode : 'normal';
    }
    if (layerToggleBtn) {
      const isVisible = selectedLayer ? selectedLayer.visible : true;
      const nextActionLabel = isVisible ? 'Hide Layer' : 'Show Layer';
      layerToggleBtn.setAttribute('aria-label', nextActionLabel);
      layerToggleBtn.setAttribute('title', nextActionLabel);
    }
    renderLayerList();
  }

  function applyTransformToSelectedLayer(mutator, options = {}) {
    const saveHistory = options.saveHistory !== false;
    if (!ensureLayerSessionFromPreview()) return;
    const selectedLayer = getSelectedLayer();
    if (!selectedLayer) return;
    if (saveHistory) {
      saveImageState(preview);
    }
    mutator(selectedLayer);
    syncLayerControls();
    renderLayerComposite();
  }

  function scaleCanvasPreview(direction) {
    if (!isImageLoaded()) return false;
    const baseWidth = Number.isFinite(width) && width > 0 ? width : Math.max(1, Number(initialWidth) || 1);
    const baseHeight = Number.isFinite(height) && height > 0 ? height : Math.max(1, Number(initialHeight) || 1);
    const nextWidth = Math.max(20, baseWidth + (direction * sizeStep));
    const scaleFactor = nextWidth / baseWidth;
    width = nextWidth;
    height = Math.max(20, baseHeight * scaleFactor);
    return true;
  }

  /**
   * Apply transform behavior based on the selected grab mode.
   * Canvas mode updates viewport transform only and does not touch undo/redo.
   * Layer mode updates the selected layer and keeps current undo/redo behavior.
   * @param {(layer: {x:number,y:number,scale:number,rotation:number,flipX:boolean}) => void} layerMutator
   * @param {() => void} canvasMutator
   * @param {{saveLayerHistory?: boolean}} [options]
   */
  function applyTransformByGrabMode(layerMutator, canvasMutator, options = {}) {
    if (activeGrabMode === 'layer') {
      applyTransformToSelectedLayer(layerMutator, {
        saveHistory: options.saveLayerHistory !== false
      });
      return;
    }
    if (!isImageLoaded()) return;
    canvasMutator();
    updateImageTransform();
  }

  function resetLayerState() {
    layerState.layers = [];
    layerState.selectedLayerId = null;
    layerState.renderToken += 1;
    layerState.nextLayerId = 1;
    layerState.canvasWidth = 0;
    layerState.canvasHeight = 0;
    nextLayerNumber = 1;
    setLayerStatus('Top layer inactive');
    syncLayerControls();
  }

  function sanitizeLayerName(rawName) {
    const trimmed = String(rawName || '').trim();
    if (!trimmed) return `Layer ${nextLayerNumber}`;
    const noExt = trimmed.replace(/\.[^/.]+$/, '');
    return noExt || `Layer ${nextLayerNumber}`;
  }

  function createTransparentLayerDataUrl(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas.toDataURL('image/png');
  }

  function fitImageToLayerCanvasDataUrl(image, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const scale = Math.min(width / sourceWidth, height / sourceHeight);
    const drawWidth = Math.max(1, Math.round(sourceWidth * scale));
    const drawHeight = Math.max(1, Math.round(sourceHeight * scale));
    const offsetX = Math.round((width - drawWidth) / 2);
    const offsetY = Math.round((height - drawHeight) / 2);
    ctx.drawImage(image, 0, 0, sourceWidth, sourceHeight, offsetX, offsetY, drawWidth, drawHeight);
    return canvas.toDataURL('image/png');
  }

  async function renderLayerComposite() {
    if (!isLayerSessionActive()) return;
    const renderToken = ++layerState.renderToken;

    try {
      const loadedLayers = await Promise.all(layerState.layers.map(async (layer) => ({
        layer,
        image: await loadImageData(layer.dataUrl)
      })));
      if (renderToken !== layerState.renderToken) return;

      const canvas = document.createElement('canvas');
      canvas.width = layerState.canvasWidth;
      canvas.height = layerState.canvasHeight;
      const ctx = canvas.getContext('2d');

      for (const loaded of loadedLayers) {
        const layer = loaded.layer;
        if (!layer.visible) continue;
        ctx.globalAlpha = Math.max(0, Math.min(100, layer.opacity)) / 100;
        ctx.globalCompositeOperation = BLEND_MODE_MAP[layer.blendMode] || 'source-over';
        const layerX = Number(layer.x || 0);
        const layerY = Number(layer.y || 0);
        const layerScale = Math.max(0.05, Number(layer.scale || 1));
        const layerRotation = Number(layer.rotation || 0);
        const layerFlipX = Boolean(layer.flipX);
        const drawWidth = canvas.width * layerScale;
        const drawHeight = canvas.height * layerScale;
        ctx.save();
        ctx.translate((canvas.width / 2) + layerX, (canvas.height / 2) + layerY);
        ctx.rotate((layerRotation * Math.PI) / 180);
        ctx.scale(layerFlipX ? -1 : 1, 1);
        ctx.drawImage(loaded.image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();
      }

      preview.src = canvas.toDataURL();
      const selectedLayer = getSelectedLayer();
      if (selectedLayer) {
        setLayerStatus(`Active: ${selectedLayer.name} | ${selectedLayer.blendMode} | ${selectedLayer.opacity}%`);
      } else {
        setLayerStatus('Layer stack active');
      }
    } catch (err) {
      console.error('Layer composite render failed:', err);
    }
  }

  function createTopLayerFromCurrent() {
    if (!isImageLoaded()) return;
    if (!ensureLayerSessionFromPreview()) return;
    const selected = getSelectedLayer();
    if (!selected) return;

    saveImageState(preview);
    const id = layerState.nextLayerId++;
    layerState.layers.push({
      id,
      name: `Layer ${nextLayerNumber}`,
      dataUrl: selected.dataUrl,
      visible: true,
      opacity: 100,
      blendMode: selected.blendMode,
      scale: Number(selected.scale || 1),
      rotation: Number(selected.rotation || 0),
      flipX: Boolean(selected.flipX),
      x: Number(selected.x || 0),
      y: Number(selected.y || 0)
    });
    nextLayerNumber += 1;
    layerState.selectedLayerId = id;
    syncLayerControls();
    renderLayerComposite();
  }

  function createNewLayerFromCurrent() {
    if (!isImageLoaded()) return;
    if (!ensureLayerSessionFromPreview()) return;
    saveImageState(preview);

    const id = layerState.nextLayerId++;
    layerState.layers.push({
      id,
      name: `Layer ${nextLayerNumber}`,
      dataUrl: createTransparentLayerDataUrl(layerState.canvasWidth, layerState.canvasHeight),
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      scale: 1,
      rotation: 0,
      flipX: false,
      x: 0,
      y: 0
    });
    nextLayerNumber += 1;
    layerState.selectedLayerId = id;
    syncLayerControls();
    renderLayerComposite();
  }

  function discardTopLayer() {
    if (!ensureLayerSessionFromPreview()) return;
    const selectedIndex = getSelectedLayerIndex();
    if (selectedIndex < 0) return;
    if (layerState.layers.length <= 1) {
      setLayerStatus('Cannot discard the only layer.');
      return;
    }

    saveImageState(preview);
    layerState.layers.splice(selectedIndex, 1);
    const nextIndex = Math.min(selectedIndex, layerState.layers.length - 1);
    layerState.selectedLayerId = layerState.layers[nextIndex].id;
    syncLayerControls();
    renderLayerComposite();
  }

  function mergeTopLayer() {
    if (!ensureLayerSessionFromPreview()) return;
    const selectedIndex = getSelectedLayerIndex();
    if (selectedIndex <= 0) {
      setLayerStatus('Select a layer above background to merge.');
      return;
    }

    saveImageState(preview);
    const topLayer = layerState.layers[selectedIndex];
    const belowLayer = layerState.layers[selectedIndex - 1];

    Promise.all([loadImageData(belowLayer.dataUrl), loadImageData(topLayer.dataUrl)])
      .then(([belowImage, topImage]) => {
        const canvas = document.createElement('canvas');
        canvas.width = layerState.canvasWidth;
        canvas.height = layerState.canvasHeight;
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        const belowScale = Math.max(0.05, Number(belowLayer.scale || 1));
        const belowDrawWidth = canvas.width * belowScale;
        const belowDrawHeight = canvas.height * belowScale;
        ctx.save();
        ctx.translate((canvas.width / 2) + Number(belowLayer.x || 0), (canvas.height / 2) + Number(belowLayer.y || 0));
        ctx.rotate((Number(belowLayer.rotation || 0) * Math.PI) / 180);
        ctx.scale(Boolean(belowLayer.flipX) ? -1 : 1, 1);
        ctx.drawImage(belowImage, -belowDrawWidth / 2, -belowDrawHeight / 2, belowDrawWidth, belowDrawHeight);
        ctx.restore();
        if (topLayer.visible) {
          ctx.globalAlpha = Math.max(0, Math.min(100, topLayer.opacity)) / 100;
          ctx.globalCompositeOperation = BLEND_MODE_MAP[topLayer.blendMode] || 'source-over';
          const topScale = Math.max(0.05, Number(topLayer.scale || 1));
          const topDrawWidth = canvas.width * topScale;
          const topDrawHeight = canvas.height * topScale;
          ctx.save();
          ctx.translate((canvas.width / 2) + Number(topLayer.x || 0), (canvas.height / 2) + Number(topLayer.y || 0));
          ctx.rotate((Number(topLayer.rotation || 0) * Math.PI) / 180);
          ctx.scale(Boolean(topLayer.flipX) ? -1 : 1, 1);
          ctx.drawImage(topImage, -topDrawWidth / 2, -topDrawHeight / 2, topDrawWidth, topDrawHeight);
          ctx.restore();
        }
        belowLayer.dataUrl = canvas.toDataURL('image/png');
        belowLayer.name = `${belowLayer.name} + ${topLayer.name}`;
        belowLayer.visible = true;
        belowLayer.opacity = 100;
        belowLayer.blendMode = 'normal';
        belowLayer.scale = 1;
        belowLayer.rotation = 0;
        belowLayer.flipX = false;
        belowLayer.x = 0;
        belowLayer.y = 0;
        layerState.layers.splice(selectedIndex, 1);
        layerState.selectedLayerId = belowLayer.id;
        syncLayerControls();
        renderLayerComposite();
      })
      .catch((err) => {
        console.error('Layer merge failed:', err);
      });
  }

  async function addImageAsLayer(file) {
    if (!isImageLoaded()) return;

    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await loadImageData(objectUrl);
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      if ((width * height) > MAX_TOTAL_PIXELS) {
        alert('Image dimensions are too large. Please use an image under 40 megapixels.');
        return;
      }

      if (!ensureLayerSessionFromPreview()) return;
      saveImageState(preview);
      const id = layerState.nextLayerId++;
      const layerName = sanitizeLayerName(file.name);
      layerState.layers.push({
        id,
        name: layerName,
        dataUrl: fitImageToLayerCanvasDataUrl(image, layerState.canvasWidth, layerState.canvasHeight),
        visible: true,
        opacity: 100,
        blendMode: 'normal',
        scale: 1,
        rotation: 0,
        flipX: false,
        x: 0,
        y: 0
      });
      layerState.selectedLayerId = id;
      nextLayerNumber += 1;
      syncLayerControls();
      renderLayerComposite();
    } catch (err) {
      console.error('Failed to add image layer:', err);
      alert('Unable to load that image file.');
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  /**
   * Toggle a panel between hidden and shown states.
   * @param {HTMLElement|null} panel
   * @param {string} [shownDisplay='flex']
   */
  function togglePanel(panel, shownDisplay = 'flex') {
    if (!panel) return;
    panel.style.display = panel.style.display === 'none' ? shownDisplay : 'none';
  }

  function toggleToolPanel(panel, shownDisplay = 'flex') {
    togglePanel(panel, shownDisplay);
    saveToolVisibilityPreferences();
  }

  function syncMenuButtonStates() {
    if (menuBtn && sideMenu) {
      menuBtn.classList.toggle('is-open', sideMenu.style.display !== 'none');
    }
    if (menuBtn2 && sideMenu2) {
      menuBtn2.classList.toggle('is-open', sideMenu2.style.display !== 'none');
    }
    if (menuBtn3 && sideMenu3) {
      menuBtn3.classList.toggle('is-open', sideMenu3.style.display !== 'none');
    }
    if (menuBtn4 && sideMenu4) {
      menuBtn4.classList.toggle('is-open', sideMenu4.style.display !== 'none');
    }
    if (menuBtn5 && sideMenu5) {
      menuBtn5.classList.toggle('is-open', sideMenu5.style.display !== 'none');
    }
  }

  menuBtn.addEventListener('click', () => {
    activeInteractionMode = 'grab';
    toggleToolPanel(sideMenu, 'flex');
    updateSideMenuPositions();
    syncMenuButtonStates();
    updatePreviewCursor();
    updateAnnotationOverlayInteractivity();
  });

  closeMenuBtn.addEventListener('click', () => {
    sideMenu.style.display = 'none';
    activeInteractionMode = 'grab';
    saveToolVisibilityPreferences();
    updateSideMenuPositions();
    syncMenuButtonStates();
    updatePreviewCursor();
    updateAnnotationOverlayInteractivity();
  });

  showBtn.addEventListener('click', () => {
    sideMenu.style.display = 'flex';
    showBtn.style.display = 'none';
    saveToolVisibilityPreferences();
    updateSideMenuPositions();
    syncMenuButtonStates();
  });

  helpBtn.addEventListener('click', () => {
    togglePanel(helpMenu, 'block');
  });

  closeHelpBtn.addEventListener('click', () => {
    helpMenu.style.display = 'none';
  });

  // Filters menu toggle (second menu)
  if (menuBtn2 && sideMenu2) {
    menuBtn2.addEventListener('click', () => {
      toggleToolPanel(sideMenu2, 'flex');
      updateSideMenuPositions();
      syncMenuButtonStates();
    });
  }

  if (closeMenu2Btn) {
    closeMenu2Btn.addEventListener('click', () => {
      sideMenu2.style.display = 'none';
      saveToolVisibilityPreferences();
      updateSideMenuPositions();
      syncMenuButtonStates();
    });
  }

  // Channels menu toggle (third menu)
  if (menuBtn3 && sideMenu3) {
    menuBtn3.addEventListener('click', () => {
      toggleToolPanel(sideMenu3, 'flex');
      updateSideMenuPositions();
      syncMenuButtonStates();
    });
  }

  if (closeMenu3Btn) {
    closeMenu3Btn.addEventListener('click', () => {
      sideMenu3.style.display = 'none';
      saveToolVisibilityPreferences();
      updateSideMenuPositions();
      syncMenuButtonStates();
    });
  }

  // Layers menu toggle (fourth menu)
  if (menuBtn4 && sideMenu4) {
    menuBtn4.addEventListener('click', () => {
      toggleToolPanel(sideMenu4, 'flex');
      updateSideMenuPositions();
      syncMenuButtonStates();
    });
  }

  if (closeMenu4Btn) {
    closeMenu4Btn.addEventListener('click', () => {
      sideMenu4.style.display = 'none';
      saveToolVisibilityPreferences();
      updateSideMenuPositions();
      syncMenuButtonStates();
    });
  }

  if (menuBtn5 && sideMenu5) {
    menuBtn5.addEventListener('click', () => {
      toggleToolPanel(sideMenu5, 'flex');
      activeInteractionMode = isPanelVisible(sideMenu5) ? 'annotate' : 'grab';
      updateSideMenuPositions();
      syncMenuButtonStates();
      updatePreviewCursor();
      updateAnnotationOverlayInteractivity();
    });
  }

  if (closeMenu5Btn) {
    closeMenu5Btn.addEventListener('click', () => {
      sideMenu5.style.display = 'none';
      activeInteractionMode = 'grab';
      saveToolVisibilityPreferences();
      updateSideMenuPositions();
      syncMenuButtonStates();
      updatePreviewCursor();
      updateAnnotationOverlayInteractivity();
    });
  }

  if (duplicateLayerBtn) {
    duplicateLayerBtn.addEventListener('click', () => {
      createTopLayerFromCurrent();
    });
  }

  if (newLayerBtn) {
    newLayerBtn.addEventListener('click', () => {
      createNewLayerFromCurrent();
    });
  }

  if (canvasGrabBtn) {
    canvasGrabBtn.addEventListener('click', () => {
      setGrabMode('canvas');
    });
  }

  if (layerGrabBtn) {
    layerGrabBtn.addEventListener('click', () => {
      setGrabMode('layer');
    });
  }

  if (layerToggleBtn) {
    layerToggleBtn.addEventListener('click', () => {
      if (!ensureLayerSessionFromPreview()) return;
      const selectedLayer = getSelectedLayer();
      if (!selectedLayer) return;
      selectedLayer.visible = !selectedLayer.visible;
      syncLayerControls();
      renderLayerComposite();
    });
  }

  if (layerMergeBtn) {
    layerMergeBtn.addEventListener('click', () => {
      if (!isLayerSessionActive()) return;
      mergeTopLayer();
    });
  }

  if (layerDiscardBtn) {
    layerDiscardBtn.addEventListener('click', () => {
      discardTopLayer();
    });
  }

  if (layerList) {
    layerList.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const row = target.closest('.layer-list-item');
      if (!row) return;
      const layerIdRaw = row.getAttribute('data-layer-id');
      if (!layerIdRaw) return;
      const layerId = Number.parseInt(layerIdRaw, 10);
      if (!Number.isFinite(layerId)) return;
      layerState.selectedLayerId = layerId;
      syncLayerControls();
    });
  }

  function clampLayerOpacity(rawValue) {
    const value = Number.parseInt(rawValue, 10);
    const selectedLayer = getSelectedLayer();
    const fallback = selectedLayer ? selectedLayer.opacity : 100;
    if (!Number.isFinite(value)) return fallback;
    return Math.max(0, Math.min(100, value));
  }

  if (layerOpacitySlider) {
    layerOpacitySlider.addEventListener('input', () => {
      if (!ensureLayerSessionFromPreview()) return;
      const selectedLayer = getSelectedLayer();
      if (!selectedLayer) return;
      selectedLayer.opacity = clampLayerOpacity(layerOpacitySlider.value);
      syncLayerControls();
      renderLayerComposite();
    });
  }

  if (layerOpacityValue) {
    layerOpacityValue.addEventListener('input', () => {
      if (!ensureLayerSessionFromPreview() && layerOpacityValue.value.trim() === '') return;
      const selectedLayer = getSelectedLayer();
      if (!selectedLayer) return;
      selectedLayer.opacity = clampLayerOpacity(layerOpacityValue.value);
      syncLayerControls();
      renderLayerComposite();
    });
  }

  if (layerBlendMode) {
    layerBlendMode.addEventListener('change', () => {
      if (!ensureLayerSessionFromPreview()) return;
      const selectedLayer = getSelectedLayer();
      if (!selectedLayer) return;
      const nextMode = layerBlendMode.value;
      if (!BLEND_MODE_MAP[nextMode]) return;
      selectedLayer.blendMode = nextMode;
      syncLayerControls();
      renderLayerComposite();
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      setFileMenuOpen(false);
      if (isImageLoaded()) {
        downloadImage(preview, 'modified-image.png');
      }
    });
  }

  if (quitBtn) {
    quitBtn.addEventListener('click', () => {
      setFileMenuOpen(false);
      reloadPage();
    });
  }

  function updatePreviewCursor() {
    if (!isImageLoaded()) {
      preview.style.cursor = 'default';
      if (annotationOverlay) annotationOverlay.style.cursor = 'default';
      return;
    }
    if (isAnnotationToolActive()) {
      preview.style.cursor = 'crosshair';
      if (annotationOverlay) annotationOverlay.style.cursor = 'crosshair';
      return;
    }
    preview.style.cursor = isDragging ? 'grabbing' : 'grab';
    if (annotationOverlay) annotationOverlay.style.cursor = isDragging ? 'grabbing' : 'grab';
  }

  function setGrabMode(mode, options = {}) {
    const persist = options.persist !== false;
    activeGrabMode = mode === 'layer' ? 'layer' : 'canvas';
    activeInteractionMode = 'grab';
    if (canvasGrabBtn) {
      canvasGrabBtn.classList.toggle('is-active', activeGrabMode === 'canvas');
    }
    if (layerGrabBtn) {
      layerGrabBtn.classList.toggle('is-active', activeGrabMode === 'layer');
    }
    if (persist) {
      writeStorageString(GRAB_MODE_STORAGE_KEY, activeGrabMode);
    }
    updatePreviewCursor();
    updateAnnotationOverlayInteractivity();
  }

  function endDrag(pointerId = null) {
    if (!isDragging) return;
    isDragging = false;
    dragLayerId = null;
    if (pointerId !== null && preview.hasPointerCapture && preview.hasPointerCapture(pointerId)) {
      preview.releasePointerCapture(pointerId);
    }
    updatePreviewCursor();
  }

  preview.addEventListener('dragstart', (e) => {
    e.preventDefault();
  });

  preview.addEventListener('pointerdown', (e) => {
    if (!isImageLoaded() || e.button !== 0 || isAnnotationToolActive()) return;
    e.preventDefault();
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    if (activeGrabMode === 'layer') {
      if (!ensureLayerSessionFromPreview()) {
        isDragging = false;
        return;
      }
      const selectedLayer = getSelectedLayer();
      if (!selectedLayer) {
        isDragging = false;
        return;
      }
      saveImageState(preview);
      dragLayerId = selectedLayer.id;
      dragLayerStartX = Number(selectedLayer.x || 0);
      dragLayerStartY = Number(selectedLayer.y || 0);
    } else {
      dragOffsetX = offsetX;
      dragOffsetY = offsetY;
    }
    if (preview.setPointerCapture) {
      preview.setPointerCapture(e.pointerId);
    }
    updatePreviewCursor();
  });

  preview.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    if (activeGrabMode === 'layer') {
      if (!isLayerSessionActive()) return;
      const layer = layerState.layers.find((entry) => entry.id === dragLayerId);
      if (!layer) return;
      const zoomScale = (originalWidth > 0 && width > 0) ? (width / originalWidth) : 1;
      const safeScale = Number.isFinite(zoomScale) && zoomScale > 0 ? zoomScale : 1;
      layer.x = dragLayerStartX + (deltaX / safeScale);
      layer.y = dragLayerStartY + (deltaY / safeScale);
      renderLayerComposite();
      syncLayerControls();
    } else {
      offsetX = dragOffsetX + deltaX;
      offsetY = dragOffsetY + deltaY;
      updateImageTransform();
    }
  });

  preview.addEventListener('pointerup', (e) => {
    endDrag(e.pointerId);
  });

  preview.addEventListener('pointercancel', (e) => {
    endDrag(e.pointerId);
  });

  preview.addEventListener('pointerenter', () => {
    updatePreviewCursor();
  });

  preview.addEventListener('pointerleave', () => {
    if (!isDragging) {
      preview.style.cursor = 'default';
    }
  });

  document.addEventListener('pointerup', () => {
    endDrag();
  });

  if (annotationOverlay) {
    annotationOverlay.addEventListener('pointerdown', (e) => {
      if (!isImageLoaded() || !isAnnotationToolActive() || e.button !== 0) return;
      const point = getAnnotationPointFromClient(e.clientX, e.clientY);
      if (!point) return;
      e.preventDefault();
      syncAnnotationCanvasDimensions();
      clearAnnotationOverlay();
      saveImageState(preview);
      isAnnotationDrawing = true;
      annotationStartX = point.x;
      annotationStartY = point.y;
      if (activeAnnotationTool !== 'line') {
        drawAnnotationSegment(point.x, point.y, point.x, point.y, activeAnnotationTool);
      }
      if (annotationOverlay.setPointerCapture) {
        annotationOverlay.setPointerCapture(e.pointerId);
      }
    });

    annotationOverlay.addEventListener('pointermove', (e) => {
      if (!isAnnotationDrawing || !isImageLoaded() || !isAnnotationToolActive()) return;
      const point = getAnnotationPointFromClient(e.clientX, e.clientY);
      if (!point) return;
      if (activeAnnotationTool === 'line') {
        drawAnnotationLinePreview(point.x, point.y);
        return;
      }
      drawAnnotationSegment(annotationStartX, annotationStartY, point.x, point.y, activeAnnotationTool);
      annotationStartX = point.x;
      annotationStartY = point.y;
    });

    const stopAnnotationDrawing = (pointerId = null) => {
      if (!isAnnotationDrawing) return;
      isAnnotationDrawing = false;
      if (pointerId !== null && annotationOverlay.hasPointerCapture && annotationOverlay.hasPointerCapture(pointerId)) {
        annotationOverlay.releasePointerCapture(pointerId);
      }
      commitAnnotationOverlayToImage();
    };

    annotationOverlay.addEventListener('pointerup', (e) => {
      if (isAnnotationDrawing && activeAnnotationTool === 'line') {
        const point = getAnnotationPointFromClient(e.clientX, e.clientY);
        if (point) {
          drawAnnotationLinePreview(point.x, point.y);
        }
      }
      stopAnnotationDrawing(e.pointerId);
    });

    annotationOverlay.addEventListener('pointercancel', (e) => {
      stopAnnotationDrawing(e.pointerId);
    });

    document.addEventListener('pointerup', () => {
      stopAnnotationDrawing();
    });
  }

  if (annotationPenBtn) {
    annotationPenBtn.addEventListener('click', () => {
      setAnnotationTool('pen');
      updateAnnotationOverlayInteractivity();
    });
  }

  if (annotationPencilBtn) {
    annotationPencilBtn.addEventListener('click', () => {
      setAnnotationTool('pencil');
      updateAnnotationOverlayInteractivity();
    });
  }

  if (annotationBrushBtn) {
    annotationBrushBtn.addEventListener('click', () => {
      setAnnotationTool('brush');
      updateAnnotationOverlayInteractivity();
    });
  }

  if (annotationLineBtn) {
    annotationLineBtn.addEventListener('click', () => {
      setAnnotationTool('line');
      updateAnnotationOverlayInteractivity();
    });
  }

  if (annotationSizeSlider) {
    annotationSizeSlider.addEventListener('input', () => {
      setAnnotationSize(annotationSizeSlider.value);
    });
  }

  if (annotationSizeValue) {
    annotationSizeValue.addEventListener('input', () => {
      if (annotationSizeValue.value.trim() === '') return;
      setAnnotationSize(annotationSizeValue.value);
    });
    annotationSizeValue.addEventListener('blur', () => {
      setAnnotationSize(annotationSizeValue.value);
    });
  }

  if (annotationSizeResetBtn) {
    annotationSizeResetBtn.addEventListener('click', () => {
      setAnnotationSize(DEFAULT_ANNOTATION_SIZE);
    });
  }

  if (annotationColorInput) {
    annotationColorInput.addEventListener('input', () => {
      setAnnotationColor(annotationColorInput.value);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (isImageLoaded()) {
      const key = e.key.toLowerCase();
      const isUndo = e.altKey && !e.shiftKey && key === 'z';
      const isRedo = (e.altKey && e.shiftKey && key === 'z') || (e.altKey && key === 'y');

      if (isUndo) {
        e.preventDefault();
        restoreImageState(preview);
        return;
      }

      if (isRedo) {
        e.preventDefault();
        redoImageState(preview);
        return;
      }

      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          activeKeys['ArrowUp'] = true;
          break;
        case 'ArrowDown':
          e.preventDefault();
          activeKeys['ArrowDown'] = true;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          activeKeys['ArrowLeft'] = true;
          break;
        case 'ArrowRight':
          e.preventDefault();
          activeKeys['ArrowRight'] = true;
          break;
        case '+':
        case '=':
          e.preventDefault();
          activeKeys['Enlarge'] = true;
          break;
        case '-':
        case '_':
          e.preventDefault();
          activeKeys['Shrink'] = true;
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          applyTransformByGrabMode((layer) => {
            layer.flipX = !Boolean(layer.flipX);
          }, () => {
            isFlipped = !isFlipped;
          }, { saveLayerHistory: true });
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          applyTransformByGrabMode((layer) => {
            const next = (Number(layer.rotation || 0) + 90) % 360;
            layer.rotation = next;
          }, () => {
            rotation = (rotation + 90) % 360;
          }, { saveLayerHistory: true });
          break;
      }
    }
  });

  function rearmTransformHistoryIfIdle() {
    if (!activeKeys['ArrowUp'] && !activeKeys['ArrowDown'] && !activeKeys['ArrowLeft']
      && !activeKeys['ArrowRight'] && !activeKeys['Enlarge'] && !activeKeys['Shrink']) {
      transformHistoryArmed = true;
    }
  }

  document.addEventListener('keyup', (e) => {
    switch(e.key) {
      case 'ArrowUp':
        activeKeys['ArrowUp'] = false;
        rearmTransformHistoryIfIdle();
        break;
      case 'ArrowDown':
        activeKeys['ArrowDown'] = false;
        rearmTransformHistoryIfIdle();
        break;
      case 'ArrowLeft':
        activeKeys['ArrowLeft'] = false;
        rearmTransformHistoryIfIdle();
        break;
      case 'ArrowRight':
        activeKeys['ArrowRight'] = false;
        rearmTransformHistoryIfIdle();
        break;
      case '+':
      case '=':
        activeKeys['Enlarge'] = false;
        rearmTransformHistoryIfIdle();
        break;
      case '-':
      case '_':
        activeKeys['Shrink'] = false;
        rearmTransformHistoryIfIdle();
        break;
    }
  });

  if (workspaceStage) {
    workspaceStage.addEventListener('wheel', (e) => {
      if (isImageLoaded()) {
        e.preventDefault();
        applyTransformByGrabMode((layer) => {
          const nextScale = Number(layer.scale || 1) + (e.deltaY < 0 ? layerScaleStep : -layerScaleStep);
          layer.scale = Math.min(8, Math.max(0.05, nextScale));
        }, () => {
          scaleCanvasPreview(e.deltaY < 0 ? 1 : -1);
        }, { saveLayerHistory: true });
      }
    }, { passive: false });
  }

  /**
   * Ensure side-menu inline positioning is cleared so inspector cards are CSS-driven.
   */
  function updateSideMenuPositions() {
    try {
      if (sideMenu) {
        sideMenu.style.top = '';
      }

      if (sideMenu2) {
        sideMenu2.style.top = '';
      }

      if (sideMenu3) {
        sideMenu3.style.top = '';
      }

      if (sideMenu4) {
        sideMenu4.style.top = '';
      }

      if (sideMenu5) {
        sideMenu5.style.top = '';
      }
    } catch (err) {
      // silent fail if elements aren't available yet
      // console.warn('updateSideMenuPositions failed', err);
    }
  }

  // Recompute card layout on resize.
  window.addEventListener('resize', () => {
    updateSideMenuPositions();
    if (isImageLoaded()) {
      updateImageTransform();
    } else {
      updateRulers();
    }
  });

  // Initial positioning
  updateSideMenuPositions();
  applyStoredToolVisibilityPreferences();
  syncMenuButtonStates();
  setAnnotationTool('pen');
  setAnnotationSize(DEFAULT_ANNOTATION_SIZE);
  setAnnotationColor(DEFAULT_ANNOTATION_COLOR);
  syncAnnotationCanvasDimensions();
  updateAnnotationOverlayInteractivity();
  setGrabMode(readStorageString(GRAB_MODE_STORAGE_KEY, 'canvas'), { persist: false });
  resetLayerState();
  updateRulers();
  /**
   * Modify image pixels by calling a user-provided callback per pixel.
   * @param {HTMLImageElement} imageElement - Source image element.
   * @param {function(number, number, number, number, number, number):{r:number,g:number,b:number,a?:number}} modifyPixelFunction
   *   Callback(row, col, r, g, b, a) -> modified {r,g,b[,a]}.
   * @returns {HTMLCanvasElement} Canvas containing modified image.
   * Side effects: none (does not modify DOM); caller should set image src from returned canvas.
   */
  function modifyImagePixels(imageElement, modifyPixelFunction) {
    const dims = getImageDimensions(imageElement);
    if (!dims) {
      const fallbackCanvas = document.createElement('canvas');
      return fallbackCanvas;
    }

    // Render source image into an offscreen canvas for per-pixel edits.
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { width, height } = dims;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Iterate row/column so filters can reason in 2D if needed.
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        // Pixel layout is RGBA in a flat Uint8ClampedArray.
        const pixelIndex = (row * width + col) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const a = data[pixelIndex + 3];
        const modifiedPixel = modifyPixelFunction(row, col, r, g, b, a);
        data[pixelIndex] = Math.round(modifiedPixel.r);
        data[pixelIndex + 1] = Math.round(modifiedPixel.g);
        data[pixelIndex + 2] = Math.round(modifiedPixel.b);
        if (modifiedPixel.a !== undefined) {
          data[pixelIndex + 3] = Math.round(modifiedPixel.a);
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * Invert colors of `imageElement` (per-channel 255 - value).
   * @param {HTMLImageElement} imageElement
   * Side effects: updates `imageElement.src` with modified image.
   */
  function invertImageColors(imageElement) {
    hasChanges = true;
    const modifiedCanvas = modifyImagePixels(imageElement, (row, col, r, g, b, a) => {
      return {
        r: 255 - r,
        g: 255 - g,
        b: 255 - b,
        a: a
      };
    });
    
    // Convert canvas back to image
    imageElement.src = modifiedCanvas.toDataURL();
  }

  /**
   * Convert image to grayscale using luminosity method.
   * @param {HTMLImageElement} imageElement
   * Side effects: updates `imageElement.src` with modified image.
   */
  function grayscaleImage(imageElement) {
    hasChanges = true;
    const modifiedCanvas = modifyImagePixels(imageElement, (row, col, r, g, b, a) => {
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      return {
        r: gray,
        g: gray,
        b: gray,
        a: a
      };
    });
    
    imageElement.src = modifiedCanvas.toDataURL();
  }

  /**
   * Apply a vignette-like darkening from image edges toward center.
   * @param {HTMLImageElement} imageElement
   * Side effects: updates `imageElement.src` with modified image.
   */
  function reduceBrightnessByPosition(imageElement) {
    hasChanges = true;
    const modifiedCanvas = modifyImagePixels(imageElement, (row, col, r, g, b, a) => {
      const width = imageElement.naturalWidth || imageElement.width;
      const height = imageElement.naturalHeight || imageElement.height;
      
      // Calculate distance from nearest edge (top, bottom, left, right)
      const distanceToNearestEdge = Math.min(row, col, height - 1 - row, width - 1 - col);
      const maxDistance = Math.min(width / 2, height / 2);
      
      // Distance factor: 1 at edges, 0 at center
      const distanceFactor = Math.max(0, 1 - (distanceToNearestEdge / maxDistance));
      
      return {
        r: Math.round(r * (1 - distanceFactor * 0.5)),
        g: Math.round(g * (1 - distanceFactor * 0.5)),
        b: Math.round(b * (1 - distanceFactor * 0.5)),
        a: a
      };
    });
    
    imageElement.src = modifiedCanvas.toDataURL();
  }

  /**
   * Apply a beige color overlay/mix to the image.
   * @param {HTMLImageElement} imageElement
   * Side effects: updates `imageElement.src` with modified image.
   */
  function beigeImage(imageElement) {
    hasChanges = true;
    const beige = { r: 232, g: 218, b: 188 };
    const strength = 0.3; // 0 = no effect, 1 = full beige

    const modifiedCanvas = modifyImagePixels(
      imageElement,
      (row, col, r, g, b, a) => {
        return {
          r: r * (1 - strength) + beige.r * strength,
          g: g * (1 - strength) + beige.g * strength,
          b: b * (1 - strength) + beige.b * strength,
          a: a
        };
      }
    );

    imageElement.src = modifiedCanvas.toDataURL();
  }

  /**
   * Compute a height map (grayscale normalized) from an image.
   * @param {HTMLImageElement} imageElement
   * @returns {{heightMap:Float32Array, width:number, height:number}}
   */
  function computeHeightMap(imageElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;

    ctx.drawImage(imageElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const heightMap = new Float32Array(canvas.width * canvas.height);

    for (let i = 0; i < heightMap.length; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      heightMap[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }

    return {
      heightMap,
      width: canvas.width,
      height: canvas.height
    };
  }

  /**
   * Render the height map as a grayscale image.
   * @param {HTMLImageElement} imageElement
   * Side effects: updates `imageElement.src` with modified image.
   */
  function heightImage(imageElement) {
    hasChanges = true;
    const { heightMap, width, height } = computeHeightMap(imageElement);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < heightMap.length; i++) {
      const v = heightMap[i] * 255;
      const idx = i * 4;

      data[idx]     = v;
      data[idx + 1] = v;
      data[idx + 2] = v;
      data[idx + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    imageElement.src = canvas.toDataURL();
  }

  /**
   * Compute normals from a height map and render as RGB normal map.
   * @param {HTMLImageElement} imageElement
   * @param {number} [strength=1] - Normal strength multiplier.
   * Side effects: updates `imageElement.src` with modified image.
   */
  function normalImage(imageElement, strength = 1) {
    hasChanges = true;
    const { heightMap, width, height } = computeHeightMap(imageElement);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    // Draw the original image to get alpha values
    ctx.drawImage(imageElement, 0, 0, width, height);
    const originalImageData = ctx.getImageData(0, 0, width, height);
    const originalData = originalImageData.data;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {

        const i = y * width + x;

        const hL = heightMap[y * width + Math.max(x - 1, 0)];
        const hR = heightMap[y * width + Math.min(x + 1, width - 1)];
        const hU = heightMap[Math.max(y - 1, 0) * width + x];
        const hD = heightMap[Math.min(y + 1, height - 1) * width + x];

        const dx = (hR - hL) * strength;
        const dy = (hD - hU) * strength;

        let nx = -dx;
        let ny = -dy;
        let nz = 1;

        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        nx /= len;
        ny /= len;
        nz /= len;

        const idx = i * 4;
        data[idx]     = (nx * 0.5 + 0.5) * 255;
        data[idx + 1] = (ny * 0.5 + 0.5) * 255;
        data[idx + 2] = (nz * 0.5 + 0.5) * 255;
        data[idx + 3] = originalData[idx + 3]; // Preserve original alpha
      }
    }

    ctx.putImageData(imageData, 0, 0);
    imageElement.src = canvas.toDataURL();
  }

  /**
   * Rebuild an image from separated RGBA channels using slider multipliers.
   * Uses `channelData` global arrays. Expects `channelData` to be populated.
   * @param {HTMLImageElement} imageElement
   * Side effects: updates `imageElement.src` and sets `isApplyingRGBA=true`.
   */
  function applyRGBAMultipliers(imageElement) {
    // Delegate to unified channel+brightness applier so RGBA sliders and
    // brightness slider compose correctly.
    const rValue = redSlider.value;
    const gValue = greenSlider.value;
    const bValue = blueSlider.value;
    const aValue = alphaSlider.value;
    const brightnessValue = brightnessSlider ? brightnessSlider.value : 100;
    applyChannelBrightness(imageElement, rValue, gValue, bValue, aValue, brightnessValue);
  }

  /**
   * Attach input listeners to RGBA and brightness sliders to update values
   * and reapply effects in real time.
   */
  function setupSliderListeners() {
    const sliderList = [redSlider, greenSlider, blueSlider, alphaSlider, brightnessSlider];
    const sliderValuePairs = [
      {
        slider: redSlider,
        valueInput: redValue,
        resetButton: redResetBtn,
        defaultValue: DEFAULT_CHANNEL_VALUES.red,
        apply: () => applyRGBAMultipliers(preview)
      },
      {
        slider: greenSlider,
        valueInput: greenValue,
        resetButton: greenResetBtn,
        defaultValue: DEFAULT_CHANNEL_VALUES.green,
        apply: () => applyRGBAMultipliers(preview)
      },
      {
        slider: blueSlider,
        valueInput: blueValue,
        resetButton: blueResetBtn,
        defaultValue: DEFAULT_CHANNEL_VALUES.blue,
        apply: () => applyRGBAMultipliers(preview)
      },
      {
        slider: alphaSlider,
        valueInput: alphaValue,
        resetButton: alphaResetBtn,
        defaultValue: DEFAULT_CHANNEL_VALUES.alpha,
        apply: () => applyRGBAMultipliers(preview)
      },
      {
        slider: brightnessSlider,
        valueInput: brightnessValue,
        resetButton: brightnessResetBtn,
        defaultValue: DEFAULT_CHANNEL_VALUES.brightness,
        apply: () => applyBrightness(preview, brightnessSlider.value)
      }
    ];

    function captureSliderHistoryIfNeeded() {
      if (isImageLoaded() && sliderHistoryArmed) {
        saveImageState(preview);
        sliderHistoryArmed = false;
      }
    }

    function armSliderHistory() {
      sliderHistoryArmed = true;
    }

    function clampToControlRange(control, rawValue) {
      const min = Number(control.min);
      const max = Number(control.max);
      const parsed = Number.parseInt(rawValue, 10);
      if (!Number.isFinite(parsed)) return control.value;
      return String(Math.min(max, Math.max(min, parsed)));
    }

    function applyValueInputChange(pair, allowEmpty = false) {
      if (allowEmpty && pair.valueInput.value.trim() === '') return;
      const nextValue = clampToControlRange(pair.slider, pair.valueInput.value);
      pair.slider.value = nextValue;
      pair.valueInput.value = nextValue;
      if (isImageLoaded()) {
        captureSliderHistoryIfNeeded();
        pair.apply();
      }
    }

    for (const slider of sliderList) {
      slider.addEventListener('pointerdown', armSliderHistory);
      slider.addEventListener('change', armSliderHistory);
      slider.addEventListener('blur', armSliderHistory);
    }

    for (const pair of sliderValuePairs) {
      pair.slider.addEventListener('input', () => {
        pair.valueInput.value = pair.slider.value;
        if (isImageLoaded()) {
          captureSliderHistoryIfNeeded();
          pair.apply();
        }
      });
      pair.valueInput.addEventListener('focus', armSliderHistory);
      pair.valueInput.addEventListener('pointerdown', armSliderHistory);
      pair.valueInput.addEventListener('input', () => applyValueInputChange(pair, true));
      pair.valueInput.addEventListener('change', () => {
        applyValueInputChange(pair);
        armSliderHistory();
      });
      pair.valueInput.addEventListener('blur', () => {
        applyValueInputChange(pair);
        armSliderHistory();
      });
      if (pair.resetButton) {
        pair.resetButton.addEventListener('click', () => {
          if (pair.slider.value === pair.defaultValue) return;
          if (isImageLoaded()) {
            saveImageState(preview);
          }
          pair.slider.value = pair.defaultValue;
          pair.valueInput.value = pair.defaultValue;
          if (isImageLoaded()) {
            pair.apply();
          }
          sliderHistoryArmed = true;
        });
      }
    }
  }

  /**
   * Get reliable image dimensions (prefers naturalWidth/naturalHeight).
   * @param {HTMLImageElement} imageElement
   * @returns {{width:number,height:number}|null} null if invalid dimensions.
   */
  function getImageDimensions(imageElement) {
    let width = imageElement.naturalWidth || imageElement.width;
    let height = imageElement.naturalHeight || imageElement.height;
    
    if (width === 0 || height === 0 || !width || !height) {
      width = imageElement.offsetWidth || imageElement.width;
      height = imageElement.offsetHeight || imageElement.height;
    }
    
    if (width <= 0 || height <= 0) {
      console.warn('Invalid image dimensions:', width, height);
      return null;
    }
    
    return { width, height };
  }

  function updateHistoryControls() {
    if (restoreBtn) restoreBtn.disabled = undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
    updateHistoryProgress();
  }

  function updateHistoryProgress() {
    const undoUsed = undoStack.length;
    const redoUsed = redoStack.length;
    const undoFree = Math.max(0, MAX_HISTORY_STEPS - undoUsed);
    const redoFree = Math.max(0, MAX_HISTORY_STEPS - redoUsed);
    const undoWidth = Math.max(0, Math.min(100, (undoUsed / MAX_HISTORY_STEPS) * 100));
    const redoWidth = Math.max(0, Math.min(100, (redoUsed / MAX_HISTORY_STEPS) * 100));

    if (undoProgressFill) undoProgressFill.style.width = `${undoWidth}%`;
    if (redoProgressFill) redoProgressFill.style.width = `${redoWidth}%`;
    if (undoProgressText) undoProgressText.textContent = `Used ${undoUsed} / Free ${undoFree}`;
    if (redoProgressText) redoProgressText.textContent = `Used ${redoUsed} / Free ${redoFree}`;
  }

  function clearHistory() {
    undoStack = [];
    redoStack = [];
    updateHistoryControls();
  }

  function createImageSnapshot(imageElement) {
    const dims = getImageDimensions(imageElement);
    if (!dims) return null;

    const { width, height } = dims;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageElement, 0, 0, width, height);

    return {
      width,
      height,
      dataUrl: canvas.toDataURL('image/png')
    };
  }

  function applyHistorySnapshot(imageElement, snapshot) {
    if (!snapshot || !snapshot.dataUrl) return;
    imageElement.src = snapshot.dataUrl;
  }

  /**
   * Capture the current image state to the undo stack and reset redo stack.
   * This should be called immediately before applying a destructive edit.
   */
  function saveImageState(imageElement) {
    const snapshot = createImageSnapshot(imageElement);
    if (!snapshot) return;

    undoStack.push(snapshot);
    if (undoStack.length > MAX_HISTORY_STEPS) {
      undoStack.shift();
    }
    redoStack = [];
    hasChanges = true;
    updateHistoryControls();
  }

  function restoreImageState(imageElement) {
    if (undoStack.length === 0) return;

    const currentSnapshot = createImageSnapshot(imageElement);
    const previousSnapshot = undoStack.pop();
    if (currentSnapshot) {
      redoStack.push(currentSnapshot);
      if (redoStack.length > MAX_HISTORY_STEPS) {
        redoStack.shift();
      }
    }
    applyHistorySnapshot(imageElement, previousSnapshot);
    resetLayerState();
    updateHistoryControls();
  }

  function redoImageState(imageElement) {
    if (redoStack.length === 0) return;

    const currentSnapshot = createImageSnapshot(imageElement);
    const redoSnapshot = redoStack.pop();
    if (currentSnapshot) {
      undoStack.push(currentSnapshot);
      if (undoStack.length > MAX_HISTORY_STEPS) {
        undoStack.shift();
      }
    }
    applyHistorySnapshot(imageElement, redoSnapshot);
    resetLayerState();
    updateHistoryControls();
  }

  /**
   * Reload the page to reset the app to its initial state.
   */
  function reloadPage() {
    location.reload();
  }

  /**
   * Apply Sobel edge detection to `imageElement` and update its src.
   * @param {HTMLImageElement} imageElement
   * Side effects: updates `imageElement.src` and sets `hasChanges=true`.
   */
  function applySobelFilter(imageElement) {
    hasChanges = true;
    const dims = getImageDimensions(imageElement);
    if (!dims) return;
    
    const { width, height } = dims;
    
    // Create canvas with exact image dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageElement, 0, 0, width, height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const outputData = ctx.createImageData(width, height);
    const output = outputData.data;
    
    // Convert to grayscale
    const grayscale = new Uint8ClampedArray(width * height);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      grayscale[j] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    }
    
    // Pre-computed Sobel kernel values
    const sobelKernels = {
      xKernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
      yKernel: [-1, -2, -1, 0, 0, 0, 1, 2, 1]
    };
    
    let maxMagnitude = 0;
    const magnitudes = new Float32Array(width * height);
    
    // Apply Sobel operator - single pass
    for (let y = 1; y < height - 1; y++) {
      const yOffset = y * width;
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        const centerOffset = yOffset + x;
        
        // Apply kernels using pre-computed flattened arrays
        let kernelIdx = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const rowOffset = (yOffset + dy * width);
          for (let dx = -1; dx <= 1; dx++) {
            const pixel = grayscale[rowOffset + x + dx];
            gx += pixel * sobelKernels.xKernel[kernelIdx];
            gy += pixel * sobelKernels.yKernel[kernelIdx];
            kernelIdx++;
          }
        }
        
        const magnitude = Math.hypot(gx, gy);
        magnitudes[centerOffset] = magnitude;
        if (magnitude > maxMagnitude) maxMagnitude = magnitude;
      }
    }
    
    // Apply results to output with normalization
    const normFactor = maxMagnitude > 0 ? 255 / maxMagnitude : 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const value = Math.round(magnitudes[y * width + x] * normFactor);
        output[idx] = output[idx + 1] = output[idx + 2] = value;
        output[idx + 3] = data[idx + 3]; // Preserve original alpha
      }
    }
    
    // Fill borders with original values
    for (let i = 0; i < width * 4; i += 4) {
      output[i] = output[i + 1] = output[i + 2] = 0;
      output[i + 3] = data[i + 3]; // Preserve original alpha
      output[((height - 1) * width * 4) + i] = 0;
      output[((height - 1) * width * 4) + i + 1] = 0;
      output[((height - 1) * width * 4) + i + 2] = 0;
      output[((height - 1) * width * 4) + i + 3] = data[((height - 1) * width * 4) + i + 3]; // Preserve original alpha
    }
    for (let y = 1; y < height - 1; y++) {
      const idx = y * width * 4;
      output[idx] = output[idx + 1] = output[idx + 2] = 0;
      output[idx + 3] = data[idx + 3]; // Preserve original alpha
      output[idx + (width - 1) * 4] = 0;
      output[idx + (width - 1) * 4 + 1] = 0;
      output[idx + (width - 1) * 4 + 2] = 0;
      output[idx + (width - 1) * 4 + 3] = data[idx + (width - 1) * 4 + 3]; // Preserve original alpha
    }
    
    ctx.putImageData(outputData, 0, 0);
    imageElement.src = canvas.toDataURL();
  }

  /**
   * Reconstruct the image from stored channel data scaled by `brightnessValue`.
   * @param {HTMLImageElement} imageElement
   * @param {number} brightnessValue - percent (100 = original)
   * Side effects: updates `imageElement.src` and sets `isApplyingRGBA=true`.
   */
  function applyBrightness(imageElement, brightnessValue) {
    // Keep backward compatibility: delegate to unified applier.
    const rValue = redSlider ? redSlider.value : 255;
    const gValue = greenSlider ? greenSlider.value : 255;
    const bValue = blueSlider ? blueSlider.value : 255;
    const aValue = alphaSlider ? alphaSlider.value : 255;
    applyChannelBrightness(imageElement, rValue, gValue, bValue, aValue, brightnessValue);
  }

  function renderChannelDataToDataUrl(rValue, gValue, bValue, aValue, brightnessValue) {
    if (!channelData.red) return null;

    const rv = Number(rValue) / 255;
    const gv = Number(gValue) / 255;
    const bv = Number(bValue) / 255;
    const av = Number(aValue) / 255;
    const brightnessFactor = Number(brightnessValue) / 100;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = channelData.width;
    canvas.height = channelData.height;

    const imageData = ctx.createImageData(channelData.width, channelData.height);
    const data = imageData.data;
    const pixelCount = channelData.width * channelData.height;

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 4;
      data[idx] = Math.min(255, Math.round(channelData.red[i] * rv * brightnessFactor));
      data[idx + 1] = Math.min(255, Math.round(channelData.green[i] * gv * brightnessFactor));
      data[idx + 2] = Math.min(255, Math.round(channelData.blue[i] * bv * brightnessFactor));
      data[idx + 3] = Math.min(255, Math.round(channelData.alpha[i] * av));
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }

  /**
   * Apply RGBA multipliers and brightness together using the separated
   * channel buffers stored in `channelData`.
   * @param {HTMLImageElement} imageElement
   * @param {number|string} rValue - 0-255 slider value for red
   * @param {number|string} gValue - 0-255 slider value for green
   * @param {number|string} bValue - 0-255 slider value for blue
   * @param {number|string} aValue - 0-255 slider value for alpha
   * @param {number|string} brightnessValue - percent (100 = original)
   */
  function applyChannelBrightness(imageElement, rValue, gValue, bValue, aValue, brightnessValue) {
    const applyToken = ++channelApplyToken;
    if (isLayerSessionActive()) {
      const selectedLayer = getSelectedLayer();
      if (!selectedLayer) return;
      const sourceKey = `layer:${selectedLayer.id}`;
      const selectedLayerId = selectedLayer.id;

      const applyToSelectedLayer = () => {
        if (applyToken !== channelApplyToken) return;
        const updatedDataUrl = renderChannelDataToDataUrl(rValue, gValue, bValue, aValue, brightnessValue);
        if (!updatedDataUrl) return;
        const activeLayer = layerState.layers.find((layer) => layer.id === selectedLayerId);
        if (!activeLayer) return;
        activeLayer.dataUrl = updatedDataUrl;
        hasChanges = true;
        renderLayerComposite();
      };

      if (!channelData.red || channelData.sourceKey !== sourceKey) {
        loadImageData(selectedLayer.dataUrl)
          .then((layerImage) => {
            if (applyToken !== channelApplyToken) return;
            const activeLayer = layerState.layers.find((layer) => layer.id === selectedLayerId);
            if (!activeLayer) return;
            if (!extractChannelDataFromImage(layerImage, sourceKey)) return;
            applyToSelectedLayer();
          })
          .catch((err) => {
            console.error('Failed to apply channels to selected layer:', err);
          });
        return;
      }

      applyToSelectedLayer();
      return;
    }

    if (!channelData.red) return;
    const updatedDataUrl = renderChannelDataToDataUrl(rValue, gValue, bValue, aValue, brightnessValue);
    if (!updatedDataUrl) return;
    hasChanges = true;
    isApplyingRGBA = true;
    imageElement.src = updatedDataUrl;
  }

  /**
   * Create a PNG of the image in its current displayed state (size + flip + rotation)
   * and trigger a download.
   * @param {HTMLImageElement} imageElement
   * @param {string} filename
   */
  function downloadImage(imageElement, filename = 'image.png') {
    try {
      const originalWidth = imageElement.naturalWidth;
      const originalHeight = imageElement.naturalHeight;

      if (!originalWidth || !originalHeight) {
        console.error("Image not fully loaded or invalid.");
        return;
      }

      // Determine canvas dimensions based on rotation
      let canvasWidth = originalWidth;
      let canvasHeight = originalHeight;
      
      // For 90 and 270 degree rotations, swap dimensions
      if (rotation === 90 || rotation === 270) {
        canvasWidth = originalHeight;
        canvasHeight = originalWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext('2d');

      // Save context state
      ctx.save();

      // Move to canvas center
      ctx.translate(canvasWidth / 2, canvasHeight / 2);

      // Apply rotation in radians
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply horizontal flip if active
      if (isFlipped) {
        ctx.scale(-1, 1);
      }

      // Draw full-resolution image centered
      ctx.drawImage(imageElement, -originalWidth / 2, -originalHeight / 2, originalWidth, originalHeight);

      // Restore context state
      ctx.restore();

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to convert canvas to blob for download');
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/png');

    } catch (err) {
      console.error('downloadImage error:', err);
    }
  }

  /**
   * Apply posterization (color banding) to an image.
   * @param {HTMLImageElement} imageElement
   * @param {number} [levels=4] number of color levels per channel
   * Side effects: updates `imageElement.src`.
   */
  function applyPolarization(imageElement, levels = 4) {
    hasChanges = true;
    const dims = getImageDimensions(imageElement);
    if (!dims) return;
    
    levels = Math.max(2, Math.min(256, Math.round(levels)));
    const { width, height } = dims;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageElement, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const colorStep = Math.floor(256 / levels);
    
    // Apply posterization in single pass
    for (let i = 0; i < data.length; i += 4) {
      const r = Math.floor(data[i] / colorStep) * colorStep;
      const g = Math.floor(data[i + 1] / colorStep) * colorStep;
      const b = Math.floor(data[i + 2] / colorStep) * colorStep;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      // data[i + 3] unchanged (alpha)
    }
    
    ctx.putImageData(imageData, 0, 0);
    imageElement.src = canvas.toDataURL();
  }

  /**
   * Apply a paint-like acrylic effect using a box blur + posterization.
   * @param {HTMLImageElement} imageElement
   * @param {number} [brushSize=5]
   * @param {number} [colorReduction=4]
   * Side effects: updates `imageElement.src`.
   */
  function applyAcrylicFilter(imageElement, brushSize = 5, colorReduction = 4) {
    hasChanges = true;
    const dims = getImageDimensions(imageElement);
    if (!dims) return;
    
    brushSize = Math.max(1, Math.min(15, Math.round(brushSize)));
    colorReduction = Math.max(2, Math.min(32, Math.round(colorReduction)));
    
    const { width, height } = dims;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageElement, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const blurred = new Uint8ClampedArray(data);
    
    const colorStep = Math.floor(256 / colorReduction);
    const radius = brushSize;
    
    // Apply optimized box blur with posterization
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        let sumR = 0, sumG = 0, sumB = 0;
        let count = 0;
        
        // Box blur - only process pixels within radius
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            sumR += data[idx];
            sumG += data[idx + 1];
            sumB += data[idx + 2];
            count++;
          }
        }
        
        // Average and posterize
        const avgR = sumR / count;
        const avgG = sumG / count;
        const avgB = sumB / count;
        
        const idx = (y * width + x) * 4;
        blurred[idx] = Math.floor(avgR / colorStep) * colorStep;
        blurred[idx + 1] = Math.floor(avgG / colorStep) * colorStep;
        blurred[idx + 2] = Math.floor(avgB / colorStep) * colorStep;
        blurred[idx + 3] = data[idx + 3];
      }
    }
    
    // Copy blurred data back in one pass.
    data.set(blurred);
    
    ctx.putImageData(imageData, 0, 0);
    imageElement.src = canvas.toDataURL();
  }

  /**
   * Apply a median filter for noise reduction.
   * @param {HTMLImageElement} imageElement
   * @param {number} [radius=2] neighborhood radius
   * Side effects: updates `imageElement.src`.
   */
  function applyMedianFilter(imageElement, radius = 2) {
    hasChanges = true;
    const dims = getImageDimensions(imageElement);
    if (!dims) return;
    
    radius = Math.max(1, Math.min(10, Math.round(radius)));
    const { width, height } = dims;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageElement, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const filtered = new Uint8ClampedArray(data);
    
    // Helper function to find median of an array
    const getMedian = (arr) => {
      arr.sort((a, b) => a - b);
      const mid = Math.floor(arr.length / 2);
      return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
    };
    
    // Apply median filter
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const pixelsR = [];
        const pixelsG = [];
        const pixelsB = [];
        
        // Collect pixels in the radius neighborhood
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            pixelsR.push(data[idx]);
            pixelsG.push(data[idx + 1]);
            pixelsB.push(data[idx + 2]);
          }
        }
        
        // Calculate median for each channel
        const medianR = Math.round(getMedian(pixelsR));
        const medianG = Math.round(getMedian(pixelsG));
        const medianB = Math.round(getMedian(pixelsB));
        
        // Set the filtered pixel
        const idx = (y * width + x) * 4;
        filtered[idx] = medianR;
        filtered[idx + 1] = medianG;
        filtered[idx + 2] = medianB;
        filtered[idx + 3] = data[idx + 3]; // Preserve alpha
      }
    }
    
    // Handle borders by copying nearby pixels
    for (let i = 0; i < width * radius * 4; i++) {
      filtered[i] = data[i];
    }
    for (let i = (height - radius) * width * 4; i < height * width * 4; i++) {
      filtered[i] = data[i];
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < radius; x++) {
        const idx = (y * width + x) * 4;
        filtered[idx] = data[idx];
        filtered[idx + 1] = data[idx + 1];
        filtered[idx + 2] = data[idx + 2];
        filtered[idx + 3] = data[idx + 3];
        
        const rightIdx = (y * width + (width - 1 - x)) * 4;
        filtered[rightIdx] = data[rightIdx];
        filtered[rightIdx + 1] = data[rightIdx + 1];
        filtered[rightIdx + 2] = data[rightIdx + 2];
        filtered[rightIdx + 3] = data[rightIdx + 3];
      }
    }
    
    // Copy filtered data back in one pass.
    data.set(filtered);
    
    ctx.putImageData(imageData, 0, 0);
    imageElement.src = canvas.toDataURL();
  }

  // Call setup once the script loads
  setupSliderListeners();
  updateHistoryControls();
});
