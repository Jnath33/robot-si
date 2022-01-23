let logo = images.createImage(`
. # . . .
. # . . .
. # # # .
. . . # .
. . . # .
`)
let images_list = [logo, images.iconImage(IconNames.Heart), images.iconImage(IconNames.Happy), images.iconImage(IconNames.Ghost), images.iconImage(IconNames.SmallDiamond), images.iconImage(IconNames.Snake)]
let images_special = [images.iconImage(IconNames.Yes), images.iconImage(IconNames.No), logo]
let bluetooth_connected = false
let l_motor = 0
let r_motor = 0
let [x_j, y_j, angle_motor, spetial_m] = [0, 0, 0, 0]
let is_right = false
let is_front = true
function init_bluetooth_connected() {
    images_special[0].showImage(0)
}

function compute_motors_speed(): number[] {
    let tmp: number;
    let e = 0.001
    let total_value = (x_j ** 2 + y_j ** 2) ** (1 / 2)
    if (total_value == 0) {
        return [0, 0]
    }
    
    let normalise_y = y_j / total_value
    let n_y = 1 - Math.acos(normalise_y) / (Math.PI / 2)
    let l_m = 1 - n_y * 2
    let r_m = Math.min(total_value, 1)
    r_m = Math.sqrt(r_m + 1) * Math.sqrt(2) - 1
    l_m = Math.sqrt(l_m + 1) * Math.sqrt(2) - 1
    l_m = Math.min(1, l_m + e)
    r_m = Math.min(1, r_m + e)
    if (!is_front) {
        tmp = l_m
        l_m = -l_m
        r_m = -tmp
    }
    
    if (is_right) {
        tmp = l_m
        l_m = r_m
        r_m = tmp
    }
    
    return [l_m, r_m]
}

function cycle_bluetooth_check() {
    
    let read = _py.py_string_split(bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine)), ";")
    let [y_j, x_j, angle_motor, spetial_m] = read.map(i => parseFloat(i))
    is_right = y_j >= 0
    is_front = x_j >= 0
    x_j = Math.abs(x_j)
    y_j = Math.abs(y_j)
    let [l_motor, r_motor] = compute_motors_speed()
}

function update_power() {
    let [inversed_pin_l, inversed_pin_r] = [l_motor < 0, r_motor < 0]
    let [m_l_p1, m_l_p2] = inversed_pin_l ? [Math.abs(l_motor), 0] : [0, Math.abs(l_motor)]
    let [m_r_p1, m_r_p2] = inversed_pin_r ? [Math.abs(r_motor), 0] : [0, Math.abs(r_motor)]
    basic.showString("" + m_l_p1 + ";;" + ("" + m_r_p1))
}

//  set motor power
images_special[1].showImage(0)
bluetooth.onBluetoothConnected(function on_bluetooth_connected() {
    
    bluetooth_connected = true
})
bluetooth.onBluetoothDisconnected(function on_bluetooth_disconnected() {
    
    bluetooth_connected = false
})
basic.forever(function on_forever() {
    if (bluetooth_connected) {
        init_bluetooth_connected()
        while (bluetooth_connected) {
            cycle_bluetooth_check()
            update_power()
        }
    }
    
    basic.pause(200)
})
