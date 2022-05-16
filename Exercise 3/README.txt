Hello, hope you have a good grading. Please enjoy our ray tracer

Critical changes made:
The cell for scene 6 has a value for the ambient set because the signature in the code is wrong
Instead of loading an OBJ file and then transforming it in the notebook we embedded the final values as an array in cell 6
Our scene for scene 6 is a beautiful island in the pacific ocean that is being patrolled by a giant demonic eyeball, looking for any monkeys (not pictured) to eat
As the monkey is not present on this particular island, the eyeball is mad and glows a red light in anger
The scene demonstrates usage of many objects in tandem, including multiple OBJ files (such as the leaves and trunk)
A directional and spot light
The moon itself is a crescent moon but also by using the occluder value of the renderer, does not cast a shadow
The custom added emission value is tuned to make the lighting appropriate on places that don't have lighting

Object3D has backward-compatible changes made to it, it has a set_occluder function which sets whether an object can cast shadow (used for the moon in scene 6)
set_material has additional (but default for backward-compatible with existing cells) values for an emission color, transparency, and refraction index
An additional function called get_coefficients was added for use in lighting

render_scene_blinn is the bonus for Blinn-Phong

Refraction is programmed by having a transparent object

load_obj loads an OBJ file from the disk and returns an Object3D

Liav Turkia 323081950
Ilana Sivan 205634272
