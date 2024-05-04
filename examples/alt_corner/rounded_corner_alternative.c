/*******************************************************************************************
*
*   alternative corner geometry example by John Cotterell aka Cotterzz
*   adapted from 'procedural mesh generation' example by Ramon Santamaria
*   
*   Example originally created with raylib 1.8, last time updated with raylib 4.0
*
*   Example licensed under an unmodified zlib/libpng license, which is an OSI-certified,
*   BSD-like license that allows static linking with closed source software
*
*   Copyright (c) 2017-2024 Ramon Santamaria (@raysan5)
*
********************************************************************************************/

#include "raylib.h"
#include <math.h>
#include <stdio.h>
#define NUM_MODELS  9               // Parametric 3d shapes to generate
SUPPORT_GIF_RECORDING=true;
static Mesh GenMeshCorner(int);

struct Point {
    double x;
    double y;
};
//------------------------------------------------------------------------------------
// Program main entry point
//------------------------------------------------------------------------------------
int main(void)
{
    SetConfigFlags(FLAG_MSAA_4X_HINT);
    // Initialization
    //--------------------------------------------------------------------------------------
    const int screenWidth = 800;
    const int screenHeight = 450;

    InitWindow(screenWidth, screenHeight, "raylib [models] example - mesh generation");


    Model models[NUM_MODELS] = { 0 };
    
    models[0] = LoadModelFromMesh(GenMeshCorner(1));
    models[1] = LoadModelFromMesh(GenMeshCorner(2));
    models[2] = LoadModelFromMesh(GenMeshCorner(4));
    models[3] = LoadModelFromMesh(GenMeshCorner(8));
    models[4] = LoadModelFromMesh(GenMeshCorner(16));
    models[5] = LoadModelFromMesh(GenMeshCorner(32));
    models[6] = LoadModelFromMesh(GenMeshCorner(64));
    models[7] = LoadModelFromMesh(GenMeshCorner(128));
    models[8] = LoadModelFromMesh(GenMeshCorner(256));

 

    // Set checked texture as default diffuse component for all models material
    //for (int i = 0; i < NUM_MODELS; i++) models[i].materials[0].maps[MATERIAL_MAP_DIFFUSE].texture = texture;

    // Define the camera to look into our 3d world
    Camera camera = { { 5.0f, 5.0f, 5.0f }, { 0.0f, 0.0f, 0.0f }, { 0.0f, 1.0f, 0.0f }, 45.0f, 0 };

    // Model drawing position
    Vector3 position = { 0.0f, 0.0f, 0.0f };

    int currentModel = 0;

    SetTargetFPS(60);               // Set our game to run at 60 frames-per-second
    //--------------------------------------------------------------------------------------

    // Main game loop
    while (!WindowShouldClose())    // Detect window close button or ESC key
    {
        // Update
        //----------------------------------------------------------------------------------
        UpdateCamera(&camera, CAMERA_THIRD_PERSON );

        if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT))
        {
            currentModel = (currentModel + 1)%NUM_MODELS; // Cycle between the textures
        }

        if (IsKeyPressed(KEY_RIGHT))
        {
            currentModel++;
            if (currentModel >= NUM_MODELS) currentModel = 0;
        }
        else if (IsKeyPressed(KEY_LEFT))
        {
            currentModel--;
            if (currentModel < 0) currentModel = NUM_MODELS - 1;
        }
        //----------------------------------------------------------------------------------

        // Draw
        //----------------------------------------------------------------------------------
        BeginDrawing();

            ClearBackground(RAYWHITE);

            BeginMode3D(camera);

               DrawModel(models[currentModel], position, 1.0f, WHITE);
               DrawGrid(10, 1.0);

            EndMode3D();

            DrawRectangle(30, 400, 310, 30, Fade(SKYBLUE, 0.5f));
            DrawRectangleLines(30, 400, 310, 30, Fade(DARKBLUE, 0.5f));
            DrawText("MOUSE LEFT BUTTON to CYCLE PROCEDURAL MODELS", 40, 410, 10, BLUE);

            switch(currentModel)
            {
                case 0: DrawText("1 Segment", 680, 10, 20, DARKBLUE); break;
                case 1: DrawText("2 Segments", 680, 10, 20, DARKBLUE); break;
                case 2: DrawText("4 Segments", 680, 10, 20, DARKBLUE); break;
                case 3: DrawText("8 Segments", 640, 10, 20, DARKBLUE); break;
                case 4: DrawText("16 Segments", 680, 10, 20, DARKBLUE); break;
                case 5: DrawText("32 Segments", 680, 10, 20, DARKBLUE); break;
                case 6: DrawText("64 Segments", 680, 10, 20, DARKBLUE); break;
                case 7: DrawText("128 Segments", 680, 10, 20, DARKBLUE); break;
                case 8: DrawText("256 Segments", 580, 10, 20, DARKBLUE); break;
                default: break;
            }

        EndDrawing();
        //----------------------------------------------------------------------------------
    }

    // De-Initialization
    //--------------------------------------------------------------------------------------
    //UnloadTexture(texture); // Unload texture

    // Unload models data (GPU VRAM)
    for (int i = 0; i < NUM_MODELS; i++) UnloadModel(models[i]);

    CloseWindow();          // Close window and OpenGL context
    //--------------------------------------------------------------------------------------

    return 0;
}
static Mesh GenMeshCorner(int segments)
{
    bool highlight = false; // Red/green highlighting of different segment layers.
    
    // make sure segments is a positive power of 2.
    if (segments<1){ segments=1;}
    unsigned int msb = 1;
    while (segments > msb) { msb <<= 1; }
    if (segments != msb) { segments = (segments - msb >= msb / 2) ? msb  : msb << 1; }
    
    // get the points from the curve
    int num_points = segments+1;
    double radius = 0.1;
    struct Point points[num_points];
    double angle_increment = 3.14159265358979323846264338327950288 / 2 / (num_points - 1); // Angle between points
    for (int i = 0; i < num_points; i++) {
        double angle = i * angle_increment;
        points[i].x = radius * cos(angle); 
        points[i].y = radius * sin(angle); 
    }
    
    // set up mesh
    Mesh mesh = { 0 };
    mesh.triangleCount = segments;
    mesh.vertexCount = mesh.triangleCount*3;
    mesh.vertices = (float *)MemAlloc(mesh.vertexCount*3*sizeof(float));
    mesh.colors = (unsigned char *)MemAlloc(mesh.vertexCount * 4 * sizeof(unsigned char));
    
    // triangle 1
    int v = 0;
    mesh.vertices[v+0] = 0;
    mesh.vertices[v+1] = 0;
    mesh.vertices[v+2] = 0;
    mesh.vertices[v+3] = 0;
    mesh.vertices[v+4] = 0;
    mesh.vertices[v+5] = radius;
    mesh.vertices[v+6] = radius;
    mesh.vertices[v+7] = 0;
    mesh.vertices[v+8] = 0;
    int c = 0;
    Color vc = BLACK;
    if(highlight){vc=GREEN;}
    mesh.colors[c+0] = vc.r;
    mesh.colors[c+1] = vc.g;
    mesh.colors[c+2] = vc.b;
    mesh.colors[c+3] = vc.a;
    mesh.colors[c+4] = vc.r;
    mesh.colors[c+5] = vc.g;
    mesh.colors[c+6] = vc.b;
    mesh.colors[c+7] = vc.a;
    mesh.colors[c+8] = vc.r;
    mesh.colors[c+9] = vc.g;
    mesh.colors[c+10] = vc.b;
    mesh.colors[c+11] = vc.a;
    if(highlight){vc=RED;}
    // if only one segment, end here
    if (segments==1){
       UploadMesh(&mesh, false);
       return mesh;
    }
    
    // set up loop for remaining triangles
    int segstep = segments/2;
    int segstart = 0;
    while (segstep>0){
        int pointA = segstart;
        int pointC = segstart+segstep;
        int pointB = pointC+segstep;  // We switch C and B so the triangle is clockwise.
        
        // triangle
    v += 9;
    mesh.vertices[v+0] = points[pointA].x;
    mesh.vertices[v+2] = points[pointA].y;
    mesh.vertices[v+1] = 0;
    mesh.vertices[v+3] = points[pointB].x;
    mesh.vertices[v+5] = points[pointB].y;
    mesh.vertices[v+4] = 0;
    mesh.vertices[v+6] = points[pointC].x;
    mesh.vertices[v+8] = points[pointC].y;
    mesh.vertices[v+7] = 0;
    c += 12;
    
    mesh.colors[c+0] = vc.r;
    mesh.colors[c+1] = vc.g;
    mesh.colors[c+2] = vc.b;
    mesh.colors[c+3] = vc.a;
    mesh.colors[c+4] = vc.r;
    mesh.colors[c+5] = vc.g;
    mesh.colors[c+6] = vc.b;
    mesh.colors[c+7] = vc.a;
    mesh.colors[c+8] = vc.r;
    mesh.colors[c+9] = vc.g;
    mesh.colors[c+10] = vc.b;
    mesh.colors[c+11] = vc.a;
        
        if(pointB == segments) {
            segstart = 0;
            if(highlight){if(vc.r==0){vc = RED;} else {vc = GREEN;}}
            if(segstep>1){
                segstep /=2;
                
            } else {
                segstep = 0;
            }
        } else {
            segstart = pointB;
        }
    }
    UploadMesh(&mesh, false);
    return mesh;
}
