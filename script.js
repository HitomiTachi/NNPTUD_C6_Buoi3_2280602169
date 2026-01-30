// API URL - Replace with your actual API endpoint
const API_URL = 'https://api.escuelajs.co/api/v1/products';

// Global state
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    fetchProducts();
});

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);

    // Items per page
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    itemsPerPageSelect.addEventListener('change', function(e) {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderGrid();
        renderPagination();
    });

    // Sort buttons
    document.getElementById('sortPriceAsc').addEventListener('click', () => sortProducts('price', 'asc'));
    document.getElementById('sortPriceDesc').addEventListener('click', () => sortProducts('price', 'desc'));
    document.getElementById('sortNameAsc').addEventListener('click', () => sortProducts('title', 'asc'));
    document.getElementById('sortNameDesc').addEventListener('click', () => sortProducts('title', 'desc'));
}

// Fetch products from API
async function fetchProducts() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.classList.remove('d-none');

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        allProducts = data;
        filteredProducts = [...allProducts];
        renderGrid();
        renderPagination();
    } catch (error) {
        console.error('Error fetching products:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
    } finally {
        loadingSpinner.classList.add('d-none');
    }
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            product.title.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    renderGrid();
    renderPagination();
}

// Sort products
function sortProducts(field, direction) {
    // Remove active class from all sort buttons
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    const buttonId = `sort${field.charAt(0).toUpperCase() + field.slice(1)}${direction === 'asc' ? 'Asc' : 'Desc'}`;
    document.getElementById(buttonId).classList.add('active');
    
    currentSort = { field, direction };
    
    filteredProducts.sort((a, b) => {
        let aValue, bValue;
        
        if (field === 'price') {
            aValue = a.price;
            bValue = b.price;
        } else if (field === 'title') {
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
        }
        
        if (direction === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
    });
    
    currentPage = 1;
    renderGrid();
    renderPagination();
}

// Render grid
function renderGrid() {
    const productsGrid = document.getElementById('productsGrid');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <h4>Không tìm thấy sản phẩm nào</h4>
                <p>Vui lòng thử lại với từ khóa khác</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = productsToShow.map(product => {
        const imagesHTML = product.images && product.images.length > 0 
            ? product.images.map((img, index) => {
                const isSingleImage = product.images.length === 1;
                return `<img src="${img}" alt="${product.title}" class="product-card-image ${isSingleImage ? 'single-image' : ''}" onerror="this.src='https://via.placeholder.com/300x250'">`;
            }).join('')
            : '<span class="text-muted">Không có hình ảnh</span>';
        
        return `
            <div class="product-card">
                <div class="product-card-image-container">
                    ${imagesHTML}
                </div>
                <div class="product-card-body">
                    <div class="product-card-id">ID: ${product.id}</div>
                    <h5 class="product-card-title">${product.title}</h5>
                    <div class="product-card-price">$${product.price.toFixed(2)}</div>
                    <div class="product-card-description">${product.description || 'Không có mô tả'}</div>
                    <div class="product-card-category">
                        <strong>Danh mục:</strong> ${product.category ? product.category.name : 'N/A'}
                    </div>
                    <div class="product-card-date">
                        <small>Ngày tạo: ${formatDate(product.creationAt)}</small>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render pagination
function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Trước</a>
        </li>
    `;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="1">1</a>
            </li>
        `;
        if (startPage > 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
            </li>
        `;
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Sau</a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
    
    // Add event listeners to pagination links
    pagination.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            if (page && page !== currentPage && page >= 1 && page <= totalPages) {
                currentPage = page;
                renderGrid();
                renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

