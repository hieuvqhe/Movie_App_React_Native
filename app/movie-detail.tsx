import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import useMovieDetailStore from './src/store/movieDetailsStore';

const CustomVideoPlayer = ({ url, thumbnail }: { url: string; thumbnail: string }) => {
  const player = useVideoPlayer(url, player => {
    player.play();
  });

  return (
    <View style={styles.playerContainer}>
      <VideoView 
        style={styles.videoPlayer}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
      />
    </View>
  );
};

// Thêm component hiển thị thông tin chi tiết
const MovieInfo = ({ movieDetail }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const contentPreview = movieDetail.content.slice(0, 150); // Giới hạn 150 ký tự

  return (
    <View style={styles.detailsContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.description}>
          {showFullContent ? movieDetail.content : `${contentPreview}...`}
        </Text>
        <TouchableOpacity 
          onPress={() => setShowFullContent(!showFullContent)}
          style={styles.readMoreButton}
        >
          <Text style={styles.readMoreText}>
            {showFullContent ? 'Thu gọn' : 'Xem thêm'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.metaInfo}>
        <Text style={styles.metaTitle}>Thông tin phim</Text>
        <Text style={styles.metaText}>Trạng thái: {movieDetail.status === 'completed' ? 'Hoàn thành' : 'Đang chiếu'}</Text>
        <Text style={styles.metaText}>Thời lượng: {movieDetail.time}</Text>
        <Text style={styles.metaText}>Chất lượng: {movieDetail.quality}</Text>
        <Text style={styles.metaText}>Ngôn ngữ: {movieDetail.lang}</Text>
        <Text style={styles.metaText}>Năm phát hành: {movieDetail.year}</Text>
        
        <Text style={styles.metaTitle}>Diễn viên</Text>
        <Text style={styles.metaText}>{movieDetail.actor.join(', ')}</Text>
        
        <Text style={styles.metaTitle}>Đạo diễn</Text>
        <Text style={styles.metaText}>{movieDetail.director.join(', ')}</Text>
        
        <Text style={styles.metaTitle}>Thể loại</Text>
        <View style={styles.tagContainer}>
          {movieDetail.category.map((cat) => (
            <Text key={cat.id} style={styles.tag}>{cat.name}</Text>
          ))}
        </View>
        
        <Text style={styles.metaTitle}>Quốc gia</Text>
        <View style={styles.tagContainer}>
          {movieDetail.country.map((country) => (
            <Text key={country.id} style={styles.tag}>{country.name}</Text>
          ))}
        </View>
      </View>
    </View>
  );
};

export default function MovieDetail() {
    const { slug } = useLocalSearchParams();
    const { 
      movieDetail, 
      episodes, 
      selectedEpisode,
      loading, 
      error, 
      fetchMovieDetail,
      setSelectedEpisode 
    } = useMovieDetailStore();
    const [showPlayer, setShowPlayer] = useState(false);
  
    useEffect(() => {
      if (slug) {
        fetchMovieDetail(slug.toString());
        setShowPlayer(false);
      }
    }, [slug]);
  
    const handleEpisodeSelect = (episode: any) => {
      setSelectedEpisode(episode);
      setShowPlayer(true);
    };
  
    const handleWatchMovie = () => {
      if (episodes && episodes[0]?.server_data?.[0]) {
        setSelectedEpisode(episodes[0].server_data[0]);
        setShowPlayer(true);
      }
    };

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e50914" />
        </View>
      );
    }
  
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Có lỗi xảy ra: {error}</Text>
        </View>
      );
    }
  
    if (!movieDetail) return null;

    return (
      <View style={styles.container}>
        <FlatList
          ListHeaderComponent={() => (
            <>
              <View style={styles.mediaContainer}>
                {showPlayer && selectedEpisode ? (
                  <CustomVideoPlayer 
                    url={selectedEpisode.link_m3u8} 
                    thumbnail={movieDetail.thumb_url?.startsWith('http') 
                      ? movieDetail.thumb_url 
                      : `https://phimimg.com/${movieDetail.thumb_url}`
                    }
                  />
                ) : (
                  <Image
                    source={{ 
                      uri: movieDetail.thumb_url?.startsWith('http') 
                        ? movieDetail.thumb_url 
                        : `https://phimimg.com/${movieDetail.thumb_url}`
                    }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                )}
              </View>
              
              <View style={styles.infoContainer}>
                <Text style={styles.title}>{movieDetail.name}</Text>
                <Text style={styles.originalTitle}>{movieDetail.origin_name}</Text>
                
                {/* Thêm thông tin chi tiết trước danh sách tập */}
                <MovieInfo movieDetail={movieDetail} />

                {/* Render watch button cho phim lẻ */}
                {movieDetail.type === 'single' && !showPlayer && (
                  <TouchableOpacity 
                    style={styles.watchButton}
                    onPress={handleWatchMovie}
                  >
                    <Text style={styles.watchButtonText}>Xem Phim</Text>
                  </TouchableOpacity>
                )}

                {/* Render episodes cho phim bộ */}
                {['series', 'hoathinh', 'tvshows'].includes(movieDetail.type) && (
                  <View style={styles.episodeContainer}>
                    {episodes?.map((server, serverIndex) => (
                      <View key={serverIndex} style={styles.serverContainer}>
                        <Text style={styles.serverName}>{server.server_name}</Text>
                        <View style={styles.episodeGrid}>
                          {server.server_data?.map((episode, episodeIndex) => {
                            const episodeNumber = episode.name.replace('Tập ', '');
                            return (
                              <TouchableOpacity
                                key={`${serverIndex}-${episodeIndex}`}
                                style={[
                                  styles.episodeButton,
                                  selectedEpisode?.slug === episode.slug && styles.episodeButtonActive
                                ]}
                                onPress={() => handleEpisodeSelect(episode)}
                              >
                                <Text 
                                  style={[
                                    styles.episodeButtonText,
                                    selectedEpisode?.slug === episode.slug && styles.episodeButtonTextActive
                                  ]}
                                >
                                  {episodeNumber}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}
          data={[]}
          renderItem={() => null}
        />
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#e50914',
    fontSize: 16,
  },
  mediaContainer: {
    width: '100%',
    backgroundColor: '#000',
  },
  playerContainer: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#000',
  },
  videoPlayer: {
    flex: 1,
  },
  thumbnail: {
    width: '100%',
    height: 220,
  },
  infoContainer: {
    padding: 15,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  originalTitle: {
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  watchButton: {
    backgroundColor: '#e50914',
    padding: 12,
    borderRadius: 5,
    marginVertical: 15,
    alignItems: 'center',
  },
  watchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  episodeContainer: {
    marginVertical: 15,
  },
  serverContainer: {
    marginBottom: 20,
  },
  serverName: {
    color: '#e50914',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  episodeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  episodeButton: {
    width: '18%',
    aspectRatio: 1,
    margin: '1%',
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeButtonActive: {
    backgroundColor: '#e50914',
  },
  episodeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  episodeButtonTextActive: {
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 15,
  },
  contentContainer: {
    marginBottom: 15,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: 8,
  },
  readMoreText: {
    color: '#e50914',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metaInfo: {
    marginTop: 10,
  },
  metaTitle: {
    color: '#e50914',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  metaText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  tag: {
    color: '#fff',
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 12,
  },
});