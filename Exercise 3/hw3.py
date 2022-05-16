import numpy as np

from helper_classes import *
import math
import itertools as it
from functools import partial, partialmethod

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
        self.occluding_objects = [obj for obj in objects if obj.occluder]

    def get_ray_for_camera_pixel(self, pixel):
        return Ray(self.camera, normalize(pixel - self.camera))

    def get_color_from_ray(self, ray, lighting_func, remaining_reflects):
        dis, obj, normal = ray.nearest_intersected_object(self.objects)
        if dis < 0 or dis >= math.inf:
            return np.zeros(3)
        else:
            # where the ray hits the object
            return obj.get_coefficients() @ lighting_func((dis,obj,normal), ray, self, remaining_reflects)

    def get_colors_for_rays(self, rays, lighting_func, max_depth):
        intersections = np.array([[obj.intersect(ray) for obj in self.objects] for ray in rays], dtype='object')
        found_objects_idx = np.argmin(intersections[:, :, 0], axis=1)

        intersections = np.array([intersections[i, found] for i, found in enumerate(found_objects_idx)], dtype='object')

        obj_coefficients = np.array(
            [np.array(obj.get_coefficients(), dtype='object') for
             obj in intersections[:, 1]], dtype='object')
        # do you consent
        img_coefficients = np.apply_along_axis(lambda o: lighting_func(o[0], o[1], self, max_depth), 1, list(zip(intersections, rays)))
        img = (img_coefficients * obj_coefficients)
        return [pix.sum() for pix in img]

    def render(self, lighting_func, max_depth):
        width, height = self.resolution
        ratio = float(width) / height
        screen = (-1, 1 / ratio, 1, -1 / ratio)  # left, top, right, bottom

        idx = it.product(np.linspace(screen[1], screen[3], height), np.linspace(screen[0], screen[2], width))
        rays = [self.get_ray_for_camera_pixel([coords[1],coords[0],0]) for coords in idx]

        return np.clip(self.get_colors_for_rays(rays, lighting_func, max_depth), 0, 1).reshape((height, width, 3))

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

def lighting_base(specular_func, intersection_info, ray, scene, remaining_reflects):
    (dis,obj,normal) = intersection_info
    intersection = ray.origin + dis * ray.direction

    diffuse = np.array([0,0,0])
    specular = np.array([0,0,0])

    for light in scene.lights:
        light_ray = light.get_light_ray(intersection + (normal * BIAS))
        # check that nothing occludes this light
        occluder = light_ray.nearest_intersected_object(scene.occluding_objects)
        # was there nothing in the way or was the occluding object "behind" the light
        visible = occluder[0] >= light.get_distance_from_light(intersection)
        if visible:
            intensity = light.get_intensity(intersection)
            diffuse = np.add(intensity * max(0, normal @ light_ray.direction), diffuse, casting='unsafe')

            specular = np.add(specular, intensity * np.power(max(0, specular_func(ray, light_ray, normal)), obj.shininess), casting='unsafe')

    reflection, refraction = compute_recursive_colors(partial(lighting_base, specular_func), obj, normal, intersection, ray, scene, remaining_reflects - 1)

    # the first coefficient is for emission which is always added
    return np.array([1, scene.ambient, diffuse, specular, reflection, refraction], dtype='object')


phong_lighting = partial(lighting_base, lambda ray, light_ray, normal: normalize(reflected(light_ray.direction, normal)) @ ray.direction)


blinn_phong_lighting = partial(lighting_base, lambda ray, light_ray, normal: np.power(normalize(light_ray.direction - ray.direction) @ normal, 1))


def render_scene(camera, ambient, lights, objects, screen_size, max_depth):
    scene = Scene(camera, ambient, lights, objects, screen_size)

    return scene.render(phong_lighting, max_depth)


def render_scene_blinn(camera, ambient, lights, objects, screen_size, max_depth):
    scene = Scene(camera, ambient, lights, objects, screen_size)

    return scene.render(blinn_phong_lighting, max_depth)

def load_obj(path):
    vertices = []
    faces = []
    for line in open(path, 'r'):
        if line.startswith("v "):
            vertices.append([float(value.strip()) for value in line.split(' ')[1:4]])
        elif line.startswith("f "):
            faces.append([int(value.strip().split('/')[0]) - 1 for value in line.split(' ')[1:4]])

    return Mesh(vertices, faces)

def lerp(a,b,t):
    return t * np.array(a) + (1-t) * np.array(b)

# Write your own objects and lights
# TODO
def your_own_scene():
    water = Plane([0, 1, 0], [0, -1, 0])
    water.set_material([0, 0, 0.3], [.270, .423, .454], [1, 1, 1], 5, 0.8)
    ground = Plane([0, 1, 0], [0, -1.8, 0])
    ground.set_material([0.2, 0.2, 0.2], [0.6, 0.3, 0.3], [0, 0, 0], 0, 0)
    sky = Plane([0, 0, 1], [0, 0, -30])
    sky.set_material([0, 0, 0], [.083, .188, .286], [0, 0, 0], 0, 0)

    moon = Sphere([-12, 12, -25], 1)
    moon.set_material([0, 0, 0], [0.8, 0.8, 0.8], [0, 0, 0], 10, 0)
    # moon doesn't cast shadow because it is far away and made of cheese
    moon.set_occluder(False)

    # obj file embedded in the code
    leaves = Mesh([[-0.37039999999999973, 0.6037999999999999, -2.4063000000000008],
                   [-0.2706590299999999, 0.6037999999999999, -2.3931185100000003],
                   [0.12974064800000004, 0.6037999999999999, -2.2315785439999996],
                   [0.26338168000000006, 0.6037999999999999, -1.982820538],
                   [0.26338168000000006, 0.6037999999999999, -1.4577794619999997],
                   [0.20956703799999996, 0.6600952180000002, -1.3391789799999998],
                   [-0.2365682599999999, 0.62675356, -1.0171623479999998],
                   [-0.37039999999999973, 0.6037999999999999, -1.0342999999999998],
                   [-0.7515210199999997, 0.6037999999999999, -1.14991158],
                   [-0.8554754019999998, 0.6037999999999999, -1.2352245979999998],
                   [-1.04321851, 0.6037999999999999, -1.5585919639999997],
                   [-1.0564, 0.580869764, -1.6991698279999996],
                   [-1.004180994, 0.6369584959999999, -1.9828212239999998],
                   [-0.9407884199999998, 0.6037999999999999, -2.1014210199999996],
                   [-0.7515210199999997, 0.6037999999999999, -2.2906884199999995],
                   [-0.6329205379999998, 0.6788435980000003, -2.411389434],
                   [-0.37039999999999973, 1.0154, -1.7202999999999997]], [[0, 16, 1],
                                                                          [2, 16, 3],
                                                                          [4, 16, 5],
                                                                          [6, 16, 7],
                                                                          [8, 16, 9],
                                                                          [10, 16, 11],
                                                                          [12, 16, 13],
                                                                          [14, 16, 15]])
    leaves.set_material([1, 1, 1], [.518, .737, .412], [0.5, 0.5, 0.5], 3, 0, np.array([.518, .737, .412]) * 0.9)
    leaves.apply_materials_to_triangles()

    trunk = Mesh([[-0.5 - 0.15, 0, -3], [-0.5 - 0.04, 1.4, -3], [-0.5 + 0.15, 0, -3], [-0.5 + 0.04, 1.4, -3]],
                 [[3, 0, 2], [3, 1, 0]])
    trunk.set_material([0.3, 0.3, 0.3], [.5, .515, .325], [0.3, 0.3, 0.2], 0, 0)
    trunk.apply_materials_to_triangles()

    island = Sphere([-0.5, -2, -3], 2)
    island.set_material([1, 1, 1], [.941, .815, .553], [0.3, 0.3, 0.3], 0, 0)

    eye = Sphere([2, 2.5, -5], 0.7)
    eye.set_material([1, 1, 1], [1, 1, 1], [0.5, 0.5, 0.5], 20, 0.2, [0.5, 0.5, 0.5])
    iris = Sphere(lerp(eye.center, island.center, 0.99), 0.6)
    iris.set_material([1, 1, 1], [0.318, 0.541, 0.216], [0.5, 0.5, 0.5], 20, 0.2, [0.318, 0.541, 0.216])
    pupil = Sphere(lerp(iris.center, island.center, 0.987), 0.6)
    pupil.set_material([0, 0, 0], [0, 0, 0], [0.7, 0.7, 0.7], 30, 0.5)

    red_glow = SpotLight(intensity=np.array([1.0, 0.0, 0.0]), position=lerp(eye.center, island.center, 0.8),
                         direction=(np.array(eye.center) - island.center), kc=0.1, kl=0.1, kq=0.1)

    objects = [ground, sky, water, island, moon, trunk, eye, iris, leaves, pupil]

    sun = DirectionalLight(intensity=np.array([1, 1, 1]), direction=np.array([1, 1, 1]))

    lights = [sun, red_glow]

    return np.array([0,0,1]), lights, objects
