import numpy as np


# This function gets a vector and returns its normalized form.
def normalize(vector):
    return vector / np.linalg.norm(vector)


# This function gets a vector and the normal of the surface it hit
# This function returns the vector that reflects from the surface
def reflected(vector, normal):
    return vector - (2 * (vector @ normal) * normal)

## Lights


class LightSource:

    def __init__(self, intensity):
        self.intensity = intensity


class DirectionalLight(LightSource):

    def __init__(self, intensity, direction, position=[0, 0, 0]):
        super().__init__(intensity)
        self.position = position
        self.direction = direction

    # This function returns the ray that goes from the light source to a point
    def get_light_ray(self,intersection_point):
        return Ray(intersection_point,normalize(self.position - intersection_point))

    # This function returns the distance from a point to the light source
    def get_distance_from_light(self, intersection):
        return np.linalg.norm(intersection - self.position)

    # This function returns the light intensity at a point
    def get_intensity(self, intersection):
        #TODO
        pass


class PointLight(LightSource):

    def __init__(self, intensity, position, kc, kl, kq):
        super().__init__(intensity)
        self.position = np.array(position)
        self.kc = kc
        self.kl = kl
        self.kq = kq

    # This function returns the ray that goes from the light source to a point
    def get_light_ray(self,intersection):
        return Ray(intersection,normalize(self.position - intersection))

    # This function returns the distance from a point to the light source
    def get_distance_from_light(self,intersection):
        return np.linalg.norm(intersection - self.position)

    # This function returns the light intensity at a point
    def get_intensity(self, intersection):
        d = self.get_distance_from_light(intersection)
        return self.intensity / (self.kc + self.kl*d + self.kq * (d**2))


class SpotLight(LightSource):


    def __init__(self, intensity):
        super().__init__(intensity)
        # TODO

    # This function returns the ray that goes from the light source to a point
    def get_light_ray(self,intersection):
        # TODO
        return Ray()

    def get_distance_from_light(self,intersection):
        #TODO
        pass

    def get_intensity(self, intersection):
        #TODO
        pass


class Ray:
    def __init__(self, origin, direction):
        self.origin = origin
        self.direction = direction

    # The function is getting the collection of objects in the scene and looks for the one with minimum distance.
    # The function returns the distance, object, and normal of the closest intersected object, or None if none found
    def nearest_intersected_object(self, objects):
        intersections = map(lambda obj: obj.intersect(self), objects)
        # create array of distance of each object
        distances = [intersection[0] if intersection is not None else np.inf for intersection in intersections]
        # find closest intersection points
        closest_distance_idx = np.argmin(distances)
        if distances[closest_distance_idx] >= np.inf:
            return None
        return intersections[closest_distance_idx]

    # Reverses the direction of this ray
    def reverse(self):
        return Ray(self.origin, -self.direction)

class Object3D:

    def set_material(self, ambient, diffuse, specular, shininess, reflection, transparency=0, refraction_index=1):
        self.ambient = ambient
        self.diffuse = diffuse
        self.specular = specular
        self.shininess = shininess
        self.reflection = reflection
        self.transparency = transparency
        self.refraction_index = refraction_index


class Plane(Object3D):
    def __init__(self, normal, point):
        self.normal = np.array(normal)
        self.point = np.array(point)

    def intersect(self, ray: Ray):
        v = self.point - ray.origin
        t = (np.dot(v, self.normal) / np.dot(self.normal, ray.direction))
        if t > 0:
            return t, self, self.normal
        else:
            return None

# Ilana
class Triangle(Object3D):
    # Triangle gets 3 points as arguments
    def __init__(self, a, b, c):
        self.a = np.array(a)
        self.b = np.array(b)
        self.c = np.array(c)
        self.normal = self.compute_normal()

    def compute_normal(self):
        return (self.b - self.a).crossProduct(self.c - self.a)

    # Hint: First find the intersection on the plane
    # Later, find if the point is in the triangle using barycentric coordinates
    def intersect(self, ray: Ray):
        # How do I name this idek

        d = self.b - self.a
        e = self.c - self.a

        vector = np.cross(ray.direction, e)

        det = d @ vector

        v = np.cross(ray.origin - self.a, d)

        return e.dot(v) / det, self, self.normal

# Ilana
class Sphere(Object3D):
    def __init__(self, center, radius: float):
        self.center = center
        self.radius = radius

    def intersect(self, ray: Ray):
        # quadratic equation time
        b = 2 * np.dot(ray.direction, ray.origin - self.center)
        c = np.linalg.norm(ray.origin - self.center) ** 2 - self.radius ** 2
        delta = b ** 2 - 4 * c
        if delta > 0:
            plus = (-b + np.sqrt(delta)) / 2
            minus = (-b - np.sqrt(delta)) / 2
            if plus > 0 and minus > 0:
                return min(plus, minus), self, normalize(ray.origin - self.center)
        return None


class Mesh(Object3D):
    # Mesh are defined by a list of vertices, and a list of faces.
    # The faces are triplets of vertices by their index number.
    def __init__(self, v_list, f_list):
        self.v_list = v_list
        self.f_list = f_list
        self.triangle_list = self.create_triangle_list()

    def create_triangle_list(self):
        return [Triangle(face[0], face[1], face[2]) for face in self.f_list]

    def apply_materials_to_triangles(self):
        for t in self.triangle_list:
            t.set_material(self.ambient,self.diffuse,self.specular,self.shininess,self.reflection)

    # Hint: Intersect returns both distance and nearest object.
    # Keep track of both.
    def intersect(self, ray: Ray):
        return ray.nearest_intersected_object(self.triangle_list)