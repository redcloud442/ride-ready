import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { bodyStyleOptions, PROPULSION_OPTIONS, TYPE_OPTIONS } from '@/constants/vehicles';
import { ColorSwatches } from '@/components/ui/color-swatches';
import { ChoiceStep } from '@/features/onboarding/components/choice-step';
import { DetailsStep } from '@/features/onboarding/components/details-step';
import { OnboardingHeader } from '@/features/onboarding/components/onboarding-header';
import { WelcomeStep } from '@/features/onboarding/components/welcome-step';
import { useOnboardingFlow } from '@/features/onboarding/hooks/use-onboarding-flow';
import { authClient } from '@/lib/auth-client';
import { useAppTheme } from '@/theme';
import { firstName } from '@/utils/greeting';

export default function OnboardingScreen() {
  const { colors } = useAppTheme();
  const { data: session } = authClient.useSession();
  const flow = useOnboardingFlow();
  const { control } = flow.form;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <OnboardingHeader index={flow.index} total={flow.total} onBack={flow.back} onSkip={flow.skip} skipDisabled={flow.saving} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {flow.step === 'welcome' && <WelcomeStep name={firstName(session?.user.name)} />}
          {flow.step === 'type' && (
            <ChoiceStep
              control={control}
              name="type"
              title="What do you ride?"
              subtitle="You can add more vehicles later in Garage."
              options={TYPE_OPTIONS}
            />
          )}
          {flow.step === 'bodyStyle' && (
            <>
              <ChoiceStep
                control={control}
                name="bodyStyle"
                title="Which one looks like yours?"
                subtitle="Pick the shape and color for its picture. You can change both later."
                options={bodyStyleOptions(flow.type, flow.color)}
              />
              <ColorSwatches control={control} name="color" label="Color" />
            </>
          )}
          {flow.step === 'propulsion' && (
            <ChoiceStep
              control={control}
              name="propulsion"
              title="How is it powered?"
              subtitle="This decides whether you log fuel, charging, or both."
              options={PROPULSION_OPTIONS}
              shape="square"
            />
          )}
          {flow.step === 'details' && <DetailsStep control={control} onSubmit={flow.finish} />}
          {flow.error && (
            <HelperText type="error" visible accessibilityLiveRegion="polite">
              {flow.error}
            </HelperText>
          )}
        </ScrollView>
        <SafeAreaView edges={['bottom']} style={[styles.footer, { borderTopColor: colors.outlineVariant }]}>
          <Button
            mode="contained"
            onPress={flow.isLast ? flow.finish : flow.next}
            loading={flow.saving}
            disabled={flow.saving}
            contentStyle={styles.cta}>
            {flow.step === 'welcome' ? 'Get started' : flow.isLast ? 'Add to garage' : 'Continue'}
          </Button>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 24 },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth },
  cta: { height: 52 },
});
