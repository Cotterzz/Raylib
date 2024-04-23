#version 330

// Input vertex attributes (from vertex shader)
in vec2 fragTexCoord;
in vec4 fragColor;
in vec3 vertPos;

// Output fragment color
out vec4 finalColor;

float sdCircle(vec2 p, float r)
{
  return length(p) - r;
}

void main()
{
    float dcurve = 1.0-abs((fragTexCoord.y)-(sin(fragTexCoord.x)/10.0));
    float fromcentre = sdCircle(fragTexCoord-0.5, 0.3); //distance(vec2(0.5,0.5), fragTexCoord);
    finalColor = vec4(fragColor.r, fragColor.g, fragColor.b, 0.5-fromcentre*2.0);
}