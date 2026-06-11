import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiaryListScreen } from '../../features/diary/DiaryListScreen';
import { DiaryCreateScreen } from '../../features/diary/DiaryCreateScreen';
import { DiaryDetailScreen } from '../../features/diary/DiaryDetailScreen';
import { DiaryEditScreen } from '../../features/diary/DiaryEditScreen';

export type DiaryStackParamList = {
  DiaryList: undefined;
  DiaryCreate: undefined;
  DiaryDetail: { diaryId: string };
  DiaryEdit: { diaryId: string };
};

const Stack = createNativeStackNavigator<DiaryStackParamList>();

export function DiaryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiaryList" component={DiaryListScreen} />
      <Stack.Screen name="DiaryCreate" component={DiaryCreateScreen} />
      <Stack.Screen name="DiaryDetail" component={DiaryDetailScreen} />
      <Stack.Screen name="DiaryEdit" component={DiaryEditScreen} />
    </Stack.Navigator>
  );
}
