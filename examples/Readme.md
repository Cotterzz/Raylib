# Examples and Experiments with Raylib

## Alternative Corner Geometry

I had an idea for a different way to construct a corner using triangles that get smaller towards the curve.
It was built as a possible workaround for this issue: https://github.com/raysan5/raylib/issues/3247
It might be preferable because it keeps the edges from converging on the centre of the curve.
It also has the advantage of being incremental - unlike a fan that needs to be completely rebuilt as you add segemts, this approach preserves the geometry and adds to it for more accuracy.
This might enable LOD to be increased as you get closer to it, or for the extra vertex calculation to be added on later frames.

## Fireballs

This is a particle effect using a quad for each particle, it allows more control over the shader, allowing different values to be passed to each particle's shader using the vertex buffer.

## Model JSON

A file format to store native Raylib models in JSON format.
Possibly making conversion from other formats easier, or to switch between formats without unpacking the file into Raylib objects.
TODO - add example shaders and textures, start writing an exporter.

## Falling Sand on the GPU

A POC to see if it could be done.
I want to build each material component separately and then see if they can be combined into a basic Noita like engine that runs on the GPU
Next step - water.

## Falling sand on the GPU, on the web

Before trying to export the sand to web via Raylib's web export, I am going to try using a WASM compiled version of Raylib and convert the code to JS
I'm not sure if it will work with shaders yet.
TODO - Convert shader from 330 to 100, also convert C to JS

## Falling water

I am going to modify the sand to it behaves like a liquid.
Also with this version I am going to introduce another texture to store non-colour data.
I may even try unpacking colour floats into four bytes so each pixel has 16 bytes available.
