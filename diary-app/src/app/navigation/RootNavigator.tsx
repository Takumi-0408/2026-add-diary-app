import { NavigationContainer } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { User } from 'firebase/auth';
import { initializeFirebase, getAuthInstance } from '../../services/firebase';
import { subscribeToAuthChanges } from '../../services/authService';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

initializeFirebase();

export function RootNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5b8a3a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
