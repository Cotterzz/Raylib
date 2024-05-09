#include "raylib.h"
 SUPPORT_GIF_RECORDING=true;
int main(void)
{// Begin
    const int panelsize = 256;
    const int pixelsize = 2;
    const int paneldisplaysize = panelsize*pixelsize;
    const int bordersize = 0;
    
    const int screenHeight = paneldisplaysize + (bordersize*2);
    const int screenWidth = screenHeight; //(paneldisplaysize*2) + (bordersize*4);
    InitWindow(screenWidth, screenHeight, "Snake Shader");
    Shader shader = LoadShader(0, "snake.frag");
    Vector3 position = { -0.5f, -0.5f, 0.0f };
    SetTargetFPS(30);
    int IterationsPerFrame = 1;
    int CurrentIteration = 0;
    int texLoc = GetShaderLocation(shader, "texture1");
    int sdirection = 0;
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
                if (IsKeyPressed(KEY_LEFT)){sdirection=2;}
                if (IsKeyPressed(KEY_RIGHT)){sdirection=0;}
                if (IsKeyPressed(KEY_UP)){sdirection=3;}
                if (IsKeyPressed(KEY_DOWN)){sdirection=1;}
                if (IsMouseButtonDown(MOUSE_BUTTON_LEFT) )
                {
                    int mx = (int)((mousePos.x/pixelsize)-(bordersize/pixelsize));
                    int my = (int)((mousePos.y/pixelsize)-(bordersize/pixelsize));
                    
                    DrawPixel(mx, my, WHITE);
                    DrawPixel(mx+1, my, YELLOW);
                    DrawPixel(mx+2, my, ORANGE);
                    DrawPixel(mx+3, my, MAROON);
                    //DrawCircle(mx, my , 1, YELLOW);
                }
                if (IsMouseButtonDown(MOUSE_BUTTON_RIGHT) ){
                    int mx = (int)((mousePos.x/pixelsize)-(bordersize/pixelsize));
                    int my = (int)((mousePos.y/pixelsize)-(bordersize/pixelsize));
                    
                    DrawPixel(mx, my, GREEN);
                }
                SetShaderValueTexture(shader, texLoc, target.texture);
                SetShaderValue(shader, GetShaderLocation(shader, "direction"), &sdirection, SHADER_UNIFORM_INT);
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