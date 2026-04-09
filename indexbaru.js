/* ========================================
   PDF VIEWER JAVASCRIPT - RATIB AL-HADDAD
   FITUR LENGKAP: Navigasi + Zoom
   ======================================== */

// Variabel global
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let totalPages = 0;

// Inisialisasi PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/**
 * 🚀 LOAD PDF UTAMA
 */
async function loadPDF() {
    try {
        const statusEl = document.getElementById('pdfStatus');
        statusEl.innerHTML = '⏳ Memuat Ratib al-Haddad...';
        statusEl.className = 'loading';
        
        enableControls();
        updateNavButtons();

        // ✅ PATH FILE PDF - UBAH DI SINI
        const pdfPath = 'pdf/Ratib-al-Haddad.pdf';
        
        const loadingTask = pdfjsLib.getDocument(pdfPath);
        pdfDoc = await loadingTask.promise;
        totalPages = pdfDoc.numPages;
        pageNum = 1;
        
        statusEl.style.display = 'none';
        renderPage(pageNum);
        
    } catch (error) {
        console.error('❌ Error:', error);
        document.getElementById('pdfStatus').innerHTML = 
            '❌ File PDF tidak ditemukan!<br>Pastikan "Ratib-al-Haddad.pdf" ada di folder <code>pdf/</code>';
        document.getElementById('pdfStatus').className = 'error';
        disableControls();
    }
}

/**
 * 📄 RENDER HALAMAN KE CANVAS
 */
async function renderPage(num) {
    pageRendering = true;
    
    try {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: scale });
        
        const canvas = document.getElementById('pdfViewer');
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        pageRendering = false;
        
        if (pageNumPending !== null) {
            renderPage(pageNumPending);
            pageNumPending = null;
        }
        
        updatePageInfo();
        updateNavButtons();
        
    } catch (error) {
        console.error('❌ Render error:', error);
    }
}

/**
 * ➡️ BERIKUTNYA (Next Page)
 */
function nextPage() {
    if (pageNum >= totalPages || pageRendering) return;
    
    pageNum++;
    if (pageRendering) {
        pageNumPending = pageNum;
    } else {
        renderPage(pageNum);
    }
}

/**
 * ⬅️ SEBELUMNYA (Previous Page)
 */
function previousPage() {
    if (pageNum <= 1 || pageRendering) return;
    
    pageNum--;
    if (pageRendering) {
        pageNumPending = pageNum;
    } else {
        renderPage(pageNum);
    }
}

/**
 * 🔍 ZOOM IN
 */
function zoomIn() {
    if (scale < 3.0) {
        scale += 0.2;
        renderPage(pageNum);
    }
}

/**
 * 🔍 ZOOM OUT
 */
function zoomOut() {
    if (scale > 0.5) {
        scale -= 0.2;
        renderPage(pageNum);
    }
}

/**
 * 🔄 RESET ZOOM
 */
function resetZoom() {
    scale = 1.5;
    renderPage(pageNum);
}

/**
 * 📊 UPDATE INFO HALAMAN
 */
function updatePageInfo() {
    document.getElementById('pageInfo').style.display = 'block';
    document.getElementById('pageInfo').innerHTML = 
        `📄 Halaman <strong>${pageNum}</strong> dari <strong>${totalPages}</strong>`;
}

/**
 * 🔘 UPDATE STATUS TOMBOL NAVIGASI
 */
function updateNavButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = (pageNum <= 1);
    nextBtn.disabled = (pageNum >= totalPages);
}

/**
 * ✅ ENABLE SEMUA KONTROL
 */
function enableControls() {
    const buttons = ['zoomInBtn', 'zoomOutBtn', 'resetBtn', 'prevBtn', 'nextBtn'];
    buttons.forEach(id => {
        document.getElementById(id).disabled = false;
    });
}

/**
 * ❌ DISABLE KONTROL (Error state)
 */
function disableControls() {
    const buttons = ['zoomInBtn', 'zoomOutBtn', 'resetBtn', 'prevBtn', 'nextBtn'];
    buttons.forEach(id => {
        document.getElementById(id).disabled = true;
    });
}

/**
 * ⌨️ KEYBOARD SHORTCUTS LENGKAP
 */
document.addEventListener('keydown', function(e) {
    if (!pdfDoc || e.ctrlKey || e.metaKey) return;
    
    switch(e.key) {
        case 'ArrowRight':
        case 'PageDown':
            e.preventDefault();
            nextPage();
            break;
        case 'ArrowLeft':
        case 'PageUp':
            e.preventDefault();
            previousPage();
            break;
        case '+':
        case '=':
            e.preventDefault();
            zoomIn();
            break;
        case '-':
            e.preventDefault();
            zoomOut();
            break;
        case '0':
            e.preventDefault();
            resetZoom();
            break;
    }
});

// 🔔 NOTIFICATION: File siap digunakan
console.log('✅ PDF Viewer siap! Letakkan file di folder "pdf/"');
