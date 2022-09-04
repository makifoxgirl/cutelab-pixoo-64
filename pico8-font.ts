import sharp from "sharp";
import * as path from "path";

export class Pico8Font {
	private charWidth = 3;
	private charHeight = 5;

	private chars = [
		[
			0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b,
			0x2c, 0x2d, 0x2e, 0x2f, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36,
			0x37, 0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x3d, 0x3e, 0x3f, 0x40,
		],
		[
			0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x4b,
			0x4c, 0x4d, 0x4e, 0x4f, 0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56,
			0x57, 0x58, 0x59, 0x5a, 0x5b, 0x5c, 0x5d, 0x5e, 0x5f, 0x60,
		],
		[
			0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b,
			0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76,
			0x77, 0x78, 0x79, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e, 0x7f, 0x20,
		],
	];

	private charData: { x: number; y: number }[][][] = [];

	constructor() {}

	async load() {
		const { data, info } = await sharp(
			path.resolve(__dirname, "./fonts/pico8.png"),
		)
			.removeAlpha()
			.raw()
			.toBuffer({ resolveWithObject: true });

		const getPixel = (x: number, y: number) => {
			if (x < 0 || x > info.width - 1 || y < 0 || y > info.height - 1) {
				return false;
			}
			const r = data[(y * info.width + x) * 3];
			return r > 128;
		};

		this.charData = this.chars.map((line, charY) =>
			line.map((char, charX) => {
				let spriteSheetX = charX * this.charWidth + (charX + 1);
				let spriteSheetY = charY * this.charHeight + (charY + 1);

				const pixels: { x: number; y: number }[] = [];
				for (let y = 0; y < this.charHeight; y++) {
					for (let x = 0; x < this.charWidth; x++) {
						if (getPixel(spriteSheetX + x, spriteSheetY + y)) {
							pixels.push({ x, y });
						}
					}
				}

				return pixels;
			}),
		);
	}

	getChar(char: string) {
		const charCode = char.charCodeAt(0);
		for (const lineIndex in this.chars) {
			for (const index in this.chars[lineIndex]) {
				if (this.chars[lineIndex][index] == charCode) {
					return this.charData[lineIndex][index];
				}
			}
		}
		return [];
	}

	getText(text: string) {
		const pixels: { x: number; y: number }[] = [];

		for (let i = 0; i < text.length; i++) {
			const charPixels = this.getChar(text[i]);
			for (let charPixel of charPixels) {
				pixels.push({
					x: charPixel.x + i * this.charWidth + i,
					y: charPixel.y,
				});
			}
		}

		return pixels;
	}
}
