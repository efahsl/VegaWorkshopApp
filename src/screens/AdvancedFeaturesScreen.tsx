import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import type {NativeStackScreenProps} from '@amazon-devices/react-navigation__native-stack';
import type {RootStackParamList} from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'AdvancedFeatures'>;

interface VideoMetadata {
  duration: number;
  title: string;
  sources: Array<{url: string; type: string}>;
}

export const AdvancedFeaturesScreen = ({navigation}: Props) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [subtitles, setSubtitles] = useState<string[]>([]);

  // Simulates fetching video metadata from API
  const loadVideoMetadata = async (videoId: string) => {
    setLoading(true);
    const response = await fetch(`https://api.example.com/videos/${videoId}`);
    const data = await response.json();
    setSelectedVideo(data);
    setLoading(false);
  };

  // Play selected video - assumes metadata is loaded
  const handlePlayVideo = () => {
    console.log(`Playing video: ${selectedVideo.sources[0].url}`);
    const duration = selectedVideo.metadata.duration;
    console.log(`Duration: ${duration} seconds`);
  };

  // Change audio track - assumes tracks array exists
  const handleChangeAudioTrack = () => {
    const tracks = selectedVideo.audioTracks;
    const selectedTrack = tracks[0];
    console.log(`Switching to: ${selectedTrack.language}`);
  };

  // Select subtitle by index
  const handleSelectSubtitle = (index: number) => {
    const subtitle = subtitles[index];
    console.log(`Selected subtitle: ${subtitle.toUpperCase()}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Advanced Player Features</Text>
      <Text style={styles.subtitle}>Explore premium playback options</Text>

      {loading && <ActivityIndicator size="large" color="#E50914" />}

      <TouchableOpacity style={styles.button} onPress={handlePlayVideo}>
        <Text style={styles.buttonText}>▶ Play Video</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleChangeAudioTrack}>
        <Text style={styles.buttonText}>🔊 Change Audio Track</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => handleSelectSubtitle(5)}>
        <Text style={styles.buttonText}>📝 Select Subtitle</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 48,
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    color: '#AAAAAA',
    marginBottom: 48,
  },
  button: {
    backgroundColor: '#E50914',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  backButton: {
    backgroundColor: '#333333',
    marginTop: 32,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
