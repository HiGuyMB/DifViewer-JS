precision highp float;

attribute vec3 in_position;

varying vec3 out_position;

uniform mat4 in_projection_mat;
uniform mat4 in_view_mat;

void main() {
	out_position = in_position;

	gl_Position = in_projection_mat * mat4(mat3(in_view_mat)) * vec4(in_position, 1);
}
