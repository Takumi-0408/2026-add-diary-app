import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DiaryStack } from './DiaryStack';
import { SearchStack } from './SearchStack';
import { SettingsScreen } from '../../features/common/SettingsScreen';

export type MainTabParamList = {
  DiaryHome: undefined;
  Search: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5b8a3a',
        tabBarInactiveTintColor: '#a39e8e',
      }}
    >
      <Tab.Screen
        name="DiaryHome"
        component={DiaryStack}
        options={{ tabBarLabel: '日記' }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStack}
        options={{ tabBarLabel: '検索' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: '設定' }}
      />
    </Tab.Navigator>
  );
}
