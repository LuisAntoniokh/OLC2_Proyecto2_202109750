
.data
        heap:
.text

# inicializando el heap pointer
    la t6, heap

main:
    # Pushing string ********** While ********** 
addi sp, sp, -4
sw t6, 0(sp)
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 32
sb t0, 0(t6)
addi t6, t6, 1
li t0, 87
sb t0, 0(t6)
addi t6, t6, 1
li t0, 104
sb t0, 0(t6)
addi t6, t6, 1
li t0, 105
sb t0, 0(t6)
addi t6, t6, 1
li t0, 108
sb t0, 0(t6)
addi t6, t6, 1
li t0, 101
sb t0, 0(t6)
addi t6, t6, 1
li t0, 32
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 42
sb t0, 0(t6)
addi t6, t6, 1
li t0, 0
sb t0, 0(t6)
addi t6, t6, 1
lw a0, 0(sp)
addi sp, sp, 4
li a7, 4
ecall 
# Pushing string 1. While simple 
addi sp, sp, -4
sw t6, 0(sp)
li t0, 49
sb t0, 0(t6)
addi t6, t6, 1
li t0, 46
sb t0, 0(t6)
addi t6, t6, 1
li t0, 32
sb t0, 0(t6)
addi t6, t6, 1
li t0, 87
sb t0, 0(t6)
addi t6, t6, 1
li t0, 104
sb t0, 0(t6)
addi t6, t6, 1
li t0, 105
sb t0, 0(t6)
addi t6, t6, 1
li t0, 108
sb t0, 0(t6)
addi t6, t6, 1
li t0, 101
sb t0, 0(t6)
addi t6, t6, 1
li t0, 32
sb t0, 0(t6)
addi t6, t6, 1
li t0, 115
sb t0, 0(t6)
addi t6, t6, 1
li t0, 105
sb t0, 0(t6)
addi t6, t6, 1
li t0, 109
sb t0, 0(t6)
addi t6, t6, 1
li t0, 112
sb t0, 0(t6)
addi t6, t6, 1
li t0, 108
sb t0, 0(t6)
addi t6, t6, 1
li t0, 101
sb t0, 0(t6)
addi t6, t6, 1
li t0, 0
sb t0, 0(t6)
addi t6, t6, 1
lw a0, 0(sp)
addi sp, sp, 4
li a7, 4
ecall 
li t0, 0
addi sp, sp, -4
sw t0, 0(sp)
L0: 
# Operacion: <= 
addi t0, sp, 0
lw t1, 0(t0)
addi sp, sp, -4
sw t1, 0(sp)
li t0, 5
addi sp, sp, -4
sw t0, 0(sp)
lw t0, 0(sp)
addi sp, sp, 4
lw t1, 0(sp)
addi sp, sp, 4
jal lessOrEqual
lw t0, 0(sp)
addi sp, sp, 4
beq t0, zero, L1
addi t0, sp, 0
lw t1, 0(t0)
addi sp, sp, -4
sw t1, 0(sp)
lw a0, 0(sp)
addi sp, sp, 4
li a7, 1
ecall 
# Operacion: + 
addi t0, sp, 0
lw t1, 0(t0)
addi sp, sp, -4
sw t1, 0(sp)
li t0, 1
addi sp, sp, -4
sw t0, 0(sp)
lw t0, 0(sp)
addi sp, sp, 4
lw t1, 0(sp)
addi sp, sp, 4
add t0, t0, t1
addi sp, sp, -4
sw t0, 0(sp)
lw t0, 0(sp)
addi sp, sp, 4
addi t1, sp, 0
sw t0, 0(t1)
addi sp, sp, -4
sw t0, 0(sp)
lw t0, 0(sp)
addi sp, sp, 4
j L0
L1: 
# Pushing string  
addi sp, sp, -4
sw t6, 0(sp)
li t0, 0
sb t0, 0(t6)
addi t6, t6, 1
lw a0, 0(sp)
addi sp, sp, 4
li a7, 4
ecall 
# Fin del programa 
li a7, 10
ecall 
# Builtins 
lessOrEqual: 
bge t0, t1, L2
li t0, 0
addi sp, sp, -4
sw t0, 0(sp)
j L3
L2: 
li t0, 1
addi sp, sp, -4
sw t0, 0(sp)
L3: 
ret 
