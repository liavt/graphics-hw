import numpy as np

from helper_classes import *
import math
import itertools as it
import numba

# Contains information about a scene including camera light and objects
class Scene:
    def __init__(self, camera, ambient, lights, objects, resolution):
        self.resolution = resolution
        self.camera = camera
        v_up = normalize([0, 1, 1])
        self.v_right = normalize(np.cross(-camera, v_up))
        self.v_up_hat = normalize(np.cross(self.v_right, -camera))
        self.ambient = ambient
        self.lights = lights
        self.objects = objects

    def get_ray_for_camera_pixel(self, pixel):
        return Ray(self.camera, normalize(pixel - self.camera))

    def get_color_from_ray(self, ray, lighting_func, remaining_reflects):
        dis, obj, normal = ray.nearest_intersected_object(self.objects)
        if dis < 0 or dis >= math.inf:
            return np.zeros(3)
        else:
            # where the ray hits the object
            return lighting_func((dis,obj,normal), ray, self, remaining_reflects)

    def render(self, lighting_func, max_depth):
        width, height = self.resolution
        ratio = float(width) / height
        screen = (-1, 1 / ratio, 1, -1 / ratio)  # left, top, right, bottom

        idx = it.product(np.linspace(screen[1], screen[3], height), np.linspace(screen[0], screen[2], width))
        rays = [self.get_ray_for_camera_pixel([coords[1],coords[0],0]) for coords in idx]
        intersections = np.array([[obj.intersect(ray) for obj in self.objects] for ray in rays], dtype='object')
        found_objects_idx = np.argmin(intersections[:, :, 0], axis=1)

        intersections = [intersections[i,found] for i,found in enumerate(found_objects_idx)]

        # do you consent
        img = np.apply_along_axis(lambda o: lighting_func(o[1], rays[o[0]], self, max_depth), 1, list(enumerate(intersections)))

        return np.clip(np.array(list(img)), 0, 1).reshape((height, width, 3))

#numbajit
def compute_recursive_colors(lighting_func, obj, normal, intersection, ray, scene, depth):
    reflection = 0
    refraction = 0
    # do we have any remaining recursive raytraces?
    if depth > 0:
        # save performance, if its not reflective dont bother calculating this
        if obj.reflection > 0:
            reflection = scene.get_color_from_ray(ray.reflect(intersection, normal), lighting_func, depth)
        if obj.transparency > 0:
            refraction = scene.get_color_from_ray(ray.refract(intersection, normal, obj.refraction_index), lighting_func, depth)
    return reflection, refraction


def compute_final_color(obj, coefficients):
    return np.dot(coefficients, np.array([obj.ambient, obj.diffuse, obj.specular, obj.reflection, obj.transparency], dtype='object'))

def phong_lighting(intersection_info, ray, scene, remaining_reflects):
    (dis,obj,normal) = intersection_info
    intersection = ray.origin + dis * ray.direction

    diffuse = 0
    specular = 0

   # light_rays = [light.get_light_ray(intersection + (normal * BIAS)) for light in scene.lights]
    #occluders = [ray.nearest_intersected_object(scene.objects) for ray in light_rays]
    #visible_light_indices = [i for i in range(len(light_rays)) if occluders[i][0] >= scene.lights[i].get_distance_from_light(intersection)]
    #visible_intensities = [light.get_intensity(intersection) for light in scene.lights[visible_light_indices]]

    #diffuse = np.dot(visible_intensities, [normal @ ray.direction for ray in light_rays[visible_light_indices]])

    #reflected_rays = [reflected(-ray.direction, normal) for ray in light_rays[visible_light_indices]]
    #visible_light_indices = occluders[:,0] >= [light.get_distance_from_light(intersection) for light in scene.lights]

    for light in scene.lights:
        light_ray = light.get_light_ray(intersection + (normal * BIAS))
        # check that nothing occludes this light
        occluder = light_ray.nearest_intersected_object(scene.objects)
        # was there nothing in the way or was the occluding object "behind" the light
        visible = occluder[0] >= light.get_distance_from_light(intersection)
        if visible:
            intensity = light.get_intensity(intersection)
            diffuse += intensity * max(0, normal @ light_ray.direction)

            reflect = normalize(reflected(light_ray.direction, normal))
            specular += intensity * np.power(max(0, reflect @ ray.direction), obj.shininess)

    reflection, refraction = compute_recursive_colors(phong_lighting, obj, normal, intersection, ray, scene, remaining_reflects - 1)

    return compute_final_color(obj, [scene.ambient, diffuse, specular, reflection, refraction])


def render_scene(camera, ambient, lights, objects, screen_size, max_depth):
    scene = Scene(camera, ambient, lights, objects, screen_size)

    return scene.render(phong_lighting, max_depth)


def load_obj(path):
    vertices = []
    faces = []
    for line in open(path, 'r'):
        if line.startswith("v "):
            vertices.append(line.split(' ')[1:4])
        elif line.startswith("f "):
            faces.append([value.split('/')[0] - 1 for value in line.split(' ')[1:4]])

    return Mesh(vertices, faces)


# Write your own objects and lights
# TODO
def your_own_scene():
    camera = np.array([0, 0, 1])
    lights = []
    objects = []
    return camera, lights, objects
