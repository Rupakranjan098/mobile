import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline sizes based on iPhone 11/12/13/14
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scales size based on screen width
 */
export const scale = (size) => (SCREEN_WIDTH / guidelineBaseWidth) * size;

/**
 * Scales size based on screen height
 */
export const verticalScale = (size) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * Moderate scale for items that shouldn't scale too aggressively (like fonts)
 */
export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

/**
 * Check if the device is a tablet
 */
export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  }
  return pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920);
};

export { SCREEN_WIDTH, SCREEN_HEIGHT };
