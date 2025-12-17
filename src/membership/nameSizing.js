export const MAX_FULL_NAME_LENGTH = 32;
export const BASE_NAME_FONT_SIZE = 19;
export const NAME_LETTER_SPACING_EM = 0.06;

const NAME_SCALE_START_LENGTH = 18;
const MIN_NAME_SCALE = 0.6;
const NAME_FONT_STACK = '"Blinker", system-ui, -apple-system, sans-serif';

export const clampFullName = (value) => (value ?? "").toString().trim().slice(0, MAX_FULL_NAME_LENGTH);

const measureNameWidth = (() => {
  let canvas;

  return (text, fontSize) => {
    if (typeof document === "undefined") return 0;

    if (!canvas) {
      canvas = document.createElement("canvas");
    }

    const context = canvas.getContext("2d");
    if (!context) return 0;

    context.font = `700 ${fontSize}px ${NAME_FONT_STACK}`;

    const baseWidth = context.measureText(text).width;
    const letterSpacingWidth = Math.max(0, text.length - 1) * fontSize * NAME_LETTER_SPACING_EM;

    return baseWidth + letterSpacingWidth;
  };
})();

export const getNameScale = (fullName, availableWidth = 0) => {
  const safeName = clampFullName(fullName);
  const safeNameLength = safeName.length;

  if (!safeNameLength) return 1;

  const lengthBasedReduction = Math.max(0, safeNameLength - NAME_SCALE_START_LENGTH) * 0.02;
  const lengthBasedScale = Math.max(MIN_NAME_SCALE, 1 - lengthBasedReduction);

  if (!availableWidth) {
    return lengthBasedScale;
  }

  const measuredWidth = measureNameWidth(safeName, BASE_NAME_FONT_SIZE);
  if (!measuredWidth) {
    return lengthBasedScale;
  }

  const widthBasedScale = Math.min(1, availableWidth / measuredWidth);

  return Math.max(MIN_NAME_SCALE, Math.min(lengthBasedScale, widthBasedScale));
};
