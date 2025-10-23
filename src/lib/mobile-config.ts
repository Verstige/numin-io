import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';

export const initializeMobileApp = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // Configure status bar
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#000000' });

      // Hide splash screen
      await SplashScreen.hide();

      // Configure keyboard behavior
      await Keyboard.setAccessoryBarVisible({ isVisible: false });
      await Keyboard.setResizeMode({ mode: 'ionic' });

      // Handle app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
      });

      // Handle back button (Android)
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        }
      });

      console.log('Mobile app initialized successfully');
    } catch (error) {
      console.error('Error initializing mobile app:', error);
    }
  }
};

export const isMobileApp = () => Capacitor.isNativePlatform();

export const getPlatform = () => Capacitor.getPlatform();





