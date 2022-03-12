import math
import numpy as np
import itertools

def get_greyscale_image(image, colour_wts):
    """
    Gets an image and weights of each colour and returns the image in greyscale
    :param image: The original image
    :param colour_wts: the weights of each colour in rgb (ints > 0)
    :returns: the image in greyscale
    """
    return image @ colour_wts
    
def reshape_bilinear(img, new_shape):
    """
    Resizes an image to new shape using bilinear interpolation method
    :param image: The original image
    :param new_shape: a (height, width) tuple which is the new shape
    :returns: the image resized to new_shape
    """
    image = img.reshape((img.shape[0] * img.shape[1], 3))

    y, x = np.divmod(np.arange(new_shape[0] * new_shape[1]), new_shape[1])

    x_indices = (float(img.shape[1]) / (new_shape[1]) if new_shape[1] >= 1 else 0) * x
    y_indices = (float(img.shape[0]) / (new_shape[0]) if new_shape[0] >= 1 else 0) * y

    x_left = np.floor(x_indices).astype('uint32')
    y_bottom = np.floor(y_indices).astype('uint32')

    x_right = np.ceil(x_indices).astype('uint32')
    y_top = np.ceil(y_indices).astype('uint32')

    x_coefficients = (x_indices - x_left).repeat(3).reshape((new_shape[1] * new_shape[0], 3))
    y_coefficients = (y_indices - y_top).repeat(3).reshape((new_shape[1] * new_shape[0], 3))

    y_bottom *= img.shape[1]
    y_top *= img.shape[1]

    a = image[y_bottom + x_left] * (1 - x_coefficients) * (1 - y_coefficients)
    b = image[y_bottom + x_right] * x_coefficients * (1 - y_coefficients)
    c = image[y_top + x_left] * (1 - x_coefficients) * y_coefficients
    d = image[y_top + x_right] * x_coefficients * y_coefficients

    return (a + b + c + d).astype('uint8').reshape((new_shape[0], new_shape[1], 3))
    
def gradient_magnitude(image, colour_wts):
    """
    Calculates the gradient image of a given image
    :param image: The original image
    :param colour_wts: the weights of each colour in rgb (> 0) 
    :returns: The gradient image
    """
    greyscale = get_greyscale_image(image, colour_wts)

    # shift the image by one pixel
    horz_shifted = np.empty_like(greyscale)
    horz_shifted[:1] = 0
    horz_shifted[1:] = greyscale[:-1]

    vert_shifted = np.empty_like(greyscale)
    vert_shifted[:,:1] = 0
    vert_shifted[:,1:] = greyscale[:,:-1]

    return np.sqrt(np.power(greyscale - horz_shifted, 2) + np.power(greyscale - vert_shifted, 2))

def energy(image, forward=False):
    """
    Helper function to calculate forward energy
    :param image: The original image
    """
    
    height, width = image.shape[:2]
    image = gradient_magnitude(image, [0.299, 0.587, 0.114])
    
    energy = np.zeros((height,width))
    
    if forward:
        for i in range(1, height):
            for j in range(width):
                up = (i-1) % height
                down = (i+1) % height
                left = (j-1) % width
                right = (j+1) % width

                U = energy[up,j]
                L = energy[up,left]
                R = energy[up,right]

                cU = np.abs(image[i,right] - image[i,left])
                cL = np.abs(image[up,j] - image[i,left]) + cU
                cR = np.abs(image[up,j] - image[i,right]) + cU

                cULR = np.array([cU, cL, cR])
                mULR = np.array([U, L, R]) + cULR

                argmin = np.argmin(mULR)
                energy[i,j] = cULR[argmin]        

        return energy
            
    else:
        for i in range(height):
            for j in range(width):
                left = image[i, (j-1) % width]
                right = image[i, (j+1) % width]
                up = image[(i-1) % height, j]
                down = image[(i+1) % height, j]

                dx = np.sum((right - left)**2)
                dy = np.sum((down - up)**2)
                energy[i,j] = np.sqrt(dx + dy)
        return energy
        
def cum_map(image):
    height, width, _ = image.shape
    map_copy = energy(image, forward=True)
    skip = np.zeros_like(map_copy, dtype=np.int)

    for i in range(1, height):
        for j in range(0, width):

            if j == 0:
                idx = np.argmin(map_copy[i - 1, j:j + 2])
                skip[i, j] = idx + j
                min_energy = map_copy[i - 1, idx + j]
            else:
                idx = np.argmin(map_copy[i - 1, j - 1:j + 2])
                skip[i, j] = idx + j - 1
                min_energy = map_copy[i - 1, idx + j - 1]

            map_copy[i, j] += min_energy

    return map_copy, skip

def calc_seam(image, seams):
    height, width, _ = image.shape
    image_map, skip = cum_map(image)

    mask = np.ones((height, width), dtype=np.bool)
   
    for i in range(seams):
        smallest = np.argmin(image_map[-1])

        for j in reversed(range(height)):
            mask[j, smallest] = False
            image_map[j,smallest] = 1000000
            smallest = skip[j, smallest]

    #mask = ([mask] * 3, axis=2)
    #image = image[mask].reshape((height, width - 1, 3))

    return mask
        
def visualise_seams(image, new_shape, carving_scheme, colour):
    """
    Visualises the seams that would be removed when reshaping an image to new image (see example in notebook)
    :param image: The original image
    :param new_shape: a (height, width) tuple which is the new shape
    :param carving_scheme: the carving scheme to be used.
    :param colour: the colour of the seams (an array of size 3)
    :returns: an image where the removed seams have been coloured.
    """
    ###Your code here###
    
    height, width, _ = image.shape
    num_seams = width-new_shape[1]
    mask = calc_seam(image, num_seams)
    image_copy = image.copy()
    
    for i in range(height):
        for j in range(width):
            if mask[i,j]:
                image_copy[i,j] = colour
        
    return image_copy    
    ###**************###
    #return seam_image
    
def reshape_seam_crarving(image, new_shape, carving_scheme):
    """
    Resizes an image to new shape using seam carving
    :param image: The original image
    :param new_shape: a (height, width) tuple which is the new shape
    :param carving_scheme: the carving scheme to be used.
    :returns: the image resized to new_shape
    """
    ###Your code here###
    
    height, width, _ = image.shape
    
    num_seams = width-new_shape[1]
    
    for i in range(width - new_shape[1]): 
        image = cut_seam(image)

    return image
        
    ###**************###
    #return new_image
