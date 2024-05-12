
const screenWidth = 512;
const screenHeight = screenWidth;
let shader, shaderText, position, IterationsPerFrame, CurrentIteration, texLoc, target, drawRec, drawVec, fTime;

const InitGame = async () => {
    InitWindow(screenWidth, screenHeight);//, "Falling Sand");
    
    shaderText =  await LoadFileText("sand_es.frag")
    shader = await LoadShaderFromMemory(0, shaderText);
    console.log(shaderText);
    position = new Vector3({x: -0.5, y: -0.5, z: 0.0 });
    SetTargetFPS(60);
    IterationsPerFrame = 1;
    CurrentIteration = 0;
    texLoc = GetShaderLocation(shader, "texture1");
    target = new RenderTexture2D(LoadRenderTexture(screenWidth, screenHeight));
    SetShaderValueTexture(shader, texLoc, target.texture);
    SetShaderValue(shader, GetShaderLocation(shader, "screensize"), screenWidth, SHADER_UNIFORM_INT);
    BeginTextureMode(target);
        ClearBackground(BLACK);
    EndTextureMode();
    drawRec = new Rectangle({ x: 0, y: 0, width: target.texture.width, height: -target.texture.height });
    drawVec = new Vector2({x:0,y:0});
}

const UpdateGame = (ts) => {
    const p = GetMousePosition()
    BeginTextureMode(target);
    while (CurrentIteration<IterationsPerFrame)
    {
        CurrentIteration+=1;
        BeginShaderMode(shader);
            DrawTextureRec(target.texture, drawRec, drawVec, WHITE);
        EndShaderMode();
        if (IsMouseButtonDown(MOUSE_BUTTON_LEFT) ){DrawCircle(p.x, p.y, 1, YELLOW);}
        if (IsMouseButtonDown(MOUSE_BUTTON_RIGHT) ){DrawCircle(p.x, p.y, 1, BLACK);}
        SetShaderValueTexture(shader, texLoc, target.texture);
        fTime = GetTime();
        SetShaderValue(shader, GetShaderLocation(shader, "timepassed"), fTime, SHADER_UNIFORM_FLOAT);
    }
    CurrentIteration=0;
    EndTextureMode();
    BeginDrawing();
        ClearBackground(WHITE);
        DrawTextureRec(target.texture, drawRec, drawVec, WHITE);
        DrawFPS(10, 10);
    EndDrawing();
}