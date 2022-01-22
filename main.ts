let logo = images.createImage(`
. # . . .
. # . . .
. # # # .
. . . # .
. . . # .
`)
let images_list = [logo, images.iconImage(IconNames.Heart), images.iconImage(IconNames.Happy), images.iconImage(IconNames.Ghost), images.iconImage(IconNames.SmallDiamond), images.iconImage(IconNames.Snake)]
let images_spetial = [images.iconImage(IconNames.Yes), images.iconImage(IconNames.No), logo]
let bluetooth_connected = false
let [l_motor, r_motor] = [0, 0]
function init_bluetooth_connected() {
    images_spetial[0].showImage(0)
}

function cycle_bluetooth_check() {
    
    let read = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    l_motor = parseFloat(_py.py_string_split(read, ";")[0])
    r_motor = parseFloat(_py.py_string_split(read, ";")[1])
}

function update_power() {
    let [inversed_pin_l, inversed_pin_r] = [l_motor < 0, r_motor < 0]
    let [m_l_p1, m_l_p2] = inversed_pin_l ? [Math.abs(l_motor), 0] : [0, Math.abs(l_motor)]
    let [m_r_p1, m_r_p2] = inversed_pin_r ? [Math.abs(r_motor), 0] : [0, Math.abs(r_motor)]
    basic.showString("" + m_l_p1 + ";;" + ("" + m_r_p1))
}

//  set motor power
images_spetial[1].showImage(0)
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
