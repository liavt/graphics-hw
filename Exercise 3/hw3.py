from helper_classes import *
import math
import matplotlib.pyplot as plt


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
        return Ray(self.camera, -self.camera +
                   (1 / self.resolution[0]) * (((pixel[0] - math.floor(self.resolution[0] / 2)) * self.v_right) - (
                           (pixel[1] - math.floor(self.resolution[1] / 2)) * self.v_up_hat)))

    def get_color_from_ray(self, ray, lighting_func, remaining_reflects):
        dis, obj, normal = ray.nearest_intersected_object(self.objects)
        if dis is None:
            return self.ambient
        else:
            # where the ray hits the object
            intersection = ray.origin + (dis * ray.direction)
            return lighting_func(obj, normal, intersection, ray, self, remaining_reflects)

    def get_color_for_pixel(self, pixel, lighting_func, max_depth):
        #print(self.get_ray_for_camera_pixel(pixel).direction)
        #print(pixel)
        return self.get_color_from_ray(self.get_ray_for_camera_pixel(pixel), lighting_func, max_depth)

    def render(self, lighting_func, max_depth):
        width, height = self.resolution
        ratio = float(width) / height
        screen = (-1, 1 / ratio, 1, -1 / ratio)  # left, top, right, bottom

        image = np.zeros((height, width, 3))

        for i, y in enumerate(np.linspace(screen[1], screen[3], height)):
            for j, x in enumerate(np.linspace(screen[0], screen[2], width)):
                pixel = np.array([x, y, 0])
                # We clip the values between 0 and 1 so all pixel values will make sense.
                image[i, j] = np.clip(self.get_color_from_ray(Ray(self.camera, normalize(pixel - self.camera)), lighting_func, max_depth), 0, 1)

        return image


def compute_recursive_colors(lighting_func, obj, normal, intersection, ray, scene, depth):
    reflection = 0
    refraction = 0
    # do we have any remaining recursive raytraces?
    if depth > 0:
        # save performance, if its not reflective dont bother calculating this
        if obj.reflection > 0:
            reflection = scene.get_color_from_ray(ray.reflect(intersection, normal), lighting_func, depth - 1)
        if obj.transparency > 0:
            refraction = scene.get_color_from_ray(ray.refract(intersection, normal, obj.refraction_index), lighting_func,
                                                  depth - 1)
    return reflection, refraction


def compute_final_color(obj, coefficients):
    return np.dot(coefficients, np.array([obj.ambient, obj.diffuse, obj.specular, obj.reflection, obj.transparency], dtype='object'))


def phong_lighting(obj, normal, intersection, ray, scene, remaining_reflects):
    diffuse = 0
    specular = 0

    for light in scene.lights:
        light_ray = light.get_light_ray(intersection + (normal * BIAS))
        # check that nothing occludes this light
        visible = light_ray.nearest_intersected_object(scene.objects)[0] is None
        if visible:
            intensity = light.get_intensity(intersection)
            diffuse += intensity * max(0, normal @ light_ray.direction)

            reflect = reflected(-light_ray.direction, normal)
            #specular += intensity * pow(max(0, reflect @ -ray.direction), obj.shininess)
        else:
            #print(obj.point)
            #print(light_ray.nearest_intersected_object(scene.objects)[1].point)
            return [1,0,0]
            #print("Rea")

    #reflection, refraction = compute_recursive_colors(phong_lighting, obj, normal, intersection, ray, scene, remaining_reflects)

    #diffuse = 0
    #specular = 0
    reflection = 0
    refraction = 0

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
