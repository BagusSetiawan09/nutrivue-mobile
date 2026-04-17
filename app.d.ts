/// <reference types="nativewind/types" />

import { ViewProps, TextProps, TextInputProps, TouchableOpacityProps, ScrollViewProps } from 'react-native';

declare module 'react-native' {
  interface ViewProps { className?: string; }
  interface TextProps { className?: string; }
  interface TextInputProps { className?: string; }
  interface TouchableOpacityProps { className?: string; }
  interface ScrollViewProps { className?: string; }
  interface KeyboardAvoidingViewProps { className?: string; }
  interface SafeAreaViewProps { className?: string; }
}