// Usage: swift make-icon.swift <source.png> <out-1024.png>
// The source logo is a rounded-square artwork on a solid black background. This flood-fills the
// black background from the corners to make it transparent (keeping the artwork's own shape),
// then fits the artwork onto the macOS 1024 icon grid (824 px body, 100 px margin) with a soft shadow.
import AppKit

let args = CommandLine.arguments
guard args.count == 3, let src = NSImage(contentsOfFile: args[1]),
      let cg = src.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    fatalError("usage: make-icon <source.png> <out.png>")
}
let w = cg.width, h = cg.height
let space = CGColorSpace(name: CGColorSpace.sRGB)!
var px = [UInt8](repeating: 0, count: w * h * 4)
let srcCtx = CGContext(data: &px, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                       space: space, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
srcCtx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))

// Flood fill near-black pixels connected to the image corners.
let threshold: UInt8 = 12
func dark(_ i: Int) -> Bool { max(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]) <= threshold }
var bg = [Bool](repeating: false, count: w * h)
var stack = [0, w - 1, (h - 1) * w, h * w - 1]
while let i = stack.popLast() {
    if bg[i] || !dark(i) { continue }
    bg[i] = true
    let x = i % w, y = i / w
    if x > 0 { stack.append(i - 1) }
    if x < w - 1 { stack.append(i + 1) }
    if y > 0 { stack.append(i - w) }
    if y < h - 1 { stack.append(i + w) }
}
var minX = w, minY = h, maxX = 0, maxY = 0
for i in 0..<(w * h) {
    if bg[i] {
        px[i * 4] = 0; px[i * 4 + 1] = 0; px[i * 4 + 2] = 0; px[i * 4 + 3] = 0
    } else {
        let x = i % w, y = i / w
        minX = min(minX, x); maxX = max(maxX, x); minY = min(minY, y); maxY = max(maxY, y)
    }
}
let crop = CGRect(x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1)
print("artwork bounds: \(crop)")
let art = srcCtx.makeImage()!.cropping(to: crop)!

// Draw onto the exact macOS icon grid: an 824 px rounded square (radius 185) centred on 1024.
// macOS 26 recognises this shape and shows it as-is; other shapes get shrunk into a grey tile.
// macOS 13–15 show it unchanged too. No shadow: macOS adds its own.
let size = 1024
let body = CGRect(x: 100, y: 100, width: 824, height: 824)
let scale = body.width / min(crop.width, crop.height)            // aspect-fill, no distortion
let dw = crop.width * scale, dh = crop.height * scale
let rect = CGRect(x: body.midX - dw / 2, y: body.midY - dh / 2, width: dw, height: dh)

let ctx = CGContext(data: nil, width: size, height: size, bitsPerComponent: 8, bytesPerRow: 0,
                    space: space, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.interpolationQuality = .high
ctx.addPath(CGPath(roundedRect: body, cornerWidth: 185, cornerHeight: 185, transform: nil))
ctx.clip()
ctx.setFillColor(CGColor(srgbRed: 24 / 255, green: 39 / 255, blue: 64 / 255, alpha: 1)) // logo's navy
ctx.fill(body)
ctx.draw(art, in: rect)

let out = NSBitmapImageRep(cgImage: ctx.makeImage()!)
try! out.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: args[2]))
print("wrote \(args[2])")
