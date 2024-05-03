#  SetShaderValue

```c
void SetShaderValue(Shader shader, int locIndex, const void *value, int uniformType); // Set shader uniform value
```

Sets a uniform value in a shader. Needs to be set before BeginShaderMode(). Cannot be set again until after EndShaderMode()

For example, if you wanted to pass the time to a shader, you'd have this line in the shader to receive the value:

```c
uniform float timepassed;
```

In your regular C code, these two lines will get the time and pass it to the shader:

```c
float fTime = GetTime();
SetShaderValue(shader, GetShaderLocation(shader, "timepassed"), &fTime, SHADER_UNIFORM_FLOAT);
```
We store the time in the float **'fTime'**

**'shader'** is the identifier of the shader

**GetShaderLocation(shader, "timepassed")** returns the location of the uniform we're passing

**&fTime** is the memory address of the fTime variable

**SHADER_UNIFORM_FLOAT** is the variable type.
