let selectedShape = null;

function startNewProject() {
  document.getElementById('projectChoice').style.display = 'none';
  document.getElementById('mainApp').style.display = 'flex';
  selectedShape = null;

  document.getElementById('drawingArea').innerHTML = '<p>Adicione uma forma para começar o projeto.</p>';
  document.getElementById('projectName').value = '';

  showSavedProjects();
}

function openExistingProject() {
  document.getElementById('projectChoice').style.display = 'none';
  document.getElementById('mainApp').style.display = 'flex';
  showSavedProjects();
}

function showSavedProjects() {
  const listDiv = document.getElementById('projectList');
  listDiv.innerHTML = "<h3>Projetos Salvos:</h3>";

  const keys = Object.keys(localStorage).filter(key => key.startsWith("projeto_"));

  if (keys.length === 0) {
    listDiv.innerHTML += "<p>Nenhum projeto salvo ainda.</p>";
    return;
  }

  keys.forEach(key => {
    const name = key.replace("projeto_", "");
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.style.margin = "5px";
    btn.onclick = () => loadProject(name);
    listDiv.appendChild(btn);
  });
}

function loadProject(projectName) {
  const saved = localStorage.getItem(`projeto_${projectName}`);
  if (!saved) return alert("Projeto não encontrado.");

  startNewProject();

  document.getElementById('drawingArea').innerHTML = '';
  document.getElementById('projectName').value = projectName;

  const shapes = JSON.parse(saved);
  shapes.forEach(shapeData => {
    const shape = document.createElement('div');
    shape.classList.add('shape', shapeData.type);
    shape.style.width = shapeData.width;
    shape.style.height = shapeData.height;
    shape.style.left = shapeData.left;
    shape.style.top = shapeData.top;

    shape.addEventListener('click', () => {
      selectedShape = shape;
      shape.style.outline = '3px solid #1abc9c';
      removeOutlineFromOthers(shape);
    });

    enableDrag(shape);
    document.getElementById('drawingArea').appendChild(shape);
  });

  showSavedProjects();
}

function saveProject() {
  const projectNameInput = document.getElementById('projectName');
  const projectName = projectNameInput.value.trim();

  if (!projectName) {
    alert("Digite um nome para o projeto.");
    projectNameInput.focus();
    return;
  }

  const shapes = [];
  document.querySelectorAll('.shape').forEach(shape => {
    shapes.push({
      type: [...shape.classList].find(c => c !== 'shape'),
      width: shape.style.width,
      height: shape.style.height,
      left: shape.style.left,
      top: shape.style.top
    });
  });

  localStorage.setItem(`projeto_${projectName}`, JSON.stringify(shapes));
  alert(`Projeto "${projectName}" salvo com sucesso!`);

  showSavedProjects();
}

function addShape(type) {
  const shape = document.createElement('div');
  shape.classList.add('shape', type);
  shape.style.left = '10px';
  shape.style.top = '10px';

  shape.addEventListener('click', () => {
    selectedShape = shape;
    shape.style.outline = '3px solid #1abc9c';
    removeOutlineFromOthers(shape);
  });

  enableDrag(shape);
  document.getElementById('drawingArea').appendChild(shape);

  const drawingArea = document.getElementById('drawingArea');
  if (drawingArea.querySelector('p')) {
    drawingArea.querySelector('p').remove();
  }
}

function resizeSelected() {
  if (!selectedShape) return alert('Selecione uma forma primeiro.');
  const width = document.getElementById('inputWidth').value;
  const height = document.getElementById('inputHeight').value;
  if (width) selectedShape.style.width = `${width}px`;
  if (height) selectedShape.style.height = `${height}px`;
}

function removeOutlineFromOthers(current) {
  document.querySelectorAll('.shape').forEach((shape) => {
    if (shape !== current) {
      shape.style.outline = 'none';
    }
  });
}

function enableDrag(shape) {
  const drawingArea = document.getElementById('drawingArea');
  let isDragging = false;
  let shiftX, shiftY;

  // Reposiciona o shape dentro da área permitida
  function moveShape(x, y) {
    const areaRect = drawingArea.getBoundingClientRect();
    const shapeRect = shape.getBoundingClientRect();

    let newLeft = x - shiftX - areaRect.left;
    let newTop = y - shiftY - areaRect.top;

    // Limita dentro da área
    newLeft = Math.max(0, Math.min(newLeft, drawingArea.clientWidth - shape.offsetWidth));
    newTop = Math.max(0, Math.min(newTop, drawingArea.clientHeight - shape.offsetHeight));

    shape.style.left = `${newLeft}px`;
    shape.style.top = `${newTop}px`;
  }

  // Mouse
  shape.addEventListener('mousedown', function (e) {
    e.preventDefault();
    selectedShape = shape;
    removeOutlineFromOthers(shape);
    shape.style.outline = '3px solid #1abc9c';

    const shapeRect = shape.getBoundingClientRect();
    shiftX = e.clientX - shapeRect.left;
    shiftY = e.clientY - shapeRect.top;

    isDragging = true;
  });

  document.addEventListener('mousemove', function (e) {
    if (isDragging) {
      moveShape(e.clientX, e.clientY);
    }
  });

  document.addEventListener('mouseup', function () {
    isDragging = false;
  });

  // Touch
  shape.addEventListener('touchstart', function (e) {
    e.preventDefault();
    selectedShape = shape;
    removeOutlineFromOthers(shape);
    shape.style.outline = '3px solid #1abc9c';

    const touch = e.touches[0];
    const shapeRect = shape.getBoundingClientRect();
    shiftX = touch.clientX - shapeRect.left;
    shiftY = touch.clientY - shapeRect.top;

    isDragging = true;
  });

  document.addEventListener('touchmove', function (e) {
    if (isDragging && e.touches.length > 0) {
      const touch = e.touches[0];
      moveShape(touch.clientX, touch.clientY);
    }
  });

  document.addEventListener('touchend', function () {
    isDragging = false;
  });

  shape.ondragstart = () => false;
}
