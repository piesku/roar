export interface TexturedUnlitLayout {
    // Uniforms
    Pv: WebGLUniformLocation;
    World: WebGLUniformLocation;
    Color: WebGLUniformLocation;
    Sampler: WebGLUniformLocation;
    TexScale: WebGLUniformLocation;
    TexOffset: WebGLUniformLocation;
    // Attributes
    VertexPosition: GLint;
    VertexTexCoord: GLint;
}
