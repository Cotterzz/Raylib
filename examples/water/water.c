#include "raylib.h"
// SUPPORT_GIF_RECORDING=true;
int main(void)
{// Begin
    const int panelsize = 128;
    const int pixelsize = 4;
    const int paneldisplaysize = panelsize*pixelsize;
    const int bordersize = 0;
    
    const int screenHeight = paneldisplaysize + (bordersize*2);
    const int screenWidth = screenHeight; //(paneldisplaysize*2) + (bordersize*4);
    InitWindow(screenWidth, screenHeight, "Falling Water");
    Shader shader = LoadShader(0, "water.frag");
    Vector3 position = { -0.5f, -0.5f, 0.0f };
    SetTargetFPS(60);
    int IterationsPerFrame = 1;
    int CurrentIteration = 0;
    int texLoc = GetShaderLocation(shader, "texture1");
    RenderTexture2D target = LoadRenderTexture(panelsize, panelsize);
    RenderTexture2D targetFlip = LoadRenderTexture(panelsize, panelsize);
    SetShaderValueTexture(shader, texLoc, target.texture);
    SetShaderValue(shader, GetShaderLocation(shader, "screensize"), &panelsize, SHADER_UNIFORM_INT);
    BeginTextureMode(target);       // Enable drawing to texture
        ClearBackground(BLACK);
    EndTextureMode();
    while (!WindowShouldClose())
    {
        Vector2 mousePos = GetMousePosition();
        BeginTextureMode(target);     
            while (CurrentIteration<IterationsPerFrame)
            {
                CurrentIteration+=1;
                BeginShaderMode(shader);
                DrawTextureRec(target.texture, (Rectangle){ 0, 0, (float)target.texture.width, (float)-target.texture.height}, (Vector2){ 0, 0 }, WHITE); // y-flip texture 
                EndShaderMode();
                if (IsMouseButtonDown(MOUSE_BUTTON_LEFT) ){DrawCircle((int)((mousePos.x/pixelsize)-(bordersize/pixelsize)), (int)((mousePos.y/pixelsize)-(bordersize/pixelsize)), 1, YELLOW);}
                if (IsMouseButtonDown(MOUSE_BUTTON_RIGHT) ){DrawCircle((int)mousePos.x-bordersize, (int)mousePos.y-bordersize, 1, BLACK);}
                SetShaderValueTexture(shader, texLoc, target.texture);
                float fTime = GetTime();
                SetShaderValue(shader, GetShaderLocation(shader, "timepassed"), &fTime, SHADER_UNIFORM_FLOAT);
            }
            CurrentIteration=0;
        EndTextureMode();    
        BeginTextureMode(targetFlip);
            DrawTextureRec(target.texture, (Rectangle){ 0, 0, (float)target.texture.width, (float)target.texture.height}, (Vector2){ 0, 0 }, WHITE);
        EndTextureMode();
        BeginDrawing();
                ClearBackground(WHITE);
                DrawTextureEx(targetFlip.texture, (Vector2){ bordersize, bordersize }, 0, pixelsize, WHITE);
                DrawFPS(10, 10);
        EndDrawing();
    }
    UnloadRenderTexture(target);
    UnloadRenderTexture(targetFlip);
    CloseWindow();
    return 0;
}