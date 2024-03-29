import math
import numpy as np
import itertools
import numba

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

@numba.jit()
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

@numba.jit()
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
        return image 

@numba.jit()
def cum_map(image, ignore_mask=None):
    if ignore_mask is None:
        ignore_mask = np.zeros((image.shape[0], image.shape[1]), dtype=np.bool)

    height, width, _ = image.shape
    map_copy = energy(image, forward=True)

    map_copy[ignore_mask] = math.ceil(np.max(map_copy)) + 1

    skip = np.zeros_like(map_copy, dtype=np.int)

    for i in range(1, height):
        for j in range(0, width):
            indices = []
            cells = []
            if not ignore_mask[i - 1, j]:
                indices.append(j)
                cells.append(map_copy[i - 1, j])
            leftmost_index = j - 1
            while leftmost_index >= 0 and ignore_mask[i - 1, leftmost_index]:
                leftmost_index -= 1
            if leftmost_index >= 0:
                indices.append(leftmost_index)
                cells.append(map_copy[i - 1, leftmost_index])

            rightmost_index = j + 1
            while rightmost_index < width and ignore_mask[i - 1, rightmost_index]:
                rightmost_index += 1
            if rightmost_index < width:
                indices.append(rightmost_index)
                cells.append(map_copy[i - 1, rightmost_index])

            index = np.argmin(cells)
            skip[i, j] = indices[index]

            map_copy[i, j] += cells[index]

    return map_copy, skip

def flippa_left(image):
    return np.rot90(image, 1, (0,1))

def flippa_back(image):
    return np.rot90(image, -1, (0,1))

@numba.jit()
def calc_seam(image, seams):
    height, width, _ = image.shape
    image_map, skip = cum_map(image)

    mask = np.zeros((height, width), dtype=np.bool)
   
    for i in range(seams):
        smallest = np.argmin(image_map[-1])

        for j in reversed(range(height)):
            if mask[j, smallest]:
                print("woops")
            mask[j, smallest] = True
            smallest = skip[j, smallest]

        image_map, skip = cum_map(image, mask)

    return mask

def visualise_seams(image, new_shape, show_horizontal, colour):
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
    
    if show_horizontal:
        image_copy = flippa_left(image.copy());
        num_seams = height - new_shape[0]
    else:
        image_copy = image.copy()
    mask = calc_seam(image_copy, num_seams)
    
    if show_horizontal:
        mask = flippa_back(mask)
        image_copy = flippa_back(image_copy)

    image_copy[mask] = colour

    return image_copy

def delete_vert_seams(image, amount_of_seams, scale_factor):
    scaled_image = np.repeat(image, scale_factor, axis=1).reshape(image.shape[0], image.shape[1] * scale_factor, 3)
    mask = np.repeat(calc_seam(image, amount_of_seams % image.shape[1]), scale_factor, axis=1).reshape((scaled_image.shape[0], scaled_image.shape[1]))
    if scale_factor > 1:
        mask[:, (np.mod(np.arange(mask.shape[1]), scale_factor) != 0)] = True
        mask = ~mask
        return scaled_image[~mask].reshape((image.shape[0], image.shape[1] + amount_of_seams, 3))
    return scaled_image[~mask].reshape((image.shape[0], image.shape[1] - amount_of_seams, 3))

def delete_horz_seams(image, amount_of_seams, scale_factor):
    return flippa_back(delete_vert_seams(flippa_left(image), amount_of_seams, scale_factor))

@numba.jit
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
    h_scale_factor = math.ceil(new_shape[0] / height)
    w_scale_factor = math.ceil(new_shape[1] / width)
    '''
    if h_scale_factor > 1 or w_scale_factor > 1:
        print()
        return reshape_seam_crarving(np.repeat(np.repeat(image.copy(), h_scale_factor, axis=0), w_scale_factor, axis=1), new_shape, carving_scheme)
    '''

    image_copy = image.copy()
    if carving_scheme == 0:
        return delete_horz_seams(delete_vert_seams(image, abs(image.shape[1] - new_shape[1]), w_scale_factor), abs(image.shape[0] - new_shape[0]), h_scale_factor)
    elif carving_scheme == 1:
        return delete_vert_seams(delete_horz_seams(image, abs(image.shape[0] - new_shape[0]), h_scale_factor), abs(image.shape[1] - new_shape[1]), w_scale_factor)
    elif carving_scheme == 2:
        while image_copy.shape != new_shape:
            if image_copy.shape[0] != new_shape[0]:
                image_copy = delete_horz_seams(image_copy, 1, h_scale_factor)
            if image_copy.shape[1] != new_shape[1]:
                image_copy = delete_vert_seams(image_copy, 1, w_scale_factor)

    return image_copy
