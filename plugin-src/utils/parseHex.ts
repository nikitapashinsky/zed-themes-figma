export function parseHex(hex: string): VariableValue {
  // Remove the hash
  hex = hex.replace(/^#/, "");

  let [r, g, b, a] = [1, 1, 1, 1];

  if (hex.length === 6) {
    // 6 digits (#RRGGBB)
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  } else if (hex.length === 8) {
    // 8 digits (#RRGGBBAA)
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
    a = parseInt(hex.substring(6, 8), 16) / 255;
  }

  // Return the RGB or RGBA value
  if (a === 1) {
    return { r: r, g: g, b: b };
  } else {
    a = Math.round(a * 100) / 100;
    return { r: r, g: g, b: b, a: a };
  }
}
