// Application State
const app = {
    pdfDoc: null,
    pageNum: 1,
    scale: 1.5,
    droppedItems: [],
    selectedItem: null,
    currentBaseName: '',
    
    // DOM Elements
    canvas: document.getElementById('pdf-canvas'),
    ctx: null,
    pdfContainer: document.getElementById('pdf-container'),
    overlayContainer: document.getElementById('overlay-container'),
    emptyState: document.getElementById('empty-state'),
    canvasArea: document.querySelector('.canvas-area'),
    
    propPanel: document.getElementById('property-panel'),
    noSelection: document.getElementById('no-selection'),
    propName: document.getElementById('prop-name'),
    propRequired: document.getElementById('prop-required'),
    
    listView: document.getElementById('list-view'),
    editorView: document.getElementById('editor-view'),
    btnBack: document.getElementById('btn-back'),
    btnSave: document.getElementById('btn-save'),
    uploadWrapper: document.getElementById('upload-wrapper'),
    toast: document.getElementById('toast-message'),
    templateList: document.getElementById('template-list'),
    noTemplates: document.getElementById('no-templates'),

    init() {
        this.ctx = this.canvas.getContext('2d');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        
        this.bindEvents();
        this.loadTemplates();
    },

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(tab.dataset.target).classList.add('active');
                
                if(tab.dataset.target === 'saved-templates') {
                    this.loadTemplates();
                }
            });
        });

        // Navigation
        this.btnBack.addEventListener('click', () => this.showListView());
        this.btnSave.addEventListener('click', () => this.saveTemplate());

        // File Upload
        document.getElementById('pdf-upload').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type === 'application/pdf') {
                const fileReader = new FileReader();
                fileReader.onload = () => {
                    const typedarray = new Uint8Array(fileReader.result);
                    this.renderPDFData(typedarray);
                };
                fileReader.readAsArrayBuffer(file);
            }
        });

        // Drag and Drop (from Sidebar)
        document.querySelectorAll('.draggable').forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', draggable.dataset.type);
            });
        });

        this.pdfContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        this.pdfContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('text/plain');
            if (!type) return;

            const rect = this.pdfContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.createComponent(type, x, y);
        });

        // Properties
        this.propName.addEventListener('input', (e) => {
            if (this.selectedItem) {
                this.selectedItem.name = e.target.value;
                this.selectedItem.el.querySelector('.comp-label').textContent = this.selectedItem.name;
            }
        });

        this.propRequired.addEventListener('change', (e) => {
            if (this.selectedItem) {
                this.selectedItem.required = e.target.checked;
                if (this.selectedItem.required) {
                    this.selectedItem.el.classList.add('is-required');
                } else {
                    this.selectedItem.el.classList.remove('is-required');
                }
            }
        });

        document.getElementById('btn-delete').addEventListener('click', () => {
            if (this.selectedItem) {
                this.selectedItem.el.remove();
                this.droppedItems = this.droppedItems.filter(i => i.id !== this.selectedItem.id);
                this.selectItem(null);
            }
        });

        // Canvas deselect
        this.canvasArea.addEventListener('mousedown', (e) => {
            if (e.target === this.canvasArea || e.target === this.overlayContainer || e.target === this.canvas) {
                this.selectItem(null);
            }
        });
        
        // Item Dragging bound internally
        this.onDragItem = this.onDragItem.bind(this);
        this.stopDragItem = this.stopDragItem.bind(this);
    },

    showListView() {
        this.editorView.classList.add('hidden');
        this.btnBack.classList.add('hidden');
        this.btnSave.classList.add('hidden');
        this.uploadWrapper.classList.add('hidden');
        this.listView.classList.remove('hidden');
        this.loadTemplates();
    },

    showEditorView(showUpload = false) {
        this.listView.classList.add('hidden');
        this.editorView.classList.remove('hidden');
        this.btnBack.classList.remove('hidden');
        
        if (showUpload) {
            this.uploadWrapper.classList.remove('hidden');
            this.btnSave.classList.add('hidden'); // hidden until pdf loaded
        } else {
            this.uploadWrapper.classList.add('hidden');
            this.btnSave.classList.remove('hidden');
        }
        
        // Reset state
        this.pdfContainer.classList.remove('active');
        this.emptyState.classList.remove('hidden');
        this.emptyState.textContent = showUpload ? '请先上传一份 PDF 合同模板以开始配置。' : '正在加载合同底稿...';
        this.overlayContainer.innerHTML = '';
        this.droppedItems = [];
        this.selectItem(null);
    },

    configureBase(pdfUrl, baseName) {
        this.currentBaseName = baseName;
        this.showEditorView(false);
        
        // Fetch local PDF
        fetch(pdfUrl)
            .then(res => res.arrayBuffer())
            .then(buffer => {
                const typedarray = new Uint8Array(buffer);
                this.renderPDFData(typedarray);
            })
            .catch(err => {
                this.emptyState.textContent = '加载失败: ' + err.message;
            });
    },

    configureEmpty() {
        this.currentBaseName = '自定义上传合同';
        this.showEditorView(true);
    },

    renderPDFData(typedarray) {
        pdfjsLib.getDocument(typedarray).promise.then(pdf => {
            this.pdfDoc = pdf;
            this.emptyState.classList.add('hidden');
            this.pdfContainer.classList.add('active');
            this.btnSave.classList.remove('hidden');
            this.renderPage(1);
        });
    },

    renderPage(num) {
        this.pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: this.scale });
            this.canvas.height = viewport.height;
            this.canvas.width = viewport.width;

            this.pdfContainer.style.width = viewport.width + 'px';
            this.pdfContainer.style.height = viewport.height + 'px';

            page.render({
                canvasContext: this.ctx,
                viewport: viewport
            });
        });
    },

    createComponent(type, x, y) {
        const id = 'comp_' + Date.now();
        let defaultName = '未命名组件';
        let icon = '';
        
        if (type === 'text') { defaultName = '单行文本'; icon = '📝'; }
        else if (type === 'signature') { defaultName = '签署区'; icon = '✒️'; }
        else if (type === 'date') { defaultName = '签署日期'; icon = '📅'; }

        const itemData = {
            id: id, type: type, name: defaultName, required: true, x: x, y: y, el: null
        };

        const el = document.createElement('div');
        el.className = 'dropped-item is-required';
        el.innerHTML = `${icon} <span class="comp-label">${defaultName}</span><span class="required-asterisk">*</span>`;
        
        const finalX = Math.max(0, x - 50);
        const finalY = Math.max(0, y - 15);
        itemData.x = finalX; itemData.y = finalY;

        el.style.left = finalX + 'px';
        el.style.top = finalY + 'px';

        el.addEventListener('mousedown', (e) => this.startDragItem(e, itemData));
        
        this.overlayContainer.appendChild(el);
        itemData.el = el;
        this.droppedItems.push(itemData);
        this.selectItem(itemData);
    },

    // Dragging Logic
    isDraggingItem: false,
    currentDraggedItem: null,
    startOffsetX: 0,
    startOffsetY: 0,

    startDragItem(e, itemData) {
        e.stopPropagation();
        this.selectItem(itemData);
        this.isDraggingItem = true;
        this.currentDraggedItem = itemData;

        const rect = itemData.el.getBoundingClientRect();
        this.startOffsetX = e.clientX - rect.left;
        this.startOffsetY = e.clientY - rect.top;

        document.addEventListener('mousemove', this.onDragItem);
        document.addEventListener('mouseup', this.stopDragItem);
    },

    onDragItem(e) {
        if (!this.isDraggingItem || !this.currentDraggedItem) return;

        const rect = this.pdfContainer.getBoundingClientRect();
        let x = e.clientX - rect.left - this.startOffsetX;
        let y = e.clientY - rect.top - this.startOffsetY;

        x = Math.max(0, Math.min(x, this.pdfContainer.clientWidth - this.currentDraggedItem.el.offsetWidth));
        y = Math.max(0, Math.min(y, this.pdfContainer.clientHeight - this.currentDraggedItem.el.offsetHeight));

        this.currentDraggedItem.x = x;
        this.currentDraggedItem.y = y;
        this.currentDraggedItem.el.style.left = x + 'px';
        this.currentDraggedItem.el.style.top = y + 'px';
    },

    stopDragItem() {
        this.isDraggingItem = false;
        this.currentDraggedItem = null;
        document.removeEventListener('mousemove', this.onDragItem);
        document.removeEventListener('mouseup', this.stopDragItem);
    },

    selectItem(itemData) {
        this.droppedItems.forEach(i => i.el.classList.remove('selected'));
        this.selectedItem = itemData;

        if (itemData) {
            itemData.el.classList.add('selected');
            this.propPanel.classList.remove('hidden');
            this.noSelection.classList.add('hidden');
            this.propName.value = itemData.name;
            this.propRequired.checked = itemData.required;
        } else {
            this.propPanel.classList.add('hidden');
            this.noSelection.classList.remove('hidden');
        }
    },

    saveTemplate() {
        if (this.droppedItems.length === 0) {
            alert('画布上没有任何组件，请先拖拽组件配置模板。');
            return;
        }

        const templateData = {
            id: "tpl_" + Date.now(),
            baseName: this.currentBaseName,
            createdAt: new Date().toLocaleString(),
            fieldsCount: this.droppedItems.length,
            fields: this.droppedItems.map(item => ({
                id: item.id,
                type: item.type,
                name: item.name,
                required: item.required,
                position: { x: item.x, y: item.y }
            }))
        };

        // Save to localStorage
        let templates = JSON.parse(localStorage.getItem('savedTemplates') || '[]');
        templates.push(templateData);
        localStorage.setItem('savedTemplates', JSON.stringify(templates));

        this.showToast('模板配置已保存成功！');
        
        // Go back to list
        setTimeout(() => {
            this.showListView();
            // switch to saved templates tab automatically
            document.querySelector('.tab[data-target="saved-templates"]').click();
        }, 1500);
    },

    loadTemplates() {
        const templates = JSON.parse(localStorage.getItem('savedTemplates') || '[]');
        this.templateList.innerHTML = '';
        
        if (templates.length === 0) {
            this.noTemplates.style.display = 'block';
            this.templateList.parentElement.style.display = 'none';
            return;
        }

        this.noTemplates.style.display = 'none';
        this.templateList.parentElement.style.display = 'table';

        templates.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${t.id}</td>
                <td>${t.baseName}</td>
                <td>${t.fieldsCount} 个</td>
                <td>${t.createdAt}</td>
                <td><button class="btn-secondary btn-sm" onclick="app.deleteTemplate('${t.id}')">删除</button></td>
            `;
            this.templateList.appendChild(tr);
        });
    },

    deleteTemplate(id) {
        if(confirm('确定要删除这个模板吗？')) {
            let templates = JSON.parse(localStorage.getItem('savedTemplates') || '[]');
            templates = templates.filter(t => t.id !== id);
            localStorage.setItem('savedTemplates', JSON.stringify(templates));
            this.loadTemplates();
        }
    },

    showToast(msg) {
        this.toast.textContent = msg;
        this.toast.classList.remove('hidden');
        setTimeout(() => this.toast.classList.add('hidden'), 3000);
    }
};

// Start app
app.init();
