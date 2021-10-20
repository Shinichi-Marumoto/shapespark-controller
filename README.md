# Controller like joysticks and D-pads for shapespark.

- Just before closing body tag, place it to load the js file.

```
<script src="shapespark-controller.js"></script>
</body>
```

- The added buttons behaves like a D-pads by default. [ Equivalent to WASD&ltrif;&rtrif; ]

- You can change the buttons to behave like a joystick, using the query parameter joystick in the src attribute. ```[ bool ]```
<br>In this case, collision detection is not performed.

```
<script src="shapespark-controller.js?joystick=true"></script>
```

- When using the safe-area-inset-bottom, use the query parameter sab in the src attribute. ```[ bool ]```

```
<script src="shapespark-controller.js?sab=true"></script>
```
