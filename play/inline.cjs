const fs = require("fs");
const DEG_TO_RAD = Math.PI / 180;

if (process.argv.length !== 3) {
    console.log(`Usage: ${process.argv[1]} INPUT`);
    process.exit(1);
}

let content = fs.readFileSync(process.argv[2], "utf-8");
let res = content.replace(
    /from_euler\(\[0, 0, 0, 0\], ([-.0-9]+), ([-.0-9]+), ([-.0-9]+)\)/g,
    (m, x, y, z) => `[${from_euler(x, y, z).map((x) => x.toFixed(3))}]`
);

console.log(res);

function from_euler(x, y, z) {
    let sx = Math.sin((x / 2) * DEG_TO_RAD);
    let cx = Math.cos((x / 2) * DEG_TO_RAD);
    let sy = Math.sin((y / 2) * DEG_TO_RAD);
    let cy = Math.cos((y / 2) * DEG_TO_RAD);
    let sz = Math.sin((z / 2) * DEG_TO_RAD);
    let cz = Math.cos((z / 2) * DEG_TO_RAD);

    let out = [];
    out[0] = sx * cy * cz + cx * sy * sz;
    out[1] = cx * sy * cz - sx * cy * sz;
    out[2] = cx * cy * sz - sx * sy * cz;
    out[3] = cx * cy * cz + sx * sy * sz;
    return out;
}
