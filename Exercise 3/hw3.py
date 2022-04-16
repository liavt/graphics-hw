from helper_classes import *
import math
import matplotlib.pyplot as plt

def get_color_from_ray(ray, ambient, lights, objects, remaining_reflects):
    dis, obj, normal = ray.nearest_intersected_object(objects)
    if dis is None:
        return ambient
    else:
        # where the ray hits the object
        intersection = ray.origin + (dis * ray.direction)

        diffuse = 0
        specular = 0

        for light in lights:
            light_ray = light.get_light_ray(intersection)
            # check that nothing occludes this light
            visible = light_ray.reverse().nearest_intersected_object(objects) is None
            if visible:
                intensity = light.get_intensity(intersection)
                diffuse += intensity * max(0, normal @ -light_ray.direction)

                reflect = reflected(light_ray, normal)
                specular += intensity * pow(max(0, reflect @ -ray.direction), obj.shininess)

        reflection = 0
        # save performance, if its not reflective dont bother calculating this
        if obj.reflect > 0 and remaining_reflects > 0:
            reflection = get_color_from_ray(reflected(ray, normal), ambient, lights, objects, remaining_reflects - 1)

        color = (obj.ambient * ambient) + (obj.diffuse * diffuse) + (obj.specular * specular) + (obj.reflect * reflection)
        # We clip the values between 0 and 1 so all pixel values will make sense.


def get_ray_for_camera_pixel(camera, width, height, pixel):
    converted = 2 * ((pixel + 0.5) / np.array([width, height]))
    return Ray(origin=[0,0,0], direction=normalize([converted[0] - 1, 1 - converted[1]]))

def render_scene(camera, ambient, lights, objects, screen_size, max_depth):
    width, height = screen_size
    ratio = float(width) / height
    screen = (-1, 1 / ratio, 1, -1 / ratio)  # left, top, right, bottom

    image = np.zeros((height, width, 3))

    for i, y in enumerate(range(height)):
        for j, x in enumerate(range(width)):
            ray = get_ray_for_camera_pixel(camera, width, height, np.array([x, y]))
            image[i, j] = np.clip(get_color_from_ray(ray, ambient, lights, objects, max_depth), 0, 1)

    return image


# Write your own objects and lights
# TODO
def your_own_scene():
    camera = np.array([0,0,1])
    lights = []
    objects = []
    return camera, lights, objects

