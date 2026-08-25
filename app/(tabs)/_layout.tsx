import { Tabs } from 'expo-router';
import { useTheme } from '../../src/theme';
import { TabBarIcon } from '../../src/components/ui';
import { BackpackIcon, HandsIcon, HomeIcon, ChatIcon } from '../../src/components/icons';

export default function TabsLayout() {
  const { color, typography } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.primary,
        tabBarInactiveTintColor: color.textSecondary,
        tabBarLabelStyle: { fontFamily: typography.caption.fontFamily, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: color.surface,
          borderTopColor: color.border,
          height: 84,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="courses"
        options={{ title: 'Courses', tabBarIcon: ({ focused }) => <TabBarIcon icon={BackpackIcon} focused={focused} /> }}
      />
      <Tabs.Screen
        name="connect"
        options={{ title: 'Connect', tabBarIcon: ({ focused }) => <TabBarIcon icon={HandsIcon} focused={focused} /> }}
      />
      <Tabs.Screen
        name="den"
        options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabBarIcon icon={HomeIcon} focused={focused} /> }}
      />
      <Tabs.Screen
        name="help-bot"
        options={{ title: 'Help Bot', tabBarIcon: ({ focused }) => <TabBarIcon icon={ChatIcon} focused={focused} /> }}
      />
    </Tabs>
  );
}
