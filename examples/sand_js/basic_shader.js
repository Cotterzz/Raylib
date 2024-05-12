const screenWidth = 512;
const screenHeight = screenWidth;

const fshader = `
#version 100

precision mediump float;

varying vec2 fragTexCoord;
varying vec4 fragColor;

// Input uniform values
uniform sampler2D texture1;
uniform int screensize;
uniform float timepassed;
uniform vec4 colDiffuse;

void main()
{
    gl_FragColor = vec4(fragTexCoord.x, fragTexCoord.y, 1.0, 1);
}
`;

let shader, texLoc, target, drawRec, drawVec, fTime;

const InitGame = async () => {
    InitWindow(screenWidth, screenHeight);
    //fshader =  await LoadFileText("sand_es.frag")
    shader = await LoadShaderFromMemory(0, fshader);
    console.log(fshader);
    SetTargetFPS(60);
    texLoc = GetShaderLocation(shader, "texture1");
    target = new RenderTexture2D(LoadRenderTexture(screenWidth, screenHeight));
    SetShaderValueTexture(shader, texLoc, target.texture);
    SetShaderValue(shader, GetShaderLocation(shader, "screensize"), screenWidth, SHADER_UNIFORM_INT);
}

const UpdateGame = (ts) => {
    fTime = 100;
    SetShaderValue(shader, GetShaderLocation(shader, "timepassed"), fTime, SHADER_UNIFORM_FLOAT);
    BeginDrawing();
        ClearBackground(WHITE);
        BeginShaderMode(shader);
            DrawTexture(target.texture, 0, 0, WHITE);
        EndShaderMode();
        DrawFPS(10, 10);
    EndDrawing();
}
