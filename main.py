logo = images.create_image(
"""
. # . . .
. # . . .
. # # # .
. . . # .
. . . # .
"""
)

images_list = \
[
    logo,
    images.icon_image(IconNames.HEART),
    images.icon_image(IconNames.HAPPY),
    images.icon_image(IconNames.GHOST),
    images.icon_image(IconNames.SMALL_DIAMOND),
    images.icon_image(IconNames.SNAKE)
]


images_special = \
[
    images.icon_image(IconNames.YES),
    images.icon_image(IconNames.NO),
    logo
]

bluetooth_connected = False

l_motor = 0
r_motor = 0

x_j, y_j, angle_motor, spetial_m = 0,0,0,0
is_right = False
is_front = True

def init_bluetooth_connected():
    images_special[0].show_image(0)

def compute_motors_speed():
    e = 0.001
    total_value = (x_j ** 2 + y_j ** 2) ** (1 / 2)
    if total_value == 0:
        return 0, 0
    normalise_y = y_j / total_value
    n_y = 1-Math.acos(normalise_y)/(Math.PI/2)
    l_m = 1 - n_y * 2
    r_m = min(total_value, 1)
    r_m = Math.sqrt(r_m+1)*Math.sqrt(2)-1
    l_m = Math.sqrt(l_m+1)*Math.sqrt(2)-1
    l_m = min(1,l_m+e)
    r_m = min(1, r_m+e)
    if not is_front:
        tmp = l_m
        l_m = -l_m
        r_m = -tmp
    if is_right:
        tmp = l_m
        l_m = r_m
        r_m = tmp
    return l_m, r_m

def cycle_bluetooth_check():
    global l_motor, r_motor, x_j, y_j, angle_motor, spetial_m, is_right, is_front
    read = bluetooth.uart_read_until(serial.delimiters(Delimiters.NEW_LINE)).split(";")
    y_j, x_j, angle_motor, spetial_m = (parse_float(i) for i in read)
    is_right = y_j >= 0
    is_front = x_j >= 0
    x_j = abs(x_j)
    y_j = abs(y_j)

    l_motor, r_motor = compute_motors_speed()

def update_power():
    inversed_pin_l, inversed_pin_r = l_motor<0, r_motor<0
    m_l_p1, m_l_p2 = (abs(l_motor), 0) if inversed_pin_l else (0, abs(l_motor))
    m_r_p1, m_r_p2 = (abs(r_motor), 0) if inversed_pin_r else (0, abs(r_motor))
    
    basic.show_string(str(m_l_p1)+";;"+str(m_r_p1))
    # set motor power

def on_bluetooth_connected():
    global bluetooth_connected
    bluetooth_connected = True

def on_bluetooth_disconnected():
    global bluetooth_connected
    bluetooth_connected = False

def on_forever():
    if bluetooth_connected:
        init_bluetooth_connected()
        while bluetooth_connected:
            cycle_bluetooth_check()
            update_power()
    basic.pause(200)
    
images_special[1].show_image(0)

bluetooth.on_bluetooth_connected(on_bluetooth_connected)
bluetooth.on_bluetooth_disconnected(on_bluetooth_disconnected)
basic.forever(on_forever)


