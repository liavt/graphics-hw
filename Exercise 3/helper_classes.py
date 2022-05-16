import numpy as np
import math
import numba


# This function gets a vector and returns its normalized form.
def normalize(vector):
    return vector / np.linalg.norm(vector)


# This function gets a vector and the normal of the surface it hit
# This function returns the vector that reflects from the surface
def reflected(vector, normal):
    return vector - (2 * (vector @ normal) * normal)


# we add a little bit of bias to make the intersection "above" the surface when we reflect and refract
# otherwise it may immediately intersect with the object it came from
BIAS = 1e-4


## Lights


class LightSource:

    def __init__(self, intensity):
        self.intensity = intensity


class DirectionalLight(LightSource):

    def __init__(self, intensity, direction):
        super().__init__(intensity)
        self.direction = normalize(direction)

    # This function returns the ray that goes from the light source to a point
    def get_light_ray(self, intersection_point):
        return Ray(intersection_point, self.direction)

    # This function returns the distance from a point to the light source
    def get_distance_from_light(self, intersection):
        return math.inf

    # This function returns the light intensity at a point
    def get_intensity(self, intersection):
        return self.intensity


class PointLight(LightSource):

    def __init__(self, intensity, position, kc, kl, kq):
        super().__init__(intensity)
        self.position = np.array(position)
        self.kc = kc
        self.kl = kl
        self.kq = kq

    # This function returns the ray that goes from the light source to a point
    def get_light_ray(self, intersection):
        return Ray(intersection, normalize(self.position - intersection))

    # This function returns the distance from a point to the light source
    def get_distance_from_light(self, intersection):
        return np.linalg.norm(intersection - self.position)

    # This function returns the light intensity at a point
    def get_intensity(self, intersection):
        d = self.get_distance_from_light(intersection)
        return self.intensity / (self.kc + self.kl * d + self.kq * (d ** 2))


class SpotLight(LightSource):

    def __init__(self, intensity, position, direction, kc, kl, kq):
        super().__init__(intensity)
        self.kc = kc
        self.kl = kl
        self.kq = kq
        self.position = np.array(position)
        self.direction = np.array(direction)

    # This function returns the ray that goes from the light source to a point
    def get_light_ray(self, intersection):
        return Ray(intersection, normalize(self.position - intersection))

    def get_distance_from_light(self, intersection):
        return np.linalg.norm(intersection - self.position)

    def get_intensity(self, intersection):
        big_v_tag = normalize(intersection - self.position)
        d = self.get_distance_from_light(intersection)
        direction = -(self.direction / np.linalg.norm(self.direction))
        return (self.intensity * np.dot(big_v_tag, direction)) / (self.kc + self.kl * d + self.kq * (d ** 2))


class Ray:
    def __init__(self, origin, direction):
        self.origin = origin
        self.direction = direction

    # The function is getting the collection of objects in the scene and looks for the one with minimum distance.
    # The function returns the distance, object, and normal of the closest intersected object, or math.inf if none found
    def nearest_intersected_object(self, objects):
        intersections = np.array([obj.intersect(self) for obj in objects], dtype='object')
        # find closest intersection points
        return intersections[np.argmin(intersections[:, 0])]

    # Reverses the direction of this ray
    def reverse(self):
        return Ray(self.origin, -self.direction)

    def reflect(self, intersection, normal):
        return Ray(intersection + (normal * BIAS), reflected(self.direction, normal))

    def refract(self, intersection, normal, refract_index):
        cosi = -(normal @ self.direction)
        k = 1 - refract_index * refract_index * (1 - cosi * cosi)
        return Ray(intersection - (normal * BIAS),
                   normalize(self.direction * refract_index + normal * (refract_index * cosi - math.sqrt(k))))


class Object3D:
    # occluders can cast shadow, non occluders cant
    def set_occluder(self, val):
        self.occluder = val

    def set_material(self, ambient, diffuse, specular, shininess, reflection, emission=np.array([0,0,0]), transparency=0, refraction_index=1):
        self.ambient = ambient
        self.diffuse = np.array(diffuse)
        self.specular = np.array(specular)
        self.shininess = shininess
        self.reflection = reflection
        self.transparency = transparency
        self.refraction_index = refraction_index
        self.emission = emission
        self.occluder = True

    # coefficients used for phong lighting
    def get_coefficients(self):
        return [self.emission, self.ambient, self.diffuse, self.specular, self.reflection, self.transparency]


class Plane(Object3D):
    def __init__(self, normal, point):
        self.normal = np.array(normal)
        self.point = np.array(point)

    def intersect(self, ray: Ray):
        angle = np.dot(self.normal, ray.direction)
        # parallel to the plane
        if angle == 0:
            return math.inf, self, self.normal
        t = (np.dot(self.point - ray.origin, self.normal) / angle)
        if t > 0:
            return t, self, self.normal
        else:
            return math.inf, self, self.normal


def find_intersection_of_triangles(ray, triangles):
    triangles = np.array(triangles)
    edge1 = np.array([tri.edge1 for tri in triangles])
    edge2 = np.array([tri.edge2 for tri in triangles])
    h = np.cross(np.tile(ray.direction, (triangles.shape[0], 1)), edge2)
    dot_products = (edge1 * h).sum(axis=1)

    filter_idx = np.abs(dot_products) > 0.0001
    triangles = triangles[filter_idx]
    if len(triangles) <= 0:
        return None, math.inf

    dot_products = dot_products[filter_idx]
    edge1 = edge1[filter_idx]
    edge2 = edge2[filter_idx]
    h = h[filter_idx]
    f = 1.0 / dot_products
    s = np.tile(ray.origin, (triangles.shape[0], 1)) - [tri.a for tri in triangles]
    u = f * ((s * h).sum(axis=1))

    filter_idx = np.logical_and(u >= 0, u <= 1)
    triangles = triangles[filter_idx]
    if len(triangles) <= 0:
        return None, math.inf
    edge1 = edge1[filter_idx]
    edge2 = edge2[filter_idx]
    s = s[filter_idx]
    f = f[filter_idx]
    q = np.cross(s, edge1)
    u = u[filter_idx]
    v = f * ((np.tile(ray.direction, (triangles.shape[0], 1)) * q).sum(axis=1))

    filter_idx = np.logical_and(v >= 0, u + v <= 1)
    triangles = triangles[filter_idx]
    if len(triangles) <= 0:
        return None, math.inf
    f = f[filter_idx]
    edge2 = edge2[filter_idx]
    q = q[filter_idx]
    t = f * ((edge2 * q).sum(axis=1))

    if len(t[t > 0.0001]) == 0:
        return None, math.inf

    found_idx = np.argmin(t[t > 0.0001])
    return triangles[t > 0.0001][found_idx], t[found_idx]


class Triangle(Object3D):
    # Triangle gets 3 points as arguments
    def __init__(self, a, b, c):
        self.a = np.array(a)
        self.b = np.array(b)
        self.c = np.array(c)
        self.edge1 = self.b - self.a
        self.edge2 = self.c - self.a
        self.normal = np.cross(self.edge1, self.edge2)

    # Hint: First find the intersection on the plane
    # Later, find if the point is in the triangle using barycentric coordinates
    def intersect(self, ray: Ray):
        '''
        #moller trumbore algorithm
        h = np.cross(ray.direction, self.edge2)
        a = self.edge1 @ h
        # we implement back-face culling, it works with the demo scenes and makes things faster
        if abs(a) <= 0.0001:
            return math.inf, self, self.normal
        f = 1.0 / a
        s = ray.origin - self.a
        u = f * (s @ h)
        if u < 0 or u > 1:
            return math.inf, self, self.normal
        q = np.cross(s, self.edge1)
        v = f * (ray.direction @ q)
        if v < 0 or u + v > 1:
            return math.inf, self, self.normal
        t = f * (self.edge2 @ q)
        if t > 0.0001:
            return t, self, self.normal
        return math.inf, self, self.normal
        '''
        obj, t = find_intersection_of_triangles(ray, [self])
        if obj == self:
            return t, self, self.normal
        return math.inf, self, self.normal


class Sphere(Object3D):
    def __init__(self, center, radius: float):
        self.center = center
        self.radius = radius

    def intersect(self, ray: Ray):
        normal = ray.origin - self.center
        # quadratic equation time
        b = 2 * np.dot(ray.direction, normal)
        c = np.linalg.norm(normal) ** 2 - self.radius ** 2
        delta = (b * b) - 4 * c
        if delta > 0:
            plus = (-b + np.sqrt(delta))
            minus = (-b - np.sqrt(delta))
            if plus >= 0 and minus >= 0:
                t = min(plus, minus) / 2
                return t, self, normalize((ray.origin + t * ray.direction) - self.center)
        return math.inf, self, self.center


class Mesh(Object3D):
    # Mesh are defined by a list of vertices, and a list of faces.
    # The faces are triplets of vertices by their index number.
    def __init__(self, v_list, f_list):
        self.v_list = v_list
        self.f_list = f_list
        self.triangle_list = self.create_triangle_list()

    def create_triangle_list(self):
        return [Triangle(self.v_list[face[0]], self.v_list[face[1]], self.v_list[face[2]]) for face in self.f_list]

    def apply_materials_to_triangles(self):
        for t in self.triangle_list:
            t.set_material(self.ambient, self.diffuse, self.specular, self.shininess, self.reflection, self.emission, self.transparency, self.refraction_index)

    # Hint: Intersect returns both distance and nearest object.
    # Keep track of both.
    def intersect(self, ray: Ray):
        obj, t = find_intersection_of_triangles(ray, self.triangle_list)
        if obj == None:
            return math.inf, self, [0, 0, 0]
        return t, obj, obj.normal
