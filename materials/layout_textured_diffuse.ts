export interface TexturedDiffuseLayout {
    // Uniforms
    Pv: WebGLUniformLocation;
    World: WebGLUniformLocation;
    Self: WebGLUniformLocation;
    Color: WebGLUniformLocation;
    EyePosition: WebGLUniformLocation;
    FogDistance: WebGLUniformLocation;
    FogLevel: WebGLUniformLocation;
    Sampler: WebGLUniformLocation;
    LightPositions: WebGLUniformLocation;
    LightDetails: WebGLUniformLocation;
    // Attributes
    VertexPosition: GLint;
    VertexTexCoord: GLint;
    VertexNormal: GLint;
}
