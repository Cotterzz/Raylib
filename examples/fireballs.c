#include <stdio.h>
#include <stdlib.h>
#include "raylib.h"

#define MAX_FIREBALLS    5000

Mesh fireBallMesh;

typedef struct Fireball {
    Vector2 position;
    Vector2 velocity;
    Color color;
    float size;
} Fireball;

static void CopyColorsToMesh(Fireball f[], unsigned char m[]);
static void CopyVerticesToMesh(Fireball f[], float m[]);
static void SetTexcoordsToMesh(float m[]);
SUPPORT_GIF_RECORDING=true;
int main(void)
{
    // Begin
    const int screenWidth = 800;
    const int screenHeight = 800;

    InitWindow(screenWidth, screenHeight, "Window Title");
    
    Fireball *fireBalls = (Fireball *)malloc(MAX_FIREBALLS*sizeof(Fireball));
    
    // Load basic lighting shader
    Shader shader = LoadShader("fireballs.vs", "fireballs.fs");
    // Define the camera to look into our 3d world
    Camera camera = { 0 };
    camera.position = (Vector3){ 0.0f, 0.0f, 5.0f };  // Camera position
    camera.target = (Vector3){ 0.0f, 0.0f, 0.0f };      // Camera looking at point
    camera.up = (Vector3){ 0.0f, 1.0f, 0.0f };          // Camera up vector (rotation towards target)
    camera.fovy = 50.0f;                                // Camera field-of-view Y
    camera.projection = CAMERA_ORTHOGRAPHIC;             // Camera mode type
    //camera.projection = CAMERA_PERSPECTIVE;
    // Model drawing position
    Vector3 position = { 0.0f, 0.0f, 0.0f };

    SetTargetFPS(60);
    for (int i = 0; i < MAX_FIREBALLS; i++)
    {
        fireBalls[i].position.x = 0;//(float)GetRandomValue(-2000.0f, 2000.0f)/1000;
        fireBalls[i].position.y = 0;//(float)GetRandomValue(-2000.0f, 2000.0f)/1000;
        fireBalls[i].velocity.x = 0;//(float)GetRandomValue(-3, 3)/50.0f;
        fireBalls[i].velocity.y = 0;//(float)GetRandomValue(-3, 3)/50.0f;
        int colortotal = GetRandomValue(200, 765);
        int colorblue = (colortotal>510) ? colortotal-510 : 0;
        int colorgreen = (colortotal>255) ? colortotal-255-colorblue : 0;
        int colorred = (colortotal<256) ? colortotal : 255;
        fireBalls[i].color = (Color){ colorred,colorgreen,colorblue, 255 };
        fireBalls[i].size = (float)GetRandomValue(4, 20)/10.0f;
    }
    Mesh fireBallMesh = { 0 };
    fireBallMesh.triangleCount = MAX_FIREBALLS * 2;  // 2 triangles per quad
    fireBallMesh.vertexCount = fireBallMesh.triangleCount * 3;  // 6 vertices per quad
    fireBallMesh.vertices = (float *)MemAlloc(fireBallMesh.vertexCount * 3 * sizeof(float));    // 3 vertices, 3 coordinates each (x, y, z)
    fireBallMesh.texcoords = (float *)MemAlloc(fireBallMesh.vertexCount * 2 * sizeof(float));   // 3 vertices, 2 coordinates each (x, y)
    fireBallMesh.colors = (unsigned char *)MemAlloc(fireBallMesh.vertexCount * 4 * sizeof(unsigned char));     // 3 vertices, 3 coordinates each (x, y, z)

    CopyColorsToMesh(fireBalls, fireBallMesh.colors);
    CopyVerticesToMesh(fireBalls, fireBallMesh.vertices);
    SetTexcoordsToMesh(fireBallMesh.texcoords);

    UploadMesh(&fireBallMesh, false);
    
    Model fireBallModel = LoadModelFromMesh(fireBallMesh);
    fireBallModel.materials[0].shader = shader;
    // Main loop
    while (!WindowShouldClose())
    {

        BeginDrawing();

            ClearBackground(BLACK);
            BeginMode3D(camera);

               DrawModel(fireBallModel, position, 1.0f, WHITE);

            EndMode3D();
            DrawFPS(10, 10);
        EndDrawing();
        
        for (int i = 0; i < MAX_FIREBALLS; i++)
        {
            fireBalls[i].position.x += fireBalls[i].velocity.x;
            fireBalls[i].position.y += fireBalls[i].velocity.y;
            fireBalls[i].velocity.x +=(float)GetRandomValue(-1, 1)/500.0f;
            fireBalls[i].velocity.y +=(float)GetRandomValue(-1, 1)/500.0f;
            if (((fireBalls[i].position.x + fireBalls[i].size/2) > 22) ||
                ((fireBalls[i].position.x + fireBalls[i].size/2) < -22)) fireBalls[i].velocity.x *= -1;
            if (((fireBalls[i].position.y + fireBalls[i].size/2) > 22) ||
                ((fireBalls[i].position.y + fireBalls[i].size/2) < -22)) fireBalls[i].velocity.y *= -1;
            
        float trisize = fireBalls[i].size;
        float trix = fireBalls[i].position.x;
        float triy = fireBalls[i].position.y;
        int tri = i * 18;
        // first triangle (lower-left, upper-left, upper-right)
        // first vertex
        fireBallMesh.vertices[tri] = trix;
        fireBallMesh.vertices[tri + 1] = triy;
        fireBallMesh.vertices[tri + 2] = 0;
        // second vertex
        fireBallMesh.vertices[tri + 3] = trix + trisize;
        fireBallMesh.vertices[tri + 4] = triy;
        fireBallMesh.vertices[tri + 5] = 0;
        // third vertex
        fireBallMesh.vertices[tri + 6] = trix;
        fireBallMesh.vertices[tri + 7] = triy + trisize;
        fireBallMesh.vertices[tri + 8] = 0;
        // first vertex (same as first triangle)
        fireBallMesh.vertices[tri + 9] = trix + trisize;
        fireBallMesh.vertices[tri + 10] = triy + trisize;
        fireBallMesh.vertices[tri + 11] = 0;
        // second vertex (same as third vertex of first triangle)
        fireBallMesh.vertices[tri + 12] = trix;
        fireBallMesh.vertices[tri + 13] = triy + trisize;
        fireBallMesh.vertices[tri + 14] = 0;
        // third vertex
        fireBallMesh.vertices[tri + 15] = trix + trisize;
        fireBallMesh.vertices[tri + 16] = triy;
        fireBallMesh.vertices[tri + 17] = 0;
        }
        UpdateMeshBuffer(fireBallMesh, 0, fireBallMesh.vertices, sizeof(float) * fireBallMesh.vertexCount * 3, 0);
    }

    // End
    free(fireBalls);
    UnloadModel(fireBallModel);
    CloseWindow();
    return 0;
}

static void SetTexcoordsToMesh(float m[]){
    for (int i = 0; i < MAX_FIREBALLS; i++)
    {

        int di = i * 12;

        m[di] = 0;
        m[di + 1] = 0;
        
        m[di + 2] = 1;
        m[di + 3] = 0;
        
        m[di + 4] = 0;
        m[di + 5] = 1;
                
        m[di + 6] = 1;
        m[di + 7] = 1;
                        
        m[di + 8] = 0;
        m[di + 9] = 1;

        m[di + 10] = 1;
        m[di + 11] = 0;
    }
}

static void CopyVerticesToMesh(Fireball f[], float m[]){
        for (int i = 0; i < MAX_FIREBALLS; i++)
    {
        float trisize = f[i].size;
        float trix = f[i].position.x;
        float triy = f[i].position.y;
        int tri = i * 18;
        // first triangle (lower-left, upper-left, upper-right)
        // first vertex
        m[tri] = trix;
        m[tri + 1] = triy;
        m[tri + 2] = 0;
        // second vertex
        m[tri + 3] = trix + trisize;
        m[tri + 4] = triy;
        m[tri + 5] = 0;
        // third vertex
        m[tri + 6] = trix;
        m[tri + 7] = triy + trisize;
        m[tri + 8] = 0;
        // second triangle (lower-left, upper-right, lower-right)
        // first vertex (same as first triangle)
        m[tri + 9] = trix + trisize;
        m[tri + 10] = triy + trisize;
        m[tri + 11] = 0;
        // second vertex (same as third vertex of first triangle)
        m[tri + 12] = trix;
        m[tri + 13] = triy + trisize;
        m[tri + 14] = 0;
        // third vertex
        m[tri + 15] = trix + trisize;
        m[tri + 16] = triy;
        m[tri + 17] = 0;

    }
}

static void CopyColorsToMesh(Fireball f[], unsigned char m[]){
        for (int i = 0; i < MAX_FIREBALLS; i++)
    {
        int ci = i * 24;
        m[ci] = f[i].color.r;
        m[ci+1] = f[i].color.g;
        m[ci+2] = f[i].color.b;
        m[ci+3] = f[i].color.a;
        m[ci+4] = f[i].color.r;
        m[ci+5] = f[i].color.g;
        m[ci+6] = f[i].color.b;
        m[ci+7] = f[i].color.a;
        m[ci+8] = f[i].color.r;
        m[ci+9] = f[i].color.g;
        m[ci+10] = f[i].color.b;
        m[ci+11] = f[i].color.a;
        m[ci+12] = f[i].color.r;
        m[ci+13] = f[i].color.g;
        m[ci+14] = f[i].color.b;
        m[ci+15] = f[i].color.a;
        m[ci+16] = f[i].color.r;
        m[ci+17] = f[i].color.g;
        m[ci+18] = f[i].color.b;
        m[ci+19] = f[i].color.a;
        m[ci+20] = f[i].color.r;
        m[ci+21] = f[i].color.g;
        m[ci+22] = f[i].color.b;
        m[ci+23] = f[i].color.a;
    }
}