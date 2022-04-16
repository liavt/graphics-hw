from helper_classes import *
import math
import matplotlib.pyplot as plt

# we add a little bit of bias to make the intersection "above" the surface when we reflect and refract
# otherwise it may immediately intersect with the object it came from
BIAS = 1e-4

def reflect_ray(ray, normal):
    return Ray(ray.origin + (normal * BIAS), reflected(ray.direction, normal))

def refract_ray(ray, normal, refract_index):
    cosi = -(normal @ ray.direction)
    k = 1 - refract_index * refract_index * (1 - cosi * cosi)
    return Ray(ray.origin - (normal * BIAS),
               normalize(ray.direction * refract_index + normal * (refract_index * cosi - math.sqrt(k))))

def get_color_from_ray(ray, ambient, lights, objects, remaining_reflects):
    dis, obj, normal = ray.nearest_intersected_object(objects)
    if dis is None:
        return ambient
    else:
        # where the ray hits the object
        intersection = ray.origin + (dis * ray.direction)

        diffuse = 0
        specular = 0

        light_rays = [light.get_light_ray(intersection) for light in lights]
        visible_light_idx = [i for i in range(len(light_rays)) if light_rays[i].reverse().nearest_intersected_object(objects) is None]
        visible_light_rays = light_rays[visible_light_idx]
        visible_lights = lights[visible_light_idx]
        visible_light_intensities = [light.get_intensity(intersection) for light in visible_lights]
        
        '''
        for light in lights:
            light_ray = light.get_light_ray(intersection)
            # check that nothing occludes this light
            visible = light_ray.reverse().nearest_intersected_object(objects) is None
            if visible:
                intensity = light.get_intensity(intersection)
                diffuse += intensity * max(0, normal @ -light_ray.direction)

                reflect = reflected(light_ray.direction, normal)
                specular += intensity * pow(max(0, reflect @ -ray.direction), obj.shininess)
        '''

        reflection = 0
        refraction = 0
        # do we have any remaining recursive raytraces?
        if remaining_reflects > 0:
            # save performance, if its not reflective dont bother calculating this
            if obj.reflect > 0:
                reflection = get_color_from_ray(reflect_ray(ray, normal), ambient, lights, objects,
                                                remaining_reflects - 1)
            if obj.trasparency > 0:
                refraction = get_color_from_ray(refract_ray(ray, normal, obj.refraction_index), ambient, lights, obj, remaining_reflects - 1)

        color = (obj.ambient * ambient) + (obj.diffuse * diffuse) \
                + (obj.specular * specular) + (obj.reflect * reflection) + (obj.transparency * refraction)


def get_ray_for_camera_pixel(camera, width, height, pixel):
    converted = 2 * ((pixel + 0.5) / np.array([width, height]))
    return Ray(origin=[0, 0, 0], direction=normalize([converted[0] - 1, 1 - converted[1]]))


def render_scene(camera, ambient, lights, objects, screen_size, max_depth):
    width, height = screen_size
    ratio = float(width) / height
    screen = (-1, 1 / ratio, 1, -1 / ratio)  # left, top, right, bottom

    image = np.zeros((height, width, 3))

    for i, y in enumerate(range(height)):
        for j, x in enumerate(range(width)):
            ray = get_ray_for_camera_pixel(camera, width, height, np.array([x, y]))
            # We clip the values between 0 and 1 so all pixel values will make sense.
            image[i, j] = np.clip(get_color_from_ray(ray, ambient, lights, objects, max_depth), 0, 1)

    return image


# Write your own objects and lights
# TODO
def your_own_scene():
    camera = np.array([0, 0, 1])
    lights = []
    objects = []
    return camera, lights, objects
