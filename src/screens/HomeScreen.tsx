import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import {Carousel, ItemInfo} from '@amazon-devices/kepler-ui-components';
import type {NativeStackNavigationProp} from '@amazon-devices/react-native-screens/native-stack';
import type {RootStackParamList} from '../App';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface MovieItem {
  id: string;
  title: string;
  description: string;
  category: string;
  trending: boolean;
  images: {
    poster_16x9: string;
    thumbnail_450x253: string;
  };
  sources: Array<{
    type: string;
    url: string;
  }>;
}

interface CatalogData {
  items: MovieItem[];
}

interface ThumbnailItemProps {
  item: MovieItem;
  onPress: () => void;
}

const SHADOW_LAYERS = 12;

const ThumbnailItem = ({item, onPress}: ThumbnailItemProps) => {
  const [focused, setFocused] = useState(false);

  const shadowLayers = Array(SHADOW_LAYERS)
    .fill(null)
    .map((_, i) => ({
      id: `shadow-${i}`,
      offset: i * 2,
      radius: 6 + i * 3,
      opacity: 0.12 + i * 0.025,
    }));

  return (
    <Pressable
      style={[styles.thumbnail, focused && styles.thumbnailFocused]}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={onPress}>
      {shadowLayers.map((layer) => (
        <View
          key={layer.id}
          style={[
            styles.shadowBox,
            {
              top: layer.offset,
              left: layer.offset,
              shadowRadius: layer.radius,
              shadowOpacity: layer.opacity,
            },
          ]}>
          <View style={styles.innerShadow} />
        </View>
      ))}

      {/* Main thumbnail image */}
      <Image
        source={{uri: item.images.thumbnail_450x253}}
        style={styles.thumbnailImage}
        resizeMode="cover"
      />

      <View style={styles.overlay1} />
      <View style={styles.overlay2} />
      <View style={styles.overlay3} />
    </Pressable>
  );
};

interface ContentRowProps {
  title: string;
  items: MovieItem[];
  onItemPress: (item: MovieItem) => void;
}

const ContentRow = ({title, items, onItemPress}: ContentRowProps) => {
  const renderItem = ({item}: {item: MovieItem}) => {
    const clonedItem = JSON.parse(JSON.stringify(item));
    return (
      <ThumbnailItem item={clonedItem} onPress={() => onItemPress(item)} />
    );
  };

  const itemInfo: ItemInfo[] = [
    {
      view: ThumbnailItem,
      dimension: {
        width: 415,
        height: 235,
      },
    },
  ];

  const rowStyle = {marginBottom: 40};
  const titleStyle = {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold' as const,
    marginBottom: 20,
    paddingLeft: 60,
  };

  return (
    <View style={rowStyle}>
      <Text style={titleStyle}>{title}</Text>
      <Carousel
        data={items}
        orientation="horizontal"
        itemDimensions={itemInfo}
        renderItem={renderItem}
        getItemForIndex={() => ThumbnailItem}
        keyProvider={(item, index) => `${index}-${item.id}`}
        focusIndicatorType="fixed"
      />
    </View>
  );
};
interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen = ({navigation}: HomeScreenProps) => {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/efahsl/scrap-tv-feed/refs/heads/main/catalog-fullUrls-720p.json',
      );
      const data: CatalogData = await response.json();
      setMovies(data.items);
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: MovieItem) => {
    navigation.navigate('Detail', {
      bannerImage: item.images.poster_16x9,
      title: item.title,
      description: item.description,
      videoUrl: item.sources[0]?.url || '',
    });
  };


  // Group movies by category
  const groupMoviesByCategory = () => {
    const categoryMap: {[key: string]: MovieItem[]} = {};

    movies.forEach((movie) => {
      if (!categoryMap[movie.category]) {
        categoryMap[movie.category] = [];
      }
      categoryMap[movie.category].push(movie);
    });

    return categoryMap;
  };

  // Get trending movies
  const getTrendingMovies = () => {
    return movies.filter((movie) => movie.trending === true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  const trendingMovies = getTrendingMovies();
  const moviesByCategory = groupMoviesByCategory();
  const categories = Object.keys(moviesByCategory);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Trending Now Row */}
      {trendingMovies.length > 0 && (
        <ContentRow
          title="Trending Now"
          items={trendingMovies}
          onItemPress={handleItemPress}
        />
      )}

      {/* Category Rows */}
      {categories.map((category) => (
        <ContentRow
          key={category}
          title={category}
          items={moviesByCategory[category]}
          onItemPress={handleItemPress}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  rowContainer: {
    marginBottom: 40,
  },
  rowTitle: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 20,
    paddingLeft: 60,
  },
  thumbnail: {
    width: 415,
    height: 235,
    margin: 15,
  },
  thumbnailFocused: {
    borderWidth: 4,
    borderColor: '#FFFFFF',
    transform: [{scale: 1.05}],
  },
  thumbnailImage: {
    width: 400,
    height: 225,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  shadowBox: {
    position: 'absolute',
    width: 380,
    height: 210,
    backgroundColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000000',
    shadowOffset: {width: 6, height: 6},
    elevation: 12,
  },

  innerShadow: {
    flex: 1,
    margin: 4,
    backgroundColor: 'rgba(50,50,50,0.06)',
    shadowColor: '#333333',
    shadowOffset: {width: 3, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  overlay1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 400,
    height: 225,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
  },
  overlay2: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 392,
    height: 217,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 6,
  },
  overlay3: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 384,
    height: 209,
    backgroundColor: 'rgba(128,128,128,0.03)',
    borderRadius: 4,
  },
});
