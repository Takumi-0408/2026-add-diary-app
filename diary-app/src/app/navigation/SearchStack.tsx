import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SearchScreen } from '../../features/diary/SearchScreen';
import { DiaryDetailScreen } from '../../features/diary/DiaryDetailScreen';

export type SearchStackParamList = {
  SearchHome: undefined;
  DiaryDetail: { diaryId: string };
};

const Stack = createNativeStackNavigator<SearchStackParamList>();

export function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchHome" component={SearchScreen} />
      <Stack.Screen name="DiaryDetail" component={DiaryDetailScreen} />
    </Stack.Navigator>
  );
}
