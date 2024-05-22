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
    gl_FragColor = vec4(vec3(texture2D(texture1, vec2(gl_FragCoord / 512.0))), 1.0);
}