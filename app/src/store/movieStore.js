import { create } from 'zustand';
import { getNewMovies, getCategoryMovies } from '../api/movieApi';

const useMovieStore = create((set, get) => ({
  // States
  newMovies: [],
  singleMovies: [],
  seriesMovies: [],
  animeMovies: [],
  tvShowMovies: [],
  vietsubMovies: [], // New state
  longTiengMovies: [], // New state
  categoryMovies: [],
  currentPage: 1,
  loading: false,
  error: null,
  hasMore: true,

  // Actions
  fetchNewMovies: async () => {
    try {
      const response = await getNewMovies(1);
      set({ newMovies: response.items.slice(0, 10) });
    } catch (error) {
      set({ error: error.message });
    }
  },

  fetchCategoryMovies: async (category) => {
    try {
      const response = await getCategoryMovies(category, 1, 10);
      switch (category) {
        case 'phim-le':
          set({ singleMovies: response.data.items });
          break;
        case 'phim-bo':
          set({ seriesMovies: response.data.items });
          break;
        case 'hoat-hinh':
          set({ animeMovies: response.data.items });
          break;
        case 'tv-shows':
          set({ tvShowMovies: response.data.items });
          break;
        case 'phim-vietsub':
          set({ vietsubMovies: response.data.items });
          break;
        case 'phim-long-tieng':
          set({ longTiengMovies: response.data.items });
          break;
      }
    } catch (error) {
      set({ error: error.message });
    }
  },

  fetchAllCategoryMovies: async (category, page = 1) => {
    try {
      set({ loading: true });
      const response = await getCategoryMovies(category, page);
      
      // Xử lý response cho phim mới cập nhật
      if (category === 'phim-moi-cap-nhat') {
        const items = response.items || [];
        
        if (page === 1) {
          set({ 
            categoryMovies: items,
            currentPage: 1,
            hasMore: items.length >= 10
          });
        } else {
          set(state => ({ 
            categoryMovies: [...state.categoryMovies, ...items],
            hasMore: items.length >= 10
          }));
        }
      } else {
        // Xử lý response cho các category khác (bao gồm cả tv-shows)
        const items = response.data.items;
        const totalPages = response.data.params.pagination.totalPages;
        
        if (page === 1) {
          set({ 
            categoryMovies: items,
            currentPage: 1,
            hasMore: page < totalPages
          });
        } else {
          set(state => ({ 
            categoryMovies: [...state.categoryMovies, ...items],
            hasMore: page < totalPages
          }));
        }
      }
      
      set({ currentPage: page, loading: false });
    } catch (error) {
      console.error('Error fetching category movies:', error);
      set({ loading: false, error: error.message });
    }
  },

  loadMoreCategoryMovies: async (category) => {
    const state = get();
    if (!state.loading && state.hasMore) {
      const nextPage = state.currentPage + 1;
      await state.fetchAllCategoryMovies(category, nextPage);
    }
  },
}));

export default useMovieStore;