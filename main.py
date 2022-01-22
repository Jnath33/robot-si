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


images_spetial = \
[
    images.icon_image(IconNames.YES),
    images.icon_image(IconNames.NO),
    logo
]

bluetooth_connected = False

l_motor, r_motor = 0, 0


def init_bluetooth_connected():
    images_spetial[0].show_image(0)

def cycle_bluetooth_check():
    global l_motor, r_motor
    read = bluetooth.uart_read_until(serial.delimiters(Delimiters.NEW_LINE))
    l_motor = parse_float(read.split(";")[0])
    r_motor = parse_float(read.split(";")[1])

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
    
images_spetial[1].show_image(0)

bluetooth.on_bluetooth_connected(on_bluetooth_connected)
bluetooth.on_bluetooth_disconnected(on_bluetooth_disconnected)
basic.forever(on_forever)


