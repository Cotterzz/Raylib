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