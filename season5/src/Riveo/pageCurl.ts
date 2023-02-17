import { Core, frag } from "./ShaderLib";

export const pageCurl = frag`
uniform shader image;
uniform float pointer;
uniform float origin;
uniform vec4 container;
uniform vec2 center;

const float r = 150.0;
const float scaleFactor = 0.2;

${Core}

bool inRect(float2 p, float4 rct) {
  return p.x > rct.x && p.x < rct.z && p.y > rct.y && p.y < rct.w;
}

vec4 main(float2 xy) {
  Context ctx = Context(image.eval(xy), xy);
  float dx = origin - pointer; 
  float x = container.z - dx;
  float d = xy.x - x;

  if (d > r) {
    ctx.color = TRANSPARENT;
    if (inRect(xy, container)) {
      ctx.color.a = mix(0.5, 0, (d-r)/r);
    }
  } else if (d > 0) {
    float theta = asin(d / r);
    float d1 = theta * r;
    float d2 = (PI - theta) * r;
    vec2 p1 = vec2(x + d1, xy.y);

    float dp = cos(theta);
    vec2 s = vec2((1. + dp * 0.2));
    mat3 transform = scale(s, center);
    vec2 uv = project(xy, transform);
    vec2 p2 = vec2(x + d2, uv.y);
    if (inRect(p2, container)) {
      ctx.color = image.eval(p2);
    } else if (inRect(p1, container)) {
      ctx.color = image.eval(p1);
      ctx.color.rgb *= pow(clamp((r - d) / r, 0., 1.), .2);
    } else if (inRect(xy, container)) {
      ctx.color = TRANSPARENT;
      ctx.color.a = 0.5;
    }
  } else {
    vec2 s = vec2(1.2);
    mat3 transform = scale(s, center);
    vec2 uv = project(xy, transform);
    vec2 p = vec2(x + abs(d) + PI * r, uv.y);
    if (inRect(p, container)) {
      ctx.color = image.eval(p);
    } else {
      ctx.color = image.eval(xy);
    }
  }
  return ctx.color;
}
`;
