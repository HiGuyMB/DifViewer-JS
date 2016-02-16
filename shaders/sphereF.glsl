precision highp float;

varying vec2 out_uv;
varying vec3 out_normal;

uniform sampler2D tex_diffuse;

void main() {
    gl_FragColor = texture2D(tex_diffuse, out_uv);
}
