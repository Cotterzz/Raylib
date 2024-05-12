#include "raylib.h"
// SUPPORT_GIF_RECORDING=true;
int main(void)
{// Begin
    const int screenWidth = 512;
    const int screenHeight = screenWidth;
    InitWindow(screenWidth, screenHeight, "Falling Sand");
    Shader shader = LoadShader(0, "sand.frag");
    Vector3 position = { -0.5f, -0.5f, 0.0f };
    SetTargetFPS(6000);
    int IterationsPerFrame = 1;
    int CurrentIteration = 0;
    int texLoc = GetShaderLocation(shader, "texture1");
    RenderTexture2D target = LoadRenderTexture(screenWidth, screenHeight);
    RenderTexture2D target2 = LoadRenderTexture(screenWidth, screenHeight);
    SetShaderValueTexture(shader, texLoc, target.texture);
    SetShaderValue(shader, GetShaderLocation(shader, "screensize"), &screenWidth, SHADER_UNIFORM_INT);
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
                if (IsMouseButtonDown(MOUSE_BUTTON_LEFT) ){DrawCircle((int)mousePos.x, (int)mousePos.y, 1, YELLOW);}
                if (IsMouseButtonDown(MOUSE_BUTTON_RIGHT) ){DrawCircle((int)mousePos.x, (int)mousePos.y, 1, BLACK);}
                SetShaderValueTexture(shader, texLoc, target.texture);
                float fTime = GetTime();
                SetShaderValue(shader, GetShaderLocation(shader, "timepassed"), &fTime, SHADER_UNIFORM_FLOAT);
            }
            CurrentIteration=0;
        EndTextureMode();    
        BeginDrawing();
                ClearBackground(WHITE);
                DrawTextureRec(target.texture, (Rectangle){ 0, 0, (float)target.texture.width, (float)-target.texture.height }, (Vector2){ 0, 0 }, WHITE);
                DrawFPS(10, 10);
        EndDrawing();
    }
    UnloadRenderTexture(target);
    CloseWindow();
    return 0;
}