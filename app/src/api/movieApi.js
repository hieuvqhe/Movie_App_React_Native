import axios from 'axios';

const BASE_URL = 'https://phimapi.com';

export const getNewMovies = async (page = 1) => {
  try {
    const response = await axios.get(`${BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin phim:', error);
    throw error;
  }
};

export const getCategoryMovies = async (category, page = 1, limit = 10) => {
  try {
    // Xử lý riêng cho phim mới cập nhật
    if (category === 'phim-moi-cap-nhat') {
      return getNewMovies(page);
    }

    // Các category khác sử dụng API v1
    const response = await axios.get(`${BASE_URL}/v1/api/danh-sach/${category}/?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phim theo thể loại:', error);
    throw error;
  }
};

export const fetchMovieDetail = async (slug) => {
  try {
    const response = await axios.get(`${BASE_URL}/phim/${slug}`);
    if (!response.data.status) {
      throw new Error(response.data.msg || 'Failed to fetch movie');
    }
    return response.data;  // Trả về toàn bộ response data
  } catch (error) {
    console.error('Error fetching movie detail:', error);
    throw error;
  }
};

export const searchMovies = async (keyword, page = 1, limit = 24) => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/api/tim-kiem`, {
      params: {
        keyword,
        page,
        limit
      }
    });

    if (response.data?.status === 'success') {
      const items = response.data.data.items.map(item => ({
        ...item,
        poster_url: formatImageUrl(item.poster_url),
        thumb_url: formatImageUrl(item.thumb_url),
        _id: item._id || `${item.slug}-${Date.now()}`
      }));

      return {
        items,
        totalItems: response.data.data.params.pagination.totalItems || items.length,
        currentPage: response.data.data.params.pagination.currentPage || 1,
        totalPages: response.data.data.params.pagination.totalPages || 1
      };
    }
    return { items: [], totalItems: 0, currentPage: 1, totalPages: 1 };
  } catch (error) {
    console.error('Search API Error:', error);
    throw new Error('Không thể tìm kiếm phim. Vui lòng thử lại sau.');
  }
};