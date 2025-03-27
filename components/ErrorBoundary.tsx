import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#A076F9" />
            <Text style={styles.errorTitle}>Oops, Something Went Wrong</Text>
            <Text style={styles.errorMessage}>
              The app ran into an unexpected problem. Please try again.
            </Text>
            {this.state.error && (
              <Text style={styles.errorDetails}>
                {this.state.error.toString()}
              </Text>
            )}
            <TouchableOpacity style={styles.resetButton} onPress={this.resetError}>
              <Text style={styles.resetButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'Inter_700Bold',
  },
  errorMessage: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter_400Regular',
  },
  errorDetails: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 30,
    padding: 10,
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    width: '100%',
    fontFamily: 'Inter_400Regular',
  },
  resetButton: {
    backgroundColor: '#A076F9',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
});

export default ErrorBoundary;