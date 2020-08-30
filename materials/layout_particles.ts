export interface ParticlesLayout {
    // Uniforms
    Pv: WebGLUniformLocation;
    ColorStart: WebGLUniformLocation;
    ColorEnd: WebGLUniformLocation;
    LifespanSize: WebGLUniformLocation;
    // Attributes
    OriginAge: GLint;
    DirectionSpeed: GLint;
}
