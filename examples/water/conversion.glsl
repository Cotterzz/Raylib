inline float4 EncodeFloatRGBA( float v ) {
  float4 enc = float4(1.0, 255.0, 65025.0, 16581375.0) * v;
  enc = frac(enc);
  enc -= enc.yzww * float4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);
  return enc;
}
inline float DecodeFloatRGBA( float4 rgba ) {
  return dot( rgba, float4(1.0, 1/255.0, 1/65025.0, 1/16581375.0) );
}
