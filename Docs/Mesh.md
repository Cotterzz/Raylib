# Mesh
```c
struct Mesh; // Mesh, vertex data and vao/vbo
```
The Mesh struct is the one of the components of a Model (along with materials and animation data) for use in 3D rendering:

```mermaid
graph LR
X[Vertices] --> A(Mesh)
Y[TexCoords] ---> A(Mesh)
V[Colors] --> A(Mesh) 
Z[TexCoords2] ---> A(Mesh)
A(Mesh) --> D[Model]
B(Material) --> D[Model]
C(ModelAnimation) --> D[Model]
E(Shader) --> B(Material)
F(Texture) --> B(Material)
G(.vs) --> E(Shader)
H(.fs) --> E(Shader)
```
It contains a set of Arrays, some of which act as Vertex Buffer Objects (VBOs) when uploaded to the GPU.

This is the definition in Raylib.h
```c
// Mesh, vertex data and vao/vbo
typedef struct Mesh {
    int vertexCount;        // Number of vertices stored in arrays
    int triangleCount;      // Number of triangles stored (indexed or not)

    // Vertex attributes data
    float *vertices;        // Vertex position (XYZ - 3 components per vertex) (shader-location = 0)
    float *texcoords;       // Vertex texture coordinates (UV - 2 components per vertex) (shader-location = 1)
    float *texcoords2;      // Vertex texture second coordinates (UV - 2 components per vertex) (shader-location = 5)
    float *normals;         // Vertex normals (XYZ - 3 components per vertex) (shader-location = 2)
    float *tangents;        // Vertex tangents (XYZW - 4 components per vertex) (shader-location = 4)
    unsigned char *colors;      // Vertex colors (RGBA - 4 components per vertex) (shader-location = 3)
    unsigned short *indices;    // Vertex indices (in case vertex data comes indexed)

    // Animation vertex data
    float *animVertices;    // Animated vertex positions (after bones transformations)
    float *animNormals;     // Animated normals (after bones transformations)
    unsigned char *boneIds; // Vertex bone ids, max 255 bone ids, up to 4 bones influence by vertex (skinning)
    float *boneWeights;     // Vertex bone weight, up to 4 bones influence by vertex (skinning)

    // OpenGL identifiers
    unsigned int vaoId;     // OpenGL Vertex Array Object id
    unsigned int *vboId;    // OpenGL Vertex Buffer Objects id (default vertex data)
} Mesh;
```
