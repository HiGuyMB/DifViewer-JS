precision highp float;

varying vec3 out_position;

uniform sampler2D tex_front;
uniform sampler2D tex_back;

//Because radians
#define PI 3.14159265
#define TWO_PI 6.2831853

void main() {
	//Theta is XY angle (horizontal)
	float theta = atan(out_position.y, out_position.x);
	//Alpha is XY / Z angle (vertical), adjacent = xy, opposite = z
	float alpha = atan(length(out_position.xy), out_position.z);

	//Normalize into a vec2
	vec2 sky_uv = vec2((theta + PI) / TWO_PI, -alpha / PI);

	vec4 front_color = texture2D(tex_front, sky_uv);
	vec4 back_color = texture2D(tex_back, sky_uv);

	//Show clouds in front
	gl_FragColor = mix(front_color, back_color, back_color.a);
}
