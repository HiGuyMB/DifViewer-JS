precision highp float;

attribute vec3 in_position;
attribute vec2 in_uv;
attribute vec3 in_normal;
attribute vec3 in_tangent;
attribute vec3 in_bitangent;

varying vec2 out_uv;
varying vec3 out_normal;

varying vec3 out_light_tangent;
varying vec3 out_direction_tangent;

uniform mat4 in_projection_mat;
uniform mat4 in_view_mat;
uniform mat4 in_model_mat;

uniform vec4 in_light_color;
uniform vec4 in_ambient_color;
uniform vec3 in_sun_direction;
uniform float in_specular_exponent;

highp mat3 transpose(in highp mat3 in_matrix) {
    return mat3(
        vec3(in_matrix[0].x, in_matrix[1].x, in_matrix[2].x),
        vec3(in_matrix[0].y, in_matrix[1].y, in_matrix[2].y),
        vec3(in_matrix[0].z, in_matrix[1].z, in_matrix[2].z)
    );
}

void main(void) {
    mat4 mvp = in_projection_mat * in_view_mat * in_model_mat;
    gl_Position = mvp * vec4(in_position, 1.0);

    out_uv = in_uv;
    out_normal = in_normal;

    vec3 position_camera = (in_view_mat * in_model_mat * vec4(in_position, 1)).xyz;
    vec3 direction_camera = vec3(0, 0, 0) - position_camera;

    vec3 light_camera = -(in_view_mat * vec4(in_sun_direction, 0)).xyz;

    mat3 modelView3Mat = mat3(in_view_mat * in_model_mat);

    vec3 normal_camera = modelView3Mat * in_normal;
    vec3 tangent_camera = modelView3Mat * in_tangent;
    vec3 bitangent_camera = modelView3Mat * in_bitangent;

    mat3 tbn = transpose(mat3(tangent_camera, bitangent_camera, normal_camera));

    out_light_tangent = tbn * light_camera;
    out_direction_tangent = tbn * direction_camera;
}