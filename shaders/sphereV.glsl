precision highp float;

attribute vec3 in_position;
attribute vec2 in_uv;
attribute vec3 in_normal;

varying vec2 out_uv;
varying vec3 out_normal;

uniform mat4 in_projection_mat;
uniform mat4 in_view_mat;
uniform mat4 in_model_mat;

void main() {
    mat4 mvp = in_projection_mat * in_view_mat * in_model_mat;
    gl_Position = mvp * vec4(in_position, 1.0);

    out_uv = in_uv;
    out_normal = in_normal;
}
