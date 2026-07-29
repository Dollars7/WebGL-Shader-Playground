// Extended Reinhard tone mapping.
//
// Without this, any lighting result above 1.0 is hard-clamped by the driver, so
// raising Intensity past the point where the brightest channel saturates has no
// visible effect at all. This stays essentially linear for dim values and rolls
// highlights off smoothly instead, which keeps the whole slider range useful.
//
// WHITE_POINT is the input value that maps to pure white.

const float WHITE_POINT = 3.0;

vec3 toneMap(vec3 color) {
  vec3 numerator = color * (1.0 + color / (WHITE_POINT * WHITE_POINT));
  return numerator / (1.0 + color);
}
