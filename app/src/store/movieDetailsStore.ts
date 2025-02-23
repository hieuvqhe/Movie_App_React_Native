import { create } from 'zustand';
import { fetchMovieDetail } from '../api/movieApi';

interface MovieDetail {
  _id: string;
  name: string;
  origin_name: string;
  content: string;
  type: string;
  status: string;
  thumb_url: string;
  poster_url: string;
  time: string;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  year: number;
  actor: string[];
  category: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  country: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface MovieDetailState {
  movieDetail: MovieDetail | null;
  episodes: any[];
  selectedEpisode: any | null;
  loading: boolean;
  error: string | null;
  fetchMovieDetail: (slug: string) => Promise<void>;
  setSelectedEpisode: (episode: any) => void;
  clearMovieDetail: () => void;
}

const useMovieDetailStore = create<MovieDetailState>((set) => ({
  movieDetail: null,
  episodes: [],
  selectedEpisode: null,
  loading: false,
  error: null,

  fetchMovieDetail: async (slug) => {
    try {
      set({ loading: true, error: null });
      const response = await fetchMovieDetail(slug);
      
      if (response.status) {
        set({ 
          movieDetail: response.movie,
          episodes: response.episodes || [],
          selectedEpisode: null,
          loading: false 
        });
      } else {
        throw new Error(response.msg || 'Không thể tải thông tin phim');
      }
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        loading: false,
        movieDetail: null,
        episodes: [],
        selectedEpisode: null
      });
    }
  },

  setSelectedEpisode: (episode) => {
    set({ selectedEpisode: episode });
  },

  clearMovieDetail: () => {
    set({ 
      movieDetail: null, 
      episodes: [], 
      selectedEpisode: null, 
      error: null 
    });
  },
}));

export default useMovieDetailStore;