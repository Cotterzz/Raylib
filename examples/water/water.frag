#version 330

// Input vertex attributes (from vertex shader)
in vec2 fragTexCoord;
in vec4 fragColor;
in vec3 vertPos;
// Output fragment color
out vec4 finalColor;
uniform sampler2D texture1;
uniform int screensize;
uniform float timepassed;

float random (vec2 st) {return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}

int border = 2;

void main()
{
    //vec2 pos = vec2(gl_FragCoord.x, gl_FragCoord.y);
    vec2 pos = vec2(fragTexCoord.x*screensize, fragTexCoord.y*screensize);
    //vec2 pos = vec2(vertPos.x, screensize-vertPos.y);
    bool isB = pos.y<border; // are we on the bottom
    bool isT = pos.y>(screensize-border); // are we on the top
    bool isL = pos.x<border; // are we on the left
    bool isR = pos.x>(screensize-border);  // are we on the right
    bool isE = float(float(isB)+float(isT)+float(isL)+float(isR))>0.5;  // are we on the border

    ivec2 pix =   ivec2(pos.x,   pos.y); // define pixel coordinates for here
    ivec2 pixu =  ivec2(pos.x,   pos.y+1); // above, below etc.
    ivec2 pixd =  ivec2(pos.x,   pos.y-1);
    ivec2 pixl =  ivec2(pos.x-1, pos.y);
    ivec2 pixr =  ivec2(pos.x+1, pos.y);
    ivec2 pixur = ivec2(pos.x+1, pos.y+1); // and diagonals
    ivec2 pixdr = ivec2(pos.x+1, pos.y-1);
    ivec2 pixul = ivec2(pos.x-1, pos.y+1);
    ivec2 pixdl = ivec2(pos.x-1, pos.y-1);  

    vec4 pixc = texelFetch(texture1, pix, 0); // get colors for here, 
    vec4 pixuc = texelFetch(texture1, pixu, 0); // above, below etc.
    vec4 pixdc = texelFetch(texture1, pixd, 0);
    vec4 pixlc = texelFetch(texture1, pixl, 0);
    vec4 pixrc = texelFetch(texture1, pixr, 0);
    vec4 pixurc = texelFetch(texture1, pixur, 0); // and diagonals
    vec4 pixdrc = texelFetch(texture1, pixdr, 0);
    vec4 pixulc = texelFetch(texture1, pixul, 0);
    vec4 pixdlc = texelFetch(texture1, pixdl, 0);

    bool empty = pixc.r+pixc.g+pixc.b==0.0; // ask if these points are empty space
    bool emptyu = pixuc.r+pixuc.g+pixuc.b==0.0;
    bool emptyd = pixdc.r+pixdc.g+pixdc.b==0.0;
    bool emptyl = pixlc.r+pixlc.g+pixlc.b==0.0;
    bool emptyr = pixrc.r+pixrc.g+pixrc.b==0.0;
    bool emptyur = pixurc.r+pixurc.g+pixurc.b==0.0; // and diagonals
    bool emptydr = pixdrc.r+pixdrc.g+pixdrc.b==0.0;
    bool emptyul = pixulc.r+pixulc.g+pixulc.b==0.0;
    bool emptydl = pixdlc.r+pixdlc.g+pixdlc.b==0.0;

    bool fall = pixc.g>0.0; // ask if these points are falling material
    bool fallu = pixuc.g>0.0;
    bool falld = pixdc.g>0.0;
    bool falll = pixlc.g>0.0;
    bool fallr = pixrc.g>0.0;
    bool fallur = pixurc.g>0.0; // diagonals
    bool falldr = pixdrc.g>0.0;
    bool fallul = pixulc.g>0.0;
    bool falldl = pixdlc.g>0.0;

    vec4 texelColor1 = pixc;
    
    // if here is empty, and above is empty, and left is not empty, and above left contains falling matter, put it here;
    texelColor1 = mix(texelColor1, pixulc, float(empty)*float(emptyu)*float(!emptyl)*float(fallul));
    // if bottom right is empty, and right is empty, and below contains matter, an here is falling matter, delete it
    texelColor1 = mix(texelColor1, pixdrc, float(emptydr)*float(emptyr)*float(!emptyd)*float(fall));

    // if here is empty, and above is empty, and right is not empty, and above right contains falling matter, put it here;
    texelColor1 = mix(texelColor1, pixurc, float(empty)*float(emptyu)*float(!emptyr)*float(fallur));
    // if bottom left is empty, and left is empty, and below contains matter, an here is falling matter, delete it
    texelColor1 = mix(texelColor1, pixdlc, float(emptydl)*float(emptyl)*float(!emptyd)*float(fall));

    // if here is empty and above is falling, put falling here, else leave here as-is
    texelColor1 = mix(texelColor1, pixuc, float(empty)*float(fallu));
    // if here is falling and below is empty, put empty here
    texelColor1 = mix(texelColor1, pixdc, float(emptyd)*float(fall));
    // if here is edge, make red.
    texelColor1 = mix(texelColor1, vec4(1,0,0,1), float(isE));

    bool isNewSand = texelColor1.r > (1.0/256.0)*250.0;
    float newRed = 0.60+random(pos.xy*timepassed)*0.3;
    float newGreen = 0.40+random(pos.yx*timepassed)*0.5;
    texelColor1 = mix(texelColor1, vec4(newRed,newGreen,0,1), float(isNewSand)*float(!isE));

    finalColor = texelColor1;
}