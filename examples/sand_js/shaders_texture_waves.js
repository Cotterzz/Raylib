const GLSL_VERSION = 100

const screenWidth = 800
const screenHeight = 450

let texture
let shader
let waves
let screenimage

const InitGame = async () => {
  InitWindow(screenWidth, screenHeight, "raylib [shaders] example - texture waves")
  texture = await LoadTexture("space.png")
  
  // TODO: file-load is not setup for LoadShader
  await addFile(`wave${GLSL_VERSION}.fs`, 'wave.fs')
  shader = LoadShader(0, 'wave.fs')
  
  target = new RenderTexture2D(LoadRenderTexture(screenWidth, screenHeight));
      BeginTextureMode(target);
        //ClearBackground(BLACK);
    EndTextureMode();

  waves = {
    size: new UniformVector2(shader, 'size'),
    seconds: new UniformFloat(shader, 'secondes'),
    freqX: new UniformFloat(shader, 'freqX'),
    freqY: new UniformFloat(shader, 'freqY'),
    ampX: new UniformFloat(shader, 'ampX'),
    ampY: new UniformFloat(shader, 'ampY'),
    speedX: new UniformFloat(shader, 'speedX'),
    speedY: new UniformFloat(shader, 'speedY')
  }

  waves.size.x = screenWidth
  waves.size.y = screenHeight
  waves.seconds.value = 0
  waves.freqX.value = 25.0
  waves.freqY.value = 25.0
  waves.ampX.value = 5.0
  waves.ampY.value = 5.0
  waves.speedX.value = 8.0
  waves.speedY.value = 8.0
}

const UpdateGame = (ts) => {
  waves.seconds.value += GetFrameTime()
  BeginDrawing()
  ClearBackground(RAYWHITE)
  BeginShaderMode(shader)
  DrawTexture(texture, 0, 0, WHITE)
  DrawTexture(texture, texture.width, 0, WHITE)
  EndShaderMode()
  EndDrawing()
  screenimage = LoadImageFromScreen();
  texture = LoadTextureFromImage(screenimage);
  free(screenimage);
}