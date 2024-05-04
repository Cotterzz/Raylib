// constants

const float PI = 3.1415925654;

// colorspace conversion

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// misc functions

float random (in vec2 _st, float seed) {
    return fract(sin(seed + dot(_st.xy,vec2(12.9898, 78.233))) * 43758.5453123);
}

// shapes

float sdCircle(vec2 p, float r)
{
  return length(p) - r;
}

float sdPentagon(vec2 p, float r)
{
    const vec3 k = vec3(0.809016994,0.587785252,0.726542528);
    p.x = abs(p.x);
    p -= 2.0*min(dot(vec2(-k.x,k.y),p),0.0)*vec2(-k.x,k.y);
    p -= 2.0*min(dot(vec2( k.x,k.y),p),0.0)*vec2( k.x,k.y);
    return length(p-vec2(clamp(p.x,-r*k.z,r*k.z),r))*sign(p.y-r);
}

float sdBox(vec2 p, vec2 b)
{
    vec2 d = abs(p)-b;
    return length(max(d,vec2(0))) + min(max(d.x,d.y),0.0);
}

// 2d operations

void pRotate(inout vec2 p, float a) {
    p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}

float pPolar(inout vec2 p, float repetitions) {
    float angle = 2*PI/repetitions;
    float a = atan(p.y, p.x) + angle/2.;
    float r = length(p);
    float c = floor(a/angle);
    a = mod(a,angle) - angle/2.;
    p = vec2(cos(a), sin(a))*r;
    if (abs(c) >= (repetitions/2)) c = abs(c);
    return c;
}

// 3d operations

mat4 rotationX(in float angle) {
    return mat4(        1.0,           0,           0, 0,
                          0,  cos(angle), -sin(angle), 0,
                          0,  sin(angle),  cos(angle), 0,
                          0,           0,           0, 1);
}

mat4 rotationY(in float angle) {
    return mat4( cos(angle),          0,  sin(angle), 0,
                          0,        1.0,           0, 0,
                -sin(angle),          0,  cos(angle), 0,
                          0,          0,           0, 1);
}

mat4 rotationZ(in float angle) {
    return mat4( cos(angle), -sin(angle),          0, 0,
                 sin(angle),  cos(angle),          0, 0,
                          0,           0,          1, 0,
                          0,           0,          0, 1);
}
