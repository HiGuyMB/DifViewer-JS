precision highp float;

varying vec2 out_uv;
varying vec3 out_normal;

varying vec3 out_light_tangent;
varying vec3 out_direction_tangent;

uniform sampler2D tex_diffuse;
uniform sampler2D tex_normal;
uniform sampler2D tex_specular;

uniform vec4 in_light_color;
uniform vec4 in_ambient_color;
uniform vec3 in_sun_position;
uniform float in_specular_exponent;

void main(void) {
    vec3 materialColor = texture2D(tex_diffuse, out_uv).rgb;
    vec3 specularColor = texture2D(tex_specular, out_uv).rgb;
    vec3 normalColor = normalize(texture2D(tex_normal, out_uv).rgb * 2.0 - 1.0);

    vec3 n = normalize(normalColor);
    vec3 l = normalize(out_light_tangent);

    float cosTheta = clamp(dot(n, l), 0.0, 1.0);

    vec3 eye = normalize(out_direction_tangent);
    vec3 reflect_light = reflect(-l, n);
    float cosAlpha = clamp(dot(eye, reflect_light), 0.0, 1.0);

    vec3 color = materialColor * (in_light_color.rgb * in_light_color.a) * cosTheta;
    color += materialColor * in_ambient_color.rgb;
    color += specularColor * (in_light_color.rgb * in_light_color.a) * pow(cosAlpha, in_specular_exponent);

    gl_FragColor = vec4(color, 1.0);
}