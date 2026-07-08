const fs = require('fs');
const path = require('path');

// Remove an uploaded file from storage when a record is updated or deleted.
const deleteFile = (filePath) => {
  if (!filePath) return;

  const absolutePath = path.join(__dirname, '..', filePath.replace(/^\//, ''));

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

// Generate a six-digit OTP for password reset verification.
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Build pagination values for listing pages such as categories and products.
const paginate = (page, limit, total) => {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const perPage = Math.max(1, parseInt(limit, 10) || 10);
  const totalPages = Math.ceil(total / perPage) || 1;
  const skip = (currentPage - 1) * perPage;

  return { currentPage, perPage, totalPages, skip };
};

// Create paginated links for the admin list views.
const buildPagination = (baseUrl, currentPage, totalPages, query = {}) => {
  const pages = [];
  const params = new URLSearchParams(query);

  for (let i = 1; i <= totalPages; i++) {
    params.set('page', i);
    pages.push({
      number: i,
      url: `${baseUrl}?${params.toString()}`,
      active: i === currentPage
    });
  }

  params.set('page', currentPage - 1);
  const prevUrl = currentPage > 1 ? `${baseUrl}?${params.toString()}` : null;

  params.set('page', currentPage + 1);
  const nextUrl = currentPage < totalPages ? `${baseUrl}?${params.toString()}` : null;

  return { pages, prevUrl, nextUrl, currentPage, totalPages };
};

module.exports = { deleteFile, generateOTP, paginate, buildPagination };
