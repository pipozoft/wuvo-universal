import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import {
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { EmailCodeFactor, TOTPFactor } from '@clerk/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Logo } from '@/components/brand/Logo';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

type SecondFactorStrategy = 'email_code' | 'totp' | null;

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [needsSecondFactor, setNeedsSecondFactor] = React.useState(false);
  const [secondFactorStrategy, setSecondFactorStrategy] =
    React.useState<SecondFactorStrategy>(null);
  const [emailAddressId, setEmailAddressId] = React.useState<string | null>(null);
  const [code, setCode] = React.useState('');

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSignInPress = async (data: SignInFormData) => {
    if (!isLoaded) return;

    setIsLoading(true);
    setErrors([]);

    try {
      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/');
      } else if (signInAttempt.status === 'needs_second_factor') {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor => factor.strategy === 'email_code'
        );
        const totpFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is TOTPFactor => factor.strategy === 'totp'
        );

        if (emailCodeFactor) {
          setSecondFactorStrategy('email_code');
          setEmailAddressId(emailCodeFactor.emailAddressId);
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setNeedsSecondFactor(true);
        } else if (totpFactor) {
          setSecondFactorStrategy('totp');
          setNeedsSecondFactor(true);
        } else {
          setErrors(['Second factor authentication is not supported']);
        }
      } else if (signInAttempt.status === 'needs_identifier') {
        setErrors(['Please enter your email address']);
      } else if (signInAttempt.status === 'needs_first_factor') {
        setErrors(['Please enter your password']);
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
        setErrors(['An unexpected error occurred']);
      }
    } catch (err: any) {
      console.debug('==> SIGN_IN_ERROR:', JSON.stringify(err, null, 2));

      if (err?.errors && Array.isArray(err.errors)) {
        const clerkErrors = err.errors.map((e: any) => e.longMessage || e.message);
        setErrors(clerkErrors);
      } else if (err?.message) {
        setErrors([err.message]);
      } else {
        setErrors(['Sign in failed. Please check your credentials.']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSecondFactorPress = async () => {
    if (!isLoaded || !signIn || code.length < 1) {
      if (code.length < 1) {
        setErrors(['Please enter the verification code']);
      }
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const attemptSecondFactor = await signIn.attemptSecondFactor({
        strategy: secondFactorStrategy === 'email_code' ? 'email_code' : 'totp',
        code: code,
      });

      if (attemptSecondFactor.status === 'complete') {
        await setActive({ session: attemptSecondFactor.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(attemptSecondFactor, null, 2));
        setErrors(['Verification failed. Please check your code.']);
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));

      if (err?.errors && Array.isArray(err.errors)) {
        const clerkErrors = err.errors.map((e: any) => e.longMessage || e.message);
        setErrors(clerkErrors);
      } else if (err?.message) {
        setErrors([err.message]);
      } else {
        setErrors(['Invalid code. Please try again.']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendSecondFactorCode = async () => {
    if (!isLoaded || !signIn || secondFactorStrategy !== 'email_code' || !emailAddressId) return;

    setIsLoading(true);
    setErrors([]);

    try {
      await signIn.prepareSecondFactor({
        strategy: 'email_code',
        emailAddressId,
      });
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));

      if (err?.errors && Array.isArray(err.errors)) {
        const clerkErrors = err.errors.map((e: any) => e.longMessage || e.message);
        setErrors(clerkErrors);
      } else {
        setErrors(['Failed to resend code']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetSecondFactor = () => {
    setNeedsSecondFactor(false);
    setSecondFactorStrategy(null);
    setEmailAddressId(null);
    setCode('');
    setErrors([]);
  };

  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : undefined;

  if (needsSecondFactor) {
    return (
      <KeyboardAvoidingView
        behavior={keyboardBehavior}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            minHeight: Dimensions.get('window').height - 100,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="py-8">
            <View className="gap-4 rounded-2xl p-8 shadow-lg">
              <Text variant="h4" className="text-center">
                Two-Factor Authentication
              </Text>
              <Text variant="muted" className="text-center">
                {secondFactorStrategy === 'email_code'
                  ? 'Enter the code sent to your email'
                  : 'Enter the code from your authenticator app'}
              </Text>

              {errors.length > 0 && (
                <View className="gap-1">
                  {errors.map((error, index) => (
                    <Text key={index} className="text-destructive text-center text-sm">
                      {error}
                    </Text>
                  ))}
                </View>
              )}

              <Input
                autoCapitalize="none"
                autoCorrect={false}
                value={code}
                placeholder="Enter 6-digit code"
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isLoading}
              />

              <Button onPress={onSecondFactorPress} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator className="text-primary-foreground" />
                ) : (
                  <Text>Verify</Text>
                )}
              </Button>

              {secondFactorStrategy === 'email_code' && (
                <Button variant="ghost" onPress={resendSecondFactorCode} disabled={isLoading}>
                  <Text>Resend Code</Text>
                </Button>
              )}

              <Button variant="outline" onPress={resetSecondFactor} disabled={isLoading}>
                <Text>Back to Sign In</Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={keyboardBehavior}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          minHeight: Dimensions.get('window').height - 100,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="bg-background">
        <View className="px-8 py-8">
          <View className="gap-4">
            <View className="items-center pb-4">
              <Logo />
            </View>

            <Text variant="h4" className="text-center">
              Sign In
            </Text>

            {errors.length > 0 && (
              <View className="gap-1">
                {errors.map((error, index) => (
                  <Text key={index} className="text-destructive text-center text-sm">
                    {error}
                  </Text>
                ))}
              </View>
            )}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View className="gap-1">
                  <Input
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    value={value}
                    placeholder="Email"
                    onChangeText={onChange}
                    editable={!isLoading}
                  />
                  {formErrors.email && (
                    <Text className="text-destructive text-sm">{formErrors.email.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View className="gap-1">
                  <Input
                    value={value}
                    placeholder="Password"
                    secureTextEntry
                    onChangeText={onChange}
                    editable={!isLoading}
                  />
                  {formErrors.password && (
                    <Text className="text-destructive text-sm">{formErrors.password.message}</Text>
                  )}
                </View>
              )}
            />

            <Button onPress={handleSubmit(onSignInPress)} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator className="text-primary-foreground" />
              ) : (
                <Text>Continue</Text>
              )}
            </Button>

            <View className="flex-row items-center justify-center gap-4 pt-4">
              <Link href="/terms" asChild>
                <Button variant="link" size="sm" disabled={isLoading}>
                  <Text className="text-muted-foreground text-xs">Terms of Service</Text>
                </Button>
              </Link>
              <Text className="text-muted-foreground text-xs">|</Text>
              <Link href="/privacy" asChild>
                <Button variant="link" size="sm" disabled={isLoading}>
                  <Text className="text-muted-foreground text-xs">Privacy Policy</Text>
                </Button>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
