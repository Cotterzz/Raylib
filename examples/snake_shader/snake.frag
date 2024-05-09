#version 330

// Input vertex attributes (from vertex shader)
in vec2 fragTexCoord;
in vec4 fragColor;
in vec3 vertPos;
// Output fragment color
out vec4 finalColor;
uniform sampler2D texture1;
uniform int screensize;
uniform int direction;

float random (vec2 st) {return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}

int border = 2;

vec4 white = vec4(1,1,1,1);
vec4 yellow = vec4(0.98, 0.97, 0, 1);
vec4 orange = vec4(1, 0.63, 0, 1);
vec4 maroon = vec4(0.75, 0.13, 0.21, 1);
vec4 black = vec4(0, 0, 0, 1);
vec4 green = vec4(0, 0.89, 0.19, 1);
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
    ivec2 pix2u = ivec2(pos.x, pos.y+2); 
    ivec2 pix2d = ivec2(pos.x, pos.y-2);
    ivec2 pix2l = ivec2(pos.x-2, pos.y);
    ivec2 pix2r = ivec2(pos.x+2, pos.y);  

    vec4 pixc = texelFetch(texture1, pix, 0); // get colors for here, 
    vec4 pixuc = texelFetch(texture1, pixu, 0); // above, below etc.
    vec4 pixdc = texelFetch(texture1, pixd, 0);
    vec4 pixlc = texelFetch(texture1, pixl, 0);
    vec4 pixrc = texelFetch(texture1, pixr, 0);
    vec4 pix2uc = texelFetch(texture1, pix2u, 0); // and diagonals
    vec4 pix2dc = texelFetch(texture1, pix2d, 0);
    vec4 pix2lc = texelFetch(texture1, pix2l, 0);
    vec4 pix2rc = texelFetch(texture1, pix2r, 0);

    bool empty = pixc.r+pixc.g+pixc.b==0.0; // ask if these points are empty space
    bool emptyu = pixuc.r+pixuc.g+pixuc.b==0.0;
    bool emptyd = pixdc.r+pixdc.g+pixdc.b==0.0;
    bool emptyl = pixlc.r+pixlc.g+pixlc.b==0.0;
    bool emptyr = pixrc.r+pixrc.g+pixrc.b==0.0;


    bool iswhite =     pixc==white; // ask if these points are falling material
    bool iswhiteu =   pixuc==white;
    bool iswhited =   pixdc==white;
    bool iswhitel =   pixlc==white;
    bool iswhiter =   pixrc==white;
    bool iswhite2u = bool(float(pix2uc==white)*float((pix2uc==white)));
    bool iswhite2d = bool(float(pix2dc==white)*float((pix2dc==white)));
    bool iswhite2l = bool(float(pix2lc==white)*float((pix2lc==white)));
    bool iswhite2r = bool(float(pix2rc==white)*float((pix2rc==white)));

    bool isyellow =     bool(float(pixc.b==0)*float(!(pixc.r==1)));
    bool isyellowu =    bool(float(pixuc.b==0)*float(!(pixuc.r==1)));
    bool isyellowd =    bool(float(pixdc.b==0)*float(!(pixdc.r==1)));
    bool isyellowl =    bool(float(pixlc.b==0)*float(!(pixlc.r==1)));
    bool isyellowr =    bool(float(pixrc.b==0)*float(!(pixrc.r==1)));

    bool isorange =      bool(float(pixc.b==0)*float((pixc.r==1)));
    bool isorangeu =    bool(float(pixuc.b==0)*float((pixuc.r==1)));
    bool isoranged =    bool(float(pixdc.b==0)*float((pixdc.r==1)));
    bool isorangel =    bool(float(pixlc.b==0)*float((pixlc.r==1)));
    bool isoranger =    bool(float(pixrc.b==0)*float((pixrc.r==1)));

    bool ismaroon = bool(float(pixc.b>0.20)*float((pixc.b<0.23)));

    bool isgreen = bool(float(pixc.g>0.88)*float((pixc.g<0.90)));
    bool isgreenu = bool(float(pixuc.g>0.88)*float((pixuc.g<0.90)));
    bool isgreend = bool(float(pixdc.g>0.88)*float((pixdc.g<0.90)));
    bool isgreenl = bool(float(pixlc.g>0.88)*float((pixlc.g<0.90)));
    bool isgreenr = bool(float(pixrc.g>0.88)*float((pixrc.g<0.90)));

    vec4 texelColor1 = pixc;

    

    // if here is empty, and adjacent is white, make white, according to direction
    if (empty){
        texelColor1 = mix(texelColor1, white, float(float(direction==0)*float(iswhitel)));
        texelColor1 = mix(texelColor1, white, float(float(direction==1)*float(iswhiteu)));
        texelColor1 = mix(texelColor1, white, float(float(direction==2)*float(iswhiter)));
        texelColor1 = mix(texelColor1, white, float(float(direction==3)*float(iswhited)));
        texelColor1 = mix(texelColor1, white, float(float(direction==0)*float(iswhite2l)*float(isgreenl)));
        texelColor1 = mix(texelColor1, white, float(float(direction==1)*float(iswhite2u)*float(isgreenu)));
        texelColor1 = mix(texelColor1, white, float(float(direction==2)*float(iswhite2r)*float(isgreenr)));
        texelColor1 = mix(texelColor1, white, float(float(direction==3)*float(iswhite2d)*float(isgreend)));
    } else if (iswhite){
        texelColor1 = yellow;
    } else if (isyellow) {
        texelColor1 = mix(texelColor1, orange, float(isorangel));
        texelColor1 = mix(texelColor1, orange, float(isoranger));
        texelColor1 = mix(texelColor1, orange, float(isorangeu));
        texelColor1 = mix(texelColor1, orange, float(isoranged));
    } else if (isorange) {
        texelColor1 = maroon;
    } else if (ismaroon) {
        texelColor1 = black;
    } else if (isgreen){
        texelColor1 = mix(texelColor1, white, float(float(direction==0)*float(iswhitel)));
        texelColor1 = mix(texelColor1, white, float(float(direction==1)*float(iswhiteu)));
        texelColor1 = mix(texelColor1, white, float(float(direction==2)*float(iswhiter)));
        texelColor1 = mix(texelColor1, white, float(float(direction==3)*float(iswhited)));
    }

    // if here is white, make yellow

    // if here is yellow, and adjacent orange, make orange

    // if here is orange, mkae maroon

    // if here is maroon, make empty


    
    // if here is empty, and above is empty, and left is not empty, and above left contains falling matter, put it here;
    //texelColor1 = mix(texelColor1, pixulc, float(empty)*float(emptyu)*float(!emptyl)*float(fallul));
    // if bottom right is empty, and right is empty, and below contains matter, an here is falling matter, delete it
   // texelColor1 = mix(texelColor1, pixdrc, float(emptydr)*float(emptyr)*float(!emptyd)*float(fall));

    // if here is empty, and above is empty, and right is not empty, and above right contains falling matter, put it here;
   // texelColor1 = mix(texelColor1, pixurc, float(empty)*float(emptyu)*float(!emptyr)*float(fallur));
    // if bottom left is empty, and left is empty, and below contains matter, an here is falling matter, delete it
  //  texelColor1 = mix(texelColor1, pixdlc, float(emptydl)*float(emptyl)*float(!emptyd)*float(fall));

    // if here is empty and above is falling, put falling here, else leave here as-is
 //   texelColor1 = mix(texelColor1, pixuc, float(empty)*float(fallu));
    // if here is falling and below is empty, put empty here
  //  texelColor1 = mix(texelColor1, pixdc, float(emptyd)*float(fall));
    // if here is edge, make red.
  //  texelColor1 = mix(texelColor1, vec4(1,0,0,1), float(isE));

    //bool isNewSand = texelColor1.r > (1.0/256.0)*250.0;
    //float newRed = 0.60+random(pos.xy*timepassed)*0.3;
    //float newGreen = 0.40+random(pos.yx*timepassed)*0.5;
    //texelColor1 = mix(texelColor1, vec4(newRed,newGreen,0,1), float(isNewSand)*float(!isE));

    finalColor = texelColor1;
}